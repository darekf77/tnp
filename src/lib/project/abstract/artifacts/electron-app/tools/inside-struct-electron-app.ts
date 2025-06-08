//#region imports
import { config } from 'tnp-config/src';
import { crossPlatformPath, path, _, CoreModels, fse } from 'tnp-core/src';
import { BasePackageJson, Helpers } from 'tnp-helpers/src';

import { EnvOptions } from '../../../../../options';
import type { Project } from '../../../project';
import { InsideStructAngularApp } from '../../angular-node-app/tools/inside-struct-angular-app';

//#endregion

export class InsideStructElectronApp extends InsideStructAngularApp {
  isElectron = true;
  relativePaths(): string[] {
    const paths = super.relativePaths();
    return [
      ...paths,
      'app/electron-builder.json',
      'app/forge.config.js',
      'app/angular.webpack.js',
      'app/electron/main.js',
      'app/electron/index.js',
      `app/electron/${config.file.package_json}`,
    ];
  }
}
