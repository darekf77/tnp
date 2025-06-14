//#region imports
import { Configuration as ElectronBuilderConfig } from 'electron-builder';
import { config } from 'tnp-config/src';
import {
  crossPlatformPath,
  fse,
  path,
  Utils,
  UtilsString,
  UtilsTerminal,
} from 'tnp-core/src';
import { Helpers, UtilsQuickFixes, UtilsTypescript } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import { tmpAppsForDistElectron } from '../../../../constants';
import {
  ReleaseArtifactTaonNames,
  ReleaseArtifactTaonNamesArr,
  EnvOptions,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';

import { InsideStructuresElectron } from './tools/inside-struct-electron';
//#endregion

export class ArtifactElectronApp extends BaseArtifact<
  {
    electronDistOutAppPath: string;
  },
  ReleasePartialOutput
> {
  constructor(project: Project) {
    super(project, 'electron-app');
  }

  //#region clear partial
  async clearPartial(options: EnvOptions): Promise<void> {
    [this.project.pathFor(tmpAppsForDistElectron)].forEach(f => {
      Helpers.removeSymlinks(f);
      Helpers.removeFolderIfExists(f);
    });
  }
  //#endregion

  //#region init partial
  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    if (!initOptions.release.targetArtifact) {
      initOptions.release.targetArtifact = 'electron-app';
    }
    const result = await this.artifacts.angularNodeApp.initPartial(initOptions);
    return result;
  }
  //#endregion

  //#region build partial
  async buildPartial(buildOptions: EnvOptions): Promise<{
    electronDistOutAppPath: string;
    proxyProj: Project;
  }> {
    //#region @backendFunc

    const { appDistOutBrowserAngularAbsPath } =
      await this.artifacts.angularNodeApp.buildPartial(
        buildOptions.clone({
          build: {
            pwa: {
              disableServiceWorker: true,
            },
            baseHref: buildOptions.release.releaseType ? `./` : void 0,
          },
          release: {
            targetArtifact: this.currentArtifactName,
          },
        }),
      );
    const proxyProj = this.project.ins.From(
      path.dirname(appDistOutBrowserAngularAbsPath),
    );

    const electronDistOutAppPath = this.project.pathFor([
      `.${config.frameworkName}`,
      this.currentArtifactName,
      // 'release',
      `release-${new Date().getTime()}`, // to avoid asar lock in os
      this.project.packageJson.version,
    ]);

    return {
      electronDistOutAppPath,
      proxyProj,
    };
    //#endregion
  }
  //#endregion

  //#region release partial
  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<ReleasePartialOutput> {
    //#region @backendFunc
    releaseOptions = this.updateResolvedVersion(releaseOptions);

    const projectsReposToPushAndTag: string[] = [this.project.location];
    const projectsReposToPush: string[] = [];

    const { electronDistOutAppPath, proxyProj } =
      await this.buildPartial(releaseOptions);

    //#region set native dependencies
    const electronNativeDeps = this.project.taonJson.electronNativeDependencies;

    for (const nativeDepName of electronNativeDeps) {
      const version = this.project.packageJson.dependencies[nativeDepName];
      if (version) {
        Helpers.logInfo(
          `Setting native dependency ${nativeDepName} to version ${version}`,
        );
        Helpers.setValueToJSON(
          proxyProj.pathFor('electron/package.json'),
          'dependencies',
          {
            [nativeDepName]:
              this.project.packageJson.dependencies[nativeDepName],
          },
        );
      } else {
        Helpers.warn(
          `Native dependency ${nativeDepName} not found in taon package.json dependencies`,
        );
      }
    }
    //#endregion

    //#region bundling backend node_modules
    await Helpers.ncc(
      proxyProj.pathFor('electron/main.js'),
      proxyProj.pathFor('electron/index.js'),
      {
        additionalExternals: electronNativeDeps,
        strategy: 'electron-app',
      },
    );
    //#endregion

    proxyProj.run(`cd electron && npm install`).sync();

    //#region modify electron-builder.json
    const electronConfigPath = proxyProj.pathFor(`electron-builder.json`);

    const electronConfig = Helpers.readJson(
      electronConfigPath,
    ) as UtilsTypescript.DeepWritable<ElectronBuilderConfig>;
    electronConfig.directories.output = electronDistOutAppPath;
    electronConfig.appId =
      releaseOptions.appId ||
      `${releaseOptions.website.domain.split('.').reverse().join('.')}` +
        `.${this.project.nameForNpmPackage}`;
    electronConfig.productName = this.project.nameForNpmPackage;

    Helpers.info(`

      AppId: ${electronConfig.appId}
      ProductName: ${electronConfig.productName}

      `);

    Helpers.writeJson(electronConfigPath, electronConfig);
    let electronConfigFile = Helpers.readFile(electronConfigPath);
    electronConfigFile = electronConfigFile.replace(
      new RegExp(Utils.escapeStringForRegEx('assets/'), 'g'),
      `dist/assets/assets-for/${this.project.nameForNpmPackage}/assets/`,
    );
    Helpers.writeFile(electronConfigPath, electronConfigFile);
    //#endregion

    //#region Copy wasm file
    const wasmfileSource = crossPlatformPath([
      this.project.ins.by(
        'isomorphic-lib',
        this.project.framework.frameworkVersion,
      ).location,
      'app/src/assets/sql-wasm.wasm',
    ]);
    const wasmfileDest = crossPlatformPath([
      proxyProj.location,
      'electron',
      'sql-wasm.wasm',
    ]);
    Helpers.copyFile(wasmfileSource, wasmfileDest);
    //#endregion

    //#region modify index.html
    const indexHtmlPath = proxyProj.pathFor(['dist', 'index.html']);

    Helpers.writeFile(
      indexHtmlPath,
      Helpers.readFile(indexHtmlPath),
      // Helpers.readFile(indexHtmlPath).replace(
      //   `<base href="/">`,
      //   '<base href="./">',
      // ),
      // .replace(`<base href="/">`, '<base href="./">'),
      // .replace(/\/assets\//g, 'assets/'),
    );

    // Helpers.replaceLinesInFile(indexHtmlPath, line => {
    //   if (line.search(`rel="manifest"`) !== -1) {
    //     return '';
    //   }
    //   return line;
    // });
    //#endregion

    //#region modify package.json
    const electronPackageJson = proxyProj.pathFor(`package.json`);
    const electronPackageJsonContent = Helpers.readJson(
      electronPackageJson,
    ) as PackageJson;
    electronPackageJsonContent.dependencies = {};
    electronPackageJsonContent.devDependencies =
      this.project.packageJson.dependencies || {};
    Helpers.writeJson(electronPackageJson, electronPackageJsonContent);
    //#endregion

    proxyProj.run(`npm-run electron-builder build --publish=never`).sync();

    // proxyProj.run(`npm-run electron-forge package`).sync();
    // process.exit(0);

    let releaseProjPath: string;

    if (releaseOptions.release.releaseType === 'local') {
      //#region local release
      const releaseData = await this.localReleaseDeploy(
        electronDistOutAppPath,
        releaseOptions,
        {
          copyOnlyExtensions: ['.zip'],
          distinctArchitecturePrefix: { platform: process.platform },
        },
      );
      projectsReposToPushAndTag.push(...releaseData.projectsReposToPushAndTag);
      releaseProjPath = releaseData.releaseProjPath;
      //#endregion
    }
    if (releaseOptions.release.releaseType === 'static-pages') {
      //#region static pages release
      const releaseData = await this.staticPagesDeploy(
        electronDistOutAppPath,
        releaseOptions,
        {
          copyOnlyExtensions: ['.zip'],
          distinctArchitecturePrefix: { platform: process.platform },
        },
      );
      projectsReposToPush.push(...releaseData.projectsReposToPush);
      releaseProjPath = releaseData.releaseProjPath;
      //#endregion
    }

    projectsReposToPushAndTag.push(electronDistOutAppPath);
    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      projectsReposToPushAndTag,
      projectsReposToPush,
      releaseProjPath,
      releaseType: releaseOptions.release.releaseType,
    };
    //#endregion
  }
  //#endregion
}
