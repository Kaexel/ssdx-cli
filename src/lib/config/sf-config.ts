import CreateOptions from 'cli/create/dto/create-options.dto.js';
import { promises as fs } from 'fs';
import { Org } from '@salesforce/core';
import { logger, throwError } from 'lib/log.js';

interface SfConfig {
  'target-dev-hub'?: string;
  'target-org'?: string;
}

export async function openConfig(): Promise<SfConfig> {
  try {
    await fs.access('.sf/config.json');
    const content = await fs.readFile('.sf/config.json', 'utf8');
    return JSON.parse(content) as SfConfig;
  } catch {
    return {};
  }
}

/* ------------------------------- scratch org ------------------------------ */

export async function getCurrentScratchOrg(): Promise<Org | undefined> {
  const alias = await getCurrentScratchOrgAlias();
  return await getOrg(alias);
}
export async function getCurrentScratchOrgAlias(): Promise<string | undefined> {
  const config = await openConfig();
  return config['target-org'];
}

/* --------------------------------- devhub --------------------------------- */

export async function getDevHub(options: CreateOptions): Promise<Org> {
  const alias = options.targetDevHub || (await getCurrentDevHubAlias());

  if (!alias) {
    throwError('No default DevHub found. Please authenticate one.');
  }

  const org = await getOrg(alias);
  if (!org) {
    throwError(`DevHub with alias ${alias} not found.`);
  }

  return org;
}

export async function getCurrentDevHubAlias(): Promise<string> {
  const config = await openConfig();
  const devHub = config['target-dev-hub'];
  if (!devHub) {
    throwError('No default DevHub found. Please authenticate one.');
  }
  return devHub;
}

/* --------------------------------- shared --------------------------------- */

export async function getOrg(alias?: string): Promise<Org | undefined> {
  try {
    return await Org.create({ aliasOrUsername: alias });
  } catch (error) {
    logger.error(`Failed to get org with alias ${alias}: ${String(error)}`);
    return undefined;
  }
}

export async function readOrgDefinition(options: CreateOptions): Promise<Record<string, unknown>> {
  try {
    const fs = await import('fs/promises');
    const definitionContent = await fs.readFile(options.configFile, 'utf8');
    return JSON.parse(definitionContent) as Record<string, unknown>;
  } catch (error) {
    throwError(`Failed to read org definition file: ${options.configFile}. ${String(error)}`);
  }
}
