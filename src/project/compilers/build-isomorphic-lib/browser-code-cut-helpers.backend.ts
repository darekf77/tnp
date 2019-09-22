import * as _ from 'lodash';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as sass from 'node-sass';

import { Models } from '../../../models';
import { Helpers } from '../../../helpers';
import { config } from '../../../config';
import { Project } from '../../abstract';

export function REGEX_REGION_HTML(word) {
  const regex = new RegExp("[\\t ]*\\<\\!\\-\\-\\s*#?region\\s+" +
    word + " ?[\\s\\S]*?\\<\\!\\-\\-\\s*#?endregion\\s\\-\\-\\> ?[\\t ]*\\n?", "g");
  // this.isDebuggingFile && console.log(regex.source)
  return regex;
}