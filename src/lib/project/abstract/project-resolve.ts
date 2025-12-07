//#region imports
import { config, urlRepoTaonContainers } from 'tnp-core/src';
import { LibTypeArr } from 'tnp-core/src';
import {
  child_process,
  fse,
  os,
  requiredForDev,
  UtilsCliClassMethod,
} from 'tnp-core/src';
import { _, crossPlatformPath, path, CoreModels } from 'tnp-core/src';
import { CLI, UtilsOs } from 'tnp-core/src';
import { Helpers, BaseProjectResolver } from 'tnp-helpers/src';

import { CURRENT_PACKAGE_VERSION } from '../../build-info._auto-generated_';
import {
  DEFAULT_FRAMEWORK_VERSION,
  SKIP_CORE_CHECK_PARAM,
  taonRepoPathUserInUserDir,
} from '../../constants';
// import { $Global } from '../cli/cli-_GLOBAL_';

import type { Project } from './project';
import { TaonProjectsWorker } from './taon-worker/taon.worker';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class TaonProjectResolve extends BaseProjectResolver<Project> {
  taonProjectsWorker: TaonProjectsWorker;

  private hasResolveCoreDepsAndFolder = false;

  //#region constructor
  constructor(
    protected classFn: typeof Project,
    public cliToolName: string,
  ) {
    super(classFn, cliToolName);

    // if (!this.cliToolName) {
    //   Helpers.throw(`cliToolName is not provided`);
    // }
    if (UtilsOs.isRunningInVscodeExtension()) {
      //#region @backend
      config.frameworkName =
        config.frameworkName ||
        (config.frameworkNames.productionFrameworkName as any);

      const taonContinaers = Helpers.foldersFrom(
        [
          UtilsOs.getRealHomeDir(),
          `.${config.frameworkNames.productionFrameworkName}`,
          'taon-containers',
        ],
        { recursive: false },
      )
        .map(c => this.From(c))
        .filter(c => c?.typeIs('container'))
        .sort((a, b) => {
          const numA =
            Number(
              a.name
                ?.replace('container', '')
                .replace('-', '')
                .replace('v', ''),
            ) || 0;
          const numB =
            Number(
              b.name
                ?.replace('container', '')
                .replace('-', '')
                .replace('v', ''),
            ) || 0;
          return numB - numA; // highest numbers first
        });
      const firstContainer = _.first(taonContinaers);
      config.dirnameForTnp =
        firstContainer?.pathFor('node_modules/tnp') || config.dirnameForTnp;
      //#endregion
    }

    // TODO $Global not available here
    // const commandStartWorker = `${cliToolName} ${UtilsCliClassMethod.getFrom(
    //   $Global.prototype.startCliServiceTaonProjectsWorker,
    //   { globalMethod: true, argsToParse: { skipCoreCheck: true } },
    // )}`;

    // const commandStartWorker = `${cliToolName} ${
    //   'startCliServiceTaonProjectsWorker ${SKIP_CORE_CHECK_PARAM}'
    //   // as keyof $Global
    // }`;

    this.taonProjectsWorker = new TaonProjectsWorker(
      'taon-projects',
      `${cliToolName} ${
        `startCliServiceTaonProjectsWorker ${SKIP_CORE_CHECK_PARAM}`
        // as keyof $Global
      }`,
      this,
    );
  }
  //#endregion

  //#region methods / type from
  typeFrom(location: string): CoreModels.LibType {
    //#region @backendFunc
    location = crossPlatformPath(location);
    if (!fse.existsSync(location)) {
      return void 0;
    }

    const taonJson = Helpers.readJsonC([location, config.file.taon_jsonc]);
    if (!_.isObject(taonJson) || !taonJson.type) {
      return Helpers.exists([location, config.file.package_json])
        ? 'unknown-npm-project'
        : 'unknown';
    }
    const type = taonJson.type;
    return type;
    //#endregion
  }
  //#endregion

  //#region methods / from
  /**
   * TODO use base resolve
   */
  From(locationOfProj: string | string[]): Project {
    //#region @backendFunc
    if (Array.isArray(locationOfProj)) {
      locationOfProj = locationOfProj.join('/');
    }
    if (!locationOfProj) {
      return;
    }
    let location = locationOfProj.replace(/\/\//g, '/');

    if (!_.isString(location)) {
      Helpers.warn(`[project.from] location is not a string`);
      return;
    }
    if (path.basename(location) === 'dist') {
      location = path.dirname(location);
    }
    location = crossPlatformPath(path.resolve(location));
    if (this.emptyLocations.includes(location)) {
      if (location.search(`/${config.folder.dist}`) === -1) {
        Helpers.log(`[project.from] empty location ${location}`, 2);
        return;
      }
    }

    const alreadyExist = this.projects.find(
      l => l.location.trim() === location.trim(),
    );
    if (alreadyExist) {
      return alreadyExist as any;
    }
    if (!fse.existsSync(location)) {
      Helpers.log(
        `[taon/project][project.from] Cannot find project in location: ${location}`,
        1,
      );
      this.emptyLocations.push(location);
      return;
    }

    let type = this.typeFrom(location);

    // console.log(`type ${type} for location ${location}`);

    let resultProject: Project;
    if (type === 'isomorphic-lib') {
      resultProject = new this.classFn(location);
    }
    if (type === 'container') {
      resultProject = new this.classFn(location);
    }
    if (type === 'unknown-npm-project') {
      resultProject = new this.classFn(location);
    }

    return resultProject as any;
    //#endregion
  }
  //#endregion

  //#region methods / nearest to
  nearestTo<T = Project>(
    absoluteLocation: string,
    options?: {
      type?: CoreModels.LibType;
      findGitRoot?: boolean;
      onlyOutSideNodeModules?: boolean;
    },
  ): T {
    //#region @backendFunc

    options = options || {};
    const { type, findGitRoot, onlyOutSideNodeModules } = options;

    if (_.isString(type) && !LibTypeArr.includes(type)) {
      Helpers.error(
        `[taon/project][project.nearestTo] wrong type: ${type}`,
        false,
        true,
      );
    }
    if (fse.existsSync(absoluteLocation)) {
      absoluteLocation = fse.realpathSync(absoluteLocation);
    }
    if (
      fse.existsSync(absoluteLocation) &&
      !fse.lstatSync(absoluteLocation).isDirectory()
    ) {
      absoluteLocation = path.dirname(absoluteLocation);
    }

    let project: Project;
    let previousLocation: string;
    while (true) {
      if (
        onlyOutSideNodeModules &&
        path.basename(path.dirname(absoluteLocation)) === 'node_modules'
      ) {
        absoluteLocation = path.dirname(path.dirname(absoluteLocation));
      }
      project = this.From(absoluteLocation);
      if (_.isString(type)) {
        if (project?.typeIs(type)) {
          if (findGitRoot) {
            if (project.git.isGitRoot) {
              break;
            }
          } else {
            break;
          }
        }
      } else {
        if (project) {
          if (findGitRoot) {
            if (project.git.isGitRoot) {
              break;
            }
          } else {
            break;
          }
        }
      }

      previousLocation = absoluteLocation;
      const newAbsLocation = path.join(absoluteLocation, '..');
      if (!path.isAbsolute(newAbsLocation)) {
        return;
      }
      absoluteLocation = crossPlatformPath(path.resolve(newAbsLocation));
      if (
        !fse.existsSync(absoluteLocation) &&
        absoluteLocation.split('/').length < 2
      ) {
        return;
      }
      if (previousLocation === absoluteLocation) {
        return;
      }
    }
    return project as any;
    //#endregion
  }
  //#endregion

  //#region methods / tnp
  get Tnp(): Project {
    //#region @backendFunc
    let tnpProject = this.From(config.dirnameForTnp);
    Helpers.log(
      `Using ${config.frameworkName} path: ${config.dirnameForTnp}`,
      1,
    );
    if (!tnpProject && !global.globalSystemToolMode) {
      Helpers.error(
        `Not able to find tnp project in "${config.dirnameForTnp}".`,
      );
    }
    return tnpProject;
    //#endregion
  }
  //#endregion

  //#region by
  public by(
    libraryType: CoreModels.NewFactoryType,
    //#region @backend
    version: CoreModels.FrameworkVersion = DEFAULT_FRAMEWORK_VERSION,
    //#endregion
  ): Project {
    //#region @backendFunc

    // console.log({ libraryType, version });

    if (libraryType === 'container') {
      const pathToContainer = this.resolveCoreProjectsPathes(version).container;
      // console.log({ pathToContainer });
      const containerProject = this.From(pathToContainer);
      return containerProject as any;
    }
    if (libraryType !== 'isomorphic-lib') {
      return void 0;
    }

    const projectPath =
      this.resolveCoreProjectsPathes(version).projectByType(libraryType);

    // console.log({ projectPath });

    if (!fse.existsSync(projectPath)) {
      Helpers.error(
        `
    path: ${crossPlatformPath(projectPath)}
    config.dirnameForTnp: ${config.dirnameForTnp}

     [taon/project] Bad library type "${libraryType}" for this framework version "${version}"

     `,
        false,
        false,
      );
    }
    return this.From(projectPath);
    //#endregion
  }
  //#endregion

  //#region projects in user folder
  private get projectsInUserFolder() {
    //#region @backendFunc
    const projectsInUserFolder = crossPlatformPath([
      UtilsOs.getRealHomeDir(),
      `.${config.frameworkNames.productionFrameworkName}`,
      'taon-containers',
    ]);
    return projectsInUserFolder;
    //#endregion
  }
  //#endregion

  //#region sync core project
  /**
   * taon sync command
   */
  sync({ syncFromCommand }: { syncFromCommand?: boolean } = {}): void {
    //#region @backendFunc
    const cwd = taonRepoPathUserInUserDir;

    const oldTaonFolder = crossPlatformPath([
      path.dirname(taonRepoPathUserInUserDir),
      'taon',
    ]);

    if (Helpers.exists(oldTaonFolder)) {
      Helpers.taskStarted(`Removing old taon folder: ${oldTaonFolder}`);
      Helpers.removeSymlinks(oldTaonFolder);
      Helpers.remove(oldTaonFolder);
      Helpers.taskDone('Old taon folder removed');
    }

    Helpers.info(`Syncing... Fetching git data... `);
    CLI.installEnvironment(requiredForDev);

    //#region reset origin of taon repo
    try {
      // ! TODO this can cause error when (link is committed in git repo)
      // $ git clean -df or git reset --hard
      //warning: could not open directory 'projects/container-v18/isomorphic-lib
      // -v18/docs-config.schema.json/': Function not implemented
      // this may be temporary
      Helpers.run(`git reset --hard && git clean -df && git fetch`, {
        cwd,
        output: false,
      }).sync();
    } catch (error) {
      Helpers.error(
        `[${config.frameworkName} Not able to reset origin of taon repo: ${urlRepoTaonContainers} in: ${cwd}`,
        false,
        true,
      );
    }
    //#endregion

    //#region checkout master
    try {
      Helpers.run(`git checkout master`, { cwd, output: false }).sync();
      Helpers.log('DONE CHECKING OUT MASTER');
    } catch (error) {
      Helpers.log(error);
      Helpers.error(
        `[${config.frameworkName} Not able to checkout master branch for :${urlRepoTaonContainers} in: ${cwd}`,
        false,
        true,
      );
    }
    //#endregion

    //#region pull master with tags
    try {
      Helpers.git.meltActionCommits(cwd);
    } catch (error) {}
    try {
      Helpers.run(
        `git reset --hard HEAD~2 && git reset --hard && git clean -df && git pull --tags origin master`,
        { cwd, output: false },
      ).sync();
      Helpers.log('DONE PULLING MASTER');
    } catch (error) {
      Helpers.log(error);
      Helpers.error(
        `[${config.frameworkName} Not able to pull master branch for :` +
          `${urlRepoTaonContainers} in: ${crossPlatformPath(cwd)}`,
        false,
        true,
      );
    }
    try {
      Helpers.git.meltActionCommits(cwd);
    } catch (error) {}
    try {
      Helpers.run(`git reset --hard`, { cwd, output: false }).sync();
    } catch (error) {}
    //#endregion

    //#region checkout lastest tag
    // TODO remove ? taon-containers gonna be constantly update and
    // no need for checking out specific tag

    const tagToCheckout = this.taonTagToCheckoutForCurrentCliVersion(cwd);
    const currentBranch = Helpers.git.currentBranchName(cwd);

    Helpers.taskStarted(
      `Checking out latest tag ${tagToCheckout} for taon framework...`,
    );
    if (currentBranch !== tagToCheckout) {
      try {
        Helpers.run(
          `git reset --hard && git clean -df && git checkout ${tagToCheckout}`,
          { cwd },
        ).sync();
      } catch (error) {
        console.log(error);
        Helpers.warn(
          `[${config.frameworkName} ERROR Not able to checkout latest tag of taon framework: ${urlRepoTaonContainers} in: ${cwd}`,
          false,
        );
      }
    }
    //#endregion

    //#region pull latest tag
    try {
      Helpers.run(`git pull origin ${tagToCheckout}`, { cwd }).sync();
    } catch (error) {
      console.log(error);
      Helpers.warn(
        `[${config.frameworkName}] ERROR Not able to pull latest tag of taon framework: ${urlRepoTaonContainers} in: ${cwd}`,
        false,
      );
    }
    //#endregion

    //#region remove vscode folder
    try {
      Helpers.run('rimraf .vscode', { cwd }).sync();
    } catch (error) {}
    //#endregion

    if (syncFromCommand) {
      // const command =
      //   `${config.frameworkName} ` +
      //   `${UtilsCliClassMethod.getFrom(
      //     $Global.prototype.reinstallCoreContainers,
      //     { globalMethod: true, argsToParse: { skipCoreCheck: true } },
      //   )}`;
      // Helpers.run(command).sync();
      Helpers.run(
        // $Global.prototype.reinstallCoreContainers.name
        `${config.frameworkName} ${'reinstallCoreContainers'} ${SKIP_CORE_CHECK_PARAM}`,
      ).sync();
    }

    Helpers.success('taon framework synced ok');
    //#endregion
  }
  //#endregion

  //#region initial check
  public initialCheck() {
    //#region @backendFunc
    if (this.hasResolveCoreDepsAndFolder) {
      return;
    }
    const morhiVscode = crossPlatformPath([
      path.dirname(taonRepoPathUserInUserDir),
      'taon-projects/.vscode',
    ]);

    if (!fse.existsSync(taonRepoPathUserInUserDir) && !global.skipCoreCheck) {
      if (!fse.existsSync(path.dirname(taonRepoPathUserInUserDir))) {
        fse.mkdirpSync(path.dirname(taonRepoPathUserInUserDir));
      }

      CLI.installEnvironment(requiredForDev);

      // const commandEnvInstall = `${config.frameworkName} ${UtilsCliClassMethod.getFrom(
      //   $Global.prototype.ENV_INSTALL,
      //   {
      //     globalMethod: true,
      //     argsToParse: { skipCoreCheck: true },
      //   },
      // )}`;
      // child_process.execSync(commandEnvInstall, { stdio: [0, 1, 2] });
      try {
        child_process.execSync(
          //$Global.prototype.ENV_INSTALL.name
          `${config.frameworkName}  ${'ENV_INSTALL'} ${SKIP_CORE_CHECK_PARAM}`,
          { stdio: [0, 1, 2] },
        );
      } catch (error) {
        Helpers.error(
          `[${config.frameworkName}][config] Not able to install local global environment`,
          false,
          true,
        );
      }

      try {
        child_process.execSync(`git clone ${urlRepoTaonContainers}`, {
          cwd: path.dirname(taonRepoPathUserInUserDir),
          stdio: [0, 1, 2],
        });
        Helpers.remove(morhiVscode);
      } catch (error) {
        Helpers.error(
          `[${config.frameworkName}][config] Not able to clone repository: ${urlRepoTaonContainers} in:
       ${taonRepoPathUserInUserDir}`,
          false,
          true,
        );
      }

      this.sync();

      this.hasResolveCoreDepsAndFolder = true;
    }

    //#endregion
  }
  //#endregion

  //#region path resolved
  private pathResolved(...partOfPath: string[]) {
    //#region @backendFunc
    // console.log('pathResolved', partOfPath);

    if (
      (global['frameworkName'] &&
        global['frameworkName'] ===
          config.frameworkNames.productionFrameworkName) ||
      UtilsOs.isRunningInVscodeExtension()
    ) {
      const joined = partOfPath.join('/');

      let pathResult = joined.replace(
        config.dirnameForTnp + '/' + this.taonProjectsRelative,
        this.projectsInUserFolder,
      );

      pathResult = crossPlatformPath(path.resolve(pathResult));
      this.initialCheck();
      return pathResult;
    }
    return crossPlatformPath(path.resolve(path.join(...partOfPath)));
    //#endregion
  }
  //#endregion

  //#region resolve core projects paths
  private resolveCoreProjectsPathes(version?: CoreModels.FrameworkVersion) {
    //#region @backendFunc

    version = !version || version === 'v1' ? '' : (`-${version}` as any);
    if (version === 'v4') {
      Helpers.warn(
        `[taon/project] v4 is not supported anymore.. use v16 instead`,
      );
    }
    // console.log(({ dirnameForTnp: config.dirnameForTnp, taonProjectsRelative: this.taonProjectsRelative, version }));

    const coreContainerPath = this.pathResolved(
      config.dirnameForTnp,
      `${this.taonProjectsRelative}/container${version}`,
    );

    const result = {
      container: coreContainerPath,
      projectByType: (libType: CoreModels.NewFactoryType) => {
        const resultByType = this.pathResolved(
          config.dirnameForTnp,
          `${this.taonProjectsRelative}/container${version}/${libType}${version}`,
        );
        // console.log(`resultByType ${libType}`, resultByType);
        return resultByType;
      },
    };
    return result;
    //#endregion
  }
  //#endregion

  //#region taon relative projects paths
  /**
   * only for tnp dev mode cli
   */
  public get taonProjectsRelative(): string {
    return `../taon-containers`;
  }
  //#endregion

  //#region angular major version for current cli
  angularMajorVersionForCurrentCli(): number {
    //#region @backendFunc
    return Number(CURRENT_PACKAGE_VERSION.split('.')[0]);
    //#endregion
  }
  //#endregion

  //#region taon tag to checkout for current cli version
  taonTagToCheckoutForCurrentCliVersion(cwd: string): string {
    //#region @backendFunc
    const ngVer = this.angularMajorVersionForCurrentCli();
    const lastTagForVer = (
      this.From(cwd) as Project
    ).git.lastTagNameForMajorVersion(ngVer);
    return lastTagForVer;
    //#endregion
  }
  //#endregion
}
