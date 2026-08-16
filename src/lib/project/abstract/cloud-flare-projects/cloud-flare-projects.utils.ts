//#region imports
import { RenameRule } from 'magic-renamer/src';
import {
  crossPlatformPath,
  Helpers,
  path,
  Utils,
  UtilsExecProc,
  UtilsFilesFoldersSync,
  UtilsTerminal,
  _,
  CoreModels,
  LibTypeEnum,
  child_process,
} from 'tnp-core/src';
import { HelpersTaon, UtilsTypescript } from 'tnp-helpers/src';

import {
  buildJS,
  buildJSprod,
  externalJs,
  indexTsInSrcForWorker,
  KV_DATABASE_ONLINE_NAME,
  packageJsonSubProject,
  TempalteSubprojectType,
  tsconfigSubProject,
  wranglerJsonC,
} from '../../../constants';
import type { Project } from '../project';

import { CloudCustomWorkerProject } from './cloud-flare-custom-worker';
import { CloudFlareEmailWorkerPorject } from './cloud-flare-email-worker-project';
import { CloudFlareSubProject } from './cloud-flare-project';
import { CloudFlareStripeWorkerPorject } from './cloud-flare-stripe-worker-project';
import { CloudFlareYtWorkerPorject } from './cloud-flare-yt-worker-project';
//#endregion

export namespace CloudFlarePorjectsUtils {
  export interface AddProjectOptions {
    skipDeployment?: boolean;
    projectType?: TempalteSubprojectType;
    projectEnvironmentNameWithNumber?: string;
  }

  export interface FilesForSubProjectBranding {
    relativePath: string;

    beforeSave?: (
      content: string,
      fileRelativePath: string,
      absDestinationPath?: string,
      cwdWorker?: string,
    ) => string;
  }

  /**
   * examples:
   */
  export const getKVDatabasePrefixFromTemplate = (
    templateType: TempalteSubprojectType,
    taonParentProjectName: string,
  ): string => {
    return `${getPrefixFromGroup(templateType).replace(
      /\_/g,
      '_',
    )}_KV_${_.snakeCase(taonParentProjectName).toUpperCase()}`;
  };

  export const getWorkerPrefixFromTemplate = (
    templateType: TempalteSubprojectType,
    taonParentProjectName: string,
  ): string => {
    return `cw-${getPrefixFromGroup(templateType)}_${taonParentProjectName}`;
  };

  export const getPrefixFromGroup = (
    templateType: TempalteSubprojectType,
  ): string => {
    return templateType // TemplateSubprojectDbPrefix
      .replace('taon-', '')
      .replace('-cloudflare-worker', '')
      .replace('-worker', '');
  };

  //#region extract worker account name
  export const extractWorkersDevInfo = (text: string) => {
    const match = text.match(/https:\/\/([^\.]+)\.([^\.]+)\.workers\.dev/);

    if (!match) {
      return undefined;
    }

    return match[2];
  };
  //#endregion

  // type WranglerWhoami = {
  //   accounts: Array<{
  //     id: string;
  //     name: string;
  //   }>;
  // };

  //#region extract worker account name from system
  export const extractWorkerAccountInfoFromSystem =
    async (): Promise<string> => {
      return void 0;
      //#region @backendFunc
      // const output = child_process
      //   .execSync('npx wrangler whoami --json', {
      //     encoding: 'utf8',
      //     stdio: ['ignore', 'pipe', 'pipe'],
      //   })
      //   .toString();
      // const whoami = JSON.parse(output) as WranglerWhoami;
      // console.log(JSON.stringify(whoami));
      // if (!whoami.accounts?.length) {
      //   throw new Error('No Cloudflare account found. Run: npx wrangler login');
      // }
      // if (whoami.accounts.length > 1) {
      //   throw new Error(
      //     `Multiple Cloudflare accounts found: ${whoami.accounts
      //       .map(a => `${a.name} (${a.id})`)
      //       .join(', ')}`,
      //   );
      // }
      // const accountId = whoami.accounts[0].id;
      // // See note below about authentication/token.
      // const response = await fetch(
      //   `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      //     },
      //   },
      // );
      // const data = (await response.json()) as {
      //   success: boolean;
      //   result?: {
      //     subdomain: string;
      //   };
      // };
      // if (!data.success || !data.result?.subdomain) {
      //   throw new Error('Unable to determine Cloudflare workers.dev subdomain');
      // }
      // return data.result.subdomain;
      //#endregion
    };

  //#region is wrangelr logged in
  export async function isWranglerLoggedIn(): Promise<boolean> {
    //#region @backendFunc
    try {
      const data = await UtilsExecProc.spawnAsync(
        'npx wrangler whoami',
      ).getOutput();
      const dataStr = data.stdout + data.stderr;
      if (
        dataStr.includes('You are not authenticated') ||
        dataStr.includes('failed to fetch auth to') ||
        dataStr.includes('ERROR')
      ) {
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
    // const accountName =
    //   await CloudFlarePorjectsUtils.extractWorkerAccountInfoFromSystem();
    // console.log(`account name: ${accountName}`);

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
      const proc = child_process.spawn(
        'npx',
        ['wrangler', 'secret', 'put', name],
        {
          stdio: ['pipe', 'inherit', 'inherit'],
          cwd: cwdWorker,
          shell: true,
        },
      );

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

  //#region cloud flare project from
  export const cloudFlareProjectFrom = (
    absLocation: string,
  ):
    | CloudFlareSubProject
    | CloudFlareStripeWorkerPorject
    | CloudFlareYtWorkerPorject
    | CloudCustomWorkerProject
    | CloudFlareEmailWorkerPorject
    | undefined => {
    //#region @backendFunc
    const ProjectClass = require('../project').Project as typeof Project;
    const parentProject = ProjectClass.ins.nearestTo(absLocation, {
      type: LibTypeEnum.ISOMORPHIC_LIB,
    });
    // console.log({ parentProject: parentProject?.location });

    const proj = new CloudFlareSubProject(absLocation, parentProject);

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

    if (
      proj.selectedTempalte ===
      TempalteSubprojectType.TAON_CUSTOM_CLOUDFLARE_WORKER
    ) {
      return new CloudCustomWorkerProject(absLocation, parentProject);
    }

    if (
      proj.selectedTempalte ===
      TempalteSubprojectType.TAON_EMAIL_CLOUDFLARE_WORKER
    ) {
      return new CloudFlareEmailWorkerPorject(absLocation, parentProject);
    }

    return void 0;
    //#endregion
  };
  //#endregion

  //#region secret key data
  export interface SecretKeyData {
    key: string;
    description: string;
    afterAddedFn?: () => void | Promise<void>;
  }
  //#endregion
}
