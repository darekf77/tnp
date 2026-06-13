//#region imports
import {
  chalk,
  Helpers,
  path,
  TaonStripeCloudflareWorker,
  UtilsExecProc,
  UtilsTerminal,
} from 'tnp-core/src';

import { TempalteSubprojectType } from '../../../constants';

import { CloudFlareProject } from './cloud-flare-project';
import { CloudFlarePorjectsUtils } from './cloud-flare-projects.utils';
//#endregion

export class CloudFlareStripeWorkerPorject extends CloudFlareProject {
  //#region api secreate keys data
  protected apiSecretsKeyData(): CloudFlarePorjectsUtils.SecretKeyData[] {
    return [
      //#region stripe secret key
      {
        key: 'STRIPE_SECRET_KEY',
        description: `


      ADDING STRIP SECRET

      Find in you stripe dashboard something like this:

      Secret key   sk_test_somestringhere  <- copy this


      `,
      },
      //#endregion

      //#region stripe webhook key
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        description: `PLEASE ADD WEBHOOK IN STRIPE FOR ADDRESS:

        ${this.workerUrl}${TaonStripeCloudflareWorker.HOOK_POST}

        Find you Webhooks tab:

        Signing secret
        whsec_somekindofstringkey <- copy this

        and press any key to continue...
          `,
      },
      //#endregion
    ];
  }
  //#endregion
}
