import { ___NS__camelCase, ___NS__upperFirst } from 'tnp-core/lib-prod';
import { Helpers__NS__info, Helpers__NS__readFile, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__writeFile, HelpersTaon__NS__CLIWRAP, UtilsTypescript__NS__addOrUpdateImportIfNotExists, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__migrateFromNgModulesToStandaloneV21 } from 'tnp-helpers/lib-prod';
import { appTsFromSrc, srcMainProject, } from '../../constants';
import { EnvOptions } from '../../options';
import { BaseCli } from './base-cli';
//#endregion
// @ts-ignore TODO weird inheritance problem
export class $Refactor extends BaseCli {
    //#region refactor
    async _() {
        Helpers__NS__info(`Initing before refactor...`);
        // this._exit();
        await this.project.init(EnvOptions.from({ purpose: 'initing before refactor' }));
        Helpers__NS__taskStarted('Refactoring...');
        await this.project.refactor.ALL({
            fixSpecificFile: this.firstArg,
        });
        Helpers__NS__taskDone(`Done refactoring...`);
        this._exit();
    }
    //#endregion
    //#region prettier
    async prettier() {
        Helpers__NS__info(`Initing before prettier...`);
        await this.project.init(EnvOptions.from({ purpose: 'initing before prettier' }));
        await this.project.refactor.prettier({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    //#endregion
    //#region eslint
    async eslint() {
        Helpers__NS__info(`Initing before eslint fix...`);
        await this.project.init(EnvOptions.from({ purpose: 'initing before eslint fix' }));
        await this.project.refactor.eslint({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    //#endregion
    //#region removeBrowserRegion
    async removeBrowserRegion() {
        Helpers__NS__info(`Initing before removing browser region...`);
        await this.project.init(EnvOptions.from({ purpose: 'initing before removing browser region' }));
        await this.project.refactor.removeBrowserRegion({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    //#endregion
    //#region changeCssToScss
    async changeCssToScss() {
        Helpers__NS__info(`Initing before changing css to scss...`);
        await this.project.init(EnvOptions.from({ purpose: 'initing before changing css to scss' }));
        await this.project.refactor.changeCssToScss({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    //#endregion
    //#region properStandaloneNg19
    async properStandaloneNg19() {
        Helpers__NS__info(`Initing before changing standalone property..`);
        await this.project.init(EnvOptions.from({
            purpose: 'initing before changing standalone property',
        }));
        await this.project.refactor.properStandaloneNg19({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    //#endregion
    //#region imports region wrap
    async importsWrap() {
        Helpers__NS__info(`Initing before wrapping imports..`);
        await this.project.init(EnvOptions.from({ purpose: 'initing before wrapping imports' }));
        await this.project.refactor.importsWrap({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    //#endregion
    //#region flatten imports
    async flattenImports() {
        Helpers__NS__info(`Initing before flattening imports..`);
        await this.project.init(EnvOptions.from({ purpose: 'initing before flattening imports' }));
        await this.project.refactor.flattenImports({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    //#endregion
    //#region refactor taon names
    async taonNames() {
        await this.project.refactor.taonNames({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    //#endregion
    //#region ng21 update
    async ng21() {
        //#region @backendFunc
        Helpers__NS__info(`Initing before migrating to Angular v21 standalone...`);
        const appFile = this.project.pathFor([srcMainProject, appTsFromSrc]);
        let tsFileContent = await Helpers__NS__readFile(appFile);
        tsFileContent = UtilsTypescript__NS__migrateFromNgModulesToStandaloneV21(tsFileContent, ___NS__upperFirst(___NS__camelCase(this.project.name)));
        // import { RenderMode, ServerRoute } from '@angular/ssr';
        tsFileContent = UtilsTypescript__NS__addOrUpdateImportIfNotExists(tsFileContent, ['RenderMode', 'ServerRoute', 'provideServerRendering', 'withRoutes'], '@angular/ssr');
        tsFileContent = UtilsTypescript__NS__addOrUpdateImportIfNotExists(tsFileContent, [
            'ApplicationConfig',
            'mergeApplicationConfig',
            'provideBrowserGlobalErrorListeners',
            'APP_INITIALIZER',
            'isDevMode',
        ], '@angular/core');
        tsFileContent = UtilsTypescript__NS__addOrUpdateImportIfNotExists(tsFileContent, ['provideClientHydration', 'withEventReplay'], '@angular/platform-browser');
        // import { provideServiceWorker } from '@angular/service-worker';
        tsFileContent = UtilsTypescript__NS__addOrUpdateImportIfNotExists(tsFileContent, ['provideServiceWorker'], '@angular/service-worker');
        // provideRouter
        tsFileContent = UtilsTypescript__NS__addOrUpdateImportIfNotExists(tsFileContent, ['provideRouter'], '@angular/router');
        await Helpers__NS__writeFile(appFile, tsFileContent);
        UtilsTypescript__NS__formatFile(appFile);
        Helpers__NS__info(`Migrated to Angular v21 standalone in ${appFile}`);
        this._exit();
        //#endregion
    }
    //#endregion
    async selfImports() {
        await this.project.refactor.selfImports({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    async classIntoNs() {
        await this.project.refactor.classIntoNs({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
}
export default {
    $Refactor: HelpersTaon__NS__CLIWRAP($Refactor, '$Refactor'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-REFACTOR.js.map