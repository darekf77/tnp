//#region imports
import { Utils } from 'tnp-core/src';
import { crossPlatformPath, path, _ } from 'tnp-core/src';
import { fileName } from 'tnp-core/src';
import { BasePackageJson, Helpers, HelpersTaon } from 'tnp-helpers/src';

import { templateFolderForArtifact } from '../../../../../app-utils';
import {
  browserMainProject,
  CoreNgTemplateFiles,
  distFromNgBuild,
  distMainProject,
  libFromSrc,
  myLibFromNgProject,
  packageJsonNgProject,
  prodSuffix,
  projectsFromNgTemplate,
  srcMainProject,
  tmpLibsForDist,
  tmpLibsForDistWebsql,
  tmpSrcDist,
  tmpSrcDistWebsql,
  tsconfigNgProject,
  tsconfigSpecNgProject,
  websqlMainProject,
} from '../../../../../constants';
import { ReleaseArtifactTaon } from '../../../../../options';
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

    let browserLibsTsCode = this.initOptions.build.websql
      ? tmpLibsForDistWebsql
      : tmpLibsForDist;

    if (this.initOptions.build.prod) {
      browserLibsTsCode = `${browserLibsTsCode}${prodSuffix}`;
    }

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
              `${projectsFromNgTemplate}/${myLibFromNgProject}`,
            );

            const dest = path.join(
              this.project.location,
              replacement(tmpProjectsStandalone),
              `${projectsFromNgTemplate}/${this.project.name}`,
            );
            Helpers.remove(dest);
            HelpersTaon.move(source, dest);
          })();
          //#endregion

          (() => {
            //#region hande / src / lib
            let browserTsCode = this.initOptions.build.websql
              ? tmpSrcDistWebsql
              : tmpSrcDist;

            if (this.initOptions.build.prod) {
              browserTsCode = `${browserTsCode}${prodSuffix}`;
            }

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
              `${projectsFromNgTemplate}/${
                this.project.name
              }/${srcMainProject}/${fileName.public_api_ts}`,
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
                new RegExp(Utils.escapeStringForRegEx(myLibFromNgProject), 'g'),
                f === libPackageJson
                  ? `${this.project.name}/${this.initOptions.build.websql ? websqlMainProject : browserMainProject}`
                  : this.project.name,
              );
              // TODO not needed?
              // if (path.basename(f) === tsconfigNgProject) {
              //   console.log(`CHANING ${f}`);
              //   // debugger;
              //   content = content.replace(
              //     new RegExp(
              //       Utils.escapeStringForRegEx(
              //         `"${distFromNgBuild}/${this.project.name}`,
              //       ),
              //       'g',
              //     ),
              //     `"../../${distMainProject}/` +
              //       `${this.initOptions.build.websql ? websqlMainProject : browserMainProject}` +
              //       // proper compilation browser-prod / websql-prod
              //       `${this.initOptions.build.prod ? `${prodSuffix}` : ''}` +
              //       `/${this.project.name}`,
              //   );
              // }

              Helpers.writeFile(f, content);
            },
          );

          (() => {
            const json = Helpers.readJson(ngPackageJson); // dist is on purpose
            json.dest = json.dest.replace(
              `/${distFromNgBuild}/${this.project.name}`,
              `/../../${
                distMainProject +
                (this.initOptions.build.prod ? `${prodSuffix}` : '')
              }/` +
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
