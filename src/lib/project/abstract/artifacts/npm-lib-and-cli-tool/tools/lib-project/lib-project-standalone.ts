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
import { BuildOptions } from '../../../../../../options';
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

  //#region  fix package.json

  fixPackageJson(realCurrentProj: Project) {
    //#region @backendFunc
    // [
    //   // config.folder.browser, /// TODO FIX for typescript
    //   config.folder.client,
    //   '',
    // ].forEach(c => {
    //   const pjPath = path.join(this.lib.location, config.folder.dist, c, config.file.package_json);
    //   const content = Helpers.readJson(pjPath);
    //   Helpers.remove(pjPath);
    //   Helpers.writeFile(pjPath, content);
    // });

    this.project.npmHelpers.copyDepsFromCoreContainer(
      `after release show when ok`,
    );
    if (this.project.taonJson.cliLibReleaseOptions.cliBuildIncludeNodeModules) {
      // this.lib.packageJson.clearForRelease('dist');
    } else {
      //#region copy packagejson before release (beacuse it may be link)
      const packageJsonInDistReleasePath = path.join(
        this.project.location,
        config.folder.dist,
        config.file.package_json,
      );
      const orgPj = Helpers.readFile(packageJsonInDistReleasePath);
      Helpers.removeFileIfExists(packageJsonInDistReleasePath);
      Helpers.writeFile(packageJsonInDistReleasePath, orgPj);
      //#endregion

      if (this.project.packageJson.name === 'tnp') {
        // TODO QUICK_FIX
        Helpers.setValueToJSON(
          path.join(
            this.project.location,
            config.folder.dist,
            config.file.package_json,
          ),
          'dependencies',
          (
            this.project.ins.Tnp.taonJson.dependenciesNamesForNpmLib || []
          ).reduce((a, b) => {
            return _.merge(a, {
              [b]: this.project.ins.Tnp.packageJson.dependencies[b],
            });
          }, {}),
        );
      } else {
        Helpers.setValueToJSON(
          packageJsonInDistReleasePath,
          'devDependencies',
          {},
        );
        // QUICK FIX include only
        const dependenciesNamesForNpmLib =
          realCurrentProj.taonJson.dependenciesNamesForNpmLib || [];

        const dependencies =
          Helpers.readJson(packageJsonInDistReleasePath, {}).dependencies || {};

        Object.keys(dependencies).forEach(packageName => {
          if (!dependenciesNamesForNpmLib.includes(packageName)) {
            delete dependencies[packageName];
          }
        });
        Helpers.setValueToJSON(
          packageJsonInDistReleasePath,
          'dependencies',
          dependencies,
        );
      }
    }
    //#endregion
  }
  //#endregion

  //#region build docs
  async buildDocs(
    prod: boolean,
    realCurrentProj: Project,
    automaticReleaseDocs: boolean,
    libBuildCallback: (websql: boolean, prod: boolean) => any,
  ): Promise<boolean> {
    //#region @backendFunc

    //#region resovle variables
    const mainProjectName = realCurrentProj.name;
    let appBuildOptions = { docsAppInProdMode: prod, websql: false };
    //#endregion

    return await Helpers.questionYesNo(
      `Do you wanna build /docs folder app for preview`,
      async () => {
        //#region questions
        if (automaticReleaseDocs) {
          appBuildOptions = {
            docsAppInProdMode:
              realCurrentProj.artifactsManager.artifact.angularNodeApp
                .__docsAppBuild.config.prod,
            websql:
              realCurrentProj.artifactsManager.artifact.angularNodeApp
                .__docsAppBuild.config.websql,
          };
        }

        if (!automaticReleaseDocs) {
          await Helpers.questionYesNo(
            `Do you want build in production mode`,
            () => {
              appBuildOptions.docsAppInProdMode = true;
            },
            () => {
              appBuildOptions.docsAppInProdMode = false;
            },
          );

          await Helpers.questionYesNo(
            `Do you wanna use websql mode ?`,
            () => {
              appBuildOptions.websql = true;
            },
            () => {
              appBuildOptions.websql = false;
            },
          );
        }

        const cfg: AppBuildConfig = {
          build: true,
          prod: appBuildOptions.docsAppInProdMode,
          websql: appBuildOptions.websql,
          projName: mainProjectName,
        };

        realCurrentProj.artifactsManager.artifact.angularNodeApp.__docsAppBuild.save(
          cfg,
        );

        Helpers.log(`

      Building /docs folder preview app - start

      `);
        //#endregion

        await Helpers.runSyncOrAsync({ functionFn: libBuildCallback });

        await this.project.build(
          BuildOptions.from({
            buildType: 'app',
            prod: appBuildOptions.docsAppInProdMode,
            websql: appBuildOptions.websql,
          }),
        );

        realCurrentProj.git.revertFileChanges('docs/CNAME');

        const tempDocs = realCurrentProj.pathFor(TEMP_DOCS);
        const docsIndocs = realCurrentProj.pathFor('docs/documentation');
        if (Helpers.exists(tempDocs)) {
          Helpers.copy(tempDocs, docsIndocs);
        }

        const assetsListPathSourceMain = crossPlatformPath([
          realCurrentProj.location,
          `tmp-dist-release/${config.folder.dist}/project/${realCurrentProj.name}`,
          `tmp-apps-for-${config.folder.dist}${appBuildOptions.websql ? '-websql' : ''}`,
          realCurrentProj.name,
          config.folder.src,
          config.folder.assets,
          realCurrentProj.artifactsManager.artifact.angularNodeApp
            .__assetsFileListGenerator.filename,
        ]);
        const assetsListPathDestMain = crossPlatformPath([
          realCurrentProj.location,
          config.folder.docs,
          config.folder.assets,
          realCurrentProj.artifactsManager.artifact.angularNodeApp
            .__assetsFileListGenerator.filename,
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
    realCurrentProj: Project;
    newVersion: string;
    automaticRelease: boolean;
    prod: boolean;
  }) {
    //#region @backendFunc
    const { realCurrentProj, newVersion, automaticRelease, prod } = options;

    const existedReleaseDist = crossPlatformPath([
      this.project.location,
      this.project.framework.__getTempProjName('dist'),
      config.folder.node_modules,
      realCurrentProj.name,
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
          this.project.git.__removeTagAndCommit(automaticRelease);
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

        await this.updateTnpAndCoreContainers(realCurrentProj, newVersion);
      },
    );
    //#endregion
  }
  //#endregion
}
