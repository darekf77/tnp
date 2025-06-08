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

import {
  ReleaseArtifactTaonNames,
  ReleaseArtifactTaonNamesArr,
  EnvOptions,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';

import { InsideStructuresElectron } from './tools/inside-struct-electron';
import { PackageJson } from 'type-fest';

export class ArtifactElectronApp extends BaseArtifact<
  {
    electronDistOutAppPath: string;
  },
  ReleasePartialOutput
> {
  constructor(project: Project) {
    super(project, 'electron-app');
  }

  async clearPartial(options: EnvOptions): Promise<void> {
    return void 0; // TODO implement
  }

  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    if (!initOptions.release.targetArtifact) {
      initOptions.release.targetArtifact = 'electron-app';
    }
    const result = await this.artifacts.angularNodeApp.initPartial(initOptions);
    return result;
  }

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

  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<ReleasePartialOutput> {
    //#region @backendFunc
    releaseOptions = this.updateResolvedVersion(releaseOptions);

    const projectsReposToPushAndTag: string[] = [this.project.location];

    const { electronDistOutAppPath, proxyProj } =
      await this.buildPartial(releaseOptions);

    const nutPackage = '@nut-tree-fork/nut-js';
    Helpers.setValueToJSON(
      proxyProj.pathFor('electron/package.json'),
      'dependencies',
      {
        [nutPackage]: this.project.packageJson.dependencies[nutPackage],
      },
    );

    await Helpers.ncc(
      proxyProj.pathFor('electron/main.js'),
      proxyProj.pathFor('electron/index.js'),
      {
        additionalExternals: [nutPackage],
        strategy: 'electron-app',
      },
    );

    proxyProj.run(`cd electron && npm install`).sync();

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

    const electronPackageJson = proxyProj.pathFor(`package.json`);
    const electronPackageJsonContent = Helpers.readJson(
      electronPackageJson,
    ) as PackageJson;
    electronPackageJsonContent.dependencies = {};
    electronPackageJsonContent.devDependencies =
      this.project.packageJson.dependencies || {};
    Helpers.writeJson(electronPackageJson, electronPackageJsonContent);

    proxyProj.run(`npm-run electron-builder build --publish=never`).sync();

    // proxyProj.run(`npm-run electron-forge package`).sync();
    // process.exit(0);

    let releaseProjPath: string;

    if (releaseOptions.release.releaseType === 'local') {
      const localReleaseOutputBasePath = this.project.pathFor([
        config.folder.local_release,
        this.currentArtifactName,
        `${process.platform}`,
        `${this.project.name}-latest`,
      ]);
      Helpers.remove(localReleaseOutputBasePath);
      Helpers.copy(electronDistOutAppPath, localReleaseOutputBasePath);
      releaseProjPath = localReleaseOutputBasePath;
    }

    projectsReposToPushAndTag.push(electronDistOutAppPath);
    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      projectsReposToPushAndTag: [this.project.location],
      releaseProjPath,
      releaseType: releaseOptions.release.releaseType,
    };
    //#endregion
  }
}
