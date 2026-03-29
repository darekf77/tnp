"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoutesAutogenProvider = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const lib_4 = require("tnp-helpers/lib");
const constants_1 = require("../../../../../constants");
//#endregion
// @ts-ignore TODO weird inheritance problem
class AppRoutesAutogenProvider extends lib_4.BaseCompilerForProject {
    propertyInTaonJsonc = 'shouldGenerateAutogenIndexFile';
    //#region @backend
    constructor(project) {
        super(project, {
            folderPath: project.pathFor([constants_1.srcMainProject]),
            subscribeOnlyFor: ['ts', 'tsx'],
            taskName: 'AppTsRoutesAutogenProvider',
        });
    }
    //#endregion
    contextsRelativePaths = [];
    routesRelativePaths = [];
    processFile(absFilePath) {
        //#region @backendFunc
        if (!lib_2.Helpers.isFolder(absFilePath)) {
            const relativePath = absFilePath.replace(this.project.pathFor([constants_1.srcMainProject]) + '/', '');
            // Helpers.info('checking');
            // Helpers.info( relativePath );
            if (!relativePath.startsWith('app/')) {
                return;
            }
            if (relativePath.endsWith('.context.ts') ||
                relativePath.endsWith('.context.tsx')) {
                if (!this.contextsRelativePaths.includes(relativePath)) {
                    this.contextsRelativePaths.push(relativePath);
                }
            }
            if (relativePath.endsWith('.routes.ts') ||
                relativePath.endsWith('.routes.tsx')) {
                if (!this.routesRelativePaths.includes(relativePath)) {
                    this.routesRelativePaths.push(relativePath);
                }
            }
        }
        //#endregion
    }
    writeDataIntoAppTs() {
        //#region @backendFunc
        const appFilePath = this.project.pathFor([constants_1.srcMainProject, constants_1.appTsFromSrc]);
        let appFileContent = lib_2.Helpers.readFile(appFilePath);
        appFileContent = lib_3.UtilsTypescript.removeTaggedImportExport(appFileContent, [lib_1.TAGS.APP_TS_GENERATED], true);
        appFileContent = lib_3.UtilsTypescript.removeTaggedArrayObjects(appFileContent, [lib_1.TAGS.APP_TS_GENERATED], true);
        appFileContent = lib_3.UtilsTypescript.removeTaggedLines(appFileContent, [lib_1.TAGS.APP_TS_GENERATED], true);
        const generatedImports = [
            ...this.contextsRelativePaths,
            // ...this.routesRelativePaths,
        ].map(r => {
            const baseName = lib_2.path.basename(r);
            const cleanBasename = baseName.replace('.ts', '').replace('.tsx', '');
            r = r.replace(baseName, cleanBasename);
            const importName = lib_2._.upperFirst(lib_2._.camelCase(cleanBasename));
            return `import { ${importName} } from './${r}'; // ${lib_1.TAGS.APP_TS_GENERATED}`;
        });
        appFileContent = lib_3.UtilsTypescript.addBelowPlaceholder(appFileContent, lib_1.TAGS.APP_TS_PLACEHOLDER_IMPORTS, generatedImports.join('\n'));
        const generateRoutes = this.routesRelativePaths
            .filter(r => {
            // console.log('checking ', this.project.pathFor([srcMainProject, r]));
            return lib_3.UtilsTypescript.fileHasDefaultExport(this.project.pathFor([constants_1.srcMainProject, r]));
        })
            .map(r => {
            const baseName = lib_2.path.basename(r);
            const cleanBasename = baseName.replace('.ts', '').replace('.tsx', '');
            r = r.replace(baseName, cleanBasename);
            const importName = lib_2._.upperFirst(lib_2._.camelCase(cleanBasename));
            let contextExistsForRoute = this.contextsRelativePaths.find(cr => {
                return lib_2.path.dirname(cr) === lib_2.path.dirname(r);
            });
            contextExistsForRoute = contextExistsForRoute
                ? contextExistsForRoute.replace('.ts', '').replace('.tsx', '')
                : void 0;
            return ` // ${lib_1.TAGS.APP_TS_GENERATED}
    {
    path: '${lib_2.path.dirname(r).replace('app/', '')}',
    ${contextExistsForRoute
                ? `providers: [
      {
        provide: TAON_CONTEXT,
        useFactory: () => ${lib_2._.upperFirst(lib_2._.camelCase(lib_2.path.basename(contextExistsForRoute)))},
      },
    ],`
                : ''}
    loadChildren: () =>
      import('./${r}').then(m => m.${importName}),
  },`;
        });
        appFileContent = lib_3.UtilsTypescript.addBelowPlaceholder(appFileContent, lib_1.TAGS.APP_TS_PLACEHOLDER_ROUTES, generateRoutes.join('\n'));
        const generatedInitContextFunctions = this.contextsRelativePaths.map(r => {
            const baseName = lib_2.path.basename(r);
            const cleanBasename = baseName.replace('.ts', '').replace('.tsx', '');
            return `${lib_2._.upperFirst(lib_2._.camelCase(cleanBasename))}, // ${lib_1.TAGS.APP_TS_GENERATED}`;
        });
        appFileContent = lib_3.UtilsTypescript.addBelowPlaceholder(appFileContent, lib_1.TAGS.APP_TS_PLACEHOLDER_CONTEXTS_INIT, generatedInitContextFunctions.join('\n'));
        lib_2.Helpers.writeFile(appFilePath, appFileContent);
        lib_3.UtilsTypescript.formatFile(appFilePath);
        //#endregion
    }
    async syncAction(absolteFilesPathes, initialParams) {
        //#region @backendFunc
        lib_2.Helpers.logInfo(`App.ts provider for project: ${this.project.genericName}`);
        lib_2.Helpers.info(`Generating index autogen file...`);
        for (const absFilePath of absolteFilesPathes) {
            this.processFile(absFilePath);
        }
        this.writeDataIntoAppTs();
        lib_2.Helpers.taskDone(`App.ts provider for project: ${this.project.genericName}`);
        //#endregion
    }
}
exports.AppRoutesAutogenProvider = AppRoutesAutogenProvider;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/app-routes-autogen-provider.js.map