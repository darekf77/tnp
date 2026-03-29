"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesRecreator = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const lib_4 = require("tnp-helpers/lib");
const constants_1 = require("../../../../../../constants");
class FilesRecreator // @ts-ignore TODO weird inheritance problem
// @ts-ignore TODO weird inheritance problem
 extends lib_4.BaseFeatureForProject {
    //#region recreate simple files
    async init() {
        //#region @backendFunc
        this.handleProjectSpecyficFiles();
        //#endregion
    }
    //#endregion
    projectSpecificFilesForStandalone() {
        let files = [
            constants_1.indexJsMainProject,
            constants_1.indexDtsMainProject,
            constants_1.indexJsMapMainProject,
            constants_1.tsconfigForSchemaJson,
        ];
        files = files.concat([
            constants_1.taonConfigSchemaJsonStandalone,
            constants_1.tsconfigJsonBrowserMainProject,
            constants_1.webpackConfigJsMainProject,
            constants_1.runJsMainProject,
            constants_1.updateVscodePackageJsonJsMainProject,
            constants_1.esLintConfigJsonMainProject,
            constants_1.vitestConfigJsonMainProject,
            constants_1.esLintRuleNoNamespaceReExport,
            ...this.filesTemplates(),
        ]);
        if (this.project.framework.frameworkVersionAtLeast('v2')) {
            files = files.filter(f => f !== constants_1.tsconfigJsonBrowserMainProject);
        }
        return files;
    }
    projectSpecificFilesForContainer() {
        return [
            constants_1.taonConfigSchemaJsonContainer,
            constants_1.esLintConfigJsonMainProject,
            constants_1.esLintRuleNoNamespaceReExport,
        ];
    }
    //#region getters & methods / project specify files
    /**
     * Return list of files that are copied from
     * core project each time struct method is called
     * @returns list of relative paths
     */
    projectSpecyficFiles() {
        //#region @backendFunc
        let files = [];
        if (this.project.framework.isContainer) {
            return this.projectSpecificFilesForContainer();
        }
        if (this.project.framework.isStandaloneProject) {
            files = this.projectSpecificFilesForStandalone();
        }
        return files;
        //#endregion
    }
    //#endregion
    //#region handle project specyfic files
    handleProjectSpecyficFiles() {
        //#region @backendFunc
        let defaultProjectProptotype;
        defaultProjectProptotype = this.project.ins.by(this.project.type, this.project.framework.frameworkVersion);
        const files = [];
        if ((0, lib_1.crossPlatformPath)(this.project.location) ===
            (0, lib_1.crossPlatformPath)(defaultProjectProptotype?.location)) {
            // nothing
        }
        else if (defaultProjectProptotype) {
            const projectSpecyficFiles = this.project.artifactsManager.filesRecreator.projectSpecyficFiles();
            // console.log({
            //   projectSpecyficFiles,
            //   project: this.project.genericName
            // })
            projectSpecyficFiles.forEach(relativeFilePath => {
                relativeFilePath = (0, lib_1.crossPlatformPath)(relativeFilePath);
                let from = (0, lib_1.crossPlatformPath)(lib_2.path.join(defaultProjectProptotype.location, relativeFilePath));
                // console.log({ relativeFilePath, from });
                if (!lib_3.Helpers.exists(from)) {
                    if (defaultProjectProptotype.framework.frameworkVersionAtLeast('v2')) {
                        const notExistedTaonVersions = ['v17'];
                        if (!notExistedTaonVersions.includes(
                        // non existed taon versions here
                        defaultProjectProptotype.framework.frameworkVersionMinusOne)) {
                            const core = this.project.ins.by(defaultProjectProptotype.type, defaultProjectProptotype.framework.frameworkVersionMinusOne);
                            from = (0, lib_1.crossPlatformPath)(lib_2.path.join(core.location, relativeFilePath));
                        }
                    }
                }
                const where = (0, lib_1.crossPlatformPath)(lib_2.path.join(this.project.location, relativeFilePath));
                files.push({
                    from,
                    where,
                });
            });
            files.forEach(file => {
                lib_3.Helpers.logInfo(`Updating file ${file.where}`);
                lib_3.HelpersTaon.copyFile(file.from, file.where);
            });
        }
        //#endregion
    }
    //#endregion
    filesTemplatesForStandalone() {
        let templates = [];
        templates = [
            `${constants_1.tsconfigJsonMainProject}${constants_1.dotFileTemplateExt}`,
            `${constants_1.tsconfigBackendDistJson}${constants_1.dotFileTemplateExt}`,
            `${constants_1.tsconfigSpecJsonMain}${constants_1.dotFileTemplateExt}`,
            `${constants_1.tsconfigBackendDistJson_PROD}${constants_1.dotFileTemplateExt}`,
        ];
        if (this.project.framework.frameworkVersionAtLeast('v2')) {
            templates = [
                `${constants_1.tsconfigJsonIsomorphicMainProject}${constants_1.dotFileTemplateExt}`,
                `${constants_1.tsconfigJsonBrowserMainProject}${constants_1.dotFileTemplateExt}`,
                ...this.project.vsCodeHelpers.__vscodeFileTemplates,
                ...templates,
            ];
        }
        return templates;
    }
    //#region getters & methods / files templates
    /**
     * Generated automaticly file templates exmpale:
     * file.ts.filetemplate -> will generate file.ts
     * inside triple bracked: {{{  ENV. }}}
     * property ENV can be used to check files
     */
    filesTemplates() {
        //#region @backendFunc
        // TODO should be abstract
        let templates = [];
        if (this.project.framework.isStandaloneProject) {
            return this.filesTemplatesForStandalone();
        }
        return templates;
        //#endregion
    }
}
exports.FilesRecreator = FilesRecreator;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/files-recreation/files-recreator.js.map