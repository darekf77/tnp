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
import { Helpers, HelpersTaon } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { MESSAGES, packageJsonMainProject, taonJsonMainProject, TEMP_DOCS } from '../../constants';
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

  CORE_CONTAINER() {
    const proj = this.project;
    const container = this.project.ins.by(
      LibTypeEnum.CONTAINER,
      proj.framework.frameworkVersion,
    );
    if (container) {
      container.run(`${UtilsOs.detectEditor()} .`).sync();
    } else {
      Helpers.error(`Core container not found...`, false, true);
    }
    this._exit();
  }

  CORE_PROJECT() {
    if (
      this.project.framework.isCoreProject &&
      this.project.framework.frameworkVersionAtLeast('v2')
    ) {
      this.project
        .run(
          `${UtilsOs.detectEditor()} ${this.project.ins.by(this.project.type, this.project.framework.frameworkVersionMinusOne).location} &`,
        )
        .sync();
    } else {
      this.project
        .run(
          `${UtilsOs.detectEditor()} ${this.project.ins.by(this.project.type, this.project.framework.frameworkVersion).location} &`,
        )
        .sync();
    }
    this._exit();
  }

  TNP_PROJECT() {
    this.project.ins.Tnp.run(`${UtilsOs.detectEditor()} ${this.project.ins.Tnp.location} &`).sync();
    this._exit();
  }

  UNSTAGE() {
    const proj = this.project.ins.Current;
    const childrenThanAreLibs = proj.children.filter(c => {
      return c.typeIs(...([LibTypeEnum.ISOMORPHIC_LIB] as CoreModels.LibType[]));
    });
    const unstageFiles = childrenThanAreLibs.filter(f =>
      f.git.thereAreSomeUncommitedChangeExcept([
        packageJsonMainProject,
        taonJsonMainProject,
      ]),
    );
    unstageFiles.forEach(l => l.vsCodeHelpers.openInVscode());
    this._exit();
  }
}

export default {
  $Open: HelpersTaon.CLIWRAP($Open, '$Open'),
};
