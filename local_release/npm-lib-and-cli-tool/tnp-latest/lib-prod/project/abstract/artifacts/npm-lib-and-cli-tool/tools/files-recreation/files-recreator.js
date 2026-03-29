import { crossPlatformPath } from 'tnp-core/lib-prod';
import { path } from 'tnp-core/lib-prod';
import { Helpers__NS__exists, Helpers__NS__logInfo, HelpersTaon__NS__copyFile } from 'tnp-helpers/lib-prod';
import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';
import { taonConfigSchemaJsonStandalone, taonConfigSchemaJsonContainer, dotFileTemplateExt, tsconfigJsonMainProject, tsconfigBackendDistJson, tsconfigJsonIsomorphicMainProject, tsconfigJsonBrowserMainProject, runJsMainProject, updateVscodePackageJsonJsMainProject, esLintConfigJsonMainProject, webpackConfigJsMainProject, indexJsMainProject, indexDtsMainProject, indexJsMapMainProject, tsconfigForSchemaJson, tsconfigBackendDistJson_PROD, esLintRuleNoNamespaceReExport, tsconfigSpecJsonMain, vitestConfigJsonMainProject, } from '../../../../../../constants';
export class FilesRecreator // @ts-ignore TODO weird inheritance problem
// @ts-ignore TODO weird inheritance problem
 extends BaseFeatureForProject {
    //#region recreate simple files
    async init() {
        //#region @backendFunc
        this.handleProjectSpecyficFiles();
        //#endregion
    }
    //#endregion
    projectSpecificFilesForStandalone() {
        let files = [
            indexJsMainProject,
            indexDtsMainProject,
            indexJsMapMainProject,
            tsconfigForSchemaJson,
        ];
        files = files.concat([
            taonConfigSchemaJsonStandalone,
            tsconfigJsonBrowserMainProject,
            webpackConfigJsMainProject,
            runJsMainProject,
            updateVscodePackageJsonJsMainProject,
            esLintConfigJsonMainProject,
            vitestConfigJsonMainProject,
            esLintRuleNoNamespaceReExport,
            ...this.filesTemplates(),
        ]);
        if (this.project.framework.frameworkVersionAtLeast('v2')) {
            files = files.filter(f => f !== tsconfigJsonBrowserMainProject);
        }
        return files;
    }
    projectSpecificFilesForContainer() {
        return [
            taonConfigSchemaJsonContainer,
            esLintConfigJsonMainProject,
            esLintRuleNoNamespaceReExport,
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
        if (crossPlatformPath(this.project.location) ===
            crossPlatformPath(defaultProjectProptotype?.location)) {
            // nothing
        }
        else if (defaultProjectProptotype) {
            const projectSpecyficFiles = this.project.artifactsManager.filesRecreator.projectSpecyficFiles();
            // console.log({
            //   projectSpecyficFiles,
            //   project: this.project.genericName
            // })
            projectSpecyficFiles.forEach(relativeFilePath => {
                relativeFilePath = crossPlatformPath(relativeFilePath);
                let from = crossPlatformPath(path.join(defaultProjectProptotype.location, relativeFilePath));
                // console.log({ relativeFilePath, from });
                if (!Helpers__NS__exists(from)) {
                    if (defaultProjectProptotype.framework.frameworkVersionAtLeast('v2')) {
                        const notExistedTaonVersions = ['v17'];
                        if (!notExistedTaonVersions.includes(
                        // non existed taon versions here
                        defaultProjectProptotype.framework.frameworkVersionMinusOne)) {
                            const core = this.project.ins.by(defaultProjectProptotype.type, defaultProjectProptotype.framework.frameworkVersionMinusOne);
                            from = crossPlatformPath(path.join(core.location, relativeFilePath));
                        }
                    }
                }
                const where = crossPlatformPath(path.join(this.project.location, relativeFilePath));
                files.push({
                    from,
                    where,
                });
            });
            files.forEach(file => {
                Helpers__NS__logInfo(`Updating file ${file.where}`);
                HelpersTaon__NS__copyFile(file.from, file.where);
            });
        }
        //#endregion
    }
    //#endregion
    filesTemplatesForStandalone() {
        let templates = [];
        templates = [
            `${tsconfigJsonMainProject}${dotFileTemplateExt}`,
            `${tsconfigBackendDistJson}${dotFileTemplateExt}`,
            `${tsconfigSpecJsonMain}${dotFileTemplateExt}`,
            `${tsconfigBackendDistJson_PROD}${dotFileTemplateExt}`,
        ];
        if (this.project.framework.frameworkVersionAtLeast('v2')) {
            templates = [
                `${tsconfigJsonIsomorphicMainProject}${dotFileTemplateExt}`,
                `${tsconfigJsonBrowserMainProject}${dotFileTemplateExt}`,
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/files-recreation/files-recreator.js.map