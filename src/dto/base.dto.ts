import { getCurrentScratchOrgAlias } from 'lib/config/sf-config.js';

//  TODO: convert to object with properties and methods, such as setAlias, chooseConfig, findDevhub, setDevhub
export default class BaseOptions {
  public static targetOrg: string;
  // public static targetUsername: string;
  public static targetDevHub: string;

  public static disableNotifications: string;

  public static setFields(options: typeof BaseOptions): void {
    BaseOptions.targetOrg = options.targetOrg;
    BaseOptions.targetDevHub = options.targetDevHub;
    BaseOptions.disableNotifications = options.disableNotifications;
  }

  public static async getTargetOrg(): Promise<string> {
    return BaseOptions.targetOrg ?? (await getCurrentScratchOrgAlias());
  }
}
