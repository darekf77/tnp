//#region imports
import axios from 'axios';
import { config } from 'tnp-config/src';
import { chalk, Helpers, UtilsTerminal } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { BaseStartConfig } from 'tnp-helpers/src';

import cliClassArr from './project/cli/index';

//#endregion

//#region constants
/**
 * ISSUE largest http request sometime are failing ... but with second try everything is OK
 */
axios.defaults.timeout = 3000;
//#endregion

export async function start(
  argsv: string[],
  frameworkName: 'tnp' | 'taon' = 'tnp',
  mode: 'dist' | 'npm' = 'dist',
): Promise<void> {
  config.frameworkName = frameworkName;

  // Helpers.log(`ins start, mode: "${mode}"`);
  const ProjectClass = (await import('./project/abstract/project')).Project;
  ProjectClass.ins.initialCheck();

  // console.log(argsv);
  if (
    !global.skipCoreCheck &&
    _.isUndefined(
      argsv.find(
        a =>
          a.startsWith('startCliService') ||
          a.startsWith('kill') ||
          a.startsWith('reinstall') ||
          a.startsWith('push') ||
          a.startsWith('pul') ||
          a.startsWith('mp3') ||
          a.startsWith('mp4') ||
          a.startsWith('dedupe') ||
          a === 'cloud',
      ),
    ) // for workers
  ) {
    // console.log('starting projects workers...');

    await ProjectClass.ins.taonProjectsWorker.startDetachedIfNeedsToBeStarted();
  }

  // TODO @LAST
  // process.on('unhandledRejection', (reason, promise) => {
  //   console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
  //   debugger;
  //   if (reason instanceof Error) {
  //     console.error(reason.stack);
  //   }
  // });

  new BaseStartConfig({
    ProjectClass: ProjectClass as any,
    functionsOrClasses: BaseStartConfig.prepareArgs(cliClassArr),
    argsv,
    callbackNotRecognizedCommand: async options => {
      Helpers.warn('Command has not been recognized. ');
      if (
        await UtilsTerminal.confirm({
          message:
            `Do you want to start ${chalk.bold(config.frameworkName)}` +
            ` ${chalk.bold('cli menu')} to see what you can do in this project ?`,
          defaultValue: true,
        })
      ) {
        await ProjectClass.ins.taonProjectsWorker.terminalUI.infoScreen();
      } else {
        process.exit(0);
      }
    },
    shortArgsReplaceConfig: {
      //#region short args replacement
      il: 'release:install:locally',
      cil: 'release:clear:install:locally',
      'install:locally': 'release:install:locally',
      cinit: 'init:clearInit',
      ba: 'build:app',
      b: 'build',
      bl: 'build:lib',
      bvscode: 'build:vscode',
      d: 'docs',
      dw: 'docs:watch',
      cb: 'build:clean:build',
      cbuild: 'build:clean:build',
      baw: 'build:watchApp',
      bw: 'build:watch',
      bwl: 'build:watchLib',
      bwa: 'build:watchApp',
      bwaw: 'build:watchAppWebsql',
      bwvscode: 'build:watchVscode',
      bwe: 'build:watchElectron',
      bew: 'build:watchElectron',
      bwew: 'build:watchElectronWebsql',
      beww: 'build:watchElectronWebsql',
      cbwl: 'build:clean:watch:lib',
      cbl: 'build:clean:lib',
      cbuildwwatch: 'build:clean:watch',
      c: 'clear',
      s: 'build:start',
      start: 'build:start',
      startElectron: 'build:start:electron',
      se: 'build:start:electron',
      cse: 'build:clear:start:electron',
      cstart: 'build:start:clean',
      cs: 'build:start:clean',
      mkdocs: 'build:mkdocs',
      ew: 'electron:watch',
      r: 'release',
      rl: 'release:local',
      rlnpm: 'release:localCliLib',
      rlelectron: 'release:localElectron',
      rlvscode: 'release:localVscode',
      rc: 'release:cloud',
      rm: 'release:manual',
      rmajor: 'release:major',
      rminor: 'release:minor',
      setFrameworkVersion: 'version:setFrameworkVersion',
      'r:major': 'release:major',
      'r:minor': 'release:minor',
      'set:minor:version': 'release:set:minor:version',
      'set:major:version': 'release:set:major:version',
      'set:minor:ver': 'release:set:minor:version',
      'set:major:ver': 'release:set:major:version',
      'set:framework:ver': 'release:set:framework:version',
      'set:framework:version': 'release:set:framework:version',
      // 'ra': 'release:all',
      e: 'electron',
      ekill: 'electron:kill',
      car: 'release:auto:clear',
      autorelease: 'release:auto',
      ar: 'release:auto',
      ard: 'release:auto:docs',
      re: 'reinstall',
      '--version': 'version',
      '-v': 'version',
      // open
      occ: 'open:core:container',
      ocp: 'open:core:project',
      o: 'open',
      or: 'open:release',
      // test
      twd: 'test:watch:debug',
      tdw: 'test:watch:debug',
      tw: 'test:watch',
      td: 'test:debug',
      t: 'test',
      // migrations
      m: 'migration',
      mc: 'migration:create',
      mr: 'migration:run',
      mrun: 'migration:run',
      mrw: 'migration:revert',
      mrev: 'migration:revert',
      mrevert: 'migration:revert',
      mctxs: 'migration:contexts',
      // vscode
      vsce: 'vscode:vsce',
      vts: 'vscode:temp:show',
      vth: 'vscode:temp:hide',
      hide: 'vscode:temp:hide',
      show: 'vscode:temp:show',
      simulate: 'simulateDomain',
      //#endregion
    },
  });
}

export default start;
