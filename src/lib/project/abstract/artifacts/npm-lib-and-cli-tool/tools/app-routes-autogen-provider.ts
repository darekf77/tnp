//#region imports
import { TAGS } from 'tnp-core/src';
import { Helpers, _, path } from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';
import { BaseCompilerForProject } from 'tnp-helpers/src';

import { appTsFromSrc, srcMainProject } from '../../../../../constants';
import type { Project } from '../../../project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class AppRoutesAutogenProvider extends BaseCompilerForProject<
  {},
  // @ts-ignore TODO weird inheritance problem
  Project
> {
  public readonly propertyInTaonJsonc = 'shouldGenerateAutogenIndexFile';

  //#region @backend
  constructor(project: Project) {
    super(project, {
      folderPath: project.pathFor([srcMainProject]),
      subscribeOnlyFor: ['ts', 'tsx'],
      taskName: 'AppTsRoutesAutogenProvider',
    });
  }
  //#endregion

  private contextsRelativePaths: string[] = [];
  private routesRelativePaths: string[] = [];

  private processFile(absFilePath: string) {
    //#region @backendFunc
    if (!Helpers.isFolder(absFilePath)) {
      const relativePath = absFilePath.replace(
        this.project.pathFor([srcMainProject]) + '/',
        '',
      );
      // Helpers.info('checking');
      // Helpers.info( relativePath );

      if (!relativePath.startsWith('app/')) {
        return;
      }

      if (
        relativePath.endsWith('.context.ts') ||
        relativePath.endsWith('.context.tsx')
      ) {
        if (!this.contextsRelativePaths.includes(relativePath)) {
          this.contextsRelativePaths.push(relativePath);
        }
      }

      if (
        relativePath.endsWith('.routes.ts') ||
        relativePath.endsWith('.routes.tsx')
      ) {
        if (!this.routesRelativePaths.includes(relativePath)) {
          this.routesRelativePaths.push(relativePath);
        }
      }
    }
    //#endregion
  }

  public writeDataIntoAppTs() {
    //#region @backendFunc
    const appFilePath = this.project.pathFor([srcMainProject, appTsFromSrc]);
    let appFileContent = Helpers.readFile(appFilePath);

    appFileContent = UtilsTypescript.removeTaggedImportExport(
      appFileContent,
      [TAGS.APP_TS_GENERATED],
      true,
    );

    appFileContent = UtilsTypescript.removeTaggedArrayObjects(
      appFileContent,
      [TAGS.APP_TS_GENERATED],
      true,
    );

    appFileContent = UtilsTypescript.removeTaggedLines(
      appFileContent,
      [TAGS.APP_TS_GENERATED],
      true,
    );

    const generatedImports: string[] = [
      ...this.contextsRelativePaths,
      // ...this.routesRelativePaths,
    ].map(r => {
      const baseName = path.basename(r);
      const cleanBasename = baseName.replace('.ts', '').replace('.tsx', '');
      r = r.replace(baseName, cleanBasename);
      const importName = _.upperFirst(_.camelCase(cleanBasename));
      return `import { ${importName} } from './${r}'; // ${TAGS.APP_TS_GENERATED}`;
    });

    appFileContent = UtilsTypescript.addBelowPlaceholder(
      appFileContent,
      TAGS.APP_TS_PLACEHOLDER_IMPORTS,
      generatedImports.join('\n'),
    );

    const generateRoutes = this.routesRelativePaths
      .filter(r => {
        // console.log('checking ', this.project.pathFor([srcMainProject, r]));
        return UtilsTypescript.fileHasDefaultExport(
          this.project.pathFor([srcMainProject, r]),
        );
      })
      .map(r => {
        const baseName = path.basename(r);
        const cleanBasename = baseName.replace('.ts', '').replace('.tsx', '');
        r = r.replace(baseName, cleanBasename);
        const importName = _.upperFirst(_.camelCase(cleanBasename));

        let contextExistsForRoute = this.contextsRelativePaths.find(cr => {
          return path.dirname(cr) === path.dirname(r);
        });
        contextExistsForRoute = contextExistsForRoute
          ? contextExistsForRoute.replace('.ts', '').replace('.tsx', '')
          : void 0;

        return ` // ${TAGS.APP_TS_GENERATED}
    {
    path: '${path.dirname(r).replace('app/', '')}',
    ${
      contextExistsForRoute
        ? `providers: [
      {
        provide: TAON_CONTEXT,
        useFactory: () => ${_.upperFirst(_.camelCase(path.basename(contextExistsForRoute)))},
      },
    ],`
        : ''
    }
    loadChildren: () =>
      import('./${r}').then(m => m.${importName}),
  },`;
      });

    appFileContent = UtilsTypescript.addBelowPlaceholder(
      appFileContent,
      TAGS.APP_TS_PLACEHOLDER_ROUTES,
      generateRoutes.join('\n'),
    );

    const generatedInitContextFunctions = this.contextsRelativePaths.map(r => {
      const baseName = path.basename(r);
      const cleanBasename = baseName.replace('.ts', '').replace('.tsx', '');
      return `${_.upperFirst(_.camelCase(cleanBasename))}, // ${TAGS.APP_TS_GENERATED}`;
    });

    appFileContent = UtilsTypescript.addBelowPlaceholder(
      appFileContent,
      TAGS.APP_TS_PLACEHOLDER_CONTEXTS_INIT,
      generatedInitContextFunctions.join('\n'),
    );

    Helpers.writeFile(appFilePath, appFileContent);
    UtilsTypescript.formatFile(appFilePath);
    //#endregion
  }

  async syncAction(
    absolteFilesPathes?: string[],
    initialParams?: {},
  ): Promise<void> {
    //#region @backendFunc
    Helpers.logInfo(`App.ts provider for project: ${this.project.genericName}`);
    Helpers.info(`Generating index autogen file...`);
    for (const absFilePath of absolteFilesPathes) {
      this.processFile(absFilePath);
    }
    this.writeDataIntoAppTs();
    Helpers.taskDone(
      `App.ts provider for project: ${this.project.genericName}`,
    );
    //#endregion
  }
}
