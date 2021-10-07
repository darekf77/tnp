//#region @backend
import {
  _,
  path,
  fse,
  child_process,
  crossPlatformPath,
} from 'tnp-core';
import { Helpers } from 'tnp-helpers'
import { IncCompiler } from 'incremental-compiler';
import { config, ConfigModels } from 'tnp-config';
import { Project } from '../../abstract/project/project';
import { Models } from 'tnp-models';

export interface TscCompileOptions {
  cwd: string;
  watch?: boolean;
  outDir?: string;
  generateDeclarations?: boolean;
  tsExe?: string;
  diagnostics?: boolean;
  hideErrors?: boolean;
  debug?: boolean;
  locationOfMainProject: string;
  isBrowserBuild?: boolean;
  buildType: 'dist' | 'bundle';
}

@IncCompiler.Class({ className: 'BackendCompilation' })
export class BackendCompilation extends IncCompiler.Base {

  public get compilationFolderPath() {
    if (_.isString(this.location) && _.isString(this.cwd)) {
      return crossPlatformPath(path.join(this.cwd, this.location));
    }
  }
  public isEnableCompilation = true;

  async tscCompilation({
    cwd,
    watch = false,
    outDir,
    generateDeclarations = false,
    tsExe = 'npx tsc',
    diagnostics = false,
    hideErrors = false,
    locationOfMainProject,
    isBrowserBuild,
    buildType = 'dist'
  }: TscCompileOptions) {
    if (!this.isEnableCompilation) {
      Helpers.log(`Compilation disabled for ${_.startCase(BackendCompilation.name)}`)
      return;
    }
    if (hideErrors) {
      diagnostics = false;
      generateDeclarations = false;
    }

    const params = [
      watch ? ' -w ' : '',
      outDir ? ` --outDir ${outDir} ` : '',
      !watch ? ' --noEmitOnError true ' : '',
      diagnostics ? ' --extendedDiagnostics ' : '',
      ` --preserveWatchOutput `
      // hideErrors ? '' : ` --preserveWatchOutput `,
      // hideErrors ? ' --skipLibCheck true --noEmit true ' : '',
    ];

    const commandJsAndMaps = `${tsExe} -d false  ${params.join(' ')}`
    const commandDts = `${tsExe}  ${params.join(' ')}`

    Helpers.log(`(${this.compilerName}) Execute first command :

    ${commandJsAndMaps}

    # inside: ${cwd}`)
    const project = Project.From(locationOfMainProject) as Project;
    // console.log(`project from ${locationOfMainProject}`, project)
    if (!!project && !!isBrowserBuild && buildType === 'bundle' && project.frameworkVersionAtLeast('v3') && project.typeIs('angular-lib', 'isomorphic-lib')) {
      await this.buildAngularVer(project, buildType, watch);
    } else {
      //#region normal js build
      if (watch) {
        await Helpers.logProc2(child_process.exec(commandJsAndMaps, { cwd }), ['Watching for file changes.']);
        if (generateDeclarations) {
          Helpers.log(`(${this.compilerName}) Execute second command : ${commandDts}    # inside: ${cwd}`)
          await Helpers.logProc2(child_process.exec(commandDts, { cwd }), ['Watching for file changes.']);
        }
      } else {
        try {
          child_process.execSync(commandJsAndMaps, {
            cwd,
            stdio: [0, 1, 2]
          });
        } catch (e) {
          Helpers.error(`[morphi] Compilation error (1): ${e}`, false, true);
        }


        if (generateDeclarations) {
          Helpers.log(`(${this.compilerName}) Execute second command : ${commandDts}    # inside: ${cwd}`)
          try {
            child_process.execSync(commandDts, {
              cwd,
              stdio: [0, 1, 2]
            })
          } catch (e) {
            Helpers.error(`[morphi] Compilation error (2): ${e}`, false, true);
          }
        }
      }
      //#endregion
    }

    if (!!project && !!isBrowserBuild) {
      const bePjPath = path.join(project.location, buildType, config.file.package_json);
      const bepj = Helpers.readJson(bePjPath) as Models.npm.IPackageJSON;
      (project.packageJson.data.tnp.overrided.includeOnly || []).forEach(p => {
        const verTnp = (Project.by('container', project._frameworkVersion) as Project)
          .packageJson.data.dependencies[p];
        bepj.dependencies[p] = `~${verTnp}`;
      });
      Helpers.writeJson(bePjPath, bepj);
    }

  }

  protected async buildAngularVer(project: Project, outFolder: ConfigModels.OutFolder = 'dist', watch: boolean) {
    const cwd = project.location;
    project.recreate.initAngularLibStructure(outFolder);
    const isIsomorphic = project.typeIs('isomorphic-lib');
    const command = `npx ng build ${project.name} ${watch ? '--watch' : ''} `;
    // + ` --output-path=./${outFolder}/browser`;
    if (isIsomorphic) {
      await Helpers.run(command, {
        cwd,
        outputLineReplace: (line => line.replace(
          `tmp-projects-for-${outFolder}/${project.name}/src/`,
          `src/`
        ))
      }).asyncAsPromise();
    } else {
      await Helpers.run(command, {
        cwd,
      }).asyncAsPromise();
    }
    if (!watch) {
      const browserPkgJsons = [
        path.join(project.location, outFolder, config.folder.browser, config.file.package_json),
        path.join(project.location, outFolder, config.folder.client, config.file.package_json),
      ];
      browserPkgJsons.forEach(p => {
        const j = Helpers.readJson(p) as Models.npm.IPackageJSON;
        j.dependencies = {};
        j.devDependencies = {};
        j.peerDependencies = {};
        [
          'module',
          'fesm5',
          'fesm2015',
          'es2015',
          'bundles',
          'main'
        ].forEach(k => {
          if (k === 'main') {
            j[k] = 'esm2015/index.js';
          } else {
            j[k] = void 0;
            Helpers.removeFolderIfExists(path.join(project.location, outFolder, config.folder.browser, k));
            Helpers.removeFolderIfExists(path.join(project.location, outFolder, config.folder.client, k));
          }

        });

        // j.scripts = {};
        Helpers.writeJson(p, j);
      });

    }

  }

  protected compilerName = 'Backend Compiler';
  async compile(watch = false) {
    await this.tscCompilation({
      cwd: this.compilationFolderPath,
      watch,
      outDir: (`../${this.outFolder}` as any),
      generateDeclarations: true,
      locationOfMainProject: this.location,
      buildType: this.outFolder as any
    });
  }

  async syncAction(filesPathes: string[]) {
    const outDistPath = crossPlatformPath(path.join(this.cwd, this.outFolder));
    // Helpers.System.Operations.tryRemoveDir(outDistPath)
    if (!fse.existsSync(outDistPath)) {
      fse.mkdirpSync(outDistPath);
    }
    await this.compile();
  }

  async preAsyncAction() {
    await this.compile(true)
  }

  get tsConfigName() {
    return 'tsconfig.json'
  }
  get tsConfigBrowserName() {
    return 'tsconfig.browser.json'
  }

  constructor(
    /**
     * Output folder
     * Ex. dist
     */
    public outFolder: ConfigModels.OutFolder,
    /**
     * Source location
     * Ex. src | components
     */
    public location: string,
    /**
     * Current cwd same for browser and backend
     * but browser project has own compilation folder
     * Ex. /home/username/project/myproject
     */
    public cwd?: string
  ) {
    super({
      folderPath: [path.join(cwd, location)],
      notifyOnFileUnlink: true,
    });
  }


}



//#endregion