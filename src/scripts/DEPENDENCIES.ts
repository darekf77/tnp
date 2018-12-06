
//#region @backend
import * as _ from 'lodash';
import { Project, BaseProjectLib, ProjectFrom } from '../project';
import { error, info } from '../messages';
import chalk from 'chalk';

export default {

  $DEPS_CORE() {
    Project.Current.packageJson.coreRecreate()
    process.exit(0)
  },


  $DEDUPE() {
    Project.Current.packageJson.dedupe()
    process.exit(0)
  },

  $DEPS_DEDUPE(args: string) {
    Project.Current.packageJson.dedupe()
    process.exit(0)
  },

  $DEPS_RECREATE(args: string) {
    Project.Current.packageJson.saveForInstall(true)
    process.exit(0)
  },

  DEPS_SHOW(args: string) {
    Project.Current.packageJson.saveForInstall(true)
    process.exit(0)
  },


  $DEPS_CLEAN(args: string) {
    Project.Current.packageJson.saveForInstall(false)
    process.exit(0)
  },

  $DEPS_HIDE(args: string) {
    Project.Current.packageJson.saveForInstall(false)
    process.exit(0)
  },

  $DEPS_UPDATE(args: string) {
    Project.Current.packageJson.update();
    process.exit(0)
  }

}


//#endregion
