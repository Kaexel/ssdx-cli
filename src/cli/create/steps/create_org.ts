import ora, { Ora } from 'ora';
import * as print from 'lib/print-helper.js';
import CreateOptions from '../dto/create-options.dto.js';
import {
  ScratchOrgCreateOptions,
  scratchOrgCreate,
  Org as SfOrg,
} from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { handleProcessSignals } from 'lib/process.js';

export async function createScratchOrg(options: CreateOptions): Promise<void> {
  const org = new create_org(options);
  org.init();
  await org.createScratchOrg();
}

class create_org {
  options: CreateOptions;
  spinner!: Ora;

  constructor(options: CreateOptions) {
    this.options = options;
  }

  public init(): void {
    print.subheader('Create Scratch Org');

    this.spinner = ora('Creating Scratch Org').start();

    // Set up signal handling AFTER spinner is created
    handleProcessSignals(this.spinner);
  }

  public async createScratchOrg(): Promise<void> {
    try {
      // Get the hub org (dev hub)
      const hubOrg = await SfOrg.create({
        aliasOrUsername: this.options.targetDevHub,
      });

      // Read the org definition file
      const orgConfig = await this.readOrgDefinition();

      const scratchOrgOptions: ScratchOrgCreateOptions = {
        hubOrg,
        alias: this.options.scratchOrgName,
        durationDays: parseInt(this.options.durationDays),
        orgConfig,
        wait: Duration.minutes(45), // equivalent to --wait 45
        setDefault: true,
        tracksSource: true, // default behavior
      };

      this.options.scratchOrgResult = await scratchOrgCreate(scratchOrgOptions);

      this.spinner.suffixText = `(successfully created org ${this.options.scratchOrgResult.username})`;
      this.spinner.succeed();
    } catch (error) {
      this.spinner.fail('Failed to create Scratch Org');
      console.error(error);
      throw error;
    }
  }

  private async readOrgDefinition(): Promise<Record<string, unknown>> {
    try {
      const fs = await import('fs/promises');
      const definitionContent = await fs.readFile(
        this.options.configFile,
        'utf8'
      );
      return JSON.parse(definitionContent) as Record<string, unknown>;
    } catch (error) {
      throw new Error(
        `Failed to read org definition file: ${this.options.configFile}. ${String(error)}`
      );
    }
  }

  public fetchUsername(): void {
    // This is no longer needed since scratchOrgCreate returns the result directly
    if (this.options.scratchOrgResult?.username) {
      print.info(`Username: ${this.options.scratchOrgResult.username}`, false);
    }
  }
}
