import { execSync, spawn } from 'child_process';
import * as crypto from 'crypto';
import { Helpers, Utils, UtilsExecProc, UtilsTerminal } from 'tnp-core/src';
import type { Project } from '../project';
import { CloudFlareProject } from './cloud-flare-project';
import { CloudFlareStripeWorkerPorject } from './cloud-flare-stripe-worker-project';
import { CloudFlareYtWorkerPorject } from './cloud-flare-yt-worker-project';
import { TempalteSubprojectType } from 'tnp/src';

export namespace CloudFlarePorjectsUtils {
  //#region extract worker account name
  export const extractWorkersDevInfo = (text: string) => {
    const match = text.match(/https:\/\/([^\.]+)\.([^\.]+)\.workers\.dev/);

    if (!match) {
      return undefined;
    }

    return match[2];
  };
  //#endregion

  //#region is wrangelr logged in
  export async function isWranglerLoggedIn(): Promise<boolean> {
    //#region @backendFunc
    try {
      const data =
        (await UtilsExecProc.spawnAsync(
          'npx wrangler whoami',
        ).getStdoutWithoutShowingOrThrow()) || '';
      if (data.includes('You are not authenticated')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
    //#endregion
  }
  //#endregion

  //#region login to cloud flare
  export const loginCliCloudFlare = async (): Promise<void> => {
    //#region @backendFunc
    let trysLogin = 0;
    Helpers.info(`CHECKING CLI CLOUDFLARE LOGIN`);
    while (true) {
      try {
        const isLogggedIn = await CloudFlarePorjectsUtils.isWranglerLoggedIn();
        Helpers.info(`IS LOGGED IN USER: ${isLogggedIn}`);
        if (isLogggedIn) {
          if (trysLogin > 0) {
            Helpers.taskDone(`Logged in cloudflare - DONE`);
          } else {
            Helpers.info(`Already logged in to cloudflare`);
          }
          break;
        } else {
          trysLogin++;
          Helpers.logInfo(`Executing login script...`);
          await UtilsExecProc.spawnAsync(
            'npx wrangler login',
          ).waitUntilDoneOrThrow();
          Helpers.info(`Waiting 2 seconds afer login...`);
          await Utils.wait(2);
          Helpers.taskDone(`Login done.`);
        }
      } catch (error) {
        if (!(await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
          break;
        }
      }
    }
    //#endregion
  };
  //#endregion

  //#region set secret cloudflare
  export async function setSecret(
    cwdWorker: string,
    name: string,
    value: string,
  ): Promise<boolean> {
    //#region @backendFunc
    return new Promise<boolean>((resolve, reject) => {
      const proc = spawn('npx', ['wrangler', 'secret', 'put', name], {
        stdio: ['pipe', 'inherit', 'inherit'],
        cwd: cwdWorker,
        shell: true,
      });

      proc.stdin.write(value);
      proc.stdin.end();

      proc.on('close', code => {
        if (code === 0) resolve(true);
        else reject(new Error(`wrangler exited with ${code}`));
      });
    });
    //#endregion
  }
  //#endregion

  export const cloudFlareProjectFrom = (
    absLocation: string,
    parentProject: Project,
  ):
    | CloudFlareProject
    | CloudFlareStripeWorkerPorject
    | CloudFlareYtWorkerPorject => {
    const proj = new CloudFlareProject(absLocation, parentProject);

    if (
      proj.selectedTempalte ===
      TempalteSubprojectType.TAON_STRIPE_CLOUDFLARE_WORKER
    ) {
      return new CloudFlareStripeWorkerPorject(absLocation, parentProject);
    }

    if (
      proj.selectedTempalte === TempalteSubprojectType.TAON_YT_CLOUDFLARE_WORKER
    ) {
      return new CloudFlareYtWorkerPorject(absLocation, parentProject);
    }

    return proj;
  };
}
