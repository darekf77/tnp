//#region imports
import { config, Utils } from 'tnp-core/src';
import { crossPlatformPath, path, _ } from 'tnp-core/src';
import { fileName } from 'tnp-core/src';
import { BasePackageJson, Helpers } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import { templateFolderForArtifact } from '../../../../../app-utils';
import {
  browserMainProject,
  CoreNgTemplateFiles,
  distFromNgBuild,
  distMainProject,
  libFromSrc,
  migrationsFromSrc,
  migrationsFromTempSrc,
  packageJsonNgProject,
  projectsFromNgTemplate,
  srcMainProject,
  TemplateFolder,
  tmpLibsForDist,
  tmpLibsForDistWebsql,
  tmpSrcDist,
  tmpSrcDistWebsql,
  tsconfigNgProject,
  tsconfigSpecNgProject,
  websqlMainProject,
} from '../../../../../constants';
import { Models } from '../../../../../models';
import { EnvOptions, ReleaseArtifactTaon } from '../../../../../options';
import type { Project } from '../../../project';
import { InsideStruct } from '../../__helpers__/inside-structures/inside-struct';
import { BaseInsideStruct } from '../../__helpers__/inside-structures/structs/base-inside-struct';
//#endregion

export class InsideStructAngularLib extends BaseInsideStruct {
  getCurrentArtifact(): ReleaseArtifactTaon {
    return ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL;
  }

  insideStruct(): InsideStruct {
    //#region @backendFunc
    const project = this.project;

    const browserLibsTsCode = this.initOptions.build.websql
      ? tmpLibsForDistWebsql
      : tmpLibsForDist;

    const tmpProjectsStandalone = crossPlatformPath([
      browserLibsTsCode,
      project.name,
    ]);

    const result = InsideStruct.from(
      {
        //#region pathes from container codere isomrophic lib
        relateivePathesFromContainer: this.relativePaths(),
        //#endregion
        projectType: project.type,
        frameworkVersion: project.framework.frameworkVersion,
        pathReplacements: [
          [
            new RegExp(
              `^${Utils.escapeStringForRegEx(templateFolderForArtifact(this.getCurrentArtifact()) + '/')}`,
            ),
            () => {
              return `${tmpProjectsStandalone}/`;
            },
          ],
        ],
        linkNodeModulesTo: [
          `${templateFolderForArtifact(this.getCurrentArtifact())}/`,
        ],
        endAction: ({ replacement }) => {
          //#region fixing package json dependencies in target proj
          (() => {
            const jsonPath = path.join(
              this.project.location,
              replacement(tmpProjectsStandalone),
              packageJsonNgProject,
            );

            const container = this.project.framework.coreContainer;

            const pj = new BasePackageJson({ cwd: jsonPath });
            pj.setDevDependencies({});
            pj.setDependencies(container.packageJson.dependencies);
          })();
          //#endregion

          //#region replace my-lib from container in targe proj
          (() => {
            const source = path.join(
              this.project.location,
              replacement(tmpProjectsStandalone),
              `${projectsFromNgTemplate}/my-lib`,
            );

            const dest = path.join(
              this.project.location,
              replacement(tmpProjectsStandalone),
              `${projectsFromNgTemplate}/${this.project.name}`,
            );
            Helpers.remove(dest);
            Helpers.move(source, dest);
          })();
          //#endregion

          (() => {
            //#region hande / src / migrations
            const browserTsCode = this.initOptions.build.websql
              ? tmpSrcDistWebsql
              : tmpSrcDist;

            const source = path.join(
              this.project.location,
              browserTsCode,
              migrationsFromTempSrc,
            );

            const dest = path.join(
              this.project.location,
              replacement(tmpProjectsStandalone),
              `${projectsFromNgTemplate}/${this.project.name}/${srcMainProject}/${migrationsFromTempSrc}`,
            );
            Helpers.remove(dest);
            Helpers.createSymLink(source, dest, {
              continueWhenExistedFolderDoesntExists: true,
            });
            //#endregion
          })();

          (() => {
            //#region hande / src / lib
            const browserTsCode = this.initOptions.build.websql
              ? tmpSrcDistWebsql
              : tmpSrcDist;

            const source = path.join(
              this.project.location,
              browserTsCode,
              libFromSrc,
            );

            const dest = path.join(
              this.project.location,
              replacement(tmpProjectsStandalone),
              `${projectsFromNgTemplate}/${this.project.name}/${srcMainProject}/${libFromSrc}`,
            );
            Helpers.remove(dest);
            Helpers.createSymLink(source, dest, {
              continueWhenExistedFolderDoesntExists: true,
            });
            //#endregion

            //#region resolve varaibles
            const sourcePublicApi = path.join(
              this.project.location,
              replacement(tmpProjectsStandalone),
              `${projectsFromNgTemplate}/${this.project.name}/${srcMainProject}/${fileName.public_api_ts}`,
            );

            let publicApiFile = Helpers.readFile(sourcePublicApi);

            const sourceTsconfig = path.join(
              this.project.location,
              replacement(tmpProjectsStandalone),
              tsconfigSpecNgProject,
            );

            let tsconfigJson = Helpers.readJson(sourceTsconfig, void 0, true);
            // console.log({
            //   sourceTsconfig
            // })

            if (tsconfigJson) {
              tsconfigJson.compilerOptions ? tsconfigJson.compilerOptions : {};
            }
            //#endregion

            if (tsconfigJson) {
              tsconfigJson.compilerOptions.paths = void 0;
            }
            publicApiFile = `
export * from './${libFromSrc}';
`.trimLeft();

            if (tsconfigJson) {
              Helpers.writeJson(sourceTsconfig, tsconfigJson);
            }

            Helpers.writeFile(sourcePublicApi, publicApiFile);
          })();

          const libPackageJson = crossPlatformPath([
            this.project.location,
            replacement(tmpProjectsStandalone),
            `${projectsFromNgTemplate}/${this.project.name}/${CoreNgTemplateFiles.PACKAGE_JSON}`,
          ]);

          const ngPackageJson = crossPlatformPath([
            this.project.location,
            replacement(tmpProjectsStandalone),
            `${projectsFromNgTemplate}/${this.project.name}/${CoreNgTemplateFiles.NG_PACKAGE_JSON}`,
          ]);

          const angularJson = crossPlatformPath([
            this.project.location,
            replacement(tmpProjectsStandalone),
            CoreNgTemplateFiles.ANGULAR_JSON,
          ]);

          const tsconfigJson = crossPlatformPath([
            this.project.location,
            replacement(tmpProjectsStandalone),
            tsconfigNgProject,
          ]);

          [libPackageJson, ngPackageJson, angularJson, tsconfigJson].forEach(
            f => {
              let content = Helpers.readFile(f) || '';
              content = content.replace(
                new RegExp('my\\-lib', 'g'),
                this.project.name,
              );
              if (path.basename(f) === tsconfigNgProject) {
                // debugger;
                content = content.replace(
                  new RegExp(
                    Helpers.escapeStringForRegEx(
                      `"${distFromNgBuild}/${this.project.name}`,
                    ),
                    'g',
                  ),
                  `"../../${distMainProject}/` +
                    `${this.initOptions.build.websql ? websqlMainProject : browserMainProject}` +
                    `/${this.project.name}`,
                );
              }

              Helpers.writeFile(f, content);
            },
          );

          (() => {
            const json = Helpers.readJson(ngPackageJson); // dist is on purpose
            json.dest = json.dest.replace(
              `/${distFromNgBuild}/${this.project.name}`,
              `/../../${distMainProject}/` +
                `${this.initOptions.build.websql ? websqlMainProject : browserMainProject}`,
            );

            Helpers.writeJson(ngPackageJson, json);
          })();
        },
      },
      project,
    );
    return result;
    //#endregion
  }
}

//#endregion
