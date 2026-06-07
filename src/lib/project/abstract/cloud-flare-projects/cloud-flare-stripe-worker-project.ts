//#region imports
import {
  chalk,
  Helpers,
  path,
  TaonStripeCloudflareWorker,
  UtilsExecProc,
  UtilsTerminal,
} from 'tnp-core/src';
import { CloudFlareProject } from './cloud-flare-project';
import { TempalteSubprojectType } from '../../../constants';
//#endregion

export class CloudFlareStripeWorkerPorject extends CloudFlareProject {
  //#region init process
  public async afterCreation(): Promise<void> {
    //#region @backendFunc

    await super.afterCreation();

    if (
      await UtilsTerminal.confirm({
        message: `Woudl you like to add stripe secret keys to worker ?`,
        defaultValue: true,
      })
    ) {
      await this.addStripeSecrets();
    }

    //#endregion
  }
  //#endregion

  //#region add stripe secrets
  public async addStripeSecrets(): Promise<void> {
    //#region @backendFunc

    //#region add stripe secret
    Helpers.info(`


      ADDING STRIP SECRET

      Find in you stripe dashboard something like this:

      Secret key   sk_test_someletterarehe  <- copy this


      `);
    while (true) {
      try {
        Helpers.taskStarted(`PLEASE WAIT FOR INPUT TO ADD STRIP SECRET ..`);
        const data = await UtilsExecProc.spawnAsync(
          `npx wrangler secret put STRIPE_SECRET_KEY`,
          {
            cwd: this.cwdWorker,
          },
        ).waitUntilDoneOrThrow();
        Helpers.taskDone(
          `STRIPE SECRET SAVED for "${this.taonParentProject.taonJson.cloudFlareAccountSubdomain}"`,
        );
        break;
      } catch (error) {
        if (!(await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
          break;
        }
      }
      break;
    }
    //#endregion

    //#region add stripe webhook secret
    Helpers.info(
      `ADDING STRIP ${chalk.bold(
        'WEBHOOK',
      )} SECRET (-> DIFFRENT THAT STRIPE SECRET)`,
    );
    while (true) {
      try {
        Helpers.info(`PLEASE ADD WEBHOOK IN STRIPE FOR ADDRESS:

        ${this.workerUrl}${TaonStripeCloudflareWorker.HOOK_POST}

        Find you Webhooks tab:

        Signing secret
        whsec_somekindofstringkey <- copy this


          `);
        await UtilsTerminal.pressAnyKeyToContinueAsync();

        Helpers.taskStarted(
          `PLEASE WAIT FOR INPUT TO ADD WEBHOOK STRIP SECRET ..`,
        );
        await UtilsExecProc.spawnAsync(
          `npx wrangler secret put STRIPE_WEBHOOK_SECRET`,
          {
            cwd: this.cwdWorker,
          },
        ).waitUntilDoneOrThrow();
        Helpers.taskDone(
          `STRIPE WEBHOOK SECRET SAVED for "${this.taonParentProject.taonJson.cloudFlareAccountSubdomain}"`,
        );
        break;
      } catch (error) {
        if (!(await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
          break;
        }
      }
      break;
    }
    //#endregion

    //#endregion
  }
  //#endregion
}
