import { config } from 'tnp-config/src';
import { CoreModels, Helpers, Utils, _, path } from 'tnp-core/src';
import {
  BaseFeatureForProject,
  BasePackageJson,
  BaseJsonFileReaderOptions,
} from 'tnp-helpers/src';
import { PackageJson, PackageJson as PackageJsonType } from 'type-fest';

import type { Project } from './project';

export class PackageJSON extends BasePackageJson {
  KEY_TNP_PACKAGE_JSON = 'tnp';

  constructor(
    options: Omit<BaseJsonFileReaderOptions<PackageJson>, 'fileName'>,
    private project: Project,
  ) {
    super(options);
  }

  private updateDataFromTaonJson(): void {
    if (this.project.taonJson.exists) {
      const packageJsonOverride =
        this.project.taonJson.packageJsonManager.getAllData();

      if (_.isObject(packageJsonOverride) && !_.isArray(packageJsonOverride)) {
        this.data = _.merge(this.data, packageJsonOverride);
      }
    }
  }

  private setDataFromCoreContainer(): void {
    if (
      this.project.framework.isCoreProject &&
      this.project.framework.isContainer
    ) {
      return; // do not update from core container
    }
    if (this.project.framework.coreContainer.taonJson.exists) {
      const packageJsonOverride =
        this.project.framework.coreContainer.taonJson.packageJsonManager.getAllData();

      if (_.isObject(packageJsonOverride) && !_.isArray(packageJsonOverride)) {
        this.data = packageJsonOverride;
      }
    }
  }

  saveToDisk(purpose?: string): void {
    //#region @backendFunc
    if (
      this.project.framework.isStandaloneProject ||
      this.project.framework.isContainer
    ) {
      const versionToPreserve = this.data.version;
      delete this.data[this.KEY_TNP_PACKAGE_JSON];
      this.setDataFromCoreContainer();
      this.updateDataFromTaonJson();
      for (const depTyp of this.dependenciesTypesArray) {
        const depObj = this.data[depTyp];
        if (_.isObject(depObj)) {
          for (const depName in depObj) {
            if (_.isNil(depObj[depName])) {
              delete depObj[depName];
            }
          }
        }
      }
      this.data.name = this.project.basename;
      this.data.version = versionToPreserve;
      this.data = Utils.sortKeys(this.data);
    }
    super.saveToDisk();
    //#endregion
  }
}
