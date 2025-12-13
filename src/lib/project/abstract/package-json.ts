import { gt, gte, valid } from 'semver';
import { config, LibTypeEnum } from 'tnp-core/src';
import {
  CoreModels,
  Helpers,
  Utils,
  _,
  crossPlatformPath,
  fg,
  glob,
  path,
} from 'tnp-core/src';
import {
  BaseFeatureForProject,
  BasePackageJson,
  BaseJsonFileReaderOptions,
} from 'tnp-helpers/src';
import { PackageJson, PackageJson as PackageJsonType } from 'type-fest';

import { binMainProject, scriptsCommands } from '../../constants';
import { EnvOptions } from '../../options';

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
        this.project.taonJson.overridePackageJsonManager.getAllData();

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
        this.project.framework.coreContainer.taonJson.overridePackageJsonManager.getAllData();

      if (_.isObject(packageJsonOverride) && !_.isArray(packageJsonOverride)) {
        this.data = packageJsonOverride;
      }
    }
  }

  recreateBin(): any {
    // Helpers.taskStarted('Recreating bin...');
    const pattern = `${this.project.pathFor(binMainProject)}/*`;
    const countLinkInPackageJsonBin = fg
      .sync(pattern)
      .map(f => crossPlatformPath(f))
      .filter(f => {
        return (Helpers.readFile(f) || '').startsWith('#!/usr/bin/env');
      });
    const bin = {};
    countLinkInPackageJsonBin.forEach(p => {
      bin[path.basename(p)] = `${binMainProject}/${path.basename(p)}`;
    });
    // Helpers.taskDone('done recreating bin...');
    return bin;
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
      this.data.name = this.project.nameForNpmPackage;
      this.data.version = versionToPreserve;
      this.data.main = 'dist/app.electron.js'; // fix for electron
      const showFirst = [
        'name',
        'version',
        'scripts',
        'license',
        'author',
        'private',
        'homepage',
      ];

      const sorted = Utils.sortKeys(_.cloneDeep(this.data));
      for (const key of showFirst) {
        delete sorted[key];
      }
      const destinationObject: PackageJson = {
        ...showFirst.reduce((acc, key) => {
          acc[key] = this.data[key];
          return acc;
        }, {}),
        ...sorted,
      };

      destinationObject.scripts = destinationObject.scripts || {};
      if (this.project.taonJson.type === LibTypeEnum.ISOMORPHIC_LIB) {
        for (const command of scriptsCommands) {
          destinationObject.scripts[command] = command;
        }
      }

      destinationObject.bin = this.recreateBin();

      // TODO this causes issues with export js
      delete destinationObject.exports;
      // destinationObject.exports = {
      //   '.': {
      //     style: './scss/index.scss',
      //   },
      // };

      this.data = destinationObject as any;
    }
    super.saveToDisk();
    //#endregion
  }

  resolvePossibleNewVersion(
    releaseVersionBumpType: CoreModels.ReleaseVersionType,
  ): string {
    //#region @backendFunc
    const pj = new BasePackageJson({
      jsonContent: {
        version: this.project.packageJson.getBumpedVersionFor(releaseVersionBumpType),
      },
      reloadInMemoryCallback: data => {
        // console.log('new pj data', data);
      },
    });

    const lastTagVersion =
      this.project.git.lastTagVersionName.trim().replace('v', '') || '0.0.0';

    if (valid(lastTagVersion) === null) {
      Helpers.warn(
        `[${config.frameworkName}]

        Last tag may not be proper version: "${lastTagVersion}"

        `,
      );
      return pj.version;
    }

    const pjtag = new BasePackageJson({
      jsonContent: { version: lastTagVersion },
      reloadInMemoryCallback: data => {
        // console.log('new pj data', data);
      },
    });

    if (pjtag.version) {
      pjtag.setVersion(pjtag.getBumpedVersionFor(releaseVersionBumpType));
    }

    let i = 0;
    while (true) {
      if (i++ > 10) {
        Helpers.logInfo('Resolving new version...');
      }

      if (!pjtag.version) {
        return pj.version;
      }
      // console.log(`pj.version`, pj.version);
      // console.log(`pjtag.version`, pjtag.version);
      if (gte(pj.version, pjtag.version)) {
        return pj.version;
      }
      pj.setVersion(pjtag.version);
    }
    //#endregion
  }
}
