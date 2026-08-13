//#region imports

import { _, CoreModels, path, UtilsFilesFoldersSync } from 'tnp-core/src';
import { BaseFeatureForProject, Helpers } from 'tnp-helpers/src';

import {
  groupsFolder,
  mainProjectSubProjects,
  packageJsonSubProject,
  TempalteSubprojectType,
  TempalteSubprojectTypeArr,
  TempalteSubprojectTypeGroup,
  TemplateFolder,
} from '../../../constants';
import { ReleaseArtifactTaon, ReleaseType } from '../../../options';
import type { Project } from '../project';

import { CloudFlareEmailWorkerPorject } from './cloud-flare-email-worker-project';
import { CloudFlareProject } from './cloud-flare-project';
import { CloudFlarePorjectsUtils } from './cloud-flare-projects.utils';
import { CloudFlareStripeWorkerPorject } from './cloud-flare-stripe-worker-project';
import { CloudFlareYtWorkerPorject } from './cloud-flare-yt-worker-project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class CloudFlareProjectsRepository extends BaseFeatureForProject<Project> {
  constructor(project: Project) {
    super(project);
    //  this.repo = new CloudFlareProjectsRepository(this);
  }

  //#region this project temp sub project folder
  public get tempSubProjectFolder(): string {
    return this.project.pathFor('tmp-subproject-temp');
  }
  //#endregion

  //#region core project path template type
  public pathToTempalteInCore(templateType: TempalteSubprojectType): string {
    return this.project.framework.coreProject.pathFor([
      TemplateFolder.templatesSubprojects,
      groupsFolder,
      TempalteSubprojectTypeGroup[templateType],
      templateType,
    ]);
  }
  //#endregion

  //#region this project path template type
  public pathToTempalteInCurrentProject(
    templateType: TempalteSubprojectType,
    environmentName?: CoreModels.EnvironmentNameTaon,
  ): string {
    return this.project.pathFor(
      `${mainProjectSubProjects}/${TempalteSubprojectTypeGroup[templateType]}/${templateType}${environmentName ? `__${environmentName}` : ''}`,
    );
  }
  //#endregion

  //#region worker name for
  public workerNameFor(description: string): string {
    //#region @backendFunc
    const crypto = require('crypto');
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

  //#region get all
  public getAllFoldersWithProjects(): string[] {
    //#region @backendFunc
    const environments = CoreModels.EnvironmentNameArr;

    const all = TempalteSubprojectTypeArr.reduce((allFolders, tempalteType) => {
      const availableEnvs: readonly CoreModels.EnvironmentNameTaon[] =
        tempalteType === TempalteSubprojectType.TAON_CUSTOM_CLOUDFLARE_WORKER
          ? environments
          : [void 0];

      const available = availableEnvs
        .map(env => {
          const foldersPath = this.pathToTempalteInCurrentProject(
            tempalteType,
            env,
          );

          return UtilsFilesFoldersSync.getFoldersFrom(foldersPath, {
            omitPatterns: UtilsFilesFoldersSync.IGNORE_FOLDERS_FILES_PATTERNS,
          });
        })
        .reduce((a, b) => {
          return a.concat(b);
        }, [] as string[]);

      return allFolders.concat(available);
    }, []);

    return all;
    //#endregion
  }
  //#endregion

  //#region get all subprojects
  private getAllSubProjects(): Project[] {
    //#region @backendFunc
    return this.getAllFoldersWithProjects()
      .map(c => this.project.ins.From(c))
      .filter(f => !!f);
    //#endregion
  }
  //#endregion

  //#region get all cloud flare projects
  public getAll(): CloudFlareProject[] {
    const allFolders = this.getAllSubProjects();
    // console.log({ allFolders });
    return allFolders.map(c => {
      return CloudFlarePorjectsUtils.cloudFlareProjectFrom(
        c.location,
        this.project,
      );
    });
  }
  //#endregion

  //#region get all cloud flare YT projects
  public getAll_YT_Projects(): CloudFlareYtWorkerPorject[] {
    return this.getAll().filter(f => {
      return (
        f.selectedTempalte === TempalteSubprojectType.TAON_YT_CLOUDFLARE_WORKER
      );
    }) as CloudFlareYtWorkerPorject[];
  }
  //#endregion

  //#region get all cloud flare email projects
  public getAll_Email_Projects(): CloudFlareEmailWorkerPorject[] {
    return this.getAll().filter(f => {
      return (
        f.selectedTempalte ===
        TempalteSubprojectType.TAON_EMAIL_CLOUDFLARE_WORKER
      );
    }) as CloudFlareEmailWorkerPorject[];
  }
  //#endregion

  //#region get all cloud flare stripe projects
  public getAll_Stripe_Projects(): CloudFlareStripeWorkerPorject[] {
    return this.getAll().filter(f => {
      return (
        f.selectedTempalte ===
        TempalteSubprojectType.TAON_STRIPE_CLOUDFLARE_WORKER
      );
    }) as CloudFlareStripeWorkerPorject[];
  }
  //#endregion

  //#region get all by type
  protected getAllByTypePaths(tempalteType: TempalteSubprojectType): string[] {
    const environments = CoreModels.EnvironmentNameArr;

    const availableEnvs: readonly CoreModels.EnvironmentNameTaon[] =
      tempalteType === TempalteSubprojectType.TAON_CUSTOM_CLOUDFLARE_WORKER
        ? environments
        : [void 0];

    const available = availableEnvs
      .map(env =>
        UtilsFilesFoldersSync.getFoldersFrom(
          this.pathToTempalteInCurrentProject(tempalteType, env),
          {
            omitPatterns: UtilsFilesFoldersSync.IGNORE_FOLDERS_FILES_PATTERNS,
          },
        ),
      )
      .reduce((a, b) => {
        return a.concat(b);
      }, [] as string[])
      .filter(f => {
        return Helpers.exists([f, path.basename(f), packageJsonSubProject]);
      });

    return available;
  }
  //#endregion

  //#region get all project by type
  public getAllByType(tempalteType: TempalteSubprojectType): Project[] {
    const allPaths = this.getAllByTypePaths(tempalteType);
    const byType = allPaths.map(c => this.project.ins.From(c)).filter(f => !!f);

    return byType;
  }
  //#endregion

  //#region recreate all
  async initAll(): Promise<void> {
    //#region backendFunc
    const allFolder = this.getAllFoldersWithProjects();

    for (const absProjPath of allFolder) {
      const selectedTempalte = _.first(
        path.basename(path.dirname(absProjPath)).split('__'),
      ) as TempalteSubprojectType;

      const coreProj = this.project.ins.From(
        this.pathToTempalteInCore(selectedTempalte),
      );

      if (coreProj) {
        CloudFlarePorjectsUtils.initProjectFilesAndAssets(
          coreProj!,
          absProjPath,
        );
      }
    }

    const allProjects = this.getAll();

    for (const proj of allProjects) {
      await proj.init();
    }
    //#endregion
  }
  //#endregion
}
