import * as _ from 'lodash';
import * as path from 'path';
import * as fse from 'fs-extra';

import { CodeCut, BrowserCodeCut, TsUsage } from 'morphi/build';
import { Models } from '../../../models';
import { Helpers } from '../../../helpers';
import { config } from '../../../config';
import { Project } from '../../abstract';
import { BrowserCodeCutExtended } from './browser-code-cut.backend';
import { BuildOptions } from '../../features/build-process';

export class ExtendedCodeCut extends CodeCut {

  browserCodeCut: any;

  constructor(
    protected cwd: string, filesPathes: string[], options: Models.dev.ReplaceOptionsExtended,
    /**
     * it may be not available for global, for all compilatoin
     */
    private project: Project,
    private compilationProject: Project,
    private buildOptions: BuildOptions,
    public sourceOutBrowser: string,

  ) {
    super(cwd, filesPathes, options as any);
    this.browserCodeCut = BrowserCodeCutExtended;
  }

  file(absolutePathToFile) {
    return new (this.browserCodeCut)(
      absolutePathToFile,
      this.project,
      this.compilationProject,
      this.buildOptions,
      this.sourceOutBrowser
    )
      .flatTypescriptImportExport('import')
      .flatTypescriptImportExport('export')
      .replaceRegionsForIsomorphicLib(_.cloneDeep(this.options))
      .replaceRegionsFromTsImportExport('import')
      .replaceRegionsFromTsImportExport('export')
      .replaceRegionsFromJSrequire()
      .saveOrDelete();
  }

}