import * as print from 'lib/print-helper.js';
import colors from 'colors/safe.js';
import ora, { Ora } from 'ora';
import CreateOptions from '../create.dto.js';
import { ScratchOrgCreateOptions, scratchOrgCreate, Org, ScratchOrgCreateResult } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { handleProcessSignals } from 'lib/process.js';
import { getDevHub, readOrgDefinition } from 'lib/config/sf-config.js';
import { throwError } from 'lib/log.js';

export async function createScratchOrg(): Promise<void> {
  const org = new create_org();
  org.init();
  await org.setDevHub();
  await org.setOrgConfig();

  if (CreateOptions.keepExistingOrg) {
    org.keepScratchOrg();
  } else {
    await org.createScratchOrg();
  }
}

class create_org {
  spinner!: Ora;
  hubOrg!: Org;
  orgConfig!: Record<string, unknown>;

  constructor() {}

  public init(): void {
    this.spinner = ora('Creating Scratch Org ...').start();
    handleProcessSignals(this.spinner);
  }

  public async setDevHub(): Promise<void> {
    this.hubOrg = await getDevHub(CreateOptions);
  }

  public async setOrgConfig(): Promise<void> {
    this.orgConfig = await readOrgDefinition(CreateOptions);
  }

  get scratchOrgOptions(): ScratchOrgCreateOptions {
    return {
      hubOrg: this.hubOrg,
      alias: CreateOptions.scratchOrgName,
      durationDays: parseInt(CreateOptions.durationDays),
      orgConfig: this.orgConfig,
      wait: Duration.minutes(45),
      setDefault: true, // TODO: set to false and make default at the end of the process
      tracksSource: true,
    };
  }

  public keepScratchOrg(): void {
    CreateOptions.scratchOrgResult = { username: CreateOptions.scratchOrgName } as ScratchOrgCreateResult;
    this.spinner.suffixText = `done! (kept ${colors.yellow(CreateOptions.scratchOrgResult.username || '')})`;
    this.spinner.succeed();
    print.success(`Scratch Org created successfully with alias: ${CreateOptions.scratchOrgName}`, {
      output: false,
      log: true,
    });
  }

  public async createScratchOrg(): Promise<void> {
    try {
      CreateOptions.scratchOrgResult = await scratchOrgCreate(this.scratchOrgOptions);

      this.spinner.suffixText = `done! (${colors.yellow(CreateOptions.scratchOrgResult.username || '')})`;
      this.spinner.succeed();
      print.success(`Scratch Org created successfully with alias: ${CreateOptions.scratchOrgName}`, {
        output: false,
        log: true,
      });
    } catch (error) {
      this.spinner.fail('Failed to create Scratch Org');
      throwError(String(error));
    }
  }
}
