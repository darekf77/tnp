import { config, LibTypeEnum } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, Utils__NS__escapeStringForRegEx } from 'tnp-core/lib-prod';
import { Helpers__NS__info, Helpers__NS__logInfo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__removeFolderIfExists, Helpers__NS__removeSymlinks, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__copyFile, HelpersTaon__NS__setValueToJSON } from 'tnp-helpers/lib-prod';
import { templateFolderForArtifact } from '../../../../app-utils';
import { assetsFor, assetsFromNgProj, assetsFromNpmLib, assetsFromSrc, BundledFiles, CoreAssets, distElectronProj, electronNgProj, packageJsonNgProject, srcNgProxyProject, tmpAppsForDistElectron, } from '../../../../constants';
import { ReleaseArtifactTaon, ReleaseType, } from '../../../../options';
import { BaseArtifact } from '../base-artifact';
//#endregion
export class ArtifactElectronApp extends BaseArtifact {
    constructor(project) {
        super(project, ReleaseArtifactTaon.ELECTRON_APP);
    }
    //#region clear partial
    async clearPartial(options) {
        [this.project.pathFor(tmpAppsForDistElectron)].forEach(f => {
            Helpers__NS__removeSymlinks(f);
            Helpers__NS__removeFolderIfExists(f);
        });
    }
    //#endregion
    //#region init partial
    async initPartial(initOptions) {
        if (!initOptions.release.targetArtifact) {
            initOptions.release.targetArtifact = ReleaseArtifactTaon.ELECTRON_APP;
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
        const proxyProj = this.project.ins.From(path.dirname(appDistOutBrowserAngularAbsPath));
        const electronDistOutAppPath = this.project.pathFor([
            `.${config.frameworkName}`,
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
        const electronNativeDeps = this.project.taonJson.getNativeDepsFor(ReleaseArtifactTaon.ELECTRON_APP);
        for (const nativeDepName of electronNativeDeps) {
            const version = this.project.packageJson.dependencies[nativeDepName];
            if (version) {
                Helpers__NS__logInfo(`Setting native dependency ${nativeDepName} to version ${version}`);
                HelpersTaon__NS__setValueToJSON(proxyProj.pathFor(`${electronNgProj}/package.json`), 'dependencies', {
                    [nativeDepName]: this.project.packageJson.dependencies[nativeDepName],
                });
            }
            else {
                Helpers__NS__warn(`Native dependency ${nativeDepName} not found in taon package.json dependencies`);
            }
        }
        //#endregion
        //#region bundling backend node_modules
        await HelpersTaon__NS__bundleCodeIntoSingleFile(proxyProj.pathFor(`${electronNgProj}/main.js`), proxyProj.pathFor(`${electronNgProj}/index.js`), {
            prod: releaseOptions.build.prod,
            additionalExternals: [
                ...electronNativeDeps,
                ...this.project.taonJson.additionalExternalsFor(ReleaseArtifactTaon.ELECTRON_APP),
            ],
            additionalReplaceWithNothing: [
                ...this.project.taonJson.additionalReplaceWithNothingFor(ReleaseArtifactTaon.ELECTRON_APP),
            ],
            strategy: ReleaseArtifactTaon.ELECTRON_APP,
        });
        //#endregion
        proxyProj.run(`cd ${electronNgProj} && npm install`).sync();
        //#region modify electron-builder.json
        const electronConfigPath = proxyProj.pathFor(`electron-builder.json`);
        const electronConfig = Helpers__NS__readJson(electronConfigPath);
        electronConfig.directories.output = electronDistOutAppPath;
        electronConfig.appId =
            releaseOptions.appId ||
                `${releaseOptions.website.domain.split('.').reverse().join('.')}` +
                    `.${this.project.nameForNpmPackage}`;
        electronConfig.productName = this.project.nameForNpmPackage;
        Helpers__NS__info(`

      AppId: ${electronConfig.appId}
      ProductName: ${electronConfig.productName}

      `);
        Helpers__NS__writeJson(electronConfigPath, electronConfig);
        let electronConfigFile = Helpers__NS__readFile(electronConfigPath);
        electronConfigFile = electronConfigFile.replace(new RegExp(Utils__NS__escapeStringForRegEx(`${assetsFromSrc}/`), 'g'), `${distElectronProj}/${assetsFromNgProj}/${assetsFor}/${this.project.nameForNpmPackage}/${assetsFromNpmLib}/`);
        Helpers__NS__writeFile(electronConfigPath, electronConfigFile);
        //#endregion
        //#region Copy wasm file
        const wasmfileSource = crossPlatformPath([
            this.project.ins
                .by(LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion)
                .pathFor([
                templateFolderForArtifact(ReleaseArtifactTaon.ELECTRON_APP),
                srcNgProxyProject,
                assetsFromNgProj,
                CoreAssets.sqlWasmFile,
            ]),
        ]);
        const wasmfileDest = crossPlatformPath([
            proxyProj.location,
            electronNgProj,
            CoreAssets.sqlWasmFile,
        ]);
        HelpersTaon__NS__copyFile(wasmfileSource, wasmfileDest);
        //#endregion
        //#region modify index.html
        const indexHtmlPath = proxyProj.pathFor([
            distElectronProj,
            BundledFiles.INDEX_HTML,
        ]);
        Helpers__NS__writeFile(indexHtmlPath, Helpers__NS__readFile(indexHtmlPath));
        // Helpers__NS__replaceLinesInFile(indexHtmlPath, line => {
        //   if (line.search(`rel="manifest"`) !== -1) {
        //     return '';
        //   }
        //   return line;
        // });
        //#endregion
        //#region modify package.json
        const electronPackageJson = proxyProj.pathFor(packageJsonNgProject);
        const electronPackageJsonContent = Helpers__NS__readJson(electronPackageJson);
        electronPackageJsonContent.dependencies = {};
        electronPackageJsonContent.devDependencies =
            this.project.packageJson.dependencies || {};
        Helpers__NS__writeJson(electronPackageJson, electronPackageJsonContent);
        //#endregion
        proxyProj.run(`npm-run electron-builder build --publish=never`).sync();
        // proxyProj.run(`npm-run electron-forge package`).sync();
        // process.exit(0);
        let releaseProjPath;
        if (releaseOptions.release.releaseType === ReleaseType.LOCAL) {
            //#region local release
            const releaseData = await this.localReleaseDeploy(electronDistOutAppPath, releaseOptions, {
                copyOnlyExtensions: ['.zip'],
                distinctArchitecturePrefix: { platform: process.platform },
            });
            projectsReposToPushAndTag.push(...releaseData.projectsReposToPushAndTag);
            releaseProjPath = releaseData.releaseProjPath;
            //#endregion
        }
        if (releaseOptions.release.releaseType === ReleaseType.STATIC_PAGES) {
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/electron-app/artifact-electron-app.js.map