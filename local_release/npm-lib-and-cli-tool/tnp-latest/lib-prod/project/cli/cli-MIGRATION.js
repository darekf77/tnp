//#region imports
import { config, taonPackageName } from 'tnp-core/lib-prod';
import { chalk, path, ___NS__camelCase, ___NS__startCase, UtilsMigrations__NS__formatTimestamp, UtilsMigrations__NS__isValidTimestamp, UtilsTerminal__NS__input, UtilsTerminal__NS__select } from 'tnp-core/lib-prod';
import { Helpers__NS__error, Helpers__NS__getFilesFrom, Helpers__NS__info, Helpers__NS__run, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__writeFile, HelpersTaon__NS__CLIWRAP, UtilsTypescript__NS__formatFile } from 'tnp-helpers/lib-prod';
import { libFromSrc, migrationsFromLib, srcFromTaonImport, srcMainProject, } from '../../constants';
import { BaseCli } from './base-cli';
//#endregion
// @ts-ignore TODO weird inheritance problem
class $Migration extends BaseCli {
    //#region migration console menu
    async _() {
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
        const resp = await UtilsTerminal__NS__select({
            choices: options,
            question: `What you wanna do with migrations?`,
        });
        if (resp === 'create') {
            const migrationName = await UtilsTerminal__NS__input({
                question: `Migration name (as parameter)`,
                required: true,
            });
            await this.create(migrationName);
        }
        else if (resp === 'run') {
            await this.run();
        }
        else if (resp === 'revert') {
            const allMigrationsOptions = Helpers__NS__getFilesFrom(this.project.pathFor([srcMainProject, migrationsFromLib]), {
                recursive: true,
            })
                .filter(f => {
                const timestampRegex = /\d{13}/;
                return f.endsWith('.ts') && timestampRegex.test(f);
            })
                .map(f => {
                let timestamp;
                try {
                    timestamp = Number(path.basename(f).match(/\d{13}/)[0]);
                }
                catch (error) {
                    return;
                }
                if (!UtilsMigrations__NS__isValidTimestamp(timestamp)) {
                    return;
                }
                return {
                    timestamp,
                    name: ___NS__startCase(path.basename(f).replace(`${timestamp}`, '').replace('.ts', '')),
                };
            })
                .filter(f => !!f)
                .map(f => {
                return {
                    name: `(${f.timestamp}) ${UtilsMigrations__NS__formatTimestamp(f.timestamp)}  [${f.name}]`,
                    value: f.timestamp,
                };
            })
                .sort((a, b) => {
                return b.value - a.value;
            });
            const detectedContexts = this.project.framework.getAllDetectedContextsNames();
            console.info(`

      Detected databases that can be reverted:

${detectedContexts.map(db => `- ${db}`).join('\n')}

`);
            const migrationTimestamp = await UtilsTerminal__NS__select({
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
    async create(migrationName) {
        console.info(`

    ACTION: CREATING MIGRATION

    `);
        const timestamp = new Date().getTime();
        migrationName = ___NS__camelCase(this.args.join(' ')) || migrationName;
        if (!(migrationName || '').trim()) {
            Helpers__NS__error(`Migration name (as parameter) is required.`, false, true);
        }
        const migrationFileName = `${timestamp}_${migrationName}.ts`;
        const detectedContexts = this.project.framework.getAllDetectedContextsNames();
        if (detectedContexts.length === 0) {
            Helpers__NS__error(`

  No context detected. ${chalk.bold.underline('Please start locally your project first')}.
  You must ${chalk.underline('initialize')} all your contexts (and databases)
  before creating a migration.

  Start you ${chalk.bold('Visual Studio Code debugger')} with ${chalk.bold('F5')}
  or
  use command: ${chalk.bold(config.frameworkName)} ${chalk.bold('run')}

  .. and when every context is fully loaded - shut down process
  with ${chalk.bold('ctrl + c')} and try again creating migration from cli.

        `, false, true);
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
            libFromSrc,
            migrationsFromLib,
            migrationFileName,
        ]);
        // console.log({ apbsPathToNewMigrationFile });
        Helpers__NS__writeFile(absPathToNewMigrationFile, `import { Taon, TaonBaseMigration, TaonMigration } from '${taonPackageName}/${srcFromTaonImport}';\n` +
            `import { QueryRunner } from 'taon-typeorm/${srcFromTaonImport}';\n\n` +
            `${classes.join('\n\n')}`);
        UtilsTypescript__NS__formatFile(absPathToNewMigrationFile);
        Helpers__NS__info(`Migration file created: ${migrationFileName}`);
        this._exit(0);
    }
    //#endregion
    async regenerate() {
        await this.project.artifactsManager.artifact.angularNodeApp.migrationHelper.runTask();
        Helpers__NS__info(`Migrations regenerated`);
        this._exit();
    }
    //#region run
    async run() {
        console.info(`

    ACTION: RUNNING MIGRATIONS

    `);
        Helpers__NS__run(`node run.js --onlyMigrationRun`, {
            output: true,
            silence: false,
        }).sync();
        this._exit(0);
    }
    //#endregion
    //#region revert
    async revert(timestamp) {
        console.info(`

    ACTION: REVERTING MIGRATIONS

    `);
        Helpers__NS__run(`node run.js --onlyMigrationRevertToTimestamp ${this.firstArg || timestamp}`, {
            output: true,
            silence: false,
        }).sync();
        this._exit(0);
    }
    //#endregion
    //#region detect contexts
    contexts() {
        Helpers__NS__taskStarted('Detecting contexts...');
        const detectedContexts = this.project.framework.getAllDetectedContextsNames();
        Helpers__NS__taskDone(`

    Detected contexts:

    `);
        detectedContexts.forEach(context => {
            console.info(`- ${context}`);
        });
        this._exit(0);
    }
}
export default {
    $Migration: HelpersTaon__NS__CLIWRAP($Migration, '$Migration'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-MIGRATION.js.map