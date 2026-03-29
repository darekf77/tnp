//#region imports
import { MagicRenamer } from 'magic-renamer/lib-prod';
import { LibTypeEnum, TAGS, } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, ___NS__camelCase, ___NS__times, ___NS__upperFirst, UtilsString__NS__kebabCaseNoSplitNumbers } from 'tnp-core/lib-prod';
import { Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__isFolder, Helpers__NS__mkdirp, Helpers__NS__readFile, Helpers__NS__remove, Helpers__NS__writeFile, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, UtilsTypescript__NS__addBelowPlaceholder, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__refactorClassToNamespace, UtilsTypescript__NS__wrapContentClassMembersDecoratorsWithRegion } from 'tnp-helpers/lib-prod';
import { appFromSrc, DEFAULT_FRAMEWORK_VERSION, srcFromTaonImport, srcMainProject, } from '../../constants';
import { BaseCli } from './base-cli';
//#endregion
/**
 * TODO refactor move to tnp-helpers
 */ // @ts-ignore TODO weird inheritance problem
export class $Generate extends BaseCli {
    // @ts-ignore TODO weird inheritance problem
    async _() {
        //#region @backendFunc
        let [absPath, moduleName, entityName] = this.args;
        if (!Helpers__NS__exists(absPath)) {
            Helpers__NS__mkdirp(absPath);
        }
        const absFilePath = crossPlatformPath(absPath);
        if (!Helpers__NS__isFolder(absPath)) {
            absPath = crossPlatformPath(path.dirname(absPath));
        }
        entityName = decodeURIComponent(entityName);
        const nearestProj = this.ins.nearestTo(this.cwd);
        // console.log({
        //   nearestProj: nearestProj?.location
        // })
        let container = this.project.ins.by(LibTypeEnum.CONTAINER, nearestProj.framework.frameworkVersion);
        if (container.framework.frameworkVersionLessThan('v3')) {
            container = this.project.ins.by(LibTypeEnum.CONTAINER, DEFAULT_FRAMEWORK_VERSION);
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
        const exampleLocation = crossPlatformPath([
            container.location,
            `gen-examples-${container.framework.frameworkVersion}`,
            moduleName,
            myEntity,
        ]);
        const newEntityName = UtilsString__NS__kebabCaseNoSplitNumbers(entityName);
        const generatedCodeAbsLoc = crossPlatformPath([
            container.location,
            `gen-examples-${container.framework.frameworkVersion}`,
            moduleName,
            newEntityName,
        ]);
        Helpers__NS__remove(generatedCodeAbsLoc, true);
        let destination = crossPlatformPath([absPath, newEntityName]);
        if (isFlat) {
            destination = crossPlatformPath(path.dirname(destination));
        }
        if (isCustom) {
            //#region handle custom cases
            if (moduleName === 'generated-index-exports') {
                this.project.framework.generateIndexTs(absPath);
            }
            if (moduleName === 'wrap-with-browser-regions') {
                if (!Helpers__NS__isFolder(absFilePath)) {
                    const content = Helpers__NS__readFile(absFilePath);
                    Helpers__NS__writeFile(absFilePath, `${TAGS.COMMENT_REGION} ${TAGS.BROWSER}\n` +
                        content +
                        `\n${TAGS.COMMENT_END_REGION}\n`);
                }
            }
            if (moduleName === 'refactor-class-into-namespace') {
                if (!Helpers__NS__isFolder(absFilePath)) {
                    const content = Helpers__NS__readFile(absFilePath);
                    Helpers__NS__writeFile(absFilePath, UtilsTypescript__NS__refactorClassToNamespace(content));
                }
            }
            //#endregion
        }
        else {
            const ins = MagicRenamer.Instance(exampleLocation);
            ins.start(`${myEntity} -> ${newEntityName}`);
            if (isFlat) {
                const files = Helpers__NS__filesFrom(generatedCodeAbsLoc, true);
                for (let index = 0; index < files.length; index++) {
                    const fileAbsPath = crossPlatformPath(files[index]);
                    const relative = fileAbsPath.replace(generatedCodeAbsLoc + '/', '');
                    const destFileAbsPath = crossPlatformPath([destination, relative]);
                    HelpersTaon__NS__copyFile(fileAbsPath, destFileAbsPath);
                }
                Helpers__NS__remove(generatedCodeAbsLoc, true);
            }
            else {
                HelpersTaon__NS__copy(generatedCodeAbsLoc, destination);
                Helpers__NS__remove(generatedCodeAbsLoc, true);
            }
            //#region fixing active context imports
            if (moduleName === 'dummy-angular-standalone-container' ||
                moduleName === 'taon-active-context') {
                const activeContextAbsFilePath = crossPlatformPath([
                    destination,
                    `${newEntityName}.active.context.ts`,
                ]);
                const relativePath = activeContextAbsFilePath
                    .replace(nearestProj.pathFor([srcMainProject, appFromSrc]) + '/', '')
                    .replace('.ts', '');
                const back = ___NS__times(relativePath.split('/').length, () => '..').join('/');
                const replaceTag = '@generated-imports-here';
                let orgContent = Helpers__NS__readFile(activeContextAbsFilePath);
                orgContent = UtilsTypescript__NS__addBelowPlaceholder(orgContent, replaceTag, `import { HOST_CONFIG } from '${back}/app.hosts';
import { MIGRATIONS_CLASSES_FOR_${___NS__upperFirst(___NS__camelCase(newEntityName))}ActiveContext }` +
                    ` from '${this.project.nameForNpmPackage}/${srcFromTaonImport}';`);
                Helpers__NS__writeFile(activeContextAbsFilePath, orgContent.replace(replaceTag, ''));
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
        const fileAbsPath = crossPlatformPath(this.firstArg);
        const content = Helpers__NS__readFile(fileAbsPath);
        const fixedRegions = UtilsTypescript__NS__wrapContentClassMembersDecoratorsWithRegion(content, `${TAGS.WEBSQL}`);
        if (content !== fixedRegions) {
            Helpers__NS__writeFile(fileAbsPath, fixedRegions);
            UtilsTypescript__NS__formatFile(fileAbsPath);
        }
        this._exit(0);
        //#endregion
    }
}
export default {
    $Generate: HelpersTaon__NS__CLIWRAP($Generate, '$Generate'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-GENERATE.js.map