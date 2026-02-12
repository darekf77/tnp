//#region imports
import { config, LibTypeEnum, UtilsOs } from 'tnp-core/src';
import {
  CoreModels,
  _,
  crossPlatformPath,
  fse,
  glob,
  os,
  path,
} from 'tnp-core/src';
import { Helpers, HelpersTaon, UtilsVSCode } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import {
  MESSAGES,
  packageJsonMainProject,
  taonJsonMainProject,
  TEMP_DOCS,
} from '../../constants';
import { EnvOptions } from '../../options';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class $Open extends BaseCli {
  public _() {
    Helpers.info('Opening folder...');
    let pathToFolder = this.firstArg;
    if (!pathToFolder) {
      pathToFolder = this.cwd;
    }
    if (!path.isAbsolute(pathToFolder)) {
      pathToFolder = this.project.pathFor(pathToFolder);
    }
    Helpers.openFolderInFileExplorer(pathToFolder);
    this._exit();
  }

  async CORE_CONTAINER() {
    if (!this.project?.framework?.coreContainer) {
      Helpers.error(`This is not taon project`);
    }
    await this.project?.framework?.coreContainer?.openInEditor();
    this._exit();
  }

  async CORE_PROJECT() {
    if (!this.project?.framework?.coreProject) {
      Helpers.error(`This is not taon project`);
    }
    await this.project?.framework?.coreProject?.openInEditor();
    this._exit();
  }

  async TNP_PROJECT() {
    if (!this.project?.ins?.Tnp) {
      Helpers.error(`This is not taon project`);
    }
    await this.project.ins.Tnp?.openInEditor();
    this._exit();
  }

  async UNSTAGE() {
    const proj = this.project.ins.Current;
    const childrenThanAreLibs = proj.children.filter(c => {
      return c.typeIs(
        ...([LibTypeEnum.ISOMORPHIC_LIB] as CoreModels.LibType[]),
      );
    });
    const unstageProjects = childrenThanAreLibs.filter(f =>
      f.git.thereAreSomeUncommitedChangeExcept([
        packageJsonMainProject,
        taonJsonMainProject,
      ]),
    );
    for (const unstageProj of unstageProjects) {
      await unstageProj.openInEditor();
    }
    this._exit();
  }
}

export default {
  $Open: HelpersTaon.CLIWRAP($Open, '$Open'),
};
