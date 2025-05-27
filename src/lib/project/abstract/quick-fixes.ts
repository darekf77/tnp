//#region imports
import { config } from 'tnp-config/src';
import { glob, fse, chalk } from 'tnp-core/src';
import { path, _, crossPlatformPath } from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';
import { Helpers, BaseQuickFixes } from 'tnp-helpers/src';

import {
  folder_shared_folder_info,
  tempSourceFolder,
  THIS_IS_GENERATED_INFO_COMMENT,
  THIS_IS_GENERATED_STRING,
} from '../../constants';
import type { Project } from '../abstract/project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class QuickFixes extends BaseQuickFixes<Project> {
  removeHuskyHooks(): void {
    //#region @backendFunc
    this.project.removeFolderByRelativePath('node_modules/husky');
    //#endregion
  }

  //#region recreate temp source necessary files for tests
  recreateTempSourceNecessaryFilesForTesting(): void {
    //#region @backendFunc
    const outDir = config.folder.dist as 'dist';
    if (this.project.typeIsNot('isomorphic-lib')) {
      return;
    }

    (() => {
      const tsconfigBrowserPath = path.join(
        this.project.location,
        'tsconfig.browser.json',
      );
      const tempDirs = [
        tempSourceFolder(outDir, true, true),
        tempSourceFolder(outDir, false, false),
        tempSourceFolder(outDir, true, false),
        tempSourceFolder(outDir, false, true),
      ];
      tempDirs.forEach(dirName => {
        // console.log(`

        //   REBUILDING: ${dirName}

        //   `)
        const dest = path.join(this.project.location, dirName, 'tsconfig.json');
        Helpers.copyFile(tsconfigBrowserPath, dest);

        Helpers.writeJson(
          crossPlatformPath([
            this.project.location,
            dirName,
            'tsconfig.spec.json',
          ]),
          {
            extends: './tsconfig.json',
            compilerOptions: {
              outDir: './out-tsc/spec',
              types: ['jest', 'node'],
            },
            files: ['src/polyfills.ts'],
            include: [
              'lib/**/*.spec.ts',
              'lib/**/*.d.ts',
              'app/**/*.spec.ts',
              'app/**/*.d.ts',
            ],
          },
        );

        Helpers.writeFile(
          crossPlatformPath([this.project.location, dirName, 'jest.config.js']),
          `
module.exports = {
preset: "jest-preset-angular",
setupFilesAfterEnv: ["<rootDir>/setupJest.ts"],
reporters: ["default", "jest-junit"],
};`.trim() + '\n',
        );

        Helpers.writeFile(
          crossPlatformPath([this.project.location, dirName, 'setupJest.ts']),
          `
import 'jest-preset-angular/setup-jest';
import './jestGlobalMocks';
`.trim() + '\n',
        );

        Helpers.writeFile(
          crossPlatformPath([
            this.project.location,
            dirName,
            'jestGlobalMocks.ts',
          ]),
          `
Object.defineProperty(window, 'CSS', {value: null});
Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance']
    };
  }
});
/**
 * ISSUE: https://github.com/angular/material2/issues/7101
 * Workaround for JSDOM missing transform property
 */
Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});
`.trim() + '\n',
        );
      });
    })();

    // const componentsFolder = path.join(this.project.location, config.folder.components)
    // if (fse.existsSync(componentsFolder)) {
    //   // TODO join isomorphic part with tsconfig.isomorphic.json
    //   Helpers.writeFile(path.join(componentsFolder, config.file.tsconfig_json), {
    //     "compileOnSave": true,
    //     "compilerOptions": {
    //       "declaration": true,
    //       "experimentalDecorators": true,
    //       "emitDecoratorMetadata": true,
    //       "allowSyntheticDefaultImports": true,
    //       'importHelpers': true,
    //       "moduleResolution": "node",
    //       "module": "commonjs",
    //       "skipLibCheck": true,
    //       "sourceMap": true,
    //       "target": "es5",
    //       "lib": [
    //         "es2015",
    //         "es2015.promise",
    //         "es2015.generator",
    //         "es2015.collection",
    //         "es2015.core",
    //         "es2015.reflect",
    //         "es2016",
    //         "dom"
    //       ],
    //       "types": [
    //         "node"
    //       ],
    //     },
    //     "include": [
    //       "./**/*"
    //     ],
    //     "exclude": [
    //       "node_modules",
    //       "preview",
    //       "projects",
    //       "docs",
    //       "dist",
    //       "example",
    //       "examples",
    //       "browser",
    //       "module",
    //       "tmp-src",
    //       "src/tests",
    //       "src/**/*.spec.ts",
    //       "tmp-site-src",
    //       "tmp-tests-context"
    //     ]
    //   })
    // }
    // }
    //#endregion
  }
  //#endregion

  //#region fix build dirs
  makeSureDistFolderExists(): void {
    //#region @backendFunc
    const p = crossPlatformPath([this.project.location, config.folder.dist]);
    if (!Helpers.isFolder(p)) {
      Helpers.remove(p);
      Helpers.mkdirp(p);
    }
    //#endregion
  }
  //#endregion

  //#region add missing angular files
  public missingAngularLibFiles(): void {
    //#region @backendFunc
    Helpers.taskStarted(`[quick fixes] missing angular lib fles start`, true);
    if (
      this.project.framework.frameworkVersionAtLeast('v3') &&
      this.project.typeIs('isomorphic-lib')
    ) {
      (() => {
        if (this.project.framework.isStandaloneProject) {
          (() => {
            const indexTs = crossPlatformPath(
              path.join(
                this.project.location,
                config.folder.src,
                'lib/index.ts',
              ),
            );
            if (!Helpers.exists(indexTs)) {
              Helpers.writeFile(
                indexTs,
                `
              export function helloWorldFrom${_.upperFirst(_.camelCase(this.project.name))}() { }
              `.trimLeft(),
              );
            }
          })();
          (() => {
            const indexTs = crossPlatformPath(
              path.join(
                this.project.location,
                config.folder.src,
                'lib/index.scss',
              ),
            );
            if (!Helpers.exists(indexTs)) {
              Helpers.writeFile(
                indexTs,
                `
// EXPORT SCSS STYLES FOR THIS LIBRARY IN THIS FILE
              `.trimLeft(),
              );
            }
          })();

          (() => {
            const indexTs = crossPlatformPath(
              path.join(
                this.project.location,
                config.folder.src,
                'index.scss',
              ),
            );
            if (!Helpers.exists(indexTs)) {
              Helpers.writeFile(
                indexTs,
                `
// EXPORT SCSS STYLES FOR THIS APP or LIBRARY IN THIS FILE
@use './lib/index.scss' as *;

              `.trimLeft(),
              );
            }
          })();
        }
      })();

      (() => {
        const shared_folder_info = crossPlatformPath([
          this.project.location,
          config.folder.src,
          config.folder.assets,
          config.folder.shared,
          folder_shared_folder_info,
        ]);

        Helpers.writeFile(
          shared_folder_info,
          `
${THIS_IS_GENERATED_STRING}

Assets from this folder are being shipped with this npm package (${this.project.nameForNpmPackage})
created from this project.

${THIS_IS_GENERATED_STRING}
          `.trimLeft(),
        );
      })();

      (() => {
        const shared_folder_info = crossPlatformPath([
          this.project.location,
          config.folder.src,
          config.folder.migrations,
          'migrations-info.md',
        ]);

        Helpers.writeFile(
          shared_folder_info,
          `
${THIS_IS_GENERATED_STRING}

This folder is only for storing migration files with auto-generated names.

${THIS_IS_GENERATED_STRING}
          `.trimLeft(),
        );
      })();

      (() => {
        const shared_folder_info = crossPlatformPath([
          this.project.location,
          config.folder.src,
          config.folder.lib,
          'lib-info.md',
        ]);

        Helpers.writeFile(
          shared_folder_info,
          `
${THIS_IS_GENERATED_STRING}

This folder is an entry point for npm Angular/NodeJS library

${THIS_IS_GENERATED_STRING}
          `.trimLeft(),
        );
      })();

      (() => {
        const shared_folder_info = crossPlatformPath([
          this.project.location,
          config.folder.src,
          'tests',
          'mocha-tests-info.md',
        ]);

        Helpers.writeFile(
          shared_folder_info,
          `
${THIS_IS_GENERATED_STRING}

# Purpose of this folder
Put your backend **mocha** tests (with *.test.ts extension) in this folder or any other *tests*
folder inside project.

\`\`\`
/src/lib/my-feature/features.test.ts                          # -> NOT ok, test omitted
/src/lib/my-feature/tests/features.test.ts                    # -> OK
/src/lib/my-feature/nested-feature/tests/features.test.ts     # -> OK
\`\`\`


# How to test your isomorphic backend ?

1. By using console select menu:
\`\`\`
taon test                   # single run
taon test:watch             # watch mode
taon test:debug             # and start "attach" VSCode debugger
taon test:watch:debug       # and start "attach" VSCode debugger
\`\`\`

2. Directly:
\`\`\`
taon mocha                        # single run
taon mocha:watch                  # watch mode
taon mocha:debug                  # and start "attach" VSCode debugger
taon mocha:watch:debug            # and start "attach" VSCode debugger
\`\`\`

# Example
example.test.ts
\`\`\`ts
import { describe, before, it } from 'mocha'
import { expect } from 'chai';

describe('Set name for function or class', () => {

  it('should keep normal function name ', () => {
    expect(1).to.be.eq(Number(1));
  })
});
\`\`\`

${THIS_IS_GENERATED_STRING}

          `.trimLeft(),
        );
      })();
    }

    Helpers.taskDone(`[quick fixes] missing angular lib fles end`);
    //#endregion
  }
  //#endregion

  //#region bad types in node modules
  removeBadTypesInNodeModules(): void {
    //#region @backendFunc
    if (
      this.project.framework.frameworkVersionAtLeast('v2') &&
      this.project.framework.isStandaloneProject
    ) {
      [
        '@types/prosemirror-*',
        '@types/mocha',
        '@types/jasmine*',
        '@types/puppeteer-core',
        '@types/puppeteer',
        '@types/oauth2orize',
        '@types/lowdb',
        '@types/eslint',
        '@types/eslint-scope',
        '@types/inquirer',
      ].forEach(name => {
        Helpers.remove(path.join(this.project.nodeModules.path, name));
      });
      const globalsDts = this.project.readFile(
        'node_modules/@types/node/globals.d.ts',
      );
      try {
        this.project.writeFile(
          'node_modules/@types/node/globals.d.ts',
          UtilsTypescript.removeRegionByName(globalsDts, 'borrowed'),
        );
      } catch (error) {
        Helpers.error(
          `Problem with removing borrowed types from globals.d.ts`,
          true,
          false,
        );
        this.project.writeFile(
          'node_modules/@types/node/globals.d.ts',
          globalsDts,
        );
      }
    }
    //#endregion
  }
  //#endregion

  //#region add missing source folder
  public addMissingSrcFolderToEachProject(): void {
    //#region @backendFunc
    /// QUCIK_FIX make it more generic
    if (this.project.framework.frameworkVersionEquals('v1')) {
      return;
    }
    Helpers.taskStarted(`[quick fixes] missing source folder start`, true);
    if (!fse.existsSync(this.project.location)) {
      return;
    }
    if (this.project.framework.isStandaloneProject) {
      const srcFolder = path.join(this.project.location, config.folder.src);

      if (!fse.existsSync(srcFolder)) {
        Helpers.mkdirp(srcFolder);
      }
    }
    Helpers.taskDone(`[quick fixes] missing source folder end`);
    //#endregion
  }
  //#endregion

  //#region node_modules replacements zips
  public get nodeModulesPkgsReplacements() {
    //#region @backendFunc
    const npmReplacements = glob
      .sync(`${this.project.location} /${config.folder.node_modules}-*.zip`)
      .map(p => p.replace(this.project.location, '').slice(1));

    return npmReplacements;
    //#endregion
  }

  /**
   * FIX for missing npm packages from npmjs.com
   *
   * Extract each file: node_modules-<package Name>.zip
   * to node_modules folder before instalation.
   * This will prevent packages deletion from npm
   */
  public unpackNodeModulesPackagesZipReplacements() {
    //#region @backendFunc
    const nodeModulesPath = path.join(
      this.project.location,
      config.folder.node_modules,
    );

    if (!fse.existsSync(nodeModulesPath)) {
      Helpers.mkdirp(nodeModulesPath);
    }
    this.nodeModulesPkgsReplacements.forEach(p => {
      const name = p.replace(`${config.folder.node_modules}-`, '');
      const moduleInNodeMdules = path.join(
        this.project.location,
        config.folder.node_modules,
        name,
      );
      if (fse.existsSync(moduleInNodeMdules)) {
        Helpers.info(
          `Extraction ${chalk.bold(name)} already exists in ` +
            ` ${chalk.bold(this.project.genericName)}/${config.folder.node_modules}`,
        );
      } else {
        Helpers.info(
          `Extraction before instalation ${chalk.bold(name)} in ` +
            ` ${chalk.bold(this.project.genericName)}/${config.folder.node_modules}`,
        );

        this.project.run(`extract-zip ${p} ${nodeModulesPath}`).sync();
      }
    });
    //#endregion
  }
  //#endregion
}
