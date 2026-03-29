"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Generate = void 0;
//#region imports
const lib_1 = require("magic-renamer/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
const base_cli_1 = require("./base-cli");
//#endregion
/**
 * TODO refactor move to tnp-helpers
 */ // @ts-ignore TODO weird inheritance problem
class $Generate extends base_cli_1.BaseCli {
    // @ts-ignore TODO weird inheritance problem
    async _() {
        //#region @backendFunc
        let [absPath, moduleName, entityName] = this.args;
        if (!lib_4.Helpers.exists(absPath)) {
            lib_4.Helpers.mkdirp(absPath);
        }
        const absFilePath = (0, lib_3.crossPlatformPath)(absPath);
        if (!lib_4.Helpers.isFolder(absPath)) {
            absPath = (0, lib_3.crossPlatformPath)(lib_3.path.dirname(absPath));
        }
        entityName = decodeURIComponent(entityName);
        const nearestProj = this.ins.nearestTo(this.cwd);
        // console.log({
        //   nearestProj: nearestProj?.location
        // })
        let container = this.project.ins.by(lib_2.LibTypeEnum.CONTAINER, nearestProj.framework.frameworkVersion);
        if (container.framework.frameworkVersionLessThan('v3')) {
            container = this.project.ins.by(lib_2.LibTypeEnum.CONTAINER, constants_1.DEFAULT_FRAMEWORK_VERSION);
        }
        const myEntity = 'my-entity';
        const flags = {
            flat: '_flat',
            custom: '_custom',
        };
        const isFlat = moduleName.includes(flags.flat);
        moduleName = moduleName.replace(flags.flat, '');
        const isCustom = moduleName.includes(flags.custom);
        moduleName = moduleName.replace(flags.custom, '');
        const exampleLocation = (0, lib_3.crossPlatformPath)([
            container.location,
            `gen-examples-${container.framework.frameworkVersion}`,
            moduleName,
            myEntity,
        ]);
        const newEntityName = lib_3.UtilsString.kebabCaseNoSplitNumbers(entityName);
        const generatedCodeAbsLoc = (0, lib_3.crossPlatformPath)([
            container.location,
            `gen-examples-${container.framework.frameworkVersion}`,
            moduleName,
            newEntityName,
        ]);
        lib_4.Helpers.remove(generatedCodeAbsLoc, true);
        let destination = (0, lib_3.crossPlatformPath)([absPath, newEntityName]);
        if (isFlat) {
            destination = (0, lib_3.crossPlatformPath)(lib_3.path.dirname(destination));
        }
        if (isCustom) {
            //#region handle custom cases
            if (moduleName === 'generated-index-exports') {
                this.project.framework.generateIndexTs(absPath);
            }
            if (moduleName === 'wrap-with-browser-regions') {
                if (!lib_4.Helpers.isFolder(absFilePath)) {
                    const content = lib_4.Helpers.readFile(absFilePath);
                    lib_4.Helpers.writeFile(absFilePath, `${lib_2.TAGS.COMMENT_REGION} ${lib_2.TAGS.BROWSER}\n` +
                        content +
                        `\n${lib_2.TAGS.COMMENT_END_REGION}\n`);
                }
            }
            if (moduleName === 'refactor-class-into-namespace') {
                if (!lib_4.Helpers.isFolder(absFilePath)) {
                    const content = lib_4.Helpers.readFile(absFilePath);
                    lib_4.Helpers.writeFile(absFilePath, lib_4.UtilsTypescript.refactorClassToNamespace(content));
                }
            }
            //#endregion
        }
        else {
            const ins = lib_1.MagicRenamer.Instance(exampleLocation);
            ins.start(`${myEntity} -> ${newEntityName}`);
            if (isFlat) {
                const files = lib_4.Helpers.filesFrom(generatedCodeAbsLoc, true);
                for (let index = 0; index < files.length; index++) {
                    const fileAbsPath = (0, lib_3.crossPlatformPath)(files[index]);
                    const relative = fileAbsPath.replace(generatedCodeAbsLoc + '/', '');
                    const destFileAbsPath = (0, lib_3.crossPlatformPath)([destination, relative]);
                    lib_4.HelpersTaon.copyFile(fileAbsPath, destFileAbsPath);
                }
                lib_4.Helpers.remove(generatedCodeAbsLoc, true);
            }
            else {
                lib_4.HelpersTaon.copy(generatedCodeAbsLoc, destination);
                lib_4.Helpers.remove(generatedCodeAbsLoc, true);
            }
            //#region fixing active context imports
            if (moduleName === 'dummy-angular-standalone-container' ||
                moduleName === 'taon-active-context') {
                const activeContextAbsFilePath = (0, lib_3.crossPlatformPath)([
                    destination,
                    `${newEntityName}.active.context.ts`,
                ]);
                const relativePath = activeContextAbsFilePath
                    .replace(nearestProj.pathFor([constants_1.srcMainProject, constants_1.appFromSrc]) + '/', '')
                    .replace('.ts', '');
                const back = lib_3._.times(relativePath.split('/').length, () => '..').join('/');
                const replaceTag = '@generated-imports-here';
                let orgContent = lib_4.Helpers.readFile(activeContextAbsFilePath);
                orgContent = lib_4.UtilsTypescript.addBelowPlaceholder(orgContent, replaceTag, `import { HOST_CONFIG } from '${back}/app.hosts';
import { MIGRATIONS_CLASSES_FOR_${lib_3._.upperFirst(lib_3._.camelCase(newEntityName))}ActiveContext }` +
                    ` from '${this.project.nameForNpmPackage}/${constants_1.srcFromTaonImport}';`);
                lib_4.Helpers.writeFile(activeContextAbsFilePath, orgContent.replace(replaceTag, ''));
            }
            //#endregion
        }
        if (this.project?.taonJson.shouldGenerateAutogenIndexFile) {
            await this.project.artifactsManager.artifact.npmLibAndCliTool.indexAutogenProvider.runTask({
                watch: false,
            });
            await this.project.artifactsManager.artifact.angularNodeApp.migrationHelper.runTask({
                watch: false,
            });
        }
        console.info('GENERATION DONE');
        this._exit(0);
        //#endregion
    }
    async libIndex() {
        //#region @backendFunc
        await this.project.framework.generateLibIndex();
        this._exit();
        //#endregion
    }
    async appRoutes() {
        //#region @backendFunc
        await this.project.framework.generateAppRoutes();
        this._exit();
        //#endregion
    }
    fieldsWebsqlRegions() {
        //#region @backendFunc
        const fileAbsPath = (0, lib_3.crossPlatformPath)(this.firstArg);
        const content = lib_4.Helpers.readFile(fileAbsPath);
        const fixedRegions = lib_4.UtilsTypescript.wrapContentClassMembersDecoratorsWithRegion(content, `${lib_2.TAGS.WEBSQL}`);
        if (content !== fixedRegions) {
            lib_4.Helpers.writeFile(fileAbsPath, fixedRegions);
            lib_4.UtilsTypescript.formatFile(fileAbsPath);
        }
        this._exit(0);
        //#endregion
    }
}
exports.$Generate = $Generate;
exports.default = {
    $Generate: lib_4.HelpersTaon.CLIWRAP($Generate, '$Generate'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-GENERATE.js.map