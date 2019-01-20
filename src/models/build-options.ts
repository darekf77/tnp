
import * as _ from 'lodash';
//#region @backend
import chalk from 'chalk';
import * as path from 'path';
//#endregion

import { Project } from '../project/base-project';
import { BuildDir } from './build-dir';
import { error, info } from '../messages';
import { crossPlatofrmPath, nearestProjectTo } from '../helpers';
import { config } from '../config';
import { OutFolder } from 'morphi/build';

export interface IBuildOptions {
  prod: boolean;
  outDir: BuildDir;
  noConsoleClear?: boolean;
  watch?: boolean;
  args?: string;
  compileOnce?: boolean;
  genOnlyClientCode?: boolean;
  onlyBackend?: boolean;
  appBuild?: boolean;
  baseHref?: string;
  onlyWatchNoBuild?: boolean;
  forClient?: Project[] | string[];
  copyto?: Project[] | string[];
  additionalIsomorphicLibs?: string[];
}

export type BuildData = { project: Project, buildOptions: BuildOptions, pid: number };

export class BuildOptions implements IBuildOptions {

  public static PropsToOmmitWhenStringify = ['copyto', 'forClient'];
  prod: boolean;
  outDir: BuildDir;
  watch?: boolean;
  args?: string; // TODO remove ?

  noConsoleClear?: boolean;

  /**
   * Do not generate backend code
   */
  genOnlyClientCode?: boolean;
  appBuild?: boolean;
  baseHref?: string;

  /**
   * Generate only backend, without browser version
   */
  onlyBackend?: boolean;

  /**
   * In watch mode compile once and exit
   */
  compileOnce?: boolean;
  onlyWatchNoBuild?: boolean;
  copyto?: Project[] | string[];

  /**
   * For isomorphic-lib
   * Specyify build targets as workspace childs projects names
   */
  forClient?: Project[] | string[];


  //#region @backend
  private static getMainOptions(args: string[]) {
    const ind = args.findIndex((p, i) => p.endsWith('/tnp') && !!args[i + 1] && args[i + 1].startsWith('build'))
    let prod = false, watch = false, outDir = 'dist', appBuild = false;
    if (ind >= 0) {
      const cmd = _.kebabCase(args[ind + 1]).split('-').slice(1)
      const first = _.first(cmd)

      if (first === 'dist' || first === 'bundle') {
        outDir = first;
      }
      if (first === 'app') {
        appBuild = true;
      }
      if (cmd.length >= 2) {
        const second = cmd[1];
        if (second === 'prod') {
          prod = true;
        }
        if (second === 'watch') {
          watch = true;
        }
      }

      if (cmd.length >= 3) {
        const third = cmd[1];
        if (third === 'prod') {
          prod = true;
        }
        if (third === 'watch') {
          watch = true;
        }
      }


    } else {
      return;
    }
    return { prod, watch, outDir, appBuild }
  }

  public static from(cmd: string, projectCurrent?: Project, mainOptions?: { watch: boolean; prod: boolean, outDir: OutFolder, args: string }): BuildOptions {

    const split = cmd.split(' ');
    const optionsToMerge = !!mainOptions ? mainOptions : this.getMainOptions(split);
    if (!optionsToMerge) {
      return;
    }
    const argsObj: IBuildOptions = _.merge(require('minimist')(split), optionsToMerge);

    if (argsObj.forClient) {
      if (_.isString(argsObj.forClient)) {
        argsObj.forClient = [argsObj.forClient]
      }
      if (!!projectCurrent && projectCurrent.isWorkspaceChildProject) {
        argsObj.forClient = (argsObj.forClient as string[]).map(projectParentChildName => {
          const proj = projectCurrent.parent.children.find(c => c.name === (projectParentChildName as string)) as Project;
          if (!proj) {
            error(`${chalk.bold('--forClient argument')} : Cannot find module ${chalk.bold(projectParentChildName)}`);
          }
          info(`Build only for client ${chalk.bold(projectParentChildName)}`)
          return proj;
        })
      }
    }
    if (!_.isArray(argsObj.forClient)) {
      argsObj.forClient = []
    }

    if (argsObj.copyto) {
      if (_.isString(argsObj.copyto)) {
        argsObj.copyto = [argsObj.copyto]
      }
      argsObj.copyto = (argsObj.copyto as string[]).map(argPath => {
        // console.log('argPath', argPath)
        if (process.platform === 'win32') {
          if (!argPath.match(/\\/g) && !argPath.match(/\//g)) {
            error(`On windows.. please wrap your "copyto" parameter with double-quote like this:\n
  tnp build:${argsObj.outDir}${argsObj.watch ? ':watch' : ''} --copyto "<windows path here>"`)
            process.exit(1)
          }
        }
        // console.log('raw arg', args)
        argPath = crossPlatofrmPath(argPath);
        // console.log('path', argPath)
        const project = nearestProjectTo(argPath);
        if (!project) {
          error(`autobuild.json : Path doesn't contain tnp type project: ${argPath}`, true, true)
        } else {
          const projectName = projectCurrent.isTnp ? config.file.tnpBundle : projectCurrent.name;
          const what = path.normalize(`${project.location}/node_module/${projectName}`)
          info(`After each build finish ${what} will be update.`)
          return project;
        }

      }).filter(p => !!p)
    }
    if (!_.isArray(argsObj.copyto)) {
      argsObj.copyto = []
    }

    argsObj.onlyWatchNoBuild = !!argsObj.onlyWatchNoBuild;
    argsObj.genOnlyClientCode = !!argsObj.genOnlyClientCode;
    argsObj.compileOnce = !!argsObj.compileOnce;

    return _.merge(new BuildOptions(), argsObj) as BuildOptions;
  }

  public static exportToCMD(buildOptions: BuildOptions): string {
    const { appBuild, outDir, watch, compileOnce,
      copyto, baseHref, forClient, prod,
      genOnlyClientCode, onlyBackend, onlyWatchNoBuild
    } = buildOptions;
    const type = appBuild ? 'app' : outDir;
    let args = [];

    if (_.isArray(copyto)) {
      const argsFromCopyto = (copyto as Project[]).map(c => {
        let locationOfProject: string;
        if (_.isString(c)) {
          locationOfProject = c;
        } else {
          locationOfProject = c.location;
        }
        return `--copyto ${locationOfProject}`
      });

      args = args.concat(argsFromCopyto)
    }

    if (_.isArray(forClient)) {
      const argsFromForClient = (forClient as Project[]).map(c => {
        let project: string;
        if (_.isString(c)) {
          project = c;
        } else {
          project = c.location;
        }
        return `--forClient ${project}`
      })
      args = args.concat(argsFromForClient);
    }

    if (genOnlyClientCode) {
      args.push('--genOnlyClientCode')
    }

    if (compileOnce) {
      args.push('--compileOnce')
    }

    if (onlyBackend) {
      args.push('--onlyBackend')
    }

    if (onlyWatchNoBuild) {
      args.push('--onlyWatchNoBuild')
    }

    if (baseHref) {
      args.push('--baseHref')
    }


    return `tnp build:${type}${watch ? ':watch' : ''}${prod ? ':prod' : ''} ${args.join(' ')}`
  }
  //#endregion

  public toString = () => {
    return JSON.stringify(_.mergeWith({}, _.omit(this, BuildOptions.PropsToOmmitWhenStringify)), null, 4);
  };


}
