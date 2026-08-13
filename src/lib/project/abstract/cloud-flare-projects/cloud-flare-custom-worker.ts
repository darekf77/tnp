import { Helpers, startAsync, UtilsExecProc } from 'tnp-core/src';

import { buildJS, buildJSprod } from '../../../constants';

import { CloudFlareProject } from './cloud-flare-project';
import { CloudFlarePorjectsUtils } from './cloud-flare-projects.utils';

export class CloudCustomWorkerProject extends CloudFlareProject {
  //#region start in dev mode
  async startInDevMode(opt?: { prod?: boolean }): Promise<void> {
    //#region @backendFunc
    opt = opt || {};
    await UtilsExecProc.spawnAsync(
      `npm-run bun run ${opt.prod ? buildJSprod : buildJS}`,
      {
        cwd: this.cwdWorker,
        showOutput: true,
        showOutputColor: true,
      },
    ).waitUntilDoneOrThrow({
      successOutputMessage: 'Compilation Done',
    });

    await startAsync(`npm run start`, this.cwdWorker, {
      uniqueName: `cloudflare`,
      prefix: true,
      outputLineReplace: line => {
        // console.log({ line });
        if (line.includes('Ready on')) {
          const url = extractWranglerReadyUrl(line);
          if (url) {
            console.log(`PINGING FOR INIT "${url}"`);
            fetch(url);
          }
        }
        return line;
      },
    });
    //#endregion
  }
  //#endregion
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
