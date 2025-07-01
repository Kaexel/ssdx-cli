import CreateOptions from 'cli/create/dto/create-options.dto.js';
import { promises as fs } from 'fs';
import { Org } from '@salesforce/core';
import { logger, throwError } from 'lib/log.js';

interface SfConfig {
  'target-dev-hub'?: string;
  'target-org'?: string;
}

interface SfdxConfig {
  defaultdevhubusername?: string;
  defaultusername?: string;
}

/* -------------------------------------------------------------------------- */
/*                                Config Files                                */
/* -------------------------------------------------------------------------- */

export async function openSfConfig(): Promise<SfConfig> {
  try {
    await fs.access('.sf/config.json');
    const content = await fs.readFile('.sf/config.json', 'utf8');
    return JSON.parse(content) as SfConfig;
  } catch {
    return {};
  }
}

export async function openSfdxConfig(): Promise<SfdxConfig> {
  try {
    await fs.access('.sfdx/sfdx-config.json');
    const content = await fs.readFile('.sfdx/sfdx-config.json', 'utf8');
    return JSON.parse(content) as SfdxConfig;
  } catch {
    return {};
  }
}

// TODO: create static class to add parameter for target org, to avoid passing it is a parameter
export async function writeSfConfig(config: SfConfig): Promise<void> {
  try {
    await fs.mkdir('.sf', { recursive: true });
    await fs.writeFile('.sf/config.json', JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    throwError(`Failed to write sf config file: ${String(error)}`);
  }
}

export async function writeSfdxConfig(config: SfdxConfig): Promise<void> {
  try {
    await fs.mkdir('.sfdx', { recursive: true });
    await fs.writeFile('.sfdx/sfdx-config.json', JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    throwError(`Failed to write sfdx config file: ${String(error)}`);
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Scratch Org                                */
/* -------------------------------------------------------------------------- */

export async function getCurrentScratchOrg(): Promise<Org | undefined> {
  const alias = await getCurrentScratchOrgAlias();
  return await getOrg(alias);
}

export async function getCurrentScratchOrgAlias(): Promise<string | undefined> {
  const config = await openSfConfig();
  return config['target-org'];
}

export async function setCurrentScratchOrg(alias: string): Promise<void> {
  const sfConfig = await openSfConfig();
  sfConfig['target-org'] = alias;
  await writeSfConfig(sfConfig);

  const sfdxConfig = await openSfdxConfig();
  sfdxConfig['defaultusername'] = alias;
  await writeSfdxConfig(sfdxConfig);
}

/* -------------------------------------------------------------------------- */
/*                                   DevHub                                   */
/* -------------------------------------------------------------------------- */

export async function getDevHub(): Promise<Org> {
  const alias = CreateOptions.targetDevHub || (await getCurrentDevHubAlias());

  if (!alias) {
    throwError('No default DevHub found. Please authenticate one.');
  }

  const org = await getOrg(alias);
  if (!org) {
    throwError(`DevHub with alias ${alias} not found.`);
  }

  return org;
}

export async function getCurrentDevHubAlias(): Promise<string | undefined> {
  const config = await openSfConfig();
  return config['target-dev-hub'];
}

export async function setDevHub(alias: string): Promise<void> {
  const sfConfig = await openSfConfig();
  sfConfig['target-dev-hub'] = alias;
  await writeSfConfig(sfConfig);

  const sfdxConfig = await openSfdxConfig();
  sfdxConfig['defaultdevhubusername'] = alias;
  await writeSfdxConfig(sfdxConfig);
}

/* -------------------------------------------------------------------------- */
/*                                   Shared                                   */
/* -------------------------------------------------------------------------- */

export async function getOrg(alias?: string): Promise<Org | undefined> {
  try {
    return await Org.create({ aliasOrUsername: alias });
  } catch (error) {
    logger.error(`Failed to get org with alias ${alias}: ${String(error)}`);
    return undefined;
  }
}

export async function readOrgDefinition(): Promise<Record<string, unknown>> {
  try {
    const fs = await import('fs/promises');
    const definitionContent = await fs.readFile(CreateOptions.configFile, 'utf8');
    return JSON.parse(definitionContent) as Record<string, unknown>;
  } catch (error) {
    throwError(`Failed to read org definition file: ${CreateOptions.configFile}. ${String(error)}`);
  }
}
