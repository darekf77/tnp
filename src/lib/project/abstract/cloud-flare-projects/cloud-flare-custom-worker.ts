//#region imports
import { apiPrefix, Models } from 'taon/src';
import {
  crossPlatformPath,
  fileName,
  GlobalStorage,
  Helpers,
  startAsync,
  taonActionFromParent,
  UtilsExecProc,
  UtilsFilesFoldersSync,
  UtilsOs,
  UtilsProcess,
  UtilsSecretEnv,
  startAsyncProc,
  UtilsTempFolder,
  path,
  chalk,
} from 'tnp-core/src';

import { pingUrl } from '../../../app-utils';
import {
  browserWorkerBuild,
  buildDevMinifyJS,
  buildDevNormalJS,
  buildJSprod,
  distFromWorkerBuild,
  externalJs,
  wranglerJsonC,
} from '../../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../../options';

import { CloudFlareSubProject } from './cloud-flare-project';
import { CloudFlarePorjectsUtils } from './cloud-flare-projects.utils';
import {
  executeRemoteMigrationSql,
  prepareRemoteDeploymentSql,
} from './cloudfalre-migrations';
//#endregion

export class CloudCustomWorkerProject extends CloudFlareSubProject {
  constructor(...args) {
    // @ts-ignore
    super(...args);

    const browserFolder = crossPlatformPath([
      this.cwdWorker,
      browserWorkerBuild,
    ]);
    if (!Helpers.exists(browserFolder)) {
      Helpers.mkdirp(browserFolder);
    }
  }

  //#region start in dev mode
  async startInDevMode(envOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    const masterKey = await this.getMaterKey();
    const ngCloudflareWorkerPort = await this.getWorkerPortNum(envOptions);

    Helpers.removeFileIfExists([this.cwdWorker, '.env']);

    const cloudflareBuildFile = envOptions.build.prod
      ? buildJSprod
      : envOptions.release.nodeBackendApp.minify
        ? buildDevMinifyJS
        : buildDevNormalJS;

    Helpers.info(`Using build file: ${cloudflareBuildFile}`);
    await UtilsExecProc.spawnAsync(`npm-run bun run ${cloudflareBuildFile}`, {
      cwd: this.cwdWorker,
      showOutput: true,
      showOutputColor: true,
    }).waitUntilDoneOrThrow({
      successOutputMessage: 'Compilation Done',
    });

    // const taonActionFromParentName = GlobalStorage.get(taonActionFromParent);
    const tempFolder = await UtilsTempFolder.getPath({
      prefix: 'temp-cloudflare',
    });

    Helpers.logInfo(`Using temp folder ${tempFolder}`);

    const command =
      `npm run start -- ` +
      `--var TAON_LOCAL_DEV:true  ` +
      `--var ${UtilsSecretEnv.MASTER_PASS_KEY}:"${masterKey}" ` +
      `--port ${ngCloudflareWorkerPort} ` +
      `${Helpers.getIsVerboseMode() ? '--log-level debug' : ''} ` +
      ` --persist-to ${tempFolder} `;

    Helpers.info(`Executing command:

      ${command}

      `);

    await startAsync(command, this.cwdWorker, {
      uniqueName: `cloudflare`,
      prefix: true,
      outputLineReplace: line => {
        // console.log({ line });
        if (line.includes('Ready on')) {
          let url = extractWranglerReadyUrl(line);
          if (url) {
            void pingUrl(url);
          }
        }
        const errorPath = 'at null.<anonymous> (';
        if (line.includes(errorPath)) {
          line = line.replace(
            errorPath,
            `(${this.cwdWorker}/${distFromWorkerBuild}/`,
          );
        }
        return line;
      },
    });
    //#endregion
  }
  //#endregion

  //#region gather migration sql
  async gatherMigrationSQL(
    envOptions: EnvOptions,
    deploy = false,
  ): Promise<void> {
    //#region @backendFunc
    const masterKey = await this.getMaterKey();
    const ngCloudflareWorkerPort = await this.getWorkerPortNum(envOptions);

    Helpers.info(`Killling process ${ngCloudflareWorkerPort}`);
    await UtilsProcess.killProcessOnPort(ngCloudflareWorkerPort, true);

    Helpers.removeFileIfExists([this.cwdWorker, '.env']);

    const cloudflareBuildFile = envOptions.build.prod
      ? buildJSprod
      : envOptions.release.nodeBackendApp.minify
        ? buildDevMinifyJS
        : buildDevNormalJS;

    Helpers.info(`Using build file: ${cloudflareBuildFile}`);
    await UtilsExecProc.spawnAsync(`npm-run bun run ${cloudflareBuildFile}`, {
      cwd: this.cwdWorker,
      showOutput: true,
      showOutputColor: true,
    }).waitUntilDoneOrThrow({
      successOutputMessage: 'Compilation Done',
    });

    // const taonActionFromParentName = GlobalStorage.get(taonActionFromParent);
    const tempFolder = await UtilsTempFolder.getPath({
      prefix: 'temp-cloudflare',
    });

    // Helpers.remove(tempFolder);

    Helpers.logInfo(`Using temp folder ${tempFolder}`);

    const command =
      `npm run start -- ` +
      `--var TAON_LOCAL_DEV:true  ` +
      `--var DISPLAY_RAW_SQL_COMMANDS:true  ` +
      `--var ${UtilsSecretEnv.MASTER_PASS_KEY}:"${masterKey}" ` +
      `--port ${ngCloudflareWorkerPort} ` +
      ` --persist-to ${tempFolder} `;

    Helpers.info(`Executing command:

      ${command}

      `);

    const queries: string[] = [];

    await startAsyncProc(command, this.cwdWorker, {
      uniqueName: `cloudflare`,
      prefix: true,
      resolvePromiseMsg_stderr: ['$$$ APP_READY $$$'],
      resolvePromiseMsg_stdout: ['$$$ APP_READY $$$'],
      // hideOutput_stdout: true,
      // hideOutput_stderr: true,
      outputLineReplace: line => {
        if (line.includes('query: ')) {
          queries.push(line);
        }
        if (line.includes('Ready on')) {
          let url = extractWranglerReadyUrl(line);
          if (url) {
            void pingUrl(url);
          }
        }
        const errorPath = 'at null.<anonymous> (';
        if (line.includes(errorPath)) {
          line = line.replace(
            errorPath,
            `(${this.cwdWorker}/${distFromWorkerBuild}/`,
          );
        }
        return line;
      },
    });

    // TODO @LAST split this into contexts
    const generatedSql = queries
      .map(c => c.replace(/^query\:/, '').trim())
      .filter(f => !!f)
      .join('\n');

    // const sqlResult = Models.getSqlFor(
    //   Models.DBRecreateMode.PRESERVE_DATA_MIGRATIONS,
    //   sqlData,
    // );

    const contextsNames = this.taonParentProject.framework
      .getAllDetectedTaonContexts({
        skipLibFolder: true,
      })
      .map(c => c.contextName);

    for (let index = 0; index < contextsNames.length; index++) {
      const contextName = contextsNames[index];
      const task = Helpers.actionStarted(
        `Applying migration for context: ${contextName}`,
      );
      const plan = await prepareRemoteDeploymentSql({
        mode: Models.DBRecreateMode.PRESERVE_DATA_MIGRATIONS,
        sql: generatedSql,
        cwd: this.cwdWorker,
        database: 'TAON_D1',
        context: contextName,
      });

      console.log('Pending:', plan.pending);
      console.log('New:', plan.newMigrations);
      console.log('Skipped:', plan.skipped);
      if (deploy) {
        await executeRemoteMigrationSql(plan.sql, this.cwdWorker, contextName);
      } else {
        const file = crossPlatformPath([
          this.cwdWorker,
          `tmp-taon-migrations/migration-${contextName}-${new Date().getTime()}.sql`,
        ]);
        if (!Helpers.exists(path.dirname(file))) {
          Helpers.mkdirp(path.dirname(file));
        }
        Helpers.warn(
          `Skipping sql migrations deployment (ctx=${contextName}), created file:
${chalk.bold(file)}`,
        );
        UtilsFilesFoldersSync.writeFile(file, plan.sql);
      }

      task.done();
    }

    Helpers.info(`DONE GATHERING DATA! `);
    process.exit(0);
    //#endregion
  }
  //#endregion

  //#region privat methods / get worker port number
  private async getWorkerPortNum(envOptions: EnvOptions): Promise<number> {
    //#region @backendFunc
    const ngCloudflareWorkerPort =
      await this.taonParentProject.artifactsManager.artifact.angularNodeApp.appHostsRecreateHelper.NODE_BACKEND_PORT_UNIQ_KEY(
        envOptions.clone({
          build: {
            cloudflare: true,
          },
        }),
      );
    return ngCloudflareWorkerPort;
    //#endregion
  }
  //#endregion

  //#region privat methods /  get master key
  private async getMaterKey(): Promise<string> {
    //#region @backendFunc
    const ctrl =
      await this.taonParentProject.ins.taonProjectsWorker.secretsKeychainPackagesWorker.getRemoteControllerFor(
        {
          methodOptions: {
            calledFrom: 'cloudflare deployment',
          },
        },
      );
    const masterKey = (
      await ctrl.getMasterPassword(this.taonParentProject.location).request()
    ).body.text;

    return masterKey;
    //#endregion
  }
  //#endregion

  //#region API / get files for branding worker
  public getFilesForBrandingWorker(): CloudFlarePorjectsUtils.FilesForSubProjectBranding[] {
    const filesForBranding: CloudFlarePorjectsUtils.FilesForSubProjectBranding[] =
      [
        ...super.getFilesForBrandingWorker(),
        { relativePath: buildDevMinifyJS },
        { relativePath: buildDevNormalJS },
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
  //#endregion
}

//#region strip ansi
export function stripAnsi(input: string): string {
  return input.replace(
    // ANSI/VT100 escape sequences

    /\x1B(?:[@-_][0-?]*[ -/]*[@-~]|\[[0-?]*[ -/]*[@-~])/g,
    '',
  );
}
//#endregion

//#region extract wrangler ready url
export function extractWranglerReadyUrl(output: string): string | undefined {
  const clean = stripAnsi(output);

  return clean.match(
    /\[wrangler:info\]\s+Ready on\s+(https?:\/\/[^\s]+)/i,
  )?.[1];
}
//#endregion
