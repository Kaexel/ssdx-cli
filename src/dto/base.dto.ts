import { SSDX } from 'lib/config/ssdx-config.js';

//  TODO: convert to object with properties and methods, such as setAlias, chooseConfig, findDevhub, setDevhub
export default class BaseOptions {
  public static targetOrg: string;
  public static targetDevHub: string;

  public static disableNotifications: string;
  public static ssdxConfig: SSDX;

  public static setFields(options: typeof BaseOptions): void {
    BaseOptions.targetOrg = options.targetOrg;
    BaseOptions.targetDevHub = options.targetDevHub;
    BaseOptions.disableNotifications = options.disableNotifications;
    BaseOptions.ssdxConfig = options.ssdxConfig;
  }
}
