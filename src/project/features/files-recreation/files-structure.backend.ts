import * as path from 'path';
import * as _ from 'lodash';
import chalk from 'chalk';
import * as fse from 'fs-extra';

import { Helpers } from 'tnp-helpers';
import { FeatureForProject, Project } from '../../abstract';
import { TnpDB } from 'tnp-db';
import { config } from '../../../config';
import { ProjectFactory } from '../../../scripts/NEW-PROJECT_FILES_MODULES';
import { PROGRESS_DATA } from '../../../progress-output';
import { Models } from '../../../index';
import { recreateTmpWorkspace } from '../recreate-tmp-evenironment-config.backend';

export type CleanType = 'all' | 'only_static_generated';
export type InitOptions = {
  watch: boolean;
  alreadyInitedPorjects?: Project[];
  initiator?: Project;
  // initiator: Project;
}

export class FilesStructure extends FeatureForProject {

  findBaselines(proj: Project, baselines: Project[] = []): Project[] {
    if (!!proj.baseline) {
      baselines.unshift(proj.baseline)
    } else {
      return baselines;
    }
    return this.findBaselines(proj.baseline)
  }

  private fixOptionsArgs(options: InitOptions) {
    if (_.isUndefined(options)) {
      options = {} as any;
    }
    if (_.isUndefined(options.alreadyInitedPorjects)) {
      options.alreadyInitedPorjects = [];
    }
    if (_.isUndefined(options.watch)) {
      options.watch = false;
    }
    // if (_.isUndefined(options.initiator)) {
    //   options.initiator = this.project;
    // }
    return options;
  }

  private get taskNames() {
    return {
      sourceModifir: `[filestructure] (${chalk.bold(this.project.genericName)
        }) Client source modules pathes modifier `,
      frameworkFileGenerator: `[filestructure] (${chalk.bold(this.project.genericName)
        }) Files generator: entites.ts, controllers.ts`,
      joinMerge: `[filestructure] Join project ${this.project.genericName}`
    };
  }

  public async init(args: string, options?: InitOptions) {
    if (!args) {
      args = '';
    }
    options = this.fixOptionsArgs(options);
    if (!options.initiator) {
      options.initiator = this.project;
    }
    const { alreadyInitedPorjects, watch } = options;
    let { skipNodeModules, recrusive, env, struct }: Models.dev.InitArgOptions = require('minimist')(args.split(' '));

    if (struct) {
      skipNodeModules = true;
    }

    if (options.initiator.location === this.project.location && this.project.isWorkspace && options.watch) {
      recrusive = true;
    }

    await this.project.__initProcedure();

    if (this.project.isWorkspace || this.project.isWorkspaceChildProject) {
      if (this.project.isWorkspace && this.project.isCoreProject) {
        var coreWorkspaceEnvironmentJsPath = path.join(this.project.location, config.file.environment_js);
        var envBefore = fse.existsSync(coreWorkspaceEnvironmentJsPath) && Helpers.readFile(coreWorkspaceEnvironmentJsPath);
        recreateTmpWorkspace(this.project, this.project.location)
      }
      if (env) {
        Helpers.log(`ENVIRONMENT: ${chalk.bold(env)} inited for ${this.project.genericName}`)
      } else {
        if (this.project.isGenerated) {
          args += `${args} --env=static`;
          Helpers.log(`ENVIRONMENT (for local static build): "${chalk.bold('static')}"`
            + ` initing for ${this.project.genericName}`)
        } else {
          args += `${args} --env=local`;
          Helpers.log(`ENVIRONMENT (for local watch development): "${chalk.bold('local')}"`
            + ` initing for ${this.project.genericName}`)
        }
      }
    }

    Helpers.log(`[init] adding project is not exists...`)
    const db = await TnpDB.Instance(config.dbLocation);
    await db.addProjectIfNotExist(this.project as any);
    Helpers.log(`[init] adding project is not exists...done`)

    if (!_.isUndefined(alreadyInitedPorjects.find(p => p.location === this.project.location))) {
      Helpers.log(`Already inited project: ${chalk.bold(this.project.genericName)} - skip`);
      return;
    }

    this.project.quickFixes.missingSourceFolders()
    this.project.quickFixes.missingAngularLibFiles();
    if (this.project.isWorkspace || this.project.isTnp) { // TODO make it for standalone
      this.project.quickFixes.badNpmPackages();

    }
    if (this.project.isWorkspace || this.project.isStandaloneProject || this.project.isContainer) {
      this.project.quickFixes.missingLibs(['react-native-sqlite-storage'])
    }

    if (this.project.isWorkspace || this.project.isStandaloneProject) {
      Helpers.info(`Initing project: ${chalk.bold(this.project.genericName)}`);
    }

    alreadyInitedPorjects.push(this.project)

    //#region handle init of container
    if (this.project.isContainer) {
      await this.project.recreate.init();

      if (!this.project.isContainerWithLinkedProjects) {
        const containerChildren = this.project.children.filter(c => {
          if (c.git.isGitRepo) {
            Helpers.log(`[init] not initing recrusively, it is git repo ${c.name}`)
            return false;
          }
          return true;
        })
        for (let index = 0; index < containerChildren.length; index++) {
          const containerChild = containerChildren[index];
          await containerChild.filesStructure.init(args, options);
          for (let indexChild = 0; indexChild < containerChild.children.length; indexChild++) {
            const workspaceChild = containerChild.children[indexChild];
            await workspaceChild.filesStructure.init(args, options)
          }
        }
      }

    }
    //#endregion

    //#region recretate forsite
    if (this.project.isWorkspace) {
      this.project.recreateCodeWorkspace();
    }
    if (this.project.isWorkspace && this.project.isSite) {
      const recreated = this.recreateSiteChildren();
      for (let index = 0; index < recreated.length; index++) {
        const newChild = recreated[index];
        await newChild.filesStructure.init(args, options);
      }
    }
    if (this.project.isWorkspace && recrusive) {
      const workspaceChildren = this.project.children;
      for (let index = 0; index < workspaceChildren.length; index++) {
        const workspaceChild = workspaceChildren[index];
        await workspaceChild.filesStructure.init(args, options);
      }
    }
    //#endregion

    if (this.project.baseline) {
      await this.project.baseline.filesStructure.init(args, options);
    }

    if (this.project.isWorkspaceChildProject) {
      await this.project.parent.filesStructure.init(args, options);
    }

    //#region report progress initing project
    if (this.project.isWorkspaceChildProject) {
      Helpers.info(`Initing project: ${chalk.bold(this.project.genericName)}`);
    }
    if (global.tnpNonInteractive) {
      PROGRESS_DATA.log({ msg: `Initing project:  "${this.project.genericName}" started` });
    }
    //#endregion

    if (this.project.isWorkspaceChildProject) {
      const isInNodeMOdules = path.join(this.project.parent.location, config.folder.node_modules, this.project.name);
      if (!fse.existsSync(isInNodeMOdules)) {
        this.project.parent.workspaceSymlinks.add(`Init of workspace child project`)
      }
    }

    await this.project.recreate.init();
    this.project.recreate.vscode.settings.hideOrShowDeps();

    if (this.project.isStandaloneProject) {
      if (_.isNil(this.project.buildOptions)) { // TODO QUICK_FIX
        this.project.buildOptions = {};
      }
      await this.project.env.init(args);
      this.project.applyLinkedPorjects();
      this.project.filesTemplatesBuilder.rebuild();
    }

    this.project.tnpBundle.installAsPackage()

    //#region handle node modules instalation
    if (!this.project.node_modules.exist) {
      if (skipNodeModules) {
        if (!fse.existsSync(path.join(this.project.location, config.folder.node_modules))) {
          Helpers.mkdirp(path.join(this.project.location, config.folder.node_modules));
        }
      } else {
        await this.project.npmPackages.installProcess(`initialize procedure of ${this.project.name}`);
      }
    } else {
      if (this.project.isStandaloneProject && this.project.frameworkVersionAtLeast('v2')) {
        this.project.packageJson.showDeps(`Show new deps for ${this.project._frameworkVersion} `);
      }
    }
    //#endregion

    if (this.project.isWorkspace || this.project.isWorkspaceChildProject) {
      if (this.project.isSite) {
        if (watch) {
          await this.project.join.startAndWatch(this.taskNames.joinMerge)
        } else {
          await this.project.join.start(this.taskNames.joinMerge);
        }
      }

      await this.project.env.init(args);
      if (this.project.isWorkspace && this.project.isCoreProject && envBefore) {
        Helpers.writeFile(coreWorkspaceEnvironmentJsPath, envBefore);
      }
      this.project.filesTemplatesBuilder.rebuild();
    }

    this.project.quickFixes.missingSourceFolders();

    if (this.project.isWorkspaceChildProject || this.project.isStandaloneProject) {
      if (watch) {
        await this.project.frameworkFileGenerator.startAndWatch(this.taskNames.frameworkFileGenerator);
        // if (!this.project) {
        //   console.trace('HERE')
        // }
        await this.project.sourceModifier.startAndWatch(this.taskNames.sourceModifir);
      } else {
        await this.project.frameworkFileGenerator.start(this.taskNames.frameworkFileGenerator);
        // if (!this.project) {
        //   console.trace('HERE')
        // }
        await this.project.sourceModifier.start(this.taskNames.sourceModifir);
      }
      // process.exit(0)
    }

    Helpers.log(`Init DONE for project: ${chalk.bold(this.project.genericName)}`);
  }

  recreateSiteChildren() {
    const newChilds: Project[] = []
    const baseline = this.project.baseline;
    baseline.children.forEach(c => {
      const siteChild = path.join(this.project.location, c.name);
      if (!fse.existsSync(siteChild)) {
        ProjectFactory.Instance.create(c._type, c.name, this.project.location, void 0);
        const newChild = Project.From(siteChild);
        c.packageJson.copyTo(newChild);
        Helpers.tryRemoveDir(path.join(newChild.location, config.folder.src));
        Helpers.tryRemoveDir(path.join(newChild.location, config.folder.components));
        newChild.recreate.vscode.settings.colorsFromWorkspace();
        newChilds.push(newChild);
      }
    });
    return newChilds;
  }

  private recrusiveOperation(proj: Project, recrusive = false, type: keyof Project) {
    if (type === 'clear') {
      proj.clear()
    } else if (type === 'reset') {
      proj.reset()
    }
    if (recrusive) {
      for (let index = 0; index < proj.children.length; index++) {
        const c = proj.children[index];
        this.recrusiveOperation(c, recrusive, type)
      }
    }
  }

  public async reset(options?: { recrusive: boolean; }) {
    const { recrusive = false } = options || {};
    this.recrusiveOperation(this.project, recrusive, 'reset')
  }

  public async clear(options?: { recrusive: boolean; }) {
    const { recrusive = false } = options || {};
    this.recrusiveOperation(this.project, recrusive, 'clear')
  }

  private resolveArgs(args: string) {
    let { recrusive = false, r = false } = require('minimist')(args.split(' '));
    recrusive = (recrusive || r);
    return { recrusive }
  }

  async resetFromArgs(args) {
    const { recrusive } = this.resolveArgs(args)
    await this.reset({ recrusive })
  }

  async  clearFromArgs(args) {
    const { recrusive } = this.resolveArgs(args);
    await Helpers.questionYesNo(`Do you wanna delete node_modules and reset ${recrusive ? 'project recursively' : 'project'} ?`, async () => {
      await this.clear({ recrusive });
      process.exit(0)
    }, () => {
      process.exit(0)
    });
  }

}
