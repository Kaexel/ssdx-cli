import ResourceOptions from 'cli/resource-assignment-manager/resource.dto.js';
import { Resource, ResourceType, ssdxConfig } from 'dto/ssdx-config.dto.js';
import fs from 'fs';
import { logger } from 'lib/log.js';
import * as print from 'lib/print-helper.js';
import { exit } from 'process';

export enum SlotType {
  PRE_DEPENDENCIES = 'pre_dependencies',
  PRE_DEPLOY = 'pre_deploy',
  POST_DEPLOY = 'post_deploy',
  POST_INSTALL = 'post_install',
}

export function fetchConfig(): SSDX {
  return new SSDX();
}

export class SSDX {
  config: ssdxConfig = {} as ssdxConfig;

  constructor() {
    this.fetchConfigFile();
  }

  private getFile(): string {
    if (fs.existsSync('ssdx-config.json')) {
      return fs.readFileSync('ssdx-config.json', 'utf8');
    } else {
      print.warning('ssdx-config.json file not found in current directory');
      return '{}';
    }
  }

  private fetchConfigFile() {
    try {
      this.config = JSON.parse(this.getFile()) as ssdxConfig;
    } catch (error) {
      print.error(
        'Failed to parse ssdx-config.json. Make sure it is a valid JSON file with correct structure (see documentation). View logs for details (./.ssdx/logs/)'
      );
      logger.error(error);
      exit(1);
    }
  }

  public getResource(slotOption: SlotType): Resource[] {
    const resources = this._getResource(slotOption);
    return this.setParameters(resources);
  }

  private _getResource(slotOption: SlotType): Resource[] {
    switch (slotOption) {
      case SlotType.PRE_DEPENDENCIES:
        return this.config.pre_dependencies ?? [];
      case SlotType.PRE_DEPLOY:
        return this.config.pre_deploy ?? [];
      case SlotType.POST_DEPLOY:
        return this.config.post_deploy ?? [];
      case SlotType.POST_INSTALL:
        return this.config.post_install ?? [];
      default:
        print.error(`ERROR: Unsupported slot type: ${slotOption as string}`);
        return [];
    }
  }

  public getAllResources(): Resource[] {
    const resources = this._getAllResources();
    return this.setParameters(resources);
  }

  private _getAllResources(): Resource[] {
    return [
      ...(this.config.pre_dependencies ?? []),
      ...(this.config.pre_deploy ?? []),
      ...(this.config.post_deploy ?? []),
      ...(this.config.post_install ?? []),
    ];
  }

  private setParameters(resources: Resource[] = this.getAllResources()): Resource[] {
    for (const resource of resources) {
      resource.skip = false;
      switch (resource.type) {
        case ResourceType.APEX:
          resource.cmd = 'sf apex:run';
          resource.args = ['--file', resource.value];
          break;
        case ResourceType.JS:
          resource.cmd = 'node';
          resource.args = [resource.value];
          break;
        case ResourceType.SF:
          resource.cmd = resource.value;
          resource.args = [];
          break;
        case ResourceType.PERMISSION_SET:
        case ResourceType.PERMISSION_SET_GROUP:
          resource.cmd = 'sf org:assign:permset';
          resource.args = ['--name', resource.value];
          break;
        case ResourceType.LICENSE:
          resource.cmd = 'sf org:assign:permsetlicense';
          resource.args = ['--name', resource.value];
          break;
        case ResourceType.METADATA:
          resource.cmd = 'sf project:deploy:start';
          resource.args = [
            '--source-dir',
            resource.value,
            '--ignore-conflicts',
            '--concise',
            '--test-level',
            ResourceOptions.testLevel,
          ];
          break;
        default:
          print.error(`ERROR: Unsupported resource type: ${resource.type as string}`);
          resource.skip = true;
          break;
      }
    }

    return resources;
  }
}
