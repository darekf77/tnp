//#region imports
import * as fs from 'fs';
import * as _ from 'lodash';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import * as watch from 'watch'
import * as rimraf from 'rimraf';
// local
import { LibType, RecreateFile, FileEvent, SourceFolder } from '../../../models';
import { copyFile, uniqArray, crossPlatofrmPath, log, compilationWrapperTnp, patchingForAsync } from '../../../helpers';
import config from '../../../config';
import { error } from '../../../helpers';
import chalk from 'chalk';
import { run } from '../../../helpers';
import { Helpers } from 'morphi/helpers';
import { TnpDB } from '../../../tnp-db';
import { FeatureForProject } from '../../abstract';
import {
  fastCopy, fastUnlink,
  getPrefixedBasename, PathHelper, getRegexSourceString, getPrefixedPathInJoin
} from './baseline-site-join.helpers.backend';
import { DEBUG_PATHES, DEBUG_MERGE_PATHES } from './baseline-site-join.debug.backend';
import { REGEXS } from './baseline-site-join.regexes.backend';
import { IncrementalBuildProcessExtended } from '../build-isomorphic-lib';
import { SourceModifier } from '../source-modifier';
//#endregion




export class BaselineSiteJoin extends FeatureForProject {

  private readonly ALLOWED_EXT_TO_REPLACE_BASELINE_PATH = ['.ts', '.js', '.scss', '.css']

  public joinNotAllowed = false;

  //#region getters

  private get pathToBaselineAbsolute() {
    // console.log('this.pathToBaseline', this.pathToBaselineThroughtNodeModules)
    const isInsideWokrspace = (this.project.parent && this.project.parent.type === 'workspace');

    const toReplace = path.join(
      isInsideWokrspace ? (
        path.join(this.project.parent.name, this.project.name))
        : this.project.name
      , config.folder.node_modules)

    // console.log('toReplace', toReplace)
    const resultPath = this.pathToBaselineThroughtNodeModules.replace(`${toReplace}/`, '')
    return crossPlatofrmPath(resultPath);
  }

  private get pathToBaselineThroughtNodeModules() {
    const baselinePath = this.pathToBaselineNodeModulesRelative;

    const resultPath = path.join(
      this.project.location,
      config.folder.node_modules,
      baselinePath
    );
    return crossPlatofrmPath(resultPath);
  }

  private get pathToCustom() {
    const resultPath = path.join(this.project.location, config.folder.custom);
    return crossPlatofrmPath(resultPath);
  }

  private get pathToBaselineNodeModulesRelative() {
    const baselinePath = this.project.type === 'workspace' ? this.project.baseline.name
      : path.join(this.project.baseline.parent.name, this.project.baseline.name)

    return baselinePath;
  }

  private get relativePathesBaseline() {
    let baselineFiles: string[] = this.files.allBaselineFiles;
    // console.log('baselineFiles', baselineFiles)
    const baselineReplacePath = this.pathToBaselineThroughtNodeModules;
    // console.log('baselineReplacePath', baselineReplacePath)

    baselineFiles = baselineFiles.map(f => f.replace(baselineReplacePath, ''))

    return baselineFiles;
  }

  /**
   *
   *
   */
  private get relativePathesCustom() {
    let customFiles: string[] = this.files.allCustomFiles;
    // console.log('customFiles', customFiles)
    const customReplacePath = path.join(this.project.location, config.folder.custom);
    // console.log('customReplacePath', customReplacePath)

    customFiles = customFiles.map(f => f.replace(customReplacePath, ''))

    return customFiles;
  }

  private get files() {

    const self = this;
    return {
      get allCustomFiles() {

        const globPath = path.join(
          self.project.location,
          config.folder.custom);
        const files = glob.sync(`${globPath}/**/*.*`);
        // console.log('CUSTOM FIELS', files)

        return files;
      },
      get allBaselineFiles() {

        let files = [];
        // console.log('CUSTOMIZABLE', this.project.baseline.customizableFilesAndFolders)

        self.project.baseline.customizableFilesAndFolders.forEach(customizableFileOrFolder => {
          let globPath = path.join(self.pathToBaselineThroughtNodeModules, customizableFileOrFolder)
          if (!fse.existsSync(globPath)) {
            error(`Custombizable folder of file doesn't exist: ${globPath}

            Please add: ${path.basename(globPath)} to your baseline

            or maybe forget ${chalk.bold('tnp install')} or ${chalk.bold('tnp link')} ?

            `)
          }
          if (fse.statSync(globPath).isDirectory()) {
            const globFiles = glob.sync(`${globPath}/**/*.*`);
            files = files.concat(globFiles);
          } else {
            files.push(globPath)
          }

        })
        // console.log('allBaselineFiles', files)

        return files;
      }
    }
  }

  //#endregion

  //#region init
  async init() {

    if (!this.project.isBasedOnOtherProject) {
      log(`There is no baseline project for "${this.project.name}" in ${this.project.location} `)
    }

    if (!this.project.baseline) {
      return;
    }
    if (this.joinNotAllowed) {
      return this;
    }

    if (!this.project.isSite) {
      const db = await TnpDB.Instance;
      if (db.checkIf.allowed.toWatchWorkspace(this.project)) {
        log('OK to baseline/site join')
      } else {
        const pids = []
        log(`Current process pid: ${process.pid}`)
        log(`Found active baseline/site join on pids: ${pids.toString()}
        current pid: ${process.pid}, ppid ${process.ppid}`)
        this.joinNotAllowed = true;
        if (this.project.isWorkspaceChildProject) {
          this.project.parent.join.joinNotAllowed = true;
        }
        return this;
      }
    }


    // remove customizable
    // console.log(this.project.customizableFilesAndFolders);

    this.project.customizableFilesAndFolders.forEach(customizable => {
      rimraf.sync(`${this.project.location}/${customizable}`)
      // this.project.run(`rimraf ${customizable}`).sync()
    });
    // rejoin baseline/site files

    await compilationWrapperTnp(() => {
      uniqArray(this.relativePathesBaseline.concat(this.relativePathesCustom))
        .forEach(relativeFile => {
          this.merge(relativeFile)
        });
    }, `(${chalk.bold(this.project.genericName)}) Site join of all files`)

    return this;
  }


  async initAndWatch(onlyWatch = false) {
    if (!onlyWatch) {
      await this.init();
    }

    if (!this.project.baseline) {
      return;
    }
    if (this.joinNotAllowed) {
      return;
    }

    const that = this;

    const callback = (absolutePath, event, isCustomFolder) => {

      if (fse.existsSync(absolutePath)) {
        if (fse.lstatSync(absolutePath).isDirectory()) { // QUICK_FIX WATCHING

          const relative = absolutePath.replace(path.dirname(this.pathToCustom), '').replace(/^\//g, '');
          const base = absolutePath.replace(relative, '').replace(/\/$/g, '');
          // console.log(`[baselineSiteJoin] relative`, relative)
          // console.log(`[baselineSiteJoin] base`, base)
          log(`[baselineSiteJoin] watch new dir ${relative}`)
          this.watchFilesAndFolders(
            base,
            [relative], callback)
          return;
        }
      }

      patchingForAsync(absolutePath, () => {
        if (isCustomFolder) {
          this.project.sourceModifier.asyncAction(absolutePath);
          this.merge(absolutePath.replace(this.pathToCustom, ''));
        } else {
          this.merge(absolutePath.replace(this.pathToBaselineAbsolute, ''));
        }
      }, 'baseline-site-join', 0);

    };

    this.monitor(callback)
  }

  private monitor(callback: (absolutePath: string, event: FileEvent, isCustomFolder: boolean) => any) {
    this.watchFilesAndFolders(this.project.baseline.location, this.project.baseline.customizableFilesAndFolders, callback);
    this.watchFilesAndFolders(this.project.location, [config.folder.custom], callback)
  }

  private watchFilesAndFolders(location: string, customizableFilesOrFolders: string[],
    filesEventCallback: (absolutePath: string, event: FileEvent, isCustomFolder: boolean) => any) {


    const isCustomFolder = !_.isUndefined((customizableFilesOrFolders.find(f => {
      // console.log('isCustomFolder', f)
      return f.startsWith(config.folder.custom);
    })));
    // console.log('Finaly is custom ?', isCustomFolder)


    customizableFilesOrFolders.forEach(baselieFileOrFolder => {
      const fileOrFolderPath = path.join(location, baselieFileOrFolder)

      const monitor = (pfileOrFolderPath, pisCustomFolder) => {
        if (fse.statSync(pfileOrFolderPath).isDirectory()) {
          log(`[sitejoin] Monitoring directory: ${fileOrFolderPath} `)

          watch.watchTree(pfileOrFolderPath, (f, curr, prev) => {

            if (typeof f == 'object' && prev === null && curr === null) {
              // Finished walking the tree
            } else if (prev === null) {
              filesEventCallback(f as any, 'created', pisCustomFolder)
            } else if (curr.nlink === 0) {
              filesEventCallback(f as any, 'removed', pisCustomFolder)
            } else {
              filesEventCallback(f as any, 'changed', pisCustomFolder)
              // f was changed
            }
          })
        } else {
          log(`[sitejoin] Monitoring file: ${fileOrFolderPath} `)
          fse.watch(pfileOrFolderPath, { recursive: true }, (event: 'rename' | 'change', filename) => {
            // console.log(`NODE FS WATCH Event: ${ event } for ${ filename }`)
            filesEventCallback(pfileOrFolderPath as any, event === 'change' ? 'changed' : 'rename', pisCustomFolder)
          })
        }
      };

      if (fse.existsSync(fileOrFolderPath)) {
        monitor(fileOrFolderPath, isCustomFolder);
      } else {

        const waitForFolder = (pfileOrFolderPath, pisCustomFolder, count = 0) => {

          if (fse.existsSync(`/${pfileOrFolderPath}`)) {
            pfileOrFolderPath = `/${pfileOrFolderPath}`;
          }

          if (!fse.existsSync(pfileOrFolderPath)) {
            if (count === 4) {
              error(`File ${chalk.bold(chalk.underline(pfileOrFolderPath))} doesn't exist and can't be monitored.`, true, true)
              return;
            }
            log(`[baslinesitejoin][folderwatch] (${count} time) Waiting for file/folder be available: ${pfileOrFolderPath}`)
            setTimeout(() => {
              waitForFolder(pfileOrFolderPath, pisCustomFolder, ++count);
            }, 2000)
            return;
          }
          monitor(pfileOrFolderPath, pisCustomFolder);
        };
        waitForFolder(fileOrFolderPath, isCustomFolder);

      }



    });

  }

  //#endregion

  //#region merge strategy
  private merge(relativeBaselineCustomPath: string) {

    const isDebugMode = DEBUG_MERGE_PATHES.includes(relativeBaselineCustomPath)
    if (isDebugMode) {
      console.log(_.times(5, () => '\n').join())
      console.log(chalk.blue(`Baseline/Site modyfication detected...`))
      console.log(`File: ${relativeBaselineCustomPath}`)
    }

    const baselineAbsoluteLocation = path.join(this.pathToBaselineThroughtNodeModules, relativeBaselineCustomPath)
    const baselineFileInCustomPath = path.join(this.pathToCustom, relativeBaselineCustomPath);
    const joinFilePath = path.join(this.project.location, relativeBaselineCustomPath);

    let variant: 'no-in-custom' | 'no-in-baseline' | 'join' | 'deleted';
    if (isDebugMode) {
      console.log('baselineAbsoluteLocation', baselineAbsoluteLocation)
      console.log('baselineFileInCustomPath', baselineFileInCustomPath)
      console.log('joinFilePath', joinFilePath)
    }

    if (fse.existsSync(baselineFileInCustomPath)) {

      if (fse.existsSync(baselineAbsoluteLocation)) {
        variant = 'join'
        fastCopy(baselineAbsoluteLocation, getPrefixedPathInJoin(relativeBaselineCustomPath, this.project))
      } else {
        variant = 'no-in-baseline'
        fastUnlink(getPrefixedPathInJoin(relativeBaselineCustomPath, this.project))
      }
      this.copyJoin(
        baselineFileInCustomPath,
        joinFilePath,
        relativeBaselineCustomPath,
        isDebugMode
      )

    } else {
      if (fse.existsSync(baselineAbsoluteLocation)) {
        variant = 'no-in-custom'
        fastCopy(baselineAbsoluteLocation, joinFilePath);
        fastUnlink(getPrefixedPathInJoin(relativeBaselineCustomPath, this.project))
      } else {
        variant = 'deleted'
        fastUnlink(joinFilePath)
        fastUnlink(getPrefixedPathInJoin(relativeBaselineCustomPath, this.project))
      }
    }

    if (isDebugMode) {
      console.log(`${chalk.blueBright('Baseline/Site modyfication OK ')}, (action: ${variant}) `)
    }
  }

  private copyJoin(source: string, dest: string, relativeBaselineCustomPath: string, debugModel = false) {
    if (debugModel) console.log(`SOURCE: ${source} ,extname: ${path.extname(source)}`)
    if (debugModel) console.log(`DEST: ${dest} ,extname: ${path.extname(dest)}`)

    const replace = this.ALLOWED_EXT_TO_REPLACE_BASELINE_PATH.includes(path.extname(source));
    const replaceFn = replace ? this.replacePathFn(relativeBaselineCustomPath) : undefined;
    if (debugModel) console.log(`Replace fn for ${source} = ${!!replaceFn}`)

    copyFile(
      source,
      dest,
      replaceFn,
      debugModel
    )
  }

  private replacePathFn(relativeBaselineCustomPath: string) {
    // console.log('relativeBaselineCustomPath', relativeBaselineCustomPath)
    return (input) => {
      input = this.replace(input, relativeBaselineCustomPath)._1___handlePrefixingFilesToEasyOverride();
      input = this.replace(input, relativeBaselineCustomPath)._2___handleReferingTOAngularLibModulesName();
      input = this.replace(input, relativeBaselineCustomPath)._3___handleReferingToBaselinePathes();
      input = this.replace(input, relativeBaselineCustomPath)._4___handleReferingToNewFilesOnlyAvailableInCustom();
      return input;
    }
  }
  //#endregion

  //#region replace in input
  private replace(input: string, relativeBaselineCustomPath: string) {
    const self = this;
    const debuggin = (DEBUG_PATHES.includes(relativeBaselineCustomPath));
    if (debuggin) console.log(`relativeBaselineCustomPath: ${relativeBaselineCustomPath}`)

    return {

      /**
       * Replace imports/export
       * Scope: current files baseline path in current generated file
       * Example:
       *  File: exmpale.ts
       *   Code change:
       *     From  : `import {..} from 'baseline/exapmle.ts`
       *     To    : `import {..} from './__exapmle.ts`
       *
       * Notes:
       *  Problem1 : If import `import {..} from 'baseline/exapmle.ts` is included in different files
       * than example.ts it is not going to be excluded
       */
      _1___handlePrefixingFilesToEasyOverride() {

        const baselineFilePathNoExit = PathHelper.removeExtension(relativeBaselineCustomPath);
        if (debuggin) console.log(`baselineFilePathNoExit: ${baselineFilePathNoExit}`)

        const toReplaceImportPath =
          getRegexSourceString(
            crossPlatofrmPath(
              `${path.join(self.pathToBaselineNodeModulesRelative.replace(/\//g, '//'),
                baselineFilePathNoExit)}`
            )
          )

        const replacement = `./${getPrefixedBasename(baselineFilePathNoExit)}`;

        // if (debuggin) console.log(`toReplaceImportPath: ${toReplaceImportPath}`)
        if (debuggin) console.log(`replacement: ${replacement}`)

        const replaceRegex = new RegExp(`(\"|\')${toReplaceImportPath}(\"|\')`, 'g')

        if (debuggin) {
          console.log(`replaceRegex: ${replaceRegex.source}`)
        }

        input = input.replace(replaceRegex, `'${replacement}'`);
        // if (debuggin) console.log(`
        // result input:
        // ${input}


        // `)

        return input;
      },

      /**
       * FIST PROBLEM:
       * Handle situation when in site you are refering to angular-lib baseline module
       * ex:
       * import { Helpers } from 'angular-lib-name/(components/module/browser/dist)/helpers-path'
       *                                                        <- will be repaled do browser ->
       *
       * SECOND PROBLEM:
       * Handle situation when in site you are refering to angular-lib baseline module
       * ex:
       * import { Helpers } from 'baseline-name/angular-lib-name/(components/module/browser/dist)/helpers-path'
       *                                                        <- will be repaled do browser ->
       */
      _2___handleReferingTOAngularLibModulesName() {
        // console.log(`relativeBaselineCustomPath: "${relativeBaselineCustomPath}"`)
        if (self.project.isWorkspaceChildProject) {
          input = SourceModifier.PreventNotUseOfTsSourceFolders(self.project, relativeBaselineCustomPath, input);
        }
        return input;
      },

      /**
       * Same thing like in currentFilePath() but:
       *  - handle situation like in Problem1;
       *  - handle situation when in your custom files you are referening to custom files
       */
      _3___handleReferingToBaselinePathes() {

        const debuggin = (DEBUG_PATHES.includes(relativeBaselineCustomPath));

        if (debuggin) console.log(`

        relativeBaselineCustomPath:${relativeBaselineCustomPath}


        `)
        const levelBack = relativeBaselineCustomPath.split('/').length - 3;
        const levelBackPath = _.times(levelBack, () => '../').join('').replace(/\/$/g, '');
        if (debuggin) console.log(`Level back for ${relativeBaselineCustomPath} is ${levelBack} ${levelBackPath}`)
        const pathToBaselineNodeModulesRelative = getRegexSourceString(self.pathToBaselineNodeModulesRelative)
        const pathPart = REGEXS.baselinePart;
        if (debuggin) console.log('pathPart', pathPart)
        const baselineRegex = `${pathToBaselineNodeModulesRelative}${pathPart}*`
        if (debuggin) console.log(`\nbaselineRegex: ${baselineRegex}`)
        let patterns = input.match(new RegExp(baselineRegex, 'g'))


        if (debuggin) console.log(`[baselinepath] recognized patterns\n`, _.isArray(patterns) && patterns.map(d => `\t${d}`).join('\n'))


        if (Array.isArray(patterns) && patterns.length >= 1) {
          patterns.forEach(pathToReplaceInInput => {

            if (debuggin) console.log(`PATTERN IN INPUT ${pathToReplaceInInput}`)
            if (debuggin) console.log(`BASELINE: ${self.pathToBaselineNodeModulesRelative}`);
            let patternWithoutBaselinePart = pathToReplaceInInput
              .replace(self.pathToBaselineNodeModulesRelative, '')
            if (debuggin) console.log(`PATTERN WITHOUT BASELINE:${patternWithoutBaselinePart}`)
            if (debuggin) console.log(`pathPart = ${pathPart}`)

            patternWithoutBaselinePart = patternWithoutBaselinePart
              .replace(new RegExp(`^${pathPart}`, 'g'), '')

            if (debuggin) console.log('PATTERN WITHOUT BASELINE no path part', patternWithoutBaselinePart)
            const toReplace = `${levelBackPath}${patternWithoutBaselinePart}`
            if (debuggin) console.log(`toReplace:${toReplace}`)
            input = input.replace(pathToReplaceInInput, `.${toReplace}`.replace('...', '..'))
          })
        }
        return input;
      },

      /**
       * Prefixed replacement
       *
       * Example:
       *
       * Files:
       * - site: custom/src/example/totaly-new-file.ts
       * - site:  src/app.ts => is refereing to 'totaly-new-file.ts' which is new file only available in site/custom
       */
      _4___handleReferingToNewFilesOnlyAvailableInCustom() {
        self.relativePathesCustom.forEach(relativePthInCustom => {
          if (relativePthInCustom !== relativeBaselineCustomPath) {
            let baselineFilePathNoExit = PathHelper.removeExtension(relativePthInCustom);

            const pathToSiteeFile = path.join(self.project.location, baselineFilePathNoExit)
            const pathToBaselineFile = path.join(self.pathToBaselineAbsolute, baselineFilePathNoExit)

            if (fse.existsSync(pathToBaselineFile) && !fse.existsSync(pathToSiteeFile)) {
              let toReplace = getPrefixedBasename(baselineFilePathNoExit);

              baselineFilePathNoExit = getRegexSourceString(baselineFilePathNoExit);
              baselineFilePathNoExit = `\.${PathHelper.removeRootFolder(baselineFilePathNoExit)}`
              const dirPath = path.dirname(relativePthInCustom);
              toReplace = PathHelper.removeRootFolder(path.join(dirPath, toReplace))
              toReplace = `.${toReplace}`
              // console.log(`Replace: ${baselineFilePathNoExit} on this: ${toReplace}`)
              input = input.replace(new RegExp(baselineFilePathNoExit, 'g'), toReplace)
            }
          }
        });
        return input;
      },


    }

  }
  //#endregion

}