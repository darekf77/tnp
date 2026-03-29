"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
const base_cli_1 = require("./base-cli");
//#endregion
// @ts-ignore TODO weird inheritance problem
class $Migration extends base_cli_1.BaseCli {
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
        const resp = await lib_2.UtilsTerminal.select({
            choices: options,
            question: `What you wanna do with migrations?`,
        });
        if (resp === 'create') {
            const migrationName = await lib_2.UtilsTerminal.input({
                question: `Migration name (as parameter)`,
                required: true,
            });
            await this.create(migrationName);
        }
        else if (resp === 'run') {
            await this.run();
        }
        else if (resp === 'revert') {
            const allMigrationsOptions = lib_3.Helpers.getFilesFrom(this.project.pathFor([constants_1.srcMainProject, constants_1.migrationsFromLib]), {
                recursive: true,
            })
                .filter(f => {
                const timestampRegex = /\d{13}/;
                return f.endsWith('.ts') && timestampRegex.test(f);
            })
                .map(f => {
                let timestamp;
                try {
                    timestamp = Number(lib_2.path.basename(f).match(/\d{13}/)[0]);
                }
                catch (error) {
                    return;
                }
                if (!lib_2.UtilsMigrations.isValidTimestamp(timestamp)) {
                    return;
                }
                return {
                    timestamp,
                    name: lib_2._.startCase(lib_2.path.basename(f).replace(`${timestamp}`, '').replace('.ts', '')),
                };
            })
                .filter(f => !!f)
                .map(f => {
                return {
                    name: `(${f.timestamp}) ${lib_2.UtilsMigrations.formatTimestamp(f.timestamp)}  [${f.name}]`,
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
            const migrationTimestamp = await lib_2.UtilsTerminal.select({
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
        migrationName = lib_2._.camelCase(this.args.join(' ')) || migrationName;
        if (!(migrationName || '').trim()) {
            lib_3.Helpers.error(`Migration name (as parameter) is required.`, false, true);
        }
        const migrationFileName = `${timestamp}_${migrationName}.ts`;
        const detectedContexts = this.project.framework.getAllDetectedContextsNames();
        if (detectedContexts.length === 0) {
            lib_3.Helpers.error(`

  No context detected. ${lib_2.chalk.bold.underline('Please start locally your project first')}.
  You must ${lib_2.chalk.underline('initialize')} all your contexts (and databases)
  before creating a migration.

  Start you ${lib_2.chalk.bold('Visual Studio Code debugger')} with ${lib_2.chalk.bold('F5')}
  or
  use command: ${lib_2.chalk.bold(lib_1.config.frameworkName)} ${lib_2.chalk.bold('run')}

  .. and when every context is fully loaded - shut down process
  with ${lib_2.chalk.bold('ctrl + c')} and try again creating migration from cli.

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
            constants_1.srcMainProject,
            constants_1.libFromSrc,
            constants_1.migrationsFromLib,
            migrationFileName,
        ]);
        // console.log({ apbsPathToNewMigrationFile });
        lib_3.Helpers.writeFile(absPathToNewMigrationFile, `import { Taon, TaonBaseMigration, TaonMigration } from '${lib_1.taonPackageName}/${constants_1.srcFromTaonImport}';\n` +
            `import { QueryRunner } from 'taon-typeorm/${constants_1.srcFromTaonImport}';\n\n` +
            `${classes.join('\n\n')}`);
        lib_3.UtilsTypescript.formatFile(absPathToNewMigrationFile);
        lib_3.Helpers.info(`Migration file created: ${migrationFileName}`);
        this._exit(0);
    }
    //#endregion
    async regenerate() {
        await this.project.artifactsManager.artifact.angularNodeApp.migrationHelper.runTask();
        lib_3.Helpers.info(`Migrations regenerated`);
        this._exit();
    }
    //#region run
    async run() {
        console.info(`

    ACTION: RUNNING MIGRATIONS

    `);
        lib_3.Helpers.run(`node run.js --onlyMigrationRun`, {
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
        lib_3.Helpers.run(`node run.js --onlyMigrationRevertToTimestamp ${this.firstArg || timestamp}`, {
            output: true,
            silence: false,
        }).sync();
        this._exit(0);
    }
    //#endregion
    //#region detect contexts
    contexts() {
        lib_3.Helpers.taskStarted('Detecting contexts...');
        const detectedContexts = this.project.framework.getAllDetectedContextsNames();
        lib_3.Helpers.taskDone(`

    Detected contexts:

    `);
        detectedContexts.forEach(context => {
            console.info(`- ${context}`);
        });
        this._exit(0);
    }
}
exports.default = {
    $Migration: lib_3.HelpersTaon.CLIWRAP($Migration, '$Migration'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-MIGRATION.js.map