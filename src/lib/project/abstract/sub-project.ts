//#region imports
import { TaonStripeCloudflareWorker } from '@taon-dev/api-workers/src';
import { MagicRenamer } from 'magic-renamer/src';
import {
  path,
  UtilsFilesFoldersSync,
  UtilsTerminal,
  _,
  crossPlatformPath,
  Helpers,
  config,
} from 'tnp-core/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import {
  TempalteSubprojectType,
  TempalteSubprojectTypeArr,
} from '../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../options';

import { CloudFlareSubProject } from './cloud-flare-projects/cloud-flare-project';
import { CloudFlareSubProjectsRepository } from './cloud-flare-projects/cloud-flare-projects.repository';
import { CloudFlarePorjectsUtils } from './cloud-flare-projects/cloud-flare-projects.utils';
import { CloudFlareStripeWorkerPorject } from './cloud-flare-projects/cloud-flare-stripe-worker-project';
import { CloudFlareYtWorkerPorject } from './cloud-flare-projects/cloud-flare-yt-worker-project';
import { Project } from './project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class SubProject extends BaseFeatureForProject<Project> {
  public readonly repo: CloudFlareSubProjectsRepository;

  constructor(project: Project) {
    super(project);
    this.repo = new CloudFlareSubProjectsRepository(project);
  }

  //#region PUBLIC API / set mode for worker
  public async getInfo(): Promise<void> {
    //#region @backendFunc
    if (this.repo.getAll().length === 0) {
      await UtilsTerminal.pressAnyKeyToContinueAsync({
        message: `Please use ${config.frameworkName} sub add # to add woker.. Press any key to return.`,
      });
      return;
    }
    const chosenProject = await this.selectAnyProject();
    await chosenProject.init();

    Helpers.info(`

      name: ${chosenProject.name}
      location: ${chosenProject.absLocationPath}
      template type: ${chosenProject.selectedTempalte}


      `);

    await UtilsTerminal.pressAnyKeyToContinueAsync();

    //#endregion
  }
  //#endregion

  //#region PUBLIC API / add new and configure
  public async startInDevMode(opt?: {
    projectName?: string;
    envOptions?: EnvOptions;
  }): Promise<void> {
    //#region @backendFunc
    opt = opt || {};
    // console.log(`opt`, opt);
    if (this.repo.getAll().length === 0) {
      await UtilsTerminal.pressAnyKeyToContinueAsync({
        message: `Please use ${config.frameworkName} sub add # to add woker.. Press any key to return.`,
      });
      return;
    }
    const chosenProject = await this.selectAnyProject(opt.projectName);
    await chosenProject.init();
    await chosenProject.startInDevMode(opt.envOptions);
    //#endregion
  }
  //#endregion

  //#region PUBLIC API / add new and configure
  public async addAndConfigure(
    opt?: CloudFlarePorjectsUtils.AddProjectOptions,
  ): Promise<void> {
    //#region @backendFunc
    opt = opt || {};
    const choices = TempalteSubprojectTypeArr.reduce((a, b) => {
      return {
        ...a,
        [b]: {
          name: b,
        },
      };
    }, {});

    const selectedTemplate: TempalteSubprojectType = opt.projectType
      ? opt.projectType
      : await UtilsTerminal.select({
          choices,
          question: `Select cloud flare subproject that you want to add`,
        });

    let nameForProject: string;
    const alreadyAdded = this.repo
      .getAllFoldersWithProjects()
      .map(c => path.basename(c));

    while (true) {
      nameForProject = await UtilsTerminal.input({
        required: true,
        defaultValue: CloudFlarePorjectsUtils.getWorkerPrefixFromTemplate(
          selectedTemplate,
          this.project.shortName,
        ),
        question: `Name for worker`,
      });
      if (alreadyAdded.includes(nameForProject)) {
        Helpers.info(`Name take.. try another one.`);
        continue;
      }
      break;
    }

    const coreProjTemplatePath =
      this.repo.pathToTempalteInCore(selectedTemplate);

    const localTempPath = crossPlatformPath([
      this.repo.tempSubProjectFolder,
      path.basename(coreProjTemplatePath),
    ]);

    const generatedWorkerName = this.repo.workerNameFor(nameForProject);

    const localTempPathAfterMagicRename = crossPlatformPath([
      this.repo.tempSubProjectFolder,
      generatedWorkerName,
    ]);

    Helpers.remove(localTempPath);

    UtilsFilesFoldersSync.copy(coreProjTemplatePath, localTempPath, {
      recursive: true,
    });

    const magicRenameRules =
      `${path.basename(coreProjTemplatePath)}` + ` -> ${generatedWorkerName}`;

    const ins = MagicRenamer.Instance(localTempPath);
    ins.start(magicRenameRules, []);

    const environments = this.project.releaseProcess.getEnvNamesByArtifact(
      ReleaseArtifactTaon.ANGULAR_NODE_APP,
    );

    let selectedEnv = opt.projectEnvironmentNameWithNumber;
    if (
      !opt.projectEnvironmentNameWithNumber &&
      selectedTemplate === TempalteSubprojectType.TAON_CUSTOM_CLOUDFLARE_WORKER
    ) {
      selectedEnv = await UtilsTerminal.select({
        choices: environments
          .filter(e => {
            return e.envName !== '__';
          }) // filter out default env from selection
          .map(e => {
            return {
              name: e.envName === '__' ? '__ ( default )' : e.envName,
              value: e.envName,
            };
          }),
        question: `Select environment for worker`,
        autocomplete: true,
      });
    }

    const absLocationPath = crossPlatformPath([
      this.repo.pathToTempalteInCurrentProject(selectedTemplate, selectedEnv),
      generatedWorkerName,
    ]);

    Helpers.remove(absLocationPath);

    UtilsFilesFoldersSync.copy(localTempPathAfterMagicRename, absLocationPath, {
      recursive: true,
    });

    Helpers.remove(localTempPath);
    Helpers.remove([this.repo.tempSubProjectFolder, generatedWorkerName]);
    const newWorker =
      CloudFlarePorjectsUtils.cloudFlareProjectFrom(absLocationPath);

    await newWorker.afterCreation(opt);

    //#endregion
  }
  //#endregion

  //#region PUBLIC API / test with example data
  public async testStripeProjectWithExampleData(): Promise<void> {
    //#region @backendFunc
    if (this.repo.getAll().length === 0) {
      await UtilsTerminal.pressAnyKeyToContinueAsync({
        message: `Please use ${config.frameworkName} sub add # to add woker.. Press any key to return.`,
      });
      return;
    }
    const chosenProject = await this.selectStripeProject();
    await chosenProject.init();

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
      Helpers.logInfo(
        `Testing with example data on url: ${chosenProject.workerUrl}`,
      );

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

        const req = new TaonStripeCloudflareWorker(chosenProject.workerUrl);
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
        const req = new TaonStripeCloudflareWorker(chosenProject.workerUrl);

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
    if (this.repo.getAll().length === 0) {
      await UtilsTerminal.pressAnyKeyToContinueAsync({
        message: `Please use ${config.frameworkName} sub add # to add woker.. Press any key to return.`,
      });
      return;
    }
    const chosenProject = await this.selectAnyProject();
    await chosenProject.init();

    const setModeChoices = {
      production: {
        name: 'production',
      },
      development: {
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

    await chosenProject.setMode(mode);

    //#endregion
  }
  //#endregion

  //#region PUBLIC API / set secrets for worker
  public async setWorkerSecrets(): Promise<void> {
    //#region @backendFunc
    if (this.repo.getAll().length === 0) {
      await UtilsTerminal.pressAnyKeyToContinueAsync({
        message: `Please use ${config.frameworkName} sub add # to add woker.. Press any key to return.`,
      });
      return;
    }
    while (true) {
      const chosenProject = await this.selectAnyProject();
      await chosenProject.init();
      await chosenProject.setApiSecreats();
      const again = await UtilsTerminal.confirm({
        message: `Would you like to set secret again to project ?`,
        defaultValue: true,
      });
      if (!again) {
        return;
      }
    }
    //#endregion
  }
  //#endregion

  //#region PUBLIC API / deploy worker
  public async deployWorker(): Promise<void> {
    //#region @backendFunc
    while (true) {
      const chosenProject = await this.selectAnyProject();
      await chosenProject.deployment();
      const again = await UtilsTerminal.confirm({
        message: `Would you like to deploy any project again ?`,
        defaultValue: true,
      });
      if (!again) {
        return;
      }
    }

    //#endregion
  }
  //#endregion

  //#region private methods / select location
  private async selectLocation(
    subprojects: CloudFlareSubProject[],
  ): Promise<
    | CloudFlareSubProject
    | CloudFlareStripeWorkerPorject
    | CloudFlareYtWorkerPorject
  > {
    //#region @backendFunc
    const choices = subprojects.reduce((a, b) => {
      return {
        ...a,
        [b.absLocationPath]: {
          name: b.displayName,
        },
      };
    }, {});

    const chosenProjectLocation = await UtilsTerminal.select({
      question: 'Select project:',
      choices,
    });

    const chosenProject = this.repo
      .getAll()
      .find(c => c.absLocationPath === chosenProjectLocation);

    return chosenProject;
    //#endregion
  }
  //#endregion

  //#region private methods / select any location
  private async selectAnyProject(
    projectName?: string,
  ): Promise<CloudFlareSubProject> {
    //#region @backendFunc
    const subprojects = this.repo.getAll();
    const projeFromArgs = subprojects.find(c => c.name === projectName);
    // console.log('projectName', projectName);
    // console.log(`subprojects`, subprojects.map(c => c.name));
    // console.log(`projeFromArgs`, projeFromArgs);
    const chosenProject = projeFromArgs
      ? projeFromArgs
      : await this.selectLocation(subprojects);

    return chosenProject as any;
    //#endregion
  }
  //#endregion

  //#region private methods / select stripe porject
  private async selectStripeProject(): Promise<CloudFlareStripeWorkerPorject> {
    //#region @backendFunc
    const subprojects = this.repo.getAll_Stripe_Projects();

    const chosenProject = await this.selectLocation(subprojects as any);

    return chosenProject as CloudFlareStripeWorkerPorject;
    //#endregion
  }
  //#endregion
}
