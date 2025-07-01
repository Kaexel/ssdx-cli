import * as print from 'lib/print-helper.js';
import colors from 'colors/safe.js';
import { Command } from 'commander';
import CreateOptions from './dto/create-options.dto.js';
import { createScratchOrg } from './steps/create_org.js';
import { installDependencies } from './steps/dependencies.js';
import { initialize } from './steps/initializer.js';
import { clearingTracking, deployMetadata } from './steps/deploy_metadata.js';
import { openOrg } from './steps/open_org.js';
import { getSlotOptions } from 'cli/resource-assignment-manager/dto/resource-config.dto.js';
import { resourceAssignmentManager } from 'cli/resource-assignment-manager/resource.command.js';
import { delete_question } from './steps/delete-existing.js';
import { Notification } from 'lib/notification.js';

export default class CreateCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    this.program
      .command('create')
      .description('Create a Scratch org')

      .optionsGroup('Parameters')
      .option(`-n, --scratch-org-name ${colors.yellow('<string>')}`, 'The alias to give the Scratch Org')
      .option(`-d, --duration-days ${colors.yellow('<number>')}`, 'The amount of days to keep the Scratch Org', '5')
      .option(
        `-c, --config-file ${colors.yellow('<string>')}`,
        'The Scratch Org config file (see ssdx-config.json for default value)'
      )
      .option(`-v, --target-dev-hub ${colors.yellow('<string>')}`, 'The alias or username of the dev hub org')

      .optionsGroup('Flags')
      .option('--delete-current-org', 'Delete the current Scratch Org')
      .option('--disable-notifications', 'Disabled OS notifications for steps')
      .option('--skip-dependencies', 'Skip dependency installation')
      .option('--skip-deployment', 'Skip deployment step')

      .optionsGroup('Debug')
      .option('--keep-existing-org', 'Keep the existing Scratch Org')

      .action((options: typeof CreateOptions) => {
        CreateOptions.setFields(options);

        Notification.disableNotifications = !!CreateOptions.disableNotifications;
        void this.main();
      });
  }

  private async main() {
    await initialize();
    await delete_question();
    await createScratchOrg();

    // assigner slots
    const { preDependencies, preDeploy, postDeploy } = getSlotOptions(CreateOptions.scratchOrgName);

    // dependency install
    await resourceAssignmentManager(preDependencies);
    await installDependencies();

    // deployment
    await resourceAssignmentManager(preDeploy);
    await deployMetadata();
    await resourceAssignmentManager(postDeploy);
    await clearingTracking();

    await openOrg();

    print.success(`Scratch Org created successfully (alias: ${CreateOptions.scratchOrgName})`, {
      output: false,
      log: true,
      notification: true,
    });
  }
}
