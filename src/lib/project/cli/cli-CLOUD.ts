//#region @backend
import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';

import { BaseCli } from './base-cli';

// @ts-ignore TODO weird inheritance problem
class $Cloud extends BaseCli {
  public _(): void {
    console.log(`Hello from taon Cloud CLI!`);
    this._exit();
  }
}

export default {
  $Cloud: Helpers.CLIWRAP($Cloud, '$Cloud'),
};
