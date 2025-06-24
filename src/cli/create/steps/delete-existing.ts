import colors from 'colors/safe.js';
import ora, { Ora } from 'ora';
import CreateOptions from '../dto/create-options.dto.js';
import { Org } from '@salesforce/core';
import { confirm } from '@inquirer/prompts';
import {
  getCurrentScratchOrg,
  getCurrentScratchOrgAlias,
} from 'lib/config/sf-config.js';
import { logger } from 'lib/log.js';

export async function delete_question(options: CreateOptions): Promise<void> {
  const org = new OrgManager(options);

  if (await org.checkIfActiveScratchOrg()) {
    await org.askToDeleteOrg();
  }
}

class OrgManager {
  options: CreateOptions;
  spinner!: Ora;
  currentScratchOrg?: Org;

  constructor(options: CreateOptions) {
    this.options = options;
  }

  public async checkIfActiveScratchOrg(): Promise<boolean> {
    this.currentScratchOrg = await getCurrentScratchOrg();

    if (!this.currentScratchOrg || (await this.notScratchOrg())) {
      return false;
    }

    return await this.isActive();
  }

  private async notScratchOrg(): Promise<boolean> {
    return (await this.currentScratchOrg?.determineIfScratch()) !== true;
  }

  private async isActive(): Promise<boolean> {
    try {
      await this.currentScratchOrg?.refreshAuth();
      return true;
    } catch (error) {
      logger.error('Error checking scratch org status, likely expired:', error);
      return false;
    }
  }

  public async askToDeleteOrg(): Promise<void> {
    const orgUsername = this.currentScratchOrg?.getUsername() || '';
    const alias = (await getCurrentScratchOrgAlias()) || '';

    const toDelete = await confirm({
      message: `You have an existing scratch org.
  Alias: ${colors.yellow(alias)}
  Username: ${colors.yellow(orgUsername)}

  Do you want to delete it?`,
    });

    if (toDelete) {
      await this.deleteOrg();
    }
  }

  public async deleteOrg(): Promise<void> {
    this.spinner = ora('Deleting existing scratch org').start();

    try {
      // Use the remove method which handles all cleanup
      await this.currentScratchOrg?.remove();

      this.spinner.succeed('Existing scratch org deleted successfully');
    } catch (error) {
      this.spinner.fail('Failed to delete scratch org');
      console.error('Delete error:', error);
      throw error;
    }
  }
}
