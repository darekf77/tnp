"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactElectronApp = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const app_utils_1 = require("../../../../app-utils");
const constants_1 = require("../../../../constants");
const options_1 = require("../../../../options");
const base_artifact_1 = require("../base-artifact");
//#endregion
class ArtifactElectronApp extends base_artifact_1.BaseArtifact {
    constructor(project) {
        super(project, options_1.ReleaseArtifactTaon.ELECTRON_APP);
    }
    //#region clear partial
    async clearPartial(options) {
        [this.project.pathFor(constants_1.tmpAppsForDistElectron)].forEach(f => {
            lib_3.Helpers.removeSymlinks(f);
            lib_3.Helpers.removeFolderIfExists(f);
        });
    }
    //#endregion
    //#region init partial
    async initPartial(initOptions) {
        if (!initOptions.release.targetArtifact) {
            initOptions.release.targetArtifact = options_1.ReleaseArtifactTaon.ELECTRON_APP;
        }
        const result = await this.artifacts.angularNodeApp.initPartial(initOptions);
        return result;
    }
    //#endregion
    //#region build partial
    async buildPartial(buildOptions) {
        //#region @backendFunc
        const { appDistOutBrowserAngularAbsPath } = await this.artifacts.angularNodeApp.buildPartial(buildOptions.clone({
            build: {
                pwa: {
                    disableServiceWorker: true,
                },
                baseHref: buildOptions.release.releaseType ? `./` : void 0,
            },
            release: {
                targetArtifact: this.currentArtifactName,
            },
        }));
        const proxyProj = this.project.ins.From(lib_2.path.dirname(appDistOutBrowserAngularAbsPath));
        const electronDistOutAppPath = this.project.pathFor([
            `.${lib_1.config.frameworkName}`,
            this.currentArtifactName,
            // 'release',
            `release-${new Date().getTime()}`, // to avoid asar lock in os
            this.project.packageJson.version,
        ]);
        return {
            electronDistOutAppPath,
            proxyProj,
        };
        //#endregion
    }
    //#endregion
    //#region release partial
    async releasePartial(releaseOptions) {
        //#region @backendFunc
        releaseOptions = this.updateResolvedVersion(releaseOptions);
        const projectsReposToPushAndTag = [this.project.location];
        const projectsReposToPush = [];
        const { electronDistOutAppPath, proxyProj } = await this.buildPartial(releaseOptions);
        //#region set native dependencies
        const electronNativeDeps = this.project.taonJson.getNativeDepsFor(options_1.ReleaseArtifactTaon.ELECTRON_APP);
        for (const nativeDepName of electronNativeDeps) {
            const version = this.project.packageJson.dependencies[nativeDepName];
            if (version) {
                lib_3.Helpers.logInfo(`Setting native dependency ${nativeDepName} to version ${version}`);
                lib_3.HelpersTaon.setValueToJSON(proxyProj.pathFor(`${constants_1.electronNgProj}/package.json`), 'dependencies', {
                    [nativeDepName]: this.project.packageJson.dependencies[nativeDepName],
                });
            }
            else {
                lib_3.Helpers.warn(`Native dependency ${nativeDepName} not found in taon package.json dependencies`);
            }
        }
        //#endregion
        //#region bundling backend node_modules
        await lib_3.HelpersTaon.bundleCodeIntoSingleFile(proxyProj.pathFor(`${constants_1.electronNgProj}/main.js`), proxyProj.pathFor(`${constants_1.electronNgProj}/index.js`), {
            prod: releaseOptions.build.prod,
            additionalExternals: [
                ...electronNativeDeps,
                ...this.project.taonJson.additionalExternalsFor(options_1.ReleaseArtifactTaon.ELECTRON_APP),
            ],
            additionalReplaceWithNothing: [
                ...this.project.taonJson.additionalReplaceWithNothingFor(options_1.ReleaseArtifactTaon.ELECTRON_APP),
            ],
            strategy: options_1.ReleaseArtifactTaon.ELECTRON_APP,
        });
        //#endregion
        proxyProj.run(`cd ${constants_1.electronNgProj} && npm install`).sync();
        //#region modify electron-builder.json
        const electronConfigPath = proxyProj.pathFor(`electron-builder.json`);
        const electronConfig = lib_3.Helpers.readJson(electronConfigPath);
        electronConfig.directories.output = electronDistOutAppPath;
        electronConfig.appId =
            releaseOptions.appId ||
                `${releaseOptions.website.domain.split('.').reverse().join('.')}` +
                    `.${this.project.nameForNpmPackage}`;
        electronConfig.productName = this.project.nameForNpmPackage;
        lib_3.Helpers.info(`

      AppId: ${electronConfig.appId}
      ProductName: ${electronConfig.productName}

      `);
        lib_3.Helpers.writeJson(electronConfigPath, electronConfig);
        let electronConfigFile = lib_3.Helpers.readFile(electronConfigPath);
        electronConfigFile = electronConfigFile.replace(new RegExp(lib_2.Utils.escapeStringForRegEx(`${constants_1.assetsFromSrc}/`), 'g'), `${constants_1.distElectronProj}/${constants_1.assetsFromNgProj}/${constants_1.assetsFor}/${this.project.nameForNpmPackage}/${constants_1.assetsFromNpmLib}/`);
        lib_3.Helpers.writeFile(electronConfigPath, electronConfigFile);
        //#endregion
        //#region Copy wasm file
        const wasmfileSource = (0, lib_2.crossPlatformPath)([
            this.project.ins
                .by(lib_1.LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion)
                .pathFor([
                (0, app_utils_1.templateFolderForArtifact)(options_1.ReleaseArtifactTaon.ELECTRON_APP),
                constants_1.srcNgProxyProject,
                constants_1.assetsFromNgProj,
                constants_1.CoreAssets.sqlWasmFile,
            ]),
        ]);
        const wasmfileDest = (0, lib_2.crossPlatformPath)([
            proxyProj.location,
            constants_1.electronNgProj,
            constants_1.CoreAssets.sqlWasmFile,
        ]);
        lib_3.HelpersTaon.copyFile(wasmfileSource, wasmfileDest);
        //#endregion
        //#region modify index.html
        const indexHtmlPath = proxyProj.pathFor([
            constants_1.distElectronProj,
            constants_1.BundledFiles.INDEX_HTML,
        ]);
        lib_3.Helpers.writeFile(indexHtmlPath, lib_3.Helpers.readFile(indexHtmlPath));
        // Helpers.replaceLinesInFile(indexHtmlPath, line => {
        //   if (line.search(`rel="manifest"`) !== -1) {
        //     return '';
        //   }
        //   return line;
        // });
        //#endregion
        //#region modify package.json
        const electronPackageJson = proxyProj.pathFor(constants_1.packageJsonNgProject);
        const electronPackageJsonContent = lib_3.Helpers.readJson(electronPackageJson);
        electronPackageJsonContent.dependencies = {};
        electronPackageJsonContent.devDependencies =
            this.project.packageJson.dependencies || {};
        lib_3.Helpers.writeJson(electronPackageJson, electronPackageJsonContent);
        //#endregion
        proxyProj.run(`npm-run electron-builder build --publish=never`).sync();
        // proxyProj.run(`npm-run electron-forge package`).sync();
        // process.exit(0);
        let releaseProjPath;
        if (releaseOptions.release.releaseType === options_1.ReleaseType.LOCAL) {
            //#region local release
            const releaseData = await this.localReleaseDeploy(electronDistOutAppPath, releaseOptions, {
                copyOnlyExtensions: ['.zip'],
                distinctArchitecturePrefix: { platform: process.platform },
            });
            projectsReposToPushAndTag.push(...releaseData.projectsReposToPushAndTag);
            releaseProjPath = releaseData.releaseProjPath;
            //#endregion
        }
        if (releaseOptions.release.releaseType === options_1.ReleaseType.STATIC_PAGES) {
            //#region static pages release
            const releaseData = await this.staticPagesDeploy(electronDistOutAppPath, releaseOptions, {
                copyOnlyExtensions: ['.zip'],
                distinctArchitecturePrefix: { platform: process.platform },
            });
            projectsReposToPush.push(...releaseData.projectsReposToPush);
            releaseProjPath = releaseData.releaseProjPath;
            //#endregion
        }
        projectsReposToPushAndTag.push(electronDistOutAppPath);
        return {
            resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
            projectsReposToPushAndTag,
            projectsReposToPush,
            releaseProjPath,
            releaseType: releaseOptions.release.releaseType,
        };
        //#endregion
    }
}
exports.ArtifactElectronApp = ArtifactElectronApp;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/electron-app/artifact-electron-app.js.map