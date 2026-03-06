import { execSync } from 'child_process';
import * as crypto from 'crypto';

import { MagicRenamer } from 'magic-renamer/src';
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
} from 'tnp-core/src';
import { BaseQuickFixes } from 'tnp-helpers/src';

import {
  mainProjectSubProjects,
  nodeModulesSubPorject,
  packageJsonLockSubProject,
  TempalteSubprojectType,
  TempalteSubprojectTypeArr,
  TempalteSubprojectTypeGroup,
  TemplateFolder,
} from '../../constants';

import { Project } from './project';

// @ts-ignore TODO weird inheritance problem

export class SubProject extends BaseQuickFixes<Project> {
  //#region this project temp sub project folder
  private get tempSubProjectFolder(): string {
    return this.project.pathFor('tmp-subproject-temp');
  }
  //#endregion

  //#region core project path template type
  private pathToTempalteInCore(templateType: TempalteSubprojectType): string {
    return this.project.framework.coreProject.pathFor(
      `${TemplateFolder.templatesSubprojects}/${templateType}`,
    );
  }
  //#endregion

  //#region this project path template type
  private pathToTempalteInCurrentProject(
    templateType: TempalteSubprojectType,
  ): string {
    return this.project.pathFor(
      `${mainProjectSubProjects}/${TempalteSubprojectTypeGroup[templateType]}/${templateType}`,
    );
  }
  //#endregion

  //#region worker name for
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

  private async npmInstall(cwdWorker: string): Promise<void> {
    //#region npm install

    this.project.nodeModules.linkToLocation(cwdWorker);
    Helpers.info(`Linking node_modules done`)
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

  //#region init process
  private async initProcess(absPathToSubproject: string): Promise<void> {
    //#region @backendFunc
    const cwdWorker = crossPlatformPath([
      absPathToSubproject,
      path.basename(absPathToSubproject),
    ]);

    // console.log({ cwdWorker });

    await this.npmInstall(cwdWorker);

    //#region login cloud flare
    let trysLogin = 0;
    Helpers.info(`CLOUD FLARE LOGIN`);
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
          new RegExp(
            Utils.escapeStringForRegEx('KV_DATABASE_ONLINE_NAME'),
            'g',
          ),
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

    //#region deploy to cloudflare
    Helpers.info(`DEPLOYMENT`);
    while (true) {
      try {
        Helpers.taskStarted(`Deploying worker to cloud flare...`);
        const data = await UtilsExecProc.spawnAsync(`npm run deploy`, {
          cwd: cwdWorker,
        }).getOutput();
        const accountName = this.extractWorkersDevInfo(data.stdout);
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

    //#endregion
  }
  //#endregion

  //#region select configure and add
  public async selectConfigureAndAdd(): Promise<void> {
    //#region @backendFunc
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

    const nameForProject = await UtilsTerminal.input({
      required: true,
      defaultValue: `kv-db-${this.project.name}`,
      question: `Name for worker`,
    });

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

  //#region get all by type
  protected getAllByTypePaths(tempalteType: TempalteSubprojectType): string[] {
    return UtilsFilesFoldersSync.getFoldersFrom(
      this.pathToTempalteInCurrentProject(tempalteType),
    ).filter(f => {
      if (
        tempalteType === TempalteSubprojectType.TAON_STRIPE_CLOUDFLARE_WORKER
      ) {
        return Helpers.exists([f, path.basename(f), packageJsonLockSubProject]);
      }
      return false;
    });
  }
  //#endregion

  //#region get all project by type
  public getAllByType(tempalteType: TempalteSubprojectType): Project[] {
    return this.getAllByTypePaths(tempalteType).map(c =>
      this.project.ins.From(c),
    );
  }
  //#endregion

  //#region extract worker account name
  public extractWorkersDevInfo(text: string) {
    const match = text.match(/https:\/\/([^\.]+)\.([^\.]+)\.workers\.dev/);

    if (!match) {
      return undefined;
    }

    return match[2];
  }
  //#endregion

  //#region test with example data
  public async testWithExampleData(): Promise<void> {
    //#region @backendFunc

    const selectedType = TempalteSubprojectType.TAON_STRIPE_CLOUDFLARE_WORKER;

    const subprojects = this.getAllByType(selectedType);

    const choices = subprojects.reduce((a, b) => {
      return {
        [b.name]: {
          name: b.name,
        },
      };
    }, {});

    const chosenProject = await UtilsTerminal.select({
      question: 'Select project to test with exmaple data',
      choices,
    });

    const url = `https://${chosenProject}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev`;

    const pathInsideProject = crossPlatformPath([
      this.pathToTempalteInCurrentProject(selectedType),
      chosenProject,
    ]);

    const cwdWorker = crossPlatformPath([pathInsideProject, chosenProject]);

    await this.npmInstall(cwdWorker);

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
}

//#region is wrangelr logged in
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
