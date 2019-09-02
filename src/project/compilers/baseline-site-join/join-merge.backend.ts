import * as fs from 'fs';
import * as _ from 'lodash';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import * as watch from 'watch'
import * as rimraf from 'rimraf';
// local
import { Models } from '../../../models';
import { Helpers } from '../../../helpers';
import { config } from '../../../config';
import chalk from 'chalk';;
import { TnpDB } from '../../../tnp-db';
import { FeatureForProject } from '../../abstract';

import { DEBUG_PATHES, DEBUG_MERGE_PATHES } from './bsj-debug.backend';
import { REGEXS } from './bsj-regexes.backend';
import { IncrementalBuildProcessExtended } from '../build-isomorphic-lib';
import { SourceModifier } from '../source-modifier';
import { IncCompiler } from 'incremental-compiler';
import { Project } from '../../../index';
import { FilesJoinActions } from './files-join-actions.backend';
import { HelpersMerge } from './merge-helpers.backend';

function optionsBaselineSiteJoin(project: Project): IncCompiler.Models.BaseClientCompilerOptions {
  let folderPath: string | string[] = void 0;
  if (project.isSite) {
    if (project.isWorkspace) {
      folderPath = [
        path.join(project.location, config.folder.custom),
        ...[
          ...project.baseline.customizableFilesAndFolders,
          ...project.baseline.quickFixes.nodeModulesReplacementsZips,
          ...project.baseline.node_modules.fixesForNodeModulesPackages,
        ].map(relativeFilePath => {
          return path.join(project.baseline.location, relativeFilePath)
        })
      ]
    } else if (project.isWorkspaceChildProject) {
      folderPath = [
        path.join(project.location, config.folder.custom),
        path.join(project.baseline.location, config.folder.src),
        (project.type === 'angular-lib' && path.join(project.baseline.location, config.folder.components))
      ].filter(f => !!f);
    }
  }

  let executeOutsideScenario = false;
  const options: IncCompiler.Models.BaseClientCompilerOptions = {
    folderPath,
    executeOutsideScenario
  };
  return options;
}

@IncCompiler.Class({ className: 'BaselineSiteJoin' })
export class BaselineSiteJoin extends IncCompiler.Base {
  private readonly ALLOWED_EXT_TO_REPLACE_BASELINE_PATH = ['.ts', '.js', '.scss', '.css']
  constructor(public project: Project) {
    super(optionsBaselineSiteJoin(project));
  }


  @IncCompiler.methods.AsyncAction()
  async asyncAction(event: IncCompiler.Change, fileAbsolutePath: string) {

  }

  //#region merge strategy
  private merge(relativeBaselineCustomPath: string) {

    const isDebugMode = DEBUG_MERGE_PATHES.includes(relativeBaselineCustomPath)
    //#region debug
    if (isDebugMode) {
      console.log(_.times(5, () => '\n').join())
      console.log(chalk.blue(`Baseline/Site modyfication detected...`))
      console.log(`File: ${relativeBaselineCustomPath}`)
    }
    //#endregion

    const baselineAbsoluteLocation = path.join(HelpersMerge
      .pathToBaselineThroughtNodeModules(this.project), relativeBaselineCustomPath)
    const baselineFileInCustomPath = path.join(HelpersMerge
      .pathToCustom(this.project), relativeBaselineCustomPath);

    const joinFilePath = path.join(this.project.location, relativeBaselineCustomPath);

    let variant: 'no-in-custom' | 'no-in-baseline' | 'join' | 'deleted';
    //#region debug
    if (isDebugMode) {
      console.log('baselineAbsoluteLocation', baselineAbsoluteLocation)
      console.log('baselineFileInCustomPath', baselineFileInCustomPath)
      console.log('joinFilePath', joinFilePath)
    }
    //#endregion

    if (fse.existsSync(baselineFileInCustomPath)) {

      if (fse.existsSync(baselineAbsoluteLocation)) {
        variant = 'join'
        Helpers.copyFile(
          baselineAbsoluteLocation,
          HelpersMerge.getPrefixedPathInJoin(relativeBaselineCustomPath, this.project)
        )
      } else {
        variant = 'no-in-baseline'
        Helpers.removeFileIfExists(
          HelpersMerge.getPrefixedPathInJoin(relativeBaselineCustomPath, this.project)
        );
      }
      const source = baselineFileInCustomPath;
      const dest = joinFilePath;
      const replace = this.ALLOWED_EXT_TO_REPLACE_BASELINE_PATH.includes(path.extname(source));
      const transformTextFn = replace ? this.replacePathFn(relativeBaselineCustomPath) : undefined;
      //#region debug
      if (isDebugMode) console.log(`SOURCE: ${source} ,extname: ${path.extname(source)}`)
      if (isDebugMode) console.log(`DEST: ${dest} ,extname: ${path.extname(dest)}`)
      if (isDebugMode) console.log(`Replace fn for ${source} = ${!!transformTextFn}`)
      //#endregion
      Helpers.copyFile(
        source,
        dest,
        {
          transformTextFn,
          debugMode: isDebugMode,
          fast: false
        }
      )
    } else {
      if (fse.existsSync(baselineAbsoluteLocation)) {
        variant = 'no-in-custom'
        Helpers.copyFile(baselineAbsoluteLocation, joinFilePath, { fast: true });
        Helpers.removeFileIfExists(HelpersMerge
          .getPrefixedPathInJoin(relativeBaselineCustomPath, this.project))
      } else {
        variant = 'deleted'
        Helpers.removeFileIfExists(joinFilePath)
        Helpers.removeFileIfExists(HelpersMerge
          .getPrefixedPathInJoin(relativeBaselineCustomPath, this.project))
      }
    }

    if (isDebugMode) {
      console.log(`${chalk.blueBright('Baseline/Site modyfication OK ')}, (action: ${variant}) `)
    }
    // @LAST make something smart here
    return {
      variant
    }
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


}

export interface BaselineSiteJoin extends Partial<FilesJoinActions> { }

Helpers.applyMixins(BaselineSiteJoin, [FilesJoinActions]);
