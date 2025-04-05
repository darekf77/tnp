//#region imports
import { config } from 'tnp-config/src';
import {
  CoreModels,
  _,
  crossPlatformPath,
  fse,
  glob,
  os,
  path,
} from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { MESSAGES, TEMP_DOCS } from '../../constants';
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
    Helpers.openFolderInFileExploer(pathToFolder);
    this._exit();
  }

  CORE_CONTAINER() {
    const proj = this.project;
    const container = this.project.ins.by(
      'container',
      proj.framework.frameworkVersion,
    );
    if (container) {
      container.run(`code .`).sync();
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
          `code ${this.project.ins.by(this.project.type, this.project.framework.frameworkVersionMinusOne).location} &`,
        )
        .sync();
    } else {
      this.project
        .run(
          `code ${this.project.ins.by(this.project.type, this.project.framework.frameworkVersion).location} &`,
        )
        .sync();
    }
    this._exit();
  }

  TNP_PROJECT() {
    this.project.ins.Tnp.run(`code ${this.project.ins.Tnp.location} &`).sync();
    this._exit();
  }

  UNSTAGE() {
    const proj = this.project.ins.Current;
    const childrenThanAreLibs = proj.children.filter(c => {
      return c.typeIs(...(['isomorphic-lib'] as CoreModels.LibType[]));
    });
    const libs = childrenThanAreLibs.filter(f =>
      f.git.thereAreSomeUncommitedChangeExcept([
        config.file.package_json,
        config.file.taon_jsonc,
      ]),
    );
    libs.forEach(l => l.vsCodeHelpers.__openInVscode());
    this._exit();
  }

  DB() {
    this._openThing('tmp-db.sqlite');
  }

  ROUTES() {
    this._openThing('tmp-routes.json');
  }

  private _openThing(fileName: string) {
    const proj = this.project;

    const openFn = pathToTHing => {
      if (fileName.endsWith('.json')) {
        Helpers.run(`code ${pathToTHing}`, { biggerBuffer: false }).sync();
      } else {
        Helpers.openFolderInFileExploer(pathToTHing);
      }
    };

    if (proj.framework.isStandaloneProject) {
      const pathToDB = path.join(proj.location, fileName);
      openFn(pathToDB);
    }

    const smartContainerFn = (project: Project) => {
      const patternPath = `${path.join(project.location, config.folder.dist, project.name)}/*`;
      const folderPathes = glob.sync(patternPath);

      const lastFolder = _.first(
        folderPathes
          .map(f => {
            return {
              folderPath: f,
              mtimeMs: fse.lstatSync(f).mtimeMs,
            };
          })
          .sort((a, b) => {
            if (a.mtimeMs > b.mtimeMs) return 1;
            if (a.mtimeMs < b.mtimeMs) return -1;
            return 0;
          }),
      );

      if (!lastFolder) {
        Helpers.error(
          `Last project not started...

          not porjects here in "${patternPath}"

          `,
          false,
          true,
        );
      }

      const pathToTHing = path.join(lastFolder.folderPath, fileName);
      openFn(pathToTHing);
    };

    this._exit();
  }
}

export default {
  $Open: Helpers.CLIWRAP($Open, '$Open'),
};
