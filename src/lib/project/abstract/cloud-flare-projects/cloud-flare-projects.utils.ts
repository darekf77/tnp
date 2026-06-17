import { execSync, spawn } from 'child_process';
import * as crypto from 'crypto';

import { RenameRule } from 'magic-renamer/src';
import { TempalteSubprojectType } from 'tnp/src';
import {
  crossPlatformPath,
  Helpers,
  path,
  Utils,
  UtilsExecProc,
  UtilsFilesFoldersSync,
  UtilsTerminal,
} from 'tnp-core/src';
import { HelpersTaon, UtilsTypescript } from 'tnp-helpers/src';

import {
  indexTsInSrcForWorker,
  KV_DATABASE_ONLINE_NAME,
  packageJsonSubProject,
  tsconfigSubProject,
  wranglerJsonC,
} from '../../../constants';
import type { Project } from '../project';

import { CloudFlareProject } from './cloud-flare-project';
import { CloudFlareStripeWorkerPorject } from './cloud-flare-stripe-worker-project';
import { CloudFlareYtWorkerPorject } from './cloud-flare-yt-worker-project';
import { CloudFlareEmailWorkerPorject } from './cloud-flare-email-worker-project';

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

  //#region cloud flare project from
  export const cloudFlareProjectFrom = (
    absLocation: string,
    parentProject: Project,
  ):
    | CloudFlareProject
    | CloudFlareStripeWorkerPorject
    | CloudFlareYtWorkerPorject
    | CloudFlareEmailWorkerPorject => {
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

    if (
      proj.selectedTempalte ===
      TempalteSubprojectType.TAON_EMAIL_CLOUDFLARE_WORKER
    ) {
      return new CloudFlareEmailWorkerPorject(absLocation, parentProject);
    }

    return proj;
  };
  //#endregion

  //#region init project file and assets
  export const initProjectFilesAndAssets = (
    coreCloudFlareProject: Project,
    cloudFlareProjectLocation: string,
  ) => {
    //#region @backendFunc
    const absLocationPath = cloudFlareProjectLocation;

    const cwdWorker = crossPlatformPath([
      absLocationPath,
      path.basename(absLocationPath),
    ]);

    const name = path.basename(absLocationPath);
    Helpers.writeJson([absLocationPath, packageJsonSubProject], {
      name,
    });

    Helpers.writeJson([cwdWorker, packageJsonSubProject], {
      name,
    });

    const workerCore = coreCloudFlareProject.ins.From(
      coreCloudFlareProject.pathFor(coreCloudFlareProject.name),
    );

    //#region handle woker data
    (() => {
      const filesForBranding = [
        packageJsonSubProject,
        tsconfigSubProject,
        indexTsInSrcForWorker,
      ];

      workerCore.copy(filesForBranding).to([cwdWorker]);

      const magicRenameRules = `${coreCloudFlareProject.name} -> ${name}`;

      for (const relativePath of filesForBranding) {
        const filePath = crossPlatformPath([cwdWorker, relativePath]);
        if (!Helpers.isFolder(filePath)) {
          let content = UtilsFilesFoldersSync.readFile(filePath) || '';
          const rules = RenameRule.from(magicRenameRules);
          for (const rule of rules) {
            content = content
              .split('\n')
              .map(line => {
                if (
                  (line || '').trim().startsWith('imp' + 'ort') ||
                  (line || '').trim().startsWith('exp' + 'ort') ||
                  (line || '').trim().includes('@skip' + 'ReplaceTaon')
                ) {
                  return line;
                }
                return rule.replaceInString(line);
              })
              .join('\n');
          }
          if (relativePath === indexTsInSrcForWorker) {
            const dbName = HelpersTaon.getValueFromJSONC(
              [cwdWorker, wranglerJsonC],
              'kv_namespaces[0].binding',
            );
            UtilsFilesFoldersSync.writeFile(
              filePath,
              content.replace(
                new RegExp(
                  Utils.escapeStringForRegEx(KV_DATABASE_ONLINE_NAME),
                  'g',
                ),
                dbName,
              ),
            );
            UtilsTypescript.formatFile(filePath);
          } else {
            UtilsFilesFoldersSync.writeFile(filePath, content);
          }
        }
      }
    })();
    //#endregion

    //#region handle parent data
    (() => {
      const filesForBranding = [packageJsonSubProject, 'README.md', 'images'];

      coreCloudFlareProject.copy(filesForBranding).to([absLocationPath]);

      const magicRenameRules = `${coreCloudFlareProject.name} -> ${name}`;

      for (const relativePath of filesForBranding) {
        const filePath = crossPlatformPath([absLocationPath, relativePath]);
        // console.log(`isFile ${!Helpers.isFolder(filePath)} ${filePath}`)
        if (!Helpers.isFolder(filePath)) {
          let content = UtilsFilesFoldersSync.readFile(filePath);
          if (content) {
            const rules = RenameRule.from(magicRenameRules);
            for (const rule of rules) {
              content = rule.replaceInString(content);
            }
            UtilsFilesFoldersSync.writeFile(filePath, content);
          }
        }
      }
    })();
    //#endregion

    //#endregion
  };
  //#endregion

  export interface SecretKeyData {
    key: string;
    description: string;
    afterAddedFn?: () => void | Promise<void>;
  }
}
