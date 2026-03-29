//#region imports
import { TAGS } from 'tnp-core/lib-prod';
import { path, ___NS__camelCase, ___NS__upperFirst, Helpers__NS__info, Helpers__NS__isFolder, Helpers__NS__logInfo, Helpers__NS__readFile, Helpers__NS__taskDone, Helpers__NS__writeFile } from 'tnp-core/lib-prod';
import { UtilsTypescript__NS__addBelowPlaceholder, UtilsTypescript__NS__fileHasDefaultExport, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__removeTaggedArrayObjects, UtilsTypescript__NS__removeTaggedImportExport, UtilsTypescript__NS__removeTaggedLines } from 'tnp-helpers/lib-prod';
import { BaseCompilerForProject } from 'tnp-helpers/lib-prod';
import { appTsFromSrc, srcMainProject } from '../../../../../constants';
//#endregion
// @ts-ignore TODO weird inheritance problem
export class AppRoutesAutogenProvider extends BaseCompilerForProject {
    propertyInTaonJsonc = 'shouldGenerateAutogenIndexFile';
    //#region @backend
    constructor(project) {
        super(project, {
            folderPath: project.pathFor([srcMainProject]),
            subscribeOnlyFor: ['ts', 'tsx'],
            taskName: 'AppTsRoutesAutogenProvider',
        });
    }
    //#endregion
    contextsRelativePaths = [];
    routesRelativePaths = [];
    processFile(absFilePath) {
        //#region @backendFunc
        if (!Helpers__NS__isFolder(absFilePath)) {
            const relativePath = absFilePath.replace(this.project.pathFor([srcMainProject]) + '/', '');
            // Helpers__NS__info('checking');
            // Helpers__NS__info( relativePath );
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
        const appFilePath = this.project.pathFor([srcMainProject, appTsFromSrc]);
        let appFileContent = Helpers__NS__readFile(appFilePath);
        appFileContent = UtilsTypescript__NS__removeTaggedImportExport(appFileContent, [TAGS.APP_TS_GENERATED], true);
        appFileContent = UtilsTypescript__NS__removeTaggedArrayObjects(appFileContent, [TAGS.APP_TS_GENERATED], true);
        appFileContent = UtilsTypescript__NS__removeTaggedLines(appFileContent, [TAGS.APP_TS_GENERATED], true);
        const generatedImports = [
            ...this.contextsRelativePaths,
            // ...this.routesRelativePaths,
        ].map(r => {
            const baseName = path.basename(r);
            const cleanBasename = baseName.replace('.ts', '').replace('.tsx', '');
            r = r.replace(baseName, cleanBasename);
            const importName = ___NS__upperFirst(___NS__camelCase(cleanBasename));
            return `import { ${importName} } from './${r}'; // ${TAGS.APP_TS_GENERATED}`;
        });
        appFileContent = UtilsTypescript__NS__addBelowPlaceholder(appFileContent, TAGS.APP_TS_PLACEHOLDER_IMPORTS, generatedImports.join('\n'));
        const generateRoutes = this.routesRelativePaths
            .filter(r => {
            // console.log('checking ', this.project.pathFor([srcMainProject, r]));
            return UtilsTypescript__NS__fileHasDefaultExport(this.project.pathFor([srcMainProject, r]));
        })
            .map(r => {
            const baseName = path.basename(r);
            const cleanBasename = baseName.replace('.ts', '').replace('.tsx', '');
            r = r.replace(baseName, cleanBasename);
            const importName = ___NS__upperFirst(___NS__camelCase(cleanBasename));
            let contextExistsForRoute = this.contextsRelativePaths.find(cr => {
                return path.dirname(cr) === path.dirname(r);
            });
            contextExistsForRoute = contextExistsForRoute
                ? contextExistsForRoute.replace('.ts', '').replace('.tsx', '')
                : void 0;
            return ` // ${TAGS.APP_TS_GENERATED}
    {
    path: '${path.dirname(r).replace('app/', '')}',
    ${contextExistsForRoute
                ? `providers: [
      {
        provide: TAON_CONTEXT,
        useFactory: () => ${___NS__upperFirst(___NS__camelCase(path.basename(contextExistsForRoute)))},
      },
    ],`
                : ''}
    loadChildren: () =>
      import('./${r}').then(m => m.${importName}),
  },`;
        });
        appFileContent = UtilsTypescript__NS__addBelowPlaceholder(appFileContent, TAGS.APP_TS_PLACEHOLDER_ROUTES, generateRoutes.join('\n'));
        const generatedInitContextFunctions = this.contextsRelativePaths.map(r => {
            const baseName = path.basename(r);
            const cleanBasename = baseName.replace('.ts', '').replace('.tsx', '');
            return `${___NS__upperFirst(___NS__camelCase(cleanBasename))}, // ${TAGS.APP_TS_GENERATED}`;
        });
        appFileContent = UtilsTypescript__NS__addBelowPlaceholder(appFileContent, TAGS.APP_TS_PLACEHOLDER_CONTEXTS_INIT, generatedInitContextFunctions.join('\n'));
        Helpers__NS__writeFile(appFilePath, appFileContent);
        UtilsTypescript__NS__formatFile(appFilePath);
        //#endregion
    }
    async syncAction(absolteFilesPathes, initialParams) {
        //#region @backendFunc
        Helpers__NS__logInfo(`App.ts provider for project: ${this.project.genericName}`);
        Helpers__NS__info(`Generating index autogen file...`);
        for (const absFilePath of absolteFilesPathes) {
            this.processFile(absFilePath);
        }
        this.writeDataIntoAppTs();
        Helpers__NS__taskDone(`App.ts provider for project: ${this.project.genericName}`);
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/app-routes-autogen-provider.js.map