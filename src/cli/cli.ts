import * as print from 'lib/print-helper.js';
import { Command } from 'commander';
import CreateCommand from './create/create.command.js';
import { ResourceCommand } from './resource-assignment-manager/resource.command.js';
import { logger } from 'lib/log.js';
import { VERSION } from './version.js';

export default class cli {
  protected static program = new Command();

  constructor() {
    new CreateCommand(cli.program);
    new ResourceCommand(cli.program);
  }

  public run(): void {
    logger.info(`SSDX version: ${VERSION}`);
    logger.info(`Node version: ${process.version}`);
    print.header('SSDX CLI');
    cli.program
      .name('ssdx-cli')
      .description('Salesforce DX cli helper tool')
      .version(VERSION as string);

    cli.program.parse();
  }
}
