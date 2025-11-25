//#region imports
import { config } from 'tnp-core/src';
import { crossPlatformPath, path, _ } from 'tnp-core/src';
import { BasePackageJson, Helpers } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import { Models } from '../../../../../models';
import { EnvOptions } from '../../../../../options';
import type { Project } from '../../../project';
import { InsideStruct } from '../../__helpers__/inside-structures/inside-struct';
import { BaseInsideStruct } from '../../__helpers__/inside-structures/structs/base-inside-struct';


//#endregion

export class InsideStructAngularLib extends BaseInsideStruct {
  relativePaths(): string[] {
    return [
      //#region files to copy from core isomorphic lib
      'lib/src/app/app.component.html',
      'lib/src/app/app.component.scss',
      // 'lib/src/app/app.component.spec.ts', // not working -> something better needed
      'lib/src/app/app.component.ts',
      // 'lib/src/app/app.module.ts',
      'lib/src/environments/environment.prod.ts',

      'lib/src/environments/environment.ts',
      'lib/src/app',
      'lib/src/environments',
      'lib/src/favicon.ico',
      'lib/src/index.html',
      'lib/src/main.ts',
      'lib/src/polyfills.ts',
      'lib/src/styles.scss',
      // 'lib/src/test.ts', // node needed for jest test - (but the don' work wit symlinks)
      'lib/.browserslistrc',
      'lib/.editorconfig',
      'lib/.gitignore',
      // 'app/README.md',
      'lib/angular.json',
      'lib/karma.conf.js',
      'lib/package-lock.json',
      'lib/package.json',
      'lib/tsconfig.app.json',
      'lib/tsconfig.json',
      'lib/tsconfig.spec.json',
      'lib/projects/my-lib/src',
      'lib/projects/my-lib/tsconfig.spec.json',
      'lib/projects/my-lib/tsconfig.lib.prod.json',
      'lib/projects/my-lib/tsconfig.lib.json',
      'lib/projects/my-lib/README.md',
      'lib/projects/my-lib/package.json',
      'lib/projects/my-lib/ng-package.json',
      'lib/projects/my-lib/karma.conf.js',
      //#endregion
    ];
  }

  insideStruct(): InsideStruct {
    //#region @backendFunc
    const project = this.project;
    const tmpProjectsStandalone =
      `tmp-libs-for-${config.folder.dist}` +
      `${this.initOptions.build.websql ? '-websql' : ''}/${project.name}`;

    const result = InsideStruct.from(
      {
        //#region pathes from container codere isomrophic lib
        relateivePathesFromContainer: this.relativePaths(),
        //#endregion
        projectType: project.type,
        frameworkVersion: project.framework.frameworkVersion,
        pathReplacements: [
          [
            new RegExp('^lib\\/'),
            () => {
              return `${tmpProjectsStandalone}/`;
            },
          ],
        ],
        linkNodeModulesTo: ['lib/'],
        endAction: ({ replacement }) => {
          //#region fixing package json dependencies in target proj
          (() => {
            const jsonPath = path.join(
              this.project.location,
              replacement(tmpProjectsStandalone),
              config.file.package_json,
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
              `projects/my-lib`,
            );

            const dest = path.join(
              this.project.location,
              replacement(tmpProjectsStandalone),
              `projects/${this.project.name}`,
            );
            Helpers.remove(dest);
            Helpers.move(source, dest);
          })();
          //#endregion

          (() => {
            //#region hande / src / migrations
            const source = path.join(
              this.project.location,
              `tmp-src-${config.folder.dist}` +
                `${this.initOptions.build.websql ? '-websql' : ''}`,
              'migrations',
            );

            const dest = path.join(
              this.project.location,
              replacement(tmpProjectsStandalone),
              `projects/${this.project.name}/src/migrations`,
            );
            Helpers.remove(dest);
            Helpers.createSymLink(source, dest, {
              continueWhenExistedFolderDoesntExists: true,
            });
            //#endregion
          })();

          (() => {
            //#region hande / src / lib
            const source = path.join(
              this.project.location,
              `tmp-src-${config.folder.dist}` +
                `${this.initOptions.build.websql ? '-websql' : ''}`,
              'lib',
            );

            const dest = path.join(
              this.project.location,
              replacement(tmpProjectsStandalone),
              `projects/${this.project.name}/src/lib`,
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
              `projects/${this.project.name}/src/${config.file.public_api_ts}`,
            );

            let publicApiFile = Helpers.readFile(sourcePublicApi);

            const sourceTsconfig = path.join(
              this.project.location,
              replacement(tmpProjectsStandalone),
              `tsconfig.json`,
            );

            let tsconfigJson = Helpers.readJson(sourceTsconfig, void 0, true);

            if (tsconfigJson) {
              tsconfigJson.compilerOptions ? tsconfigJson.compilerOptions : {};
            }
            //#endregion

            if (tsconfigJson) {
              tsconfigJson.compilerOptions.paths = void 0;
            }
            publicApiFile = `
export * from './lib';
`.trimLeft();

            if (tsconfigJson) {
              Helpers.writeJson(sourceTsconfig, tsconfigJson);
            }

            Helpers.writeFile(sourcePublicApi, publicApiFile);
          })();

          const libPackageJson = crossPlatformPath([
            this.project.location,
            replacement(tmpProjectsStandalone),
            `projects/${this.project.name}/package.json`,
          ]);

          const ngPackageJson = crossPlatformPath([
            this.project.location,
            replacement(tmpProjectsStandalone),
            `projects/${this.project.name}/ng-package.json`,
          ]);

          const angularJson = crossPlatformPath([
            this.project.location,
            replacement(tmpProjectsStandalone),
            `angular.json`,
          ]);

          const tsconfigJson = crossPlatformPath([
            this.project.location,
            replacement(tmpProjectsStandalone),
            `tsconfig.json`,
          ]);

          [libPackageJson, ngPackageJson, angularJson, tsconfigJson].forEach(
            f => {
              let content = Helpers.readFile(f) || '';
              content = content.replace(
                new RegExp('my\\-lib', 'g'),
                this.project.name,
              );
              if (path.basename(f) === 'tsconfig.json') {
                // debugger;
                content = content.replace(
                  new RegExp(
                    Helpers.escapeStringForRegEx(
                      `"${config.folder.dist}/${this.project.name}`,
                    ),
                    'g',
                  ),
                  `"../../${config.folder.dist}/` +
                    `${this.initOptions.build.websql ? config.folder.websql : config.folder.browser}` +
                    `/${this.project.name}`,
                );
              }

              Helpers.writeFile(f, content);
            },
          );

          (() => {
            const json = Helpers.readJson(ngPackageJson); // dist is on purpose
            json.dest = json.dest.replace(
              `/${config.folder.dist}/${this.project.name}`,
              `/../../${config.folder.dist}/` +
                `${this.initOptions.build.websql ? config.folder.websql : config.folder.browser}`,
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
