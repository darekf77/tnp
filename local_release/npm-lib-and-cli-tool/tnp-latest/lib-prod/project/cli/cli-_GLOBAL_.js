//#region imports
import { incrementalWatcher, } from 'incremental-compiler/lib-prod';
import * as semver from 'semver';
import { config, dotTaonFolder, GlobalTaskManager, LibTypeEnum, taonContainers, tnpPackageName, UtilsFilesFoldersSync__NS__getFilesFrom, UtilsFilesFoldersSync__NS__getFoldersFrom, UtilsFilesFoldersSync__NS__IGNORE_FOLDERS_FILES_PATTERNS } from 'tnp-core/lib-prod';
import { psList, UtilsEtcHosts__NS__getPath, UtilsJson__NS__getAtrributiesFromJsonWithComments, UtilsOs__NS__commandExistsAsync, UtilsOs__NS__getInotifyWatchCount, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__sendNotification } from 'tnp-core/lib-prod';
import { chokidar, dateformat, requiredForDev, UtilsProcess__NS__getBashOrShellName, UtilsProcess__NS__killAllJava, UtilsProcess__NS__killAllOtherNodeProcesses, UtilsProcess__NS__startInNewTerminalWindow } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, PROGRESS_DATA, chalk, os, ___NS__debounce, ___NS__first, ___NS__isNumber, ___NS__isString, ___NS__last, Utils__NS__wait } from 'tnp-core/lib-prod';
import { CLI } from 'tnp-core/lib-prod';
import { UtilsTerminal__NS__confirm, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute } from 'tnp-core/lib-prod';
import { FilePathMetaData__NS__extractData } from 'tnp-core/lib-prod';
import { UtilsCliClassMethod__NS__decoratorMethod, UtilsCliClassMethod__NS__getFrom } from 'tnp-core/lib-prod';
import { UtilsNetwork__NS__setEtcHost } from 'tnp-core/lib-prod';
import { BaseGlobalCommandLine, Helpers__NS__clearConsole, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__info, Helpers__NS__killProcessByPort, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__readFile, Helpers__NS__remove, Helpers__NS__run, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__killAllNode, HelpersTaon__NS__move, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__setValueToJSON, UtilsNpm__NS__clearVersion, UtilsNpm__NS__fixMajorVerNumber, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__parseTsDiagnostic, UtilsTypescript__NS__recognizeImportsFromFile } from 'tnp-helpers/lib-prod';
import { BaseCLiWorkerStartMode } from 'tnp-helpers/lib-prod';
import { createGenerator, } from 'ts-json-schema-generator';
import { CURRENT_PACKAGE_VERSION } from '../../build-info._auto-generated_';
import { containerPrefix, globalSpinner, keysMap, nodeModulesMainProject, packageJsonMainProject, readmeMdMainProject, result_packages_json, srcMainProject, taonConfigSchemaJsonContainer, taonConfigSchemaJsonStandalone, taonJsonMainProject, tmpIsomorphicPackagesJson, tsconfigForSchemaJson, } from '../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../options';
import { Project } from '../abstract/project';
//#endregion
export class $Global extends BaseGlobalCommandLine {
    async _() {
        //#region @backendFunc
        await this.ins.taonProjectsWorker.terminalUI.infoScreen();
        //#endregion
    }
    async hasSudoCommand() {
        //#region @backendFunc
        const hasSudo = await UtilsOs__NS__commandExistsAsync('sudo');
        console.log(`Your os has sudo: ${hasSudo}`);
        this._exit();
        //#endregion
    }
    anymatch() {
        //#region @backendFunc
        // const anymatch = require('anymatch');
        // const f = '/home/dfilipiak/projects/npm/taon-dev/taon/tmp-all-assets-linked';
        // const exclude = anymatch([
        //   '/home/dfilipiak/projects/npm/taon-dev/taon/tmp-*/**',
        //   '/home/dfilipiak/projects/npm/taon-dev/taon/tmp-*',
        //   '/home/dfilipiak/projects/npm/taon-dev/taon/tmp-all-assets-linked',
        // ], path.basename(f));
        // Helpers__NS__info(`
        //           exclude folder ${f} : ${exclude}`);
        // this._exit();
        //#endregion
    }
    //#region add etc hosts entry
    addEtcHostsEntry() {
        //#region @backendFunc
        const [ip, domain, comment] = this.args || [];
        UtilsNetwork__NS__setEtcHost(domain, ip, comment);
        Helpers__NS__info(`Added entry: ${chalk.bold(`${ip} ${domain}`)} to ${UtilsEtcHosts__NS__getPath()} `);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region simulate domain
    simulateDomain() {
        //#region @backendFunc
        if (this.project?.framework?.isStandaloneProject) {
            const domain = this.project.environmentConfig.getEnvMain()?.website?.domain;
            if (domain) {
                this.args = [domain, ...this.args];
                return super.simulateDomain();
            }
        }
        super.simulateDomain();
        //#endregion
    }
    //#endregion
    //#region detect packages
    async detectPackages() {
        //#region @backendFunc
        this.project.removeFile(tmpIsomorphicPackagesJson);
        await this.project.packagesRecognition.start('detecting packages');
        this._exit();
        //#endregion
    }
    //#endregion
    //#region kill process on port
    async killonport() {
        //#region @backendFunc
        const port = parseInt(this.firstArg);
        await Helpers__NS__killProcessByPort(port);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region kill all node processes
    killAllNode() {
        //#region @backendFunc
        HelpersTaon__NS__killAllNode();
        this._exit();
        //#endregion
    }
    //#endregion
    //#region kill all node
    async killAllJava() {
        //#region @backendFunc
        Helpers__NS__info('Killing all java processes...');
        await UtilsProcess__NS__killAllJava();
        Helpers__NS__info('DONE KILL ALL JAVA PROCESSES');
        this._exit();
        //#endregion
    }
    //#endregion
    //#region fork
    async fork() {
        //#region @backendFunc
        Helpers__NS__error(`Not implemented yet`, false, true);
        return; // TODO @LAST
        const argv = this.args;
        const githubUrl = ___NS__first(argv);
        let projectName = ___NS__last(githubUrl.replace('.git', '').split('/'));
        if (argv.length > 1) {
            projectName = argv[1];
        }
        Helpers__NS__info(`Forking ${githubUrl} with name ${projectName}`);
        await this.project.git.clone(githubUrl, projectName);
        let newProj = this.ins.From(path.join(this.project.location, projectName));
        HelpersTaon__NS__setValueToJSON(path.join(newProj.location, packageJsonMainProject), 'name', projectName);
        HelpersTaon__NS__setValueToJSON(path.join(newProj.location, packageJsonMainProject), 'version', '0.0.0');
        Helpers__NS__writeFile(newProj.pathFor(readmeMdMainProject), `
  # ${projectName}

  based on ${githubUrl}

    `);
        Helpers__NS__run(`${await this.ins.editor()} ${newProj.location}`).sync();
        Helpers__NS__info(`Done`);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region watcher linux
    watchersfix() {
        //#region @backendFunc
        Helpers__NS__run(`echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`).sync();
        this._exit();
        //#endregion
    }
    watchers() {
        //#region @backendFunc
        Helpers__NS__run(`find /proc/*/fd -user "$USER" -lname anon_inode:inotify -printf '%hinfo/%f\n' 2>/dev/null | xargs cat | grep -c '^inotify'`).sync();
        this._exit();
        //#endregion
    }
    //#endregion
    //#region code instal ext
    async code() {
        //#region @backendFunc
        this.project
            .run(`${await this.ins.editor()} --install-extension ${this.args.join(' ')}`)
            .sync();
        this._exit();
        //#endregion
    }
    //#endregion
    //#region proper watcher test
    async PROPERWATCHERTEST(engine) {
        //#region @backendFunc
        // const proj = this.project as Project;
        const cwd = this.cwd;
        const watchLocation = crossPlatformPath([cwd, srcMainProject]);
        const symlinkCatalog = crossPlatformPath([cwd, 'symlinkCatalog']);
        const symlinkCatalogInWatch = crossPlatformPath([watchLocation, 'symlink']);
        const symlinkCatalogFile = crossPlatformPath([
            cwd,
            'symlinkCatalog',
            'aaa.txt',
        ]);
        const options = {
            name: `[taon]  properwatchtest (testing only)`,
            // ignoreInitial: true,
            followSymlinks: false,
        };
        Helpers__NS__remove(watchLocation);
        Helpers__NS__remove(symlinkCatalog);
        Helpers__NS__writeFile(symlinkCatalogFile, 'hello aaa');
        Helpers__NS__writeFile(crossPlatformPath([watchLocation, 'a1', 'aa']), 'asdasdasdhello aaa');
        Helpers__NS__writeFile(crossPlatformPath([watchLocation, 'a2', 'ccc']), 'heasdasdllo asdasd');
        Helpers__NS__createSymLink(symlinkCatalog, symlinkCatalogInWatch);
        incrementalWatcher([watchLocation], { ...options, engine: 'chokidar' }).on('all', (a, b) => {
            console.log('CHOKIDAR', a, b);
        });
        incrementalWatcher([watchLocation], {
            ...options,
            engine: '@parcel/watcher',
        }).on('all', (a, b) => {
            console.log('PARCEL', a, b);
        });
        //#endregion
    }
    //#endregion
    //#region add import src
    /**
     * @deprecated
     */
    ADD_IMPORT_SRC() {
        //#region @backendFunc
        const project = this.project;
        const regexEnd = /from\s+(\'|\").+(\'|\")/g;
        const singleLineImporrt = /import\((\'|\"|\`).+(\'|\"|\`)\)/g;
        const singleLineRequire = /require\((\'|\"|\`).+(\'|\"|\`)\)/g;
        const srcEnd = /\/src(\'|\"|\`)/;
        const betweenApos = /(\'|\"|\`).+(\'|\"|\`)/g;
        const commentMultilieStart = /^\/\*/;
        const commentSingleLineStart = /^\/\//;
        const processAddSrcAtEnd = (regexEnd, line, packages, matchType) => {
            const matches = line.match(regexEnd);
            const firstMatch = ___NS__first(matches);
            const importMatch = ___NS__first(firstMatch.match(betweenApos)).replace(/(\'|\"|\`)/g, '');
            const isOrg = importMatch.startsWith('@');
            const packageName = importMatch
                .split('/')
                .slice(0, isOrg ? 2 : 1)
                .join('/');
            if (packages.includes(packageName) && !srcEnd.test(firstMatch)) {
                let clean;
                if (matchType === 'require' || matchType === 'imports') {
                    const endCharacters = firstMatch.slice(-2);
                    clean =
                        firstMatch.slice(0, firstMatch.length - 2) + '/src' + endCharacters;
                }
                else {
                    let endCharacters = firstMatch.slice(-1);
                    clean =
                        firstMatch.slice(0, firstMatch.length - 1) + '/src' + endCharacters;
                }
                return line.replace(firstMatch, clean);
            }
            return line;
        };
        const changeImport = (content, packages) => {
            return (content
                .split(/\r?\n/)
                .map((line, index) => {
                const trimedLine = line.trimStart();
                if (commentMultilieStart.test(trimedLine) ||
                    commentSingleLineStart.test(trimedLine)) {
                    return line;
                }
                if (regexEnd.test(line)) {
                    return processAddSrcAtEnd(regexEnd, line, packages, 'from_import_export');
                }
                if (singleLineImporrt.test(line)) {
                    return processAddSrcAtEnd(singleLineImporrt, line, packages, 'imports');
                }
                if (singleLineRequire.test(line)) {
                    return processAddSrcAtEnd(singleLineRequire, line, packages, 'require');
                }
                return line;
            })
                .join('\n') + '\n');
        };
        const addImportSrc = (proj) => {
            const pacakges = [
                ...proj.packagesRecognition.allIsomorphicPackagesFromMemory,
            ];
            // console.log(pacakges)
            const files = Helpers__NS__filesFrom(proj.pathFor('src'), true).filter(f => f.endsWith('.ts'));
            for (const file of files) {
                const originalContent = Helpers__NS__readFile(file);
                const changed = changeImport(originalContent, pacakges);
                if (originalContent &&
                    changed &&
                    originalContent?.trim().replace(/\s/g, '') !==
                        changed?.trim().replace(/\s/g, '')) {
                    Helpers__NS__writeFile(file, changed);
                }
            }
        };
        if (project.framework.isStandaloneProject) {
            addImportSrc(project);
        }
        else if (project.framework.isContainer) {
            for (const child of project.children) {
                addImportSrc(child);
            }
        }
        this._exit();
        //#endregion
    }
    //#endregion
    //#region move js to ts
    $MOVE_JS_TO_TS(args) {
        //#region @backendFunc
        Helpers__NS__filesFrom(crossPlatformPath([this.cwd, args]), true).forEach(f => {
            if (path.extname(f) === '.js') {
                HelpersTaon__NS__move(f, crossPlatformPath([
                    path.dirname(f),
                    path.basename(f).replace('.js', '.ts'),
                ]));
            }
        });
        Helpers__NS__info('DONE');
        this._exit();
        //#endregion
    }
    //#endregion
    //#region show messages
    ASYNC_PROC = async (args) => {
        //#region @backendFunc
        global.tnpShowProgress = true;
        let p = Helpers__NS__run(`${config.frameworkName} show:loop ${args}`, {
            output: false,
            cwd: this.cwd,
        }).async();
        p.stdout.on('data', chunk => {
            console.log('prod:' + chunk);
        });
        p.on('exit', c => {
            console.log('process exited with code: ' + c);
            this._exit();
        });
        //#endregion
    };
    SYNC_PROC = async (args) => {
        //#region @backendFunc
        global.tnpShowProgress = true;
        try {
            let p = Helpers__NS__run(`${config.frameworkName} show:loop ${args}`, {
                output: false,
                cwd: this.cwd,
            }).sync();
            this._exit();
        }
        catch (err) {
            console.log('Erroroejk');
            this._exit(1);
        }
        //#endregion
    };
    async SHOW_RANDOM_HAMSTERS() {
        //#region @backendFunc
        while (true) {
            const arr = ['Pluszla', 'Łapczuch', 'Misia', 'Chrupka'];
            console.log(arr[HelpersTaon__NS__randomInteger(0, arr.length - 1)]);
            await Utils__NS__wait(1);
        }
        //#endregion
    }
    async showRandomHamstersTypes() {
        //#region @backendFunc
        while (true) {
            const arr = [
                chalk.red('djungarian'),
                chalk.magenta('syrian golden'),
                chalk.bold('syrian teddy bear'),
                chalk.red('dwarf roborowski'),
                chalk.underline('dwarf russian'),
                'dwarf winter white',
                'chinese hamster',
            ];
            console.log(arr[HelpersTaon__NS__randomInteger(0, arr.length - 1)]);
            await Utils__NS__wait(1);
        }
        //#endregion
    }
    SHOW_LOOP_MESSAGES(args) {
        //#region @backendFunc
        console.log(`

    platform: ${process.platform}
    terminal: ${UtilsProcess__NS__getBashOrShellName()}

    `);
        global.tnpShowProgress = true;
        console.log('process pid', process.pid);
        console.log('process ppid', process.ppid);
        // process.on('SIGTERM', () => {
        //   this._exit()
        // })
        this._SHOW_LOOP_MESSAGES();
        //#endregion
    }
    async newTermMessages() {
        //#region @backendFunc
        UtilsProcess__NS__startInNewTerminalWindow(`tnp showloopmessages 10`);
        this._exit();
        //#endregion
    }
    _SHOW_LOOP(c = 0, maximum = Infinity, errExit = false) {
        //#region @backendFunc
        if (___NS__isString(c)) {
            var { max = Infinity, err = false } = require('minimist')(c.split(' '));
            maximum = max;
            errExit = err;
            // console.log('max',max)
            // console.log('err',err)
            c = 0;
        }
        if (c === maximum) {
            this._exit(errExit ? 1 : 0);
        }
        console.log(`counter: ${c}`);
        setTimeout(() => {
            this._SHOW_LOOP(++c, maximum, errExit);
        }, 1000);
        //#endregion
    }
    _SHOW_LOOP_MESSAGES(c = 0, maximum = Infinity, errExit = false, throwErr = false) {
        //#region @backendFunc
        if (___NS__isString(c)) {
            const obj = require('minimist')(c.split(' '));
            var { max = Infinity, err = false } = obj;
            maximum = ___NS__isNumber(max) ? max : Infinity;
            errExit = err;
            throwErr = obj.throw;
            // console.log('max',max)
            // console.log('err',err)
            c = 0;
        }
        if (c === maximum) {
            if (throwErr) {
                throw new Error('Custom error!');
            }
            if (errExit) {
                this._exit(1);
            }
            this._exit();
        }
        console.log(`counter: ${c}`);
        PROGRESS_DATA.log({ msg: `counter: ${c}`, value: c * 7 });
        setTimeout(() => {
            this._SHOW_LOOP_MESSAGES(++c, maximum, errExit, throwErr);
        }, 2000);
        //#endregion
    }
    //#endregion
    //#region dedupe
    dedupecore() {
        //#region @backendFunc
        const coreProject = Project.ins.by(LibTypeEnum.CONTAINER);
        coreProject.nodeModules.dedupe(this.args.join(' ').trim() === '' ? void 0 : this.args);
        this._exit();
        //#endregion
    }
    dedupecorefake() {
        //#region @backendFunc
        const coreProject = Project.ins.by(LibTypeEnum.CONTAINER);
        coreProject.nodeModules.dedupe(this.args.join(' ').trim() === '' ? void 0 : this.args, true);
        this._exit();
        //#endregion
    }
    DEDUPE() {
        //#region @backendFunc
        this.project.nodeModules.dedupe(this.args.join(' ').trim() === '' ? void 0 : this.args);
        this._exit();
        //#endregion
    }
    DEDUPE_FAKE() {
        //#region @backendFunc
        this.project.nodeModules.dedupe(this.args.join(' ').trim() === '' ? void 0 : this.args, true);
        this._exit();
        //#endregion
    }
    DEDUPE_COUNT() {
        //#region @backendFunc
        this.project.nodeModules.dedupeCount(this.args);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region deps
    /**
     * generate deps json
     */
    DEPS_JSON() {
        //#region @backendFunc
        const node_moduels = crossPlatformPath([this.cwd, nodeModulesMainProject]);
        const result = {};
        Helpers__NS__foldersFrom(node_moduels)
            .filter(f => path.basename(f) !== '.bin')
            .forEach(f => {
            const packageName = path.basename(f);
            if (packageName.startsWith('@')) {
                const orgPackageRootName = packageName;
                Helpers__NS__foldersFrom(f).forEach(f2 => {
                    try {
                        result[`${orgPackageRootName}/${path.basename(f2)}`] =
                            HelpersTaon__NS__readValueFromJson(path.join(f2, packageJsonMainProject), 'version', '');
                    }
                    catch (error) { }
                });
            }
            else {
                try {
                    result[packageName] = HelpersTaon__NS__readValueFromJson(path.join(f, packageJsonMainProject), 'version', '');
                }
                catch (error) { }
            }
        });
        Helpers__NS__writeJson(path.join(this.cwd, result_packages_json), result);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region reinstall
    async reinstall() {
        //#region @backendFunc
        Helpers__NS__taskStarted(`Reinstalling ${this.project.genericName}...`);
        if (!this.project) {
            Helpers__NS__error(`Project not found in ${this.cwd}`, true, false);
            this._exit();
        }
        await this.project?.nodeModules?.reinstall();
        Helpers__NS__info(`Done reinstalling ${this.project.genericName}`);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region reinstall core containers
    async reinstallCoreContainers() {
        //#region @backendFunc
        const toReinstallCoreContainers = crossPlatformPath([
            Project.ins.by(LibTypeEnum.CONTAINER).location,
            '..',
        ]);
        const ommitedVersion = ['v20'];
        const foldersAbsPaths = Helpers__NS__foldersFrom(toReinstallCoreContainers, {
            recursive: false,
        })
            .filter(f => path.basename(f).startsWith(LibTypeEnum.CONTAINER))
            .filter(f => {
            const project = this.ins.From(f);
            return (project &&
                project.framework.frameworkVersionAtLeast(`v${___NS__first(CURRENT_PACKAGE_VERSION.split('.'))}`) &&
                !ommitedVersion.includes(project.framework.frameworkVersion));
        });
        const projectsFoldersAbsPaths = foldersAbsPaths.length === 1
            ? foldersAbsPaths
            : await UtilsTerminal__NS__multiselect({
                question: `Select core containers to reinstall`,
                choices: foldersAbsPaths.map(absFolderPath => {
                    return {
                        name: path.basename(absFolderPath),
                        value: absFolderPath,
                    };
                }),
            });
        for (let index = 0; index < projectsFoldersAbsPaths.length; index++) {
            const project = this.ins.From(projectsFoldersAbsPaths[index]);
            await project.nodeModules.reinstall();
        }
        Helpers__NS__info(`Done reinstalling core containers`);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region file info
    FILEINFO = args => {
        //#region @backendFunc
        console.log(HelpersTaon__NS__getMostRecentFilesNames(crossPlatformPath(this.cwd)));
        this._exit();
        //#endregion
    };
    //#endregion
    //#region versions
    VERSIONS() {
        //#region @backendFunc
        const children = this.project.children;
        for (let index = 0; index < children.length; index++) {
            const child = children[index];
            Helpers__NS__info(`v${child.packageJson.version}\t - ${child.genericName}`);
        }
        this._exit();
        //#endregion
    }
    //#endregion
    //#region path
    path() {
        //#region @backendFunc
        console.log(this.ins.Tnp.location);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region env
    ENV_CHECK(args) {
        //#region @backendFunc
        HelpersTaon__NS__checkEnvironment();
        this._exit();
        //#endregion
    }
    ENV_INSTALL() {
        //#region @backendFunc
        CLI.installEnvironment(requiredForDev);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region throw error
    THROW_ERR() {
        //#region @backendFunc
        Helpers__NS__error(`Erororoororo here`, false, true);
        //#endregion
    }
    //#endregion
    //#region brew
    BREW(args) {
        //#region @backendFunc
        const isM1MacOS = os.cpus()[0].model.includes('Apple M1');
        if (process.platform === 'darwin') {
            if (isM1MacOS) {
                Helpers__NS__run(`arch -x86_64 brew ${args}`).sync();
            }
            else {
                Helpers__NS__run(`brew ${args}`).sync();
            }
        }
        this._exit();
        //#endregion
    }
    //#endregion
    //#region run
    run() {
        //#region @backendFunc
        Helpers__NS__run(`node run.js`, {
            output: true,
            silence: false,
        }).sync();
        this._exit(0);
        //#endregion
    }
    //#endregion
    //#region ps info
    async PSINFO(args) {
        //#region @backendFunc
        const pid = Number(args);
        let ps = await psList();
        let psinfo = ps.find(p => p.pid == pid);
        if (!psinfo) {
            Helpers__NS__error(`No process found with pid: ${args}`, false, true);
        }
        console.log(psinfo);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region sync core repositories
    get absPathToLocalTaonContainers() {
        //#region @backendFunc
        if (!this.project) {
            return;
        }
        const localTaonRepoPath = crossPlatformPath([
            this.project.location,
            this.project.ins.taonProjectsRelative,
        ]);
        return localTaonRepoPath;
        //#endregion
    }
    async TNP_SYNC() {
        //#region @backendFunc
        const currentFrameworkVersion = this.project.taonJson.frameworkVersion;
        const pathToTaonContainerNodeModules = crossPlatformPath([
            UtilsOs__NS__getRealHomeDir(),
            dotTaonFolder,
            taonContainers,
            `${containerPrefix}${currentFrameworkVersion}`,
            nodeModulesMainProject,
        ]);
        Helpers__NS__taskStarted(`Syncing node_modules from taon container to tnp...`);
        //#region copy from .taon to tnp
        await HelpersTaon__NS__copyFolderOsNative(pathToTaonContainerNodeModules, this.project.nodeModules.path, { removeDestination: true });
        HelpersTaon__NS__copyFile(crossPlatformPath([
            pathToTaonContainerNodeModules,
            `../${tmpIsomorphicPackagesJson}`,
        ]), this.project.pathFor(tmpIsomorphicPackagesJson));
        //#endregion
        Helpers__NS__taskDone(`Done syncing node_modules from container to tnp...`);
        Helpers__NS__taskStarted(`Syncing node_modules from tnp to ../taon-container...`);
        //#region copy from tnp to ../taon
        await HelpersTaon__NS__copyFolderOsNative(this.project.nodeModules.path, crossPlatformPath(`${this.absPathToLocalTaonContainers}/${containerPrefix}${currentFrameworkVersion}/${nodeModulesMainProject}`), { removeDestination: true });
        HelpersTaon__NS__copyFile(this.project.pathFor(tmpIsomorphicPackagesJson), crossPlatformPath(`${this.absPathToLocalTaonContainers}/${containerPrefix}${currentFrameworkVersion}/${tmpIsomorphicPackagesJson}`));
        //#endregion
        Helpers__NS__taskDone(`Done syncing node_modules from tnp to ../${taonContainers} ...`);
        this._exit();
        //#endregion
    }
    async SYNC() {
        //#region @backendFunc
        const isInsideTnpAndTaonDev = this.project?.name === 'tnp' &&
            this.project?.parent.name === 'taon-dev' &&
            Helpers__NS__exists(this.absPathToLocalTaonContainers);
        if (isInsideTnpAndTaonDev) {
            Helpers__NS__info(`

        You are inside taon-dev/tnp project.

        `);
        }
        const updateTnpAndLocalTona = isInsideTnpAndTaonDev &&
            (await UtilsTerminal__NS__confirm({
                message: `Would you like to update tnp and ../${taonContainers} (after sync command) ?`,
                defaultValue: true,
            }));
        this.ins.sync({ syncFromCommand: true });
        if (updateTnpAndLocalTona) {
            await this.TNP_SYNC();
        }
        this._exit();
        //#endregion
    }
    //#endregion
    //#region clear
    async CLEAN() {
        //#region @backendFunc
        await this.project.artifactsManager.clear(EnvOptions.from(this.params));
        this._exit();
        //#endregion
    }
    CLEAR() {
        //#region @backendFunc
        this.CLEAN();
        //#endregion
    }
    CL() {
        //#region @backendFunc
        this.CLEAN();
        //#endregion
    }
    //#endregion
    //#region show git in progress
    inprogress() {
        //#region @backendFunc
        Helpers__NS__info(`
    In progress
${this.project.children
            .filter(f => f.git
            .lastCommitMessage()
            .startsWith(HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT()))
            .map((c, index) => `${index + 1}. ${c.genericName}`)}

    `);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region update deps for core container
    async depsupdate() {
        await this.updatedeps();
    }
    async updatedeps() {
        //#region @backendFunc
        if (!this.project || !this.project.framework.isCoreProject) {
            if (this.project && this.project.typeIs(LibTypeEnum.ISOMORPHIC_LIB)) {
                // await this.project.init(
                //   EnvOptions.from({
                //     purpose: 'updating isomorphic-lib external deps',
                //   }),
                // );
                this.project.taonJson.detectAndUpdateNpmExternalDependencies();
                this.project.taonJson.detectAndUpdateIsomorphicExternalDependencies();
                UtilsTypescript__NS__formatFile(this.project.taonJson.path);
            }
            else {
                Helpers__NS__error(`This command can be used only inside:` +
                    `\n- core container projects` +
                    `\n-isomorphic-lib projects`, false, true);
            }
            this._exit();
        }
        await this.project.taonJson.updateDependenciesFromNpm({
            onlyPackageNames: this.args,
        });
        this._exit();
        //#endregion
    }
    //#endregion
    //#region compare containers
    compareContainers() {
        //#region @backendFunc
        Helpers__NS__clearConsole();
        const [c1ver, c2ver] = this.args;
        const c1 = this.ins.by(LibTypeEnum.CONTAINER, `v${c1ver.replace('v', '')}`);
        const c2 = this.ins.by(LibTypeEnum.CONTAINER, `v${c2ver.replace('v', '')}`);
        const c1Deps = c1.packageJson.allDependencies;
        const c2Deps = c2.packageJson.allDependencies;
        const displayCompare = (depName, c1depVer, c2depVer) => {
            // console.log(`Comparing ${depName} ${c1depVer} => ${c2depVer}`);
            c1depVer = UtilsNpm__NS__fixMajorVerNumber(c1depVer);
            c2depVer = UtilsNpm__NS__fixMajorVerNumber(c2depVer);
            if ([c1depVer, c2depVer].includes('latest')) {
                console.log(`${chalk.gray(depName)}@(${c1depVer} => ${c2depVer})\t`);
            }
            else if (c2depVer && c1depVer) {
                if (semver.lt(c2depVer, c1depVer)) {
                    console.log(`${chalk.red(depName)}@(${c1depVer} => ${c2depVer})\t`);
                }
                else if (semver.gte(c2depVer, c1depVer)) {
                    console.log(`${chalk.gray(depName)}@(${c1depVer} => ${c2depVer})\t`);
                }
            }
            else {
                console.log(`${chalk.bold(depName)}@(${c1depVer} => ${c2depVer})\t`);
            }
        };
        const allDepsKeys = Object.keys(c1Deps).concat(Object.keys(c2Deps));
        for (const packageName of allDepsKeys) {
            displayCompare(packageName, UtilsNpm__NS__clearVersion(c1Deps[packageName], { removePrefixes: true }), UtilsNpm__NS__clearVersion(c2Deps[packageName], { removePrefixes: true }));
        }
        this._exit();
        //#endregion
    }
    //#endregion
    //#region not for npm / get trusted
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    //#endregion
    //#region not for npm / tnp fix taon json
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    /* */
    //#endregion
    //#region start taon projects worker
    async startCliServiceTaonProjectsWorker() {
        //#region @backendFunc
        await this.ins.taonProjectsWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    ...this.params,
                    mode: BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
                },
                calledFrom: 'cli-GLobal',
            },
        });
        //#endregion
    }
    //#endregion
    //#region json schema docs watcher
    async recreateDocsConfigJsonSchema() {
        //#region @backendFunc
        await this.project.init(EnvOptions.from({
            purpose: 'initing before json schema docs watch',
        }));
        if (this.project.name !== 'tnp') {
            Helpers__NS__error(`This command is only for tnp project`, false, true);
        }
        const fileToWatchRelative = 'src/lib/models.ts';
        const fileToWatch = this.project.pathFor(fileToWatchRelative);
        const recreate = async () => {
            const schema = await this._createJsonSchemaFrom({
                nameOfTypeOrInterface: 'Models__NS__DocsConfig',
                project: this.project,
                relativePathToTsFile: fileToWatch,
            });
            Helpers__NS__writeFile(this.project.artifactsManager.artifact.docsWebapp.docs
                .docsConfigSchemaPath, schema);
            Helpers__NS__info(`DocsConfig schema updated ${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}`);
        };
        const debounceRecreate = ___NS__debounce(recreate, 100);
        Helpers__NS__taskStarted('Recreating... src/lib/models.ts');
        await recreate();
        Helpers__NS__taskDone('Recreation done src/lib/models.ts');
        Helpers__NS__taskStarted('Watching for changes in src/lib/models.ts');
        if (this.params.watch || this.params.w) {
            chokidar.watch(fileToWatch).on('change', () => {
                debounceRecreate();
            });
        }
        else {
            await recreate();
            this._exit();
        }
        //#endregion
    }
    //#endregion
    //#region json schema taon watch
    async recreateTaonJsonSchema() {
        //#region @backendFunc
        // await this.project.init(
        //   EnvOptions.from({
        //     purpose: 'initing before json schema docs watch',
        //   }),
        // );
        if (this.project.name !== 'tnp') {
            Helpers__NS__error(`This command is only for tnp project`, false, true);
        }
        const fileToWatchRelative = 'src/lib/models.ts';
        const fileToWatch = this.project.pathFor(fileToWatchRelative);
        const recreate = async () => {
            await (async () => {
                const projectsOfInterestStandalone = [
                    this.project.framework.coreProject,
                    this.project,
                ];
                const schemaStandalone = await this._createJsonSchemaFrom({
                    nameOfTypeOrInterface: 'Models__NS__TaonJsonCombined',
                    project: this.project,
                    relativePathToTsFile: fileToWatch,
                });
                for (const proj of projectsOfInterestStandalone) {
                    proj.vsCodeHelpers.recreateJsonSchemaForTaon();
                    Helpers__NS__writeFile(proj.pathFor(taonConfigSchemaJsonStandalone), schemaStandalone);
                }
                const projectsOfInterestContainer = [
                    this.project.framework.coreContainer,
                    this.project.parent,
                ];
                // const schemaContainer = await this._createJsonSchemaFrom({
                //   nameOfTypeOrInterface: 'Models__NS__TaonJsonContainer',
                //   project: this.project,
                //   relativePathToTsFile: fileToWatch,
                // });
                for (const proj of projectsOfInterestContainer) {
                    proj.vsCodeHelpers.recreateJsonSchemaForTaon();
                    Helpers__NS__writeFile(proj.pathFor(taonConfigSchemaJsonContainer), schemaStandalone);
                }
            })();
            Helpers__NS__info(`TaonConfig schema updated ${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}`);
        };
        const debounceRecreate = ___NS__debounce(recreate, 100);
        Helpers__NS__taskStarted('Recreating... src/lib/models.ts');
        await recreate();
        Helpers__NS__taskDone('Recreation done src/lib/models.ts');
        if (this.params.watch || this.params.w) {
            Helpers__NS__taskStarted('Watching for changes in src/lib/models.ts');
            chokidar.watch(fileToWatch).on('change', () => {
                debounceRecreate();
            });
        }
        else {
            await recreate();
            this._exit();
        }
        //#endregion
    }
    jsonSchema() {
        //#region @backendFunc
        return this.schemaJson();
        //#endregion
    }
    async _createJsonSchemaFrom(options) {
        //#region @backendFunc
        const { project, relativePathToTsFile, nameOfTypeOrInterface } = options;
        // Create the config for ts-json-schema-generator
        const config = {
            path: relativePathToTsFile, // Path to the TypeScript file
            tsconfig: project.pathFor(tsconfigForSchemaJson), // Path to the tsconfig.json file
            type: nameOfTypeOrInterface, // Type or interface name
            skipTypeCheck: true, // Optional: Skip type checking
        };
        try {
            // Create the schema generator using the config
            const generator = createGenerator(config);
            // Generate the schema
            const schema = generator.createSchema(config.type);
            // Convert the schema object to JSON string
            const schemaJson = JSON.stringify(schema, null, 2);
            return schemaJson;
        }
        catch (error) {
            const diagnostics = UtilsTypescript__NS__parseTsDiagnostic(error.diagnostic ?? error);
            for (const d of diagnostics) {
                if (d.file) {
                    console.error(`[TS ${d.category}] (${d.code})`, `${d.file}:${d.line}:${d.character}`, '\n' + d.message);
                }
                else {
                    console.error(`[TS ${d.category}] (${d.code})`, d.message);
                }
            }
        }
        return {};
        //#endregion
    }
    schemaJson() {
        //#region @backendFunc
        console.log(this._createJsonSchemaFrom({
            project: this.project,
            relativePathToTsFile: this.firstArg,
            nameOfTypeOrInterface: this.lastArg,
        }));
        this._exit();
        //#endregion
    }
    //#endregion
    //#region ts testing functions
    async ts() {
        //#region @backendFunc
        Helpers__NS__clearConsole();
        await UtilsTerminal__NS__selectActionAndExecute({
            recognizeImportExportRequire: {
                name: 'Recognize import/export/require',
                action: async () => {
                    const files = Helpers__NS__getFilesFrom([this.cwd, srcMainProject], {
                        followSymlinks: false,
                        recursive: true,
                    });
                    const selectedFileAbsPath = await UtilsTerminal__NS__select({
                        question: 'Select file to recognize imports/exports/requires',
                        choices: files.map(f => {
                            return {
                                name: f,
                                value: f,
                            };
                        }),
                    });
                    const importsExports = UtilsTypescript__NS__recognizeImportsFromFile(Helpers__NS__readFile(selectedFileAbsPath)).map(i => {
                        return `(${i.type}) ${chalk.bold(i.cleanEmbeddedPathToFile)}`;
                    });
                    console.log(importsExports.join('\n '));
                },
            },
        });
        this._exit();
        //#endregion
    }
    //#endregion
    //#region update core container deps
    async coreContainerDepsUpdate() {
        //#region @backendFunc
        if (this.project.name !== 'taon' &&
            this.project?.parent?.typeIsNot(LibTypeEnum.CONTAINER)) {
            Helpers__NS__error(`This command is only for taon project in taon-dev container`, false, true);
        }
        const containerCore = this.project.framework.coreContainer;
        for (const child of this.project.parent.children.filter(f => f.framework.isStandaloneProject)) {
            Helpers__NS__info(`Updating ${child.name} version from npm...`);
            const version = await child.npmHelpers.getPackageVersionFromNpmRegistry(child.nameForNpmPackage);
            console.info(`Found version: ${version} for ${child.nameForNpmPackage}`);
            containerCore.taonJson.overridePackageJsonManager.updateDependency({
                packageName: child.nameForNpmPackage,
                version: `~${version}`,
            });
        }
        Helpers__NS__info(`Container deps updated`);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region wrapper for ng
    ng() {
        //#region @backendFunc
        // check if for example v18 in args
        const latest = 'latest';
        const version = this.args.find(arg => arg.startsWith('v')) || latest;
        let argsWithParams = this.argsWithParams;
        if (version !== latest) {
            this.args = this.args.filter(arg => !arg.startsWith('v'));
            argsWithParams = this.argsWithParams.replace(version, '');
        }
        Helpers__NS__run(`npx -p @angular/cli@${version.replace('v', '').replace('@', '')} ng ${argsWithParams}`, {
            output: true,
            silence: false,
        }).sync();
        this._exit();
        //#endregion
    }
    //#endregion
    //#region are linked node_modules
    isLinkNodeModules() {
        //#region @backendFunc
        console.log(this.project.nodeModules.isLink);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region link node_modules from core container
    linkNodeModulesFromCoreContainer() {
        //#region @backendFunc
        const coreContainer = this.project.ins.by(LibTypeEnum.CONTAINER, this.firstArg);
        if (!coreContainer) {
            Helpers__NS__error(`Please specify proper container version in argument`, false, true);
        }
        this.project.nodeModules.unlinkNodeModulesWhenLinked();
        coreContainer.nodeModules.linkToProject(this.project);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region recognize imports from file
    /**
     * Display all imports from specific project file
     */
    imports() {
        //#region @backendFunc
        const imports = UtilsTypescript__NS__recognizeImportsFromFile(this.project.pathFor(this.firstArg));
        console.log(imports);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region recognize imports from file
    /**
     * Display all imports from specific project
     */
    allImports() {
        //#region @backendFunc
        Helpers__NS__taskStarted(`Recognizing all imports from project...`);
        const displayList = this.project.framework
            .allDetectedExternalIsomorphicDependenciesForNpmLibCode;
        console.log(displayList.map(i => `"${i}"`).join('\n'));
        Helpers__NS__info(`Total unique imports found: ${displayList.length}`);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region dirname for tnp
    dirnameForTnp() {
        //#region @backendFunc
        console.log(`cli method: ${config.frameworkName} ${UtilsCliClassMethod__NS__getFrom($Global.prototype.dirnameForTnp, {
            globalMethod: true,
        })}`);
        console.log(config.dirnameForTnp);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region detect contexts
    contexts() {
        //#region @backendFunc
        Helpers__NS__taskStarted(`Detecting contexts...`);
        const contexts = this.project.framework.getAllDetectedTaonContexts();
        console.log(`Detected contexts: ${contexts.length} `);
        for (const context of contexts) {
            console.log(`- ${context.contextName} (${context.fileRelativePath})`);
        }
        Helpers__NS__taskDone(`Contexts detected`);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region regenerate vscode settings colors
    _regenerateVscodeSettingsColors() {
        //#region @backendFunc
        const overrideBottomColor = this.project.vsCodeHelpers.getVscodeBottomColor();
        super._regenerateVscodeSettingsColors(overrideBottomColor);
        //#endregion
    }
    //#endregion
    //#region test messages
    messagesTest() {
        //#region @backendFunc
        console.log('-----1');
        Helpers__NS__log(`Helpers__NS__log`);
        Helpers__NS__info(`Helpers__NS__info`);
        Helpers__NS__error(`Helpers__NS__error`, true, true);
        Helpers__NS__warn(`Helpers__NS__warn`);
        Helpers__NS__success(`Helpers__NS__success`);
        Helpers__NS__taskStarted(`Helpers__NS__taskStarted`);
        Helpers__NS__taskDone(`Helpers__NS__taskDone`);
        console.log('-----2');
        Helpers__NS__logInfo(`Helpers__NS__logInfo`);
        Helpers__NS__logError(`Helpers__NS__logError`, true, true);
        Helpers__NS__logWarn(`Helpers__NS__logWarn`);
        Helpers__NS__logSuccess(`Helpers__NS__logSuccess`);
        console.log('-----3');
        this._exit();
        //#endregion
    }
    //#endregion
    //#region extract string metadata
    // projectName|-|www-domgrubegozwierzaka-pl||--||releaseType|-|manual||--||version|-|0.0.8||--||
    // envName|-|__||--||envNumber|-|||--||targetArtifact|-|angular-node-app|||||-1759151320202-fa12e3a5cfdd
    extractStringMetadata() {
        //#region @backendFunc
        const str = this.firstArg || '';
        console.log(str);
        console.log(FilePathMetaData__NS__extractData(str, {
            keysMap,
        }));
        this._exit();
        //#endregion
    }
    //#endregion
    //#region aaa (test command)
    async aaa() {
        //#region @backendFunc
        // const stuff = await UtilsTerminal__NS__select({
        //   choices: [],
        //   question: 'Select something',
        // });
        //   const coreProject1 = this.project.framework.coreProject;
        //   const coreProject2 = Project.ins.by(LibTypeEnum.ISOMORPHIC_LIB);
        //   console.log('coreProject2');
        //   console.log(coreProject1.pathFor(`docker-templates/terafik`));
        //   console.log('coreProject2');
        //   console.log(coreProject2.pathFor(`docker-templates/terafik`));
        // const wrap = UtilsProcessLogger__NS__createStickyTopBox('AAA TEST');
        // const ui = UtilsProcessLogger__NS__createStickyTopBox(
        //   '🐹 PROCESS OUTPUT — last 40 lines — Press ENTER to stop',
        // );
        // let iteration = 0;
        // const allLogs: string[] = [];
        // function makeChunk(chunkNo: number): string[] {
        //   const lines: string[] = [];
        //   for (let i = 0; i < 40; i++) {
        //     const now = new Date().toLocaleTimeString();
        //     lines.push(
        //       `[chunk ${chunkNo.toString().padStart(2, '0')}] line ${i
        //         .toString()
        //         .padStart(2, '0')} — ${now}`,
        //     );
        //   }
        //   return lines;
        // }
        // function feedChunk() {
        //   iteration++;
        //   allLogs.push(...makeChunk(iteration));
        //   ui.update(allLogs.join('\n'));
        // }
        // console.clear();
        // console.log('Starting stress test...\n');
        // // generate a new 40-line chunk every second
        // const timer = setInterval(feedChunk, 1000);
        // // stop after 10 chunks (≈ 400 lines)
        // setTimeout(() => {
        //   clearInterval(timer);
        //   console.log('\n\n✅ Finished streaming 10 chunks of 40 lines each.');
        // }, 10000);
        // this._exit();
        //#endregion
    }
    //#endregion
    //#region local sync
    async localSync() {
        //#region @backendFunc
        if (!this.project) {
            Helpers__NS__error(`No project found in cwd: ${this.cwd}`, false, true);
        }
        if (this.project.name !== 'taon-dev') {
            Helpers__NS__error(`This command is only for ${chalk.bold('taon-dev')} project`, false, true);
        }
        await UtilsProcess__NS__killAllOtherNodeProcesses();
        const tnpProjectInTaonDev = this.project.children.find(c => c.name === tnpPackageName);
        const taonContainersProj = this.project.ins.From(this.project.pathFor(taonContainers));
        if (!taonContainersProj) {
            Helpers__NS__error(`No taon-containers project found in ${this.project.pathFor(taonContainers)}`, false, true);
        }
        if (!tnpProjectInTaonDev) {
            Helpers__NS__error(`No tnp project found inside taon-dev`, false, true);
        }
        const tnpContainer = taonContainersProj.children.find(c => c.name ===
            `${containerPrefix}${tnpProjectInTaonDev.taonJson.frameworkVersion}`);
        await tnpContainer.nodeModules.reinstall();
        tnpContainer.nodeModules.copyToProject(tnpProjectInTaonDev);
        // Helpers__NS__info(`Done syncing node_modules from container to tnp...`);
        let children = this.project.children.filter(c => c.typeIs(LibTypeEnum.ISOMORPHIC_LIB));
        for (const child of children) {
            child.git.meltActionCommits();
        }
        children = children.filter((c, i) => {
            const lastCommitMessage = c?.git?.lastCommitMessage()?.trim();
            return !lastCommitMessage?.startsWith('release: ');
        });
        children = this.ins // @ts-ignore BaseProject inheritace compatiblity with Project problem
            .sortGroupOfProject(children, proj => [
            ...proj.taonJson.dependenciesNamesForNpmLib,
            ...proj.taonJson.isomorphicDependenciesForNpmLib,
            ...proj.taonJson.peerDependenciesNamesForNpmLib,
        ], proj => proj.nameForNpmPackage, this.project.taonJson.overridePackagesOrder)
            .filter(d => d.framework.isStandaloneProject);
        if (children.length > 0) {
            Helpers__NS__info(`Found ${children.length} children isomorphic projects to rebuild...

${children.map((c, i) => `  ${i + 1}. ${c.name}`).join(',')}

        `);
        }
        await Project.ins.taonProjectsWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    mode: BaseCLiWorkerStartMode.DETACHED_WINDOW,
                },
                calledFrom: 'start framework function',
            },
        });
        const rebuildChildren = await UtilsTerminal__NS__confirm({
            message: `Rebuild ${children.length} children isomorphic projects ?`,
            defaultValue: true,
        });
        if (rebuildChildren) {
            for (let index = 0; index < children.length; index++) {
                const child = children[index];
                Helpers__NS__info(`Rebuilding ${index + 1} / ${children.length}: ${child.name} ...`);
                await child.build(EnvOptions.from({
                    purpose: 'local-sync',
                    build: {
                        watch: false,
                    },
                    release: {
                        targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
                    },
                }));
            }
        }
        Helpers__NS__info(`Dony local sync of taon-dev`);
        this._exit();
        //#endregion
    }
    //#endregion
    tagsFor() {
        //#region @backendFunc
        const taonJsonContent = this.project.readFile(taonJsonMainProject);
        const tags = UtilsJson__NS__getAtrributiesFromJsonWithComments(`[zone.js]`, taonJsonContent);
        console.log(tags);
        this._exit();
        //#endregion
    }
    testGlob() {
        //#region @backendFunc
        // Helpers__NS__taskStarted('Testing glob...');
        // const fullPattern = `${this.project.location}/**/*`;
        // const ignorePatterns = [
        //   '**/node_modules/**/*.*',
        //   '**/node_modules',
        //   '**/.git/**/*.*',
        //   '**/.git',
        //   '**/tmp-*/**',
        //   '**/tmp-*',
        //   '**/dist/**',
        //   '**/dist',
        //   '**/dist-*/**',
        //   '**/browser/**',
        //   '**/browser',
        //   '**/websql/**',
        //   '**/websql',
        //   // '**/projects/**',
        //   // '**/projects',
        //   '**/.taon/**',
        //   '**/.taon',
        //   '**/.tnp/**',
        //   '**/.tnp',
        //   '**/src/**/*.ts',
        //   '**/src/**/*.js',
        //   '**/src/**/*.scss',
        //   '**/src/**/*.css',
        //   '**/src/**/*.html',
        // ];
        // const entries = fg.sync(fullPattern, {
        //   absolute: true,
        //   dot: true,
        //   extglob: true,
        //   globstar: true,
        //   followSymbolicLinks: false,
        //   ignore: [
        //     // ...IGNORE_BY_DEFAULT
        //     ...ignorePatterns,
        //   ],
        //   onlyFiles: false,
        //   stats: true, // This is key!
        // });
        // Helpers__NS__taskDone(`Found entries: ${entries.length}`);
        //#endregion
    }
    async killOthers() {
        //#region @backendFunc
        await UtilsProcess__NS__killAllOtherNodeProcesses();
        //#endregion
    }
    copyimage() {
        //#region @backendFunc
        // let source = this.args[0];
        // let destination = this.args[1];
        // if(!path.isAbsolute(source)){
        //   source = this.project.pathFor(source);
        // }
        // if(!path.isAbsolute(destination)){
        //   destination = this.project.pathFor(destination);
        // }
        // const content = UtilsFilesFoldersSync__NS__readFile(this.args[0], {
        //   readImagesWithoutEncodingUtf8: true,
        // });
        // UtilsFilesFoldersSync__NS__writeFile(this.args[1], content,{
        //   writeImagesWithoutEncodingUtf8: true,
        // });
        // Helpers__NS__info(`Image copied from ${this.args[0]} to ${this.args[1]}`);
        // this._exit();
        //#endregion
    }
    setDefaultAutoConfigTaskName() {
        //#region @backendFunc
        Helpers__NS__taskStarted(`Setting default autoReleaseConfig task names...`);
        this.project.children.forEach(child => {
            Helpers__NS__info(`Processing project: ${child.name}`);
            const items = child.taonJson.autoReleaseConfigAllowedItems;
            items.forEach(item => {
                if (!item.taskName && item.artifactName === 'npm-lib-and-cli-tool') {
                    item.taskName = 'npm';
                }
            });
            child.taonJson.autoReleaseConfigAllowedItems = items;
        });
        this._exit();
        //#endregion
    }
    setTsNoCheckForAppTs() {
        //#region @backendFunc
        Helpers__NS__taskStarted(`Setting default autoReleaseConfig task names...`);
        this.project.children.forEach(child => {
            Helpers__NS__info(`Processing project: ${child.name}`);
            const appTsPath = child.pathFor('src/app.ts');
            const fileContent = Helpers__NS__readFile(appTsPath) || '';
            if (fileContent) {
                if (!fileContent.startsWith(`// @ts-${'nocheck'}`)) {
                    const contentFixed = `// @ts-${'nocheck'}\n${fileContent}`;
                    if (fileContent !== contentFixed) {
                        Helpers__NS__writeFile(appTsPath, contentFixed);
                    }
                }
            }
        });
        this._exit();
        //#endregion
    }
    getFilesFrom() {
        //#region @backendFunc
        const pathForFiles = crossPlatformPath([this.cwd, this.firstArg]);
        Helpers__NS__taskStarted(`Getting files from path...

      ${pathForFiles}

      `);
        const files = UtilsFilesFoldersSync__NS__getFilesFrom(pathForFiles, {
            recursive: true,
            followSymlinks: false,
            omitPatterns: UtilsFilesFoldersSync__NS__IGNORE_FOLDERS_FILES_PATTERNS,
        });
        Helpers__NS__taskDone(`Files found: ${files.length}`);
        this._exit();
        //#endregion
    }
    getFoldersFrom() {
        //#region @backendFunc
        const pathForFolders = crossPlatformPath([this.cwd, this.firstArg]);
        Helpers__NS__taskStarted(`Getting folders from path...

      ${pathForFolders}

      `);
        const folders = UtilsFilesFoldersSync__NS__getFoldersFrom(crossPlatformPath([this.cwd, this.firstArg]), {
            recursive: true,
            followSymlinks: false,
            omitPatterns: UtilsFilesFoldersSync__NS__IGNORE_FOLDERS_FILES_PATTERNS,
        });
        Helpers__NS__taskDone(`Folders found: ${folders.length}`);
        this._exit();
        //#endregion
    }
    async aaaaa() {
        GlobalTaskManager.start('aaa');
        GlobalTaskManager.addProgress('aaa');
        GlobalTaskManager.addProgress('aaa');
        console.info('GLOBAL COMMAND WORKS!');
        GlobalTaskManager.stop('aaa', () => {
            this._exit();
        });
    }
    async notyficationTest() {
        //#region @backendFunc
        await UtilsOs__NS__sendNotification({
            title: 'hello',
            body: 'asdas',
            subtitle: 'LOLLASLDLASLD',
            timeoutMs: 1000,
        });
        this._exit();
        //#endregion
    }
    async spinner() {
        //#region @backend
        console.info('starting spinner');
        globalSpinner.instance.start();
        await Utils__NS__wait(2);
        globalSpinner.instance.text = 'Hello world !';
        await Utils__NS__wait(2);
        console.info('stoppiong spinner and waiting 2 seconds');
        globalSpinner.instance.stop();
        this._exit();
        //#endregion
    }
    notVerifiedBuilds() {
        //#region @backendFunc
        Helpers__NS__info(`Not verified isomorphic builds:`);
        const pkgs = this.project.framework.notVerifiedIsomorphicPackagesBuildsInNodeModules;
        Helpers__NS__info(`Found ${pkgs.length} `);
        console.log(pkgs);
        this._exit();
        //#endregion
    }
    async countWatchersLinux() {
        //#region @backendFunc
        console.log(await UtilsOs__NS__getInotifyWatchCount());
        this._exit();
        //#endregion
    }
}
__decorate([
    UtilsCliClassMethod__NS__decoratorMethod('addEtcHostsEntry'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], $Global.prototype, "addEtcHostsEntry", null);
__decorate([
    UtilsCliClassMethod__NS__decoratorMethod('showRandomHamstersTypes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Global.prototype, "showRandomHamstersTypes", null);
__decorate([
    UtilsCliClassMethod__NS__decoratorMethod('reinstallCoreContainers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Global.prototype, "reinstallCoreContainers", null);
__decorate([
    UtilsCliClassMethod__NS__decoratorMethod('ENV_INSTALL'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], $Global.prototype, "ENV_INSTALL", null);
__decorate([
    UtilsCliClassMethod__NS__decoratorMethod('startCliServiceTaonProjectsWorker'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Global.prototype, "startCliServiceTaonProjectsWorker", null);
__decorate([
    UtilsCliClassMethod__NS__decoratorMethod('dirnameForTnp'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], $Global.prototype, "dirnameForTnp", null);
export default {
    // registerd as empty
    $Global: HelpersTaon__NS__CLIWRAP($Global, ''),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-_GLOBAL_.js.map