import { logger } from 'lib/log.js';
import BaseOptions from 'dto/base.dto.js';

export enum TestLevel {
  NoTestRun = 'NoTestRun',
  RunLocalTests = 'RunLocalTests',
  RunAllTestsInOrg = 'RunAllTestsInOrg',
}

export default class ResourceOptions extends BaseOptions {
  public static preDependencies: boolean = false;
  public static preDeploy: boolean = false;
  public static postDeploy: boolean = false;
  public static postInstall: boolean = false;
  public static showOutput: boolean = false;
  public static testLevel: TestLevel = TestLevel.NoTestRun;
  public static ci: boolean = false;

  public static setFields(options: typeof ResourceOptions): void {
    super.setFields(options);
    ResourceOptions.preDependencies = options.preDependencies;
    ResourceOptions.preDeploy = options.preDeploy;
    ResourceOptions.postDeploy = options.postDeploy;
    ResourceOptions.postInstall = options.postInstall;
    ResourceOptions.showOutput = options.showOutput;
    ResourceOptions.testLevel = options.testLevel;
    ResourceOptions.ci = options.ci;

    logger.info(options, 'Running setFields in ResourceOptions');
  }
}
