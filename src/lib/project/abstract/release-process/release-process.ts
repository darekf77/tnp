//#region imports
import { config } from 'tnp-core/src';
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

import { ALLOWED_TO_RELEASE, environments } from '../../../constants';
import {
  ReleaseArtifactTaon,
  ReleaseArtifactTaonNamesArr,
  EnvOptions,
  ReleaseType,
} from '../../../options';
import type { Project } from '../project';

// import { ReleaseConfig } from './release-config';
//#endregion

/**
 * manage standalone or container release process
 */ // @ts-ignore TODO weird inheritance problem
export class ReleaseProcess extends BaseReleaseProcess<Project> {
  // config = new ReleaseConfig(this.project);

  //#region constructor
  constructor(project: Project) {
    super(project);
  }
  //#endregion

  //#region display release process menu
  public async displayReleaseProcessMenu(
    envOptions: EnvOptions,
  ): Promise<void> {
    //#region @backendFunc
    while (true) {
      UtilsTerminal.clearConsole();

      //#region return if not projects
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
      //#endregion

      const manual = 'manual' as ReleaseType;
      const cloud = 'cloud' as ReleaseType;
      const local = 'local' as ReleaseType;
      const staticPages = 'static-pages' as ReleaseType;
      const priovider =
        _.upperFirst(_.first(this.project.git.remoteProvider?.split('.'))) ||
        'unknow';

      // const { actionResult } =
      await UtilsTerminal.selectActionAndExecute(
        {
          readInfo: {
            name: 'READ INFO ABOUT RELEASE TYPES',
            action: async () => {
              UtilsTerminal.clearConsole();
              //#region info
              console.info(
                `
${chalk.bold.green('Manual release')} => for everything whats Taon supports
        - everything is done here manually, you have to provide options
        - config saved during release process can be use for 'Cloud release' later
${chalk.bold.blue('Cloud release')} => trigger remote release action on server (local or remote)
        - trigger release base on config stored inside cloud
        - use local Taon Cloud or login to remote Taon Cloud
${chalk.bold.gray('Local release')} => use current git repo for storing release data
        - for anything that you want to backup inside your git repository
${chalk.bold.yellow('Static Pages release')} => use specific branch for storing release data
        - perfect for github pages, gitlab pages and similar solutions
        `.trimStart(),
              );
              //#endregion
              await UtilsTerminal.pressAnyKeyToContinueAsync({});
            },
          },
          [manual]: {
            //#region manual
            name: `${this.getColoredTextItem(manual)} Taon release + create config for Cloud`,
            action: async () => {
              if (await this.releaseByType(manual, envOptions)) {
                process.exit(0);
              }
            },
            //#endregion
          },
          [cloud]: {
            //#region cloud
            name: `${this.getColoredTextItem(cloud)} release tirgger for Taon Cloud`,
            action: async () => {
              if (await this.releaseByType(cloud, envOptions)) {
                process.exit(0);
              }
            },
            //#endregion
          },
          [local]: {
            //#region local
            name: `${this.getColoredTextItem(local)} release to current git repository`,
            action: async () => {
              if (await this.releaseByType(local, envOptions)) {
                process.exit(0);
              }
            },
            //#endregion
          },
          [staticPages]: {
            //#region local
            name: `${this.getColoredTextItem(staticPages)} release for ${priovider} pages`,
            action: async () => {
              if (await this.releaseByType(staticPages, envOptions)) {
                process.exit(0);
              }
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
    }
    //#endregion
  }
  //#endregion

  //#region release by type
  async releaseByType(
    releaseType: ReleaseType,
    envOptions: EnvOptions,
  ): Promise<boolean> {
    //#region @backendFunc

    envOptions.release.releaseType = releaseType;

    const selectedProjects =
      await this.project.releaseProcess.displayProjectsSelectionMenu(
        envOptions,
      );

    const releaseArtifactsTaon = await this.displaySelectArtifactsMenu(
      envOptions,
      selectedProjects,
      ALLOWED_TO_RELEASE[releaseType] as ReleaseArtifactTaon[],
    );

    if (releaseArtifactsTaon.length > 0) {
      if (!envOptions.release.releaseVersionBumpType) {
        if (envOptions.release.autoReleaseUsingConfig) {
          envOptions.release.releaseVersionBumpType = 'patch';
        } else {
          envOptions.release.releaseVersionBumpType =
            await this.selectReleaseType(
              bumpType =>
                this.project.packageJson.resolvePossibleNewVersion(bumpType),
              {
                quesitonPrefixMessage: `${envOptions.release.releaseType}-release`,
              },
            );
        }
      }
    } else {
      Helpers.warn(`No release artifacts selected for release process`);
      await UtilsTerminal.pressAnyKeyToContinueAsync();
      return false;
    }

    return await this.releaseArtifacts(
      releaseType,
      releaseArtifactsTaon,
      selectedProjects,
      envOptions,
    );
    //#endregion
  }
  //#endregion

  //#region get environment names by artifact
  public getEnvNamesByArtifact(artifact: ReleaseArtifactTaon): {
    envName: CoreModels.EnvironmentNameTaon;
    envNumber?: number | undefined;
  }[] {
    //#region @backendFunc
    if (!artifact) {
      throw new Error('Artifact is required');
    }
    const pathToEnvFolder = this.project.pathFor([environments, artifact]);
    const files = Helpers.filesFrom(pathToEnvFolder);

    return files
      .map(f => path.basename(f))
      .filter(f => f.startsWith('env.') && f.endsWith('.ts'))
      .map(f => {
        const env = f.replace(`env.${artifact}.`, '').replace('.ts', '');
        const envRemovedNumbers = env.replace(/\d/g, '');
        const envNumber = parseInt(env.replace(envRemovedNumbers, ''));
        return {
          envName: envRemovedNumbers as CoreModels.EnvironmentNameTaon,
          envNumber: !isNaN(envNumber) ? envNumber : undefined,
        };
      })
      .sort((a, b) => {
        if (a.envNumber && b.envNumber) {
          return a.envNumber - b.envNumber;
        }
        if (a.envName === '__') {
          return -1;
        }
        if (b.envName === '__') {
          return 1;
        }
        return 0;
      });
    //#endregion
  }
  //#endregion

  //#region display projects selection menu
  async displayProjectsSelectionMenu(
    envOptions: EnvOptions,
  ): Promise<Project[]> {
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
    envOptions: EnvOptions,
    selectedProjects: Project[],
    allowedArtifacts?: ReleaseArtifactTaon[] | undefined,
  ): Promise<ReleaseArtifactTaon[]> {
    //#region @backendFunc

    while (true) {
      UtilsTerminal.clearConsole();
      // console.info(this.getReleaseHeader('')); // TODO UNCOMMET
      const choices = ReleaseArtifactTaonNamesArr.filter(f => {
        // if (Array.isArray(allowedArtifacts)) {
        //   return allowedArtifacts.includes(f as ReleaseArtifactTaon);
        // }
        return true;
      }).reduce((acc, curr) => {
        return _.merge(acc, {
          [curr]: {
            name: `${_.upperFirst(_.startCase(curr))} release`,
            disabled:
              Array.isArray(allowedArtifacts) &&
              !allowedArtifacts.includes(curr as ReleaseArtifactTaon),
          },
        });
      }, {}) as {
        [key in ReleaseArtifactTaon]: { name: string; disabled: boolean };
      };

      const allDisabled = Object.values(choices).every(c => c.disabled);

      if (allDisabled) {
        if (!envOptions.release.autoReleaseUsingConfig) {
          Helpers.warn(`No release artifacts available for this release type`);
        }
        return [];
      }

      const { selected } = await UtilsTerminal.multiselectActionAndExecute(
        choices,
        {
          autocomplete: false,
          question:
            `[${envOptions.release.releaseType}-release] Select release artifacts for this ` +
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
  async startRelease(envOptions?: EnvOptions): Promise<void> {
    //#region @backendFunc
    if (!envOptions.release.envName) {
      if (!envOptions.release.autoReleaseUsingConfig) {
        const environments = this.getEnvNamesByArtifact(
          envOptions.release.targetArtifact,
        );
        let selected: ReturnType<typeof this.getEnvNamesByArtifact>[number];
        Helpers.info(
          `Release environment for ${chalk.bold(envOptions.release.targetArtifact)}`,
        );
        if (environments.length == 0) {
          this.project.environmentConfig.createForArtifact(
            envOptions.release.targetArtifact,
          );
          selected = {
            envName: '__',
          };
        } else if (environments.length === 1) {
          selected = environments[0];
        } else {
          const selectedEnv = await UtilsTerminal.select({
            choices: environments.map(e => {
              return {
                name: e.envName === '__' ? '__ ( default )' : e.envName,
                value: e.envName,
              };
            }),
            question: `[${envOptions?.release.releaseType}-release] Select environment`,
            autocomplete: true,
          });
          selected = environments.find(e => e.envName === selectedEnv);
        }

        envOptions.release.envName = selected.envName;
        envOptions.release.envNumber = selected.envNumber;
      }
    }

    await this.project.release(envOptions);
    //#endregion
  }
  //#endregion

  //#region private methods / release artifacts for each project

  /**
   * return true if everything went ok
   */
  async releaseArtifacts(
    releaseType: ReleaseType,
    releaseArtifactsTaon: ReleaseArtifactTaon[],
    selectedProjects: Project[],
    envOptions: EnvOptions,
  ): Promise<boolean> {
    //#region @backendFunc

    for (const project of selectedProjects) {
      for (const targetArtifact of releaseArtifactsTaon) {
        await project.releaseProcess.startRelease(
          EnvOptions.from({
            ...envOptions,
            release: {
              ...envOptions.release,
              targetArtifact,
              releaseType,
            },
          }),
        );
      }
    }
    await this.pushReleaseCommits();
    return true;
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

  //#region private methods / get release header
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
  //#endregion

  //#region private methods / get colored text item
  private getColoredTextItem(releaseProcessType: ReleaseType): string {
    //#region @backendFunc
    if (releaseProcessType === 'manual') {
      return _.upperFirst(chalk.bold.green('Manual'));
    }
    if (releaseProcessType === 'cloud') {
      return _.upperFirst(chalk.bold.blue('Cloud'));
    }
    if (releaseProcessType === 'local') {
      return _.upperFirst(chalk.bold.gray('Local'));
    }
    if (releaseProcessType === 'static-pages') {
      return _.upperFirst(chalk.bold.yellow('Static Pages'));
    }
    //#endregion
  }
  //#endregion
}
