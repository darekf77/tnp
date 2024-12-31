//#region imports
import {
  BaseFeatureForProject,
  BaseDebounceCompilerForProject,
  UtilsTypescript,
} from 'tnp-helpers/src';
import { Project } from './project';
import { ChangeOfFile } from 'incremental-compiler/src';
import { config } from 'tnp-config/src';
import { Helpers, _, UtilsMigrations } from 'tnp-core/src';
//#endregion

export class MigrationHelper extends BaseDebounceCompilerForProject<
  {},
  Project
> {
  //#region constructor
  constructor(public project: Project) {
    super(project, {
      folderPath: project.pathFor([
        config.folder.src,
        config.folder.migrations,
      ]),
      taskName: 'MigrationHelper',
      notifyOnFileUnlink: true,
    });
  }
  //#endregion

  //#region migration index autogenerated ts file
  public readonly migration_index_autogenerated_ts =
    'migrations_index._auto-generated_.ts';

  get migrationIndexAutogeneratedTsFileAbsPath() {
    return this.project.pathFor([
      config.folder.src,
      config.folder.migrations,
      this.migration_index_autogenerated_ts,
    ]);
  }
  //#endregion

  //#region rebuild
  rebuild(
    relativePathsWithClasses: {
      relativePath: string;
      absPath: string;
      classes: string[];
    }[],
  ) {
    //#region @backendFunc
    Helpers.taskStarted(`Rebuilding migration index file...`);
    const allClassesByTimestamp: string[] = relativePathsWithClasses
      .reduce((acc, c) => acc.concat(c.classes), [])
      .sort((classA, classB) => {
        const timestampA = UtilsMigrations.getTimestampFromClassName(classA);
        const timestampB = UtilsMigrations.getTimestampFromClassName(classB);

        return timestampA - timestampB; // Ascending order
      });

    const allContexts = allClassesByTimestamp.reduce(
      (alreadyAddedClassesObj, className) => {
        const contextName: string = _.first(className.split('_')) || '';
        if (!alreadyAddedClassesObj[contextName]) {
          alreadyAddedClassesObj[contextName] = [];
        }
        alreadyAddedClassesObj[contextName].push(className);
        return alreadyAddedClassesObj;
      },
      {},
    );
    const allImports = relativePathsWithClasses
      .filter(c => c.classes.length >= 1)
      .map(c => {
        return (
          `import { ${c.classes.join(', ')} } from ` +
          `'./${c.relativePath.replace('.ts', '')}';`
        );
      });
    // console.log('MigrationHelper rebuild for ', relativePathsWithClasses);

    // export const MIGRATIONS_CLASSES = [${allClasses.join(',\n')}];
    Helpers.writeFile(
      this.migrationIndexAutogeneratedTsFileAbsPath,
      `
// THIS FILE IS GENERATED - DO NOT MODIFY
${allImports.join('\n')}
// THIS FILE IS GENERATED - DO NOT MODIFY
${_.keys(allContexts)
  .map(contextName => {
    const classes = allContexts[contextName];
    return (
      `export const MIGRATIONS_CLASSES_FOR_${contextName}` +
      ` = {${classes
        .map(c => {
          return `/* ${UtilsMigrations.getFormattedTimestampFromClassName(c)} */ ${c}`;
        })
        .join(',\n ')}};`
    );
  })
  .join('\n')}
// THIS FILE IS GENERATED - DO NOT MODIFY
      `,
    );
    UtilsTypescript.formatFile(this.migrationIndexAutogeneratedTsFileAbsPath);
    Helpers.taskDone(`Rebuilding migration index Done`);
    //#endregion
  }
  //#endregion

  //#region action
  action({
    changeOfFiles,
    asyncEvent,
  }: {
    changeOfFiles: ChangeOfFile[];
    asyncEvent: boolean;
  }) {
    //#region @backendFunc
    if (
      !this.project.hasFile([
        config.folder.src,
        config.folder.migrations,
        config.file.index_ts,
      ])
    ) {
      Helpers.writeFile(
        this.project.pathFor([
          config.folder.src,
          config.folder.migrations,
          config.file.index_ts,
        ]),
        `//@ts-nocheck
export * from './${this.migration_index_autogenerated_ts.replace('.ts', '')}';
        `.trim() + '\n',
      );
    }
    if (
      changeOfFiles.length === 1 &&
      (_.first(changeOfFiles).fileAbsolutePath.endsWith(
        this.migration_index_autogenerated_ts,
      ) ||
        !_.first(changeOfFiles).fileAbsolutePath.endsWith('.ts'))
    ) {
      // console.log('MigrationHelper action skipped');
      return;
    }
    // console.log('MigrationHelper action for ', changeOfFiles);
    this.rebuild(
      this.exitedFilesAbsPathes
        .filter(f => f.endsWith('.ts') && !f.endsWith('._auto-generated_.ts'))
        .map(c => {
          return {
            absPath: c,
            relativePath: this.project
              .relative(c)
              .split('/')
              .slice(2)
              .join('/'),
            classes: UtilsTypescript.extractClassNamesFromFile(c),
          };
        }),
    );
    //#endregion
  }
  //#endregion
}
