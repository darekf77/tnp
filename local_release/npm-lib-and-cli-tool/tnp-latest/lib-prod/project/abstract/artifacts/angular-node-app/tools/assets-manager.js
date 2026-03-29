import { config } from 'tnp-core/lib-prod';
import { crossPlatformPath, fse } from 'tnp-core/lib-prod';
import { ___NS__kebabCase } from 'tnp-core/lib-prod';
import { Helpers__NS__createSymLink, Helpers__NS__exists, Helpers__NS__getFilesFrom, Helpers__NS__isFolder, Helpers__NS__mkdirp, Helpers__NS__remove, Helpers__NS__warn, HelpersTaon__NS__copyFile } from 'tnp-helpers/lib-prod';
import { BaseDebounceCompilerForProject } from 'tnp-helpers/lib-prod';
import { assetsFor, assetsFromNgProj, assetsFromNpmPackage, assetsFromSrc, nodeModulesMainProject, prodSuffix, sharedFromAssets, tmpAllAssetsLinked, tmpSourceDist, tmpSourceDistWebsql, tmpSrcAppDist, tmpSrcAppDistWebsql, tmpSrcDist, tmpSrcDistWebsql, } from '../../../../../constants';
export class AssetsManager extends BaseDebounceCompilerForProject {
    //#region fields & getters
    tmpFolders = [
        tmpSrcDist,
        tmpSrcDistWebsql,
        tmpSrcAppDist,
        tmpSrcAppDistWebsql,
        tmpSourceDist,
        tmpSourceDistWebsql,
    ].reduce((a, b) => {
        return [...a, b, b + prodSuffix];
    }, []);
    currentProjectNodeModulesPath;
    get tmpAllAssetsLinkedInCoreContainerAbsPath() {
        //#region @backendFunc
        const containerCoreBase = this.project.framework.coreContainer.pathFor(tmpAllAssetsLinked);
        return containerCoreBase;
        //#endregion
    }
    //#endregion
    //#region constructor
    constructor(project) {
        super(project, {
            taskName: `AssetsManagerFor${___NS__kebabCase(project.location)}`,
            followSymlinks: true,
            folderPath: [project.pathFor(tmpAllAssetsLinked)],
        });
        this.currentProjectNodeModulesPath = project.pathFor(tmpAllAssetsLinked);
    }
    //#endregion
    //#region copy assets to tmp folders
    copyAssetsToTempFolders(changeOfFiles, asyncAction) {
        //#region @backendFunc
        for (const changeOfFile of changeOfFiles) {
            const [pkgName, relativePathInSharedAssets] = changeOfFile.fileAbsolutePath
                .replace(this.currentProjectNodeModulesPath + '/', '')
                .split(`/${assetsFromSrc}/${sharedFromAssets}/`);
            if (asyncAction) {
                this.tmpFolders
                    .map(tmpFolder => {
                    return crossPlatformPath([
                        this.project.location,
                        tmpFolder,
                        assetsFromNgProj,
                        assetsFor,
                        pkgName,
                        assetsFromNpmPackage,
                        sharedFromAssets,
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
                    if (changeOfFile.eventName === 'unlink' ||
                        changeOfFile.eventName === 'unlinkDir') {
                        try {
                            fse.unlinkSync(dest);
                        }
                        catch (error) { }
                        if (Helpers__NS__exists(dest)) {
                            Helpers__NS__remove(dest, true);
                        }
                    }
                    else {
                        try {
                            HelpersTaon__NS__copyFile(changeOfFile.fileAbsolutePath, dest);
                        }
                        catch (error) {
                            Helpers__NS__warn(`[${config.frameworkName}] Could not copy asset ` +
                                `from ${changeOfFile.fileAbsolutePath} to ${dest}

      Probably you should start clean build
      ${config.frameworkName} build:clean:lib
      ${config.frameworkName} build:clean:watch:lib

                    `);
                        }
                    }
                });
            }
            else {
                if (fse.existsSync(changeOfFile.fileAbsolutePath) &&
                    Helpers__NS__isFolder(fse.realpathSync(changeOfFile.fileAbsolutePath))) {
                    const filesFrom = Helpers__NS__getFilesFrom(fse.realpathSync(changeOfFile.fileAbsolutePath), {
                        followSymlinks: true,
                        recursive: true,
                    });
                    // console.log('files from ', filesFrom);
                    for (const fileAbsPath of filesFrom) {
                        const [first, relative] = fileAbsPath.split('/assets/shared/');
                        const packageName = first.split('/node_modules/').pop();
                        // console.log('relative', relative);
                        // console.log('packageName', packageName);
                        for (const tmpFolder of this.tmpFolders) {
                            HelpersTaon__NS__copyFile(fileAbsPath, crossPlatformPath([
                                this.project.location,
                                tmpFolder,
                                assetsFromSrc,
                                assetsFor,
                                packageName,
                                assetsFromNgProj,
                                sharedFromAssets,
                                relative,
                            ]));
                        }
                    }
                }
            }
        }
        //#endregion
    }
    //#endregion
    //#region action
    async action({ changeOfFiles, asyncEvent, }) {
        if (asyncEvent) {
            // console.log('Async event triggered, skipping action', changeOfFiles);
        }
        else {
            this.linkAssetToJoindedProject();
        }
        this.copyAssetsToTempFolders(changeOfFiles, asyncEvent);
    }
    //#endregion
    //#region link joinded assets
    linkAssetToJoindedProject() {
        //#region @backendFunc
        if (!Helpers__NS__exists(this.tmpAllAssetsLinkedInCoreContainerAbsPath)) {
            Helpers__NS__mkdirp(this.tmpAllAssetsLinkedInCoreContainerAbsPath);
        }
        Helpers__NS__createSymLink(this.tmpAllAssetsLinkedInCoreContainerAbsPath, this.project.pathFor(tmpAllAssetsLinked), {
            continueWhenExistedFolderDoesntExists: true,
        });
        const coreContainerPath = this.project.framework.coreContainer.location;
        this.project.packagesRecognition.allIsomorphicPackagesFromMemory.map(pkgName => {
            this;
            Helpers__NS__createSymLink(crossPlatformPath([
                coreContainerPath,
                nodeModulesMainProject,
                pkgName,
                assetsFromNpmPackage,
                sharedFromAssets,
            ]), crossPlatformPath([
                this.tmpAllAssetsLinkedInCoreContainerAbsPath,
                pkgName,
                'assets/shared',
            ]), {
                continueWhenExistedFolderDoesntExists: true,
            });
        });
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/angular-node-app/tools/assets-manager.js.map