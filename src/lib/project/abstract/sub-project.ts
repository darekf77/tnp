//#region imports
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
import {
  BaseFeatureForProject,
  BaseQuickFixes,
  HelpersTaon,
  UtilsTypescript,
} from 'tnp-helpers/src';

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
  TemplateSubprojectDbPrefix,
  TemplateSubprojectWorkerPrefix,
  tsconfigSubProject,
  wranglerJsonC,
} from '../../constants';

import { Project } from './project';
import { CloudFlareProjectsRepository } from './cloud-flare-projects/cloud-flare-projects.repository';
import { CloudFlarePorjectsUtils } from './cloud-flare-projects/cloud-flare-projects.utils';
import { CloudFlareProject } from './cloud-flare-projects/cloud-flare-project';
import { CloudFlareYtWorkerPorject } from './cloud-flare-projects/cloud-flare-yt-worker-project';
import { CloudFlareStripeWorkerPorject } from './cloud-flare-projects/cloud-flare-stripe-worker-project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class SubProject extends BaseFeatureForProject<Project> {
  public readonly repo: CloudFlareProjectsRepository;
  constructor(project: Project) {
    super(project);
    this.repo = new CloudFlareProjectsRepository(project);
  }

  //#region PUBLIC API / add new and configure
  public async addAndConfigure(): Promise<void> {
    //#region @backendFunc
    await this.repo.initAll();

    const choices = TempalteSubprojectTypeArr.reduce((a, b) => {
      return {
        ...a,
        [b]: {
          name: b,
        },
      };
    }, {});

    const selectedTemplate: TempalteSubprojectType = await UtilsTerminal.select(
      {
        choices,
        question: `Select cloud flare subproject that you want to add`,
      },
    );

    let nameForProject: string;
    const alreadyAdded = this.repo
      .getAllFoldersWithProjects()
      .map(c => path.basename(c));

    while (true) {
      nameForProject = await UtilsTerminal.input({
        required: true,
        defaultValue: `kv-worker-${this.project.name}-${TemplateSubprojectWorkerPrefix[selectedTemplate]}`,
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

    Helpers.remove(localTempPath);

    UtilsFilesFoldersSync.copy(coreProjTemplatePath, localTempPath, {
      recursive: true,
    });

    const generatedWorkerName = this.repo.workerNameFor(nameForProject);

    const magicRenameRules =
      `${path.basename(coreProjTemplatePath)}` + ` -> ${generatedWorkerName}`;

    const ins = MagicRenamer.Instance(localTempPath);
    ins.start(magicRenameRules, []);

    const absLocationPath = crossPlatformPath([
      this.repo.pathToTempalteInCurrentProject(selectedTemplate),
      generatedWorkerName,
    ]);

    Helpers.remove(absLocationPath);

    UtilsFilesFoldersSync.copy(
      [this.repo.tempSubProjectFolder, generatedWorkerName],
      absLocationPath,
      {
        recursive: true,
      },
    );

    Helpers.remove(localTempPath);
    Helpers.remove([this.repo.tempSubProjectFolder, generatedWorkerName]);
    const newWorker = CloudFlarePorjectsUtils.cloudFlareProjectFrom(
      absLocationPath,
      this.project,
    );
    await newWorker.afterCreation();

    //#endregion
  }
  //#endregion

  //#region PUBLIC API / test with example data
  public async testStripeProjectWithExampleData(): Promise<void> {
    //#region @backendFunc
    await this.repo.initAll();
    const chosenProject = await this.selectStripeProject();
    await chosenProject.addStripeSecrets();

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
    await this.repo.initAll();
    const chosenProject = await this.selectAnyProject();

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
  public async setWorkerStripeSecrets(): Promise<void> {
    //#region @backendFunc
    await this.repo.initAll();
    const chosenProject = await this.selectStripeProject();
    await chosenProject.addStripeSecrets();
    //#endregion
  }
  //#endregion

  //#region PUBLIC API / deploy worker
  public async deployWorker(): Promise<void> {
    //#region @backendFunc
    await this.repo.initAll();
    const chosenProject = await this.selectAnyProject();
    await chosenProject.deployment();
    //#endregion
  }
  //#endregion

  //#region private methods / select location
  private async selectLocation(
    subprojects: CloudFlareProject[],
  ): Promise<
    | CloudFlareProject
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
  private async selectAnyProject(): Promise<CloudFlareProject> {
    //#region @backendFunc
    const subprojects = this.repo.getAll();

    const chosenProject = await this.selectLocation(subprojects);

    return chosenProject;
    //#endregion
  }
  //#endregion

  //#region private methods / select yt porject
  private async selectYtProject(): Promise<CloudFlareYtWorkerPorject> {
    //#region @backendFunc
    const subprojects = this.repo.getAll_YT_Projects();

    const chosenProject = await this.selectLocation(subprojects);

    return chosenProject as CloudFlareYtWorkerPorject;
    //#endregion
  }
  //#endregion

  //#region private methods / select stripe porject
  private async selectStripeProject(): Promise<CloudFlareStripeWorkerPorject> {
    //#region @backendFunc
    const subprojects = this.repo.getAll_Stripe_Projects();

    const chosenProject = await this.selectLocation(subprojects);

    return chosenProject as CloudFlareStripeWorkerPorject;
    //#endregion
  }
  //#endregion
}
