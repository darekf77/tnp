import { RenameRule } from 'magic-renamer/src';
import {
  crossPlatformPath,
  Helpers,
  path,
  Utils,
  UtilsExecProc,
  UtilsFilesFoldersSync,
  UtilsTerminal,
  _,
} from 'tnp-core/src';
import { HelpersTaon, UtilsTypescript } from 'tnp-helpers/src';

import {
  indexTsInSrcForWorker,
  KV_DATABASE_ONLINE_NAME,
  packageJsonSubProject,
  TempalteSubprojectGroup,
  TempalteSubprojectType,
  TempalteSubprojectTypeGroup,
  TemplateFolder,
  TemplateSubprojectDbPrefix,
  tsconfigSubProject,
  wranglerJsonC,
} from '../../../constants';
import type { Project } from '../project';

import { CloudFlarePorjectsUtils } from './cloud-flare-projects.utils';

export class CloudFlareProject {
  protected readonly cwdWorker: string;

  public readonly selectedTempalte: TempalteSubprojectType;

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
        this.selectedTempalte,
      ]),
    );
  }

  get workerCore() {
    const core = this.coreProject;
    return this.taonParentProject.ins.From(core.pathFor(core.name));
  }

  constructor(
    public readonly absLocationPath: string,
    public readonly taonParentProject: Project,
  ) {
    this.cwdWorker = crossPlatformPath([
      absLocationPath,
      path.basename(absLocationPath),
    ]);
    this.selectedTempalte = path.basename(path.dirname(absLocationPath)) as any;
  }

  //#region init
  public async init(): Promise<void> {
    //#region @backendFunc
    Helpers.logInfo(`Linking subproject: ${this.displayName}`);
    const coreProject = this.coreProject;
    CloudFlarePorjectsUtils.initProjectFilesAndAssets(
      coreProject!,
      this.absLocationPath,
    );
    await this.npmInstall();
    //#endregion
  }
  //#endregion

  //#region after creation
  public async afterCreation(): Promise<void> {
    //#region @backendFunc
    await this.npmInstall();

    await CloudFlarePorjectsUtils.loginCliCloudFlare();

    await this.addKVDb();

    await this.deployment();

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
  async deployment(): Promise<void> {
    //#region @backendFunc
    await CloudFlarePorjectsUtils.loginCliCloudFlare();
    Helpers.taskStarted(`STARTING DEPLOYMENT OF WORKER ${this.cwdWorker}`);
    while (true) {
      try {
        Helpers.taskStarted(`Deploying worker to cloud flare...`);
        const data = await UtilsExecProc.spawnAsync(`npm run deploy`, {
          cwd: this.cwdWorker,
        }).getOutput();
        const accountName = CloudFlarePorjectsUtils.extractWorkersDevInfo(
          data.stdout,
        );
        console.log(data.stdout);
        Helpers.taskDone(`DONE DEPLOYMENT on acccount name "${accountName}"`);
        this.taonParentProject.taonJson.setCloudFlareAccountSubdomain(
          accountName,
        );
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
  public async addKVDb() {
    //#region @backendFunc
    Helpers.info(`KV DB CREATION`);
    while (true) {
      const KV_DB_NAME = await UtilsTerminal.input({
        question: `Provide cloudflare KV database name to create`,
        defaultValue: `${TemplateSubprojectDbPrefix[this.selectedTempalte]}_${_.snakeCase(
          this.taonParentProject.name,
        ).toUpperCase()}`,
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
            name: 'SET CUSTOME KEY',
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
