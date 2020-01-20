import * as path from 'path';
import * as _ from 'lodash';
import { Models } from 'tnp-models';
import { config } from '../../../config';
import { Project, FeatureCompilerForProject } from '../../abstract';
import { IncCompiler } from 'incremental-compiler';
import { Helpers } from 'tnp-helpers';
import { CLASS } from 'typescript-class-helpers';

/**
 * QUICK_FIX solution for tsconfig pathes that are not resolve
 * into normal path... and the only work as expdcted in angular apps
 */
export function optionsOutputCodeModifer(project: Project): IncCompiler.Models.BaseClientCompilerOptions {

  let folderPath: string | string[] = void 0;

  if (project.isStandaloneProject) {
    folderPath = [
      path.join(project.location, config.folder.dist)
    ]
  }
  const options: IncCompiler.Models.BaseClientCompilerOptions = {
    folderPath,
    followSymlinks: false,
  };
  return options;
}

@CLASS.NAME('OutputCodeModifier')
export class OutputCodeModifier extends FeatureCompilerForProject<Models.other.ModifiedFiles, Models.other.ModifiedFiles> {


  constructor(public project: Project) {
    super(project, optionsOutputCodeModifer(project));
  }

  /**
   *
   * Examples
   * dist/test0.js                    -> ./tmp-
   * dist/level/test1.js              -> ../tmp-
   * dist/level/level2/test2.js       -> ../../tmp-
   *
   * dist/browser/test1.js            -> ./tmp-
   * dist/browser/level/test.js       -> ../tmp-
   * dist/browser/level/test2/test.js -> ../../tmp-
   */
  replaceFor(
    input: string,
    linkedProject: Project,
    relativeFilePath: string,
    browser: boolean,
    replaceForItself = false
  ) {
    let beforePath: string;
    let levelBack = (relativeFilePath.split('/').length - 2 - (browser ? 1 : 0));
    if (levelBack === 0) {
      beforePath = './'
    }
    if (levelBack > 0) {
      beforePath = _.times(levelBack, () => '../').join('')
    }
    // console.log(linkedProject.name)
    const name = linkedProject.name + (browser ? '/browser' : '')
    // Helpers.log(`Looking for "${name}"`)
    const regexSource = `(\\"|\\')${
      Helpers.escapeStringForRegEx(name)
      }(\\"|\\')`;
    const regex = new RegExp(regexSource, 'g');
    input = Helpers.tsCodeModifier.replace(
      input,
      regex,
      `'${beforePath}tmp-${linkedProject.name}'`)
    // Helpers.info(`[${CLASS.getName(OutputCodeModifier)}]: ${relativeFilePath}`)
    return input;
  }

  modifyFileImportExportRequires(relativeFilePath: string, modifiedFiles?: Models.other.ModifiedFiles) {
    let absolutePath = path.join(this.project.location, relativeFilePath);
    let input = Helpers.readFile(absolutePath);
    this.project.linkedProjects.forEach(linkedProject => {
      input = this.replaceFor(input, linkedProject, relativeFilePath, true);
      input = this.replaceFor(input, linkedProject, relativeFilePath, false);
    });
    Helpers.writeFile(absolutePath, input);
  }

  @IncCompiler.methods.AsyncAction()
  async asyncAction(event: IncCompiler.Change): Promise<Models.other.ModifiedFiles> {

    const relativePathToProject = event.fileAbsolutePath
      .replace(this.project.location, '')
      .replace(/^\//, '');

    const modifiedFiles: Models.other.ModifiedFiles = { modifiedFiles: [] };
    // Helpers.log(`relativePathToProject: ${relativePathToProject}`)
    if (relativePathToProject.endsWith('.js')) {
      this.modifyFileImportExportRequires(relativePathToProject, modifiedFiles);
    }
    return modifiedFiles;
  }

  async syncAction(absoluteFilePathes: string[]): Promise<Models.other.ModifiedFiles> {
    // Helpers.info(`Inside sync action`)
    const modifiedFiles: Models.other.ModifiedFiles = { modifiedFiles: [] };
    const projLocaiton = this.project.location;
    const relativePathes = absoluteFilePathes
      .filter(f => f.endsWith('.js'))
      .map(f => f.replace(`${projLocaiton}/`, ''))
      .forEach(f => {
        // Helpers.info(`modyfing ${f}`)
        this.modifyFileImportExportRequires(f, modifiedFiles)
      })
    // Helpers.info('MODIFY DONE!')
    return modifiedFiles;
  }

  copyBundleCompiledLinkedCodeToNodeModules() {
    // this.project.linkedProjects.forEach(p => {
    //   const dest = path.join(this.project.location, config.folder.node_modules, p.name);
    //   const source = path.join(this.project.location, config.folder.bundle, `tmp-${p.name}`);
    //   const sourceBrowser = path.join(this.project.location, config.folder.bundle, config.folder.browser, `tmp-${p.name}`);
    //   const destBrowser = path.join(this.project.location, config.folder.node_modules, p.name, config.folder.browser);
    //   if (this.project.isTnp) {
    //     Helpers.copy(source, dest);
    //     Helpers.remove(source)
    //     Helpers.removeFolderIfExists(destBrowser);
    //     Helpers.copy(sourceBrowser, destBrowser);
    //   } else {
    //     Helpers.removeFolderIfExists(source);
    //     Helpers.removeFolderIfExists(sourceBrowser);
    //   }
    // })
  }

}