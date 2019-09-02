
import * as _ from 'lodash';
import { config } from '../../../config';
import { Project } from './project';
import { Helpers } from '../../../helpers';
import { Models } from '../../../models';
import { ModelDataConfig, Morphi } from 'morphi';
import { BuildOptions, PackagesRecognitionExtended } from '../../features';

//#region @backend
import * as inquirer from 'inquirer';
import * as path from 'path';
import { TnpDB } from '../../../tnp-db';
import { config as configMorphi } from 'morphi/build/config';
//#endregion


export abstract class BuildableProject {

  //#region @backend
  protected buildOptions?: BuildOptions;
  //#endregion



  //#region @backend
  protected async buildSteps(buildOptions?: BuildOptions) {
    // should be abstract
  }
  //#endregion


  get allowedEnvironments(this: Project) {
    if (Helpers.isBrowser) {
      return this.browser.allowedEnvironments;
    }
    //#region @backend
    if (this.type === 'unknow') {
      return [];
    }
    if (this.packageJson.data.tnp && _.isArray(this.packageJson.data.tnp.allowedEnv)) {
      return this.packageJson.data.tnp.allowedEnv.concat('local')
    }
    return config.allowedEnvironments.concat('local');
    //#endregion
  }


  //#region @backend
  private async selectAllProjectCopyto(this: Project) {
    const db = await TnpDB.Instance;
    const projects = db
      .getProjects()
      .map(p => p.project)
      .filter(p => p.location !== this.location)

    this.buildOptions.copyto = projects;
  }

  private async selectProjectToCopyTO(this: Project) {
    if (this.type === 'unknow') {
      return;
    }
    // clearConsole()
    const db = await TnpDB.Instance;
    if (!global.tnpNonInteractive) {
      const existedProject = db
        .getProjects()
        .map(p => p.project)
        .filter(p => p && !p.isWorkspaceChildProject)
        .filter(p => p.location !== this.location)

      if (global.tnpNonInteractive) {
        this.buildOptions.copyto = [];
      } else {
        const { projects = [] }: { projects: string[] } = await inquirer
          .prompt([
            {
              type: 'checkbox',
              name: 'projects',
              message: 'Select projects where to copy bundle after finish: ',
              choices: existedProject
                .map(c => {
                  return { value: c.location, name: c.genericName }
                })
            }
          ]) as any;

        this.buildOptions.copyto = projects.map(p => Project.From(p));
      }

    }

    if (!_.isArray(this.buildOptions.copyto)) {
      this.buildOptions.copyto = []
    }

    // log(this.buildOptions)
    // process.exit(0)

    await db.transaction.updateCommandBuildOptions(this.location, this.buildOptions);
  }
  //#endregion

  //#region @backend
  async build(this: Project,buildOptions?: BuildOptions) {
    // log('BUILD OPTIONS', buildOptions)
    if (this.type === 'unknow') {
      return;
    }

    if (this.isCommandLineToolOnly) {
      buildOptions.onlyBackend = true;
    }


    this.buildOptions = buildOptions;

    let baseHref: string;
    // log('AM HERE')
    if (this.type === 'workspace') {
      baseHref = this.env.config.workspace.workspace.baseUrl;
    } else if (this.isWorkspaceChildProject) {
      const proj = this.env.config && this.env.config.workspace.projects.find(p => {
        return p.name === this.name
      });
      baseHref = proj ? proj.baseUrl : void 0
    }

    // log(`basehref for current project `, baseHref)
    this.buildOptions.baseHref = baseHref;

    if (this.buildOptions.copytoAll) {
      await this.selectAllProjectCopyto();
    } else {
      if (!Array.isArray(this.buildOptions.copyto) || this.buildOptions.copyto.length === 0) {
        if (this.isStandaloneProject) {
          await this.selectProjectToCopyTO()
        }
      }
    }

    if (_.isArray(this.buildOptions.copyto) && this.buildOptions.copyto.length > 0) {

      const unique = {};
      (this.buildOptions.copyto as Project[]).forEach(p => unique[p.location] = p);
      this.buildOptions.copyto = Object.keys(unique).map(location => unique[location]);

      (this.buildOptions.copyto as Project[]).forEach(proj => {
        const project = proj;
        const projectCurrent = this;
        const projectName = projectCurrent.isTnp ? config.file.tnpBundle : projectCurrent.name;
        const what = path.normalize(`${project.location}/node_module/${projectName}`)
        Helpers.info(`After each build finish ${what} will be update.`)
      });
    }

    if (this.buildOptions.copytoAll || (_.isArray(this.buildOptions.copyto) && this.buildOptions.copyto.length > 0)) {
      this.packageJson.save('show before build')
    }
    PackagesRecognitionExtended.fromProject(this as any).start();
    // console.log('before build steps')
    await this.buildSteps(buildOptions);
    // console.log('after build steps')
    if (this.isStandaloneProject) {
      await this.copyManager.initCopyingOnBuildFinish(buildOptions);
    }
  }
  //#endregion
}


// export interface BuildableProject extends Partial<Project> { };