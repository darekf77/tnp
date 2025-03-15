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
  readonly project: Project;

  //#endregion

  //#region constructor
  constructor(project: Project) {
    // @ts-ignore TODO weird inheritance problem
    super(project);
  }
  //#endregion

  //#region display release process menu
  public async displayReleaseProcessMenu(): Promise<void> {
    //#region @backendFunc
    while (true) {
      UtilsTerminal.clearConsole();
      //#region info
      console.info(`
        ${chalk.bold.yellow('Manual release')} => for everything whats Taon supports
        - everything is done here manually, you have to provide options
        - from here you can save release options for ${chalk.bold.green('Taon Cloud')} release

        ${chalk.bold.green('Cloud release')} => trigger remote release action on server (local or remote)
        - trigger release base on config stored inside cloud
        - use local Taon Cloud or login to remote Taon Cloud

        ${chalk.bold.gray('Local release')} => use current git repo for storing release data
        - for anything that you want to backup inside your git repository

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

      const manual = 'manual' as ReleaseType;
      const cloud = 'cloud' as ReleaseType;
      const local = 'local' as ReleaseType;

      // const { actionResult } =
      await UtilsTerminal.selectActionAndExecute(
        {
          [manual]: {
            //#region manual
            name: `${this.getColoredTextItem(manual)} release`,
            action: async () => {
              const selectedProjects =
                await this.project.releaseProcess.displayProjectsSelectionMenu();
              const releaseArtifactsTaon =
                await this.displaySelectArtifactsMenu(manual, selectedProjects);
              await this.releaseArtifacts(
                manual,
                releaseArtifactsTaon,
                selectedProjects,
              );
            },
            //#endregion
          },
          [cloud]: {
            //#region cloud
            name: `${this.getColoredTextItem(cloud)} release`,
            action: async () => {
              const selectedProjects =
                await this.project.releaseProcess.displayProjectsSelectionMenu();
              const releaseArtifactsTaon =
                await this.displaySelectArtifactsMenu(cloud, selectedProjects);
              await this.releaseArtifacts(
                cloud,
                releaseArtifactsTaon,
                selectedProjects,
              );
            },
            //#endregion
          },
          [local]: {
            //#region local
            name: `${this.getColoredTextItem(local)} release`,
            action: async () => {
              const selectedProjects =
                await this.project.releaseProcess.displayProjectsSelectionMenu();
              const releaseArtifactsTaon =
                await this.displaySelectArtifactsMenu(local, selectedProjects);
              await this.releaseArtifacts(
                local,
                releaseArtifactsTaon,
                selectedProjects,
              );
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
      break; // TODO do I need a loop here
    }
    //#endregion
  }
  //#endregion

  //#region display projects selection menu
  async displayProjectsSelectionMenu(): Promise<Project[]> {
    //#region @backendFunc
    const selectedProjects: Project[] = [this.project];
    if (this.project.framework.isStandaloneProject) {
      return selectedProjects;
    }
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
        selectedProjects.unshift(...this.project.children);
        return selectedProjects;
      }

      const selectedLocations = await UtilsTerminal.multiselect({
        choices,
        question: `Select projects to release in ${this.project.genericName} container ?`,
      });
      if (selectedLocations.length > 0) {
        selectedProjects.unshift(
          ...selectedLocations.map(location => this.project.ins.From(location)),
        );
        return selectedProjects;
      }
    }
    //#endregion
  }
  //#endregion

  //#region display artifacts menu
  public async displaySelectArtifactsMenu(
    releaseType: ReleaseType,
    selectedProjects: Project[],
  ): Promise<ReleaseArtifactTaon[]> {
    //#region @backendFunc

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
                ? `container's ${selectedProjects.length} projects`
                : 'standalone project'
            } ?`,
        },
      );
      if (!selected || selected.length === 0) {
        continue;
      }
      return selected;
    }

    //#endregion
  }
  //#endregion

  //#region public methods / start release
  // @ts-ignore TODO weird inheritance problem
  async startRelease(options?: ReleaseOptions): Promise<void> {
    //#region @backendFunc
    await this.project.artifactsManager.release(options);
    //#endregion
  }
  //#endregion

  //#region private methods / release artifacts for each project
  async releaseArtifacts(
    releaseType: ReleaseType,
    releaseArtifactsTaon: ReleaseArtifactTaon[],
    selectedProjects: Project[],
  ): Promise<void> {
    //#region @backend
    for (const project of selectedProjects) {
      for (const targetArtifact of releaseArtifactsTaon) {
        await project.releaseProcess.startRelease(
          ReleaseOptions.from({
            targetArtifact,
            releaseType,
          }),
        );
      }
    }
    await this.pushReleaseCommits();
    //#endregion
  }
  //#endregion

  //#region private methods / push container release commit
  /**
   * does not matter if container is releasing standalone
   * or organization packages -> release commit is pushed
   */
  async pushReleaseCommits() {
    //#region @backend
    return void 0; // TODO implement
    //#endregion
  }
  //#endregion

  private getReleaseHeader(releaseProcessType: ReleaseType) {
    //#region @backendFunc
    // if (this.project.framework.isContainer) {
    //   return (
    //     `
    //       ${this.getColoredTextItem(releaseProcessType)}` +
    //     ` release of ${this.selectedProjects.length} ` +
    //     `projects inside ${chalk.bold(this.project.genericName)}
    //       `
    //   );
    // }
    // return (
    //   `
    //         ${this.getColoredTextItem(releaseProcessType)}` +
    //   ` release of ${chalk.bold(this.project.genericName)}
    //         `
    // );
    //#endregion
  }

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
}
