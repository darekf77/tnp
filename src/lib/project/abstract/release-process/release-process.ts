//#region imports
import { config } from 'tnp-config/src';
import {
  chalk,
  CoreModels,
  UtilsTerminal,
  _,
  crossPlatformPath,
  path,
} from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseReleaseProcess } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import {
  ReleaseArtifactTaon,
  ReleaseArtifactTaonNamesArr,
  ReleaseOptions,
  ReleaseType,
} from '../../../options';
import type { Project } from '../project';
//#endregion

/**
 * manage standalone or container release process
 */ // @ts-ignore TODO weird inheritance problem
export class ReleaseProcess extends BaseReleaseProcess<Project> {
  //#region fields & getters
  project: Project;

  releaseArtifactName: any;

  /**
   * when standalone only one project is selected
   * when container multiple projects can be selected (all or some)
   * container itself is also a project but:
   *  - only has release commits
   *  - keeps version for organization packages
   */
  protected readonly selectedProjects: Project[] = [this.project];
  protected readonly releaseArtifactsTaon: ReleaseArtifactTaon[] = [];
  //#endregion

  //#region constructor
  constructor(project: Project) {
    // @ts-ignore TODO weird inheritance problem
    super(project);
  }
  //#endregion

  //#region display release process menu
  public async displayReleaseProcessMenu() {
    //#region @backend
    while (true) {
      UtilsTerminal.clearConsole();
      //#region info
      console.info(`
        ${chalk.bold.yellow('Manual release')} => for everything whats Taon supports (npm, docker, git, etc)
        - everything is done here manually, you have to provide options
        - from here you can save release options for ${chalk.bold.green('Taon Cloud')} release

        ${chalk.bold.green('Cloud release')} => trigger remote release action on server (local or remote)
        - trigger release base on config stored inside cloud
        - use local Taon Cloud or login to remote Taon Cloud

        ${chalk.bold.gray('Local release')} => use current git repo for storing release data
        - for cli tools, electron apps, vscode extensions
          ( if you need a backup them inside your git repository )

        `);
      //#endregion

      if (
        this.project.framework.isContainer &&
        this.project.children.length === 0
      ) {
        console.info(
          `No projects to release inside ${chalk.bold(this.project.genericName)} container`,
        );
        await UtilsTerminal.pressAnyKeyToContinueAsync({
          message: 'Press any key to exit...',
        });
        return;
      }

      const { actionResult } = await UtilsTerminal.selectActionAndExecute(
        {
          ['manual' as ReleaseType]: {
            //#region manual
            name: `${this.getColoredTextItem('manual')} release`,
            action: async () => {
              // this.project.artifactsManager.release(ReleaseOptions.from({
              //   releaseType: 'manual
              // })})
              // const releaseProcess = new ReleaseProcessManual(
              //   this.project,
              //   'manual',
              // );
              // return await releaseProcess.displayArtifactsMenu();
            },
            //#endregion
          },
          ['cloud' as ReleaseType]: {
            //#region cloud
            name: `${this.getColoredTextItem('cloud')} release`,
            action: async () => {
              //TODO
              await UtilsTerminal.pressAnyKeyToContinueAsync({
                message: 'NOT IMPLEMENTED YET.. Press any key to go back...',
              });
              return;

              // const { ReleaseProcessCloud } = await import(
              //   './release-process-cloud'
              // );
              // const releaseProcess = new ReleaseProcessCloud(
              //   this.project,
              //   'cloud',
              // );
              // return await releaseProcess.displayArtifactsMenu();
            },
            //#endregion
          },
          ['local' as ReleaseType]: {
            //#region local
            name: `${this.getColoredTextItem('local')} release`,
            action: async () => {
              // const { ReleaseProcessLocal } = await import(
              //   './release-process-local'
              // );
              // const releaseProcess = new ReleaseProcessLocal(
              //   this.project,
              //   'local',
              // );
              // return await releaseProcess.displayArtifactsMenu();
            },
            //#endregion
          },
        },
        {
          autocomplete: false,
          question:
            `Select release type for this ` +
            `${this.project.framework.isContainer ? 'container' : 'standalone'} project ?`,
        },
      );
      // if (actionResult === 'break') {
      //   return;
      // }
    }
    //#endregion
  }
  //#endregion

  //#region display projects selection menu
  async displayProjectsSelectionMenu() {
    //#region @backend
    while (true) {
      UtilsTerminal.clearConsole();
      // console.info(this.getReleaseHeader()); TODO UNCOMMET
      const choices = this.project.children.map(c => {
        return {
          name: c.genericName,
          value: c.location,
        };
      });

      const selectAll = await UtilsTerminal.confirm({
        message: `Use all ${this.project.children.length} children projects in release process ?`,
      });

      if (selectAll) {
        this.selectedProjects.unshift(...this.project.children);
        return;
      }

      const selectedLocations = await UtilsTerminal.multiselect({
        choices,
        question: `Select projects to release in ${this.project.genericName} container ?`,
      });
      if (selectedLocations.length > 0) {
        this.selectedProjects.unshift(
          ...selectedLocations.map(location => this.project.ins.From(location)),
        );
        return;
      }
    }
    //#endregion
  }
  //#endregion

  //#region display artifacts menu
  async displayArtifactsMenu() {
    //#region @backend
    if (this.project.framework.isContainer) {
      await this.displayProjectsSelectionMenu();
    }
    while (true) {
      UtilsTerminal.clearConsole();
      // console.info(this.getReleaseHeader('')); // TODO UNCOMMET
      const choices = ReleaseArtifactTaonNamesArr.reduce((acc, curr) => {
        return _.merge(acc, {
          [curr]: {
            name: `${_.upperFirst(_.startCase(curr))} release`,
          },
        });
      }, {}) as {
        [key in ReleaseArtifactTaon]: { name: string };
      };

      const { selected } = await UtilsTerminal.multiselectActionAndExecute(
        choices,
        {
          autocomplete: false,
          question:
            `Select release artifacts for this ` +
            `${
              this.project.framework.isContainer
                ? `container's ${this.selectedProjects.length} projects`
                : 'standalone project'
            } ?`,
        },
      );
      if (!selected || selected.length === 0) {
        return;
      }
      this.releaseArtifactsTaon.push(...selected);
      break;
    }
    await this.releaseArtifacts();
    //#endregion
  }
  //#endregion

  //#region public methods / start release
  // startRelease(options?: Partial<BaseReleaseProcess<Project>>): Promise<void> {
  //   // new ArtifactRelease(this.project);
  //   return void 0; // TODO implement
  //   // TOOD @LAST
  // }
  //#endregion

  //#region private methods / release artifacts for each project
  async releaseArtifacts() {
    //#region @backend
    // for (const project of this.selectedProjects) {
    //   for (const releaseArtifact of this.releaseArtifactsTaon) {
    //     await this.startRelease({
    //       project,
    //       releaseArtifactName: releaseArtifact,
    //     });
    //   }
    // }
    // await this.pushContainerReleaseCommit();
    //#endregion
  }
  //#endregion

  //#region private methods / push container release commit
  /**
   * does not matter if container is releasing standalone
   * or organization packages -> release commit is pushed
   */
  private async pushContainerReleaseCommit() {
    //#region @backend
    return void 0; // TODO implement
    //#endregion
  }
  //#endregion

  //#region private methods / get release header
  private getReleaseHeader(releaseProcessType: ReleaseType): string {
    if (this.project.framework.isContainer) {
      return (
        `

          ${this.getColoredTextItem(releaseProcessType)}` +
        ` release of ${this.selectedProjects.length} ` +
        `projects inside ${chalk.bold(this.project.genericName)}

          `
      );
    }
    return (
      `

            ${this.getColoredTextItem(releaseProcessType)}` +
      ` release of ${chalk.bold(this.project.genericName)}

            `
    );
  }
  //#endregion

  //#region private methods / get colored text item
  private getColoredTextItem(releaseProcessType: ReleaseType): string {
    //#region @backendFunc
    if (releaseProcessType === 'manual') {
      return _.upperFirst(chalk.bold.yellow('Manual'));
    }
    if (releaseProcessType === 'cloud') {
      return _.upperFirst(chalk.bold.green('Cloud'));
    }
    if (releaseProcessType === 'local') {
      return _.upperFirst(chalk.bold.gray('Local'));
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / release project path
  get __releaseCiProjectPath() {
    //#region @backendFunc
    const absolutePathReleaseProject = this.project.pathFor([
      config.folder.tmpDistRelease,
      config.folder.dist,
      'project',
      this.project.name,
    ]);
    return absolutePathReleaseProject;
    //#endregion
  }
  //#endregion

  //#region getters & methods / release project
  get releaseCiProject() {
    //#region @backendFunc
    return this.project.ins.From(this.__releaseCiProjectPath);
    //#endregion
  }
  //#endregion

  //#region getters & methods / get release ci project parent
  get __releaseCiProjectParent() {
    const __releaseCiProjectParentPath = this.__releaseCiProjectParentPath;
    const proj = this.project.ins.From(__releaseCiProjectParentPath);
    return proj;
  }
  //#endregion

  //#region getters & methods / get release ci project parent path
  get __releaseCiProjectParentPath() {
    return this.isInCiReleaseProject &&
      (this.project.framework.isStandaloneProject ||
        this.project.framework.isSmartContainer)
      ? path.resolve(
          path.join(
            this.project.location,
            '..', // project
            '..', // dist
            '..', // tmp-dist-release
            '..', // location of base proj
          ),
        )
      : void 0;
  }
  //#endregion

  //#region update standalone project before publishing
  updateStanaloneProjectBeforePublishing(
    project: Project,
    realCurrentProj: Project,
    specificProjectForBuild: Project,
  ): void {
    //#region @backendFunc
    if (project.framework.isStandaloneProject) {
      const distForPublishPath = crossPlatformPath([
        specificProjectForBuild.location,
        project.framework.__getTempProjName('dist'),
        config.folder.node_modules,
        project.name,
      ]);

      Helpers.remove(`${distForPublishPath}/app*`); // QUICK_FIX
      Helpers.remove(`${distForPublishPath}/tests*`); // QUICK_FIX
      Helpers.remove(`${distForPublishPath}/src`, true); // QUICK_FIX
      Helpers.writeFile(
        crossPlatformPath([distForPublishPath, 'src.d.ts']),
        `
// THIS FILE IS GENERATED
export * from './lib';
// THIS FILE IS GENERATED
// please use command: taon build:watch to see here links for your globally builded lib code files
// THIS FILE IS GENERATED
      `.trimStart(),
      );

      const pjPath = crossPlatformPath([
        distForPublishPath,
        config.file.package_json,
      ]);

      const pj = Helpers.readJson(pjPath) as PackageJson;
      if (realCurrentProj.name === 'tnp') {
        pj.devDependencies = {};
        pj.dependencies = {}; // tnp is not going to be use in any other project
      } else {
        pj.devDependencies = {};
      }
      Helpers.removeFileIfExists(pjPath);
      Helpers.writeJson(pjPath, pj); // QUICK_FIX
    }
    //#endregion
  }
  //#endregion

  //#region update container project before publishing
  updateContainerProjectBeforePublishing(
    project: Project,
    realCurrentProj: Project,
    specificProjectForBuild: Project,
  ) {
    //#region @backendFunc
    if (project.framework.isSmartContainer) {
      const base = path.join(
        specificProjectForBuild.location,
        specificProjectForBuild.framework.__getTempProjName('dist'),
        config.folder.node_modules,
        `@${realCurrentProj.name}`,
      );

      for (const child of realCurrentProj.children) {
        const distReleaseForPublishPath = crossPlatformPath([base, child.name]);
        // console.log({
        //   distReleaseForPublishPath
        // })
        Helpers.remove(`${distReleaseForPublishPath}/src`, true); // QUICK_FIX
        Helpers.writeFile(
          crossPlatformPath([distReleaseForPublishPath, 'src.d.ts']),
          `
  // THIS FILE IS GENERATED
  export * from './index';
  // THIS FILE IS GENERATED
  // please use command: taon build:watch to see here links for your globally builded lib code files
  // THIS FILE IS GENERATED
        `.trimStart(),
        );
      }
    }
    //#endregion
  }
  //#endregion

  //#region is in release dist
  public get isInCiReleaseProject(): boolean {
    //#region @backendFunc
    return this.project.location.includes(
      crossPlatformPath([
        config.folder.tmpDistRelease,
        config.folder.dist,
        'project',
      ]),
    );
    //#endregion
  }
  //#endregion
}
