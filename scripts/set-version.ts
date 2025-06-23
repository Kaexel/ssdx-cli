import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

const versionFile = `export const VERSION = '${packageJson.version}';
`;

writeFileSync(join('./src/cli', 'version.ts'), versionFile);
console.log('✅ Version file generated');
