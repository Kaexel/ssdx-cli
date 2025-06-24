import { promises as fs } from 'fs';

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
