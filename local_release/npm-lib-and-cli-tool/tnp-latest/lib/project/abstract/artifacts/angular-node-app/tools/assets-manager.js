"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsManager = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const lib_5 = require("tnp-helpers/lib");
const constants_1 = require("../../../../../constants");
class AssetsManager extends lib_5.BaseDebounceCompilerForProject {
    //#region fields & getters
    tmpFolders = [
        constants_1.tmpSrcDist,
        constants_1.tmpSrcDistWebsql,
        constants_1.tmpSrcAppDist,
        constants_1.tmpSrcAppDistWebsql,
        constants_1.tmpSourceDist,
        constants_1.tmpSourceDistWebsql,
    ].reduce((a, b) => {
        return [...a, b, b + constants_1.prodSuffix];
    }, []);
    currentProjectNodeModulesPath;
    get tmpAllAssetsLinkedInCoreContainerAbsPath() {
        //#region @backendFunc
        const containerCoreBase = this.project.framework.coreContainer.pathFor(constants_1.tmpAllAssetsLinked);
        return containerCoreBase;
        //#endregion
    }
    //#endregion
    //#region constructor
    constructor(project) {
        super(project, {
            taskName: `AssetsManagerFor${lib_3._.kebabCase(project.location)}`,
            followSymlinks: true,
            folderPath: [project.pathFor(constants_1.tmpAllAssetsLinked)],
        });
        this.currentProjectNodeModulesPath = project.pathFor(constants_1.tmpAllAssetsLinked);
    }
    //#endregion
    //#region copy assets to tmp folders
    copyAssetsToTempFolders(changeOfFiles, asyncAction) {
        //#region @backendFunc
        for (const changeOfFile of changeOfFiles) {
            const [pkgName, relativePathInSharedAssets] = changeOfFile.fileAbsolutePath
                .replace(this.currentProjectNodeModulesPath + '/', '')
                .split(`/${constants_1.assetsFromSrc}/${constants_1.sharedFromAssets}/`);
            if (asyncAction) {
                this.tmpFolders
                    .map(tmpFolder => {
                    return (0, lib_2.crossPlatformPath)([
                        this.project.location,
                        tmpFolder,
                        constants_1.assetsFromNgProj,
                        constants_1.assetsFor,
                        pkgName,
                        constants_1.assetsFromNpmPackage,
                        constants_1.sharedFromAssets,
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
                            lib_2.fse.unlinkSync(dest);
                        }
                        catch (error) { }
                        if (lib_4.Helpers.exists(dest)) {
                            lib_4.Helpers.remove(dest, true);
                        }
                    }
                    else {
                        try {
                            lib_4.HelpersTaon.copyFile(changeOfFile.fileAbsolutePath, dest);
                        }
                        catch (error) {
                            lib_4.Helpers.warn(`[${lib_1.config.frameworkName}] Could not copy asset ` +
                                `from ${changeOfFile.fileAbsolutePath} to ${dest}

      Probably you should start clean build
      ${lib_1.config.frameworkName} build:clean:lib
      ${lib_1.config.frameworkName} build:clean:watch:lib

                    `);
                        }
                    }
                });
            }
            else {
                if (lib_2.fse.existsSync(changeOfFile.fileAbsolutePath) &&
                    lib_4.Helpers.isFolder(lib_2.fse.realpathSync(changeOfFile.fileAbsolutePath))) {
                    const filesFrom = lib_4.Helpers.getFilesFrom(lib_2.fse.realpathSync(changeOfFile.fileAbsolutePath), {
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
                            lib_4.HelpersTaon.copyFile(fileAbsPath, (0, lib_2.crossPlatformPath)([
                                this.project.location,
                                tmpFolder,
                                constants_1.assetsFromSrc,
                                constants_1.assetsFor,
                                packageName,
                                constants_1.assetsFromNgProj,
                                constants_1.sharedFromAssets,
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
        if (!lib_4.Helpers.exists(this.tmpAllAssetsLinkedInCoreContainerAbsPath)) {
            lib_4.Helpers.mkdirp(this.tmpAllAssetsLinkedInCoreContainerAbsPath);
        }
        lib_4.Helpers.createSymLink(this.tmpAllAssetsLinkedInCoreContainerAbsPath, this.project.pathFor(constants_1.tmpAllAssetsLinked), {
            continueWhenExistedFolderDoesntExists: true,
        });
        const coreContainerPath = this.project.framework.coreContainer.location;
        this.project.packagesRecognition.allIsomorphicPackagesFromMemory.map(pkgName => {
            this;
            lib_4.Helpers.createSymLink((0, lib_2.crossPlatformPath)([
                coreContainerPath,
                constants_1.nodeModulesMainProject,
                pkgName,
                constants_1.assetsFromNpmPackage,
                constants_1.sharedFromAssets,
            ]), (0, lib_2.crossPlatformPath)([
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
exports.AssetsManager = AssetsManager;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/angular-node-app/tools/assets-manager.js.map