//#region imports
import {
  BaseFeatureForProject,
  Helpers,
  HelpersTaon,
  UtilsTypescript,
} from 'tnp-helpers/src';
import type { Project } from '../project';
import * as crypto from 'crypto';
import {
  indexTsInSrcForWorker,
  KV_DATABASE_ONLINE_NAME,
  mainProjectSubProjects,
  packageJsonSubProject,
  TempalteSubprojectGroup,
  TempalteSubprojectType,
  TempalteSubprojectTypeArr,
  TempalteSubprojectTypeGroup,
  TemplateFolder,
  tsconfigSubProject,
  wranglerJsonC,
} from '../../../constants';
import {
  _,
  crossPlatformPath,
  path,
  Utils,
  UtilsExecProc,
  UtilsFilesFoldersSync,
  UtilsTerminal,
} from 'tnp-core/src';
import { CloudFlarePorjectsUtils } from './cloud-flare-projects.utils';
import { RenameRule } from 'magic-renamer/src';
import { CloudFlareYtWorkerPorject } from './cloud-flare-yt-worker-project';
import { CloudFlareStripeWorkerPorject } from './cloud-flare-stripe-worker-project';
import { CloudFlareProject } from './cloud-flare-project';
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
    return this.project.framework.coreProject.pathFor(
      `${TemplateFolder.templatesSubprojects}/${templateType}`,
    );
  }
  //#endregion

  //#region this project path template type
  public pathToTempalteInCurrentProject(
    templateType: TempalteSubprojectType,
  ): string {
    return this.project.pathFor(
      `${mainProjectSubProjects}/${TempalteSubprojectTypeGroup[templateType]}/${templateType}`,
    );
  }
  //#endregion

  //#region worker name for
  public workerNameFor(description: string): string {
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

  //#region get all
  public getAllFoldersWithProjects(): string[] {
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
    return this.getAllSubProjects().map(c => {
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
    const folderForSubproject =
      this.pathToTempalteInCurrentProject(tempalteType);

    return UtilsFilesFoldersSync.getFoldersFrom(folderForSubproject, {
      omitPatterns: UtilsFilesFoldersSync.IGNORE_FOLDERS_FILES_PATTERNS,
    }).filter(f => {
      return Helpers.exists([f, path.basename(f), packageJsonSubProject]);
    });
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
