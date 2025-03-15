//#region imports
import { config } from 'tnp-config/src';
import { chalk, fse, json5, path, _ } from 'tnp-core/src';
import { Utils } from 'tnp-core/src';
import { BaseVscodeHelpers, Helpers } from 'tnp-helpers/src';

import {
  DEBUG_WORD,
  PortUtils,
  taonConfigSchemaJsonStandalone,
  taonConfigSchemaJsonContainer,
} from '../../constants';
import { Models } from '../../models';
import { InitingPartialProcess } from '../../options';

import type { Project } from './project';
//#endregion

/**
 * Handle taon things related to vscode
 * support for launch.json, settings.json etc
 */ // @ts-ignore TODO weird inheritance problem
export class Vscode // @ts-ignore TODO weird inheritance problem
  extends BaseVscodeHelpers<Project>
  implements InitingPartialProcess
{
  project: Project;

  async init(): Promise<void> {
    this.recreateJsonSchemas();
    this.project.vsCodeHelpers.recreateExtensions();
    this.project.vsCodeHelpers.recreateWindowTitle();
    this.project.vsCodeHelpers.saveLaunchJson();
    this.project.vsCodeHelpers.saveTasksJson();
  }

  //#region recreate jsonc schema
  recreateJsonSchemas(): void {
    this.recreateJsonSchemaForDocs();
    this.recreateJsonSchemaForTaon();
  }
  //#endregion

  //#region recreate jsonc schema for docs
  public recreateJsonSchemaForDocs(): void {
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
  public recreateJsonSchemaForTaon(): void {
    //#region @backendFunc
    let currentSchemas: {
      fileMatch: string[];
      url: string;
    }[] =
      this.project.getValueFromJSONC(this.settingsJson, `['json.schemas']`) ||
      [];

    const toDeleteIndex = currentSchemas
      .filter(
        (x, i) => x =>
          (_.first(x.fileMatch) as string)?.startsWith(
            `/${config.file.taon_jsonc}`,
          ),
      )
      .map((_, i) => i);

    for (const index of toDeleteIndex) {
      currentSchemas.splice(index, 1);
    }

    if (this.project.framework.isStandaloneProject) {
      const properSchema = {
        fileMatch: [`/${config.file.taon_jsonc}`],
        url: `./${taonConfigSchemaJsonStandalone}`,
      };

      // TODO @LAST filter schemas
      // currentSchemas = Utils.uniqArray(currentSchemas,'fileMatch');

      const existedIndex = currentSchemas.findIndex(
        x => _.first(x.fileMatch) === _.first(properSchema.fileMatch),
      );
      if (existedIndex !== -1) {
        currentSchemas[existedIndex] = properSchema;
      } else {
        currentSchemas.push(properSchema);
      }
      this.project.removeFile(taonConfigSchemaJsonContainer);
    }

    if (this.project.framework.isContainer) {
      const properSchema = {
        fileMatch: [`/${config.file.taon_jsonc}`],
        url: `./${taonConfigSchemaJsonContainer}`,
      };
      const existedIndex = currentSchemas.findIndex(
        x => _.first(x.fileMatch) === _.first(properSchema.fileMatch),
      );
      if (existedIndex !== -1) {
        currentSchemas[existedIndex] = properSchema;
      } else {
        currentSchemas.push(properSchema);
      }
      this.project.removeFile(taonConfigSchemaJsonStandalone);
    }

    this.project.removeFile('taon-config.schema.json'); // QUICK_FIX

    this.project.setValueToJSONC(
      this.settingsJson,
      '["json.schemas"]',
      currentSchemas,
    );
    //#endregion
  }
  //#endregion

  get vscodeTempProjFolderName() {
    return `tmp-vscode-proj`;
  }

  private get vscodePluginDevPreLaunchTask() {
    //#region vscode update package.json
    return {
      label: 'Update package.json vscode metadata',
      type: 'shell',
      command:
        `cd ${this.project.artifactsManager.artifact.vscodePlugin
          .getTmpVscodeProjPath()
          .replace(this.project.location + '/', '')}` +
        ` && node --no-deprecation ${
          this.project.artifactsManager.artifact.vscodePlugin
            .vcodeProjectUpdatePackageJsonFilename
        } ` +
        `${this.project.artifactsManager.artifact.vscodePlugin.appVscodeJsName.replace(
          '.js',
          '',
        )}`,
      presentation: {
        reveal: 'always',
        panel: 'shared',
      },
      problemMatcher: [
        {
          owner: 'custom',
          pattern: [
            {
              regexp: '^(.*)$',
              file: 1,
              line: 1,
              column: 1,
              message: 1,
            },
          ],
          background: {
            activeOnStart: true,
            beginsPattern: 'Update package.json vscode plugin metadata...',
            endsPattern: 'Done update package.json',
          },
        },
      ],
      group: {
        kind: 'build',
        isDefault: true,
      },
    };
  }

  public saveTasksJson(): void {
    //#region @backendFunc

    //#endregion

    this.project.writeJson('.vscode/tasks.json', {
      version: '2.0.0',
      tasks: [this.vscodePluginDevPreLaunchTask],
    });
    //#endregion
  }

  //#region save launch.json
  public saveLaunchJson(basePort: number = 4100): void {
    //#region @backendFunc
    if (!this.project.framework.isStandaloneProject) {
      return;
    }
    //#region standalone save

    let configurations = [];
    let compounds: { name: string; configurations: any[] }[] = [];

    //#region template vscode config
    const vscodeProjDevPath =
      `${this.vscodeTempProjFolderName}` + `/development/${this.project.name}`;
    const templatesVscodeExConfig = [
      {
        name: 'Debug/Start Vscode Plugin',
        type: 'extensionHost',
        request: 'launch',
        runtimeExecutable: '${execPath}',
        "sourceMaps": true,
        "resolveSourceMapLocations": [
          "${workspaceFolder}/**",
          "!**/node_modules/**"
        ],
        args: [
          `--extensionDevelopmentPath=\${workspaceFolder}/${vscodeProjDevPath}`,
        ],

        outFiles: [`\${workspaceFolder}/${vscodeProjDevPath}/out/**/*.js`],
        preLaunchTask: this.vscodePluginDevPreLaunchTask.label,
      },
      // {
      //   name: 'Extension Tests',
      //   type: 'extensionHost',
      //   request: 'launch',
      //   runtimeExecutable: '${execPath}',
      //   args: [
      //     '--extensionDevelopmentPath=${workspaceFolder}',
      //     '--extensionTestsPath=${workspaceFolder}/out/test',
      //   ],
      //   outFiles: ['${workspaceFolder}/out/test/**/*.js'],
      //   preLaunchTask: 'npm: watch',
      // },
    ];
    //#endregion

    //#region template attach process
    const templateAttachProcess = {
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

    configurations = [
      // startNodemonServer()
    ];

    configurations.push(templateForServer(this.project, this.project, false));
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
    configurations.push(templateAttachProcess);

    configurations.push(...templatesVscodeExConfig);

    //#endregion

    this.project.writeJson('.vscode/launch.json', {
      version: '0.2.0',
      configurations,
      compounds,
    });
    //#endregion

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
      return [];
    }
    return [];
    //#endregion
  }
  //#endregion
}
