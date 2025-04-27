import { config } from 'tnp-config/src';
import { crossPlatformPath } from 'tnp-core/src';
import { Helpers, UtilsQuickFixes } from 'tnp-helpers/src';

import {
  ReleaseArtifactTaonNames,
  ReleaseArtifactTaonNamesArr,
  EnvOptions,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';

export class ArtifactElectronApp extends BaseArtifact<
  {
    electronDistOutAppPath: string;
    electronDistOutAppPathWebsql: string;
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
    if (
      this.project.framework.isStandaloneProject &&
      initOptions.release.releaseType
    ) {
      this.project.packageJson.setMainProperty(
        'dist/app.electron.js',
        'update main for electron',
      );
    }
    return initOptions;
  }

  //#region build
  async buildPartial(buildOptions: EnvOptions): Promise<{
    electronDistOutAppPath: string;
    electronDistOutAppPathWebsql: string;
  }> {
    //#region @backendFunc
    buildOptions = await this.initPartial(EnvOptions.from(buildOptions));
    const shouldSkipBuild = this.shouldSkipBuild(buildOptions);

    if (buildOptions.build.watch) {
      await this.project.tryKillAllElectronInstances(); // TODO QUICK_FIX
    }

    const baseHrefElectron = '';
    if (!this.project.framework.isStandaloneProject) {
      Helpers.error(
        `Electron apps compilation only for standalone projects`,
        false,
        true,
      );
    }

    const elecProj = this.project.ins.From(
      this.project.pathFor([
        `tmp-apps-for-${config.folder.dist}${
          buildOptions.build.websql ? '-websql' : ''
        }`,
        this.project.name,
      ]),
    );
    Helpers.info('Starting electron ...');

    if (buildOptions.build.watch) {
      if (!shouldSkipBuild) {
        elecProj
          .run(
            `npm-run  electron . --serve ${
              buildOptions.build.websql ? '--websql' : ''
            }`,
          )
          .async();
      }
    } else {
      Helpers.info('Release build of electron app');
      if (buildOptions.release.releaseType) {
        if (!buildOptions.release.releaseType) {
          await this.initPartial(
            EnvOptions.fromBuild(
              buildOptions.clone({
                build: {
                  baseHref: baseHrefElectron,
                },
                purpose: 'before building electron app init',
              }),
            ),
          );
          // const tempGeneratedCiReleaseProject =
          //   await this.__createTempCiReleaseProject(buildOptions);
          // await tempGeneratedCiReleaseProject.build(buildOptions);
          return;
        }

        // if (!this.pathExists(`tmp-apps-for-dist/${this.name}/electron/compiled/app.electron.js`)) {
        //   // await this.build(buildOptions.clone({
        //   //   buildForRelease: false,
        //   //   watch: false
        //   // }))
        // } else {

        const elecProj = this.project.ins.From(
          this.project.pathFor([
            `tmp-apps-for-dist${buildOptions.build.websql ? '-websql' : ''}`,
            this.project.name,
          ]),
        );
        // Helpers.createSymLink(this.nodeModules.path, elecProj.pathFor(`electron/${config.folder.node_modules}`));
        // elecProj.run('code .').sync();
        const wasmfileSource = crossPlatformPath([
          this.project.ins.by(
            'isomorphic-lib',
            this.project.framework.frameworkVersion,
          ).location,
          'app/src/assets/sql-wasm.wasm',
        ]);
        const wasmfileDest = crossPlatformPath([
          elecProj.location,
          'electron',
          'sql-wasm.wasm',
        ]);
        Helpers.copyFile(wasmfileSource, wasmfileDest);

        Helpers.info('Building lib...');
        await this.buildPartial(
          buildOptions.clone({
            release: {
              targetArtifact: 'angular-node-app',
            },
            build: {
              watch: false,
              baseHref: baseHrefElectron,
              pwa: {
                disableServiceWorker: true,
              },
            },
            copyToManager: {
              skip: true,
            },
            finishCallback: () => {},
          }),
        );
        Helpers.info('Build lib done.. building now electron app...');

        // Helpers.pressKeyAndContinue()
        if (!shouldSkipBuild) {
          elecProj.run('npm-run ng build angular-electron').sync();
        }
        // await this.build(buildOptions.clone({
        //   buildType: 'app',
        //   targetApp: 'pwa',
        //   watch: false,
        //   baseHref: baseHrefElectron,
        //   disableServiceWorker: true,
        //   skipCopyManager: true,
        //   buildAngularAppForElectron: true,
        //   finishCallback: () => { }
        // }));

        const indexHtmlPath = elecProj.pathFor(['dist', 'index.html']);
        // console.log({
        //   indexHtmlPath
        // })
        Helpers.writeFile(
          indexHtmlPath,
          Helpers.readFile(indexHtmlPath)
            .replace(`<base href="/">`, '<base href="./">')
            .replace(`<base href="/">`, '<base href="./">')
            .replace(/\/assets\//g, 'assets/'),
        );
        Helpers.replaceLinesInFile(indexHtmlPath, line => {
          if (line.search(`rel="manifest"`) !== -1) {
            return '';
          }
          return line;
        });
        // <base href="/">
        const indexJSPath = crossPlatformPath([
          elecProj.location,
          'electron',
          'index.js',
        ]);
        if (!shouldSkipBuild) {
          await Helpers.ncc(
            crossPlatformPath([elecProj.location, 'electron', 'main.js']),
            indexJSPath,
            { strategy: 'electron-app' },
          );
        }
        Helpers.writeFile(
          indexJSPath,
          UtilsQuickFixes.replaceSQLliteFaultyCode(
            Helpers.readFile(indexJSPath),
          )
            .split('\n')
            .map(line => line.replace(/\@removeStart.*\@removeEnd/g, ''))
            .join('\n'),
        );

        // elecProj.run(`npm-run ncc build electron/main.js -o electron/bundled  --no-cache  --external electron `).sync();
        // await Helpers.questionYesNo('Would you like to do check out?');
        elecProj.run(`npm-run electron-builder build --publish=never`).sync();
        this.project.openLocation(
          this.__getElectronAppRelativePath({
            websql: buildOptions.build.websql,
          }),
        );
      } else {
        // TODO
      }
      buildOptions.finishCallback && buildOptions.finishCallback();
    }

    //#endregion
  }
  //#endregion

  async releasePartial(releaseOptions): Promise<ReleasePartialOutput> {
    releaseOptions = this.updateResolvedVersion(releaseOptions);

    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
    } as any; // TODO implement
  }

  //#region getters & methods / get electron app relative path
  __getElectronAppRelativePath({ websql }: { websql: boolean }) {
    return `tmp-build/electron-app-dist${websql ? '-websql' : ''}`;
  }
  //#endregion
}
