import { config } from 'tnp-config/src';
import { crossPlatformPath } from 'tnp-core/src';
import { Helpers, UtilsQuickFixes } from 'tnp-helpers/src';

import {
  BuildOptions,
  ClearOptions,
  InitOptions,
  ReleaseArtifactTaonNames,
  ReleaseArtifactTaonNamesArr,
  ReleaseOptions,
} from '../../../../options';
import { BaseArtifact } from '../__base__/base-artifact';


export class ArtifactElectronApp extends BaseArtifact {
  async clearPartial(options: ClearOptions): Promise<void> {
    return void 0; // TODO implement
  }
  async structPartial(options): Promise<void> {
    return void 0; // TODO implement
  }

  async initPartial(options: InitOptions) {
    return void 0; // TODO implement
  }

  //#region build
  async buildPartial(buildOptions: BuildOptions) {
    //#region @backendFunc
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
          buildOptions.websql ? '-websql' : ''
        }`,
        this.project.name,
      ]),
    );
    Helpers.info('Starting electron ...');

    if (buildOptions.watch) {
      elecProj
        .run(
          `npm-run  electron . --serve ${
            buildOptions.websql ? '--websql' : ''
          }`,
        )
        .async();
    } else {
      Helpers.info('Release build of electron app');
      if (buildOptions.buildForRelease) {
        if (!this.project.releaseProcess.isInCiReleaseProject) {
          await this.initPartial(
            InitOptions.fromBuild(
              buildOptions.clone({
                baseHref: baseHrefElectron,
                purpose: 'before building electron app init',
              }),
            ),
          );
          const tempGeneratedCiReleaseProject =
            await this.__createTempCiReleaseProject(buildOptions);
          await tempGeneratedCiReleaseProject.build(buildOptions);
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
            `tmp-apps-for-dist${buildOptions.websql ? '-websql' : ''}`,
            this.project.name,
          ]),
        );
        // Helpers.createSymLink(this.nodeModules.path, elecProj.pathFor(`electron/${config.folder.node_modules}`));
        // elecProj.run('code .').sync();
        const wasmfileSource = crossPlatformPath([
          this.project.ins.by('isomorphic-lib', this.project.framework.frameworkVersion)
            .location,
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
            buildType: 'lib',
            targetArtifact: 'angular-node-app',
            watch: false,
            baseHref: baseHrefElectron,
            skipProjectProcess: true,
            disableServiceWorker: true,
            skipCopyManager: true,
            buildAngularAppForElectron: true,
            finishCallback: () => {},
          }),
        );
        Helpers.info('Build lib done.. building now electron app...');

        // Helpers.pressKeyAndContinue()
        elecProj.run('npm-run ng build angular-electron').sync();
        // await this.build(buildOptions.clone({
        //   buildType: 'app',
        //   targetApp: 'pwa',
        //   watch: false,
        //   baseHref: baseHrefElectron,
        //   skipProjectProcess: true,
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
        await Helpers.ncc(
          crossPlatformPath([elecProj.location, 'electron', 'main.js']),
          indexJSPath,
        );
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
            websql: buildOptions.websql,
          }),
        );
      } else {
        // TODO
      }
    }
    return;

    buildOptions.finishCallback();
    //#endregion
  }
  //#endregion

  async releasePartial(options) {
    return void 0; // TODO implement
  }

  //#region getters & methods / get electron app relative path
  __getElectronAppRelativePath({ websql }: { websql: boolean }) {
    return `tmp-build/electron-app-dist${websql ? '-websql' : ''}`;
  }
  //#endregion
}
