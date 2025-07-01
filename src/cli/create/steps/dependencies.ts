import ora from 'ora';
import CreateOptions from '../dto/create.dto.js';
import fs from 'fs';
import * as print from 'lib/print-helper.js';
import { run, OutputType } from 'lib/command-helper.js';
import SfdxProject from '../dto/sfdx-project.dto.js';

export async function installDependencies(): Promise<void> {
  const dependencies = new Dependencies();
  await dependencies.install();
}

class Dependencies {
  sfdxProject!: SfdxProject;
  options!: CreateOptions;

  constructor() {
    this.getSfdxProject();
  }

  private getSfdxProject() {
    const SFDX_PROJECT_PATH = './sfdx-project.json';
    const SFDX_PROJECT_DATA = fs.readFileSync(SFDX_PROJECT_PATH, 'utf8');
    this.sfdxProject = JSON.parse(SFDX_PROJECT_DATA);
  }

  private get hasDependencies(): boolean {
    return (
      this.sfdxProject.packageDirectories &&
      this.sfdxProject.packageDirectories.length > 0 &&
      this.sfdxProject.packageDirectories[0].dependencies &&
      this.sfdxProject.packageDirectories[0].dependencies.length > 0
    );
  }

  public async install(): Promise<void> {
    if (!this.hasDependencies) return;

    print.subheader('Install Dependencies');

    if (CreateOptions.skipDependencies) {
      print.warning('Skipping dependency installation');
      return;
    }

    await run({
      cmd: 'npx sfp dependency:install',
      args: [
        '--installationkeys',
        this.packageKeys,
        '--targetusername',
        this.alias,
        '--targetdevhubusername',
        this.devhub,
      ],
      outputType: OutputType.OutputLiveAndClear,
    });

    const spinner = ora('Installed Dependencies Successfully').start();
    spinner.succeed();
  }

  private get alias(): string {
    return CreateOptions.scratchOrgName ?? '';
  }

  private get devhub(): string {
    return CreateOptions.targetDevHub;
  }

  private get packageKey(): string {
    return CreateOptions.packageKey;
  }

  private get packageKeys(): string {
    const dependencies = [];
    if (
      this.sfdxProject.packageDirectories &&
      this.sfdxProject.packageDirectories.length > 0 &&
      this.sfdxProject.packageDirectories[0].dependencies &&
      this.sfdxProject.packageDirectories[0].dependencies.length > 0
    ) {
      for (const dependency of this.sfdxProject.packageDirectories[0].dependencies) {
        if (dependency.versionNumber) {
          dependencies.push(`${dependency.package}:${this.packageKey}`);
        }
      }
    }
    return `"${dependencies.join(' ')}"`;
  }
}
