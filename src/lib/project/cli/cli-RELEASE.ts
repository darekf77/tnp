import { config } from 'tnp-config/src';
import { CoreModels, _, UtilsTerminal, path, chalk } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { Models } from '../../models';
import { BuildOptions, ReleaseOptions } from '../../options';
import type { Project } from '../abstract/project';

// @ts-ignore TODO weird inheritance problem
class $Release extends BaseCommandLineFeature<ReleaseOptions, Project> {
  //#region __initialize__
  __initialize__() {
    //#region resolve smart containter
    let resolved = [];
    if (this.project.framework.isContainer) {
      resolved = Helpers.cliTool.resolveItemsFromArgsBegin<Project>(
        this.args,
        a => {
          return this.project.ins.From(path.join(this.project.location, a));
        },
      )?.allResolved;

      const otherDeps = this.project.children.filter(c => {
        return !resolved.includes(c);
      });

      resolved = this.project.ins // @ts-ignore
        .sortGroupOfProject<Project>(
          [...resolved, ...otherDeps],
          proj => proj.taonJson.dependenciesNamesForNpmLib,
          proj => proj.name,
        )
        .filter(d => d.name !== this.project.name);
    }
    this.params = ReleaseOptions.from({ ...this.params, resolved });
    //#endregion
  }
  //#endregion

  //#region _
  public async _() {
    // await this.project.releaseProcess.displayReleaseProcessMenu();
    await this.patch();
    this._exit();
  }
  //#endregion

  //#region old release functions

  //#region install:locally
  async installLocally() {
    if (
      !this.project.hasFolder('out') ||
      Helpers.filesFrom(this.project.pathFor('out'), true).length === 0
    ) {
      Helpers.info('Building project...');
      await this.project.build(BuildOptions.from({ watch: false }));
    }
    await this.project.artifactsManager.artifact.vscodeExtensionPLugin.installLocally(
      this.params,
    );
    this._exit();
  }

  async clearInstallLocally() {
    await this.project.artifactsManager.artifact.npmLibAndCliTool.clearPartial();
    await this.installLocally();
  }
  //#endregion

  //#region automatic release
  async auto() {
    await this._startLibCliReleaseProcess('patch', true);
  }
  //#endregion

  //#region major
  async major() {
    await this._startLibCliReleaseProcess('major');
  }
  //#endregion

  //#region minor
  async minor() {
    await this._startLibCliReleaseProcess('minor');
  }
  //#endregion

  //#region patch
  async patch() {
    await this._startLibCliReleaseProcess('patch');
  }
  //#endregion

  //#region start
  // TODO move this to release process separate class
  private async _startLibCliReleaseProcess(
    npmReleaseVersionType: CoreModels.ReleaseVersionType = 'patch',
    automaticRelease: boolean = false,
  ) {
    Helpers.clearConsole();
    // const taonReleaseVersionType = await this.chooseTaonReleaseVersionType();

    const releaseOptions = ReleaseOptions.from({
      ...this.params,
      releaseVersionBumpType: npmReleaseVersionType,
      automaticRelease,
      skipProjectProcess: true,
      finishCallback: () => {
        this._exit();
      },
    });
    releaseOptions.specifiedVersion =
      this.args.find(
        k => k.startsWith('v') && Number(k.replace('v', '')) >= 3,
      ) || '';
    releaseOptions.shouldReleaseLibrary = await this.shouldReleaseLibMessage(
      releaseOptions,
      this.project,
    );
    await this.project.release(releaseOptions);
    this._exit();
  }
  //#endregion

  //#region should release lib
  async shouldReleaseLibMessage(
    releaseOptions: ReleaseOptions,
    project: Project,
  ) {
    //#region @backendFunc
    if (releaseOptions.automaticReleaseDocs) {
      return false;
    }
    let newVersion;
    if (releaseOptions.releaseVersionBumpType === 'major') {
      newVersion =
        project.packageJson.versionWithMajorPlusOneAndMinorZeroAndPatchZero;
    } else if (releaseOptions.releaseVersionBumpType === 'minor') {
      newVersion = project.packageJson.versionWithMinorPlusOneAndPatchZero;
    } else if (releaseOptions.releaseVersionBumpType === 'patch') {
      newVersion = project.packageJson.versionWithPatchPlusOne;
    }

    // TODO detecting changes for children when start container

    if (project.framework.isSmartContainer) {
      Helpers.info(`Pacakges available for new version release:

${project.children
  .map(c => ` - @${project.name}/${c.name} v${newVersion}`)
  .join('\n')}
`);
      const message = 'Proceed with lib release ?';

      return await Helpers.questionYesNo(message);
    }

    if (project.framework.isContainer && !project.framework.isSmartContainer) {
      Helpers.info(`Pacakges available for new version release:

    ${(releaseOptions.resolved || [])
      .map(
        (c, index) =>
          `(${index + 1}) ` +
          `${
            c.framework.isSmartContainer
              ? '@' + c.name + `/(${c.children.map(l => l.name).join(',')})`
              : c.name
          }` +
          `@${c.packageJson.getVersionFor(releaseOptions.releaseVersionBumpType)}`,
      )
      .join(', ')}
    `);
      const message = `Proceed ${
        releaseOptions.automaticRelease ? '(automatic)' : ''
      } release of packages from ${project.genericName} ?`;
      if (!(await Helpers.questionYesNo(message))) {
        this._exit();
      }
      return true;
    } else {
      const message = `Proceed with release of new version: ${newVersion} ?`;
      return releaseOptions.automaticRelease
        ? true
        : await Helpers.questionYesNo(message);
    }
    //#endregion
  }
  //#endregion

  //#endregion
}

export default {
  $Release: Helpers.CLIWRAP($Release, '$Release'),
};
