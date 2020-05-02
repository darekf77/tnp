import { Project } from './project';
import { TnpDB } from 'tnp-db';

import { config } from '../../../config';

export abstract class DbProcessProject {

  async hasParentWithSingularBuild(this: Project) {
    if (this.isWorkspaceChildProject || (this.isStandaloneProject && this.isContainerChild)) {
      const db = await TnpDB.Instance(config.dbLocation);
      const builds = await db.getBuildsBy({ location: this.parent.location, watch: true });
      return builds.length > 0;
    }
    return false;
  }

  async isSingularBuild(this: Project) {
    if (this.isWorkspace || this.isContainer) {
      const db = await TnpDB.Instance(config.dbLocation);
      const builds = await db.getBuildsBy({ location: this.location, watch: true });
      return builds.length > 0;
    }
    return false;
  }

}

// export interface DbProcessProject extends Partial<Project> { }


// }