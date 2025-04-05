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

  //#region publish
  async publish(options: {
    newVersion: string;
    autoReleaseUsingConfig: boolean;
    prod: boolean;
  }) {
    //#region @backendFunc
    const { newVersion, autoReleaseUsingConfig, prod } = options;

    const existedReleaseDist = crossPlatformPath([
      this.project.location,
      this.project.framework.getTempProjectNameForCopyTo(),
      config.folder.node_modules,
      this.project.name,
    ]);
    Helpers.info(`Publish cwd: ${existedReleaseDist}`);
    await Helpers.questionYesNo(
      `Publish on npm version: ${newVersion} ?`,
      async () => {
        // QUICK_FIX
        for (const clientFolder of clientCodeVersionFolder) {
          Helpers.writeFile(
            [existedReleaseDist, clientFolder, config.file._npmignore],
            '# file overrided - I need package.json on npm',
          );
          // console.log(`Write file: ${existedReleaseDist}/${clientFolder}/${config.file._npmignore}`);
        }

        // publishing standalone
        try {
          Helpers.run('npm publish', {
            cwd: existedReleaseDist,
            output: true,
          }).sync();
        } catch (e) {
          this.project.git.__removeTagAndCommit(autoReleaseUsingConfig);
        }

        // release additional packages names
        const names = this.project.taonJson.additionalNpmNames;
        for (let index = 0; index < names.length; index++) {
          const c = names[index];
          const additionBase = crossPlatformPath(
            path.resolve(
              path.join(this.project.location, `../../../additional-dist-${c}`),
            ),
          );
          Helpers.mkdirp(additionBase);
          Helpers.copy(existedReleaseDist, additionBase, {
            copySymlinksAsFiles: true,
            omitFolders: [config.folder.node_modules],
            omitFoldersBaseFolder: existedReleaseDist,
          });
          const pathPackageJsonRelease = path.join(
            additionBase,
            config.file.package_json,
          );
          const packageJsonAdd: PackageJson = Helpers.readJson(
            path.join(additionBase, config.file.package_json),
          );

          packageJsonAdd.name = c;
          // const keys = Object.keys(packageJsonAdd.bin || {});
          // keys.forEach(k => {
          //   const v = packageJsonAdd.bin[k] as string;
          //   packageJsonAdd.bin[k.replace(this.name, c)] = v.replace(this.name, c);
          //   delete packageJsonAdd.bin[k];
          // });
          Helpers.writeFile(pathPackageJsonRelease, packageJsonAdd);
          Helpers.info('log addtional dist created');
          try {
            if (!global.tnpNonInteractive) {
              Helpers.run(`code ${additionBase}`).sync();
              Helpers.info(
                `Check you additional dist for ${chalk.bold(c)} and press any key to publish...`,
              );
              Helpers.pressKeyAndContinue();
            }
            Helpers.run('npm publish', { cwd: additionBase }).sync();
          } catch (error) {
            Helpers.warn(`No able to push additional dist for name: ${c}`);
          }
        }

        await this.updateTnpAndCoreContainers(newVersion);
      },
    );
    //#endregion
  }
  //#endregion
}
