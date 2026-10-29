//#region imports
import {
  _,
  config,
  crossPlatformPath,
  Helpers,
  UtilsExecProc,
  UtilsTempFolder,
} from 'tnp-core/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import { Project } from './project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class ProxyClonedProject extends BaseFeatureForProject<Project> {
  get tempRoot(): string {
    return crossPlatformPath([
      UtilsTempFolder.getPathForNodeOnly({
        prefix: 'taon-proxy-cloned',
        deleteAfterDays: 1,
      }),
    ]);
  }

  get tempLocation(): string {
    return !this.project
      ? ''
      : crossPlatformPath([this.tempRoot, _.camelCase(this.project.location)]);
  }

  async execute(argsWithParams: string): Promise<void> {
    // console.log({
    //   argsWithParams,
    // });
    Helpers.removeSymlinks(this.tempLocation);
    Helpers.remove(this.tempLocation);

    await this.project.fileFoldersOperations.copyProjectTo(this.tempLocation);
    Helpers.info(`Done copying`);

    await UtilsExecProc.executeUntilEndOrThrow({
      command: `${config.frameworkName} ${argsWithParams}`,
      cwd: crossPlatformPath([this.tempLocation, this.project.name]),
    });
  }
}
