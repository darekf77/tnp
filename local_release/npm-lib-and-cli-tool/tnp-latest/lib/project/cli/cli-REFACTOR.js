"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Refactor = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
const options_1 = require("../../options");
const base_cli_1 = require("./base-cli");
//#endregion
// @ts-ignore TODO weird inheritance problem
class $Refactor extends base_cli_1.BaseCli {
    //#region refactor
    async _() {
        lib_2.Helpers.info(`Initing before refactor...`);
        // this._exit();
        await this.project.init(options_1.EnvOptions.from({ purpose: 'initing before refactor' }));
        lib_2.Helpers.taskStarted('Refactoring...');
        await this.project.refactor.ALL({
            fixSpecificFile: this.firstArg,
        });
        lib_2.Helpers.taskDone(`Done refactoring...`);
        this._exit();
    }
    //#endregion
    //#region prettier
    async prettier() {
        lib_2.Helpers.info(`Initing before prettier...`);
        await this.project.init(options_1.EnvOptions.from({ purpose: 'initing before prettier' }));
        await this.project.refactor.prettier({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    //#endregion
    //#region eslint
    async eslint() {
        lib_2.Helpers.info(`Initing before eslint fix...`);
        await this.project.init(options_1.EnvOptions.from({ purpose: 'initing before eslint fix' }));
        await this.project.refactor.eslint({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    //#endregion
    //#region removeBrowserRegion
    async removeBrowserRegion() {
        lib_2.Helpers.info(`Initing before removing browser region...`);
        await this.project.init(options_1.EnvOptions.from({ purpose: 'initing before removing browser region' }));
        await this.project.refactor.removeBrowserRegion({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    //#endregion
    //#region changeCssToScss
    async changeCssToScss() {
        lib_2.Helpers.info(`Initing before changing css to scss...`);
        await this.project.init(options_1.EnvOptions.from({ purpose: 'initing before changing css to scss' }));
        await this.project.refactor.changeCssToScss({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    //#endregion
    //#region properStandaloneNg19
    async properStandaloneNg19() {
        lib_2.Helpers.info(`Initing before changing standalone property..`);
        await this.project.init(options_1.EnvOptions.from({
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
        lib_2.Helpers.info(`Initing before wrapping imports..`);
        await this.project.init(options_1.EnvOptions.from({ purpose: 'initing before wrapping imports' }));
        await this.project.refactor.importsWrap({
            fixSpecificFile: this.firstArg,
        });
        this._exit();
    }
    //#endregion
    //#region flatten imports
    async flattenImports() {
        lib_2.Helpers.info(`Initing before flattening imports..`);
        await this.project.init(options_1.EnvOptions.from({ purpose: 'initing before flattening imports' }));
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
        lib_2.Helpers.info(`Initing before migrating to Angular v21 standalone...`);
        const appFile = this.project.pathFor([constants_1.srcMainProject, constants_1.appTsFromSrc]);
        let tsFileContent = await lib_2.Helpers.readFile(appFile);
        tsFileContent = lib_2.UtilsTypescript.migrateFromNgModulesToStandaloneV21(tsFileContent, lib_1._.upperFirst(lib_1._.camelCase(this.project.name)));
        // import { RenderMode, ServerRoute } from '@angular/ssr';
        tsFileContent = lib_2.UtilsTypescript.addOrUpdateImportIfNotExists(tsFileContent, ['RenderMode', 'ServerRoute', 'provideServerRendering', 'withRoutes'], '@angular/ssr');
        tsFileContent = lib_2.UtilsTypescript.addOrUpdateImportIfNotExists(tsFileContent, [
            'ApplicationConfig',
            'mergeApplicationConfig',
            'provideBrowserGlobalErrorListeners',
            'APP_INITIALIZER',
            'isDevMode',
        ], '@angular/core');
        tsFileContent = lib_2.UtilsTypescript.addOrUpdateImportIfNotExists(tsFileContent, ['provideClientHydration', 'withEventReplay'], '@angular/platform-browser');
        // import { provideServiceWorker } from '@angular/service-worker';
        tsFileContent = lib_2.UtilsTypescript.addOrUpdateImportIfNotExists(tsFileContent, ['provideServiceWorker'], '@angular/service-worker');
        // provideRouter
        tsFileContent = lib_2.UtilsTypescript.addOrUpdateImportIfNotExists(tsFileContent, ['provideRouter'], '@angular/router');
        await lib_2.Helpers.writeFile(appFile, tsFileContent);
        lib_2.UtilsTypescript.formatFile(appFile);
        lib_2.Helpers.info(`Migrated to Angular v21 standalone in ${appFile}`);
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
exports.$Refactor = $Refactor;
exports.default = {
    $Refactor: lib_2.HelpersTaon.CLIWRAP($Refactor, '$Refactor'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-REFACTOR.js.map