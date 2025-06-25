import * as print from 'lib/print-helper.js';
import colors from 'colors/safe.js';
import ora, { Ora } from 'ora';
import CreateOptions from '../dto/create-options.dto.js';
import { ScratchOrgCreateOptions, scratchOrgCreate, Org, ScratchOrgCreateResult } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { handleProcessSignals } from 'lib/process.js';
import { getDevHub, readOrgDefinition } from 'lib/config/sf-config.js';
import { throwError } from 'lib/log.js';

export async function createScratchOrg(options: CreateOptions): Promise<void> {
  const org = new create_org(options);
  org.init();
  await org.setDevHub();
  await org.setOrgConfig();

  if (options.keepExistingOrg) {
    org.keepScratchOrg();
  } else {
    await org.createScratchOrg();
  }
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
    this.spinner = ora('Creating Scratch Org ...').start();
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

  public keepScratchOrg(): void {
    this.options.scratchOrgResult = { username: this.options.scratchOrgName } as ScratchOrgCreateResult;
    this.spinner.suffixText = `done! (kept ${colors.yellow(this.options.scratchOrgResult.username || '')})`;
    this.spinner.succeed();
    print.success(`Scratch Org created successfully with alias: ${this.options.scratchOrgName}`, false);
  }

  public async createScratchOrg(): Promise<void> {
    try {
      this.options.scratchOrgResult = await scratchOrgCreate(this.scratchOrgOptions);

      this.spinner.suffixText = `done! (${colors.yellow(this.options.scratchOrgResult.username || '')})`;
      this.spinner.succeed();
      print.success(`Scratch Org created successfully with alias: ${this.options.scratchOrgName}`, false);
    } catch (error) {
      this.spinner.fail('Failed to create Scratch Org');
      throwError(String(error));
    }
  }
}
