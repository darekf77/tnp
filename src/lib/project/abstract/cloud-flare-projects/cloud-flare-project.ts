//#region imports
import { RenameRule } from 'magic-renamer/src';
import { Models } from 'taon/src';
import {
  crossPlatformPath,
  Helpers,
  path,
  Utils,
  UtilsExecProc,
  UtilsFilesFoldersSync,
  UtilsTerminal,
  _,
  CoreModels,
  UtilsEnv,
  UtilsSecretEnv,
  UtilsDotFile,
  chalk,
  startAsyncProc,
  UtilsTempFolder,
  UtilsProcess,
} from 'tnp-core/src';
import { HelpersTaon, UtilsTypescript } from 'tnp-helpers/src';

import { pingUrl } from '../../..//app-utils';
import {
  buildDevMinifyJS,
  buildDevNormalJS,
  buildJSprod,
  distFromWorkerBuild,
  dotEnvFile,
  externalJs,
  groupsFolder,
  indexTsInSrcForWorker,
  KV_DATABASE_ONLINE_NAME,
  packageJsonSubProject,
  TempalteSubprojectGroup,
  TempalteSubprojectType,
  TempalteSubprojectTypeGroup,
  TemplateFolder,
  tsconfigSubProject,
  wranglerJsonC,
} from '../../../constants';
import { EnvOptions } from '../../../options';
import { ArtifactsAngularNodeAppHelpers } from '../artifacts/angular-node-app/artifact-angular-node-app-helpers';
import type { Project } from '../project';

import { extractWranglerReadyUrl } from './cloud-flare-custom-worker';
import { CloudFlarePorjectsUtils } from './cloud-flare-projects.utils';
import {
  executeRemoteMigrationSql,
  executeWranglerQuery,
  prepareRemoteDeploymentSql,
} from './cloudfalre-migrations';
//#endregion

export class CloudFlareSubProject {
  //#region fields & getters
  /**
   * worker abs path
   */
  public readonly cwdWorker: string;

  public readonly selectedTempalte: TempalteSubprojectType;

  public readonly envName: UtilsEnv.EnvironmentName | undefined;

  public readonly envNumber: number | undefined;

  get displayName(): string {
    return `${path.basename(this.absLocationPath)} (${this.selectedTempalte})`;
  }

  get name(): string {
    return path.basename(this.absLocationPath);
  }

  get group(): TempalteSubprojectGroup {
    return TempalteSubprojectTypeGroup[this.selectedTempalte];
  }

  get workerUrl(): string {
    return `https://${this.name}.${this.taonParentProject.taonJson.cloudFlareAccountSubdomain}.workers.dev`;
  }

  get coreProject(): Project | undefined {
    return this.taonParentProject.ins.From(
      this.taonParentProject.framework.coreProject.pathFor([
        TemplateFolder.templatesSubprojects,
        groupsFolder,
        TempalteSubprojectTypeGroup[this.selectedTempalte],
        this.selectedTempalte,
      ]),
    );
  }

  wranglerJsonCsetDevMode(): void {
    if (
      this.selectedTempalte ===
      TempalteSubprojectType.TAON_CUSTOM_CLOUDFLARE_WORKER
    ) {
      HelpersTaon.setValueToJSONC(
        [this.cwdWorker, wranglerJsonC],
        'build',
        void 0,
      );
      HelpersTaon.setValueToJSONC(
        [this.cwdWorker, wranglerJsonC],
        'assets',
        void 0,
      );
    }
  }

  wranglerJsonSetDeployMode(): void {
    if (
      this.selectedTempalte ===
      TempalteSubprojectType.TAON_CUSTOM_CLOUDFLARE_WORKER
    ) {
      HelpersTaon.setValueToJSONC([this.cwdWorker, wranglerJsonC], 'build', {
        command: `npm-run bun run ${buildJSprod}`,
      });

      HelpersTaon.setValueToJSONC([this.cwdWorker, wranglerJsonC], 'assets', {
        directory: './browser',
        binding: 'ASSETS',
        not_found_handling: 'none',
      });
    }
  }

  get workerCore(): Project {
    const core = this.coreProject;
    return this.taonParentProject.ins.From(core.pathFor(core.name));
  }
  //#endregion

  //#region constructor
  constructor(
    public readonly absLocationPath: string,
    public readonly taonParentProject: Project,
  ) {
    //#region @backend
    this.cwdWorker = crossPlatformPath([
      absLocationPath,
      path.basename(absLocationPath),
    ]);
    const [firstPart, secondPart] = path
      .basename(path.dirname(absLocationPath))
      .split('__');
    this.selectedTempalte = firstPart as any;
    const { envName, envNumber } = UtilsEnv.splitEnv(secondPart);
    this.envName = envName as any;
    this.envNumber = envNumber;
    //#endregion
  }
  //#endregion

  //#region get files for branding worker
  public getFilesForBrandingWorker(): CloudFlarePorjectsUtils.FilesForSubProjectBranding[] {
    //#region @backendFunc
    const filesForBranding: CloudFlarePorjectsUtils.FilesForSubProjectBranding[] =
      [
        { relativePath: packageJsonSubProject },
        { relativePath: tsconfigSubProject },
        { relativePath: tsconfigSubProject },
        {
          relativePath: indexTsInSrcForWorker,
          beforeSave: (
            content,
            fileRelativePath,
            absDestinationPath,
            cwdWorker,
          ) => {
            const dbName = HelpersTaon.getValueFromJSONC(
              [cwdWorker, wranglerJsonC],
              'kv_namespaces[0].binding',
            );

            content = content.replace(
              new RegExp(
                Utils.escapeStringForRegEx(KV_DATABASE_ONLINE_NAME),
                'g',
              ),
              dbName,
            );

            return content;
          },
        },
      ];
    return filesForBranding;
    //#endregion
  }
  //#endregion

  //#region init
  public async init(): Promise<void> {
    //#region @backendFunc
    Helpers.logInfo(`Linking subproject: ${this.displayName}`);
    this.filesAssetsBranding();
    await this.npmInstall();
    //#endregion
  }
  //#endregion

  //#region files assets branding
  private filesAssetsBranding(): void {
    //#region @backendFunc
    const coreCloudFlareSubProject = this.coreProject;
    const subProjAbsPath = this.absLocationPath;
    const filesForBrandingWorker = this.getFilesForBrandingWorker();

    const cwdWorker = crossPlatformPath([
      subProjAbsPath,
      path.basename(subProjAbsPath),
    ]);

    const name = path.basename(subProjAbsPath);
    Helpers.writeJson([subProjAbsPath, packageJsonSubProject], {
      name,
    });

    Helpers.writeJson([cwdWorker, packageJsonSubProject], {
      name,
    });

    const workerCore = coreCloudFlareSubProject.ins.From(
      coreCloudFlareSubProject.pathFor(coreCloudFlareSubProject.name),
    );

    //#region handle woker data
    (() => {
      workerCore
        .copy(filesForBrandingWorker.map(c => c.relativePath))
        .to([cwdWorker]);

      const magicRenameRules = `${coreCloudFlareSubProject.name} -> ${name}`;
      // console.log({ magicRenameRules });

      for (const filelForBranding of filesForBrandingWorker) {
        const absDestinationPath = crossPlatformPath([
          cwdWorker,
          filelForBranding.relativePath,
        ]);

        if (!Helpers.isFolder(absDestinationPath)) {
          let content =
            UtilsFilesFoldersSync.readFile(absDestinationPath) || '';
          const rules = RenameRule.from(magicRenameRules);
          for (const rule of rules) {
            // console.log({ rule });
            content = content
              .split('\n')
              .map(line => {
                if (
                  (line || '').trim().startsWith('imp' + 'ort') ||
                  (line || '').trim().startsWith('exp' + 'ort') ||
                  (line || '').trim().includes('@skip' + 'ReplaceTaon')
                ) {
                  return line;
                }
                return rule.replaceInString(line);
              })
              .join('\n');
          }
          if (filelForBranding.beforeSave) {
            content = filelForBranding.beforeSave(
              content,
              filelForBranding.relativePath,
              absDestinationPath,
              cwdWorker,
            );
          }
          UtilsFilesFoldersSync.writeFile(absDestinationPath, content);
        }
      }
    })();
    //#endregion

    //#region handle parent data
    (() => {
      const filesForBranding = [packageJsonSubProject, 'README.md', 'images'];

      coreCloudFlareSubProject.copy(filesForBranding).to([subProjAbsPath]);

      const magicRenameRules = `${coreCloudFlareSubProject.name} -> ${name}`;

      for (const relativePath of filesForBranding) {
        const filePath = crossPlatformPath([subProjAbsPath, relativePath]);
        // console.log(`isFile ${!Helpers.isFolder(filePath)} ${filePath}`)
        if (!Helpers.isFolder(filePath)) {
          let content = UtilsFilesFoldersSync.readFile(filePath);
          if (content) {
            const rules = RenameRule.from(magicRenameRules);
            for (const rule of rules) {
              content = rule.replaceInString(content);
            }
            UtilsFilesFoldersSync.writeFile(filePath, content);
          }
        }
      }
    })();
    //#endregion

    //#endregion
  }
  //#endregion

  //#region after creation
  public async afterCreation(
    opt?: CloudFlarePorjectsUtils.AddProjectOptions,
  ): Promise<void> {
    //#region @backendFunc
    opt = opt || {};
    await this.init();

    if (opt.skipDeployment) {
      return;
    }

    await CloudFlarePorjectsUtils.loginCliCloudFlare();

    await this.addKVDb();

    await this.deployment(opt.releaseOptions);

    const secretsData = this.apiSecretsKeyData();
    if (secretsData.length > 0) {
      if (
        await UtilsTerminal.confirm({
          message: `Woudl you like to add secret keys (${secretsData.map(c => c.key).join(',')})
          to worker environment ?`,
          defaultValue: true,
        })
      ) {
        await this.setApiSecreats(secretsData);
      }
    }
    //#endregion
  }
  //#endregion

  //#region start in dev mode
  async startInDevMode(envOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    this.wranglerJsonCsetDevMode();
    await UtilsExecProc.spawnAsync(`npm run start`, {
      cwd: this.cwdWorker,
      showOutput: true,
      showOutputColor: true,
    }).waitUntilDoneOrThrow();
    //#endregion
  }
  //#endregion

  //#region protected methods / get worker port number
  protected async getWorkerPortNum(envOptions: EnvOptions): Promise<number> {
    //#region @backendFunc
    const ngCloudflareWorkerPort =
      await this.taonParentProject.artifactsManager.artifact.angularNodeApp.appHostsRecreateHelper.NODE_BACKEND_PORT_UNIQ_KEY(
        envOptions.clone({
          build: {
            cloudflare: true,
          },
        }),
      );
    return ngCloudflareWorkerPort;
    //#endregion
  }
  //#endregion

  //#region protected methods /  get master key
  protected async getMaterKey(): Promise<string> {
    //#region @backendFunc
    const ctrl =
      await this.taonParentProject.ins.taonProjectsWorker.secretsKeychainPackagesWorker.getRemoteControllerFor(
        {
          methodOptions: {
            calledFrom: 'cloudflare deployment',
          },
        },
      );
    const masterKey = (
      await ctrl.getMasterPassword(this.taonParentProject.location).request()
    ).body.text;

    return masterKey;
    //#endregion
  }
  //#endregion

  //#region gather migration sql
  /**
   * @returns all migrations sql data from running app
   */
  async gatherMigrationSQL(
    envOptions: EnvOptions,
    skipBuilding?: true,
  ): Promise<string> {
    //#region @backendFunc
    this.wranglerJsonCsetDevMode();
    const masterKey = await this.getMaterKey();
    const ngCloudflareWorkerPort = await this.getWorkerPortNum(envOptions);

    Helpers.logInfo(`Killling process ${ngCloudflareWorkerPort}`);
    await UtilsProcess.killProcessOnPort(ngCloudflareWorkerPort, true);

    if (!skipBuilding) {
      //#region skip build when in deployment
      Helpers.removeFileIfExists([this.cwdWorker, '.env']);

      const cloudflareBuildFile = envOptions.build.prod
        ? buildJSprod
        : envOptions.release.nodeBackendApp.minify
          ? buildDevMinifyJS
          : buildDevNormalJS;

      Helpers.info(`Using build file: ${cloudflareBuildFile}`);
      await UtilsExecProc.spawnAsync(`npm-run bun run ${cloudflareBuildFile}`, {
        cwd: this.cwdWorker,
        showOutput: true,
        showOutputColor: true,
      }).waitUntilDoneOrThrow({
        successOutputMessage: 'Compilation Done',
      });
      //#endregion
    }

    // const taonActionFromParentName = GlobalStorage.get(taonActionFromParent);
    const tempFolder = await UtilsTempFolder.getPath({
      prefix: 'temp-cloudflare',
    });

    // Helpers.remove(tempFolder);

    Helpers.logInfo(`Using temp folder ${tempFolder}`);

    const command =
      `npm run start -- ` +
      `--var TAON_LOCAL_DEV:true  ` +
      `--var DISPLAY_RAW_SQL_COMMANDS:true  ` +
      `--var ${UtilsSecretEnv.MASTER_PASS_KEY}:"${masterKey}" ` +
      `--port ${ngCloudflareWorkerPort} ` +
      ` --persist-to ${tempFolder} `;

    Helpers.info(`Executing command:

      ${command}

      `);

    const queries: string[] = [];

    const contextsNames = this.taonParentProject.framework
      .getAllDetectedTaonContexts({
        skipLibFolder: true,
      })
      .map(c => c.contextName);

    await startAsyncProc(command, this.cwdWorker, {
      uniqueName: `cloudflare`,
      prefix: true,
      resolvePromiseMsg_stderr: ['$$$ APP_READY $$$'],
      resolvePromiseMsg_stdout: ['$$$ APP_READY $$$'],
      hideOutput_stdout: true,
      // hideOutput_stderr: true,
      outputLineReplace: line => {
        if (line.trim().startsWith(CoreModels.queryExtract)) {
          queries.push(line);
        }
        if (line.includes('Ready on')) {
          let url = extractWranglerReadyUrl(line);
          if (url) {
            void pingUrl(url, _.first(contextsNames));
          }
        }
        const errorPath = 'at null.<anonymous> (';
        if (line.includes(errorPath)) {
          line = line.replace(
            errorPath,
            `(${this.cwdWorker}/${distFromWorkerBuild}/`,
          );
        }
        return line;
      },
    });

    const queryPrefix = new RegExp(`^${CoreModels.queryExtract}`);

    const generatedSqlFromAllContexts = queries
      .map(c => c.replace(queryPrefix, '').trim())
      .filter(f => !!f)
      .join('\n');

    Helpers.logInfo(`DONE GATHERING SQL DATA! `);
    return generatedSqlFromAllContexts;
    //#endregion
  }
  //#endregion

  //#region apply migrations
  async applyMigrations(
    envOptions: EnvOptions,
    generatedSqlFromAllContexts: string,
  ): Promise<void> {
    //#region @backendFunc
    const contextsNames = this.taonParentProject.framework
      .getAllDetectedTaonContexts({
        skipLibFolder: true,
      })
      .map(c => c.contextName);

    this.taonParentProject.writeFile(
      `.taon/workers-temp-data/all-sql-for-migration/${this.name}--${new Date().getTime()}.sql`,
      generatedSqlFromAllContexts,
    );

    for (let index = 0; index < contextsNames.length; index++) {
      const contextName = contextsNames[index];
      const file = crossPlatformPath([
        this.cwdWorker,
        `tmp-taon-migrations/migration-${contextName}-${new Date().getTime()}.sql`,
      ]);

      const task = Helpers.actionStarted(
        `Applying migration for context: ${contextName}`,
      );
      const plan = await prepareRemoteDeploymentSql({
        mode: envOptions.release.clearDb
          ? Models.DBRecreateMode.DROP_DB_MIGRATIONS
          : Models.DBRecreateMode.PRESERVE_DATA_MIGRATIONS,
        sql: generatedSqlFromAllContexts,
        cwdWorker: this.cwdWorker,
        contextName: contextName,
      });

      console.log('Pending:', plan.pending);
      console.log('New:', plan.newMigrations);
      console.log('Skipped:', plan.skipped);
      if (envOptions.release.releaseType) {
        UtilsFilesFoldersSync.writeFile(file, plan.sql);
        Helpers.info(`all sql file: ${chalk.bold(file)}`);
        await executeRemoteMigrationSql(plan.sql, this.cwdWorker, contextName);
      } else {
        Helpers.warn(`Skipping sql migrations deployment (ctx=${contextName})`);
        Helpers.info(`all sql file: ${chalk.bold(file)}`);
        UtilsFilesFoldersSync.writeFile(file, plan.sql);
      }

      task.done();
    }

    //#endregion
  }
  //#endregion

  //#region mark deployment as ready
  async markDeploymentAsReady(TAON_DEPLOYMENT_ID: string): Promise<void> {
    //#region @backendFunc
    const task = Helpers.actionStarted(
      `Marking deployment ${TAON_DEPLOYMENT_ID} as ready.`,
    );
    await executeWranglerQuery(
      `
    CREATE TABLE IF NOT EXISTS TaonCloudfalreDeployment (
      deploymentVersion TEXT NOT NULL PRIMARY KEY
    );

    INSERT INTO TaonCloudfalreDeployment (deploymentVersion)
    VALUES ('${TAON_DEPLOYMENT_ID}')
    ON CONFLICT (deploymentVersion) DO NOTHING;
  `,
      this.cwdWorker,
    );
    task.done();
    //#endregion
  }
  //#endregion

  //#region buld in dev mode
  async buildInDevMode(): Promise<void> {
    //#region @backendFunc
    // await UtilsExecProc.spawnAsync(`npm run start`, {
    //   cwd: this.cwdWorker,
    //   showOutput: true,
    //   showOutputColor: true,
    // }).waitUntilDoneOrThrow();
    //#endregion
  }
  //#endregion

  //#region npm install
  public async npmInstall(): Promise<void> {
    //#region npm install

    this.taonParentProject.nodeModules.linkToLocation(this.cwdWorker);
    Helpers.info(`Linking node_modules done`);
    // let trysNpmInstall = 0;
    // Helpers.info(`NPM INSTALL FOR WORKER`);
    // while (true) {
    //   try {
    //     if (Helpers.exists([cwdWorker, nodeModulesSubPorject])) {
    //       if (trysNpmInstall > 0) {
    //         break;
    //       }
    //       if (
    //         !(await UtilsTerminal.confirm({
    //           message: 'Skip npm install for subproject ?',
    //           defaultValue: true,
    //         }))
    //       ) {
    //         break;
    //       }
    //     }
    //     trysNpmInstall++;
    //     Helpers.removeFileIfExists([cwdWorker, packageJsonLockSubProject]);
    //     await UtilsExecProc.spawnAsync('npm install', {
    //       cwd: cwdWorker,
    //     }).waitUntilDoneOrThrow();
    //     break;
    //   } catch (error) {
    //     if (!(await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
    //       break;
    //     }
    //   }
    // }
    //#endregion
  }
  //#endregion

  //#region deplyment to cloud flare
  async deployment(releaseOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    await this.init();

    await CloudFlarePorjectsUtils.loginCliCloudFlare();
    Helpers.taskStarted(`


      STARTING DEPLOYMENT OF WORKER ${this.cwdWorker}

      CLEAR DATABASE ? = ${releaseOptions.release.clearDb}

    `);

    const TAON_DEPLOYMENT_ID = `${Date.now()}-${crypto.randomUUID()}`;
    const generatedSqlFromAllContexts = await this.gatherMigrationSQL(
      releaseOptions,
      true,
    );

    while (true) {
      try {
        this.wranglerJsonSetDeployMode();
        Helpers.taskStarted(`Deploying worker to cloud flare...`);

        const masterKey = await this.getMaterKey();

        UtilsFilesFoldersSync.writeFile(
          [this.cwdWorker, '.env'],
          `${UtilsSecretEnv.MASTER_PASS_KEY}="${masterKey}"`,
        );

        const contextsNames =
          this.taonParentProject.framework.getAllDetectedTaonContexts({
            skipLibFolder: true,
          });

        releaseOptions.build.cloudflare = true; // TODO QUICK_FIX
        if (!releaseOptions.website.useDomain) {
          releaseOptions.website.useDomain = true;
          releaseOptions.website.domain = this.workerUrl;
        }

        await ArtifactsAngularNodeAppHelpers.updateReleasDotEnv(
          contextsNames,
          this.cwdWorker,
          this.taonParentProject,
          releaseOptions,
        );

        UtilsDotFile.setValueToDotFile(
          [this.cwdWorker, dotEnvFile],
          'TAON_DEPLOYMENT_ID',
          TAON_DEPLOYMENT_ID,
        );

        const data = await UtilsExecProc.spawnAsync(
          `npm-run wrangler deploy --secrets-file .env`,
          {
            cwd: this.cwdWorker,
          },
        ).getOutput();
        const accountName = CloudFlarePorjectsUtils.extractWorkersDevInfo(
          data.stdout + data.stderr,
        );
        Helpers.removeFileIfExists([this.cwdWorker, '.env']);

        await this.applyMigrations(releaseOptions, generatedSqlFromAllContexts);

        await this.markDeploymentAsReady(TAON_DEPLOYMENT_ID);

        Helpers.taskDone(`

          DONE DEPLOYMENT on acccount name "${accountName}"


          YOU WEBSITE IS AVAILABLE HERE:

    ${this.workerUrl}



          `);
        this.taonParentProject.taonJson.setCloudFlareAccountSubdomain(
          accountName,
        );

        await pingUrl(this.workerUrl);
        break;
      } catch (error) {
        this.wranglerJsonCsetDevMode();
        if (!(await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
          break;
        } else {
          continue;
        }
      }
    }

    //#endregion
  }
  //#endregion

  //#region set production or development mode to worker
  public async setMode(mode: 'production' | 'development'): Promise<void> {
    //#region @backendFunc
    await CloudFlarePorjectsUtils.loginCliCloudFlare();
    while (true) {
      try {
        const ok = await CloudFlarePorjectsUtils.setSecret(
          this.cwdWorker,
          'WORKER_STRIPE_MODE',
          mode,
        );
        if (ok) {
          break;
        }
      } catch (error) {
        console.error(error);
      }
      Helpers.warn(`Not able to set worker mode.`);
      await UtilsTerminal.pressAnyKeyToContinueAsync({
        message: `Press any key to start again`,
      });
    }

    Helpers.info(
      `DONE. WORKER ${path.basename(this.cwdWorker)} is no in ${mode} mode`,
    );
    //#endregion
  }
  //#endregion

  //#region add kv db
  public async addKVDb(): Promise<void> {
    //#region @backendFunc
    Helpers.info(`KV DB CREATION`);
    while (true) {
      const KV_DB_NAME = await UtilsTerminal.input({
        question: `Provide cloudflare KV database name to create`,
        defaultValue: CloudFlarePorjectsUtils.getKVDatabasePrefixFromTemplate(
          this.selectedTempalte,
          this.taonParentProject.shortName,
        ),
        validate: value => {
          return /^[A-Z0-9]+(?:_[A-Z0-9]+)*$/.test(value);
        },
      });
      try {
        await UtilsExecProc.spawnAsync(
          `npx wrangler kv namespace create ${KV_DB_NAME}`,
          {
            cwd: this.cwdWorker,
          },
        ).waitUntilDoneOrThrow();
        const rcFilePath = crossPlatformPath([this.cwdWorker, 'src/index.ts']);

        const rcFileContent = UtilsFilesFoldersSync.readFile(
          rcFilePath,
        ).replace(
          new RegExp(Utils.escapeStringForRegEx(KV_DATABASE_ONLINE_NAME), 'g'),
          KV_DB_NAME,
        );

        UtilsFilesFoldersSync.writeFile(rcFilePath, rcFileContent);

        break;
      } catch (error) {
        if (!(await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
          break;
        }
      }

      break;
    }
    //#endregion
  }
  //#endregion

  //#region api secrets data
  protected apiSecretsKeyData(): CloudFlarePorjectsUtils.SecretKeyData[] {
    return [];
  }
  //#endregion

  //#region set api secretes
  public async setApiSecreats(
    selectedSecretKeysToAdd?: CloudFlarePorjectsUtils.SecretKeyData[],
  ): Promise<void> {
    //#region @backendFunc

    //#region selecte keys
    if (!selectedSecretKeysToAdd) {
      while (true) {
        const choices = {
          ...this.apiSecretsKeyData().reduce((a, b) => {
            return _.merge(a, {
              [b.key]: {
                name: `SET WORKER KEY: ${b.key}`,
              },
            });
          }, {}),
          custom: {
            name: 'SET CUSTOM KEY',
          },
          return: {
            name: '<return to main menu>',
          },
        };

        const choice = await UtilsTerminal.select<keyof typeof choices>({
          question: 'Select secret key to update',
          choices,
        });

        if (choice === 'custom') {
          const key = await UtilsTerminal.input({
            question: 'Enter api key',
            required: true,
          });
          if (!key) {
            continue;
          }
          selectedSecretKeysToAdd = [
            {
              key,
              description: `

              Enter value for custom api key ${key}

              `,
            },
          ];
          break;
        }
        if (choice === 'return') {
          return;
        } else {
          const keyData = this.apiSecretsKeyData().find(c => c.key === choice);
          selectedSecretKeysToAdd = [keyData];
        }

        break;
      }
    }
    //#endregion

    for (const keyData of selectedSecretKeysToAdd) {
      while (true) {
        try {
          const taks = Helpers.actionStarted(`Adding api key=${keyData.key}`);
          keyData.description && Helpers.info(keyData.description);
          await UtilsExecProc.spawnAsync(
            `npx wrangler secret put ${keyData.key}`,
            {
              cwd: this.cwdWorker,
            },
          ).waitUntilDoneOrThrow();
          if (keyData.afterAddedFn) {
            await keyData.afterAddedFn();
          }
          taks.done();
          break;
        } catch (error) {
          if (
            !(await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))
          ) {
            break;
          }
        }
        break;
      }
    }

    //#endregion
  }
  //#endregion
}
