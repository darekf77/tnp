//#region @backend
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';

import config from '../../config';
import { IncrementalBuildProcessExtended } from './build-isomorphic-lib/incremental-build-process';
import { FeatureCompilerForProject, Project } from '../abstract';
import { LibType } from '../../models';


export interface IsomorphicOptions {
  currentProjectName?: string;
  isWorkspaceChildProject: boolean;
  localIsomorphicLibsNames: string[];
  angularClients?: string[];
  angularLibs?: string[];
}


export class SourceModifier extends FeatureCompilerForProject {

  private options: IsomorphicOptions;

  get isomorphiOptions(): IsomorphicOptions {
    const project = this.project;
    if (project.isWorkspaceChildProject) {

      const workspace = project.parent;

      const localIsomorphicLibsNames = workspace.children
        .filter(c => (['isomorphic-lib', 'angular-lib'] as LibType[]).includes(c.type))
        .map(c => c.name)

      const angularLibs = workspace.children
        .filter(c => c.type === 'angular-lib')
        .map(c => c.name)


      return {
        currentProjectName: project.name,
        isWorkspaceChildProject: true,
        localIsomorphicLibsNames,
        angularLibs
      }

    }
    return {
      isWorkspaceChildProject: false,
      localIsomorphicLibsNames: [],
      angularLibs: []
    }
  }


  constructor(public project: Project) {
    super(`(src|components)/**/*.ts`, '', project && project.location, project);

  }

  protected syncAction(): void {
    this.options = this.isomorphiOptions;

    const files = this.project.customizableFilesAndFolders.concat(this.project.isSite ? [config.folder.custom] : [])

    files.forEach(f => {
      const pathSrc = path.join(this.project.location, f);
      if (fse.lstatSync(pathSrc).isDirectory()) {
        glob.sync(`${pathSrc}/**/*.ts`).forEach(p => {
          this.cb({ path: p, contents: fs.readFileSync(p, { encoding: 'utf8' }) }, this.options);
        })
      }
    })
  }

  protected preAsyncAction(): void {
    // throw new Error("Method not implemented.");
  }
  protected asyncAction(filePath: string) {
    // console.log('SOurce modifier async !',filePath)
    if (fse.existsSync(filePath)) {
      this.cb({ path: filePath, contents: fs.readFileSync(filePath, { encoding: 'utf8' }) }, this.options);
    }

  }

  private cb(file: { contents: string, path: string; }, options: IsomorphicOptions) {
    const {
      isWorkspaceChildProject,
      localIsomorphicLibsNames,
      currentProjectName,
      angularLibs
    } = options;

    if (isWorkspaceChildProject) {
      let fileContent = file.contents.toString()
      const orgFileContent = fileContent;

      localIsomorphicLibsNames.forEach(libname => {
        const regex = new RegExp(`${libname}\\/${config.folder.browser}\\/`, 'g')
        fileContent = fileContent.replace(regex, `${libname}/${IncrementalBuildProcessExtended.getBrowserVerPath(currentProjectName)}/`)
      })

      if (fileContent !== orgFileContent) {
        fs.writeFileSync(file.path, fileContent, {
          encoding: 'utf8'
        });
      }

    }
  }

}

//#endregion
