//#region imports
import { Configuration as ElectronBuilderConfig } from 'electron-builder';
import { config, LibTypeEnum } from 'tnp-core/src';
import { crossPlatformPath, path, Utils } from 'tnp-core/src';
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import { templateFolderForArtifact } from '../../../../app-utils';
import {
  assetsFor,
  assetsFromNgProj,
  assetsFromNpmLib,
  assetsFromSrc,
  BundledFiles,
  CoreAssets,
  CoreNgTemplateFiles,
  distElectronProj,
  electronNgProj,
  packageJsonNgProject,
  srcNgProxyProject,
  TemplateFolder,
  tmpAppsForDistElectron,
} from '../../../../constants';
import {
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';

//#endregion

export class ArtifactElectronApp extends BaseArtifact<
  {
    electronDistOutAppPath: string;
  },
  ReleasePartialOutput
> {
  constructor(project: Project) {
    super(project, ReleaseArtifactTaon.ELECTRON_APP);
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
      initOptions.release.targetArtifact = ReleaseArtifactTaon.ELECTRON_APP;
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
    const electronNativeDeps = this.project.taonJson.getNativeDepsFor(
      ReleaseArtifactTaon.ELECTRON_APP,
    );

    for (const nativeDepName of electronNativeDeps) {
      const version = this.project.packageJson.dependencies[nativeDepName];
      if (version) {
        Helpers.logInfo(
          `Setting native dependency ${nativeDepName} to version ${version}`,
        );
        Helpers.setValueToJSON(
          proxyProj.pathFor(`${electronNgProj}/package.json`),
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
    await Helpers.bundleCodeIntoSingleFile(
      proxyProj.pathFor(`${electronNgProj}/main.js`),
      proxyProj.pathFor(`${electronNgProj}/index.js`),
      {
        additionalExternals: [
          ...electronNativeDeps,
          ...this.project.taonJson.additionalExternalsFor(
            ReleaseArtifactTaon.ELECTRON_APP,
          ),
        ],
        additionalReplaceWithNothing: [
          ...this.project.taonJson.additionalReplaceWithNothingFor(
            ReleaseArtifactTaon.ELECTRON_APP,
          ),
        ],
        strategy: ReleaseArtifactTaon.ELECTRON_APP,
      },
    );
    //#endregion

    proxyProj.run(`cd ${electronNgProj} && npm install`).sync();

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
      new RegExp(Utils.escapeStringForRegEx(`${assetsFromSrc}/`), 'g'),
      `${distElectronProj}/${assetsFromNgProj}/${assetsFor}/${this.project.nameForNpmPackage}/${assetsFromNpmLib}/`,
    );
    Helpers.writeFile(electronConfigPath, electronConfigFile);
    //#endregion

    //#region Copy wasm file
    const wasmfileSource = crossPlatformPath([
      this.project.ins
        .by(LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion)
        .pathFor([
          templateFolderForArtifact(ReleaseArtifactTaon.ELECTRON_APP),
          srcNgProxyProject,
          assetsFromNgProj,
          CoreAssets.sqlWasmFile,
        ]),
    ]);
    const wasmfileDest = crossPlatformPath([
      proxyProj.location,
      electronNgProj,
      CoreAssets.sqlWasmFile,
    ]);
    Helpers.copyFile(wasmfileSource, wasmfileDest);
    //#endregion

    //#region modify index.html
    const indexHtmlPath = proxyProj.pathFor([
      distElectronProj,
      BundledFiles.INDEX_HTML,
    ]);

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
    const electronPackageJson = proxyProj.pathFor(packageJsonNgProject);
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

    if (releaseOptions.release.releaseType === ReleaseType.LOCAL) {
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
    if (releaseOptions.release.releaseType === ReleaseType.STATIC_PAGES) {
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
