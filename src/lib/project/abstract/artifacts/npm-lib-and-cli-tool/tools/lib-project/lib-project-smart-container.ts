//#region imports
import { config } from 'tnp-config/src';
import { chalk, crossPlatformPath, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import { clientCodeVersionFolder } from '../../../../../../constants';
import { BuildOptions } from '../../../../../../options';
import type { Project } from '../../../../project';
import type { AppBuildConfig } from '../../../angular-node-app/tools/docs-app-build-config';

import { LibProjectBase } from './lib-project-base';
//#endregion

export class LibProjectSmartContainer extends LibProjectBase {
  //#region prepare package
  preparePackage(smartContainer: Project, newVersion: string) {
    //#region @backendFunc
    const rootPackageName = `@${smartContainer.name}`;
    const base = path.join(
      this.project.location,
      this.project.framework.__getTempProjName('dist'),
      config.folder.node_modules,
      rootPackageName,
    );
    Helpers.foldersFrom(base).forEach(absFolder => {
      this.project.artifactsManager.globalHelper.__removeJsMapsFrom(absFolder);

      let proj = this.project.ins.From(absFolder) as Project;
      proj.taonJson.setType('isomorphic-lib');
      proj.taonJson.setFrameworkVersion(
        smartContainer.framework.frameworkVersion,
      );

      this.project.ins.unload(proj);
      proj = this.project.ins.From(absFolder) as Project;
      const child = smartContainer.children.find(
        c => c.name === path.basename(absFolder),
      ) as Project;

      proj.packageJson.setVersion(newVersion);
      proj.packageJson.setName(
        `${rootPackageName}/${proj.name}`.replace(
          `${rootPackageName}/${rootPackageName}`,
          rootPackageName,
        ),
      );
      proj.packageJson.setEngines(child.packageJson.engines);
      proj.packageJson.setHomepage(child.packageJson.homepage);
      proj.packageJson.removeDevDependencies();
      proj.packageJson.setDependencies(child.packageJson.dependencies);
      proj.packageJson.setPeerDependencies(child.packageJson.peerDependencies);

      this.project.ins.unload(proj);
    });
    //#endregion
  }
  //#endregion

  //#region publish
  async publish(options: {
    realCurrentProj: Project;
    newVersion: string;
    automaticRelease: boolean;
    prod: boolean;
    rootPackageName?: string;
  }) {
    //#region @backendFunc
    const {
      realCurrentProj,
      newVersion,
      automaticRelease,
      prod,
      rootPackageName,
    } = options;

    const base = path.join(
      this.project.location,
      this.project.framework.__getTempProjName('dist'),
      config.folder.node_modules,
      rootPackageName,
    );

    Helpers.info(`Publish cwd: ${base}`);
    await Helpers.questionYesNo(
      `Publish on npm all new versions: ${newVersion} ?`,
      async () => {
        Helpers.foldersFrom(base).forEach(cwd => {
          // QUICK_FIX
          for (const clientFolder of clientCodeVersionFolder) {
            Helpers.writeFile(
              [cwd, clientFolder, config.file._npmignore],
              '# file overrided - I need package.json on npm',
            );
          }

          let successPublis = false;
          // const proj = Project.ins.From(absFolder) as Project;

          try {
            Helpers.run(
              `npm publish ${
                realCurrentProj.packageJson.isPrivate ? '' : '--access public'
              }`,
              {
                cwd,
                output: true,
              },
            ).sync();
            successPublis = true;
          } catch (e) {
            this.project.git.__removeTagAndCommit(automaticRelease);
          }
        });

        await this.updateTnpAndCoreContainers(realCurrentProj, newVersion);
      },
    );
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
    //#region resolve variables
    const smartContainer = this.project;
    const mainProjectName =
      smartContainer.framework.smartContainerBuildTarget.name;
    const otherProjectNames = this.project.children
      .filter(c => c.name !== mainProjectName)
      .map(p => p.name);

    let allProjects = [mainProjectName, ...otherProjectNames];

    Helpers.info(`
Smart container routes for project:
+ ${chalk.bold(mainProjectName)} => /${mainProjectName}
${otherProjectNames
  .map(c => `+ ${chalk.bold(c)} => /${mainProjectName}/-/${c}`)
  .join('\n')}
        `);
    //#endregion

    return await Helpers.questionYesNo(
      `Do you wanna build /docs folder app for preview`,
      async () => {
        //#region questions
        const returnFun = (childName: string) => {
          if (childName === mainProjectName) {
            return {
              name: childName, // + chalk.gray(`\t\t<url>/${mainProjectName}`),
              value: childName,
            };
          }
          return {
            name: childName, // + chalk.gray(`\t\t<url>/${mainProjectName}/-/${childName}`),
            value: childName,
          };
        };

        const toBuildWebsqlCFG = [
          ...(realCurrentProj.artifactsManager.artifact.angularNodeApp
            .__docsAppBuild.config.build &&
          realCurrentProj.artifactsManager.artifact.angularNodeApp
            .__docsAppBuild.config.websql
            ? [mainProjectName]
            : []),
          ...realCurrentProj.artifactsManager.artifact.angularNodeApp.__docsAppBuild.config.children
            .map(c => {
              if (c.build && c.websql) {
                return c.projName;
              }
            })
            .filter(f => !!f),
        ];

        const toBuildNormallyCFG = [
          ...(realCurrentProj.artifactsManager.artifact.angularNodeApp
            .__docsAppBuild.config.build &&
          !realCurrentProj.artifactsManager.artifact.angularNodeApp
            .__docsAppBuild.config.websql
            ? [mainProjectName]
            : []),
          ...realCurrentProj.artifactsManager.artifact.angularNodeApp.__docsAppBuild.config.children
            .map(c => {
              if (c.build && !c.websql) {
                return c.projName;
              }
            })
            .filter(f => !!f),
        ];

        let toBuildWebsql = automaticReleaseDocs
          ? toBuildWebsqlCFG
          : await Helpers.consoleGui.multiselect(
              'Which project you want to build with WEBSQL mode',
              allProjects.map(childName => {
                return returnFun(childName);
              }),
            );

        allProjects = allProjects.filter(f => !toBuildWebsql.includes(f));

        let toBuildNormally = automaticReleaseDocs
          ? toBuildNormallyCFG
          : allProjects.length === 0
            ? []
            : await Helpers.consoleGui.multiselect(
                'Which projects you want to build with normally',
                allProjects.map(childName => {
                  return returnFun(childName);
                }),
              );

        //#region questions
        let appBuildOptions = { docsAppInProdMode: prod, websql: false };

        await Helpers.questionYesNo(
          `Do you want build in production mode`,
          () => {
            appBuildOptions.docsAppInProdMode = true;
          },
          () => {
            appBuildOptions.docsAppInProdMode = false;
          },
        );

        if (automaticReleaseDocs) {
          appBuildOptions.docsAppInProdMode =
            realCurrentProj.artifactsManager.artifact.angularNodeApp.__docsAppBuild.config.prod;
          appBuildOptions.websql =
            realCurrentProj.artifactsManager.artifact.angularNodeApp.__docsAppBuild.config.websql;
        }

        const cfg: AppBuildConfig = {
          build: [...toBuildWebsql, ...toBuildNormally].includes(
            mainProjectName,
          ),
          prod: appBuildOptions.docsAppInProdMode,
          websql: toBuildWebsql.includes(mainProjectName),
          projName: mainProjectName,
          children: [
            ...toBuildWebsql
              .filter(c => c !== mainProjectName)
              .map(c => {
                return {
                  build: true,
                  prod: appBuildOptions.docsAppInProdMode,
                  websql: true,
                  projName: c,
                };
              }),
            ...toBuildNormally
              .filter(c => c !== mainProjectName)
              .map(c => {
                return {
                  build: true,
                  prod: appBuildOptions.docsAppInProdMode,
                  websql: false,
                  projName: c,
                };
              }),
          ],
        };

        realCurrentProj.artifactsManager.artifact.angularNodeApp.__docsAppBuild.save(
          cfg,
        );
        //#endregion

        // await Helpers.questionYesNo(`Do you wanna use websql mode ?`, () => {
        //   appBuildOptions.websql = true;
        // }, () => {
        //   appBuildOptions.websql = false;
        // });

        Helpers.log(`

      Building /docs folder preview app - start

      `);
        //#endregion

        await Helpers.runSyncOrAsync({ functionFn: libBuildCallback });

        const docsBuild = async (
          childProjName: string,
          productinoBuild: boolean,
          websqlBuild: boolean,
          isMainTarget = false,
        ) => {
          await this.project.build(
            BuildOptions.from({
              buildType: 'app',
              prod: productinoBuild,
              websql: websqlBuild,
              smartContainerTargetName: childProjName,
            }),
          );

          const assetsListPathSourceMain = crossPlatformPath([
            crossPlatformPath(
              path.resolve(path.join(this.project.location, '..')),
            ),
            realCurrentProj.name,
            config.folder.dist,
            realCurrentProj.name,
            childProjName,
            `tmp-apps-for-${config.folder.dist}${websqlBuild ? '-websql' : ''}`,
            childProjName,
            config.folder.src,
            config.folder.assets,
            realCurrentProj.artifactsManager.artifact.angularNodeApp
              .__assetsFileListGenerator.filename,
          ]);
          const assetsListPathDestMain = crossPlatformPath([
            realCurrentProj.location,
            config.folder.docs,
            ...(isMainTarget ? [] : ['-' + childProjName]),
            config.folder.assets,
            realCurrentProj.artifactsManager.artifact.angularNodeApp
              .__assetsFileListGenerator.filename,
          ]);

          Helpers.copyFile(assetsListPathSourceMain, assetsListPathDestMain);
        };

        await docsBuild(cfg.projName, cfg.prod, cfg.websql, true);

        const children = cfg.children || [];
        for (let index = 0; index < children.length; index++) {
          const { websql, prod, projName } = children[index];
          await docsBuild(projName, prod, websql);
        }

        realCurrentProj.git.revertFileChanges('docs/CNAME');
        Helpers.log(`

        Building docs preview - done

        `);
      },
    );
    //#endregion
  }
  //#endregion
}
