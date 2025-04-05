//#region imports
import { config } from 'tnp-config/src';
import { crossPlatformPath, path, _, CoreModels } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import { InitingPartialProcess, EnvOptions } from '../../../../../../options';
import type { Project } from '../../../../project';
import type { InsideStructAngular13App } from '../../../angular-node-app/tools/inside-struct-angular13-app';
import type { InsideStructAngular13Lib } from '../inside-struct-angular13-lib';

import { InsideStructureData } from './inside-struct';
import { BaseInsideStruct } from './structs/base-inside-struct';
//#endregion

const clearUnexistedLinks = (pathToClear: string) => {
  pathToClear = crossPlatformPath(pathToClear) || '';
  const orgPath = pathToClear;
  const splited = pathToClear.split('/');
  let previous: string;
  do {
    splited.pop();
    var pathDir = splited.join('/');
    if (pathDir === previous) {
      return orgPath;
    }
    if (Helpers.isUnexistedLink(pathDir)) {
      Helpers.removeFileIfExists(pathDir);
      return orgPath;
    }
    previous = pathDir;
  } while (!!pathDir);
  return orgPath;
};

// @ts-ignore TODO weird inheritance problem
export class InsideStructuresProcess extends BaseFeatureForProject<Project> {
  async process(
    structs: BaseInsideStruct[],
    initOptions: EnvOptions,
  ): Promise<void> {
    //#region @backendFunc
    for (let index = 0; index < structs.length; index++) {
      const insideStruct = structs[index];

      if (!insideStruct) {
        continue;
      }

      const opt: InsideStructureData = {};

      const replacement = pathOrg => {
        const replacedPart = insideStruct.struct.pathReplacements.reduce(
          (a, b) => {
            return pathOrg.replace(b[0], b[1](opt));
          },
          pathOrg,
        );
        return replacedPart;
      };

      opt.replacement = replacement;

      //#region copying files
      if (insideStruct?.struct?.relateivePathesFromContainer) {
        [...insideStruct.struct.relateivePathesFromContainer].forEach(f => {
          const orgPath = crossPlatformPath(
            Helpers.resolve(
              path.join(insideStruct.struct.coreContainer.location, f),
            ),
          );
          const destPath = clearUnexistedLinks(
            crossPlatformPath([this.project.location, replacement(f)]),
          );

          if (orgPath !== destPath) {
            if (Helpers.isFolder(orgPath)) {
              Helpers.copy(orgPath, destPath);
            } else {
              Helpers.copyFile(orgPath, destPath);
            }
          } else {
            Helpers.warn(`${config.frameworkName} [initAngularAppStructure] trying to copy same thing:
              ${orgPath}
              `);
          }
        });
      }

      //#endregion

      //#region linking node_modules
      if (insideStruct?.struct?.linkNodeModulesTo && !initOptions.init.struct) {
        for (
          let index = 0;
          index < insideStruct.struct.linkNodeModulesTo.length;
          index++
        ) {
          const f = insideStruct.struct.linkNodeModulesTo[index];
          const destPath = crossPlatformPath([
            this.project.location,
            replacement(f),
          ]);

          this.project.nodeModules.linkToLocation(destPath);
        }
      }
      //#endregion

      //#region linking files and folders
      if (insideStruct?.struct?.linksFuncs) {
        for (
          let index = 0;
          index < insideStruct.struct.linksFuncs.length;
          index++
        ) {
          const [fun1, fun2] = insideStruct.struct.linksFuncs[index];
          let from = fun1(opt);
          from = crossPlatformPath([this.project.location, replacement(from)]);

          let to = fun2(opt);
          to = crossPlatformPath([this.project.location, replacement(to)]);
          if (!to || !from || to === from) {
            continue;
          }
          // console.log({
          //   from,
          //   to
          // })
          Helpers.remove(to);
          Helpers.createSymLink(from, to, {
            continueWhenExistedFolderDoesntExists: true,
          });
        }
      }
      //#endregion

      //#region execute end function
      if (_.isFunction(insideStruct?.struct?.endAction)) {
        await Helpers.runSyncOrAsync({
          functionFn: insideStruct.struct.endAction,
          arrayOfParams: [opt],
        });
      }
      //#endregion
    }
    //#endregion
  }
}

export class InsideStructuresApp
  extends InsideStructuresProcess
  implements InitingPartialProcess
{
  private insideStructAngular13AppNormal: InsideStructAngular13App;
  private insideStructAngular13AppWebsql: InsideStructAngular13App;

  //#region api / recreate
  public async init(initOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    initOptions = EnvOptions.from(initOptions);

    const { InsideStructAngular13App: InsideStructAngular13AppClass } =
      await import(
        '../../../angular-node-app/tools/inside-struct-angular13-app'
      );

    this.insideStructAngular13AppNormal = new InsideStructAngular13AppClass(
      this.project,
      initOptions.clone({ build: { websql: false } }),
    );
    this.insideStructAngular13AppWebsql = new InsideStructAngular13AppClass(
      this.project,
      initOptions.clone({ build: { websql: true } }),
    );

    const structs: BaseInsideStruct[] = [
      this.insideStructAngular13AppNormal,
      this.insideStructAngular13AppWebsql,
    ];

    await this.process(structs, initOptions);
    //#endregion
  }
  //#endregion
}

export class InsideStructuresLib
  extends InsideStructuresProcess
  implements InitingPartialProcess
{
  private insideStructAngular13LibNormal: InsideStructAngular13Lib;
  private insideStructAngular13LibWebsql: InsideStructAngular13Lib;

  //#region api / recreate
  public async init(initOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    initOptions = EnvOptions.from(initOptions);

    const { InsideStructAngular13Lib: InsideStructAngular13LibClass } =
      await import('../inside-struct-angular13-lib');

    this.insideStructAngular13LibNormal = new InsideStructAngular13LibClass(
      this.project,
      initOptions.clone({ build: { websql: false } }),
    );

    this.insideStructAngular13LibWebsql = new InsideStructAngular13LibClass(
      this.project,
      initOptions.clone({ build: { websql: true } }),
    );

    const structs: BaseInsideStruct[] = [
      this.insideStructAngular13LibNormal,
      this.insideStructAngular13LibWebsql,
    ];
    await this.process(structs, initOptions);
    //#endregion
  }
  //#endregion
}
