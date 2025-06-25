import select from '@inquirer/select';
import colors from 'colors/safe.js';
import { setDevHub } from 'lib/config/sf-config.js';
import { StateAggregator, Org } from '@salesforce/core';

export async function chooseDevhub(): Promise<string> {
  const devHubOptions: { name: string; value: string }[] = await getAllDevHubOrgs();

  const devHub = await select({
    message: 'Choose DevHub:',
    choices: devHubOptions,
  });

  await setDevHub(devHub);

  return devHub;
}

interface devHubOption {
  name: string;
  value: string;
}

export async function getAllDevHubOrgs(): Promise<devHubOption[]> {
  try {
    const stateAggregator = await StateAggregator.getInstance();
    const aliases = stateAggregator.aliases.getAll();

    const devHubOrgs: devHubOption[] = [];

    for (const alias of Object.keys(aliases)) {
      const org = await Org.create({ aliasOrUsername: alias });

      if (org.isDevHubOrg()) {
        devHubOrgs.push({
          name: `${colors.yellow(alias)} (${org.getUsername()})`,
          value: alias,
        });
      }
    }

    // If no DevHub orgs found, fallback to the CLI command
    return devHubOrgs;
  } catch (error) {
    console.error('Error fetching DevHub orgs:', error);
    return [];
  }
}
