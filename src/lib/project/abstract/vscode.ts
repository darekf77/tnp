//#region imports
import { config } from 'tnp-config/src';
import { chalk, fse, json5, path } from 'tnp-core/src';
import { BaseVscodeHelpers, Helpers } from 'tnp-helpers/src';

import { DEBUG_WORD, PortUtils, taonConfigSchemaJson } from '../../constants';
import { Models } from '../../models';

import type { Project } from './project';
//#endregion

/**
 * Handle taon things related to vscode
 * support for launch.json, settings.json etc
 */ // @ts-ignore TODO weird inheritance problem
export class Vscode extends BaseVscodeHelpers<Project> {
  //#region recreate jsonc schema
  recreateJsonSchemas(): void {
    this.recreateJsonSchemaForDocs();
    this.recreateJsonSchemaForTaon();
  }
  //#endregion

  //#region recreate jsonc schema for docs
  private recreateJsonSchemaForDocs(): void {
    //#region @backendFunc
    const properSchema = {
      fileMatch: [
        `/${this.project.artifactsManager.artifact.docsWebapp.docs.docsConfigJsonFileName}`,
      ],
      url: `./${this.project.artifactsManager.artifact.docsWebapp.docs.docsConfigSchema}`,
    };

    const currentSchemas: {
      fileMatch: string[];
      url: string;
    }[] =
      this.project.getValueFromJSONC(this.settingsJson, `['json.schemas']`) ||
      [];
    const existedIndex = currentSchemas.findIndex(
      x => x.url === properSchema.url,
    );
    if (existedIndex !== -1) {
      currentSchemas[existedIndex] = properSchema;
    } else {
      currentSchemas.push(properSchema);
    }

    this.project.setValueToJSONC(
      this.settingsJson,
      '["json.schemas"]',
      currentSchemas,
    );
    //#endregion
  }
  //#endregion

  //#region recreate jsonc schema for taon
  private recreateJsonSchemaForTaon(): void {
    //#region @backendFunc
    const properSchema = {
      fileMatch: [`/${config.file.taon_jsonc}`],
      url: `./${taonConfigSchemaJson}`,
    };

    const currentSchemas: {
      fileMatch: string[];
      url: string;
    }[] =
      this.project.getValueFromJSONC(this.settingsJson, `['json.schemas']`) ||
      [];
    const existedIndex = currentSchemas.findIndex(
      x => x.url === properSchema.url,
    );
    if (existedIndex !== -1) {
      currentSchemas[existedIndex] = properSchema;
    } else {
      currentSchemas.push(properSchema);
    }

    this.project.setValueToJSONC(
      this.settingsJson,
      '["json.schemas"]',
      currentSchemas,
    );
    //#endregion
  }
  //#endregion

  //#region save launch.json
  public __saveLaunchJson(basePort: number = 4100) {
    //#region @backendFunc
    if (this.project.framework.isSmartContainer) {
      //#region container save
      const container = this.project;
      const configurations = container.children
        .filter(f => {
          return (
            f.framework.frameworkVersionAtLeast('v3') &&
            f.typeIs('isomorphic-lib')
          );
        })
        .map((c, index) => {
          const backendPort =
            PortUtils.instance(basePort).calculateServerPortFor(c);

          c.artifactsManager.artifact.angularNodeApp.writePortsToFile();
          return {
            type: 'node',
            request: 'launch',
            name: `${DEBUG_WORD} Server @${container.name}/${c.name}`,
            cwd: '${workspaceFolder}' + `/dist/${container.name}/${c.name}`,
            program:
              '${workspaceFolder}' +
              `/dist/${container.name}/${c.name}/run-org.js`,
            args: [`--child=${c.name}`, `--port=${backendPort}`],
            // "sourceMaps": true,
            // "outFiles": [ // TODOD this is causing unbound breakpoing in thir party modules
            //   "${workspaceFolder}" + ` / dist / ${ container.name } / ${ c.name } / dist/**/ *.js`
            // ],
            runtimeArgs: this.__vscodeLaunchRuntimeArgs,
            presentation: {
              group: 'workspaceServers',
            },
          };
        });

      const temlateSmartContine = {
        version: '0.2.0',
        configurations,
        // "compounds": []
      };

      const launchJSOnFilePath = path.join(
        container.location,
        '.vscode/launch.json',
      );
      Helpers.writeFile(launchJSOnFilePath, temlateSmartContine);
      //#endregion
    } else if (
      this.project.framework.isStandaloneProject &&
      !this.project.framework.isSmartContainerTarget
    ) {
      //#region standalone save

      let configurations = [];
      let compounds: { name: string; configurations: any[] }[] = [];

      //#region template attach process
      const temlateAttachProcess = {
        type: 'node',
        request: 'attach',
        name: 'Attach to global cli tool',
        port: 9229,
        skipFiles: ['<node_internals>/**'],
        // "outFiles": ["${workspaceFolder}/dist/**/*.js"] // not wokring for copy manager
      };
      //#endregion

      //#region tempalte start normal nodejs server
      const templateForServer = (
        serverChild: Project,
        clientProject: Project,
        workspaceLevel: boolean,
      ) => {
        const backendPort =
          PortUtils.instance(basePort).calculateServerPortFor(serverChild);
        clientProject.artifactsManager.artifact.angularNodeApp.writePortsToFile();
        const startServerTemplate = {
          type: 'node',
          request: 'launch',
          name: `${DEBUG_WORD} Server`,
          program: '${workspaceFolder}/run.js',
          cwd: void 0,
          args: [`port=${backendPort}`],
          outFiles: this.outFilesArgs,
          // "outFiles": ["${workspaceFolder}/dist/**/*.js"], becouse of this debugging inside node_moudles
          // with compy manager created moduels does not work..
          runtimeArgs: this.__vscodeLaunchRuntimeArgs,
        };
        if (serverChild.name !== clientProject.name) {
          let cwd = '${workspaceFolder}' + `/../ ${serverChild.name}`;
          if (workspaceLevel) {
            cwd = '${workspaceFolder}' + `/${serverChild.name}`;
          }
          startServerTemplate.program = cwd + '/run.js';
          startServerTemplate.cwd = cwd;
        }
        if (
          serverChild.location === clientProject.location &&
          serverChild.framework.isStandaloneProject
        ) {
          // startServerTemplate.name = `${startServerTemplate.name} Standalone`
        } else {
          startServerTemplate.name = `${startServerTemplate.name} '${serverChild.name}' for '${clientProject.name}'`;
        }
        startServerTemplate.args.push(
          `--ENVoverride=${encodeURIComponent(
            JSON.stringify(
              {
                clientProjectName: clientProject.name,
              } as Models.EnvConfig,
              null,
              4,
            ),
          )} `,
        );
        return startServerTemplate;
      };
      //#endregion

      //#region tempalte start nodemon nodejs server
      // const startNodemonServer = () => {
      //   const result = {
      //     'type': 'node',
      //     'request': 'launch',
      //     'remoteRoot': '${workspaceRoot}',
      //     'localRoot': '${workspaceRoot}',
      //     'name': 'Launch Nodemon server',
      //     'runtimeExecutable': 'nodemon',
      //     'program': '${workspaceFolder}/run.js',
      //     'restart': true,
      //     'sourceMaps': true,
      //     'console': 'internalConsole',
      //     'internalConsoleOptions': 'neverOpen',
      //     runtimeArgs: this.__vscodeLaunchRuntimeArgs
      //   };
      //   return result;
      // }
      //#endregion

      //#region  tempalte start ng serve

      // /**
      //  * @deprecated
      //  */
      // const startNgServeTemplate = (servePort: number, workspaceChild: Project, workspaceLevel: boolean) => {
      //   const result = {
      //     'name': 'Debugger with ng serve',
      //     'type': 'chrome',
      //     'request': 'launch',
      //     cwd: void 0,
      //     // "userDataDir": false,
      //     'preLaunchTask': 'Ng Serve',
      //     'postDebugTask': 'terminateall',
      //     'sourceMaps': true,
      //     // "url": `http://localhost:${!isNaN(servePort) ? servePort : 4200}/#`,
      //     'webRoot': '${workspaceFolder}',
      //     'sourceMapPathOverrides': {
      //       'webpack:/*': '${webRoot}/*',
      //       '/./*': '${webRoot}/*',
      //       '/tmp-src/*': '${webRoot}/*',
      //       '/*': '*',
      //       '/./~/*': '${webRoot}/node_modules/*'
      //     }
      //   }
      //   if (workspaceChild) {
      //     result.cwd = '${workspaceFolder}' + `/${workspaceChild.name}`;
      //     result.webRoot = '${workspaceFolder}' + `/${workspaceChild.name}`;
      //     result.name = `${result.name} for ${workspaceChild.name}`
      //   }
      //   if (workspaceLevel) {
      //     result.preLaunchTask = `${result.preLaunchTask} for ${workspaceChild.name}`;
      //   }
      //   return result;
      // };
      //#endregion

      //#region electron
      const startElectronServeTemplate = (remoteDebugElectronPort: number) => {
        return {
          name: `${DEBUG_WORD} Electron`,
          type: 'node',
          request: 'launch',
          protocol: 'inspector',
          cwd: '${workspaceFolder}',
          runtimeExecutable: '${workspaceFolder}/node_modules/.bin/electron',
          trace: 'verbose',
          runtimeArgs: [
            '--serve',
            '.',
            `--remote-debugging-port=${remoteDebugElectronPort}`, // 9876
          ],
          windows: {
            runtimeExecutable:
              '${workspaceFolder}/node_modules/.bin/electron.cmd',
          },
        };
      };
      //#endregion

      //#region handle standalone or worksapce child
      if (this.project.typeIs('isomorphic-lib')) {
        configurations = [
          // startNodemonServer()
        ];
        if (this.project.framework.isStandaloneProject) {
          configurations.push(
            templateForServer(this.project, this.project, false),
          );
          // configurations.push(startNgServeTemplate(9000, void 0, false));
          configurations.push(
            startElectronServeTemplate(
              PortUtils.instance(basePort).calculatePortForElectronDebugging(
                this.project,
              ),
            ),
          );
          compounds.push({
            name: `${DEBUG_WORD} (Server + Electron)`,
            configurations: [...configurations.map(c => c.name)],
          });
          configurations.push(temlateAttachProcess);
        }
      }
      //#endregion

      const launchJSOnFilePath = path.join(
        this.project.location,
        '.vscode/launch.json',
      );

      Helpers.writeJson(launchJSOnFilePath, {
        version: '0.2.0',
        configurations,
        compounds,
      });
      //#endregion
    }
    //#endregion
  }
  //#endregion

  //#region vscode launch.json runtime args
  get __vscodeLaunchRuntimeArgs() {
    //#region @backendFunc
    return [
      '--nolazy',
      '-r',
      'ts-node/register',
      // needs to be for debugging from node_modules
      '--preserve-symlinks',
      // "--preserve-symlinks-main",NOT WORKING
      '--experimental-worker',
    ];
    //#endregion
  }
  //#endregion

  //#region open in vscode
  public __openInVscode() {
    //#region @backendFunc
    this.filesRecreatorCodeWorkspace();
    if (
      this.project.framework.isStandaloneProject ||
      this.project.framework.isUnknownNpmProject
    ) {
      this.project.run(`code ${this.project.location}`).sync();
    } else {
      const isomorphicServers: Project[] = this.project.children.filter(c =>
        c.typeIs('isomorphic-lib'),
      );

      this.project.run(`code ${this.project.location}`).sync();
      isomorphicServers.forEach(s => {
        s.run(`code ${s.location}`).sync();
      });
    }
    //#endregion
  }
  //#endregion

  //#region recreate settings worksapce
  filesRecreatorCodeWorkspace() {
    //#region @backendFunc
    const configSettings = {};

    try {
      const settings = json5.parse(
        Helpers.readFile(
          path.join(this.project.location, '.vscode', 'settings.json'),
        ),
      );
      // console.log(settings)
      Object.keys(settings)
        .filter(key => {
          const isWorkbenchKey = key.startsWith('workbench');
          // console.log(`${key} ${start}`)
          return isWorkbenchKey;
        })
        .forEach(key => {
          configSettings[key] = settings[key];
        });
    } catch (err) {
      // console.log(err)
    }

    const packaedDistChildrensFolder = path.join(
      this.project.location,
      config.folder.dist,
    );
    if (!fse.existsSync(packaedDistChildrensFolder)) {
      Helpers.mkdirp(packaedDistChildrensFolder);
    }
    configSettings['terminal.integrated.cwd'] = '${workspaceFolder}';

    const codeworkspacefilepath = path.join(
      this.project.location,
      `tmp.code-workspace`,
    );
    Helpers.removeFileIfExists(codeworkspacefilepath);
    // fse.writeJSONSync(codeworkspacefilepath, codeWorkspace, {
    //   encoding: 'utf8',
    //   spaces: 2
    // });
    //#endregion
  }
  //#endregion

  //#region get default out files for debugging
  get defaultOutFilesLaunchJson() {
    return ['${workspaceFolder}/dist/**/*.js', '!**/node_modules/**'];
  }
  //#endregion

  //#region get out files for debugging
  /**
   * for debugging node_modules
   * get out files for debugging
   */
  get outFilesArgs() {
    //#region @backendFunc
    return !this.project.framework.isStandaloneProject
      ? void 0
      : [
          ...this.defaultOutFilesLaunchJson,
          // TODO this allow debugging thir party modules.. but it is not reliable
          // ...Helpers.uniqArray(
          //   this.allIsomorphicPackagesFromMemory
          //     .map(packageName => {
          //       const p = this.pathFor([
          //         config.folder.node_modules,
          //         packageName,
          //         config.folder.source,
          //       ]);
          //       return Helpers.isExistedSymlink(p)
          //         ? `${crossPlatformPath(fse.realpathSync(p))}/../dist/**/*.js`
          //         : void 0;
          //     })
          //     .filter(f => !!f),
          // ),
        ];
    //#endregion
  }
  //#endregion

  //#region vscode *.filetemplate
  get __vscodeFileTemplates() {
    //#region @backendFunc
    if (this.project.framework.frameworkVersionAtLeast('v2')) {
      return [
        // '.vscode/tasks.json.filetemplate',
      ];
    }
    return [];
    //#endregion
  }
  //#endregion
}
