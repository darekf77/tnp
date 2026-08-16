import {
  fileName,
  Helpers,
  startAsync,
  UtilsExecProc,
  UtilsOs,
} from 'tnp-core/src';

import {
  buildJS,
  buildJSprod,
  externalJs,
  wranglerJsonC,
} from '../../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../../options';

import { CloudFlareSubProject } from './cloud-flare-project';
import { CloudFlarePorjectsUtils } from './cloud-flare-projects.utils';

export class CloudCustomWorkerProject extends CloudFlareSubProject {
  //#region start in dev mode
  async startInDevMode(envOptions: EnvOptions): Promise<void> {
    //#region @backendFunc

    await UtilsExecProc.spawnAsync(
      `npm-run bun run ${envOptions.build.prod ? buildJSprod : buildJS}`,
      {
        cwd: this.cwdWorker,
        showOutput: true,
        showOutputColor: true,
      },
    ).waitUntilDoneOrThrow({
      successOutputMessage: 'Compilation Done',
    });

    const ngCloudflareWorkerPort =
      await this.taonParentProject.artifactsManager.artifact.angularNodeApp.appHostsRecreateHelper.NODE_BACKEND_PORT_UNIQ_KEY(
        envOptions.clone({
          build: {
            cloudflare: true,
          },
        }),
      );

    await startAsync(
      `npm run start -- --port ${ngCloudflareWorkerPort} ` +
        `${Helpers.getIsVerboseMode() ? '--log-level debug' : ''} ` +
        ` --persist-to ${UtilsOs.getTempFolder({
          prefix: 'temp-cloudflare',
        })} `,
      this.cwdWorker,
      {
        uniqueName: `cloudflare`,
        prefix: true,
        outputLineReplace: line => {
          // console.log({ line });
          if (line.includes('Ready on')) {
            let url = extractWranglerReadyUrl(line);
            if (url) {
              url = `${url}/api/`;
              console.log(`PINGING FOR INIT "${url}"`);
              fetch(url);
            }
          }
          return line;
        },
      },
    );
    //#endregion
  }
  //#endregion

  public getFilesForBrandingWorker(): CloudFlarePorjectsUtils.FilesForSubProjectBranding[] {
    const filesForBranding: CloudFlarePorjectsUtils.FilesForSubProjectBranding[] =
      [
        ...super.getFilesForBrandingWorker(),
        { relativePath: buildJS },
        { relativePath: buildJSprod },
        { relativePath: externalJs },
        { relativePath: wranglerJsonC },
        {
          relativePath: fileName._gitignore,
          beforeSave: (content: string) => {
            if (!content.startsWith(wranglerJsonC)) {
              content = `${wranglerJsonC}\n${content}`;
            }
            content = content.replace('!/browser', '');
            return content;
          },
        },
      ];
    return filesForBranding;
  }
}

export function stripAnsi(input: string): string {
  return input.replace(
    // ANSI/VT100 escape sequences

    /\x1B(?:[@-_][0-?]*[ -/]*[@-~]|\[[0-?]*[ -/]*[@-~])/g,
    '',
  );
}

export function extractWranglerReadyUrl(output: string): string | undefined {
  const clean = stripAnsi(output);

  return clean.match(
    /\[wrangler:info\]\s+Ready on\s+(https?:\/\/[^\s]+)/i,
  )?.[1];
}
