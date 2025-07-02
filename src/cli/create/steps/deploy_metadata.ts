import ora from 'ora';
import CreateOptions from '../create.dto.js';
import * as print from 'lib/print-helper.js';
import { run, OutputType } from 'lib/command-helper.js';

export async function deployMetadata(): Promise<void> {
  const metadata = new Metadata();
  await metadata.deploy();
}

export async function clearingTracking(): Promise<void> {
  const metadata = new Metadata();
  await metadata.resetTracking();
}

class Metadata {
  options!: CreateOptions;

  public async deploy(): Promise<void> {
    print.subheader('Deploy Metadata');

    if (CreateOptions.skipDeployment) {
      print.warning('Skipping deployment');
      return;
    }
    // TODO: move to new metadata class
    await run({
      cmd: 'sf project:deploy:start',
      args: ['--wait', '30', '--target-org', this.alias, '--ignore-conflicts', '--concise'],
      outputType: OutputType.OutputLive,
    });

    const spinner = ora('Deployed Metadata Successfully').start();
    spinner.succeed();
  }

  public async resetTracking(): Promise<void> {
    await run({
      cmd: 'sf project:reset:tracking',
      args: ['--target-org', this.alias, '--no-prompt'],
      spinnerText: 'Resetting Metadata Tracking',
      outputType: OutputType.Spinner,
    });
  }

  private get alias(): string {
    return CreateOptions.scratchOrgName ?? '';
  }
}
