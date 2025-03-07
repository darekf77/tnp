import { config } from 'tnp-config/src';
import { CoreModels, Helpers, _, path } from 'tnp-core/src';
import { BaseFeatureForProject, BasePackageJson } from 'tnp-helpers/src';
import { PackageJson, PackageJson as PackageJsonType } from 'type-fest';

import type { Project } from './project';

export class PackageJSON extends BasePackageJson {
  KEY_TNP_PACKAGE_JSON = 'tnp';
}
