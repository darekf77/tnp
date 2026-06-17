import { TaonEmailContactEnv } from '@taon-dev/api-workers/src';

import { CloudFlareProject } from './cloud-flare-project';
import { CloudFlarePorjectsUtils } from './cloud-flare-projects.utils';

export class CloudFlareEmailWorkerPorject extends CloudFlareProject {
  //#region api secreate keys data
  protected apiSecretsKeyData(): CloudFlarePorjectsUtils.SecretKeyData[] {
    return [
      //#region stripe secret key
      {
        key: 'USER_EMAIL' as keyof TaonEmailContactEnv as string,
        description: `

        Can be your private email (for receiving emails)

        `,
      },
      {
        key: 'SENDER_EMAIL' as keyof TaonEmailContactEnv as string,
        description: `

        Your website "fake" email..

        `,
      },
      {
        key: 'SENDER_NAME' as keyof TaonEmailContactEnv as string,
        description: `

        Your website name (human readable format)

        `,
      },

      {
        key: 'CORS_DOMAIN' as keyof TaonEmailContactEnv as string,
        description: `

        Prevent cross domain

        `,
      },
      {
        key: 'TURNSTILE_SECRET' as keyof TaonEmailContactEnv as string,
        description: `

        Cloudflare captcha (TURNSTILE) API KEY

        `,
      },
      {
        key: 'RESEND_API_KEY' as keyof TaonEmailContactEnv as string,
        description: `

        Resend email provider API KEY

        `,
      },
      //#endregion
    ];
  }
  //#endregion
}
