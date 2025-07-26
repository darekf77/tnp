//#region @backend
import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';

import { BaseCli } from './base-cli';

// @ts-ignore TODO weird inheritance problem
class $Docker extends BaseCli {
  public _(): void {
    console.log(`Hello from taon Docker CLI!`);
    this._exit();
  }

  async compose() {
    const isUp = this.firstArg?.toLowerCase() === 'up';
    const isDown = this.firstArg?.toLowerCase() === 'down';
    if (isUp) {
    }
    if (isDown) {

    }
  }
}

export default {
  $Docker: Helpers.CLIWRAP($Docker, '$Docker'),
};
