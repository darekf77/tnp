//#region imports
import { MagicRenamer } from 'magic-renamer/src';
import { containerPrefix, tmpIsomorphicPackagesJson } from '../../constants';
import { config, CoreModels, path, tnpPackageName } from 'tnp-core/src';
import { _, crossPlatformPath, UtilsTerminal } from 'tnp-core/src';
import { BasePackageJson, Helpers } from 'tnp-helpers/src';

import { ReleaseType } from '../../options';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem

export class $Core extends BaseCli {
  async __initialize__(): Promise<void> {
    if (config.frameworkName !== tnpPackageName) {
      Helpers.error(
        `

        This command is only for ${tnpPackageName} dev cli.

        `,
        false,
        true,
      );
    }
    await super.__initialize__();
  }

  async _() {
    console.log('hello world');
    this._exit();
  }

  async createNext(): Promise<void> {

    //#region @backendFunc
    if (config.frameworkName !== tnpPackageName) {
      Helpers.error(
        `
        This command is only for ${tnpPackageName} dev cli.
      `,
        false,
        true,
      );
    }
    if (
      !this.project ||
      this.project.name !== 'taon-dev' ||
      !this.project.framework.isContainer
    ) {
      Helpers.error(
        `
        This command is only for ${tnpPackageName} container project 'taon-dev'.
      `,
        false,
        true,
      );
    }

    const latestCoreContainer = this.project.framework.coreContainer;

    const coreContainerParentLocation = path.dirname(
      latestCoreContainer.location,
    );
    const latestCoreContainerVersion = _.first(
      Helpers.foldersFrom(coreContainerParentLocation)
        .filter(f => path.basename(f).startsWith(containerPrefix))
        .map(f => path.basename(f.replace(containerPrefix + 'v', '')))
        .map(c => Number(c))
        .sort((a, b) => b - a),
    );

    Helpers.info(
      `Latest core container version: ${latestCoreContainerVersion}`,
    );

    const continueOperation = await UtilsTerminal.confirm({
      message: `Create new core container version v${
        latestCoreContainerVersion + 1
      } based on v${latestCoreContainerVersion}?`,
      defaultValue: true,
    });

    if (!continueOperation) {
      Helpers.warn(`Operation cancelled by user.`);
      this._exit();
      return;
    }

    const newVersionOfCore = latestCoreContainerVersion + 1;
    const magicRenameRules = `v${latestCoreContainerVersion} -> v${newVersionOfCore}`;

    Helpers.info(`Creating new core... ${magicRenameRules} `);
    const ins = MagicRenamer.Instance(latestCoreContainer.location);
    ins.start(magicRenameRules);

    const newContainer = this.project.ins.From([
      coreContainerParentLocation,
      containerPrefix + 'v' + newVersionOfCore,
    ]);
    Helpers.taskDone(
      `New core created at ${crossPlatformPath(newContainer.location)}`,
    );

    Helpers.taskStarted(`Updating dependencies from NPM...`);
    await newContainer.taonJson.updateDependenciesFromNpm({
      // onlyPackageNames: this.args,
    });

    // console.log({
    //   newestCoreContainerVersion: latestCoreContainerVersion,
    //   coreContainerParentLocation,
    // });
    Helpers.taskDone(`Dependencies updated.`);

    Helpers.taskStarted(
      `Copying node_modules and isomorphic packages from old to new container...`,
    );
    this.project.framework.coreContainer.nodeModules.copyToProject(
      newContainer as any,
    );
    Helpers.copyFile(
      this.project.framework.coreContainer.pathFor(tmpIsomorphicPackagesJson),
      newContainer.pathFor(tmpIsomorphicPackagesJson),
    );
    Helpers.taskDone(`Copy done.`);

    Helpers.taskStarted(
      `Setting new NPM and framework version... for this project and children`,
    );
    await this.project.framework.setNpmVersion(`${newVersionOfCore}.0.0`);

    Helpers.taskStarted(
      `Setting framework version... for this project and children`,
    );
    await newContainer.framework.setFrameworkVersion(
      `v${newVersionOfCore}` as CoreModels.FrameworkVersion,
    );

    Helpers.taskStarted(`Creating new core release for all projects...`);
    await this.project.release(
      this.params.clone({
        release: {
          autoReleaseUsingConfig: true,
          autoReleaseTaskName: 'npm',
          releaseVersionBumpType: 'patch',
          releaseType: ReleaseType.MANUAL,
        },
      }),
    );
    Helpers.taskDone(`New core release created.`);

    Helpers.taskDone(
      `Done creating new core ${containerPrefix}v${newVersionOfCore}`,
    );

    this._exit();
    //#endregion

  }

  //#region set npm clean major version
  async setNpmVersion(): Promise<void> {
    let npmVersion = this.firstArg;

    await this.project.framework.setNpmVersion(npmVersion, {
      confirm: true,
    });
    this._exit();
  }
  //#endregion

  //#region set framework version
  async setFrameworkVersion(): Promise<void> {
    const newFrameworkVersion =
      `v${this.firstArg.replace('v', '')}` as CoreModels.FrameworkVersion;

    await this.project.framework.setFrameworkVersion(newFrameworkVersion, {
      confirm: true,
    });
    this._exit();
  }
  //#endregion

  updateDepsFrom() {

    //#region @backendFunc
    const pathToSourceProject = crossPlatformPath(
      path.isAbsolute(this.firstArg)
        ? this.firstArg
        : path.join(this.cwd, this.firstArg),
    );

    Helpers.info(`Updating dependencies from: ${pathToSourceProject}`);

    const proj = this.project.ins.From(pathToSourceProject);
    const pjSource = new BasePackageJson({
      cwd: proj.packageJson.cwd,
    });

    const alldeps = Object.keys(pjSource.allDependencies);

    const currentDeps =
      this.project.taonJson.overridePackageJsonManager.allDependencies;

    for (const depnName of alldeps) {
      const depVersion = pjSource.allDependencies[depnName];
      const currentVersion = currentDeps[depnName];
      const curretnPrefix = currentVersion
        ? currentVersion.startsWith('^')
          ? '^'
          : currentVersion.startsWith('~')
            ? '~'
            : ''
        : '';

      this.project.taonJson.overridePackageJsonManager.updateDependency({
        packageName: depnName,
        version: `${curretnPrefix}${depVersion}`,
        createNewEntryIfNotExist: true,
      });
    }
    Helpers.taskDone(`Dependencies updated from ${pathToSourceProject}`);
    this._exit();
    //#endregion

  }
}

export default {
  $Core: Helpers.CLIWRAP($Core, '$Core'),
};
