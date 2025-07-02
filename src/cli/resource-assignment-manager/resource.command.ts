import { Command } from 'commander';
import { startAllResources } from './resource-assignment-manager.js';
import { Color, setColor, setColors } from 'lib/print-helper/print-helper-formatter.js';
import ResourceOptions from './resource.dto.js';

const DESCRIPTION = `${setColors('Configurable resource assignment to orgs. This option allows:', [Color.yellow, Color.bold])}
  - Running Apex
  - Running JS
  - Assigning Permission Sets
  - Assigning Permission Set Licenses
  - Deploying source- or non-source tracked metadata

All configurations are defined in ${setColor('ssdx-config.json', Color.yellow)}.`;

export class ResourceCommand {
  program: Command;

  constructor(program: Command) {
    this.program = program;

    // TODO: make at least one option required
    this.program
      .command('resource')
      .description(DESCRIPTION)

      .optionsGroup('Parameters')
      .option('-o --target-org <string>', 'The org to run the scripts on')
      .option('-l --test-level <string>', 'For metadata operation, choose the test level', 'NoTestRun')

      .optionsGroup('Resource Types')
      .option('--pre-dependencies', 'Runs "pre_dependencies" resources', false)
      .option('--pre-deploy', 'Runs "pre_deploy" resources', false)
      .option('--post-deploy', 'Runs "post_deploy" resources', false)
      .option('--post-install', 'Runs "post_install" resources', false)

      .optionsGroup('Outout')
      .option('--disable-notifications', 'Disabled OS notifications for steps')
      .option('--show-output', 'Show output of resource assignments', false)
      .option('--ci', 'Disables fancy feature for a slimmer output', false)

      .action((options: typeof ResourceOptions) => {
        ResourceOptions.setFields(options);
        void resourceAssignmentManager();
      });
  }
}

export async function resourceAssignmentManager() {
  // TODO: verify org is set (param or config) and is valid
  await startAllResources();
}
