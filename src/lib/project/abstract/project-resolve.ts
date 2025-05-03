//#region imports
import { config } from 'tnp-config/src';
import { LibTypeArr } from 'tnp-config/src';
import { child_process, fse, os, requiredForDev } from 'tnp-core/src';
import { _, crossPlatformPath, path, CoreModels } from 'tnp-core/src';
import { CLI } from 'tnp-core/src';
import { Helpers, BaseProjectResolver } from 'tnp-helpers/src';

import {
  DEFAULT_FRAMEWORK_VERSION,
  taonRepoPathUserInUserDir,
} from '../../constants';

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

    this.taonProjectsWorker = new TaonProjectsWorker(
      'taon-projects',
      `${cliToolName} ${
        'startCliServiceTaonProjectsWorker --skipCoreCheck'
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

    if (libraryType === 'container') {
      const pathToContainer = this.resolveCoreProjectsPathes(version).container;
      const containerProject = this.From(pathToContainer);
      return containerProject as any;
    }
    if (libraryType !== 'isomorphic-lib') {
      return void 0;
    }

    const projectPath =
      this.resolveCoreProjectsPathes(version).projectByType(libraryType);

    if (!fse.existsSync(projectPath)) {
      Helpers.error(
        `
     ${projectPath}
     ${projectPath.replace(/\//g, '\\\\')}
     ${crossPlatformPath(projectPath)}
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
    const projectsInUserFolder = crossPlatformPath(
      path.join(
        crossPlatformPath(os.homedir()),
        `.${config.frameworkNames.productionFrameworkName}`,
        config.frameworkNames.productionFrameworkName,
        'projects',
      ),
    );
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
        `[${config.frameworkName} Not able to reset origin of taon repo: ${config.urlRepoTaon} in: ${cwd}`,
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
        `[${config.frameworkName} Not able to checkout master branch for :${config.urlRepoTaon} in: ${cwd}`,
        false,
        true,
      );
    }
    //#endregion

    //#region pull master with tags
    try {
      Helpers.run(
        `git reset --hard HEAD~20 && git reset --hard && git clean -df && git pull --tags origin master`,
        { cwd, output: false },
      ).sync();
      Helpers.log('DONE PULLING MASTER');
    } catch (error) {
      Helpers.log(error);
      Helpers.error(
        `[${config.frameworkName} Not able to pull master branch for :` +
          `${config.urlRepoTaon} in: ${crossPlatformPath(cwd)}`,
        false,
        true,
      );
    }
    //#endregion

    //#region checkout lastest tag
    // TODO  SPLIT TO SEPARATED CONTAINERS
    const tagToCheckout = this.taonTagToCheckoutForCurrentCliVersion(cwd);
    const currentBranch = Helpers.git.currentBranchName(cwd);
    Helpers.taskStarted(
      `Checking out lastest tag ${tagToCheckout} for taon framework...`,
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
          `[${config.frameworkName} Not ablt to checkout latest tag of taon framework: ${config.urlRepoTaon} in: ${cwd}`,
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
        `[${config.frameworkName} Not ablt to pull latest tag of taon framework: ${config.urlRepoTaon} in: ${cwd}`,
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
      Helpers.run(
        // $Global.prototype.reinstallCoreContainers.name
        `${config.frameworkName} ${'reinstallCoreContainers'} --skipCoreCheck`,
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
      'taon/.vscode',
    ]);

    if (!fse.existsSync(taonRepoPathUserInUserDir) && !global.skipCoreCheck) {
      if (!fse.existsSync(path.dirname(taonRepoPathUserInUserDir))) {
        fse.mkdirpSync(path.dirname(taonRepoPathUserInUserDir));
      }

      CLI.installEnvironment(requiredForDev);

      try {
        child_process.execSync(
          //$Global.prototype.ENV_INSTALL.name
          `${config.frameworkName}  ${'ENV_INSTALL'} --skipCoreCheck`,
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
        child_process.execSync(`git clone ${config.urlRepoTaon}`, {
          cwd: path.dirname(taonRepoPathUserInUserDir),
          stdio: [0, 1, 2],
        });
        Helpers.remove(morhiVscode);
      } catch (error) {
        Helpers.error(
          `[${config.frameworkName}][config] Not able to clone repository: ${config.urlRepoTaon} in:
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
      global['frameworkName'] &&
      global['frameworkName'] === config.frameworkNames.productionFrameworkName
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
    const result = {
      container: this.pathResolved(
        config.dirnameForTnp,
        `${this.taonProjectsRelative}/container${version}`,
      ),
      projectByType: (libType: CoreModels.NewFactoryType) => {
        return this.pathResolved(
          config.dirnameForTnp,
          `${this.taonProjectsRelative}/container${version}/${libType}${version}`,
        );
      },
    };
    return result;
    //#endregion
  }
  //#endregion

  //#region taon relative projects paths
  private get taonProjectsRelative() {
    return `../taon/projects`;
  }
  //#endregion

  //#region angular major version for current cli
  angularMajorVersionForCurrentCli(): number {
    //#region @backendFunc
    const tnp = this.Tnp;
    const angularFrameworkVersion = Number(
      _.first(tnp.packageJson.version.replace('v', '').split('.')),
    );
    return angularFrameworkVersion;
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
