import ora, { Ora } from 'ora';
import CreateOptions from '../dto/create-options.dto.js';
import {
  ScratchOrgCreateOptions,
  scratchOrgCreate,
  Org,
} from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { handleProcessSignals } from 'lib/process.js';
import { getDevHub, readOrgDefinition } from 'lib/config/sf-config.js';

export async function createScratchOrg(options: CreateOptions): Promise<void> {
  const org = new create_org(options);
  org.init();
  await org.setDevHub();
  await org.setOrgConfig();
  await org.createScratchOrg();
}

class create_org {
  options: CreateOptions;
  spinner!: Ora;
  hubOrg!: Org;
  orgConfig!: Record<string, unknown>;

  constructor(options: CreateOptions) {
    this.options = options;
  }

  public init(): void {
    this.spinner = ora('Creating Scratch Org').start();
    handleProcessSignals(this.spinner);
  }

  public async setDevHub(): Promise<void> {
    this.hubOrg = await getDevHub(this.options);
  }

  public async setOrgConfig(): Promise<void> {
    this.orgConfig = await readOrgDefinition(this.options);
  }

  get scratchOrgOptions(): ScratchOrgCreateOptions {
    return {
      hubOrg: this.hubOrg,
      alias: this.options.scratchOrgName,
      durationDays: parseInt(this.options.durationDays),
      orgConfig: this.orgConfig,
      wait: Duration.minutes(45),
      setDefault: true, // TODO: set to false and make default at the end of the process
      tracksSource: true,
    };
  }

  public async createScratchOrg(): Promise<void> {
    try {
      this.options.scratchOrgResult = await scratchOrgCreate(
        this.scratchOrgOptions
      );

      this.spinner.suffixText = `(successfully created org ${this.options.scratchOrgResult.username})`;
      this.spinner.succeed();
    } catch (error) {
      this.spinner.fail('Failed to create Scratch Org');
      console.error(error);
      throw error;
    }
  }
}
