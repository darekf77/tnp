//#region @backend
import { path } from 'tnp-core'
import { fse } from 'tnp-core'

import { Project, FeatureForProject } from '../abstract';
import { Helpers } from 'tnp-helpers';
import { config } from 'tnp-config';

export class WorkspaceSymlinks extends FeatureForProject {

  private get linkInside() {
    const projectsToLink: Project[] = []
      .concat(this.project.children)
      .concat(this.project.baseline ? [this.project.baseline] : [])

    projectsToLink.forEach(c => {
      if (path.basename(c.location) !== c.name) {
        Helpers.error(`Project "${c.location}" has different packaage.json name`
          + ` property than his own folder name "${path.basename(c.location)}"`, false, true)
      }
    })

    return projectsToLink;
  }

  remove(triggeredMsg: string) {
    this.linkInside.forEach(c => {
      const symPkgPath = path.join(this.project.location, config.folder.node_modules, c.name);
      if (fse.existsSync(symPkgPath)) {
        Helpers.log(`Removing symlinks: ${c.genericName} from node_module ${triggeredMsg}`)
        Helpers.removeFileIfExists(symPkgPath);
      }
    })
    this.project.children.forEach(c => {
      Helpers.log(`Remove child node_modules ${c.genericName} ${triggeredMsg}`)
      c.node_modules.remove();
    });

    // if (this.project.isSiteInStrictMode) {
    //   Helpers.removeFolderIfExists(path.join(this.project.location, config.folder.node_modules, config.names.baseline));
    // }
    if (this.project.isSiteInDependencyMode) {
      this.project.workspaceDependencies.forEach(d => {
        // const source = d.location;
        const dest = path.join(this.project.location, config.folder.node_modules, d.name);
        Helpers.removeFileIfExists(dest);
      });
    }
  }

  add(triggeredMsg: string) {
    this.linkInside.forEach(c => {
      const destination = path.join(this.project.location, config.folder.node_modules);
      Helpers.log(`Adding symlinks: ${c.genericName} to node_module ${triggeredMsg}`)
      Helpers.createSymLink(c.location, `${destination}/`)
    })
    this.project.children.forEach(c => {
      Helpers.log(`Add parent '${this.project.genericName}' node_modules to child: ${c.name} ${triggeredMsg}`)
      this.project.node_modules.linkToProject(c)
    })
    this.project.children.forEach(c => {
      Helpers.log(`Add parent '${this.project.genericName}' node_modules to child: ${c.name} ${triggeredMsg}`)
      this.project.node_modules.linkToProject(c)
    });
    // if (this.project.isSiteInStrictMode) {
    //   const baselineInNodeModules = path.join(this.project.location, config.folder.node_modules, this.project.baseline.name);
    //   if (path.basename(baselineInNodeModules) !== config.names.baseline) {
    //     const baselineInNodeModulesProperName = path.join(this.project.location, config.folder.node_modules, config.names.baseline);
    //     Helpers.createSymLink(baselineInNodeModules, baselineInNodeModulesProperName);
    //   }
    // }

    if (this.project.isSiteInDependencyMode) {
      this.project.workspaceDependencies.forEach(d => {
        const source = d.location;
        const dest = path.join(this.project.location, config.folder.node_modules, d.name);
        Helpers.createSymLink(source, dest);
      });
    }
  }


}
//#endregion
