"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IgnoreHide = void 0;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
//#endregion
class IgnoreHide // @ts-ignore TODO weird inheritance problem
// @ts-ignore TODO weird inheritance problem
 extends lib_4.BaseIgnoreHideHelpers {
    storeInRepoConfigFiles() {
        return true; // TODO for now true in future may be false - everything recreate from template
    }
    applyToChildren(toIgnore) {
        return toIgnore;
        // TODO remvoe ?
        // const chilredn = Utils.uniqArray([
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
            ...constants_1.frameworkBuildFolders.filter(c => !!c).map(c => `/${c}`),
            this.project.framework.isStandaloneProject
                ? `/${constants_1.testEnvironmentsMainProject}`
                : void 0,
            `/${constants_1.srcMainProject}/${constants_1.TaonGeneratedFiles.APP_HOSTS_TS}`,
            `/${constants_1.srcMainProject}/${constants_1.TaonGeneratedFiles.VARS_SCSS}`,
            `/${constants_1.TaonGeneratedFiles.BUILD_INFO_MD}`,
            `/${constants_1.docsConfigSchema}`,
            `/${lib_1.TaonTempDatabasesFolder}/*.sqlite`,
            `/${lib_1.TaonTempRoutesFolder}/*.rest`,
            `/${constants_1.srcMainProject}/${constants_1.libFromSrc}/${constants_1.TaonGeneratedFiles.LIB_INFO_MD}`,
            `/${constants_1.srcMainProject}/${constants_1.libFromSrc}/${constants_1.TaonGeneratedFolders.ENV_FOLDER}/**/*.*`,
            `/${constants_1.srcMainProject}/${constants_1.libFromSrc}/${constants_1.migrationsFromLib}/${constants_1.TaonGeneratedFiles.MIGRATIONS_INFO_MD}`,
            `/${constants_1.srcMainProject}/${constants_1.testsFromSrc}/${constants_1.TaonGeneratedFiles.MOCHA_TESTS_INFO_MD}`,
            `/${constants_1.srcMainProject}/${constants_1.assetsFromSrc}/${constants_1.sharedFromAssets}/${constants_1.TaonGeneratedFiles.SHARED_FOLDER_INFO_TXT}`,
            `/${constants_1.srcMainProject}/${constants_1.appAutoGenDocsMd}`,
            `/${constants_1.srcMainProject}/${constants_1.appAutoGenJs}`,
            `/${constants_1.dotVscodeMainProject}/${constants_1.TaonGeneratedFiles.LAUNCH_JSON}`,
            !this.project.taonJson.storeGeneratedAssetsInRepository
                ? `/${constants_1.srcMainProject}/${constants_1.assetsFromSrc}/${constants_1.generatedFromAssets}`
                : void 0,
            !this.project.taonJson.storeLocalReleaseFilesInRepository
                ? `/${constants_1.localReleaseMainProject}`
                : void 0,
            ...(this.project.isMonorepo
                ? []
                : this.project.linkedProjects.linkedProjects
                    .map(f => f.relativeClonePath)
                    .map(c => `${(0, lib_3.crossPlatformPath)(c)}`)),
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
            constants_1.vitestConfigJsonMainProject,
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
            tohide = tohide.filter(f => f !== constants_1.vitestConfigJsonMainProject);
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
            !this.project.framework.isCoreProject ? `*${constants_1.dotFileTemplateExt}` : void 0,
        ].filter(f => !!f);
        return this.applyToChildren(toIgnore);
    }
    alwaysIgnoredAndHiddenFilesAndFolders() {
        const toIgnore = [
            ...super.alwaysIgnoredAndHiddenFilesAndFolders(),
            constants_1.browserMainProject,
            constants_1.websqlMainProject,
            constants_1.websqlMainProject,
            constants_1.esLintCustomRulesMainProject,
            constants_1.distMainProject + constants_1.prodSuffix,
            constants_1.distNoCutSrcMainProject,
            constants_1.distNoCutSrcMainProject + constants_1.prodSuffix,
            constants_1.packageJsonLockMainProject,
        ];
        return this.applyToChildren(toIgnore);
    }
    alwaysUseRecursivePattern() {
        return [
            ...super.alwaysUseRecursivePattern(),
            `*${constants_1.dotFileTemplateExt}`,
            ...this.hideInProject,
        ];
    }
    hiddenButNotNecessaryIgnoredInRepoFilesAndFolders() {
        const toIgnore = [
            ...super.hiddenButNotNecessaryIgnoredInRepoFilesAndFolders(),
            constants_1.runJsMainProject,
            constants_1.indexDtsMainProject,
            constants_1.indexJsMainProject,
            constants_1.indexJsMapMainProject,
            constants_1.updateVscodePackageJsonJsMainProject,
        ];
        return this.applyToChildren(toIgnore);
    }
    hiddenButNotNecessaryIgnoredInRepoPatterns() {
        const toIgnore = [
            ...super.hiddenButNotNecessaryIgnoredInRepoPatterns(),
            '*.schema.json',
            `!${constants_1.TemplateFolder.templatesSubprojects}/**/${constants_1.packageJsonSubProject}`,
        ].filter(f => !!f);
        return this.applyToChildren(toIgnore);
    }
    hiddenButNeverIgnoredInRepo() {
        const toIgnore = [
            ...super.hiddenButNeverIgnoredInRepo(),
            ...(lib_4.Helpers.exists(this.project.pathFor(lib_2.fileName.taon_jsonc))
                ? [lib_2.fileName.package_json]
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
exports.IgnoreHide = IgnoreHide;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/ignore-hide.js.map