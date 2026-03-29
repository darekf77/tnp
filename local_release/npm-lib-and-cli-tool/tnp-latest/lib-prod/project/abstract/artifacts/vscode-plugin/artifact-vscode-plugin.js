//#region imports
import { UtilsFilesFoldersSync__NS__getFilesFrom } from 'tnp-core/lib-prod';
import { crossPlatformPath, fse, path, ___NS__camelCase, ___NS__kebabCase, ___NS__upperFirst } from 'tnp-core/lib-prod';
import { Helpers__NS__createSymLink, Helpers__NS__info, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeSymlinks, Helpers__NS__run, Helpers__NS__writeJson, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__copyFile } from 'tnp-helpers/lib-prod';
import { appVscodeJSFromBuild, appVscodeTsFromSrc, defaultLicenseVscodePlugin, distMainProject, distVscodeProj, iconVscode128Basename, nodeModulesMainProject, outVscodeProj, packageJsonVscodePlugin, prodSuffix, srcMainProject, tmpVscodeProj, updateVscodePackageJsonJsMainProject, } from '../../../../constants';
import { ReleaseType, Development, ReleaseArtifactTaon, } from '../../../../options';
import { BaseArtifact } from '../base-artifact';
//#endregion
export class ArtifactVscodePlugin extends BaseArtifact {
    constructor(project) {
        super(project, ReleaseArtifactTaon.VSCODE_PLUGIN);
    }
    //#region clear partial
    async clearPartial(clearOption) {
        [this.project.pathFor(tmpVscodeProj)].forEach(f => {
            Helpers__NS__removeSymlinks(f);
            Helpers__NS__removeFolderIfExists(f);
        });
    }
    //#endregion
    //#region init partial
    async initPartial(initOptions) {
        //#region @backendFunc
        if (!initOptions.release.targetArtifact) {
            initOptions.release.targetArtifact = ReleaseArtifactTaon.VSCODE_PLUGIN;
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
            icon: `${iconVscode128Basename}`,
            description: this.project.packageJson.description ||
                `Description of ${this.project.nameForNpmPackage} extension`,
            license: this.project.packageJson.license || defaultLicenseVscodePlugin,
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
        Helpers__NS__writeJson(crossPlatformPath([tmpVscodeProjPath, packageJsonVscodePlugin]), packageJsonForVscode);
        for (const resourceRelative of this.project.taonJson.resources) {
            HelpersTaon__NS__copyFile(this.project.pathFor(resourceRelative), crossPlatformPath([tmpVscodeProjPath, resourceRelative]));
        }
        Helpers__NS__createSymLink(this.project.pathFor(
        // use dist-prod if prod mode
        distMainProject + (initOptions.build.prod ? prodSuffix : '')), crossPlatformPath([
            tmpVscodeProjPath,
            initOptions.release.releaseType ? distVscodeProj : outVscodeProj,
        ]), { tryRemoveDesPath: true, continueWhenExistedFolderDoesntExists: true });
        Helpers__NS__createSymLink(this.project.pathFor(nodeModulesMainProject), crossPlatformPath([tmpVscodeProjPath, nodeModulesMainProject]), { tryRemoveDesPath: true, continueWhenExistedFolderDoesntExists: true });
        Helpers__NS__createSymLink(this.project.pathFor(updateVscodePackageJsonJsMainProject), crossPlatformPath([
            tmpVscodeProjPath,
            updateVscodePackageJsonJsMainProject,
        ]), { tryRemoveDesPath: true, continueWhenExistedFolderDoesntExists: true });
        //#region recreate app.vscode.js
        const relativeAppVscodeJsPath = crossPlatformPath(`${srcMainProject}/${appVscodeTsFromSrc}`);
        if (!this.project.hasFile(relativeAppVscodeJsPath)) {
            const coreName = ___NS__upperFirst(___NS__camelCase(this.project.name));
            const coreNameKebab = ___NS__kebabCase(this.project.name);
            const contentOrgVscode = this.project.framework.coreProject.readFile(`${srcMainProject}/${appVscodeTsFromSrc}`);
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
                    await HelpersTaon__NS__bundleCodeIntoSingleFile(crossPlatformPath([
                        tmpVscodeProjPath,
                        distMainProject,
                        appVscodeJSFromBuild,
                    ]), destExtensionJs, {
                        prod: buildOptions.build.prod,
                        strategy: 'vscode-ext',
                        additionalExternals: [
                            ...this.project.taonJson.additionalExternalsFor(ReleaseArtifactTaon.VSCODE_PLUGIN),
                        ],
                        additionalReplaceWithNothing: [
                            ...this.project.taonJson.additionalReplaceWithNothingFor(ReleaseArtifactTaon.VSCODE_PLUGIN),
                        ],
                    });
                }
            }
            if (!shouldSkipBuild) {
                UtilsFilesFoldersSync__NS__getFilesFrom(extProj.location)
                    .filter(f => path.extname(f) === '.vsix')
                    .forEach(f => Helpers__NS__removeFileIfExists(f));
                extProj
                    .run(`node ${updateVscodePackageJsonJsMainProject} ` +
                    `${!buildOptions.release.releaseType ? appVscodeJSFromBuild.replace('.js', '') : ''} `)
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
        if (releaseOptions.release.releaseType === ReleaseType.LOCAL) {
            //#region local release
            const releaseData = await this.localReleaseDeploy(path.dirname(vscodeVsixOutPath), releaseOptions, {
                copyOnlyExtensions: ['.vsix'],
                createReadme: `# Installation

Right click on the file **${path.basename(this.extensionVsixNameFrom(releaseOptions))}**
and select "Install Extension VSIX" to install it in your
local VSCode instance.

`,
            });
            projectsReposToPushAndTag.push(...releaseData.projectsReposToPushAndTag);
            releaseProjPath = releaseData.releaseProjPath;
            //#endregion
        }
        if (releaseOptions.release.releaseType === ReleaseType.STATIC_PAGES) {
            //#region local release
            const releaseData = await this.staticPagesDeploy(path.dirname(vscodeVsixOutPath), releaseOptions, {
                copyOnlyExtensions: ['.vsix'],
            });
            projectsReposToPush.push(...releaseData.projectsReposToPush);
            releaseProjPath = releaseData.releaseProjPath;
            //#endregion
        }
        if (releaseOptions.release.releaseType === ReleaseType.MANUAL) {
            // TODO release to microsoft store or serve with place to put assets
        }
        if (releaseOptions.release.releaseType === ReleaseType.CLOUD) {
            // TODO trigger cloud release (it will actually be manual on remote server)
        }
        if (releaseOptions.release.installLocally) {
            await this.installLocally(vscodeVsixOutPath);
        }
        if (releaseOptions.release.removeReleaseOutputAfterLocalInstall) {
            Helpers__NS__removeFolderIfExists(releaseProjPath);
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
        const tmpVscodeProjPath = this.project.pathFor(`${tmpVscodeProj}/${envOptions?.release?.releaseType
            ? envOptions.release.releaseType
            : Development}${envOptions?.build?.prod ? prodSuffix : ''}/${this.project.name}`);
        return tmpVscodeProjPath;
    }
    //#endregion
    //#region private methods / get dest extension js
    getDestExtensionJs(envOptions) {
        const tmpVscodeProjPath = this.getTmpVscodeProjPath(envOptions);
        const res = crossPlatformPath([tmpVscodeProjPath, 'out/extension.js']);
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
        Helpers__NS__info(`Installing extension: ${path.basename(pathToVsixFile)} ` +
            `with creation date: ${fse.lstatSync(pathToVsixFile).birthtime}...`);
        const editor = await this.project.ins.editor();
        Helpers__NS__run(`${editor} --install-extension ${path.basename(pathToVsixFile)}`, {
            cwd: crossPlatformPath(path.dirname(pathToVsixFile)),
        }).sync();
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/vscode-plugin/artifact-vscode-plugin.js.map