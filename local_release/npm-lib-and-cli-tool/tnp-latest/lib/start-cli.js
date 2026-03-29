"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCli = startCli;
exports.run = run;
//#region imports
require("reflect-metadata");
const axios_1 = require("axios");
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-helpers/lib"); // @backend
// import { globalSpinner } from './constants';
const constants_1 = require("./constants");
const index_1 = require("./project/cli/index"); // @backend
//#endregion
global.frameworkName = global.frameworkName ?? lib_1.tnpPackageName;
//#region startWrapper
function startCli(argv, filename) {
    //#region @backendFunc
    const oraSpinner = require('ora');
    //#region quick fixes
    global.globalSystemToolMode = true;
    global.spinner = oraSpinner();
    //#endregion
    //#region resolve constants
    const childprocsecretarg = '-childproc';
    // const isWinGitBash = process.platform === 'win32';
    const debugMode = argv[1]?.endsWith(constants_1.debugSuffix.replace('--', '-')) ||
        argv[1]?.endsWith(constants_1.debugBrkSuffix.replace('--', '-'));
    const procType = argv[1]?.endsWith(lib_1.tnpPackageName) ||
        argv[1]?.endsWith(lib_1.taonPackageName) ||
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
    global.skipCoreCheck = argv.some(a => a.startsWith(constants_1.skipCoreCheck));
    const spinnerOnInArgs = argv.includes(constants_1.spinnerPrefix);
    const linuxWatchInArgs = argv.includes(constants_1.linuxWatchPrefix);
    global.linuxWatchInArgs = linuxWatchInArgs;
    const spinnerOffInArgs = argv.includes(`${constants_1.spinnerPrefix}=false`) ||
        argv.includes(`${constants_1.spinnerPrefix}=off`);
    //#endregion
    //#region clean argv
    argv = argv
        .filter(a => !a.startsWith(constants_1.spinnerPrefix))
        .filter(a => !a.startsWith(constants_1.linuxWatchPrefix))
        .filter(a => a !== childprocsecretarg)
        .filter(a => a !== constants_1.skipCoreCheck)
        .filter(a => !a.startsWith(constants_1.verbosePrefix))
        .map(a => (a === constants_1.websqlPrefix ? `-${constants_1.websqlPrefix}` : a));
    argv = argv.filter(f => !!f);
    process.argv = argv;
    //#endregion
    //#region spinner decision
    let startSpinner = spinnerIsDefault || spinnerOnInArgs;
    if (spinnerOffInArgs ||
        procType === 'child-of-root' ||
        debugMode ||
        verboseInArgs ||
        global.frameworkName === lib_1.tnpPackageName ||
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
                process.send?.(`${constants_1.failSpinner}::${errMSg}`);
            },
            succeed(doneMsg) {
                process.send?.(`${constants_1.succeedSpinner}::${doneMsg}`);
            },
        };
    }
    // console.log({ startSpinner, filename });
    if (startSpinner) {
        constants_1.globalSpinner.instance.start();
        const env = {
            ...process.env,
            FORCE_COLOR: '1',
        };
        const cwd = process.cwd();
        const argsToChild = [
            ...orgArgv.slice(2),
            verboseInArgs ? constants_1.verbosePrefix : '',
            global.skipCoreCheck ? constants_1.skipCoreCheck : '',
            spinnerOnInArgs ? constants_1.spinnerPrefix : '',
            linuxWatchInArgs ? constants_1.linuxWatchPrefix : '',
            childprocsecretarg,
        ].filter(Boolean);
        // console.log(argsToChild);
        const proc = lib_1.child_process.fork(filename, argsToChild, {
            env,
            cwd,
            stdio: [0, 1, 2, 'ipc'],
        });
        proc.on('exit', code => {
            constants_1.globalSpinner.instance.stop();
            // console.log('PROCESS EXIT');
            setTimeout(() => process.exit(code));
        });
        proc.on('message', msg => handleSpinnerMessage(msg?.toString() || '', constants_1.globalSpinner.instance));
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
    if (message === constants_1.startSpinner) {
        spinner.start();
    }
    else if (message === constants_1.stopSpinner) {
        console.log('SHOULD STOP SPINNER');
        spinner.stop();
    }
    else if (message?.startsWith(`${constants_1.failSpinner}::`)) {
        spinner.fail(lib_3._.first(message.split('::')));
    }
    else if (message?.startsWith(`${constants_1.succeedSpinner}::`)) {
        spinner.succeed(lib_3._.first(message.split('::')));
    }
    else {
        setText(message, message?.startsWith('log::'));
    }
    //#endregion
};
const setText = (text, toSpinner = false) => {
    //#region @backendFunc
    const spinner = constants_1.globalSpinner.instance;
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
async function run(argsv, frameworkName) {
    //#region @backendFunc
    lib_1.config.frameworkName = frameworkName;
    if (frameworkName === lib_1.tnpPackageName) {
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
    if (lib_1.taonPackageName === lib_1.config.frameworkName) {
        /**
         * ISSUE largest http request sometime are failing ... but with second try everything is OK
         */
        axios_1.default.defaults.timeout = 3000;
    }
    //#region prevent incorrect /etc/hosts file
    const isGraphicsCapableOs = lib_4.UtilsOs.isRunningInOsWithGraphicsCapableEnvironment();
    lib_2.Helpers.logInfo(`Checking your /etc/hosts file...`);
    try {
        if (!lib_2.UtilsNetwork.etcHostHasProperLocalhostIp4Entry()) {
            constants_1.globalSpinner.instance.stop();
            lib_2.Helpers.error(`Your ${lib_2.UtilsNetwork.getEtcHostsPath()} file does not have proper entry for "localhost" hostname.

      Please add:
      ${lib_2.chalk.bold('127.0.0.1 localhost')}
      `, isGraphicsCapableOs, true);
            await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
        }
    }
    catch (error) {
        console.error(`Not able to check your /etc/hosts file`);
    }
    // TODO not needed for now
    // if (!UtilsNetwork.etcHostHasProperLocalhostIp6Entry()) {
    //   Helpers.error(
    //     `Your /etc/hosts file does not have proper entry for "localhost" hostname.
    //     Please add:
    //     ${chalk.bold('::1 localhost')}
    //     `,
    //     isGraphicsCapableOs,
    //     true,
    //   );
    //   await UtilsTerminal.pressAnyKeyToContinueAsync();
    // }
    lib_2.Helpers.logInfo(`Done checking your /etc/hosts file...`);
    //#endregion
    // Helpers.log(`ins start, mode: "${mode}"`);
    const ProjectClass = (await Promise.resolve().then(() => require('./project/abstract/project'))).Project;
    ProjectClass.ins.initialCheck();
    // console.log(argsv);
    if (!global.skipCoreCheck &&
        lib_3._.isUndefined(argsv.find(a => a.startsWith('startCliService') ||
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
                    mode: lib_5.BaseCLiWorkerStartMode.DETACHED_WINDOW,
                },
                calledFrom: 'start framework function',
            },
        });
    }
    constants_1.globalSpinner.instance.stop();
    new lib_5.BaseStartConfig({
        ProjectClass: ProjectClass,
        functionsOrClasses: lib_5.BaseStartConfig.prepareArgs(index_1.default),
        argsv,
        callbackNotRecognizedCommand: async (options) => {
            lib_2.Helpers.warn('Command has not been recognized. ');
            if (await lib_2.UtilsTerminal.confirm({
                message: `Do you want to start ${lib_2.chalk.bold(lib_1.config.frameworkName)}` +
                    ` ${lib_2.chalk.bold('cli menu')} to see what you can do in this project ?`,
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
exports.default = startCli;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/start-cli.js.map