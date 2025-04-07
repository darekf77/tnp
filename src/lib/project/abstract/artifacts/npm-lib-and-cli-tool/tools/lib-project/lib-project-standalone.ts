//#region imports
import { config } from 'tnp-config/src';
import { crossPlatformPath, path, _, chalk } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import {
  TEMP_DOCS,
  clientCodeVersionFolder,
} from '../../../../../../constants';
import { Models } from '../../../../../../models';
import { EnvOptions } from '../../../../../../options';
import type { Project } from '../../../../project';
import type { AppBuildConfig } from '../../../angular-node-app/tools/docs-app-build-config'; // '../../features/docs-app-build-config';

import { LibProjectBase } from './lib-project-base';
//#endregion

/**
 * @deprecated
 */
export class LibProjectStandalone extends LibProjectBase {
  //#region prepare package
  preparePackage(smartContainer: Project, newVersion: string) {
    const base = path.join(this.project.location, config.folder.dist);

    this.project.artifactsManager.globalHelper.__removeJsMapsFrom(base);
  }
  //#endregion

  //#region build docs
  async buildDocs(
    prod: boolean,
    autoReleaseUsingConfigDocs: boolean,
    libBuildCallback: (websql: boolean, prod: boolean) => any,
  ): Promise<boolean> {
    //#region @backendFunc

    //#region resovle variables
    const mainProjectName = this.project.name;
    let appEnvOptions = { docsAppInProdMode: prod, websql: false };
    //#endregion

    return await Helpers.questionYesNo(
      `Do you wanna build /docs folder app for preview`,
      async () => {
        //#region questions
        if (autoReleaseUsingConfigDocs) {
          appEnvOptions = {
            docsAppInProdMode:
              this.project.artifactsManager.artifact.angularNodeApp
                .__docsAppBuild.config.prod,
            websql:
              this.project.artifactsManager.artifact.angularNodeApp
                .__docsAppBuild.config.websql,
          };
        }

        if (!autoReleaseUsingConfigDocs) {
          await Helpers.questionYesNo(
            `Do you want build in production mode`,
            () => {
              appEnvOptions.docsAppInProdMode = true;
            },
            () => {
              appEnvOptions.docsAppInProdMode = false;
            },
          );

          await Helpers.questionYesNo(
            `Do you wanna use websql mode ?`,
            () => {
              appEnvOptions.websql = true;
            },
            () => {
              appEnvOptions.websql = false;
            },
          );
        }

        const cfg: AppBuildConfig = {
          build: true,
          prod: appEnvOptions.docsAppInProdMode,
          websql: appEnvOptions.websql,
          projName: mainProjectName,
        };

        this.project.artifactsManager.artifact.angularNodeApp.__docsAppBuild.save(
          cfg,
        );

        Helpers.log(`

      Building /docs folder preview app - start

      `);
        //#endregion

        await Helpers.runSyncOrAsync({ functionFn: libBuildCallback });

        await this.project.build(
          EnvOptions.from({
            build: {
              angularProd: appEnvOptions.docsAppInProdMode,
              websql: appEnvOptions.websql,
            },
          }),
        );

        this.project.git.revertFileChanges('docs/CNAME');

        const tempDocs = this.project.pathFor(TEMP_DOCS);
        const docsIndocs = this.project.pathFor('docs/documentation');
        if (Helpers.exists(tempDocs)) {
          Helpers.copy(tempDocs, docsIndocs);
        }

        const assetsListPathSourceMain = crossPlatformPath([
          this.project.location,
          `tmp-dist-release/${config.folder.dist}/project/${this.project.name}`,
          `tmp-apps-for-${config.folder.dist}${appEnvOptions.websql ? '-websql' : ''}`,
          this.project.name,
          config.folder.src,
          config.folder.assets,
          this.project.artifactsManager.artifact.angularNodeApp
            .assetsFileListGenerator.filename,
        ]);
        const assetsListPathDestMain = crossPlatformPath([
          this.project.location,
          config.folder.docs,
          config.folder.assets,
          this.project.artifactsManager.artifact.angularNodeApp
            .assetsFileListGenerator.filename,
        ]);
        // console.log({
        //   assetsListPathSourceMain,
        //   assetsListPathDestMain,
        // })
        Helpers.copyFile(assetsListPathSourceMain, assetsListPathDestMain);

        Helpers.log(`

        Building docs preview - done

        `);
      },
    );
    //#endregion
  }
  //#endregion
}
