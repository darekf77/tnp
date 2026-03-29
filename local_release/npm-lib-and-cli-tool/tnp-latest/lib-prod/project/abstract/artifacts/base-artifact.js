//#region imports
import { RegionRemover } from 'isomorphic-region-loader/lib-prod';
import { config, extAllowedToReplace, TAGS } from 'tnp-core/lib-prod';
import { crossPlatformPath, glob, path, ___NS__isArray, ___NS__isBoolean, ___NS__startCase, CoreModels__NS__ReleaseVersionTypeEnum } from 'tnp-core/lib-prod';
import { fileName } from 'tnp-core/lib-prod';
import { Helpers__NS__exists, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__info, Helpers__NS__isFolder, Helpers__NS__mkdirp, Helpers__NS__readFile, Helpers__NS__remove, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__writeFile, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__revertFileChanges, UtilsTypescript__NS__formatFile, UtilsZip__NS__splitFile7Zip } from 'tnp-helpers/lib-prod';
import { binMainProject, BundledFiles, BundledDocsFolders, dotGitIgnoreMainProject, dotNpmIgnoreMainProject, dotNpmrcMainProject, dotVscodeMainProject, localReleaseMainProject, packageJsonMainProject, readmeMdMainProject, srcMainProject, suffixLatest, tsconfigJsonBrowserMainProject, tsconfigJsonIsomorphicMainProject, tsconfigJsonMainProject, tmpCutReleaseSrcDistWebsql, tmpCutReleaseSrcDist, } from '../../../constants';
//#endregion
export class BaseArtifact {
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
        if (___NS__isBoolean(releaseOptions.release.skipBuildingArtifacts)) {
            return releaseOptions.release.skipBuildingArtifacts;
        }
        if (___NS__isArray(releaseOptions.release.skipBuildingArtifacts)) {
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
            `.${config.frameworkName}`,
            this.currentArtifactName,
        ]);
        const repoName = `repo-${this.project.name}-for-${releaseOptions.release.releaseType}--env-${releaseOptions.release.envName}${releaseOptions.release.envNumber || ''}`;
        const repoPath = crossPlatformPath([repoRoot, repoName]);
        const repoUrl = releaseOptions.release.staticPagesCustomRepoUrl
            ? releaseOptions.release.staticPagesCustomRepoUrl
            : this.project.git.remoteOriginUrl;
        if (!Helpers__NS__exists(repoPath)) {
            Helpers__NS__mkdirp(repoRoot);
            await HelpersTaon__NS__git__NS__clone({
                cwd: repoRoot,
                url: repoUrl,
                override: true,
                destinationFolderName: repoName,
            });
        }
        HelpersTaon__NS__git__NS__resetHard(repoPath);
        HelpersTaon__NS__git__NS__checkout(repoPath, staticPagesRepoBranch, {
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
            packageJsonMainProject,
            tsconfigJsonMainProject,
            tsconfigJsonBrowserMainProject,
            tsconfigJsonIsomorphicMainProject,
            dotNpmrcMainProject,
            dotNpmIgnoreMainProject,
            dotGitIgnoreMainProject,
            fileName.environment_js,
            fileName.tnpEnvironment_json, // TODO NOT NEEDED ?
            binMainProject,
            dotVscodeMainProject,
            ...this.project.taonJson.resources,
        ];
        return res;
        //#endregion
    }
    //#endregion
    //#region getters & methods / cut release code
    __restoreCuttedReleaseCodeFromSrc(buildOptions) {
        //#region @backend
        const releaseSrcLocation = this.project.pathFor(srcMainProject);
        const releaseSrcLocationOrg = this.project.pathFor(
        // buildOptions.temporarySrcForReleaseCutCode,
        buildOptions.build.websql
            ? tmpCutReleaseSrcDistWebsql
            : tmpCutReleaseSrcDist);
        Helpers__NS__removeFolderIfExists(releaseSrcLocation);
        HelpersTaon__NS__copy(releaseSrcLocationOrg, releaseSrcLocation);
        //#endregion
    }
    __cutReleaseCodeFromSrc(buildOptions) {
        //#region @backend
        const releaseSrcLocation = this.project.pathFor(srcMainProject);
        const releaseSrcLocationOrg = this.project.pathFor(buildOptions.build.websql
            ? tmpCutReleaseSrcDistWebsql
            : tmpCutReleaseSrcDist);
        Helpers__NS__removeFolderIfExists(releaseSrcLocationOrg);
        HelpersTaon__NS__copy(releaseSrcLocation, releaseSrcLocationOrg, {
            copySymlinksAsFiles: true,
            copySymlinksAsFilesDeleteUnexistedLinksFromSourceFirst: true,
            recursive: true,
        });
        Helpers__NS__removeFolderIfExists(releaseSrcLocation);
        HelpersTaon__NS__copy(releaseSrcLocationOrg, releaseSrcLocation);
        const filesForModyficaiton = glob.sync(`${releaseSrcLocation}/**/*`);
        filesForModyficaiton
            .filter(absolutePath => !Helpers__NS__isFolder(absolutePath) &&
            extAllowedToReplace.includes(path.extname(absolutePath)))
            .forEach(absolutePath => {
            let rawContent = Helpers__NS__readFile(absolutePath);
            rawContent = RegionRemover.from(absolutePath, rawContent, [TAGS.NOT_FOR_NPM], this).output;
            // rawContent = this.replaceRegionsWith(rawContent, ['@notFor'+'Npm']);
            Helpers__NS__writeFile(absolutePath, rawContent);
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
            localReleaseMainProject,
            this.currentArtifactName,
            `${this.project.name}${suffixLatest}`,
            architecturePrefix,
        ]);
        Helpers__NS__remove(localReleaseOutputBasePath);
        if (options.copyOnlyExtensions) {
            const zips = Helpers__NS__getFilesFrom(outputFromBuildAbsPath, {
                recursive: false,
            }).filter(f => options.copyOnlyExtensions.some(ext => path.extname(f).replace('.', '') === ext.replace('.', '')));
            for (const zipFile of zips) {
                const fileName = path.basename(zipFile);
                const destZipFile = crossPlatformPath([
                    localReleaseOutputBasePath,
                    fileName,
                ]);
                HelpersTaon__NS__copyFile(zipFile, destZipFile);
                if (await UtilsZip__NS__splitFile7Zip(destZipFile)) {
                    Helpers__NS__removeIfExists(destZipFile);
                }
            }
        }
        else {
            HelpersTaon__NS__copy(outputFromBuildAbsPath, localReleaseOutputBasePath, {
                recursive: true,
                overwrite: true,
                copySymlinksAsFiles: true,
            });
        }
        if (options.createReadme) {
            Helpers__NS__writeFile(crossPlatformPath([localReleaseOutputBasePath, readmeMdMainProject]), options.createReadme);
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
            await HelpersTaon__NS__git__NS__pullCurrentBranch(staticPagesProjLocation, {
                // @ts-ignore TODO @REMOVE
                exitOnError: false,
            });
        }
        catch (error) { }
        HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder(staticPagesProjLocation);
        Helpers__NS__writeFile([outputFromBuildAbsPath, '.nojekyll'], '');
        //#region make sure version folder are proper
        let versionFolderName = this.project.packageJson.version;
        const versionType = releaseOptions.release.overrideStaticPagesReleaseType ||
            CoreModels__NS__ReleaseVersionTypeEnum.PATCH;
        if (versionType === CoreModels__NS__ReleaseVersionTypeEnum.MAJOR) {
            versionFolderName = this.project.packageJson.majorVersion?.toString();
        }
        if (versionType === CoreModels__NS__ReleaseVersionTypeEnum.MINOR) {
            versionFolderName = [
                this.project.packageJson.majorVersion?.toString(),
                this.project.packageJson.minorVersion?.toString(),
            ].join('.');
        }
        //#endregion
        const destinationStaticPagesLocationRepoAbsPath = releaseOptions.release
            .skipStaticPagesVersioning
            ? staticPagesProjLocation
            : crossPlatformPath([
                staticPagesProjLocation,
                BundledDocsFolders.VERSION,
                versionFolderName,
                architecturePrefix,
            ]);
        if (options.copyOnlyExtensions) {
            const zips = Helpers__NS__getFilesFrom(outputFromBuildAbsPath, {
                recursive: false,
            }).filter(f => options.copyOnlyExtensions.some(ext => path.extname(f).replace('.', '') === ext.replace('.', '')));
            for (const zipFile of zips) {
                const fileName = path.basename(zipFile);
                const destZipFile = crossPlatformPath([
                    destinationStaticPagesLocationRepoAbsPath,
                    fileName,
                ]);
                HelpersTaon__NS__copyFile(zipFile, destZipFile);
                if (await UtilsZip__NS__splitFile7Zip(destZipFile)) {
                    Helpers__NS__removeIfExists(destZipFile);
                }
            }
        }
        else {
            HelpersTaon__NS__copy(outputFromBuildAbsPath, destinationStaticPagesLocationRepoAbsPath);
        }
        if (!releaseOptions.release.skipStaticPagesVersioning) {
            const versions = Helpers__NS__foldersFrom([staticPagesProjLocation, BundledDocsFolders.VERSION], {
                recursive: false,
            });
            Helpers__NS__writeFile([staticPagesProjLocation, BundledFiles.INDEX_HTML], `
        <html>
        <head>
          <title>Versions</title>
        </head>
        <body>
          <h1>${___NS__startCase(releaseOptions.release.targetArtifact)} ` +
                `versions for ${this.project.nameForNpmPackage}</h1>
          <ul>
            ${versions
                    .map(version => {
                    return (`<li><a href="${BundledDocsFolders.VERSION}/` +
                        `${path.basename(version)}${architecturePrefix ? `/${architecturePrefix}` : ''}">` +
                        `${path.basename(version)}${architecturePrefix ? `/${architecturePrefix}` : ''}</a></li>`);
                })
                    .join('')}
          </ul>

        </body>
        </html>
        `);
            UtilsTypescript__NS__formatFile([
                staticPagesProjLocation,
                BundledFiles.INDEX_HTML,
            ]);
        }
        HelpersTaon__NS__git__NS__revertFileChanges(staticPagesProjLocation, BundledFiles.CNAME);
        if (options.createReadme) {
            Helpers__NS__writeFile(crossPlatformPath([staticPagesProjLocation, BundledFiles.README_MD]), options.createReadme);
        }
        Helpers__NS__info(`Static pages release done: ${staticPagesProjLocation}`);
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/base-artifact.js.map