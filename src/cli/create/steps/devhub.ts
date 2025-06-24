import { OrgList } from '../dto/orgs.dto.js';
import { execSync } from 'node:child_process';
import select from '@inquirer/select';
import colors from 'colors/safe.js';
import { Config } from '../dto/create-config.dto.js';
import { runCmd } from 'lib/command-helper.js';

// TODO: change to native query method
/*
async function getConnection() {
	return (
		await core.Org.create({
			aliasOrUsername: TARGET_ORG
		})
	).getConnection();
}

async function queryRecord(query) {
	const conn = await getConnection();
	return (await conn.query(query)).records[0].Id;
}

*/

// TODO: remove

export async function getDefaultOrg(): Promise<string> {
  const targetOrgOutput = await runCmd('sf config:get target-org --json');
  const result: Config = JSON.parse(targetOrgOutput);
  return result.result[0].value;
}

export async function getDefaultDevhub(): Promise<string> {
  const devhubUsernameOutput = await runCmd(
    'sf config:get target-dev-hub --json'
  );
  const result: Config = JSON.parse(devhubUsernameOutput);
  const devHub = result.result[0].value;

  return devHub;
}

export async function chooseDevhub(): Promise<string> {
  const devHubOptions: { name: string; value: string }[] =
    await getDevhubOptions();

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
