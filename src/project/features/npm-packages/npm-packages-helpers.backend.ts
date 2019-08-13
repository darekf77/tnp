//#region imports
import chalk from 'chalk';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as glob from 'glob';
import * as _ from 'lodash';
import * as rimraf from "rimraf";

import { Project } from '../../abstract';
import { info, checkValidNpmPackageName, error, log, warn, tryCopyFrom } from '../../../helpers';
import { FeatureForProject } from '../../abstract';
import { Package, InstalationTypeArr, InstalationType, LibType, ActualNpmInstallOptions, NpmInstallOptions } from '../../../models';
import config from '../../../config';
import { PackagesRecognitionExtended } from '../packages-recognition-extended';
//#endregion


export function resolvePacakgesFromArgs(args: string[]): Package[] {
  let installType: InstalationType = '--save';
  return args
    .map(p => p.trim())
    .filter(p => {
      if (InstalationTypeArr.includes(p)) {
        installType = p as InstalationType;
        return false;
      }
      const res = checkValidNpmPackageName(p)
      if (!res) {
        error(`Invalid package to install: "${p}"`, true, true)
      }
      return res;
    })
    .map(p => {
      if (!~p.search('@')) {
        return { name: p, installType }
      }
      const isOrg = p.startsWith('@')
      const [name, version] = (isOrg ? p.slice(1) : p).split('@')
      return { name: isOrg ? `@${name}` : name, version, installType }
    })
}


export function executeCommand(command: string, project: Project) {
  project.run(command, { output: true, biggerBuffer: true }).sync();
}


export function copyMainProjectDependencies
  (projects: { mainProjectExisted: Project, mainProjectInTemp: Project; },
    tmpProject: Project, project: Project, pkg: Package) {

  const { mainProjectInTemp, mainProjectExisted } = projects;
  const alreadyChecked = [];
  function copyOtherProcess(parent: Project) {
    const otherDepsInTemp: Project[] = parent
      .allPackageJsonDeps(tmpProject.location)
      .filter(f => !alreadyChecked.includes(f));

    if (otherDepsInTemp.length === 0) {
      return;
    }
    otherDepsInTemp
      .filter(otherDependenyInTemp => {
        return fse.existsSync(path.join(tmpProject.node_modules.path, otherDependenyInTemp.name))
      })
      .forEach(otherDependenyInTemp => {

        const existedPkgPath = path.join(project.node_modules.path, otherDependenyInTemp.name)
        const existedOtherDependency = Project.From(existedPkgPath);
        if (existedOtherDependency) {
          if (existedOtherDependency.version === otherDependenyInTemp.version) {
            log(`[smoothInstallPrepare] nothing to do for same dependency version ${otherDependenyInTemp.name}`);
          } else {
            if (parent.packageJson.checDepenciesAreSatisfyBy(existedOtherDependency)) {
              log(`[smoothInstallPrepare] nothing to do dependency is satisfy ${otherDependenyInTemp.name}`);
            } else {
              const diff = `${existedOtherDependency.version} != ${otherDependenyInTemp.version}`;
              warn(`[smoothInstallPrepare] "${parent.name}/${chalk.bold(otherDependenyInTemp.name)}" version not satisfy ${diff}`)
              const dest = path.join(project.node_modules.path, mainProjectExisted.name,
                config.folder.node_modules, otherDependenyInTemp.name);

              if (fse.existsSync(dest)) {
                warn(`[smoothInstallPrepare] "${parent.name}/${chalk.bold(otherDependenyInTemp.name)}" nested already exists in neste folder`);
              } else {
                fse.mkdirpSync(dest);
                warn(`[smoothInstallPrepare] "${parent.name}/${chalk.bold(otherDependenyInTemp.name)}" please copy manualy to nested folder`);
                // tryCopyFrom(otherDependenyInTemp.location, dest); // @TODO
              }
            }
          }
        } else {
          log(`[smoothInstallPrepare] copy new package ${otherDependenyInTemp.name}`);
          tryCopyFrom(otherDependenyInTemp.location, existedPkgPath);
        }
      });
    otherDepsInTemp.forEach(p => {
      alreadyChecked.push(p);
      copyOtherProcess(p);
    });
  }
  copyOtherProcess(mainProjectInTemp);
}

export function copyMainProject(tmpProject: Project, project: Project, pkg: Package) {
  const mainProjectInTemp = Project.From(path.join(tmpProject.node_modules.path, pkg.name));
  const mainProjectExistedPath = path.join(project.node_modules.path, pkg.name)
  let mainProjectExisted = Project.From(mainProjectExistedPath);
  if (mainProjectExisted) {
    mainProjectExisted.removeItself();
  }
  tryCopyFrom(mainProjectInTemp.location, mainProjectExistedPath);
  log(`[smoothInstallPrepare] main package copy ${mainProjectInTemp.name}`);
  mainProjectExisted = Project.From(mainProjectExistedPath);
  return { mainProjectExisted, mainProjectInTemp };
}

export function prepareTempProject(project: Project, pkg: Package): Project {
  const pathPart = `${config.folder.tmp}-${config.folder.node_modules}-installation-of-`;
  const tmpFolder = path.join(project.location,
    `${pathPart}-${pkg.name}`);
  rimraf.sync(`${path.join(project.location, pathPart)}*`);
  fse.mkdirpSync(tmpFolder);
  project.packageJson.copyTo(tmpFolder);
  const tmpProject = Project.From(tmpFolder);
  tmpProject.packageJson.setNamFromContainingFolder();
  tmpProject.packageJson.hideDeps(`smooth instalation`);
  pkg.installType = '--save';
  const command = prepareCommand(pkg, false, false);
  executeCommand(command, tmpProject);
  return tmpProject;
}


export function prepareCommand(pkg: Package, remove: boolean, useYarn: boolean) {
  const install = (remove ? 'uninstall' : 'install');
  let command = '';
  if (useYarn) {
    command = `yarn ${pkg ? 'add' : install} --ignore-engines ${pkg ? pkg.name : ''} `
      + `${(pkg && pkg.installType && pkg.installType === '--save-dev') ? '-dev' : ''}`;
  } else {
    command = `npm ${install} ${pkg ? pkg.name : ''} ${(pkg && pkg.installType) ? pkg.installType : ''}`;
  }
  return command;
}


export function fixOptions(options?: ActualNpmInstallOptions): ActualNpmInstallOptions {
  if (_.isNil(options)) {
    options = {} as any;
  }
  if (_.isUndefined(options.generatLockFiles)) {
    options.generatLockFiles = false;
  }
  if (_.isUndefined(options.useYarn)) {
    options.useYarn = false;
  }
  if (_.isUndefined(options.remove)) {
    options.remove = false;
  }
  if (_.isUndefined(options.smoothInstall)) {
    options.smoothInstall = false;
  }
  if (_.isUndefined(options.pkg)) {
    options.pkg = void 0;
  }
  if (_.isUndefined(options.reason)) {
    options.reason = `Reason not defined`
  }
  return options;
}



export function fixOptionsNpmInstall(options: NpmInstallOptions, project: Project): NpmInstallOptions {
  if (_.isNil(options)) {
    options = {};
  }
  if (!_.isArray(options.npmPackage)) {
    options.npmPackage = [];
  }
  if (_.isUndefined(options.remove)) {
    options.remove = false;
  }
  if (_.isUndefined(options.smoothInstall)) {
    options.smoothInstall = false;
  }
  if (options.npmPackage.length === 0) {
    options.smoothInstall = false;
  }
  return options;
}