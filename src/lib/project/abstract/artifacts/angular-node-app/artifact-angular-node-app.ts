//#region imports
import { config } from 'tnp-config/src';
import { crossPlatformPath, path, _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import {
  createSourceFile,
  isClassDeclaration,
  ScriptTarget,
  Node,
  forEachChild,
} from 'typescript';

import { DEFAULT_PORT, PortUtils } from '../../../../constants';
import {
  BuildOptions,
  ClearOptions,
  ReleaseOptions,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact } from '../__base__/base-artifact';

import { AssetsFileListGenerator } from './tools/assets-list-file-generator';
import { AssetsManager } from './tools/assets-manager';
import { AngularFeBasenameManager } from './tools/basename-manager';
import { GithubPagesAppBuildConfig } from './tools/docs-app-build-config';
import { MigrationHelper } from './tools/migrations-helper';
//#endregion

export class ArtifactAngularNodeApp extends BaseArtifact {
  //#region fields
  public readonly migrationHelper: MigrationHelper;
  public readonly angularFeBasenameManager: AngularFeBasenameManager;
  public readonly __assetsFileListGenerator: AssetsFileListGenerator;
  public readonly __docsAppBuild: GithubPagesAppBuildConfig;
  public readonly __assetsManager: AssetsManager;
  public projectInfoPort: number;
  public backendPort: number;
  public standaloneNormalAppPort: number;
  public standaloneWebsqlAppPort: number;

  //#endregion

  //#region constructor
  constructor(readonly project: Project) {
    super(project);
    this.migrationHelper = new MigrationHelper(project);
    this.angularFeBasenameManager = new AngularFeBasenameManager(project);
    this.__assetsFileListGenerator = new AssetsFileListGenerator(project);
    this.__docsAppBuild = new GithubPagesAppBuildConfig(project);
    this.__assetsManager = new AssetsManager(project);
  }
  //#endregion

  async initPartial(options): Promise<void> {

    this.fixAppTsFile();
  }

  async buildPartial(options): Promise<void> {
    return void 0; // TODO implement
  }

  async releasePartial(options): Promise<void> {
    return void 0; // TODO implement
  }

  async clearPartial(options: ClearOptions): Promise<void> {
    return void 0; // TODO implement
  }

  //#region fix missing components/modules
  fixAppTsFile(): string {
    //#region @backendFunc
    if (
      !this.project.framework.isStandaloneProject &&
      !this.project.framework.isSmartContainerChild &&
      !this.project.framework.isSmartContainer
    ) {
      return;
    }
    if (this.project.framework.isSmartContainer) {
      for (const child of this.project.children) {
        child.artifactsManager.artifact.angularNodeApp.fixAppTsFile();
      }
      return;
    }
    const relativeAppTs = crossPlatformPath([config.folder.src, 'app.ts']);
    const appFile = this.project.pathFor(relativeAppTs);
    if (Helpers.exists(appFile)) {
      let contentAppFile = Helpers.readFile(appFile);
      let newContentAppFile = this.replaceModuleAndComponentName(
        contentAppFile,
        this.project.name,
      );

      if (contentAppFile !== newContentAppFile) {
        Helpers.writeFile(appFile, newContentAppFile);
        try {
          this.project.formatFile(relativeAppTs);
        } catch (error) {}
      }
    }
    //#endregion
  }
  //#endregion

  //#region add missing components/modules
  private replaceModuleAndComponentName(
    tsFileContent: string,
    projectName: string,
  ) {
    //#region @backendFunc
    // Parse the source file using TypeScript API

    const sourceFile = createSourceFile(
      'temp.ts',
      tsFileContent,
      ScriptTarget.Latest,
      true,
    );

    let moduleName: string | null = null;
    let componentName: string | null = null;
    let tooMuchToProcess = false;

    const newComponentName = `${_.upperFirst(_.camelCase(projectName))}Component`;
    const newModuleName = `${_.upperFirst(_.camelCase(projectName))}Module`;
    let orignalComponentClassName: string;
    let orignalModuleClassName: string;

    // Visitor to analyze the AST
    const visit = (node: Node) => {
      if (isClassDeclaration(node) && node.name) {
        const className = node.name.text;

        if (className.endsWith('Module')) {
          if (moduleName) {
            // More than one module found, return original content
            tooMuchToProcess = true;
            return;
          }
          moduleName = className;
          orignalModuleClassName = className;
        }

        if (className.endsWith('Component')) {
          if (componentName) {
            // More than one component found, return original content
            tooMuchToProcess = true;
            return;
          }
          componentName = className;
          orignalComponentClassName = className;
        }
      }

      forEachChild(node, visit);
    };

    visit(sourceFile);

    if (tooMuchToProcess) {
      return tsFileContent;
    }

    const moduleTempalte =
      [`\n//#re`, `gion  ${this.project.name} module `].join('') +
      ['\n//#re', 'gion @bro', 'wser'].join('') +
      `\n@NgModule({ declarations: [${newComponentName}],` +
      ` imports: [CommonModule], exports: [${newComponentName}] })\n` +
      `export class ${newModuleName} {}` +
      ['\n//#endre', 'gion'].join('') +
      ['\n//#endre', 'gion'].join('');

    const componentTemplate =
      [`\n//#re`, `gion  ${this.project.name} component `].join('') +
      ['\n//#re', 'gion @bro', 'wser'].join('') +
      `\n@Component({ template: 'hello world fromr ${this.project.name}' })` +
      `\nexport class ${newComponentName} {}` +
      ['\n//#endre', 'gion'].join('') +
      ['\n//#endre', 'gion'].join('');

    if (orignalModuleClassName) {
      tsFileContent = tsFileContent.replace(
        new RegExp(orignalModuleClassName, 'g'),
        newModuleName,
      );
    }

    if (orignalComponentClassName) {
      tsFileContent = tsFileContent.replace(
        new RegExp(orignalComponentClassName, 'g'),
        newComponentName,
      );
    }

    if (moduleName === null && componentName === null) {
      // No module or component found, append new ones
      return (
        tsFileContent + '\n\n' + componentTemplate + '\n\n' + moduleTempalte
      );
    }

    if (moduleName === null && componentName !== null) {
      // append only module
      return tsFileContent + '\n\n' + moduleTempalte;
    }

    if (moduleName !== null && componentName === null) {
      // Either module or component is missing; leave content unchanged
      return tsFileContent + '\n\n' + componentTemplate;
    }

    return tsFileContent;
    //#endregion
  }
  //#endregion

  //#region getters & methods / build app
  async buildApp(buildOptions: BuildOptions): Promise<void> {
    //#region @backend

    //#region prepare variables

    //#region prepare variables / baseHref

    const isSmartContainerTarget =
      this.project.framework.isSmartContainerTarget;
    const isSmartContainerTargetNonClient =
      this.project.framework.isSmartContainerTargetNonClient;

    //#endregion

    //#region prepare variables / webpack params
    let webpackEnvParams = `--env.outFolder=${buildOptions.outDir}`;
    webpackEnvParams =
      webpackEnvParams + (buildOptions.watch ? ' --env.watch=true' : '');

    const backAppTmpFolders = `../../`;
    const backeFromRelease = `../../../../`;
    const backeFromContainerTarget = `../../../`;
    let back = backAppTmpFolders;
    if (this.project.releaseProcess.isInCiReleaseProject) {
      if (isSmartContainerTarget) {
        back = `${backAppTmpFolders}${backeFromContainerTarget}${backeFromRelease}`;
      } else {
        back = `${backAppTmpFolders}${backeFromRelease}`;
      }
    } else {
      if (isSmartContainerTarget) {
        back = `${backAppTmpFolders}${backeFromContainerTarget}`;
      }
    }

    let outDirApp = this.project.releaseProcess.isInCiReleaseProject
      ? config.folder.docs
      : `${buildOptions.outDir}-app${buildOptions.websql ? '-websql' : ''}`;
    if (isSmartContainerTargetNonClient) {
      outDirApp = `${outDirApp}/-/${this.project.name}`;
    }

    const outPutPathCommand = `--output-path ${back}${outDirApp} `;

    //#endregion

    //#region prepare variables / general variables

    let portAssignedToAppBuild: number = Number(buildOptions.port);

    if (!_.isNumber(portAssignedToAppBuild) || !portAssignedToAppBuild) {
      portAssignedToAppBuild = buildOptions.websql
        ? this.project.artifactsManager.artifact.angularNodeApp
            .standaloneWebsqlAppPort
        : this.project.artifactsManager.artifact.angularNodeApp
            .standaloneNormalAppPort;
    }

    if (!_.isNumber(portAssignedToAppBuild) || !portAssignedToAppBuild) {
      portAssignedToAppBuild = await this.project.registerAndAssignPort(
        `build ng app (${buildOptions.websql ? 'websql' : 'normal'})`,
        {
          startFrom: DEFAULT_PORT.APP_BUILD_LOCALHOST,
        },
      );
    }

    if (buildOptions.watch) {
      await Helpers.killProcessByPort(portAssignedToAppBuild);
    }

    const isStandalone =
      this.project.framework.isStandaloneProject && !isSmartContainerTarget;

    const buildOutDir = buildOptions.outDir;
    const parent = !isStandalone
      ? isSmartContainerTarget
        ? this.project.framework.smartContainerTargetParentContainer
        : this.project.parent
      : void 0;

    const additionalReplace = (line: string) => {
      const beforeModule2 = crossPlatformPath(
        path.join(
          buildOutDir,
          parent.name,
          this.project.name,
          `tmp-apps-for-${buildOutDir}/${this.project.name}`,
        ),
      );

      // console.log({ beforeModule2 })

      if (line.search(beforeModule2) !== -1) {
        line = line.replace(beforeModule2 + '/', '');
      }

      return line;
    };
    //#endregion

    //#region prepare variables / prepare angular command
    let angularBuildAppCmd: string;
    const portAssignedToAppBuildCommandPart = _.isNumber(portAssignedToAppBuild)
      ? `--port=${portAssignedToAppBuild}`
      : '';

    if (buildOptions.watch) {
      angularBuildAppCmd =
        `${this.NPM_RUN_NG_COMMAND} serve ${
          buildOptions.buildAngularAppForElectron ? 'angular-electron' : 'app'
        } ` +
        ` ${portAssignedToAppBuildCommandPart} ${
          buildOptions.prod ? '--prod' : ''
        }`;
    } else {
      angularBuildAppCmd =
        `${this.NPM_RUN_NG_COMMAND} build ${
          buildOptions.buildAngularAppForElectron ? 'angular-electron' : 'app'
        }` +
        `${buildOptions.prod ? '--configuration production' : ''} ` +
        `${buildOptions.watch ? '--watch' : ''}` +
        `${outPutPathCommand} `;
    }
    //#endregion

    const angularTempProj = this.globalHelper.__getProxyNgProj(buildOptions);

    //#region prepare variables / angular info
    const showInfoAngular = () => {
      Helpers.logInfo(`

  ANGULAR BUILD APP COMMAND: ${angularBuildAppCmd}

  inside: ${angularTempProj.location}

  `);
    };
    //#endregion

    //#endregion

    showInfoAngular();

    await angularTempProj.execute(angularBuildAppCmd, {
      similarProcessKey: 'ng',
      resolvePromiseMsg: {
        stdout: 'Compiled successfully',
      },
      //#region command execute params
      exitOnErrorCallback: async code => {
        if (buildOptions.buildForRelease) {
          throw 'Angular compilation lib error!!!asd';
        } else {
          Helpers.error(
            `[${config.frameworkName}] Typescript compilation error (code=${code})`,
            false,
            true,
          );
        }
      },
      outputLineReplace: (line: string) => {
        //#region replace outut line for better debugging
        if (isStandalone) {
          return line.replace(`src/app/${this.project.name}/`, `./src/`);
        } else {
          line = line.trim();

          if (line.search('src/app/') !== -1) {
            line = line.replace('src/app/', './src/app/');
            line = line.replace('././src/app/', './src/app/');
          }

          if (line.search(`src/app/${this.project.name}/libs/`) !== -1) {
            const [__, ___, ____, _____, ______, moduleName] = line.split('/');
            return additionalReplace(
              line.replace(
                `src/app/${this.project.name}/libs/${moduleName}/`,
                `${moduleName}/src/lib/`,
              ),
            );
          }

          if (line.search(`src/app/`) !== -1) {
            const [__, ___, ____, moduleName] = line.split('/');
            return additionalReplace(
              line.replace(`src/app/${moduleName}/`, `${moduleName}/src/`),
            );
          }
          return additionalReplace(line);
        }
        //#endregion
      },
      //#endregion
    });
    //#endregion
  }
  //#endregion

  //#region getters & methods / set project info port
  public __setProjectInfoPort(v): void {
    //#region @backend
    this.projectInfoPort = v;
    const children = this.project.children.filter(
      f => f.location !== this.project.location,
    );
    for (const child of children) {
      child.artifactsManager.artifact.angularNodeApp.__setProjectInfoPort(v);
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / write ports to file
  public writePortsToFile(): void {
    //#region @backend
    const appHostsFile = crossPlatformPath(
      path.join(this.project.location, config.folder.src, 'app.hosts.ts'),
    );

    Helpers.writeFile(
      appHostsFile,
      PortUtils.instance(this.projectInfoPort).appHostTemplateFor(this.project),
    );

    if (this.project.framework.isStandaloneProject) {
      this.project.writeFile(
        'BUILD-INFO.md',
        `
*This file is generated. This file is generated.*

# Project info

- Project name: ${this.project.genericName}
- project info host: http://localhost:${this.projectInfoPort}
- backend host: http://localhost:${this.backendPort}
- standalone normal app host: http://localhost:${this.standaloneNormalAppPort}
- standalone websql app host: http://localhost:${this.standaloneWebsqlAppPort}

*This file is generated. This file is generated.*
      `,
      );
    }

    //#endregion
  }
  //#endregion
}
