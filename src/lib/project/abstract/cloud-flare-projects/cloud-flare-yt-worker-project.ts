import { CloudFlareProject } from './cloud-flare-project';
import { CloudFlarePorjectsUtils } from './cloud-flare-projects.utils';

export class CloudFlareYtWorkerPorject extends CloudFlareProject {
  //#region api secreate keys data
  protected apiSecretsKeyData(): CloudFlarePorjectsUtils.SecretKeyData[] {
    return [
      //#region stripe secret key
      {
        key: 'YOUTUBE_API_KEY',
        description: `

      ADDING YOUTUBE_API_KEY

      To find this key:
      1. go to
      https://console.cloud.google.com/apis/api/youtube.googleapis.com/credentials

      2. Select project
      3. APIs & Services → Library
      4. Enable "YouTube Data API v3"
      5. Create Credentials / API Key (generate new API KEY)

      `,
      },
      //#endregion
    ];
  }
  //#endregion
}
