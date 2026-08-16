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
import { CloudFlareSubProject } from './cloud-flare-project';
import { CloudFlarePorjectsUtils } from './cloud-flare-projects.utils';
import { CloudFlareStripeWorkerPorject } from './cloud-flare-stripe-worker-project';
import { CloudFlareYtWorkerPorject } from './cloud-flare-yt-worker-project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class CloudFlareSubProjectsRepository extends BaseFeatureForProject<Project> {
  constructor(project: Project) {
    super(project);
    //  this.repo = new CloudFlareSubProjectsRepository(this);
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
    environmentNameWithNumber?: string,
  ): string {
    return this.project.pathFor(
      `${mainProjectSubProjects}/${TempalteSubprojectTypeGroup[templateType]}/` +
        `${templateType}${
          environmentNameWithNumber ? `__${environmentNameWithNumber}` : ''
        }`,
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
    const environments = this.project.releaseProcess
      .getEnvNamesByArtifact(ReleaseArtifactTaon.ANGULAR_NODE_APP)
      .map(c => `${c.envName}${c.envNumber ?? ''}`);

    const all = TempalteSubprojectTypeArr.reduce((allFolders, tempalteType) => {
      const availableEnvs: readonly string[] =
        tempalteType === TempalteSubprojectType.TAON_CUSTOM_CLOUDFLARE_WORKER
          ? environments
          : [void 0];

      const available = availableEnvs
        .map(envWithNameAndNum => {
          const foldersPath = this.pathToTempalteInCurrentProject(
            tempalteType,
            envWithNameAndNum,
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
  public getAll(): CloudFlareSubProject[] {
    const allFolders = this.getAllSubProjects();
    // console.log({ allFolders });
    return allFolders.map(c => {
      return CloudFlarePorjectsUtils.cloudFlareProjectFrom(c.location);
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

  //#region get all cloud flare stripe projects
  public getAll_Custom_Projects(): CloudFlareStripeWorkerPorject[] {
    return this.getAll().filter(f => {
      return (
        f.selectedTempalte ===
        TempalteSubprojectType.TAON_CUSTOM_CLOUDFLARE_WORKER
      );
    }) as CloudFlareStripeWorkerPorject[];
  }
  //#endregion

  //#region get all by type
  protected getAllByTypePaths(tempalteType: TempalteSubprojectType): string[] {
    const environments = this.project.releaseProcess
      .getEnvNamesByArtifact(ReleaseArtifactTaon.ANGULAR_NODE_APP)
      .map(c => `${c.envName}${c.envNumber ?? ''}`);

    const availableEnvs: readonly string[] =
      tempalteType === TempalteSubprojectType.TAON_CUSTOM_CLOUDFLARE_WORKER
        ? environments
        : [void 0];

    const available = availableEnvs
      .map(envNameWithNum =>
        UtilsFilesFoldersSync.getFoldersFrom(
          this.pathToTempalteInCurrentProject(tempalteType, envNameWithNum),
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
    const allProjects = this.getAll();

    for (const proj of allProjects) {
      await proj.init();
    }
    //#endregion
  }
  //#endregion
}
