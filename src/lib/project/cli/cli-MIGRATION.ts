//#region imports
import { config, taonPackageName } from 'tnp-core/src';
import {
  Utils,
  UtilsMigrations,
  UtilsTerminal,
  _,
  chalk,
  path,
} from 'tnp-core/src';
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';

import {
  migrationsFromSrc,
  srcFromTaonImport,
  srcMainProject,
} from '../../constants';
import { EnvOptions } from '../../options';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem
class $Migration extends BaseCli {
  //#region migration console menu

  public async _() {
    await this._displayMenu();
  }
  //#endregion

  //#region display menu
  async _displayMenu() {
    //#region @backend
    const options = {
      create: {
        name: `Create migration file`,
      },
      run: {
        name: `Run all migrations`,
      },
      revert: {
        name: `Revert to migration timestamp`,
      },
    };

    const resp = await UtilsTerminal.select<keyof typeof options>({
      choices: options,
      question: `What you wanna do with migrations?`,
    });

    if (resp === 'create') {
      const migrationName = await UtilsTerminal.input({
        question: `Migration name (as parameter)`,
        required: true,
      });
      await this.create(migrationName);
    } else if (resp === 'run') {
      await this.run();
    } else if (resp === 'revert') {
      const allMigrationsOptions = Helpers.getFilesFrom(
        this.project.pathFor([srcMainProject, migrationsFromSrc]),
        {
          recursive: true,
        },
      )
        .filter(f => {
          const timestampRegex = /\d{13}/;
          return f.endsWith('.ts') && timestampRegex.test(f);
        })
        .map(f => {
          let timestamp: number;
          try {
            timestamp = Number(path.basename(f).match(/\d{13}/)[0]);
          } catch (error) {
            return;
          }
          if (!UtilsMigrations.isValidTimestamp(timestamp)) {
            return;
          }

          return {
            timestamp,
            name: _.startCase(
              path.basename(f).replace(`${timestamp}`, '').replace('.ts', ''),
            ),
          };
        })
        .filter(f => !!f)
        .map(f => {
          return {
            name: `(${f.timestamp}) ${UtilsMigrations.formatTimestamp(f.timestamp)}  [${f.name}]`,
            value: f.timestamp,
          };
        })
        .sort((a, b) => {
          return b.value - a.value;
        });
      const detectedContexts =
        this.project.framework.getAllDetectedContextsNames();

      console.info(`

      Detected databases that can be reverted:

${detectedContexts.map(db => `- ${db}`).join('\n')}

`);

      const migrationTimestamp = await UtilsTerminal.select({
        autocomplete: true,
        choices: allMigrationsOptions,
        question: `Choose migration to revert to`,
      });
      await this.revert(migrationTimestamp);
    }
    //#endregion
  }
  //#endregion

  //#region create
  async create(migrationName?: string) {
    console.info(`

    ACTION: CREATING MIGRATION

    `);
    const timestamp = new Date().getTime();
    migrationName = _.camelCase(this.args.join(' ')) || migrationName;
    if (!(migrationName || '').trim()) {
      Helpers.error(`Migration name (as parameter) is required.`, false, true);
    }
    const migrationFileName = `${timestamp}_${migrationName}.ts`;
    const detectedContexts =
      this.project.framework.getAllDetectedContextsNames();

    if (detectedContexts.length === 0) {
      Helpers.error(
        `

  No context detected. ${chalk.bold.underline('Please start locally your project first')}.
  You must ${chalk.underline('initialize')} all your contexts (and databases)
  before creating a migration.

  Start you ${chalk.bold('Visual Studio Code debugger')} with ${chalk.bold('F5')}
  or
  use command: ${chalk.bold(config.frameworkName)} ${chalk.bold('run')}

  .. and when every context is fully loaded - shut down process
  with ${chalk.bold('ctrl + c')} and try again creating migration from cli.

        `,
        false,
        true,
      );
    }

    const classes = detectedContexts.map(contextName => {
      return `//#${'reg' + 'ion'} Migration class for context "${contextName}"
@TaonMigration({
  className: '${contextName}_${timestamp}_${migrationName}',
})
export class ${contextName}_${timestamp}_${migrationName} extends TaonBaseMigration {
    //#${'reg' + 'ion'} is migration for context ${contextName} ready to run
    /**
     * IMPORTANT !!!
     * remove this method if you are ready to run this migration
     */
    public isReadyToRun(): boolean {
      return false;
    }
    //#${'end' + 'reg' + 'ion'}

    //#${'reg' + 'ion'} up
    async up(queryRunner: QueryRunner): Promise<any> {
       await queryRunner.startTransaction();
      try {

      // do "something" in db

        await queryRunner.commitTransaction();
      } catch (error) {
        console.error('Error in migration:', error);
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }
    //#${'end' + 'reg' + 'ion'}

    //#${'reg' + 'ion'} down
    async down(queryRunner: QueryRunner): Promise<any> {
      // revert this "something" in db
      // await queryRunner.clearDatabase()
    }
    //#${'end' + 'reg' + 'ion'}
}
//#${'end' + 'reg' + 'ion'}
      `;
    });

    const absPathToNewMigrationFile = this.project.pathFor([
      srcMainProject,
      migrationsFromSrc,
      migrationFileName,
    ]);
    Helpers.writeFile(
      absPathToNewMigrationFile,
      `import { Taon, TaonBaseMigration } from '${taonPackageName}/${srcFromTaonImport}';\n` +
        `import { QueryRunner } from 'taon-typeorm/${srcFromTaonImport}';\n\n` +
        `${classes.join('\n\n')}`,
    );
    UtilsTypescript.formatFile(absPathToNewMigrationFile);
    Helpers.info(`Migration file created: ${migrationFileName}`);
    this._exit(0);
  }
  //#endregion

  //#region run
  async run() {
    console.info(`

    ACTION: RUNNING MIGRATIONS

    `);
    Helpers.run(`node run.js --onlyMigrationRun`, {
      output: true,
      silence: false,
    }).sync();
    this._exit(0);
  }
  //#endregion

  //#region revert
  async revert(timestamp: number) {
    console.info(`

    ACTION: REVERTING MIGRATIONS

    `);
    Helpers.run(
      `node run.js --onlyMigrationRevertToTimestamp ${this.firstArg || timestamp}`,
      {
        output: true,
        silence: false,
      },
    ).sync();
    this._exit(0);
  }
  //#endregion

  //#region detect contexts
  contexts() {
    Helpers.taskStarted('Detecting contexts...');
    const detectedContexts =
      this.project.framework.getAllDetectedContextsNames();
    Helpers.taskDone(`

    Detected contexts:

    `);
    detectedContexts.forEach(context => {
      console.info(`- ${context}`);
    });
    this._exit(0);
  }
  //#endregion
}

export default {
  $Migration: Helpers.CLIWRAP($Migration, '$Migration'),
};
