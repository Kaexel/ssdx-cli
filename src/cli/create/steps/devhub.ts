import { OrgList } from '../dto/orgs.dto.js';
import { execSync } from 'node:child_process';
import select from '@inquirer/select';
import colors from 'colors/safe.js';
import { runCmd } from 'lib/command-helper.js';

export async function chooseDevhub(): Promise<string> {
  const devHubOptions: { name: string; value: string }[] = await getDevhubOptions();

  const devHub = await select({
    message: 'Choose DevHub:',
    choices: devHubOptions,
  });

  setDefaultDevhub(devHub);

  return devHub;
}

interface devHubOption {
  name: string;
  value: string;
}

async function getDevhubOptions(): Promise<devHubOption[]> {
  const devhubList = await runCmd('sf org:list --json');
  const devHubListObject = JSON.parse(devhubList) as OrgList;

  const devHubOptions: devHubOption[] = [];

  for (const devHub of devHubListObject.result.devHubs) {
    devHubOptions.push({
      name: `${colors.yellow(devHub.alias)} (${devHub.username})`,
      value: devHub.alias,
    });
  }
  return devHubOptions;
}

export function setDefaultDevhub(devhub: string): void {
  execSync('sf config:set target-dev-hub=' + devhub);
}
