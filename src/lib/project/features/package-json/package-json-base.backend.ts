import { path } from 'tnp-core'
import * as semver from 'semver';

import { Project } from '../../abstract';
import { Models } from 'tnp-models';
import { Helpers } from 'tnp-helpers';
import { config } from 'tnp-config';

import { _ } from 'tnp-core';
import { reolveAndSaveDeps, removeDependencyAndSave, setDependencyAndSave, findVersionRange } from './package-json-helpers.backend';
import { PackageJsonCore } from './package-json-core.backend';
import { PackageJsonDepsCoreCategories } from './package-json-deps-categories.backend';

export class PackageJsonBase extends PackageJsonCore {
  public readonly project: Project;
  private reasonToHidePackages = '';
  private reasonToShowPackages = '';
  private readonly coreCategories: PackageJsonDepsCoreCategories;

  constructor(options: { data: Object, location?: string; project?: Project; }) {
    super((options.project && !options.location) ? options.project.location : options.location);
    if (_.isObject(options)) {
      if (options.project && !options.location) {
        options.location = options.project.location;
      }
      _.merge(this, options);

      this.data = _.merge({
        tnp: {
          resources: []
        }
      } as Models.npm.IPackageJSON, options.data as any);
    }
    this.coreCategories = new PackageJsonDepsCoreCategories(this.project);
  }

  public save(reasonToShowPackages: string) {
    this.reasonToShowPackages = `\n${reasonToShowPackages}`;
    this.prepareForSave('save');
    this.writeToDisc();
  }

  public showDeps(reasonToShowPackages: string) {
    this.reasonToHidePackages = `\n${reasonToShowPackages}`;
    this.prepareForSave('show');
    this.writeToDisc();
  }

  public hideDeps(reasonToHidePackages: string) {
    this.reasonToHidePackages = `\n${reasonToHidePackages}`;
    this.prepareForSave('hide');
    this.writeToDisc(true);
  }

  public updateHooks() {
    Helpers.log('[package json] updating hooks')
    if (!(this.data.husky && this.data.husky.hooks && _.isString(this.data.husky.hooks['pre-push']))) {
      this.data.husky = {
        hooks: {
          'pre-push': 'tnp deps:show:if:standalone'
        }
      };
      this.save('Update hooks');
    }
    Helpers.log('[package json] updating hooks done')
  }

  private prepareForSave(action: 'save' | 'show' | 'hide' = 'save', caller?: Project) {
    if (caller === this.project) {
      return;
    }
    if (this.project.isUnknowNpmProject) {
      Helpers.log(`Prepare for save not for unknow projects`);
      return;
    }

    if (this.project.isStandaloneProject || this.project.isContainer || (this.project.isWorkspace && !this.project.isContainerChild)) {
      (Project.Tnp as Project).packageJson.prepareForSave(action, Project.Tnp as Project);
    }

    if ((this.project.isContainerChild && this.project.isWorkspace) || this.project.isWorkspaceChildProject) {
      this.project.parent.packageJson.prepareForSave(action);
    }

    reolveAndSaveDeps(this.project, action, this.reasonToHidePackages, this.reasonToShowPackages);
  }

  linkTo(destination: string, linkAllTypes = false) {
    (() => {
      const source = path.join(this.project.location, config.file.package_json);
      const dest = path.join(destination, config.file.package_json);
      Helpers.removeFileIfExists(dest);
      Helpers.createSymLink(source, dest);
    })();

    Helpers.filesFrom(this.project.location)
      .filter(f => path.basename(f).startsWith(config.file.package_json))
      .forEach(source => {
        const dest = path.join(destination, path.basename(source));
        Helpers.removeFileIfExists(dest);
        Helpers.createSymLink(source, dest);
      });

  }

  public removeDependencyAndSave = (p: Models.npm.Package, reason: string) => {
    this.prepareForSave('save')
    removeDependencyAndSave(p, reason, this.project);
  }
  public setDependencyAndSave = (p: Models.npm.Package, reason: string) => {
    this.prepareForSave('save')
    setDependencyAndSave(p, reason, this.project)
  }

  /**
   * Look all package.json dependencies and check if version range
   * of dependency is satisfy
   * @param dependency
   */
  public checDepenciesAreSatisfyBy(dependency: Project): boolean {

    const versionRange = findVersionRange(this.project, dependency);
    if (!versionRange) {
      Helpers.error(`Version range not avaliable root: ${this.name} dependency: ${dependency.name}`, true, true);
      return false;
    }
    const result = semver.satisfies(dependency.version, versionRange);
    const namePackage = `${dependency.name}@${dependency.version}`;
    Helpers.log(`[checDepenciesAreSatisfyBy] ${result} for ${namePackage} in range ${versionRange} withing ${this.name}`);
    return result;
  }

  public reset() {
    if (this.project.isTnp) {
      Helpers.log(`Npm reset not available for Tnp project`)
      return;
    }
    if (this.project.isWorkspaceChildProject || (this.project.isContainerChild && this.project.isWorkspace)) {
      this.project.parent.packageJson.reset();
    }
    this.data.tnp.overrided.dependencies = {};
    this.save(`reset of npm`);
  }

  async setCategoryFor(pkg: Models.npm.Package) {
    await this.coreCategories.setWizard(pkg)
  }

  public updateFrom(locations: string[]) {
    for (let index = 0; index < locations.length; index++) {
      const location = locations[index];
      const otherProj = Project.From<Project>(location);
      Helpers.log(`Updating package.json from ${otherProj.name}`)
      updaPackage(this.project, otherProj.packageJson.data.dependencies, otherProj);
      updaPackage(this.project, otherProj.packageJson.data.devDependencies, otherProj);
    }
  }

}

function updaPackage(mainProj: Project, deps: Object, otherProj: Project) {
  if (!deps) {
    Helpers.log(`Cant read deps`);
    return;
  }
  Object.keys(deps).forEach(depName => {
    const version = deps[depName];
    if (_.isString(version)) {
      mainProj.packageJson.setDependencyAndSave({
        name: depName,
        version
      }, `update from project: ${otherProj.name}`);
    }
  });
}