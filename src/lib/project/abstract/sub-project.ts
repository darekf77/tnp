//#region imports
import { execSync, spawn } from 'child_process';
import * as crypto from 'crypto';

import { MagicRenamer, RenameRule } from 'magic-renamer/src';
import {
  path,
  UtilsFilesFoldersSync,
  UtilsTerminal,
  _,
  crossPlatformPath,
  Helpers,
  UtilsExecProc,
  UtilsOs,
  fse,
  Utils,
  TaonStripeCloudflareWorker,
  chalk,
} from 'tnp-core/src';
import { BaseQuickFixes, HelpersTaon, UtilsTypescript } from 'tnp-helpers/src';

import {
  indexTsInSrcForWorker,
  KV_DATABASE_ONLINE_NAME,
  mainProjectSubProjects,
  nodeModulesSubPorject,
  packageJsonLockSubProject,
  packageJsonSubProject,
  TempalteSubprojectGroup,
  TempalteSubprojectType,
  TempalteSubprojectTypeArr,
  TempalteSubprojectTypeGroup,
  TemplateFolder,
  tsconfigSubProject,
  wranglerJsonC,
} from '../../constants';

import { Project } from './project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class SubProject extends BaseQuickFixes<Project> {
  //#region methods & getters

  //#region methods & getters / this project temp sub project folder
  private get tempSubProjectFolder(): string {
    return this.project.pathFor('tmp-subproject-temp');
  }
  //#endregion

  //#region methods & getters / core project path template type
  private pathToTempalteInCore(templateType: TempalteSubprojectType): string {
    return this.project.framework.coreProject.pathFor(
      `${TemplateFolder.templatesSubprojects}/${templateType}`,
    );
  }
  //#endregion

  //#region methods & getters / this project path template type
  private pathToTempalteInCurrentProject(
    templateType: TempalteSubprojectType,
  ): string {
    return this.project.pathFor(
      `${mainProjectSubProjects}/${TempalteSubprojectTypeGroup[templateType]}/${templateType}`,
    );
  }
  //#endregion

  //#region methods & getters / worker name for
  private workerNameFor(description: string): string {
    //#region @backendFunc
    const base = _.kebabCase(description);

    const hash = crypto
      .createHash('sha256')
      .update(description)
      .digest('hex')
      .slice(0, 5);

    return `${base}-${hash}`;
    //#endregion
  }
  //#endregion

  //#region methods & getters / npm install
  private async npmInstall(cwdWorker: string): Promise<void> {
    //#region npm install

    this.project.nodeModules.linkToLocation(cwdWorker);
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

  //#region methods & getters / deplyment to cloud flare
  async deployment(cwdWorker: string): Promise<void> {
    //#region @backendFunc
    await this.loginCliCloudFlare(cwdWorker);
    Helpers.taskStarted(`STARTING DEPLOYMENT OF WORKER ${cwdWorker}`);
    while (true) {
      try {
        Helpers.taskStarted(`Deploying worker to cloud flare...`);
        const data = await UtilsExecProc.spawnAsync(`npm run deploy`, {
          cwd: cwdWorker,
        }).getOutput();
        const accountName = this.extractWorkersDevInfo(data.stdout);
        console.log(data.stdout);
        Helpers.taskDone(`DONE DEPLOYMENT on acccount name "${accountName}"`);
        this.project.taonJson.setCloudFlareAccountSubdomain(accountName);
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

  async loginCliCloudFlare(cwdWorker: string): Promise<void> {
    //#region @backendFunc
    let trysLogin = 0;
    Helpers.info(`CHECKING CLI CLOUDFLARE LOGIN`);
    while (true) {
      try {
        const isLogggedIn = await isWranglerLoggedIn(cwdWorker);
        Helpers.info(`IS LOGGED IN USER: ${isLogggedIn}`);
        if (isLogggedIn) {
          if (trysLogin > 0) {
            Helpers.taskDone(`Logged in cloudflare - DONE`);
          } else {
            Helpers.info(`Already logged in to cloudflare`);
          }
          break;
        } else {
          trysLogin++;
          Helpers.logInfo(`Executing login script...`);
          await UtilsExecProc.spawnAsync('npx wrangler login', {
            cwd: cwdWorker,
          }).waitUntilDoneOrThrow();
          Helpers.info(`Waiting 2 seconds afer login...`);
          await Utils.wait(2);
          Helpers.taskDone(`Login done.`);
        }
      } catch (error) {
        if (!(await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
          break;
        }
      }
    }
    //#endregion
  }

  //#region methods & getters / init process
  private async initProcess(absPathToSubproject: string): Promise<void> {
    //#region @backendFunc
    const cwdWorker = crossPlatformPath([
      absPathToSubproject,
      path.basename(absPathToSubproject),
    ]);

    // console.log({ cwdWorker });

    await this.npmInstall(cwdWorker);

    await this.loginCliCloudFlare(cwdWorker);

    //#region create kv db
    Helpers.info(`KV DB CREATION`);
    while (true) {
      const KV_DB_NAME = await UtilsTerminal.input({
        question: `Provide cloudflare KV database name to create`,
        defaultValue: `SALES_KV_${_.snakeCase(this.project.name).toUpperCase()}`,
        validate: value => {
          return /^[A-Z0-9]+(?:_[A-Z0-9]+)*$/.test(value);
        },
      });
      try {
        await UtilsExecProc.spawnAsync(
          `npx wrangler kv namespace create ${KV_DB_NAME}`,
          {
            cwd: cwdWorker,
          },
        ).waitUntilDoneOrThrow();
        const rcFilePath = crossPlatformPath([cwdWorker, 'src/index.ts']);

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

    await this.deployment(cwdWorker);

    //#region add stripe secret
    Helpers.info(`ADDING STRIP SECRET`);
    while (true) {
      try {
        Helpers.taskStarted(`PLEASE WAIT FOR INPUT TO ADD STRIP SECRET ..`);
        const data = await UtilsExecProc.spawnAsync(
          `npx wrangler secret put STRIPE_SECRET_KEY`,
          {
            cwd: cwdWorker,
          },
        ).getOutput();
        Helpers.taskDone(
          `STRIPE SECRET SAVED for "${this.project.taonJson.cloudFlareAccountSubdomain}"`,
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

    //#region add stripe webhook secret
    Helpers.info(
      `ADDING STRIP ${chalk.bold('WEBHOOK')} SECRET (-> DIFFRENT THAT STRIPE SECRET)`,
    );
    while (true) {
      try {
        Helpers.info(`PLEASE ADD WEBHOOK IN STRIPE FOR ADDRESS:

        ${
          `https://${path.basename(cwdWorker)}` +
          `.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev`
        }


          `);
        await UtilsTerminal.pressAnyKeyToContinueAsync();

        Helpers.taskStarted(
          `PLEASE WAIT FOR INPUT TO ADD WEBHOOK STRIP SECRET ..`,
        );
        await UtilsExecProc.spawnAsync(
          `npx wrangler secret put STRIPE_WEBHOOK_SECRET`,
          {
            cwd: cwdWorker,
          },
        ).getOutput();
        Helpers.taskDone(
          `STRIPE WEBHOOK SECRET SAVED for "${this.project.taonJson.cloudFlareAccountSubdomain}"`,
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

    Helpers.info(`YOUR WORKER ${path.basename(cwdWorker)}

      IS READY TO RECEIVING PAYMENTS AND USE INSIDE TAON

      `);

    //#endregion
  }
  //#endregion

  private async setMode(
    cwdWorker: string,
    mode: 'production' | 'development',
  ): Promise<void> {
    cwdWorker;

    while (true) {
      try {
        const ok = await setSecret(cwdWorker, 'WORKER_STRIPE_MODE', mode);
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
      `DONE. WORKER ${path.basename(cwdWorker)} is no in ${mode} mode`,
    );
  }

  //#region methods & getters / get all sub projects
  getAll(): string[] {
    //#region @backendFunc
    const all = TempalteSubprojectTypeArr.reduce((a, tempalteType) => {
      const folderForSubproject =
        this.pathToTempalteInCurrentProject(tempalteType);

      return a.concat(
        UtilsFilesFoldersSync.getFoldersFrom(folderForSubproject, {
          omitPatterns: UtilsFilesFoldersSync.IGNORE_FOLDERS_FILES_PATTERNS,
        }),
      );
    }, []);

    return all;
    //#endregion
  }
  //#endregion

  getAllSubProjects(): Project[] {
    //#region @backendFunc
    return this.getAll().map(c => this.project.ins.From(c));
    //#endregion
  }

  //#region methods & getters / get core by
  private coreProjectBy(
    templateType: TempalteSubprojectType,
  ): Project | undefined {
    return this.project.ins.From(
      this.project.framework.coreProject.pathFor([
        TemplateFolder.templatesSubprojects,
        templateType,
      ]),
    );
  }
  //#endregion

  // private magicRenameContent(content: string): string {}

  //#region methods & getters / recreate all
  async recreateAll(): Promise<void> {
    //#region backendFunc
    const allProjectsPaths = this.getAll();

    for (const chosenProjectAbscwd of allProjectsPaths) {
      const templateType = path.basename(
        path.dirname(chosenProjectAbscwd),
      ) as TempalteSubprojectType;
      const group = path.basename(
        path.dirname(path.dirname(chosenProjectAbscwd)),
      ) as TempalteSubprojectGroup;

      const core = this.coreProjectBy(templateType);
      const workerCore = this.project.ins.From(
        core.pathFor(path.basename(core.name)),
      );

      const currentCwdWorker = crossPlatformPath([
        chosenProjectAbscwd,
        path.basename(chosenProjectAbscwd),
      ]);

      Helpers.logInfo(`Linking subproject: ${path.basename(currentCwdWorker)}`);

      //#region handle woker data
      (() => {
        const filesForBranding = [
          packageJsonSubProject,
          tsconfigSubProject,
          indexTsInSrcForWorker,
        ];

        workerCore.copy(filesForBranding).to([currentCwdWorker]);

        const magicRenameRules = `${core.name} -> ${path.basename(chosenProjectAbscwd)}`;

        for (const relativePath of filesForBranding) {
          const filePath = crossPlatformPath([currentCwdWorker, relativePath]);
          if (!Helpers.isFolder(filePath)) {
            let content = UtilsFilesFoldersSync.readFile(filePath);
            const rules = RenameRule.from(magicRenameRules);
            for (const rule of rules) {
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
            if (relativePath === indexTsInSrcForWorker) {
              const dbName = HelpersTaon.getValueFromJSONC(
                [currentCwdWorker, wranglerJsonC],
                'kv_namespaces[0].binding',
              );
              UtilsFilesFoldersSync.writeFile(
                filePath,
                content.replace(
                  new RegExp(
                    Utils.escapeStringForRegEx(KV_DATABASE_ONLINE_NAME),
                    'g',
                  ),
                  dbName,
                ),
              );
              UtilsTypescript.formatFile(filePath);
            } else {
              UtilsFilesFoldersSync.writeFile(filePath, content);
            }
          }
        }
      })();
      //#endregion

      //#region handle parent data
      (() => {
        const filesForBranding = [packageJsonSubProject, 'README.md', 'images'];

        core.copy(filesForBranding).to([chosenProjectAbscwd]);

        const magicRenameRules = `${core.name} -> ${path.basename(chosenProjectAbscwd)}`;

        for (const relativePath of filesForBranding) {
          const filePath = crossPlatformPath([
            chosenProjectAbscwd,
            relativePath,
          ]);
          if (!Helpers.isFolder(filePath)) {
            let content = UtilsFilesFoldersSync.readFile(filePath);
            const rules = RenameRule.from(magicRenameRules);
            for (const rule of rules) {
              content = rule.replaceInString(content);
            }
            UtilsFilesFoldersSync.writeFile(filePath, content);
          }
        }
      })();
      //#endregion

      await this.npmInstall(currentCwdWorker);
    }
    //#endregion
  }
  //#endregion

  //#region methods & getters / get all by type
  protected getAllByTypePaths(tempalteType: TempalteSubprojectType): string[] {
    const folderForSubproject =
      this.pathToTempalteInCurrentProject(tempalteType);

    return UtilsFilesFoldersSync.getFoldersFrom(folderForSubproject).filter(
      f => {
        if (
          tempalteType === TempalteSubprojectType.TAON_STRIPE_CLOUDFLARE_WORKER
        ) {
          return Helpers.exists([
            f,
            path.basename(f),
            packageJsonLockSubProject,
          ]);
        }
        return false;
      },
    );
  }
  //#endregion

  //#region methods & getters / get all project by type
  public getAllByType(tempalteType: TempalteSubprojectType): Project[] {
    return this.getAllByTypePaths(tempalteType).map(c =>
      this.project.ins.From(c),
    );
  }
  //#endregion

  //#region methods & getters / extract worker account name
  public extractWorkersDevInfo(text: string) {
    const match = text.match(/https:\/\/([^\.]+)\.([^\.]+)\.workers\.dev/);

    if (!match) {
      return undefined;
    }

    return match[2];
  }
  //#endregion

  //#endregion

  //#region PUBLIC API

  //#region PUBLIC API / add new and configure
  public async addAndConfigure(): Promise<void> {
    //#region @backendFunc
    await this.recreateAll();
    const choices = TempalteSubprojectTypeArr.reduce((a, b) => {
      return {
        [b]: {
          name: b,
        },
      };
    }, {});

    const select: TempalteSubprojectType = await UtilsTerminal.select({
      choices,
      question: `Select subproject that you want to add`,
    });

    let nameForProject: string;
    const alreadyAdded = this.getAll().map(c => path.basename(c));

    while (true) {
      nameForProject = await UtilsTerminal.input({
        required: true,
        defaultValue: `kv-db-${this.project.name}`,
        question: `Name for worker`,
      });
      if (alreadyAdded.includes(nameForProject)) {
        Helpers.info(`Name take.. try another one.`);
        continue;
      }
      break;
    }

    const coreProjTemplatePath = this.pathToTempalteInCore(select);

    const localTempPath = crossPlatformPath([
      this.tempSubProjectFolder,
      path.basename(coreProjTemplatePath),
    ]);

    Helpers.remove(localTempPath);

    UtilsFilesFoldersSync.copy(coreProjTemplatePath, localTempPath, {
      recursive: true,
    });

    const generatedWorkerName = this.workerNameFor(nameForProject);

    const magicRenameRules =
      `${path.basename(coreProjTemplatePath)}` + ` -> ${generatedWorkerName}`;

    const ins = MagicRenamer.Instance(localTempPath);
    ins.start(magicRenameRules, []);

    const pathInsideProject = crossPlatformPath([
      this.pathToTempalteInCurrentProject(select),
      generatedWorkerName,
    ]);

    Helpers.remove(pathInsideProject);

    UtilsFilesFoldersSync.copy(
      [this.tempSubProjectFolder, generatedWorkerName],
      pathInsideProject,
      {
        recursive: true,
      },
    );

    // Helpers.remove(localTempPath); uncomment
    Helpers.remove([this.tempSubProjectFolder, generatedWorkerName]);

    await this.initProcess(crossPlatformPath(pathInsideProject));

    //#endregion
  }
  //#endregion

  //#region PUBLIC API / test with example data
  public async testWithExampleData(): Promise<void> {
    //#region @backendFunc
    await this.recreateAll();
    const subprojects = this.getAllSubProjects();

    const choices = subprojects.reduce((a, b) => {
      return {
        [b.name]: {
          name: b.name,
        },
      };
    }, {});

    const chosenProjectName = await UtilsTerminal.select({
      question: 'Select project to test with exmaple data',
      choices,
    });

    const chosenProject = this.getAllSubProjects().find(
      c => c.name === chosenProjectName,
    );

    const templateType = path.basename(
      path.dirname(chosenProject.location),
    ) as TempalteSubprojectType;

    const group = path.basename(
      path.dirname(path.dirname(chosenProject.location)),
    ) as TempalteSubprojectGroup;

    const url = `https://${chosenProjectName}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev`;

    const currentProjectAbsPath = crossPlatformPath([
      this.pathToTempalteInCurrentProject(templateType),
      chosenProjectName,
    ]);

    const cwdWorker = crossPlatformPath([
      currentProjectAbsPath,
      chosenProjectName,
    ]);

    const prouctChoices = {
      movieProduct: {
        name: 'movie-product-id',
      },
      playlistProuct: {
        name: 'playlist-product-id',
      },
      bookProuct: {
        name: 'book-product-id',
      },
    };

    const alredyUsedEmails = new Set<string>();

    const actionSelect = {
      addSoldProuct: {
        name: 'Add example product (as stripe hook)',
      },
      checkIfProuctAdded: {
        name: 'Check example product (as client)',
      },
      extit: {
        name: 'Exit',
      },
    };

    while (true) {
      Helpers.logInfo(`Testing with example data on url: ${url}`);

      const action = await UtilsTerminal.select<keyof typeof actionSelect>({
        question: 'Select action',
        choices: actionSelect,
      });

      if (action === 'extit') {
        break;
      }

      if (action === 'addSoldProuct') {
        //#region add sold product
        const clientEmail = await UtilsTerminal.input({
          question: 'Provide client email for example sold product',
          defaultValue: `generate.email.${Date.now()}@example.com`,
        });

        alredyUsedEmails.add(clientEmail);

        const productId = await UtilsTerminal.select<
          keyof typeof prouctChoices
        >({
          question: 'Select product id send',
          choices: prouctChoices,
        });

        const req = new TaonStripeCloudflareWorker(url);
        try {
          await req.sendAsStripe({
            stripeSessionId: `stripesessionid_${Date.now()}`,
            productId,
            clientEmail,
          });

          Helpers.info(
            `Example product added with client email: ${clientEmail} and product id: ${productId}`,
          );
          await UtilsTerminal.pressAnyKeyToContinueAsync();
        } catch (error) {
          console.log(error);
          Helpers.error(`Error adding example product: ${error.message}`);
          await UtilsTerminal.pressAnyKeyToContinueAsync();
        }
        //#endregion
      } else if (action === 'checkIfProuctAdded') {
        //#region check if product added
        const req = new TaonStripeCloudflareWorker(url);

        const productId = await UtilsTerminal.select<
          keyof typeof prouctChoices
        >({
          question: 'Select product id send',
          choices: prouctChoices,
        });

        const choicesEmail = Array.from(alredyUsedEmails).reduce((a, b) => {
          return {
            [b]: { name: b },
          };
        }, {});

        const clientEmail = await UtilsTerminal.select({
          question: 'Select client email to check',
          choices: choicesEmail,
        });

        try {
          const result = await req.checkAccess({ productId, clientEmail });
          Helpers.info(
            `Checking result for:
             client email: ${clientEmail}
             product id: ${productId}
             CLIENT HAS ACCESS: ${result}`,
          ); // should be true
          await UtilsTerminal.pressAnyKeyToContinueAsync();
        } catch (error) {
          console.log(error);
          Helpers.error(
            `Error checking if product purchased: ${error.message}`,
          );
          await UtilsTerminal.pressAnyKeyToContinueAsync();
        }
        //#endregion
      }
    }

    // Helpers,
    // await

    //#endregion
  }
  //#endregion

  //#region PUBLIC API / set mode for worker
  public async setModeForWorker(): Promise<void> {
    //#region @backendFunc
    await this.recreateAll();
    const subprojects = this.getAllSubProjects();

    const choices = subprojects.reduce((a, b) => {
      return {
        [b.name]: {
          name: b.name,
        },
      };
    }, {});

    const chosenProjectName = await UtilsTerminal.select({
      question: 'Select project to set mode:',
      choices,
    });

    const chosenProject = this.getAllSubProjects().find(
      c => c.name === chosenProjectName,
    );

    const templateType = path.basename(
      path.dirname(chosenProject.location),
    ) as TempalteSubprojectType;

    const group = path.basename(
      path.dirname(path.dirname(chosenProject.location)),
    ) as TempalteSubprojectGroup;

    const url = `https://${chosenProjectName}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev`;

    const currentProjectAbsPath = crossPlatformPath([
      this.pathToTempalteInCurrentProject(templateType),
      chosenProjectName,
    ]);

    const cwdWorker = crossPlatformPath([
      currentProjectAbsPath,
      chosenProjectName,
    ]);

    const setModeChoices = {
      setProduction: {
        name: 'production',
      },
      setDevelopment: {
        name: 'development',
      },
      exit: {
        name: 'BACK',
      },
    };

    const mode = await UtilsTerminal.select<keyof typeof setModeChoices>({
      question: 'Select worker mode:',
      choices: setModeChoices,
    });

    if (mode === 'exit') {
      return;
    }

    await this.setMode(cwdWorker, mode as any);

    //#endregion
  }
  //#endregion

  //#region PUBLIC API / deploy worker
  public async deployWorker(): Promise<void> {
    //#region @backendFunc
    await this.recreateAll();

    const subprojects = this.getAllSubProjects();

    const choices = subprojects.reduce((a, b) => {
      return {
        [b.name]: {
          name: b.name,
        },
      };
    }, {});

    const chosenProjectName = await UtilsTerminal.select({
      question: 'Select project to deploy:',
      choices,
    });

    const chosenProject = this.getAllSubProjects().find(
      c => c.name === chosenProjectName,
    );

    const templateType = path.basename(
      path.dirname(chosenProject.location),
    ) as TempalteSubprojectType;

    const group = path.basename(
      path.dirname(path.dirname(chosenProject.location)),
    ) as TempalteSubprojectGroup;

    const url = `https://${chosenProjectName}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev`;

    const currentProjectAbsPath = crossPlatformPath([
      this.pathToTempalteInCurrentProject(templateType),
      chosenProjectName,
    ]);

    const cwdWorker = crossPlatformPath([
      currentProjectAbsPath,
      chosenProjectName,
    ]);

    await this.deployment(cwdWorker);

    //#endregion
  }
  //#endregion

  //#endregion
}

//#region  helpers

//#region  helpers / is wrangelr logged in
async function isWranglerLoggedIn(cwd: string): Promise<boolean> {
  //#region @backendFunc
  try {
    const data =
      (await UtilsExecProc.spawnAsync('npx wrangler whoami', {
        cwd,
      }).getStdoutWithoutShowingOrThrow()) || '';
    if (data.includes('You are not authenticated')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
  //#endregion
}
//#endregion

//#region helpers / set secret cloudflare
export async function setSecret(
  cwdWorker: string,
  name: string,
  value: string,
): Promise<boolean> {
  //#region @backendFunc
  return new Promise<boolean>((resolve, reject) => {
    const proc = spawn('npx', ['wrangler', 'secret', 'put', name], {
      stdio: ['pipe', 'inherit', 'inherit'],
      cwd: cwdWorker,
    });

    proc.stdin.write(value);
    proc.stdin.end();

    proc.on('close', code => {
      if (code === 0) resolve(true);
      else reject(new Error(`wrangler exited with ${code}`));
    });
  });
  //#endregion
}
//#endregion

//#endregion
