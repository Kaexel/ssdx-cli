import CreateOptions from 'cli/create/dto/create-options.dto.js';
import { promises as fs } from 'fs';
import { Org } from '@salesforce/core';
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

async function getCurrentScratchOrgAlias(): Promise<string | undefined> {
  const config = await openConfig();
  return config['target-org'];
}

async function getCurrentDevHubAlias(): Promise<string | undefined> {
  const config = await openConfig();
  return config['target-dev-hub'];
}

export async function getOrg(alias: string): Promise<Org> {
  return Org.create({ aliasOrUsername: alias });
}

export async function getCurrentScratchOrg(): Promise<Org> {
  const alias = await getCurrentScratchOrgAlias();
  if (!alias) {
    throw new Error('No active Scratch Org found. Please create one first.');
  }
  return getOrg(alias);
}

export async function getDevHub(options: CreateOptions): Promise<Org> {
  const alias = options.targetDevHub || (await getCurrentDevHubAlias());

  if (!alias) {
    throw new Error('No default DevHub found. Please create one first.');
  }

  return getOrg(alias);
}

export async function readOrgDefinition(
  options: CreateOptions
): Promise<Record<string, unknown>> {
  try {
    const fs = await import('fs/promises');
    const definitionContent = await fs.readFile(options.configFile, 'utf8');
    return JSON.parse(definitionContent) as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      `Failed to read org definition file: ${options.configFile}. ${String(error)}`
    );
  }
}
