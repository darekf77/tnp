import { UtilsExecProc } from 'tnp-core/src';

import { CloudFlareProject } from './cloud-flare-project';
import { CloudFlarePorjectsUtils } from './cloud-flare-projects.utils';

export class CloudCustomWorkerProject extends CloudFlareProject {
  //#region start in dev mode
  async startInDevMode(): Promise<void> {
    //#region @backendFunc
    await UtilsExecProc.spawnAsync(`npm-run bun run build.js`, {
      cwd: this.cwdWorker,
      showOutput: true,
      showOutputColor: true,
    }).waitUntilDoneOrThrow({
      successOutputMessage: 'Compilation Done',
    });
    await UtilsExecProc.spawnAsync(`npm run start`, {
      cwd: this.cwdWorker,
      showOutput: true,
      showOutputColor: true,
    }).waitUntilDoneOrThrow({});
    //#endregion
  }
  //#endregion
}
