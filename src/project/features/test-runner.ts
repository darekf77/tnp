//#region @backend
import * as _ from 'lodash';
import * as path from 'path';
import { FeatureForProject } from '../abstract';
//#endregion

import { config } from '../../config';
import { Helpers } from 'tnp-helpers';

export type TestType = 'unit' | 'integration' | 'e2e';


export class TestRunner
  //#region @backend
  extends FeatureForProject
//#endregion
{

  //#region @backend
  fileCommand(files: string[]) {
    files = files.map(f => path.basename(f))
    // console.log('files',files)
    const useFiles = (_.isArray(files) && files.length > 0);
    const ext = (files.length > 1 || (!_.first(files).endsWith('.spec.ts'))) ? '*.spec.ts' : ''
    const res = `${useFiles ? `src/**/*${files.length === 1 ? `${_.first(files)}` : `(${files.join('|')})`}${ext}` : 'src/**/*.spec.ts'}`
    return res;
  }


  start(files?: string[], type: TestType = 'unit') {
    let command: string;
    switch (this.project.type) {
      case 'isomorphic-lib':

        command = `npm-run mocha -r ts-node/register ${this.fileCommand(files)}`
          + ` --timeout ${config.CONST.TEST_TIMEOUT}`
        break;

      default:
        break;
    }
    if (!command) {
      Helpers.error(`Tests not impolemented for ${this.project.type}`, false, true)
    }
    this.project.run(command, { output: true }).sync()
  }


  async startAndWatch(files?: string[], type: TestType = 'unit') {
    let command: string;
    switch (this.project.type) {
      case 'isomorphic-lib':
        command = `npm-run mocha  -r ts-node/register --watch   ${this.fileCommand(files)} `
          + ` --watch-extensions ts --timeout ${config.CONST.TEST_TIMEOUT}`
        break;

      default:
        break;
    }
    if (!command) {
      Helpers.error(`Tests not impolemented for ${this.project.type}`, false, true)
    }
    this.project.run(command, { output: true }).sync()
  }
  //#endregion


}
