//#region imports
import { config } from 'tnp-config/src';
import { crossPlatformPath, path, _, CoreModels } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';

import { InsideStructureData } from './inside-structures/inside-struct';
import { BaseInsideStruct } from './inside-structures/structs/base-inside-struct';

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

      const struct = insideStruct.insideStruct();

      const opt: InsideStructureData = {};

      const replacement = pathOrg => {
        const replacedPart = struct.pathReplacements.reduce((a, b) => {
          return pathOrg.replace(b[0], b[1](opt));
        }, pathOrg);
        return replacedPart;
      };

      opt.replacement = replacement;

      //#region copying files
      if (struct?.relateivePathesFromContainer) {
        [...struct.relateivePathesFromContainer].forEach(f => {
          const orgPath = crossPlatformPath(
            Helpers.resolve(path.join(struct.project.framework.coreProject.location, f)),
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
      if (struct?.linkNodeModulesTo && !initOptions.init.struct) {
        for (let index = 0; index < struct.linkNodeModulesTo.length; index++) {
          const f = struct.linkNodeModulesTo[index];
          const destPath = crossPlatformPath([
            this.project.location,
            replacement(f),
          ]);

          this.project.nodeModules.linkToLocation(destPath);
        }
      }
      //#endregion

      //#region linking files and folders
      if (struct?.linksFuncs) {
        for (let index = 0; index < struct.linksFuncs.length; index++) {
          const [fun1, fun2] = struct.linksFuncs[index];
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
      if (_.isFunction(struct?.endAction)) {
        await struct.endAction(opt);
      }
      //#endregion
    }
    //#endregion
  }
}
