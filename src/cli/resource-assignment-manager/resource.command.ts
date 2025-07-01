import { Command } from 'commander';
import { SlotOption } from './dto/resource-config.dto.js';
import { ResourceAssignmentManager } from './resource-assignment-manager.js';
import { OutputType, run } from 'lib/command-helper.js';
import { Color, setColor, setColors } from 'lib/print-helper/print-helper-formatter.js';
import { Org } from 'cli/create/dto/org.dto.js';
import { getCurrentScratchOrgAlias } from 'lib/config/sf-config.js';
import { throwError } from 'lib/log.js';

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

export async function resourceAssignmentManager(options: SlotOption) {
  const targetOrgAlias = options.targetOrg ?? (await getCurrentScratchOrgAlias());

  if (!targetOrgAlias) {
    throwError('No target org specified. Please provide a target org alias or username.');
  }
  // TODO: check if targetOrgAlias is a valid org alias before continuing

  const { stdout } = await run({
    cmd: 'sf org:display',
    args: ['--target-org', targetOrgAlias, '--json'],
    outputType: OutputType.Silent,
  });
  const org: Org = stdout && JSON.parse(stdout[0]);

  const targetOrg = org.result.username;

  const resource = new ResourceAssignmentManager(options, targetOrg);
  await resource.run();
}
