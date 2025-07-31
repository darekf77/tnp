//#region imports
import { config } from 'tnp-config/src';
import { chalk, fse, json5, path, _, os } from 'tnp-core/src';
import { Utils } from 'tnp-core/src';
import { crossPlatformPath } from 'tnp-core/src';
import { BaseVscodeHelpers, Helpers, UtilsVSCode } from 'tnp-helpers/src';

import {
  DEBUG_WORD,
  taonConfigSchemaJsonStandalone,
  taonConfigSchemaJsonContainer,
  THIS_IS_GENERATED_INFO_COMMENT,
  tmpVscodeProj,
  DEFAULT_PORT,
} from '../../constants';
import { Models } from '../../models';
import { Development, EnvOptions } from '../../options';

import type { Project } from './project';
//#endregion

/**
 * Handle taon things related to vscode
 * support for launch.json, settings.json etc
 */
export class Vscode // @ts-ignore TODO weird inheritance problem
  extends BaseVscodeHelpers<Project>
{
  async init(): Promise<void> {
    this.recreateExtensions();
    await this.saveLaunchJson();
    this.saveTasksJson();

    // modyfing settings.json
    this.recreateJsonSchemaForDocs();
    this.recreateJsonSchemaForTaon();
    this.recreateWindowTitle({ save: false });
    this.saveColorsForWindow();
    this.saveCurrentSettings();
  }

  saveCurrentSettings(): void {
    //#region @backendFunc
    // TODO QUCIK_FIX for asar that can be deleted because of vscode watcher
    this.currentSettingsValue['files.watcherExclude'] = {
      'local_release/**': true,
    };

    super.saveCurrentSettings();
    //#endregion
  }

  private saveColorsForWindow(checkingParent: boolean = false): void {
    //#region @backendFunc

    const parentIsOrg = this.project.parent?.taonJson.isOrganization;
    if (parentIsOrg) {
      this.project.parent.vsCodeHelpers.saveColorsForWindow(true);
    }
    const parentSettings =
      parentIsOrg && this.project.parent.vsCodeHelpers.currentSettingsValue;

    if (_.isNil(this.currentSettingsValue['workbench.colorCustomizations'])) {
      this.currentSettingsValue['workbench.colorCustomizations'] = {
        'activityBar.background': `${UtilsVSCode.generateFancyColor()}`,
      };
    }
    this.currentSettingsValue['workbench.colorCustomizations'][
      'statusBar.background'
    ] = `${
      parentIsOrg
        ? parentSettings['workbench.colorCustomizations'][
            'statusBar.background'
          ]
        : this.currentSettingsValue['workbench.colorCustomizations'][
            'statusBar.background'
          ] || UtilsVSCode.generateFancyColor()
    }`;

    this.currentSettingsValue['workbench.colorCustomizations'][
      'statusBar.debuggingBackground'
    ] = `#15d8ff`; // nice blue for debugging

    //#endregion
  }

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
    }[] = _.get(this.currentSettingsValue, `['json.schemas']`) || [];

    const toDeleteIndex = currentSchemas
      .filter(
        (x, i) => x =>
          (_.first(x.fileMatch) as string)?.startsWith(
            `/${this.project.artifactsManager.artifact.docsWebapp.docs.docsConfigJsonFileName}`,
          ),
      )
      .map((_, i) => i);

    for (const index of toDeleteIndex) {
      currentSchemas.splice(index, 1);
    }

    currentSchemas.push(properSchema);

    _.set(this.currentSettingsValue, '["json.schemas"]', currentSchemas);
    //#endregion
  }
  //#endregion

  //#region recreate jsonc schema for taon
  public recreateJsonSchemaForTaon(): void {
    //#region @backendFunc
    let currentSchemas: {
      fileMatch: string[];
      url: string;
    }[] = _.get(this.currentSettingsValue, `['json.schemas']`) || [];

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

      currentSchemas.push(properSchema);

      if (!this.project.framework.isCoreProject) {
        this.project.removeFile(taonConfigSchemaJsonContainer);
      }
    } else if (this.project.framework.isContainer) {
      const properSchema = {
        fileMatch: [`/${config.file.taon_jsonc}`],
        url: `./${taonConfigSchemaJsonContainer}`,
      };

      currentSchemas.push(properSchema);

      if (!this.project.framework.isCoreProject) {
        this.project.removeFile(taonConfigSchemaJsonStandalone);
      }
    }

    this.project.removeFile('taon-config.schema.json'); // QUICK_FIX

    _.set(this.currentSettingsValue, '["json.schemas"]', currentSchemas);
    //#endregion
  }
  //#endregion

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
  public async saveLaunchJson(): Promise<void> {
    //#region @backendFunc
    if (!this.project.framework.isStandaloneProject) {
      return;
    }
    //#region standalone save

    let configurations = [];
    let compounds: { name: string; configurations: any[] }[] = [];

    //#region template vscode config
    const vscodeProjDevPath =
      `${tmpVscodeProj}` + `/${Development}/${this.project.name}`;
    const templatesVscodeExConfig = [
      {
        name: 'Debug/Start Vscode Plugin',
        type: 'extensionHost',
        request: 'launch',
        runtimeExecutable: '${execPath}',
        sourceMaps: true,
        resolveSourceMapLocations: [
          '${workspaceFolder}/**',
          '!**/node_modules/**',
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
    const templateAttachProcess = (
      debuggingPort: number = DEFAULT_PORT.DEBUGGING_CLI_TOOL,
    ) => ({
      type: 'node',
      request: 'attach',
      name: 'Attach to global cli tool',
      autoAttachChildProcesses: false, // TODO probably no need for now
      port: debuggingPort,
      skipFiles: ['<node_internals>/**'],
      outFiles: this.outFiles,
      sourceMapPathOverrides: this.sourceMapPathOverrides,
    });
    //#endregion

    //#region tempalte start normal nodejs server
    const templateForServer = (
      serverChild: Project,
      clientProject: Project,
      workspaceLevel: boolean,
    ) => {
      // const backendPort = 4000;

      const startServerTemplate = {
        type: 'node',
        request: 'launch',
        name: `${DEBUG_WORD} Server`,
        program: '${workspaceFolder}/run.js',
        cwd: void 0,
        args: [
          // `port=${backendPort}`
        ],
        outFiles: this.outFiles,
        sourceMapPathOverrides: this.sourceMapPathOverrides,
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
      // startServerTemplate.args.push(
      //   `--ENVoverride=${encodeURIComponent(
      //     JSON.stringify(
      //       {
      //         clientProjectName: clientProject.name,
      //       } as Partial<EnvOptions>,
      //       null,
      //       4,
      //     ),
      //   )} `,
      // );
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
    // const key =;
    const portForElectronDebugging = await this.project.registerAndAssignPort(
      `electron debugging port`,
      {
        startFrom: 9876,
      },
    );
    configurations.push(startElectronServeTemplate(portForElectronDebugging));
    // compounds.push({
    //   name: `${DEBUG_WORD} (Server + Electron)`,
    //   configurations: [...configurations.map(c => c.name)],
    // });

    const portForCliDebugging = await this.project.registerAndAssignPort(
      `cli debugging port`,
      {
        startFrom: 9229,
      },
    );

    configurations.push(templateAttachProcess(portForCliDebugging));

    configurations.push(...templatesVscodeExConfig);

    //#endregion

    this.project.writeJson('.vscode/launch.json', {
      version: '0.2.0',
      configurations,
      compounds,
    });

    configurations.forEach(c => {
      // c.outFiles = ['${workspaceFolder}/dist/**/*.js', '!**/node_modules/**'];
      delete c.outFiles;
      delete c.sourceMapPathOverrides;
      if (c.name === `${DEBUG_WORD} Electron`) {
        c.runtimeArgs[2] = `--remote-debugging-port=${DEFAULT_PORT.DEBUGGING_ELECTRON}`; // 9876
      }
      if (c.request === 'attach') {
        c.port = DEFAULT_PORT.DEBUGGING_CLI_TOOL;
      }
    });

    this.project.writeFile(
      '.vscode/launch-backup.jsonc',
      `${THIS_IS_GENERATED_INFO_COMMENT}\n` +
        `${JSON.stringify(
          {
            version: '0.2.0',
            configurations,
            compounds,
          },
          null,
          2,
        )}` +
        `\n${THIS_IS_GENERATED_INFO_COMMENT}`,
    );
    //#endregion

    //#endregion
  }
  //#endregion

  //#region vscode launch.json runtime args
  get __vscodeLaunchRuntimeArgs() {
    //#region @backendFunc
    return [
      // '--nolazy',
      // '-r',
      // 'ts-node/register',
      // // needs to be for debugging from node_modules
      '--preserve-symlinks',
      // // "--preserve-symlinks-main",NOT WORKING
      // '--experimental-worker',
    ];
    //#endregion
  }
  //#endregion

  //#region open in vscode
  public openInVscode(): void {
    //#region @backendFunc
    this.project.run(`code ${this.project.location}`).sync();
    //#endregion
  }
  //#endregion

  //#region get out files for debugging
  /**
   * for debugging node_modules
   * get out files for debugging
   */
  get outFiles() {
    //#region @backendFunc
    return [
      '${workspaceFolder}/dist/**/*.js',
      // '!**/node_modules/**',
      // TODO this allow debugging thir party modules.. but it is not reliable
      ...Helpers.uniqArray(
        this.project.packagesRecognition.allIsomorphicPackagesFromMemory
          .filter(f => this.project.name !== f) // TODO or other names of this project
          .map(packageName => {
            const p = this.project.pathFor([
              config.folder.node_modules,
              packageName,
              config.folder.source,
            ]);
            return Helpers.isExistedSymlink(p)
              ? `${crossPlatformPath(path.dirname(fse.realpathSync(p)))}/dist/**/*.js`
              : void 0;
          })
          .filter(f => !!f),
      ),
    ];
    //#endregion
  }

  get sourceMapPathOverrides() {
    //#region @backendFunc
    const sourceMapPathOverrides = {};
    Helpers.uniqArray(
      this.project.packagesRecognition.allIsomorphicPackagesFromMemory,
    )
      .filter(f => this.project.name !== f) // TODO or other names of this project
      .forEach(packageName => {
        const p = this.project.pathFor([
          config.folder.node_modules,
          packageName,
          config.folder.source,
        ]);
        if (!Helpers.isExistedSymlink(p)) {
          return;
        }
        const realPathToPackage = crossPlatformPath(
          path.dirname(fse.realpathSync(p)),
        );
        sourceMapPathOverrides[`${realPathToPackage}/src/lib/*`] =
          `\${workspaceFolder}/node_modules/${packageName}/source/lib/*`;
      });

    return sourceMapPathOverrides;
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
