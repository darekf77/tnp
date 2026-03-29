//#region imports
import { TaonTempDatabasesFolder, TaonTempRoutesFolder } from 'taon/lib-prod';
import { fileName } from 'tnp-core/lib-prod';
import { crossPlatformPath } from 'tnp-core/lib-prod';
import { BaseIgnoreHideHelpers, Helpers__NS__exists } from 'tnp-helpers/lib-prod';
import { appAutoGenDocsMd, appAutoGenJs, assetsFromSrc, browserMainProject, distMainProject, distNoCutSrcMainProject, docsConfigSchema, dotFileTemplateExt, dotVscodeMainProject, esLintCustomRulesMainProject, frameworkBuildFolders, generatedFromAssets, indexDtsMainProject, indexJsMainProject, indexJsMapMainProject, libFromSrc, localReleaseMainProject, migrationsFromLib, packageJsonLockMainProject, packageJsonSubProject, prodSuffix, runJsMainProject, sharedFromAssets, srcMainProject, TaonGeneratedFiles, TaonGeneratedFolders, TemplateFolder, testEnvironmentsMainProject, testsFromSrc, updateVscodePackageJsonJsMainProject, vitestConfigJsonMainProject, websqlMainProject, } from '../../constants';
//#endregion
export class IgnoreHide // @ts-ignore TODO weird inheritance problem
// @ts-ignore TODO weird inheritance problem
 extends BaseIgnoreHideHelpers {
    storeInRepoConfigFiles() {
        return true; // TODO for now true in future may be false - everything recreate from template
    }
    applyToChildren(toIgnore) {
        return toIgnore;
        // TODO remvoe ?
        // const chilredn = Utils__NS__uniqArray([
        //   ...(this.project.children || []).map(c => c.name),
        //   ...(this.project.linkedProjects?.linkedProjects || []).map(
        //     c => c.relativeClonePath,
        //   ),
        // ]).filter(f => !!f);
        // return [
        //   ...toIgnore,
        //   ...chilredn.reduce((a, childFolderName) => {
        //     return [...a, ...toIgnore.map(c => `${childFolderName}/${c}`)];
        //   }, []),
        // ];
    }
    getPatternsIgnoredInRepoButVisibleToUser() {
        // TODO
        return [
            ...super.getPatternsIgnoredInRepoButVisibleToUser(),
            ...frameworkBuildFolders.filter(c => !!c).map(c => `/${c}`),
            this.project.framework.isStandaloneProject
                ? `/${testEnvironmentsMainProject}`
                : void 0,
            `/${srcMainProject}/${TaonGeneratedFiles.APP_HOSTS_TS}`,
            `/${srcMainProject}/${TaonGeneratedFiles.VARS_SCSS}`,
            `/${TaonGeneratedFiles.BUILD_INFO_MD}`,
            `/${docsConfigSchema}`,
            `/${TaonTempDatabasesFolder}/*.sqlite`,
            `/${TaonTempRoutesFolder}/*.rest`,
            `/${srcMainProject}/${libFromSrc}/${TaonGeneratedFiles.LIB_INFO_MD}`,
            `/${srcMainProject}/${libFromSrc}/${TaonGeneratedFolders.ENV_FOLDER}/**/*.*`,
            `/${srcMainProject}/${libFromSrc}/${migrationsFromLib}/${TaonGeneratedFiles.MIGRATIONS_INFO_MD}`,
            `/${srcMainProject}/${testsFromSrc}/${TaonGeneratedFiles.MOCHA_TESTS_INFO_MD}`,
            `/${srcMainProject}/${assetsFromSrc}/${sharedFromAssets}/${TaonGeneratedFiles.SHARED_FOLDER_INFO_TXT}`,
            `/${srcMainProject}/${appAutoGenDocsMd}`,
            `/${srcMainProject}/${appAutoGenJs}`,
            `/${dotVscodeMainProject}/${TaonGeneratedFiles.LAUNCH_JSON}`,
            !this.project.taonJson.storeGeneratedAssetsInRepository
                ? `/${srcMainProject}/${assetsFromSrc}/${generatedFromAssets}`
                : void 0,
            !this.project.taonJson.storeLocalReleaseFilesInRepository
                ? `/${localReleaseMainProject}`
                : void 0,
            ...(this.project.isMonorepo
                ? []
                : this.project.linkedProjects.linkedProjects
                    .map(f => f.relativeClonePath)
                    .map(c => `${crossPlatformPath(c)}`)),
        ].filter(c => !!c);
    }
    // TODO use constants
    get hideInProject() {
        let tohide = [
            'tmp-*',
            'dist*',
            '.tnp',
            '.taon',
            'tsconfig*',
            '*.schema.json',
            'eslint*',
            'run.js',
            'webpack*',
            'index.js',
            'index.js.map',
            'index.d.ts',
            vitestConfigJsonMainProject,
            '.gitignore',
            '.npmignore',
            '.npmrc',
            '.prettierrc',
            '.prettierignore',
            'update-vscode-package-json.js',
            '.editorconfig',
            'websql',
            'browser',
            'node_modules',
            'package.json',
        ];
        if (this.project.framework.isCoreProject) {
            tohide = tohide.filter(f => f !== vitestConfigJsonMainProject);
            tohide = tohide.filter(f => f !== 'package.json');
            tohide = tohide.filter(f => f !== '.gitignore');
            tohide = tohide.filter(f => f !== 'tsconfig*');
        }
        return tohide;
    }
    alwaysIgnoredHiddenPatterns() {
        const toIgnore = [
            ...super.alwaysIgnoredHiddenPatterns(),
            ...this.hideInProject,
            !this.project.framework.isCoreProject ? `*${dotFileTemplateExt}` : void 0,
        ].filter(f => !!f);
        return this.applyToChildren(toIgnore);
    }
    alwaysIgnoredAndHiddenFilesAndFolders() {
        const toIgnore = [
            ...super.alwaysIgnoredAndHiddenFilesAndFolders(),
            browserMainProject,
            websqlMainProject,
            websqlMainProject,
            esLintCustomRulesMainProject,
            distMainProject + prodSuffix,
            distNoCutSrcMainProject,
            distNoCutSrcMainProject + prodSuffix,
            packageJsonLockMainProject,
        ];
        return this.applyToChildren(toIgnore);
    }
    alwaysUseRecursivePattern() {
        return [
            ...super.alwaysUseRecursivePattern(),
            `*${dotFileTemplateExt}`,
            ...this.hideInProject,
        ];
    }
    hiddenButNotNecessaryIgnoredInRepoFilesAndFolders() {
        const toIgnore = [
            ...super.hiddenButNotNecessaryIgnoredInRepoFilesAndFolders(),
            runJsMainProject,
            indexDtsMainProject,
            indexJsMainProject,
            indexJsMapMainProject,
            updateVscodePackageJsonJsMainProject,
        ];
        return this.applyToChildren(toIgnore);
    }
    hiddenButNotNecessaryIgnoredInRepoPatterns() {
        const toIgnore = [
            ...super.hiddenButNotNecessaryIgnoredInRepoPatterns(),
            '*.schema.json',
            `!${TemplateFolder.templatesSubprojects}/**/${packageJsonSubProject}`,
        ].filter(f => !!f);
        return this.applyToChildren(toIgnore);
    }
    hiddenButNeverIgnoredInRepo() {
        const toIgnore = [
            ...super.hiddenButNeverIgnoredInRepo(),
            ...(Helpers__NS__exists(this.project.pathFor(fileName.taon_jsonc))
                ? [fileName.package_json]
                : []),
        ];
        return this.applyToChildren(toIgnore);
    }
    getVscodeFilesFoldersAndPatternsToHide() {
        const result = {
            ...super.getVscodeFilesFoldersAndPatternsToHide(),
        };
        // if (
        //   this.project.framework.isContainer &&
        //   this.project.taonJson.isOrganization
        // ) {
        //   this.project.linkedProjects.linkedProjects
        //     .map(f => f.relativeClonePath)
        //     .map(c => `${crossPlatformPath(c)}`)
        //     .forEach(c => {
        //       result[c] = true;
        //     });
        // }
        return result;
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/ignore-hide.js.map