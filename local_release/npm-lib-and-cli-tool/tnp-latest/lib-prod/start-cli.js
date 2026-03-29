//#region imports
import 'reflect-metadata';
import axios from 'axios';
import { config, taonPackageName, child_process, tnpPackageName } from 'tnp-core/lib-prod';
import { chalk, Helpers__NS__error, Helpers__NS__logInfo, Helpers__NS__warn, UtilsNetwork__NS__etcHostHasProperLocalhostIp4Entry, UtilsNetwork__NS__getEtcHostsPath, UtilsTerminal__NS__confirm, UtilsTerminal__NS__pressAnyKeyToContinueAsync } from 'tnp-core/lib-prod';
import { ___NS__first, ___NS__isUndefined } from 'tnp-core/lib-prod';
import { UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment } from 'tnp-core/lib-prod';
import { BaseCLiWorkerStartMode, BaseStartConfig } from 'tnp-helpers/lib-prod'; // @backend
// import { globalSpinner } from './constants';
import { debugBrkSuffix, debugSuffix, failSpinner, globalSpinner, linuxWatchPrefix, skipCoreCheck, spinnerPrefix, startSpinner, stopSpinner, succeedSpinner, verbosePrefix, websqlPrefix, } from './constants';
import cliClassArr from './project/cli/index'; // @backend
//#endregion
global.frameworkName = global.frameworkName ?? tnpPackageName;
//#region startWrapper
export function startCli(argv, filename) {
    //#region @backendFunc
    const oraSpinner = require('ora');
    //#region quick fixes
    global.globalSystemToolMode = true;
    global.spinner = oraSpinner();
    //#endregion
    //#region resolve constants
    const childprocsecretarg = '-childproc';
    // const isWinGitBash = process.platform === 'win32';
    const debugMode = argv[1]?.endsWith(debugSuffix.replace('--', '-')) ||
        argv[1]?.endsWith(debugBrkSuffix.replace('--', '-'));
    const procType = argv[1]?.endsWith(tnpPackageName) ||
        argv[1]?.endsWith(taonPackageName) ||
        debugMode
        ? 'root'
        : argv.find(a => a.startsWith(childprocsecretarg))
            ? 'child-of-root'
            : 'child-of-child';
    // console.log({ procType, argv });
    global.spinnerInParentProcess = procType === 'child-of-root';
    const orgArgv = [...argv];
    global.tnpNonInteractive = argv.some(a => a.startsWith('--tnpNonInteractive'));
    const spinnerIsDefault = !global.tnpNonInteractive;
    const verboseInArgs = !global.hideLog;
    global.skipCoreCheck = argv.some(a => a.startsWith(skipCoreCheck));
    const spinnerOnInArgs = argv.includes(spinnerPrefix);
    const linuxWatchInArgs = argv.includes(linuxWatchPrefix);
    global.linuxWatchInArgs = linuxWatchInArgs;
    const spinnerOffInArgs = argv.includes(`${spinnerPrefix}=false`) ||
        argv.includes(`${spinnerPrefix}=off`);
    //#endregion
    //#region clean argv
    argv = argv
        .filter(a => !a.startsWith(spinnerPrefix))
        .filter(a => !a.startsWith(linuxWatchPrefix))
        .filter(a => a !== childprocsecretarg)
        .filter(a => a !== skipCoreCheck)
        .filter(a => !a.startsWith(verbosePrefix))
        .map(a => (a === websqlPrefix ? `-${websqlPrefix}` : a));
    argv = argv.filter(f => !!f);
    process.argv = argv;
    //#endregion
    //#region spinner decision
    let startSpinner = spinnerIsDefault || spinnerOnInArgs;
    if (spinnerOffInArgs ||
        procType === 'child-of-root' ||
        debugMode ||
        verboseInArgs ||
        global.frameworkName === tnpPackageName ||
        global.skipCoreCheck) {
        startSpinner = false;
    }
    //#endregion
    //#region child process wrapper
    if (procType === 'root') {
        global.spinner = {
            start() {
                process.send?.(startSpinner);
            },
            stop() {
                process.send?.(startSpinner);
            },
            fail(errMSg) {
                process.send?.(`${failSpinner}::${errMSg}`);
            },
            succeed(doneMsg) {
                process.send?.(`${succeedSpinner}::${doneMsg}`);
            },
        };
    }
    // console.log({ startSpinner, filename });
    if (startSpinner) {
        globalSpinner.instance.start();
        const env = {
            ...process.env,
            FORCE_COLOR: '1',
        };
        const cwd = process.cwd();
        const argsToChild = [
            ...orgArgv.slice(2),
            verboseInArgs ? verbosePrefix : '',
            global.skipCoreCheck ? skipCoreCheck : '',
            spinnerOnInArgs ? spinnerPrefix : '',
            linuxWatchInArgs ? linuxWatchPrefix : '',
            childprocsecretarg,
        ].filter(Boolean);
        // console.log(argsToChild);
        const proc = child_process.fork(filename, argsToChild, {
            env,
            cwd,
            stdio: [0, 1, 2, 'ipc'],
        });
        proc.on('exit', code => {
            globalSpinner.instance.stop();
            // console.log('PROCESS EXIT');
            setTimeout(() => process.exit(code));
        });
        proc.on('message', msg => handleSpinnerMessage(msg?.toString() || '', globalSpinner.instance));
    }
    else {
        run(argv, global.frameworkName);
    }
    //#endregion
    //#endregion
}
//#endregion
//#region helpers
const handleSpinnerMessage = (message, spinner) => {
    //#region @backendFunc
    message = (message || '').trimLeft();
    if (message === startSpinner) {
        spinner.start();
    }
    else if (message === stopSpinner) {
        console.log('SHOULD STOP SPINNER');
        spinner.stop();
    }
    else if (message?.startsWith(`${failSpinner}::`)) {
        spinner.fail(___NS__first(message.split('::')));
    }
    else if (message?.startsWith(`${succeedSpinner}::`)) {
        spinner.succeed(___NS__first(message.split('::')));
    }
    else {
        setText(message, message?.startsWith('log::'));
    }
    //#endregion
};
const setText = (text, toSpinner = false) => {
    //#region @backendFunc
    const spinner = globalSpinner.instance;
    if (text)
        text = text.split('::').slice(1).join('::');
    if (spinner) {
        if (toSpinner) {
            spinner.text = text.replace(/\s+/g, ' ');
        }
        else {
            console.log(text);
        }
    }
    else {
        console.log(text);
    }
    //#endregion
};
//#endregion
//#region run
export async function run(argsv, frameworkName) {
    //#region @backendFunc
    config.frameworkName = frameworkName;
    if (frameworkName === tnpPackageName) {
        process.on('unhandledRejection', (err, promise) => {
            const reason = err;
            console.error('Unhandled Promise Rejection at:', promise);
            console.error('Reason:', reason);
            // Optional: get full stack trace even for objects
            if (reason && typeof reason === 'object') {
                console.error('Error name:', reason.name);
                console.error('Error message:', reason.message);
                console.error('Error stack:\n', reason.stack || 'No stack');
            }
            else {
                console.error(`Error occurred`);
                console.trace('Error:', reason);
            }
            process.exit(1);
            // Prevent crash during development
            // In production, you might want to log and exit gracefully
            // process.exit(1);
        });
    }
    if (taonPackageName === config.frameworkName) {
        /**
         * ISSUE largest http request sometime are failing ... but with second try everything is OK
         */
        axios.defaults.timeout = 3000;
    }
    //#region prevent incorrect /etc/hosts file
    const isGraphicsCapableOs = UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment();
    Helpers__NS__logInfo(`Checking your /etc/hosts file...`);
    try {
        if (!UtilsNetwork__NS__etcHostHasProperLocalhostIp4Entry()) {
            globalSpinner.instance.stop();
            Helpers__NS__error(`Your ${UtilsNetwork__NS__getEtcHostsPath()} file does not have proper entry for "localhost" hostname.

      Please add:
      ${chalk.bold('127.0.0.1 localhost')}
      `, isGraphicsCapableOs, true);
            await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
        }
    }
    catch (error) {
        console.error(`Not able to check your /etc/hosts file`);
    }
    // TODO not needed for now
    // if (!UtilsNetwork__NS__etcHostHasProperLocalhostIp6Entry()) {
    //   Helpers__NS__error(
    //     `Your /etc/hosts file does not have proper entry for "localhost" hostname.
    //     Please add:
    //     ${chalk.bold('::1 localhost')}
    //     `,
    //     isGraphicsCapableOs,
    //     true,
    //   );
    //   await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
    // }
    Helpers__NS__logInfo(`Done checking your /etc/hosts file...`);
    //#endregion
    // Helpers__NS__log(`ins start, mode: "${mode}"`);
    const ProjectClass = (await import('./project/abstract/project')).Project;
    ProjectClass.ins.initialCheck();
    // console.log(argsv);
    if (!global.skipCoreCheck &&
        ___NS__isUndefined(argsv.find(a => a.startsWith('startCliService') ||
            a.startsWith('kill') ||
            a.startsWith('clear') ||
            a.startsWith('reinstall') ||
            a.startsWith('push') ||
            a.startsWith('pul') ||
            a.startsWith('mp3') ||
            a.startsWith('mp4') ||
            a.startsWith('dedupe') ||
            a.startsWith('cloud:') ||
            a.startsWith('link:') ||
            a.startsWith('copy:and:rename') ||
            a.startsWith('generate') ||
            a.startsWith('shorten') ||
            a.startsWith('vscode') ||
            a.startsWith('repush') ||
            a === 'dumpPackagesVersions' ||
            a === 'melt' ||
            a === 'soft' ||
            a === 'local:sync' ||
            a === 'localSync' ||
            a === 'localsync' ||
            a === 'cloud' ||
            a === 'link' ||
            a === 'up' ||
            a === 'apiup' ||
            a === 'apiupforce')) // for workers
    ) {
        // console.log('starting projects workers...');
        await ProjectClass.ins.taonProjectsWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    mode: BaseCLiWorkerStartMode.DETACHED_WINDOW,
                },
                calledFrom: 'start framework function',
            },
        });
    }
    globalSpinner.instance.stop();
    new BaseStartConfig({
        ProjectClass: ProjectClass,
        functionsOrClasses: BaseStartConfig.prepareArgs(cliClassArr),
        argsv,
        callbackNotRecognizedCommand: async (options) => {
            Helpers__NS__warn('Command has not been recognized. ');
            if (await UtilsTerminal__NS__confirm({
                message: `Do you want to start ${chalk.bold(config.frameworkName)}` +
                    ` ${chalk.bold('cli menu')} to see what you can do in this project ?`,
                defaultValue: true,
            })) {
                await ProjectClass.ins.taonProjectsWorker.terminalUI.infoScreen();
            }
            else {
                process.exit(0);
            }
        },
        shortArgsReplaceConfig: {
            //#region short args replacement
            // TODO use UtilsCliClassMethod !!!
            il: 'release:install:locally',
            ilvscodeplugin: 'release:install:locally:vscode:plugin',
            ilvscodepluginprod: 'release:install:locally:vscode:plugin:prod',
            ilclitool: 'release:install:locally:cli:tool',
            ilclitoolprod: 'release:install:locally:cli:tool:prod',
            cil: 'release:clear:install:locally',
            'install:locally': 'release:install:locally',
            cinit: 'init:clearInit',
            a: 'app',
            an: 'app:normal',
            aw: 'app:websql',
            ba: 'build:app',
            b: 'build',
            bl: 'build:lib',
            blp: 'build:lib:prod',
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
            sd: 'simulateDomain',
            simd: 'simulateDomain',
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
            'set:framework:ver': 'version:set:framework:version',
            'set:framework:version': 'version:set:framework:version',
            // 'ra': 'release:all',
            e: 'electron',
            sub: 'subproject',
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
            taonjson: 'recreateTaonJsonSchema',
            p: 'push',
            pl: 'pull',
            //#endregion
        },
    });
    //#endregion
}
//#endregion
export default startCli;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/start-cli.js.map