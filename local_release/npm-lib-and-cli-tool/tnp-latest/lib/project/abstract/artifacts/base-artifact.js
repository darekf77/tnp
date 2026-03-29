"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseArtifact = void 0;
//#region imports
const lib_1 = require("isomorphic-region-loader/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-helpers/lib");
const constants_1 = require("../../../constants");
//#endregion
class BaseArtifact {
    project;
    currentArtifactName;
    constructor(project, currentArtifactName) {
        this.project = project;
        this.currentArtifactName = currentArtifactName;
    }
    artifacts;
    globalHelper;
    //#endregion
    //#region update resolved version
    updateResolvedVersion(releaseOptions) {
        // @ts-ignore
        releaseOptions.release.resolvedNewVersion =
            this.project.packageJson.resolvePossibleNewVersion(releaseOptions.release.releaseVersionBumpType);
        this.project.packageJson.setVersion(releaseOptions.release.resolvedNewVersion);
        return releaseOptions;
    }
    //#endregion
    //#region should skip  build
    shouldSkipBuild(releaseOptions) {
        if (lib_3._.isBoolean(releaseOptions.release.skipBuildingArtifacts)) {
            return releaseOptions.release.skipBuildingArtifacts;
        }
        if (lib_3._.isArray(releaseOptions.release.skipBuildingArtifacts)) {
            return (releaseOptions.release.skipBuildingArtifacts.includes(this.currentArtifactName) ||
                releaseOptions.release.skipBuildingArtifacts.includes(releaseOptions.release.targetArtifact));
        }
        return false;
    }
    //#endregion
    //#region private methods / get static pages cloned project location
    async getStaticPagesClonedProjectLocation(releaseOptions) {
        //#region @backendFunc
        const staticPagesRepoBranch = `${releaseOptions.release.envName + (releaseOptions.release.envNumber || '')}-${releaseOptions.release.releaseType}-${this.currentArtifactName}`;
        const repoRoot = this.project.pathFor([
            `.${lib_2.config.frameworkName}`,
            this.currentArtifactName,
        ]);
        const repoName = `repo-${this.project.name}-for-${releaseOptions.release.releaseType}--env-${releaseOptions.release.envName}${releaseOptions.release.envNumber || ''}`;
        const repoPath = (0, lib_3.crossPlatformPath)([repoRoot, repoName]);
        const repoUrl = releaseOptions.release.staticPagesCustomRepoUrl
            ? releaseOptions.release.staticPagesCustomRepoUrl
            : this.project.git.remoteOriginUrl;
        if (!lib_5.Helpers.exists(repoPath)) {
            lib_5.Helpers.mkdirp(repoRoot);
            await lib_5.HelpersTaon.git.clone({
                cwd: repoRoot,
                url: repoUrl,
                override: true,
                destinationFolderName: repoName,
            });
        }
        lib_5.HelpersTaon.git.resetHard(repoPath);
        lib_5.HelpersTaon.git.checkout(repoPath, staticPagesRepoBranch, {
            createBranchIfNotExists: true,
            fetchBeforeCheckout: true,
            switchBranchWhenExists: true,
        });
        return repoPath;
        //#endregion
    }
    //#endregion
    //#region getters & methods / all resources
    get __allResources() {
        //#region @backendFunc
        const res = [
            constants_1.packageJsonMainProject,
            constants_1.tsconfigJsonMainProject,
            constants_1.tsconfigJsonBrowserMainProject,
            constants_1.tsconfigJsonIsomorphicMainProject,
            constants_1.dotNpmrcMainProject,
            constants_1.dotNpmIgnoreMainProject,
            constants_1.dotGitIgnoreMainProject,
            lib_4.fileName.environment_js,
            lib_4.fileName.tnpEnvironment_json, // TODO NOT NEEDED ?
            constants_1.binMainProject,
            constants_1.dotVscodeMainProject,
            ...this.project.taonJson.resources,
        ];
        return res;
        //#endregion
    }
    //#endregion
    //#region getters & methods / cut release code
    __restoreCuttedReleaseCodeFromSrc(buildOptions) {
        //#region @backend
        const releaseSrcLocation = this.project.pathFor(constants_1.srcMainProject);
        const releaseSrcLocationOrg = this.project.pathFor(
        // buildOptions.temporarySrcForReleaseCutCode,
        buildOptions.build.websql
            ? constants_1.tmpCutReleaseSrcDistWebsql
            : constants_1.tmpCutReleaseSrcDist);
        lib_5.Helpers.removeFolderIfExists(releaseSrcLocation);
        lib_5.HelpersTaon.copy(releaseSrcLocationOrg, releaseSrcLocation);
        //#endregion
    }
    __cutReleaseCodeFromSrc(buildOptions) {
        //#region @backend
        const releaseSrcLocation = this.project.pathFor(constants_1.srcMainProject);
        const releaseSrcLocationOrg = this.project.pathFor(buildOptions.build.websql
            ? constants_1.tmpCutReleaseSrcDistWebsql
            : constants_1.tmpCutReleaseSrcDist);
        lib_5.Helpers.removeFolderIfExists(releaseSrcLocationOrg);
        lib_5.HelpersTaon.copy(releaseSrcLocation, releaseSrcLocationOrg, {
            copySymlinksAsFiles: true,
            copySymlinksAsFilesDeleteUnexistedLinksFromSourceFirst: true,
            recursive: true,
        });
        lib_5.Helpers.removeFolderIfExists(releaseSrcLocation);
        lib_5.HelpersTaon.copy(releaseSrcLocationOrg, releaseSrcLocation);
        const filesForModyficaiton = lib_3.glob.sync(`${releaseSrcLocation}/**/*`);
        filesForModyficaiton
            .filter(absolutePath => !lib_5.Helpers.isFolder(absolutePath) &&
            lib_2.extAllowedToReplace.includes(lib_3.path.extname(absolutePath)))
            .forEach(absolutePath => {
            let rawContent = lib_5.Helpers.readFile(absolutePath);
            rawContent = lib_1.RegionRemover.from(absolutePath, rawContent, [lib_2.TAGS.NOT_FOR_NPM], this).output;
            // rawContent = this.replaceRegionsWith(rawContent, ['@notFor'+'Npm']);
            lib_5.Helpers.writeFile(absolutePath, rawContent);
        });
        //#endregion
    }
    //#endregion
    //#region getters & methods / distinct architecture prefix
    getDistinctArchitecturePrefix(options, includeDashEnTheEnd = false) {
        //#region @backendFunc
        options = options || {};
        if (typeof options === 'boolean' && options) {
            return `${process.platform}-${process.arch}${includeDashEnTheEnd ? '-' : ''}`;
        }
        options = options;
        if (options.arch || options.platform) {
            return ([options.platform, options.arch].filter(f => !!f).join('-') +
                `${includeDashEnTheEnd ? '-' : ''}`);
        }
        return '';
        //#endregion
    }
    //#endregion
    //#region local release deploy
    async localReleaseDeploy(outputFromBuildAbsPath, releaseOptions, options) {
        //#region @backendFunc
        let releaseProjPath;
        const projectsReposToPushAndTag = [this.project.location];
        const architecturePrefix = this.getDistinctArchitecturePrefix(options.distinctArchitecturePrefix, false);
        const localReleaseOutputBasePath = this.project.pathFor([
            constants_1.localReleaseMainProject,
            this.currentArtifactName,
            `${this.project.name}${constants_1.suffixLatest}`,
            architecturePrefix,
        ]);
        lib_5.Helpers.remove(localReleaseOutputBasePath);
        if (options.copyOnlyExtensions) {
            const zips = lib_5.Helpers.getFilesFrom(outputFromBuildAbsPath, {
                recursive: false,
            }).filter(f => options.copyOnlyExtensions.some(ext => lib_3.path.extname(f).replace('.', '') === ext.replace('.', '')));
            for (const zipFile of zips) {
                const fileName = lib_3.path.basename(zipFile);
                const destZipFile = (0, lib_3.crossPlatformPath)([
                    localReleaseOutputBasePath,
                    fileName,
                ]);
                lib_5.HelpersTaon.copyFile(zipFile, destZipFile);
                if (await lib_5.UtilsZip.splitFile7Zip(destZipFile)) {
                    lib_5.Helpers.removeIfExists(destZipFile);
                }
            }
        }
        else {
            lib_5.HelpersTaon.copy(outputFromBuildAbsPath, localReleaseOutputBasePath, {
                recursive: true,
                overwrite: true,
                copySymlinksAsFiles: true,
            });
        }
        if (options.createReadme) {
            lib_5.Helpers.writeFile((0, lib_3.crossPlatformPath)([localReleaseOutputBasePath, constants_1.readmeMdMainProject]), options.createReadme);
        }
        releaseProjPath = localReleaseOutputBasePath;
        return {
            releaseProjPath,
            projectsReposToPushAndTag,
        };
        //#endregion
    }
    //#endregion
    //#region static pages deploy
    async staticPagesDeploy(outputFromBuildAbsPath, releaseOptions, options) {
        //#region @backendFunc
        options = options || {};
        const architecturePrefix = this.getDistinctArchitecturePrefix(options.distinctArchitecturePrefix);
        const projectsReposToPush = [];
        let releaseProjPath;
        const staticPagesProjLocation = await this.getStaticPagesClonedProjectLocation(releaseOptions);
        try {
            await lib_5.HelpersTaon.git.pullCurrentBranch(staticPagesProjLocation, {
                // @ts-ignore TODO @REMOVE
                exitOnError: false,
            });
        }
        catch (error) { }
        lib_5.HelpersTaon.git.cleanRepoFromAnyFilesExceptDotGitFolder(staticPagesProjLocation);
        lib_5.Helpers.writeFile([outputFromBuildAbsPath, '.nojekyll'], '');
        //#region make sure version folder are proper
        let versionFolderName = this.project.packageJson.version;
        const versionType = releaseOptions.release.overrideStaticPagesReleaseType ||
            lib_3.CoreModels.ReleaseVersionTypeEnum.PATCH;
        if (versionType === lib_3.CoreModels.ReleaseVersionTypeEnum.MAJOR) {
            versionFolderName = this.project.packageJson.majorVersion?.toString();
        }
        if (versionType === lib_3.CoreModels.ReleaseVersionTypeEnum.MINOR) {
            versionFolderName = [
                this.project.packageJson.majorVersion?.toString(),
                this.project.packageJson.minorVersion?.toString(),
            ].join('.');
        }
        //#endregion
        const destinationStaticPagesLocationRepoAbsPath = releaseOptions.release
            .skipStaticPagesVersioning
            ? staticPagesProjLocation
            : (0, lib_3.crossPlatformPath)([
                staticPagesProjLocation,
                constants_1.BundledDocsFolders.VERSION,
                versionFolderName,
                architecturePrefix,
            ]);
        if (options.copyOnlyExtensions) {
            const zips = lib_5.Helpers.getFilesFrom(outputFromBuildAbsPath, {
                recursive: false,
            }).filter(f => options.copyOnlyExtensions.some(ext => lib_3.path.extname(f).replace('.', '') === ext.replace('.', '')));
            for (const zipFile of zips) {
                const fileName = lib_3.path.basename(zipFile);
                const destZipFile = (0, lib_3.crossPlatformPath)([
                    destinationStaticPagesLocationRepoAbsPath,
                    fileName,
                ]);
                lib_5.HelpersTaon.copyFile(zipFile, destZipFile);
                if (await lib_5.UtilsZip.splitFile7Zip(destZipFile)) {
                    lib_5.Helpers.removeIfExists(destZipFile);
                }
            }
        }
        else {
            lib_5.HelpersTaon.copy(outputFromBuildAbsPath, destinationStaticPagesLocationRepoAbsPath);
        }
        if (!releaseOptions.release.skipStaticPagesVersioning) {
            const versions = lib_5.Helpers.foldersFrom([staticPagesProjLocation, constants_1.BundledDocsFolders.VERSION], {
                recursive: false,
            });
            lib_5.Helpers.writeFile([staticPagesProjLocation, constants_1.BundledFiles.INDEX_HTML], `
        <html>
        <head>
          <title>Versions</title>
        </head>
        <body>
          <h1>${lib_3._.startCase(releaseOptions.release.targetArtifact)} ` +
                `versions for ${this.project.nameForNpmPackage}</h1>
          <ul>
            ${versions
                    .map(version => {
                    return (`<li><a href="${constants_1.BundledDocsFolders.VERSION}/` +
                        `${lib_3.path.basename(version)}${architecturePrefix ? `/${architecturePrefix}` : ''}">` +
                        `${lib_3.path.basename(version)}${architecturePrefix ? `/${architecturePrefix}` : ''}</a></li>`);
                })
                    .join('')}
          </ul>

        </body>
        </html>
        `);
            lib_5.UtilsTypescript.formatFile([
                staticPagesProjLocation,
                constants_1.BundledFiles.INDEX_HTML,
            ]);
        }
        lib_5.HelpersTaon.git.revertFileChanges(staticPagesProjLocation, constants_1.BundledFiles.CNAME);
        if (options.createReadme) {
            lib_5.Helpers.writeFile((0, lib_3.crossPlatformPath)([staticPagesProjLocation, constants_1.BundledFiles.README_MD]), options.createReadme);
        }
        lib_5.Helpers.info(`Static pages release done: ${staticPagesProjLocation}`);
        releaseProjPath = staticPagesProjLocation;
        if (!releaseOptions.release.skipTagGitPush) {
            projectsReposToPush.unshift(staticPagesProjLocation);
        }
        return {
            projectsReposToPush,
            releaseProjPath,
        };
        //#endregion
    }
}
exports.BaseArtifact = BaseArtifact;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/base-artifact.js.map