import { ChangeOfFile } from 'incremental-compiler/src';
import { config } from 'tnp-core/src';
import { crossPlatformPath, fse, path } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';
import { BaseDebounceCompilerForProject } from 'tnp-helpers/src';

import {
  tmpAllAssetsLinked,
  tmpSourceDist,
  tmpSourceDistWebsql,
  tmpSrcAppDist,
  tmpSrcAppDistWebsql,
  tmpSrcDist,
  tmpSrcDistWebsql,
} from '../../../../../constants';
import type { Project } from '../../../project';

const assetsFor = `${config.folder.assets}-for`;

export class AssetsManager extends BaseDebounceCompilerForProject<
  {},
  // @ts-ignore
  Project
> {
  //#region fields & getters
  private tmpFolders = [
    tmpSrcDist,
    tmpSrcDistWebsql,
    tmpSrcAppDist,
    tmpSrcAppDistWebsql,
    tmpSourceDist,
    tmpSourceDistWebsql,
  ];

  private readonly currentProjectNodeModulesPath: string;

  get tmpAllAssetsLinkedInCoreContainerAbsPath(): string {
    //#region @backendFunc
    const containerCoreBase =
      this.project.framework.coreContainer.pathFor(tmpAllAssetsLinked);
    return containerCoreBase;
    //#endregion
  }
  //#endregion

  //#region constructor
  constructor(project: Project) {
    super(project, {
      taskName: `AssetsManagerFor${_.kebabCase(project.location)}`,
      followSymlinks: true,
      folderPath: [project.pathFor(tmpAllAssetsLinked)],
    });
    this.currentProjectNodeModulesPath = project.pathFor(tmpAllAssetsLinked);
  }
  //#endregion

  //#region copy assets to tmp folders
  private copyAssetsToTempFolders(
    changeOfFiles: ChangeOfFile[],
    asyncAction: boolean,
  ): void {
    //#region @backendFunc
    for (const changeOfFile of changeOfFiles) {
      const [pkgName, relativePathInSharedAssets] =
        changeOfFile.fileAbsolutePath
          .replace(this.currentProjectNodeModulesPath + '/', '')
          .split(`/assets/shared/`);

      if (asyncAction) {
        this.tmpFolders
          .map(tmpFolder => {
            return crossPlatformPath([
              this.project.location,
              tmpFolder,
              config.folder.assets,
              assetsFor,
              pkgName,
              config.folder.assets,
              config.folder.shared,
              relativePathInSharedAssets,
            ]);
          })
          .forEach(dest => {
            // console.log(`copy
            //     package: ${pkgName}
            //     relative: ${relativePathInSharedAssets}
            //     from ${changeOfFile.fileAbsolutePath}
            //     to ${dest}

            //     `);
            if (
              changeOfFile.eventName === 'unlink' ||
              changeOfFile.eventName === 'unlinkDir'
            ) {
              try {
                fse.unlinkSync(dest);
              } catch (error) {}
              if (Helpers.exists(dest)) {
                Helpers.remove(dest, true);
              }
            } else {
              try {
                Helpers.copyFile(changeOfFile.fileAbsolutePath, dest);
              } catch (error) {
                Helpers.warn(
                  `[${config.frameworkName}] Could not copy asset ` +
                    `from ${changeOfFile.fileAbsolutePath} to ${dest}

      Probably you should start clean build
      ${config.frameworkName} build:clean:lib
      ${config.frameworkName} build:clean:watch:lib



                    `,
                );
              }
            }
          });
      } else {
        if (
          fse.existsSync(changeOfFile.fileAbsolutePath) &&
          Helpers.isFolder(fse.realpathSync(changeOfFile.fileAbsolutePath))
        ) {
          const filesFrom = Helpers.getFilesFrom(
            fse.realpathSync(changeOfFile.fileAbsolutePath),
            {
              followSymlinks: true,
              recursive: true,
            },
          );
          // console.log('files from ', filesFrom);

          for (const fileAbsPath of filesFrom) {
            const [first, relative] = fileAbsPath.split('/assets/shared/');
            const packageName = first.split('/node_modules/').pop();
            // console.log('relative', relative);
            // console.log('packageName', packageName);
            for (const tmpFolder of this.tmpFolders) {
              Helpers.copyFile(
                fileAbsPath,
                crossPlatformPath([
                  this.project.location,
                  tmpFolder,
                  config.folder.assets,
                  assetsFor,
                  packageName,
                  'assets/shared',
                  relative,
                ]),
              );
            }
          }
        }
      }
    }

    //#endregion
  }
  //#endregion

  //#region action
  async action({
    changeOfFiles,
    asyncEvent,
  }: {
    changeOfFiles: ChangeOfFile[];
    asyncEvent: boolean;
  }): Promise<void> {
    if (asyncEvent) {
      // console.log('Async event triggered, skipping action', changeOfFiles);
    } else {
      this.linkAssetToJoindedProject();
    }
    this.copyAssetsToTempFolders(changeOfFiles, asyncEvent);
  }
  //#endregion

  //#region link joinded assets
  linkAssetToJoindedProject(): void {
    //#region @backendFunc
    if (!Helpers.exists(this.tmpAllAssetsLinkedInCoreContainerAbsPath)) {
      Helpers.mkdirp(this.tmpAllAssetsLinkedInCoreContainerAbsPath);
    }

    Helpers.createSymLink(
      this.tmpAllAssetsLinkedInCoreContainerAbsPath,
      this.project.pathFor(tmpAllAssetsLinked),
      {
        continueWhenExistedFolderDoesntExists: true,
      },
    );

    const coreContainerPath = this.project.framework.coreContainer.location;
    this.project.packagesRecognition.allIsomorphicPackagesFromMemory.map(
      pkgName => {
        this;
        Helpers.createSymLink(
          crossPlatformPath([
            coreContainerPath,
            config.folder.node_modules,
            pkgName,
            'assets/shared',
          ]),
          crossPlatformPath([
            this.tmpAllAssetsLinkedInCoreContainerAbsPath,
            pkgName,
            'assets/shared',
          ]),
          {
            continueWhenExistedFolderDoesntExists: true,
          },
        );
      },
    );
    //#endregion
  }
  //#endregion
}
