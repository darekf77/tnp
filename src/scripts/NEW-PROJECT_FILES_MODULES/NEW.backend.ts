//#region @backend
import * as _ from 'lodash';
import { Models } from 'tnp-models';
import { Helpers } from 'tnp-helpers';
import { ProjectFactory } from './project-factory.backend';


export async function NEW(args: string, exit = true) {
  const cwd = process.cwd();
  const argv = args.split(' ');
  const type = argv[0] as Models.libs.NewFactoryType;
  if (type === 'model') {
    await ProjectFactory.Instance.createModelFromArgs(args, exit, cwd);
  } else {
    await ProjectFactory.Instance.workspaceFromArgs(args, exit, cwd)
  }
}
export function NEW_SITE(args: string, exit = true) {
  const cwd = process.cwd();
  ProjectFactory.Instance.workspaceSiteFromArgs(args, exit, cwd);
}

export default {
  NEW: Helpers.CLIWRAP(NEW, 'NEW'),
  NEW_SITE: Helpers.CLIWRAP(NEW_SITE, 'NEW_SITE')
};

//#endregion
