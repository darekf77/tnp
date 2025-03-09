import { config } from 'tnp-config/src';
import { chalk, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import { BuildOptions } from '../../../../options';
import { EXPORT_TEMPLATE } from '../../../../templates';
import { Project } from '../../project';

export interface WebpackBackendCompilationOpt {
  watch: boolean;
  buildType: 'app' | 'lib';
  outDir: 'dist';
  cliBuildUglify?: boolean;
  buildTitle?: string;
  cliBuildIncludeNodeModules?: boolean;
}

// @ts-ignore TODO weird inheritance problem
export class WebpackBackendCompilation extends BaseFeatureForProject<Project> {
  async run(buildOptions: BuildOptions) {
    //#region @backendFunc

    const outDir = config.folder.dist;
    const webpackGlob = await this.project.framework.global('webpack');

    const webpackCommand =
      `node ${webpackGlob} --version && node ${webpackGlob} ` +
      `--config webpack.backend-dist-build.js ${
        buildOptions.watch ? '--watch' : ''
      } --env.outDir=${outDir} `;

    const showInfoWebpack = () => {
      Helpers.info(`

        WEBPACK ${buildOptions.watch ? 'WATCH ' : ''} BACKEND BUILD started...

        `);
      Helpers.info(` command: ${webpackCommand}`);
    };

    // TODO QUICK_FIX
    Helpers.writeFile(
      path.join(this.project.location, outDir, config.file.index_d_ts),
      EXPORT_TEMPLATE(outDir),
    );

    try {
      showInfoWebpack();
      if (buildOptions.watch) {
        await this.project.execute(webpackCommand, {
          similarProcessKey: 'tsc',
          biggerBuffer: true,
          resolvePromiseMsg: {
            stdout: ['hidden modules'],
          },
        });
      } else {
        this.project
          .run(webpackCommand, {
            biggerBuffer: true,
          })
          .sync();
      }
    } catch (er) {
      Helpers.error(
        `

      Webpack build fail...
  outdir: ${chalk(outDir)}, target artifact: ${buildOptions.targetArtifact}

`,
        false,
        true,
      );
    }
    //#endregion
  }
}
