import { config } from 'tnp-config/src';
import { crossPlatformPath, fse, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import type { Project } from '../../../project';

const assetsFor = `${config.folder.assets}-for`;

// @ts-ignore TODO weird inheritance problem
export class AssetsManager extends BaseFeatureForProject<Project> {
  copyExternalAssets(outDir: 'dist', websql: boolean) {
    //#region @backendFunc
    this.project.packagesRecognition.allIsomorphicPackagesFromMemory
      .filter(f => !f.startsWith('@'))
      .map(pkgName => {
        const sharedPath = this.project.nodeModules.pathFor(
          crossPlatformPath([
            pkgName,
            config.folder.assets,
            config.folder.shared,
          ]),
        );

        if (Helpers.exists(sharedPath)) {
          const destinations = [
            crossPlatformPath([
              this.project.location,
              `tmp-src-${outDir}${websql ? '-websql' : ''}`,
              config.folder.assets,
              assetsFor,
              path.basename(pkgName),
              config.folder.shared,
            ]),

            crossPlatformPath([
              this.project.location,
              `tmp-src-app-${outDir}${websql ? '-websql' : ''}`,
              config.folder.assets,
              assetsFor,
              path.basename(pkgName),
              config.folder.shared,
            ]),

            crossPlatformPath([
              this.project.location,
              `tmp-source-${outDir}${websql ? '-websql' : ''}`,
              config.folder.assets,
              assetsFor,
              path.basename(pkgName),
              config.folder.shared,
            ]),
          ];
          for (let index = 0; index < destinations.length; index++) {
            const dest = destinations[index];
            Helpers.removeFolderIfExists(dest);
            Helpers.copy(sharedPath, dest, { recursive: true });
          }
        }
      });
    this.project.packagesRecognition.allIsomorphicPackagesFromMemory
      .filter(f => f.startsWith('@'))
      .map(orgPkgName => {
        const orgPackageRootName = path.dirname(orgPkgName).replace('@', '');
        const realPathOrg = this.project.nodeModules.pathFor(
          crossPlatformPath(path.dirname(orgPkgName)),
        );

        if (Helpers.exists(realPathOrg)) {
          const sharedPath = crossPlatformPath([
            fse.realpathSync(realPathOrg),
            path.basename(orgPkgName),
            config.folder.assets,
            config.folder.shared,
          ]);

          if (Helpers.exists(sharedPath)) {
            const destinations = [
              crossPlatformPath([
                this.project.location,
                `tmp-src-${outDir}${websql ? '-websql' : ''}`,
                config.folder.assets,
                assetsFor,
                `${orgPackageRootName}--${path.basename(orgPkgName)}`,
                config.folder.shared,
              ]),

              crossPlatformPath([
                this.project.location,
                `tmp-src-app-${outDir}${websql ? '-websql' : ''}`,
                config.folder.assets,
                assetsFor,
                `${orgPackageRootName}--${path.basename(orgPkgName)}`,
                config.folder.shared,
              ]),

              crossPlatformPath([
                this.project.location,
                `tmp-source-${outDir}${websql ? '-websql' : ''}`,
                config.folder.assets,
                assetsFor,
                `${orgPackageRootName}--${path.basename(orgPkgName)}`,
                config.folder.shared,
              ]),
            ];
            for (let index = 0; index < destinations.length; index++) {
              const dest = destinations[index];
              Helpers.removeFolderIfExists(dest);
              Helpers.copy(sharedPath, dest, { recursive: true });
            }
          }
        }
      });
    //#endregion
  }
}
