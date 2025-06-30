//#region @backend
import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';

import { BaseCli } from './base-cli';

// @ts-ignore TODO weird inheritance problem
class $Docker extends BaseCli {}

export default {
  $Docker: Helpers.CLIWRAP($Docker, '$Docker'),
};
