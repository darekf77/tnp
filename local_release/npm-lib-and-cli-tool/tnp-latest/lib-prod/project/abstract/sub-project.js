//#region imports
import { spawn } from 'child_process';
import * as crypto from 'crypto';
import { MagicRenamer, RenameRule } from 'magic-renamer/lib-prod';
import { path, crossPlatformPath, TaonStripeCloudflareWorker, chalk, ___NS__kebabCase, ___NS__snakeCase, Helpers__NS__error, Helpers__NS__exists, Helpers__NS__info, Helpers__NS__isFolder, Helpers__NS__logInfo, Helpers__NS__remove, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__warn, Utils__NS__escapeStringForRegEx, Utils__NS__wait, UtilsExecProc__NS__spawnAsync, UtilsFilesFoldersSync__NS__copy, UtilsFilesFoldersSync__NS__getFoldersFrom, UtilsFilesFoldersSync__NS__IGNORE_FOLDERS_FILES_PATTERNS, UtilsFilesFoldersSync__NS__readFile, UtilsFilesFoldersSync__NS__writeFile, UtilsTerminal__NS__input, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__select } from 'tnp-core/lib-prod';
import { BaseQuickFixes, HelpersTaon__NS__getValueFromJSONC, UtilsTypescript__NS__formatFile } from 'tnp-helpers/lib-prod';
import { indexTsInSrcForWorker, KV_DATABASE_ONLINE_NAME, mainProjectSubProjects, packageJsonSubProject, TempalteSubprojectType, TempalteSubprojectTypeArr, TempalteSubprojectTypeGroup, TemplateFolder, TemplateSubprojectDbPrefix, tsconfigSubProject, wranglerJsonC, } from '../../constants';
//#endregion
// @ts-ignore TODO weird inheritance problem
export class SubProject extends BaseQuickFixes {
    //#region methods & getters
    //#region methods & getters / this project temp sub project folder
    get tempSubProjectFolder() {
        return this.project.pathFor('tmp-subproject-temp');
    }
    //#endregion
    //#region methods & getters / core project path template type
    pathToTempalteInCore(templateType) {
        return this.project.framework.coreProject.pathFor(`${TemplateFolder.templatesSubprojects}/${templateType}`);
    }
    //#endregion
    //#region methods & getters / this project path template type
    pathToTempalteInCurrentProject(templateType) {
        return this.project.pathFor(`${mainProjectSubProjects}/${TempalteSubprojectTypeGroup[templateType]}/${templateType}`);
    }
    //#endregion
    //#region methods & getters / worker name for
    workerNameFor(description) {
        //#region @backendFunc
        const base = ___NS__kebabCase(description);
        const hash = crypto
            .createHash('sha256')
            .update(description)
            .digest('hex')
            .slice(0, 5);
        return `${base}-${hash}`;
        //#endregion
    }
    //#endregion
    //#region methods & getters / npm install
    async npmInstall(cwdWorker) {
        //#region npm install
        this.project.nodeModules.linkToLocation(cwdWorker);
        Helpers__NS__info(`Linking node_modules done`);
        // let trysNpmInstall = 0;
        // Helpers__NS__info(`NPM INSTALL FOR WORKER`);
        // while (true) {
        //   try {
        //     if (Helpers__NS__exists([cwdWorker, nodeModulesSubPorject])) {
        //       if (trysNpmInstall > 0) {
        //         break;
        //       }
        //       if (
        //         !(await UtilsTerminal__NS__confirm({
        //           message: 'Skip npm install for subproject ?',
        //           defaultValue: true,
        //         }))
        //       ) {
        //         break;
        //       }
        //     }
        //     trysNpmInstall++;
        //     Helpers__NS__removeFileIfExists([cwdWorker, packageJsonLockSubProject]);
        //     await UtilsExecProc__NS__spawnAsync('npm install', {
        //       cwd: cwdWorker,
        //     }).waitUntilDoneOrThrow();
        //     break;
        //   } catch (error) {
        //     if (!(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))) {
        //       break;
        //     }
        //   }
        // }
        //#endregion
    }
    //#endregion
    //#region methods & getters / deplyment to cloud flare
    async deployment(cwdWorker) {
        //#region @backendFunc
        await this.loginCliCloudFlare(cwdWorker);
        Helpers__NS__taskStarted(`STARTING DEPLOYMENT OF WORKER ${cwdWorker}`);
        while (true) {
            try {
                Helpers__NS__taskStarted(`Deploying worker to cloud flare...`);
                const data = await UtilsExecProc__NS__spawnAsync(`npm run deploy`, {
                    cwd: cwdWorker,
                }).getOutput();
                const accountName = this.extractWorkersDevInfo(data.stdout);
                console.log(data.stdout);
                Helpers__NS__taskDone(`DONE DEPLOYMENT on acccount name "${accountName}"`);
                this.project.taonJson.setCloudFlareAccountSubdomain(accountName);
                break;
            }
            catch (error) {
                if (!(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))) {
                    break;
                }
            }
            break;
        }
        //#endregion
    }
    //#endregion
    //#region methods & getters / login to cloud flare
    async loginCliCloudFlare(cwdWorker) {
        //#region @backendFunc
        let trysLogin = 0;
        Helpers__NS__info(`CHECKING CLI CLOUDFLARE LOGIN`);
        while (true) {
            try {
                const isLogggedIn = await isWranglerLoggedIn(cwdWorker);
                Helpers__NS__info(`IS LOGGED IN USER: ${isLogggedIn}`);
                if (isLogggedIn) {
                    if (trysLogin > 0) {
                        Helpers__NS__taskDone(`Logged in cloudflare - DONE`);
                    }
                    else {
                        Helpers__NS__info(`Already logged in to cloudflare`);
                    }
                    break;
                }
                else {
                    trysLogin++;
                    Helpers__NS__logInfo(`Executing login script...`);
                    await UtilsExecProc__NS__spawnAsync('npx wrangler login', {
                        cwd: cwdWorker,
                    }).waitUntilDoneOrThrow();
                    Helpers__NS__info(`Waiting 2 seconds afer login...`);
                    await Utils__NS__wait(2);
                    Helpers__NS__taskDone(`Login done.`);
                }
            }
            catch (error) {
                if (!(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))) {
                    break;
                }
            }
        }
        //#endregion
    }
    //#endregion
    //#region methods & getters / init process
    async initProcess(absPathToSubproject, selectedTempalte) {
        //#region @backendFunc
        const cwdWorker = crossPlatformPath([
            absPathToSubproject,
            path.basename(absPathToSubproject),
        ]);
        // console.log({ cwdWorker });
        await this.npmInstall(cwdWorker);
        await this.loginCliCloudFlare(cwdWorker);
        //#region create kv db
        Helpers__NS__info(`KV DB CREATION`);
        while (true) {
            const KV_DB_NAME = await UtilsTerminal__NS__input({
                question: `Provide cloudflare KV database name to create`,
                defaultValue: `${TemplateSubprojectDbPrefix[selectedTempalte]}_${___NS__snakeCase(this.project.name).toUpperCase()}`,
                validate: value => {
                    return /^[A-Z0-9]+(?:_[A-Z0-9]+)*$/.test(value);
                },
            });
            try {
                await UtilsExecProc__NS__spawnAsync(`npx wrangler kv namespace create ${KV_DB_NAME}`, {
                    cwd: cwdWorker,
                }).waitUntilDoneOrThrow();
                const rcFilePath = crossPlatformPath([cwdWorker, 'src/index.ts']);
                const rcFileContent = UtilsFilesFoldersSync__NS__readFile(rcFilePath).replace(new RegExp(Utils__NS__escapeStringForRegEx(KV_DATABASE_ONLINE_NAME), 'g'), KV_DB_NAME);
                UtilsFilesFoldersSync__NS__writeFile(rcFilePath, rcFileContent);
                break;
            }
            catch (error) {
                if (!(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))) {
                    break;
                }
            }
            break;
        }
        //#endregion
        await this.deployment(cwdWorker);
        await this.addSecrets(cwdWorker, selectedTempalte);
        Helpers__NS__info(`

        YOUR WORKER ${path.basename(cwdWorker)} IS READY.

        `);
        //#endregion
    }
    //#endregion
    //#region methods & getters / add secrets
    async addSecrets(cwdWorker, selectedTempalte) {
        //#region @backendFunc
        if (selectedTempalte !== TempalteSubprojectType.TAON_STRIPE_CLOUDFLARE_WORKER) {
            Helpers__NS__warn(`Not allowed to set stripe secrets`);
            await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
            return;
        }
        //#region add stripe secret
        Helpers__NS__info(`


      ADDING STRIP SECRET

      Find in you stripe dashboard something like this:

      Secret key   sk_test_someletterarehe  <- copy this


      `);
        while (true) {
            try {
                Helpers__NS__taskStarted(`PLEASE WAIT FOR INPUT TO ADD STRIP SECRET ..`);
                const data = await UtilsExecProc__NS__spawnAsync(`npx wrangler secret put STRIPE_SECRET_KEY`, {
                    cwd: cwdWorker,
                }).waitUntilDoneOrThrow();
                Helpers__NS__taskDone(`STRIPE SECRET SAVED for "${this.project.taonJson.cloudFlareAccountSubdomain}"`);
                break;
            }
            catch (error) {
                if (!(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))) {
                    break;
                }
            }
            break;
        }
        //#endregion
        //#region add stripe webhook secret
        Helpers__NS__info(`ADDING STRIP ${chalk.bold('WEBHOOK')} SECRET (-> DIFFRENT THAT STRIPE SECRET)`);
        while (true) {
            try {
                Helpers__NS__info(`PLEASE ADD WEBHOOK IN STRIPE FOR ADDRESS:

        ${`https://${path.basename(cwdWorker)}` +
                    `.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev${TaonStripeCloudflareWorker.HOOK_POST}`}

        Find you Webhooks tab:

        Signing secret
        whsec_somekindofstringkey <- copy this


          `);
                await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
                Helpers__NS__taskStarted(`PLEASE WAIT FOR INPUT TO ADD WEBHOOK STRIP SECRET ..`);
                await UtilsExecProc__NS__spawnAsync(`npx wrangler secret put STRIPE_WEBHOOK_SECRET`, {
                    cwd: cwdWorker,
                }).waitUntilDoneOrThrow();
                Helpers__NS__taskDone(`STRIPE WEBHOOK SECRET SAVED for "${this.project.taonJson.cloudFlareAccountSubdomain}"`);
                break;
            }
            catch (error) {
                if (!(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))) {
                    break;
                }
            }
            break;
        }
        //#endregion
        //#endregion
    }
    //#endregion
    //#region methods & getters / set mode
    async setMode(cwdWorker, mode) {
        cwdWorker;
        while (true) {
            try {
                const ok = await setSecret(cwdWorker, 'WORKER_STRIPE_MODE', mode);
                if (ok) {
                    break;
                }
            }
            catch (error) {
                console.error(error);
            }
            Helpers__NS__warn(`Not able to set worker mode.`);
            await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
                message: `Press any key to start again`,
            });
        }
        Helpers__NS__info(`DONE. WORKER ${path.basename(cwdWorker)} is no in ${mode} mode`);
    }
    //#endregion
    //#region methods & getters / get all
    getAll() {
        //#region @backendFunc
        const all = TempalteSubprojectTypeArr.reduce((a, tempalteType) => {
            const folderForSubproject = this.pathToTempalteInCurrentProject(tempalteType);
            return a.concat(UtilsFilesFoldersSync__NS__getFoldersFrom(folderForSubproject, {
                omitPatterns: UtilsFilesFoldersSync__NS__IGNORE_FOLDERS_FILES_PATTERNS,
            }));
        }, []);
        return all;
        //#endregion
    }
    //#endregion
    //#region methods & getters / get all subprojects
    getAllSubProjects() {
        //#region @backendFunc
        return this.getAll().map(c => this.project.ins.From(c));
        //#endregion
    }
    //#endregion
    //#region methods & getters / get core by
    coreProjectBy(templateType) {
        return this.project.ins.From(this.project.framework.coreProject.pathFor([
            TemplateFolder.templatesSubprojects,
            templateType,
        ]));
    }
    //#endregion
    //#region methods & getters / recreate all
    async initAll() {
        //#region backendFunc
        const allProjectsPaths = this.getAll();
        for (const chosenProjectAbscwd of allProjectsPaths) {
            const templateType = path.basename(path.dirname(chosenProjectAbscwd));
            const group = path.basename(path.dirname(path.dirname(chosenProjectAbscwd)));
            const core = this.coreProjectBy(templateType);
            const workerCore = this.project.ins.From(core.pathFor(path.basename(core.name)));
            const currentCwdWorker = crossPlatformPath([
                chosenProjectAbscwd,
                path.basename(chosenProjectAbscwd),
            ]);
            Helpers__NS__logInfo(`Linking subproject: ${path.basename(currentCwdWorker)}`);
            //#region handle woker data
            (() => {
                const filesForBranding = [
                    packageJsonSubProject,
                    tsconfigSubProject,
                    indexTsInSrcForWorker,
                ];
                workerCore.copy(filesForBranding).to([currentCwdWorker]);
                const magicRenameRules = `${core.name} -> ${path.basename(chosenProjectAbscwd)}`;
                for (const relativePath of filesForBranding) {
                    const filePath = crossPlatformPath([currentCwdWorker, relativePath]);
                    if (!Helpers__NS__isFolder(filePath)) {
                        let content = UtilsFilesFoldersSync__NS__readFile(filePath);
                        const rules = RenameRule.from(magicRenameRules);
                        for (const rule of rules) {
                            content = content
                                .split('\n')
                                .map(line => {
                                if ((line || '').trim().startsWith('imp' + 'ort') ||
                                    (line || '').trim().startsWith('exp' + 'ort') ||
                                    (line || '').trim().includes('@skip' + 'ReplaceTaon')) {
                                    return line;
                                }
                                return rule.replaceInString(line);
                            })
                                .join('\n');
                        }
                        if (relativePath === indexTsInSrcForWorker) {
                            const dbName = HelpersTaon__NS__getValueFromJSONC([currentCwdWorker, wranglerJsonC], 'kv_namespaces[0].binding');
                            UtilsFilesFoldersSync__NS__writeFile(filePath, content.replace(new RegExp(Utils__NS__escapeStringForRegEx(KV_DATABASE_ONLINE_NAME), 'g'), dbName));
                            UtilsTypescript__NS__formatFile(filePath);
                        }
                        else {
                            UtilsFilesFoldersSync__NS__writeFile(filePath, content);
                        }
                    }
                }
            })();
            //#endregion
            //#region handle parent data
            (() => {
                const filesForBranding = [packageJsonSubProject, 'README.md', 'images'];
                core.copy(filesForBranding).to([chosenProjectAbscwd]);
                const magicRenameRules = `${core.name} -> ${path.basename(chosenProjectAbscwd)}`;
                for (const relativePath of filesForBranding) {
                    const filePath = crossPlatformPath([
                        chosenProjectAbscwd,
                        relativePath,
                    ]);
                    // console.log(`isFile ${!Helpers__NS__isFolder(filePath)} ${filePath}`)
                    if (!Helpers__NS__isFolder(filePath)) {
                        let content = UtilsFilesFoldersSync__NS__readFile(filePath);
                        if (content) {
                            const rules = RenameRule.from(magicRenameRules);
                            for (const rule of rules) {
                                content = rule.replaceInString(content);
                            }
                            UtilsFilesFoldersSync__NS__writeFile(filePath, content);
                        }
                    }
                }
            })();
            //#endregion
            await this.npmInstall(currentCwdWorker);
        }
        //#endregion
    }
    //#endregion
    //#region methods & getters / get all by type
    getAllByTypePaths(tempalteType) {
        const folderForSubproject = this.pathToTempalteInCurrentProject(tempalteType);
        return UtilsFilesFoldersSync__NS__getFoldersFrom(folderForSubproject, {
            omitPatterns: UtilsFilesFoldersSync__NS__IGNORE_FOLDERS_FILES_PATTERNS,
        }).filter(f => {
            return Helpers__NS__exists([f, path.basename(f), packageJsonSubProject]);
        });
    }
    //#endregion
    //#region methods & getters / get all project by type
    getAllByType(tempalteType) {
        const allPaths = this.getAllByTypePaths(tempalteType);
        const byType = allPaths.map(c => this.project.ins.From(c)).filter(f => !!f);
        return byType;
    }
    //#endregion
    //#region methods & getters / extract worker account name
    extractWorkersDevInfo(text) {
        const match = text.match(/https:\/\/([^\.]+)\.([^\.]+)\.workers\.dev/);
        if (!match) {
            return undefined;
        }
        return match[2];
    }
    //#endregion
    //#endregion
    //#region PUBLIC API
    //#region PUBLIC API / add new and configure
    async addAndConfigure() {
        //#region @backendFunc
        await this.initAll();
        const choices = TempalteSubprojectTypeArr.reduce((a, b) => {
            return {
                ...a,
                [b]: {
                    name: b,
                },
            };
        }, {});
        const select = await UtilsTerminal__NS__select({
            choices,
            question: `Select subproject that you want to add`,
        });
        let nameForProject;
        const alreadyAdded = this.getAll().map(c => path.basename(c));
        while (true) {
            nameForProject = await UtilsTerminal__NS__input({
                required: true,
                defaultValue: `kv-db-${this.project.name}`,
                question: `Name for worker`,
            });
            if (alreadyAdded.includes(nameForProject)) {
                Helpers__NS__info(`Name take.. try another one.`);
                continue;
            }
            break;
        }
        const coreProjTemplatePath = this.pathToTempalteInCore(select);
        const localTempPath = crossPlatformPath([
            this.tempSubProjectFolder,
            path.basename(coreProjTemplatePath),
        ]);
        Helpers__NS__remove(localTempPath);
        UtilsFilesFoldersSync__NS__copy(coreProjTemplatePath, localTempPath, {
            recursive: true,
        });
        const generatedWorkerName = this.workerNameFor(nameForProject);
        const magicRenameRules = `${path.basename(coreProjTemplatePath)}` + ` -> ${generatedWorkerName}`;
        const ins = MagicRenamer.Instance(localTempPath);
        ins.start(magicRenameRules, []);
        const pathInsideProject = crossPlatformPath([
            this.pathToTempalteInCurrentProject(select),
            generatedWorkerName,
        ]);
        Helpers__NS__remove(pathInsideProject);
        UtilsFilesFoldersSync__NS__copy([this.tempSubProjectFolder, generatedWorkerName], pathInsideProject, {
            recursive: true,
        });
        // Helpers__NS__remove(localTempPath); uncomment
        Helpers__NS__remove([this.tempSubProjectFolder, generatedWorkerName]);
        await this.initProcess(crossPlatformPath(pathInsideProject), select);
        //#endregion
    }
    //#endregion
    //#region PUBLIC API / test with example data
    async testWithExampleData() {
        //#region @backendFunc
        await this.initAll();
        const subprojects = this.getAllSubProjects();
        const choices = subprojects.reduce((a, b) => {
            return {
                ...a,
                [b.name]: {
                    name: b.name,
                },
            };
        }, {});
        const chosenProjectName = await UtilsTerminal__NS__select({
            question: 'Select project to test with exmaple data',
            choices,
        });
        const chosenProject = this.getAllSubProjects().find(c => c.name === chosenProjectName);
        const templateType = path.basename(path.dirname(chosenProject.location));
        const group = path.basename(path.dirname(path.dirname(chosenProject.location)));
        const url = `https://${chosenProjectName}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev`;
        const currentProjectAbsPath = crossPlatformPath([
            this.pathToTempalteInCurrentProject(templateType),
            chosenProjectName,
        ]);
        const cwdWorker = crossPlatformPath([
            currentProjectAbsPath,
            chosenProjectName,
        ]);
        const prouctChoices = {
            movieProduct: {
                name: 'movie-product-id',
            },
            playlistProuct: {
                name: 'playlist-product-id',
            },
            bookProuct: {
                name: 'book-product-id',
            },
        };
        const alredyUsedEmails = new Set();
        const actionSelect = {
            addSoldProuct: {
                name: 'Add example product (as stripe hook)',
            },
            checkIfProuctAdded: {
                name: 'Check example product (as client)',
            },
            extit: {
                name: 'Exit',
            },
        };
        while (true) {
            Helpers__NS__logInfo(`Testing with example data on url: ${url}`);
            const action = await UtilsTerminal__NS__select({
                question: 'Select action',
                choices: actionSelect,
            });
            if (action === 'extit') {
                break;
            }
            if (action === 'addSoldProuct') {
                //#region add sold product
                const clientEmail = await UtilsTerminal__NS__input({
                    question: 'Provide client email for example sold product',
                    defaultValue: `generate.email.${Date.now()}@example.com`,
                });
                alredyUsedEmails.add(clientEmail);
                const productId = await UtilsTerminal__NS__select({
                    question: 'Select product id send',
                    choices: prouctChoices,
                });
                const req = new TaonStripeCloudflareWorker(url);
                try {
                    await req.sendAsStripe({
                        stripeSessionId: `stripesessionid_${Date.now()}`,
                        productId,
                        clientEmail,
                    });
                    Helpers__NS__info(`Example product added with client email: ${clientEmail} and product id: ${productId}`);
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
                }
                catch (error) {
                    console.log(error);
                    Helpers__NS__error(`Error adding example product: ${error.message}`);
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
                }
                //#endregion
            }
            else if (action === 'checkIfProuctAdded') {
                //#region check if product added
                const req = new TaonStripeCloudflareWorker(url);
                const productId = await UtilsTerminal__NS__select({
                    question: 'Select product id send',
                    choices: prouctChoices,
                });
                const choicesEmail = Array.from(alredyUsedEmails).reduce((a, b) => {
                    return {
                        [b]: { name: b },
                    };
                }, {});
                const clientEmail = await UtilsTerminal__NS__select({
                    question: 'Select client email to check',
                    choices: choicesEmail,
                });
                try {
                    const result = await req.checkAccess({ productId, clientEmail });
                    Helpers__NS__info(`Checking result for:
             client email: ${clientEmail}
             product id: ${productId}
             CLIENT HAS ACCESS: ${result}`); // should be true
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
                }
                catch (error) {
                    console.log(error);
                    Helpers__NS__error(`Error checking if product purchased: ${error.message}`);
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
                }
                //#endregion
            }
        }
        // Helpers,
        // await
        //#endregion
    }
    //#endregion
    //#region PUBLIC API / set mode for worker
    async setModeForWorker() {
        //#region @backendFunc
        await this.initAll();
        const subprojects = this.getAllSubProjects();
        const choices = subprojects.reduce((a, b) => {
            return {
                ...a,
                [b.name]: {
                    name: b.name,
                },
            };
        }, {});
        const chosenProjectName = await UtilsTerminal__NS__select({
            question: 'Select project to set mode:',
            choices,
        });
        const chosenProject = this.getAllSubProjects().find(c => c.name === chosenProjectName);
        const templateType = path.basename(path.dirname(chosenProject.location));
        const group = path.basename(path.dirname(path.dirname(chosenProject.location)));
        const url = `https://${chosenProjectName}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev`;
        const currentProjectAbsPath = crossPlatformPath([
            this.pathToTempalteInCurrentProject(templateType),
            chosenProjectName,
        ]);
        const cwdWorker = crossPlatformPath([
            currentProjectAbsPath,
            chosenProjectName,
        ]);
        const setModeChoices = {
            setProduction: {
                name: 'production',
            },
            setDevelopment: {
                name: 'development',
            },
            exit: {
                name: 'BACK',
            },
        };
        const mode = await UtilsTerminal__NS__select({
            question: 'Select worker mode:',
            choices: setModeChoices,
        });
        if (mode === 'exit') {
            return;
        }
        await this.setMode(cwdWorker, mode);
        //#endregion
    }
    //#endregion
    //#region PUBLIC API / set mode for worker
    async setWorkerSecrets() {
        //#region @backendFunc
        await this.initAll();
        const subprojects = this.getAllSubProjects();
        const choices = subprojects.reduce((a, b) => {
            return {
                ...a,
                [b.name]: {
                    name: b.name,
                },
            };
        }, {});
        const chosenProjectName = await UtilsTerminal__NS__select({
            question: 'Select project to set stripe secrets:',
            choices,
        });
        const chosenProject = this.getAllSubProjects().find(c => c.name === chosenProjectName);
        const templateType = path.basename(path.dirname(chosenProject.location));
        const group = path.basename(path.dirname(path.dirname(chosenProject.location)));
        const url = `https://${chosenProjectName}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev`;
        const currentProjectAbsPath = crossPlatformPath([
            this.pathToTempalteInCurrentProject(templateType),
            chosenProjectName,
        ]);
        const cwdWorker = crossPlatformPath([
            currentProjectAbsPath,
            chosenProjectName,
        ]);
        await this.addSecrets(cwdWorker, chosenProjectName);
        //#endregion
    }
    //#endregion
    //#region PUBLIC API / deploy worker
    async deployWorker() {
        //#region @backendFunc
        await this.initAll();
        const subprojects = this.getAllSubProjects();
        const choices = subprojects.reduce((a, b) => {
            return {
                ...a,
                [b.name]: {
                    name: b.name,
                },
            };
        }, {});
        const chosenProjectName = await UtilsTerminal__NS__select({
            question: 'Select project to deploy:',
            choices,
        });
        const chosenProject = this.getAllSubProjects().find(c => c.name === chosenProjectName);
        const templateType = path.basename(path.dirname(chosenProject.location));
        const group = path.basename(path.dirname(path.dirname(chosenProject.location)));
        const url = `https://${chosenProjectName}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev`;
        const currentProjectAbsPath = crossPlatformPath([
            this.pathToTempalteInCurrentProject(templateType),
            chosenProjectName,
        ]);
        const cwdWorker = crossPlatformPath([
            currentProjectAbsPath,
            chosenProjectName,
        ]);
        await this.deployment(cwdWorker);
        //#endregion
    }
}
//#region  helpers
//#region  helpers / is wrangelr logged in
async function isWranglerLoggedIn(cwd) {
    //#region @backendFunc
    try {
        const data = (await UtilsExecProc__NS__spawnAsync('npx wrangler whoami', {
            cwd,
        }).getStdoutWithoutShowingOrThrow()) || '';
        if (data.includes('You are not authenticated')) {
            return false;
        }
        return true;
    }
    catch {
        return false;
    }
    //#endregion
}
//#endregion
//#region helpers / set secret cloudflare
export async function setSecret(cwdWorker, name, value) {
    //#region @backendFunc
    return new Promise((resolve, reject) => {
        const proc = spawn('npx', ['wrangler', 'secret', 'put', name], {
            stdio: ['pipe', 'inherit', 'inherit'],
            cwd: cwdWorker,
        });
        proc.stdin.write(value);
        proc.stdin.end();
        proc.on('close', code => {
            if (code === 0)
                resolve(true);
            else
                reject(new Error(`wrangler exited with ${code}`));
        });
    });
    //#endregion
}
//#endregion
//#endregion
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/sub-project.js.map