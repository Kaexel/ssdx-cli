import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function getNextVersion(): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync('npx semantic-release --dry-run', {
      env: { ...process.env, CI: 'true' },
    });

    // Look for the next version in the output
    const output = stdout + stderr;
    const versionMatch = output.match(/The next release version is (\d+\.\d+\.\d+)/);

    if (versionMatch) {
      return versionMatch[1];
    }

    // Fallback: if no new version is determined, use current package.json version
    console.log('No new version determined by semantic-release, using current package.json version');
    const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
    return packageJson.version;
  } catch (error) {
    console.warn('Error running semantic-release, falling back to package.json version:', error);
    const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
    return packageJson.version;
  }
}

async function setVersion() {
  const version = await getNextVersion();

  const versionFile = `export const VERSION = '${version}';
`;

  writeFileSync(join('./src/cli', 'version.ts'), versionFile);
  console.log(`✅ Version file generated with version: ${version}`);
}

setVersion().catch(console.error);
