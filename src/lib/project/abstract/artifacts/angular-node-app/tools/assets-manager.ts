import { config } from 'tnp-config/src';
import { crossPlatformPath, fse, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import type { Project } from '../../../project';

const assetsFor = `${config.folder.assets}-for`;

// @ts-ignore TODO weird inheritance problem
export class AssetsManager extends BaseFeatureForProject<Project> {
  copyExternalAssets(websql: boolean): void {
    //#region @backendFunc

    this.project.packagesRecognition.allIsomorphicPackagesFromMemory.map(
      pkgName => {
        const sharedPath = this.project.nodeModules.pathFor([
          pkgName,
          config.folder.assets,
          config.folder.shared,
        ]);

        if (Helpers.exists(sharedPath)) {
          const destinations = [
            crossPlatformPath([
              this.project.location,
              `tmp-src-${config.folder.dist}${websql ? '-websql' : ''}`,
              config.folder.assets,
              assetsFor,
              pkgName,
              config.folder.shared,
            ]),

            crossPlatformPath([
              this.project.location,
              `tmp-src-app-${config.folder.dist}${websql ? '-websql' : ''}`,
              config.folder.assets,
              assetsFor,
              pkgName,
              config.folder.shared,
            ]),

            crossPlatformPath([
              this.project.location,
              `tmp-source-${config.folder.dist}${websql ? '-websql' : ''}`,
              config.folder.assets,
              assetsFor,
              pkgName,
              config.folder.shared,
            ]),
          ];
          for (let index = 0; index < destinations.length; index++) {
            const dest = destinations[index];
            Helpers.removeFolderIfExists(dest);
            Helpers.copy(sharedPath, dest, { recursive: true });
          }
        }
      },
    );
    //#endregion
  }
}
