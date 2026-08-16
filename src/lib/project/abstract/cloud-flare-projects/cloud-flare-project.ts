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
  CoreModels,
} from 'tnp-core/src';
import { HelpersTaon, UtilsTypescript } from 'tnp-helpers/src';

import {
  buildJS,
  buildJSprod,
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
import type { Project } from '../project';

import { CloudFlarePorjectsUtils } from './cloud-flare-projects.utils';

export class CloudFlareSubProject {
  //#region fields & getters
  /**
   * worker abs path
   */
  public readonly cwdWorker: string;

  public readonly selectedTempalte: TempalteSubprojectType;

  public readonly envName: CoreModels.EnvironmentName | undefined;

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

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get wranglerJsonC() {
    return {
      setDevMode: () => {
        if (
          this.selectedTempalte ===
          TempalteSubprojectType.TAON_CUSTOM_CLOUDFLARE_WORKER
        ) {
          HelpersTaon.setValueToJSONC(
            [this.cwdWorker, wranglerJsonC],
            'build',
            void 0,
          );
        }
      },
      setDeployMode: () => {
        if (
          this.selectedTempalte ===
          TempalteSubprojectType.TAON_CUSTOM_CLOUDFLARE_WORKER
        ) {
          HelpersTaon.setValueToJSONC(
            [this.cwdWorker, wranglerJsonC],
            'build',
            {
              command: `npm-run bun run ${buildJSprod}`,
            },
          );
        }
      },
    };
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
    const { envName, envNumber } = CoreModels.splitEnv(secondPart);
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

  //#region start in dev mode
  async startInDevMode(envOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    this.wranglerJsonC.setDevMode();
    await UtilsExecProc.spawnAsync(`npm run start`, {
      cwd: this.cwdWorker,
      showOutput: true,
      showOutputColor: true,
    }).waitUntilDoneOrThrow();
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
  async deployment(): Promise<void> {
    //#region @backendFunc
    await this.init();

    await CloudFlarePorjectsUtils.loginCliCloudFlare();
    Helpers.taskStarted(`STARTING DEPLOYMENT OF WORKER ${this.cwdWorker}`);
    while (true) {
      try {
        this.wranglerJsonC.setDeployMode();
        Helpers.taskStarted(`Deploying worker to cloud flare...`);
        const data = await UtilsExecProc.spawnAsync(`npm run deploy`, {
          cwd: this.cwdWorker,
        }).getOutput();
        const accountName = CloudFlarePorjectsUtils.extractWorkersDevInfo(
          data.stdout + data.stderr,
        );
        Helpers.taskDone(`DONE DEPLOYMENT on acccount name "${accountName}"`);
        this.taonParentProject.taonJson.setCloudFlareAccountSubdomain(
          accountName,
        );
        break;
      } catch (error) {
        this.wranglerJsonC.setDevMode();
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
