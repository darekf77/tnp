//#region @backend
import { fse } from 'tnp-core'
import { path } from 'tnp-core'
import { glob } from 'tnp-core';
import * as inquirer from 'inquirer';
import { config } from 'tnp-config';
import { IncrementalBuildProcessExtended } from '../compilers/build-isomorphic-lib/incremental-build-process.backend';
import { Project } from '../abstract/project/project';
import { RegionRemover } from '../compilers/build-isomorphic-lib/region-remover.backend';
//#endregion
import { _ } from 'tnp-core';
import { Helpers } from 'tnp-helpers';
import { Models } from 'tnp-models';
import { BuildOptions } from 'tnp-db';
import { CLASS } from 'typescript-class-helpers';


//#region @backend
@CLASS.NAME('ProjectIsomorphicLib')
//#endregion
export class ProjectIsomorphicLib
  //#region @backend
  extends Project
//#endregion
{

  async initProcedure() {
    //#region @backend
    if (this.isCoreProject && this.frameworkVersionAtLeast('v2')) {

    }
    //#endregion
  }

  startOnCommand(args: string) {
    //#region @backendFunc
    const command = `ts-node run.js ${args}`;
    return command;
    //#endregion
  }

  sourceFilesToIgnore() {
    //#region @backendFunc
    let toIgnore = [
      `src/${config.file.entities_ts}`,
      `src/${config.file.controllers_ts}`,
    ];
    if (this.isSiteInStrictMode) {
      toIgnore = toIgnore.concat(toIgnore.map(f => `${config.folder.custom}/${f}`))
    }
    return toIgnore;
    //#endregion
  }

  projectSpecyficFiles(): string[] {
    //#region @backendFunc
    let files = super.projectSpecyficFiles()
      .concat([
        'tsconfig.browser.json',
        'webpack.config.js',
        'webpack.backend-bundle-build.js',
        'run.js',
        ...this.filesTemplates(),
      ]).concat(
        !this.isStandaloneProject ? [
          'src/typings.d.ts',
        ] : []);

    if (this.frameworkVersionAtLeast('v2')) {
      files = files.filter(f => f !== 'tsconfig.browser.json');
    }

    return files;
    //#endregion
  }

  filesTemplates() {
    //#region @backendFunc
    let files = [
      'tsconfig.json.filetemplate',
    ];

    if (this.frameworkVersionAtLeast('v2')) {
      files = [
        'tsconfig.isomorphic.json.filetemplate',
        'tsconfig.browser.json.filetemplate',
        ...this.vscodeFileTemplates,
        ...files,
      ];
    }

    return files;
    //#endregion
  }

  projectLinkedFiles() {
    //#region @backendFunc
    const files = super.projectLinkedFiles();

    if (this.frameworkVersionAtLeast('v2')) {
      files.push({
        sourceProject: Project.by<Project>(this._type, 'v1'),
        relativePath: 'webpack.backend-bundle-build.js'
      });
    }
    return files;
    //#endregion
  }

  projectSpecyficIgnoredFiles() {
    //#region @backendFunc
    return [
      'src/entities.ts',
      'src/controllers.ts'
    ].concat(this.projectSpecyficFiles());
    //#endregion
  }

  private async selectToSimulate(
    //#region @backend
    outDir: Models.dev.BuildDir, watch: boolean, forClient: Project[] | string[], args: string
    //#endregion
  ) {
    //#region @backend
    let webpackEnvParams = `--env.outFolder=${outDir}`;
    webpackEnvParams = webpackEnvParams + (watch ? ' --env.watch=true' : '');

    let client = _.first(forClient as Project[]);

    if (!global.tnpNonInteractive) {
      if (!this.isStandaloneProject && forClient.length === 0) {
        const answer: { project: string } = await inquirer
          .prompt([
            {
              type: 'list',
              name: 'project',
              message: 'Which project do you wanna simulate ?',
              choices: this.parent.children
                .filter(c => c.typeIs(...config.allowedTypes.app))
                .filter(c => c.name !== this.name)
                .map(c => c.name),
              filter: function (val) {
                return val.toLowerCase();
              }
            }
          ]) as any;
        client = Project.From<Project>(path.join(this.location, '..', answer.project));
      }
    }

    let port: number;
    if (client) {
      port = client.getDefaultPort();
      webpackEnvParams = `${webpackEnvParams} --env.moduleName=${client.name}`;
    }

    const argsAdditionalParams: { port: number; } = Helpers.cliTool.argsFrom(args) || {} as any;
    if (_.isNumber(argsAdditionalParams.port)) {
      port = argsAdditionalParams.port;
    }
    if (_.isNumber(port)) {
      await Helpers.killProcessByPort(port);
      webpackEnvParams = `${webpackEnvParams} --env.port=${port}`;
    }

    const command = `npm-run webpack-dev-server ${webpackEnvParams}`;
    Helpers.info(`

    WEBPACK COMMAND: ${command}

    `)
    this.run(command).sync();
    //#endregion
  }

  async buildSteps(buildOptions?: BuildOptions) {
    //#region @backendFunc
    const { prod, watch, outDir, onlyWatchNoBuild, appBuild, args, forClient = [] } = buildOptions;

    if (!onlyWatchNoBuild) {
      if (appBuild) {
        if (!watch) {
          Helpers.log(`App build not possible for isomorphic-lib in static build mode`)
          return;
        }
        await this.selectToSimulate(outDir, watch, forClient as any, buildOptions.args);
      } else {
        await this.buildLib();
      }
    }
    return;
    //#endregion
  }

  //#region @backend
  cutReleaseCode() {
    if (!(path.basename(path.dirname(path.dirname(this.location))) === config.folder.bundle &&
      path.basename(path.dirname(this.location)) === config.folder.project)) {
      Helpers.warn(`Npm code cut available only for command: ${config.frameworkName} release`);
      return;
    }

    const releaseSrcLocation = path.join(this.location, config.folder.src);
    const filesForModyficaiton = glob.sync(`${releaseSrcLocation}/**/*`);
    filesForModyficaiton
      .filter(absolutePath => !Helpers.isFolder(absolutePath))
      .forEach(absolutePath => {
        let rawContent = Helpers.readFile(absolutePath);
        rawContent = RegionRemover.from(absolutePath, rawContent, ['@notForNpm']).output;
        // rawContent = this.replaceRegionsWith(rawContent, ['@notForNpm']);
        Helpers.writeFile(absolutePath, rawContent);
      });
  }

  private REGEX_REGION(word) {
    return new RegExp("[\\t ]*\\/\\/\\s*#?region\\s+" + word + " ?[\\s\\S]*?\\/\\/\\s*#?endregion ?[\\t ]*\\n?", "g")
  }
  private replaceRegionsWith(stringContent = '', words = []) {
    if (words.length === 0) { return stringContent; }
    let word = words.shift();
    let replacement = ''
    if (Array.isArray(word) && word.length === 2) {
      replacement = word[1];
      word = word[0]
    }

    stringContent = stringContent.replace(this.REGEX_REGION(word), replacement);
    return this.replaceRegionsWith(stringContent, words);
  }
  //#endregion

  async buildLib() {
    //#region @backend
    const { outDir } = this.buildOptions;

    Helpers.log(`[buildLib] start of building`);
    this.beforeLibBuild(outDir);

    const webpackCommandFn = (watchCommand: boolean) =>
      `npm-run webpack --config webpack.backend-bundle-build.js ${watchCommand ? '--watch' : ''}`;

    const webpackCommand = webpackCommandFn(this.buildOptions.watch);
    const { obscure, uglify, nodts } = this.buildOptions;
    if (outDir === 'bundle') {
      this.cutReleaseCode();
    }

    if (outDir === 'bundle' && (obscure || uglify)) {

      this.quickFixes.overritenBadNpmPackages();
      Helpers.info(`

        WEBPACK ${this.buildOptions.watch ? 'WATCH' : ''} BACKEND BUILD started...

        command: ${webpackCommand}

        `);
    }



    if (!this.buildOptions.watch && (uglify || obscure || nodts) && outDir === 'bundle') {
      this.buildOptions.genOnlyClientCode = true;
    }
    this.incrementalBuildProcess = new IncrementalBuildProcessExtended(this, this.buildOptions);


    if (this.buildOptions.watch) {

      if (outDir === 'bundle') {
        Helpers.error(`Watch build not available for bundle build`);
      } else {
        await this.incrementalBuildProcess.startAndWatch('isomorphic compilation (watch mode)',
          {
            watchOnly: this.buildOptions.watchOnly,
            afterInitCallBack: async () => {
              await this.compilerCache.setUpdatoDate.incrementalBuildProcess();
            }
          })
      }
    } else {

      if (outDir === 'bundle' && (obscure || uglify || nodts)) {
        try {
          this.run(webpackCommand).sync();

          const reservedNames = [
            'reservedExpOne',
            'reservedExpSec'
          ];

          if (obscure || uglify) {
            this.compileToEs5();
          }
          if (uglify) {
            this.uglifyCode(reservedNames)
          };
          if (obscure) {
            this.obscureCode(reservedNames);
          }
          if (!nodts) {
            this.compilerDeclarationFiles()
          };
          // process.exit(0)
        } catch (er) {
          Helpers.error(`BUNDLE production build failed`, false, true);
        }
        await this.incrementalBuildProcess.start('isomorphic compilation (only client) ')
      } else {
        await this.incrementalBuildProcess.start('isomorphic compilation')
      }
    }
    //#endregion
  }
  compilerDeclarationFiles() {
    //#region @backend
    this.run(`npm-run tsc --emitDeclarationOnly --declarationDir ${config.folder.bundle}`).sync();
    //#endregion
  }

  //#region @backend
  compileToEs5() {
    if (!Helpers.exists(path.join(this.location, config.folder.bundle, 'index.js'))) {
      Helpers.warn(`[compileToEs5] Nothing to compile to es5... no index.js in bundle`)
      return
    }
    const indexEs5js = `index-es5.js`;
    Helpers.writeFile(path.join(this.location, config.folder.bundle, config.file._babelrc), '{ "presets": ["env"] }\n');
    this.run(`npm-run babel  ./bundle/index.js --out-file ./bundle/${indexEs5js}`).sync();
    Helpers.writeFile(
      path.join(this.location, config.folder.bundle, config.file.index_js),
      Helpers.readFile(path.join(this.location, config.folder.bundle, indexEs5js))
    );
    Helpers.removeFileIfExists(path.join(this.location, config.folder.bundle, indexEs5js));
    Helpers.removeFileIfExists(path.join(this.location, config.folder.bundle, config.file._babelrc));
  }
  //#endregion

  uglifyCode(reservedNames: string[]) {
    //#region @backendFunc
    if (!Helpers.exists(path.join(this.location, config.folder.bundle, 'index.js'))) {
      Helpers.warn(`[uglifyCode] Nothing to uglify... no index.js in bundle`)
      return
    }
    const command = `npm-run uglifyjs bundle/index.js --output bundle/index.js`
      + ` --mangle reserved=[${reservedNames.map(n => `'${n}'`).join(',')}]`
    // + ` --mangle-props reserved=[${reservedNames.join(',')}]` // it breakes code

    Helpers.info(`

    JAVASCRIPT-UGLIFY PROCESSING...

    ${command}

      `)
    this.run(command).sync();
    //#endregion
  }

  obscureCode(reservedNames: string[]) {
    //#region @backendFunc
    if (!Helpers.exists(path.join(this.location, config.folder.bundle, 'index.js'))) {
      Helpers.warn(`[obscureCode] Nothing to obscure... no index.js in bundle`)
      return
    }
    const commnad = `npm-run javascript-obfuscator bundle/index.js `
      + ` --output bundle/index.js`
      + ` --target node`
      + ` --rotate-string-array true`
      // + ` --stringArray true`
      + ` --string-array-encoding base64`
      + ` --reserved-names '${reservedNames.join(',')}'`
      + ` --reserved-strings '${reservedNames.join(',')}'`

    Helpers.info(`

        JAVASCRIPT-OBFUSCATOR PROCESSING...

        ${commnad}

          `)
    this.run(commnad).sync();
    //#endregion
  }

}

//#region @backend
export function getReservedClassNames(project = Project.Current as Project) {
  // console.log('get class names from : ' + project.name)
  // console.log('parent : ' + (project.parent && project.parent.name))
  // console.log('childeren' + (project.parent && project.parent.children.map(c => c.name)));
  // console.log('children isomorphic: ' + (project.parent && project.parent.children
  //     .filter((p) => p.type === 'isomorphic-lib')
  //     .map(c => c.name))
  // );
  if (project && project.parent && project.parent.typeIs('workspace')
    && Array.isArray(project.parent.children)
    && project.parent.children.length > 0) {


    const names = []
    project.parent.children
      .filter((p) => p.typeIs('isomorphic-lib'))
      .forEach(p => {

        const controllers = Helpers.morphi.getControllers(path.join(
          p.location,
          config.folder.src
        ))

        // console.log('controllers', controllers)
        controllers.forEach(c => {
          names.push(path.basename(c, '.ts'))
        });

        const entities = Helpers.morphi.getEntites(path.join(
          p.location,
          config.folder.src
        ))
        // const entities = glob.sync(`${path.join(
        //   p.location,
        //   config.folder.src,
        //   config.folder.entities
        // )}/**/*.ts`)
        // console.log('entities', entities)
        entities.forEach(e => {
          names.push(path.basename(e, '.ts'))
        });
      })
    return names;
  }
  return [];
}
//#endregion
