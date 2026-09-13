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
  fse,
  chalk,
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
  //#region add project options
  export interface AddProjectOptions {
    skipDeployment?: boolean;
    projectType?: TempalteSubprojectType;
    projectEnvironmentNameWithNumber?: string;
  }
  //#endregion

  //#region files for sub project branding
  export interface FilesForSubProjectBranding {
    relativePath: string;

    beforeSave?: (
      content: string,
      fileRelativePath: string,
      absDestinationPath?: string,
      cwdWorker?: string,
    ) => string;
  }
  //#endregion

  //#region  get kv database prefix from template
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
  //#endregion

  //#region get worker prefix from template
  export const getWorkerPrefixFromTemplate = (
    templateType: TempalteSubprojectType,
    taonParentProjectName: string,
  ): string => {
    return `cw-${getPrefixFromGroup(templateType)}_${taonParentProjectName}`;
  };
  //#endregion

  //#region get prefix group
  export const getPrefixFromGroup = (
    templateType: TempalteSubprojectType,
  ): string => {
    return templateType // TemplateSubprojectDbPrefix
      .replace('taon-', '')
      .replace('-cloudflare-worker', '')
      .replace('-worker', '');
  };
  //#endregion

  //#region extract worker account name
  export const extractWorkersDevInfo = (text: string) => {
    const match = text.match(/https:\/\/([^\.]+)\.([^\.]+)\.workers\.dev/);

    if (!match) {
      return undefined;
    }

    return match[2];
  };
  //#endregion

  //#region select account for currrent project
  export type WranglerWhoAmI = {
    email?: string;
    accounts?: Array<{
      id: string;
      name: string;
    }>;
  };

  export function getWranglerWhoAmI(): WranglerWhoAmI | undefined {
    //#region @backendFunc
    try {
      const stdout = child_process.execFileSync(
        'npx',
        ['wrangler', 'whoami', '--json'],
        {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );

      return JSON.parse(stdout);
    } catch {
      return undefined;
    }
    //#endregion
  }

  export async function getCloudflareWorkersSubdomain(
    accountId: string,
    apiToken: string,
  ): Promise<string> {
    //#region @backendFunc
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error(
        `Cloudflare API error ${res.status}: ${await res.text()}`,
      );
    }

    const json = (await res.json()) as {
      success: boolean;
      result?: {
        subdomain: string;
      };
      errors?: unknown[];
    };

    if (!json.success || !json.result?.subdomain) {
      throw new Error(`Cannot resolve Cloudflare workers.dev subdomain.`);
    }

    return json.result.subdomain;
    //#endregion
  }

  //#endregion

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

  const selectSubdomain = async (project: Project): Promise<void> => {
    //#region @backendFunc
    const whoami = getWranglerWhoAmI();

    if (!whoami) {
      Helpers.error(
        'Unable to read Cloudflare account information from `wrangler whoami --json`.',
        false,
        true,
      );
    }

    if (!whoami.accounts?.length) {
      Helpers.error(
        'No Cloudflare accounts are associated with the current Wrangler login.',
        false,
        true,
      );
    }

    Helpers.info(`

    Select your Cloudflare workers.dev subdomain for project ${chalk.bold(
      project.name,
    )}.

    Example:
    some-worker-name.${chalk.bold('your-subdomain')}.workers.dev

  `);

    const defaultSubdomain = (whoami.email ?? '')
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');

    const accountSubdomain = await UtilsTerminal.input({
      question: 'Enter subdomain:',
      defaultValue: defaultSubdomain,
      required: true,
    });

    project.taonJson.setCloudFlareAccountSubdomain(accountSubdomain);

    Helpers.info(
      `Cloudflare subdomain "${accountSubdomain}" set for project "${project.name}".`,
    );
    //#endregion
  };

  //#region login to cloud flare
  export const loginCliCloudFlare = async (
    project?: Project,
  ): Promise<void> => {
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

        // const selectAccountId = await UtilsTerminal.select({
        //   question: `Select cloudfalre account for this project (${chalk.bold(project.name)})`,
        //   choices: whoami.accounts.map(c => ({
        //     name: `${c.name} (${c.id})`,
        //     value: c.id,
        //   })),
        // });
      } catch (error) {
        if (!(await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
          break;
        }
      }
    }

    if (!!project && !project.taonJson.cloudFlareAccountSubdomain) {
      await selectSubdomain(project);
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
