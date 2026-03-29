"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactVscodePlugin = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const constants_1 = require("../../../../constants");
const options_1 = require("../../../../options");
const base_artifact_1 = require("../base-artifact");
//#endregion
class ArtifactVscodePlugin extends base_artifact_1.BaseArtifact {
    constructor(project) {
        super(project, options_1.ReleaseArtifactTaon.VSCODE_PLUGIN);
    }
    //#region clear partial
    async clearPartial(clearOption) {
        [this.project.pathFor(constants_1.tmpVscodeProj)].forEach(f => {
            lib_3.Helpers.removeSymlinks(f);
            lib_3.Helpers.removeFolderIfExists(f);
        });
    }
    //#endregion
    //#region init partial
    async initPartial(initOptions) {
        //#region @backendFunc
        if (!initOptions.release.targetArtifact) {
            initOptions.release.targetArtifact = options_1.ReleaseArtifactTaon.VSCODE_PLUGIN;
        }
        if (!this.project.framework.isStandaloneProject) {
            return initOptions;
        }
        const tmpVscodeProjPath = this.getTmpVscodeProjPath(initOptions);
        const packageJsonForVscode = {
            name: this.project.name,
            version: initOptions.release.resolvedNewVersion ||
                this.project.packageJson.version,
            main: `./out/${initOptions.release.releaseType ? 'extension.js' : 'app.vscode.js'}`,
            categories: ['Other'],
            activationEvents: ['*'],
            displayName: this.project.packageJson.displayName ||
                `${this.project.name}-vscode-ext`,
            publisher: this.project.packageJson.publisher || 'taon-dev-local',
            icon: `${constants_1.iconVscode128Basename}`,
            description: this.project.packageJson.description ||
                `Description of ${this.project.nameForNpmPackage} extension`,
            license: this.project.packageJson.license || constants_1.defaultLicenseVscodePlugin,
            engines: {
                /**
                 * ! TODO increase this !!!
                 */
                vscode: '^1.30.0',
            },
            repository: this.project.packageJson.repository || {
                url: this.project.git.remoteOriginUrl,
                type: 'git',
            },
        };
        // will be done by update-vscode-package-json.js
        if (this.project.taonJson.overridePackageJsonManager.contributes) {
            packageJsonForVscode['contributes'] =
                this.project.taonJson.overridePackageJsonManager.contributes;
        }
        lib_3.Helpers.writeJson((0, lib_2.crossPlatformPath)([tmpVscodeProjPath, constants_1.packageJsonVscodePlugin]), packageJsonForVscode);
        for (const resourceRelative of this.project.taonJson.resources) {
            lib_3.HelpersTaon.copyFile(this.project.pathFor(resourceRelative), (0, lib_2.crossPlatformPath)([tmpVscodeProjPath, resourceRelative]));
        }
        lib_3.Helpers.createSymLink(this.project.pathFor(
        // use dist-prod if prod mode
        constants_1.distMainProject + (initOptions.build.prod ? constants_1.prodSuffix : '')), (0, lib_2.crossPlatformPath)([
            tmpVscodeProjPath,
            initOptions.release.releaseType ? constants_1.distVscodeProj : constants_1.outVscodeProj,
        ]), { tryRemoveDesPath: true, continueWhenExistedFolderDoesntExists: true });
        lib_3.Helpers.createSymLink(this.project.pathFor(constants_1.nodeModulesMainProject), (0, lib_2.crossPlatformPath)([tmpVscodeProjPath, constants_1.nodeModulesMainProject]), { tryRemoveDesPath: true, continueWhenExistedFolderDoesntExists: true });
        lib_3.Helpers.createSymLink(this.project.pathFor(constants_1.updateVscodePackageJsonJsMainProject), (0, lib_2.crossPlatformPath)([
            tmpVscodeProjPath,
            constants_1.updateVscodePackageJsonJsMainProject,
        ]), { tryRemoveDesPath: true, continueWhenExistedFolderDoesntExists: true });
        //#region recreate app.vscode.js
        const relativeAppVscodeJsPath = (0, lib_2.crossPlatformPath)(`${constants_1.srcMainProject}/${constants_1.appVscodeTsFromSrc}`);
        if (!this.project.hasFile(relativeAppVscodeJsPath)) {
            const coreName = lib_2._.upperFirst(lib_2._.camelCase(this.project.name));
            const coreNameKebab = lib_2._.kebabCase(this.project.name);
            const contentOrgVscode = this.project.framework.coreProject.readFile(`${constants_1.srcMainProject}/${constants_1.appVscodeTsFromSrc}`);
            this.project.writeFile(relativeAppVscodeJsPath, contentOrgVscode
                .replace(new RegExp(`IsomorphicLibV${this.project.framework.frameworkVersion.replace('v', '')}`, 'g'), `${coreName}`)
                .replace(new RegExp(`isomorphic-lib-v${this.project.framework.frameworkVersion.replace('v', '')}`, 'g'), `${coreNameKebab}`));
        }
        //#endregion
        return initOptions;
        //#endregion
    }
    //#endregion
    //#region build partial
    async buildPartial(buildOptions) {
        //#region @backendFunc
        buildOptions = await this.project.artifactsManager.init(buildOptions.clone());
        const shouldSkipBuild = this.shouldSkipBuild(buildOptions);
        const tmpVscodeProjPath = this.getTmpVscodeProjPath(buildOptions);
        const extProj = this.project.ins.From(tmpVscodeProjPath);
        const vscodeVsixOutPath = extProj.pathFor(this.extensionVsixNameFrom(buildOptions));
        const destExtensionJs = this.getDestExtensionJs(buildOptions);
        if (buildOptions.build.watch) {
            // NOTHING TO DO HERE
            // extProj
            //   .run(
            //     `node ${this.vcodeProjectUpdatePackageJsonFilename} ` +
            //       ` ${!buildOptions.releaseType ? 'app.vscode' : ''} ` +
            //       ` ${buildOptions.watch ? '--watch' : ''}`,
            //   )
            //   .async();
        }
        else {
            if (buildOptions.release.releaseType) {
                await this.project.artifactsManager.globalHelper.branding.generateLogoFroVscodeLocations();
                if (!shouldSkipBuild) {
                    await lib_3.HelpersTaon.bundleCodeIntoSingleFile((0, lib_2.crossPlatformPath)([
                        tmpVscodeProjPath,
                        constants_1.distMainProject,
                        constants_1.appVscodeJSFromBuild,
                    ]), destExtensionJs, {
                        prod: buildOptions.build.prod,
                        strategy: 'vscode-ext',
                        additionalExternals: [
                            ...this.project.taonJson.additionalExternalsFor(options_1.ReleaseArtifactTaon.VSCODE_PLUGIN),
                        ],
                        additionalReplaceWithNothing: [
                            ...this.project.taonJson.additionalReplaceWithNothingFor(options_1.ReleaseArtifactTaon.VSCODE_PLUGIN),
                        ],
                    });
                }
            }
            if (!shouldSkipBuild) {
                lib_1.UtilsFilesFoldersSync.getFilesFrom(extProj.location)
                    .filter(f => lib_2.path.extname(f) === '.vsix')
                    .forEach(f => lib_3.Helpers.removeFileIfExists(f));
                extProj
                    .run(`node ${constants_1.updateVscodePackageJsonJsMainProject} ` +
                    `${!buildOptions.release.releaseType ? constants_1.appVscodeJSFromBuild.replace('.js', '') : ''} `)
                    .sync();
            }
        }
        if (!buildOptions.build.watch && buildOptions.release.releaseType) {
            try {
                const args = [
                    ...(this.project.taonJson.baseContentUrl
                        ? [`--baseContentUrl "${this.project.taonJson.baseContentUrl}"`]
                        : []),
                    ...(this.project.taonJson.baseImagesUrl
                        ? [`--baseImagesUrl "${this.project.taonJson.baseImagesUrl}"`]
                        : []),
                ];
                extProj.run(`taon-vsce package ${args.join(' ')}`).sync();
            }
            catch (error) {
                throw 'Problem with vscode package metadata';
            }
        }
        return { vscodeVsixOutPath };
        //#endregion
    }
    //#endregion
    //#region release partial
    async releasePartial(releaseOptions) {
        //#region @backendFunc
        let releaseProjPath;
        let releaseType = releaseOptions.release.releaseType;
        releaseOptions = this.updateResolvedVersion(releaseOptions);
        let projectsReposToPushAndTag = [this.project.location];
        let projectsReposToPush = [];
        const { vscodeVsixOutPath } = await this.buildPartial(releaseOptions.clone({
            build: {
                watch: false,
            },
        }));
        if (releaseOptions.release.releaseType === options_1.ReleaseType.LOCAL) {
            //#region local release
            const releaseData = await this.localReleaseDeploy(lib_2.path.dirname(vscodeVsixOutPath), releaseOptions, {
                copyOnlyExtensions: ['.vsix'],
                createReadme: `# Installation

Right click on the file **${lib_2.path.basename(this.extensionVsixNameFrom(releaseOptions))}**
and select "Install Extension VSIX" to install it in your
local VSCode instance.

`,
            });
            projectsReposToPushAndTag.push(...releaseData.projectsReposToPushAndTag);
            releaseProjPath = releaseData.releaseProjPath;
            //#endregion
        }
        if (releaseOptions.release.releaseType === options_1.ReleaseType.STATIC_PAGES) {
            //#region local release
            const releaseData = await this.staticPagesDeploy(lib_2.path.dirname(vscodeVsixOutPath), releaseOptions, {
                copyOnlyExtensions: ['.vsix'],
            });
            projectsReposToPush.push(...releaseData.projectsReposToPush);
            releaseProjPath = releaseData.releaseProjPath;
            //#endregion
        }
        if (releaseOptions.release.releaseType === options_1.ReleaseType.MANUAL) {
            // TODO release to microsoft store or serve with place to put assets
        }
        if (releaseOptions.release.releaseType === options_1.ReleaseType.CLOUD) {
            // TODO trigger cloud release (it will actually be manual on remote server)
        }
        if (releaseOptions.release.installLocally) {
            await this.installLocally(vscodeVsixOutPath);
        }
        if (releaseOptions.release.removeReleaseOutputAfterLocalInstall) {
            lib_3.Helpers.removeFolderIfExists(releaseProjPath);
        }
        return {
            resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
            releaseProjPath,
            releaseType,
            projectsReposToPushAndTag,
            projectsReposToPush,
        };
        //#endregion
    }
    //#endregion
    //#region private methods
    //#region private methods / get tmp vscode proj path (for any build)
    getTmpVscodeProjPath(envOptions) {
        const tmpVscodeProjPath = this.project.pathFor(`${constants_1.tmpVscodeProj}/${envOptions?.release?.releaseType
            ? envOptions.release.releaseType
            : options_1.Development}${envOptions?.build?.prod ? constants_1.prodSuffix : ''}/${this.project.name}`);
        return tmpVscodeProjPath;
    }
    //#endregion
    //#region private methods / get dest extension js
    getDestExtensionJs(envOptions) {
        const tmpVscodeProjPath = this.getTmpVscodeProjPath(envOptions);
        const res = (0, lib_2.crossPlatformPath)([tmpVscodeProjPath, 'out/extension.js']);
        return res;
    }
    //#endregion
    //#region private methods / extension vsix name
    extensionVsixNameFrom(initOptions) {
        return `${this.project.name}-${initOptions.release.resolvedNewVersion || this.project.packageJson.version}.vsix`;
    }
    //#endregion
    //#region private methods / install locally
    /**
     * TODO move this to local release
     */
    async installLocally(pathToVsixFile) {
        //#region @backendFunc
        lib_3.Helpers.info(`Installing extension: ${lib_2.path.basename(pathToVsixFile)} ` +
            `with creation date: ${lib_2.fse.lstatSync(pathToVsixFile).birthtime}...`);
        const editor = await this.project.ins.editor();
        lib_3.Helpers.run(`${editor} --install-extension ${lib_2.path.basename(pathToVsixFile)}`, {
            cwd: (0, lib_2.crossPlatformPath)(lib_2.path.dirname(pathToVsixFile)),
        }).sync();
        //#endregion
    }
}
exports.ArtifactVscodePlugin = ArtifactVscodePlugin;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/vscode-plugin/artifact-vscode-plugin.js.map