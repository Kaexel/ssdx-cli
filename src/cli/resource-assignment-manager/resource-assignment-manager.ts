import { OutputType, run } from 'lib/command-helper.js';
import ora from 'ora';
import * as print from 'lib/print-helper.js';
import { Color, setColor } from 'lib/print-helper/print-helper-formatter.js';
import pad from 'pad';
import { Resource, ResourceType } from 'dto/ssdx-config.dto.js';
import { logger } from 'lib/log.js';
import { queryRecord } from 'lib/sf-helper.js';
import ResourceOptions from './dto/resource.dto.js';
import { SlotType } from 'lib/config/ssdx-config.js';

export async function startResourcePreDependencies(): Promise<void> {
  await new ResourceAssignmentManager().startResource(SlotType.PRE_DEPENDENCIES);
}

export async function startResourcePreDeploy(): Promise<void> {
  await new ResourceAssignmentManager().startResource(SlotType.PRE_DEPLOY);
}

export async function startResourcePostDeploy(): Promise<void> {
  await new ResourceAssignmentManager().startResource(SlotType.POST_DEPLOY);
}

export async function startResourcePostInstall(): Promise<void> {
  await new ResourceAssignmentManager().startResource(SlotType.POST_INSTALL);
}

export async function startAllResources(): Promise<void> {
  await new ResourceAssignmentManager().startAllResources();
}

export class ResourceAssignmentManager {
  public async startResource(slotType: SlotType): Promise<void> {
    // if (!ResourceOptions.ssdxConfig.hasResources()) return; // TODO: enable

    print.subheader(slotType + ' Steps', undefined, Color.bgCyan);

    for (const resource of ResourceOptions.ssdxConfig.resource(slotType)) {
      await this.waitForPermsetGroup(resource);
      await this.runResource(resource);
    }
  }

  public async startAllResources(): Promise<void> {
    if (!ResourceOptions.ssdxConfig.hasResources()) return;

    print.subheader(ResourceOptions.ssdxConfig.resourceTypes.join(', ') + ' Steps', undefined, Color.bgCyan);

    for (const resource of ResourceOptions.ssdxConfig.resources) {
      await this.waitForPermsetGroup(resource);
      await this.runResource(resource);
    }
  }

  max = 8;
  private async waitForPermsetGroup(resource: Resource): Promise<void> {
    if (resource.type !== ResourceType.PERMISSION_SET_GROUP) return;

    const spinnerText =
      this.getType(resource) +
      `Waiting for permission set group '${setColor(resource.value, Color.green)}' to be updated`;
    const spinner = ora(spinnerText).start();

    let output = await this.checkPermsetStatus(resource);
    let count = 0;

    while (output.totalSize === 0 && count < this.max) {
      spinner.text = `${spinnerText}...  (${count++}/${this.max})`;
      await new Promise(resolve => setTimeout(resolve, 1000 * count));
      output = await this.checkPermsetStatus(resource);
    }

    if (output.totalSize === 0) {
      logger.error(`Permission set group '${resource.value}' did not update after ${this.max} attempts`);
      spinner.fail();
    } else {
      spinner.succeed();
    }
  }

  private async checkPermsetStatus(resource: Resource) {
    return await queryRecord(
      `SELECT Count() FROM PermissionSetGroup WHERE DeveloperName = '${resource.value}' AND Status = 'Updated'`,
      ResourceOptions.targetOrg
    );
  }

  private async runResource(resource: Resource): Promise<void> {
    if (resource.skip) return this.skipResource(resource);
    logger.info(resource, 'Running resource from resource-assignment-manager.ts');

    this.addTargetOrg(resource);

    await run({
      cmd: resource.cmd,
      args: resource.args,
      outputType: this.getOutputType(resource),
      spinnerText: this.getSpinnerText(resource),
      exitOnError: !resource.continue_on_error,
    });
  }

  private addTargetOrg(resource: Resource) {
    if (resource.skip_target_org) {
      return;
    }

    // resource type JS does not need arg --target-org, only SF commands need it
    if (resource.type !== ResourceType.JS) {
      resource.args.push('--target-org');
    }

    // always add the target-org value to the args (if not skipping). JS scripts will be added without name, and SF commands will have the value with --target-org before
    resource.args.push(ResourceOptions.targetOrg);
  }

  private getOutputType(resource: Resource): OutputType {
    if (ResourceOptions.ci) return OutputType.OutputLiveWithHeader;
    if (ResourceOptions.showOutput || resource.print_output) return OutputType.SpinnerAndOutput;
    return OutputType.Spinner;
  }

  private skipResource(resource: Resource) {
    const spinnerText = this.getSpinnerText(resource) + '...  SKIPPING due to invalid configuration type';
    ora(spinnerText).warn();
    return;
  }

  private getSpinnerText(resource: Resource): string | undefined {
    const type = this.getType(resource);
    const file = this.getFileName(resource);
    const path = this.getPath(resource);
    return type + file + path;
  }
  private getType(resource: Resource) {
    let type = resource.type as string;
    if (resource.type === ResourceType.PERMISSION_SET) {
      type = 'PERMISSION SET';
    } else if (resource.type === ResourceType.PERMISSION_SET_GROUP) {
      type = 'PERMSET GROUP';
    } else if (resource.type === ResourceType.LICENSE) {
      type = 'LICENSE';
    }
    type = pad(type + ':', 16, ' ');
    type = type.toUpperCase();
    return setColor(type, Color.bold);
  }
  private getFileName(resource: Resource) {
    const file = resource.value.split('/').pop() ?? '';
    return setColor(file, Color.green);
  }
  private getPath(resource: Resource): string {
    let path = resource.value.split('/').slice(0, -1).join('/');
    path = setColor(path, Color.blue);
    return path ? ` (from ${path})` : '';
  }
}
