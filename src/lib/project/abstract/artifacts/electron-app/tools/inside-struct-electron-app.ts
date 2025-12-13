//#region imports
import { config } from 'tnp-core/src';
import { crossPlatformPath, path, _, CoreModels, fse } from 'tnp-core/src';
import { BasePackageJson, Helpers } from 'tnp-helpers/src';

import { TemplateFolder } from '../../../../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../../../../options';
import type { Project } from '../../../project';
import { InsideStructAngularApp } from '../../angular-node-app/tools/inside-struct-angular-app';

//#endregion

export class InsideStructElectronApp extends InsideStructAngularApp {
  getCurrentArtifact(): ReleaseArtifactTaon {
    return ReleaseArtifactTaon.ELECTRON_APP;
  }
}
