//#region @backend
import * as _ from 'lodash';
import { clearConsole } from "../../process";
import { Project } from '../../project';
import { BuildDir, EnvironmentName } from "../../models";
import { info, error } from "../../messages";
import * as path from 'path';
import { BuildArgs } from './build-args.model';
import { crossPlatofrmPath, nearestProjectTo } from '../../helpers';
import { config } from '../../config';



export function handleArguments(args: string, outDir: BuildDir, watch: boolean) {
  let noConsoleClear = false;
  if (process.platform === 'win32') {
    args = args.replace(/\\/g, '\\\\')
  }
  const argsObj: BuildArgs = require('minimist')(args.split(' '));

  argsObj.noConsoleClear

  if (argsObj.noConsoleClear) {
    noConsoleClear = true;
  }

  // let baseHref = argsObj.baseHref || argsObj['--base-href'] || ''
  if (!noConsoleClear) {
    clearConsole()
  }


  // console.log('argsObj', argsObj)
  // process.exit(0)
  let copyto: Project[] = []
  if (argsObj.copyto) {
    if (_.isString(argsObj.copyto)) {
      argsObj.copyto = [argsObj.copyto]
    }
    copyto = argsObj.copyto.map(argPath => {
      // console.log('argPath', argPath)
      if (process.platform === 'win32') {
        if (!argPath.match(/\\/g) && !argPath.match(/\//g)) {
          error(`On windows.. please wrap your "copyto" parameter with double-quote like this:\n
tnp build:${outDir}${watch ? ':watch' : ''} --copyto "<windows path here>"`)
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
        const projectName = Project.Current.isTnp ? config.file.tnpBundle : Project.Current.name;
        const what = path.normalize(`${project.location}/node_module/${projectName}`)
        info(`After each build finish ${what} will be update.`)
        return project;
      }

    }).filter(p => !!p)
  }
  let environmentName: EnvironmentName = 'local';
  if (argsObj.environmentName || argsObj.envName) {
    environmentName = (argsObj.environmentName ? argsObj.environmentName : argsObj.envName) as any;
  }


  let onlyWatchNoBuild = false;
  if (argsObj.onlyWatchNoBuild as any === 'true') {
    onlyWatchNoBuild = true;
  }

  return {
    copyto, environmentName, onlyWatchNoBuild  //, baseHref
  }
}
//#endregion
