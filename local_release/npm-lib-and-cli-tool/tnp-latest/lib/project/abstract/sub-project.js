"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubProject = void 0;
exports.setSecret = setSecret;
//#region imports
const child_process_1 = require("child_process");
const crypto = require("crypto");
const lib_1 = require("magic-renamer/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
//#endregion
// @ts-ignore TODO weird inheritance problem
class SubProject extends lib_3.BaseQuickFixes {
    //#region methods & getters
    //#region methods & getters / this project temp sub project folder
    get tempSubProjectFolder() {
        return this.project.pathFor('tmp-subproject-temp');
    }
    //#endregion
    //#region methods & getters / core project path template type
    pathToTempalteInCore(templateType) {
        return this.project.framework.coreProject.pathFor(`${constants_1.TemplateFolder.templatesSubprojects}/${templateType}`);
    }
    //#endregion
    //#region methods & getters / this project path template type
    pathToTempalteInCurrentProject(templateType) {
        return this.project.pathFor(`${constants_1.mainProjectSubProjects}/${constants_1.TempalteSubprojectTypeGroup[templateType]}/${templateType}`);
    }
    //#endregion
    //#region methods & getters / worker name for
    workerNameFor(description) {
        //#region @backendFunc
        const base = lib_2._.kebabCase(description);
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
        lib_2.Helpers.info(`Linking node_modules done`);
        // let trysNpmInstall = 0;
        // Helpers.info(`NPM INSTALL FOR WORKER`);
        // while (true) {
        //   try {
        //     if (Helpers.exists([cwdWorker, nodeModulesSubPorject])) {
        //       if (trysNpmInstall > 0) {
        //         break;
        //       }
        //       if (
        //         !(await UtilsTerminal.confirm({
        //           message: 'Skip npm install for subproject ?',
        //           defaultValue: true,
        //         }))
        //       ) {
        //         break;
        //       }
        //     }
        //     trysNpmInstall++;
        //     Helpers.removeFileIfExists([cwdWorker, packageJsonLockSubProject]);
        //     await UtilsExecProc.spawnAsync('npm install', {
        //       cwd: cwdWorker,
        //     }).waitUntilDoneOrThrow();
        //     break;
        //   } catch (error) {
        //     if (!(await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
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
        lib_2.Helpers.taskStarted(`STARTING DEPLOYMENT OF WORKER ${cwdWorker}`);
        while (true) {
            try {
                lib_2.Helpers.taskStarted(`Deploying worker to cloud flare...`);
                const data = await lib_2.UtilsExecProc.spawnAsync(`npm run deploy`, {
                    cwd: cwdWorker,
                }).getOutput();
                const accountName = this.extractWorkersDevInfo(data.stdout);
                console.log(data.stdout);
                lib_2.Helpers.taskDone(`DONE DEPLOYMENT on acccount name "${accountName}"`);
                this.project.taonJson.setCloudFlareAccountSubdomain(accountName);
                break;
            }
            catch (error) {
                if (!(await lib_2.UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
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
        lib_2.Helpers.info(`CHECKING CLI CLOUDFLARE LOGIN`);
        while (true) {
            try {
                const isLogggedIn = await isWranglerLoggedIn(cwdWorker);
                lib_2.Helpers.info(`IS LOGGED IN USER: ${isLogggedIn}`);
                if (isLogggedIn) {
                    if (trysLogin > 0) {
                        lib_2.Helpers.taskDone(`Logged in cloudflare - DONE`);
                    }
                    else {
                        lib_2.Helpers.info(`Already logged in to cloudflare`);
                    }
                    break;
                }
                else {
                    trysLogin++;
                    lib_2.Helpers.logInfo(`Executing login script...`);
                    await lib_2.UtilsExecProc.spawnAsync('npx wrangler login', {
                        cwd: cwdWorker,
                    }).waitUntilDoneOrThrow();
                    lib_2.Helpers.info(`Waiting 2 seconds afer login...`);
                    await lib_2.Utils.wait(2);
                    lib_2.Helpers.taskDone(`Login done.`);
                }
            }
            catch (error) {
                if (!(await lib_2.UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
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
        const cwdWorker = (0, lib_2.crossPlatformPath)([
            absPathToSubproject,
            lib_2.path.basename(absPathToSubproject),
        ]);
        // console.log({ cwdWorker });
        await this.npmInstall(cwdWorker);
        await this.loginCliCloudFlare(cwdWorker);
        //#region create kv db
        lib_2.Helpers.info(`KV DB CREATION`);
        while (true) {
            const KV_DB_NAME = await lib_2.UtilsTerminal.input({
                question: `Provide cloudflare KV database name to create`,
                defaultValue: `${constants_1.TemplateSubprojectDbPrefix[selectedTempalte]}_${lib_2._.snakeCase(this.project.name).toUpperCase()}`,
                validate: value => {
                    return /^[A-Z0-9]+(?:_[A-Z0-9]+)*$/.test(value);
                },
            });
            try {
                await lib_2.UtilsExecProc.spawnAsync(`npx wrangler kv namespace create ${KV_DB_NAME}`, {
                    cwd: cwdWorker,
                }).waitUntilDoneOrThrow();
                const rcFilePath = (0, lib_2.crossPlatformPath)([cwdWorker, 'src/index.ts']);
                const rcFileContent = lib_2.UtilsFilesFoldersSync.readFile(rcFilePath).replace(new RegExp(lib_2.Utils.escapeStringForRegEx(constants_1.KV_DATABASE_ONLINE_NAME), 'g'), KV_DB_NAME);
                lib_2.UtilsFilesFoldersSync.writeFile(rcFilePath, rcFileContent);
                break;
            }
            catch (error) {
                if (!(await lib_2.UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
                    break;
                }
            }
            break;
        }
        //#endregion
        await this.deployment(cwdWorker);
        await this.addSecrets(cwdWorker, selectedTempalte);
        lib_2.Helpers.info(`

        YOUR WORKER ${lib_2.path.basename(cwdWorker)} IS READY.

        `);
        //#endregion
    }
    //#endregion
    //#region methods & getters / add secrets
    async addSecrets(cwdWorker, selectedTempalte) {
        //#region @backendFunc
        if (selectedTempalte !== constants_1.TempalteSubprojectType.TAON_STRIPE_CLOUDFLARE_WORKER) {
            lib_2.Helpers.warn(`Not allowed to set stripe secrets`);
            await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
            return;
        }
        //#region add stripe secret
        lib_2.Helpers.info(`


      ADDING STRIP SECRET

      Find in you stripe dashboard something like this:

      Secret key   sk_test_someletterarehe  <- copy this


      `);
        while (true) {
            try {
                lib_2.Helpers.taskStarted(`PLEASE WAIT FOR INPUT TO ADD STRIP SECRET ..`);
                const data = await lib_2.UtilsExecProc.spawnAsync(`npx wrangler secret put STRIPE_SECRET_KEY`, {
                    cwd: cwdWorker,
                }).waitUntilDoneOrThrow();
                lib_2.Helpers.taskDone(`STRIPE SECRET SAVED for "${this.project.taonJson.cloudFlareAccountSubdomain}"`);
                break;
            }
            catch (error) {
                if (!(await lib_2.UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
                    break;
                }
            }
            break;
        }
        //#endregion
        //#region add stripe webhook secret
        lib_2.Helpers.info(`ADDING STRIP ${lib_2.chalk.bold('WEBHOOK')} SECRET (-> DIFFRENT THAT STRIPE SECRET)`);
        while (true) {
            try {
                lib_2.Helpers.info(`PLEASE ADD WEBHOOK IN STRIPE FOR ADDRESS:

        ${`https://${lib_2.path.basename(cwdWorker)}` +
                    `.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev${lib_2.TaonStripeCloudflareWorker.HOOK_POST}`}

        Find you Webhooks tab:

        Signing secret
        whsec_somekindofstringkey <- copy this


          `);
                await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
                lib_2.Helpers.taskStarted(`PLEASE WAIT FOR INPUT TO ADD WEBHOOK STRIP SECRET ..`);
                await lib_2.UtilsExecProc.spawnAsync(`npx wrangler secret put STRIPE_WEBHOOK_SECRET`, {
                    cwd: cwdWorker,
                }).waitUntilDoneOrThrow();
                lib_2.Helpers.taskDone(`STRIPE WEBHOOK SECRET SAVED for "${this.project.taonJson.cloudFlareAccountSubdomain}"`);
                break;
            }
            catch (error) {
                if (!(await lib_2.UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
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
            lib_2.Helpers.warn(`Not able to set worker mode.`);
            await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync({
                message: `Press any key to start again`,
            });
        }
        lib_2.Helpers.info(`DONE. WORKER ${lib_2.path.basename(cwdWorker)} is no in ${mode} mode`);
    }
    //#endregion
    //#region methods & getters / get all
    getAll() {
        //#region @backendFunc
        const all = constants_1.TempalteSubprojectTypeArr.reduce((a, tempalteType) => {
            const folderForSubproject = this.pathToTempalteInCurrentProject(tempalteType);
            return a.concat(lib_2.UtilsFilesFoldersSync.getFoldersFrom(folderForSubproject, {
                omitPatterns: lib_2.UtilsFilesFoldersSync.IGNORE_FOLDERS_FILES_PATTERNS,
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
            constants_1.TemplateFolder.templatesSubprojects,
            templateType,
        ]));
    }
    //#endregion
    //#region methods & getters / recreate all
    async initAll() {
        //#region backendFunc
        const allProjectsPaths = this.getAll();
        for (const chosenProjectAbscwd of allProjectsPaths) {
            const templateType = lib_2.path.basename(lib_2.path.dirname(chosenProjectAbscwd));
            const group = lib_2.path.basename(lib_2.path.dirname(lib_2.path.dirname(chosenProjectAbscwd)));
            const core = this.coreProjectBy(templateType);
            const workerCore = this.project.ins.From(core.pathFor(lib_2.path.basename(core.name)));
            const currentCwdWorker = (0, lib_2.crossPlatformPath)([
                chosenProjectAbscwd,
                lib_2.path.basename(chosenProjectAbscwd),
            ]);
            lib_2.Helpers.logInfo(`Linking subproject: ${lib_2.path.basename(currentCwdWorker)}`);
            //#region handle woker data
            (() => {
                const filesForBranding = [
                    constants_1.packageJsonSubProject,
                    constants_1.tsconfigSubProject,
                    constants_1.indexTsInSrcForWorker,
                ];
                workerCore.copy(filesForBranding).to([currentCwdWorker]);
                const magicRenameRules = `${core.name} -> ${lib_2.path.basename(chosenProjectAbscwd)}`;
                for (const relativePath of filesForBranding) {
                    const filePath = (0, lib_2.crossPlatformPath)([currentCwdWorker, relativePath]);
                    if (!lib_2.Helpers.isFolder(filePath)) {
                        let content = lib_2.UtilsFilesFoldersSync.readFile(filePath);
                        const rules = lib_1.RenameRule.from(magicRenameRules);
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
                        if (relativePath === constants_1.indexTsInSrcForWorker) {
                            const dbName = lib_3.HelpersTaon.getValueFromJSONC([currentCwdWorker, constants_1.wranglerJsonC], 'kv_namespaces[0].binding');
                            lib_2.UtilsFilesFoldersSync.writeFile(filePath, content.replace(new RegExp(lib_2.Utils.escapeStringForRegEx(constants_1.KV_DATABASE_ONLINE_NAME), 'g'), dbName));
                            lib_3.UtilsTypescript.formatFile(filePath);
                        }
                        else {
                            lib_2.UtilsFilesFoldersSync.writeFile(filePath, content);
                        }
                    }
                }
            })();
            //#endregion
            //#region handle parent data
            (() => {
                const filesForBranding = [constants_1.packageJsonSubProject, 'README.md', 'images'];
                core.copy(filesForBranding).to([chosenProjectAbscwd]);
                const magicRenameRules = `${core.name} -> ${lib_2.path.basename(chosenProjectAbscwd)}`;
                for (const relativePath of filesForBranding) {
                    const filePath = (0, lib_2.crossPlatformPath)([
                        chosenProjectAbscwd,
                        relativePath,
                    ]);
                    // console.log(`isFile ${!Helpers.isFolder(filePath)} ${filePath}`)
                    if (!lib_2.Helpers.isFolder(filePath)) {
                        let content = lib_2.UtilsFilesFoldersSync.readFile(filePath);
                        if (content) {
                            const rules = lib_1.RenameRule.from(magicRenameRules);
                            for (const rule of rules) {
                                content = rule.replaceInString(content);
                            }
                            lib_2.UtilsFilesFoldersSync.writeFile(filePath, content);
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
        return lib_2.UtilsFilesFoldersSync.getFoldersFrom(folderForSubproject, {
            omitPatterns: lib_2.UtilsFilesFoldersSync.IGNORE_FOLDERS_FILES_PATTERNS,
        }).filter(f => {
            return lib_2.Helpers.exists([f, lib_2.path.basename(f), constants_1.packageJsonSubProject]);
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
        const choices = constants_1.TempalteSubprojectTypeArr.reduce((a, b) => {
            return {
                ...a,
                [b]: {
                    name: b,
                },
            };
        }, {});
        const select = await lib_2.UtilsTerminal.select({
            choices,
            question: `Select subproject that you want to add`,
        });
        let nameForProject;
        const alreadyAdded = this.getAll().map(c => lib_2.path.basename(c));
        while (true) {
            nameForProject = await lib_2.UtilsTerminal.input({
                required: true,
                defaultValue: `kv-db-${this.project.name}`,
                question: `Name for worker`,
            });
            if (alreadyAdded.includes(nameForProject)) {
                lib_2.Helpers.info(`Name take.. try another one.`);
                continue;
            }
            break;
        }
        const coreProjTemplatePath = this.pathToTempalteInCore(select);
        const localTempPath = (0, lib_2.crossPlatformPath)([
            this.tempSubProjectFolder,
            lib_2.path.basename(coreProjTemplatePath),
        ]);
        lib_2.Helpers.remove(localTempPath);
        lib_2.UtilsFilesFoldersSync.copy(coreProjTemplatePath, localTempPath, {
            recursive: true,
        });
        const generatedWorkerName = this.workerNameFor(nameForProject);
        const magicRenameRules = `${lib_2.path.basename(coreProjTemplatePath)}` + ` -> ${generatedWorkerName}`;
        const ins = lib_1.MagicRenamer.Instance(localTempPath);
        ins.start(magicRenameRules, []);
        const pathInsideProject = (0, lib_2.crossPlatformPath)([
            this.pathToTempalteInCurrentProject(select),
            generatedWorkerName,
        ]);
        lib_2.Helpers.remove(pathInsideProject);
        lib_2.UtilsFilesFoldersSync.copy([this.tempSubProjectFolder, generatedWorkerName], pathInsideProject, {
            recursive: true,
        });
        // Helpers.remove(localTempPath); uncomment
        lib_2.Helpers.remove([this.tempSubProjectFolder, generatedWorkerName]);
        await this.initProcess((0, lib_2.crossPlatformPath)(pathInsideProject), select);
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
        const chosenProjectName = await lib_2.UtilsTerminal.select({
            question: 'Select project to test with exmaple data',
            choices,
        });
        const chosenProject = this.getAllSubProjects().find(c => c.name === chosenProjectName);
        const templateType = lib_2.path.basename(lib_2.path.dirname(chosenProject.location));
        const group = lib_2.path.basename(lib_2.path.dirname(lib_2.path.dirname(chosenProject.location)));
        const url = `https://${chosenProjectName}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev`;
        const currentProjectAbsPath = (0, lib_2.crossPlatformPath)([
            this.pathToTempalteInCurrentProject(templateType),
            chosenProjectName,
        ]);
        const cwdWorker = (0, lib_2.crossPlatformPath)([
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
            lib_2.Helpers.logInfo(`Testing with example data on url: ${url}`);
            const action = await lib_2.UtilsTerminal.select({
                question: 'Select action',
                choices: actionSelect,
            });
            if (action === 'extit') {
                break;
            }
            if (action === 'addSoldProuct') {
                //#region add sold product
                const clientEmail = await lib_2.UtilsTerminal.input({
                    question: 'Provide client email for example sold product',
                    defaultValue: `generate.email.${Date.now()}@example.com`,
                });
                alredyUsedEmails.add(clientEmail);
                const productId = await lib_2.UtilsTerminal.select({
                    question: 'Select product id send',
                    choices: prouctChoices,
                });
                const req = new lib_2.TaonStripeCloudflareWorker(url);
                try {
                    await req.sendAsStripe({
                        stripeSessionId: `stripesessionid_${Date.now()}`,
                        productId,
                        clientEmail,
                    });
                    lib_2.Helpers.info(`Example product added with client email: ${clientEmail} and product id: ${productId}`);
                    await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
                }
                catch (error) {
                    console.log(error);
                    lib_2.Helpers.error(`Error adding example product: ${error.message}`);
                    await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
                }
                //#endregion
            }
            else if (action === 'checkIfProuctAdded') {
                //#region check if product added
                const req = new lib_2.TaonStripeCloudflareWorker(url);
                const productId = await lib_2.UtilsTerminal.select({
                    question: 'Select product id send',
                    choices: prouctChoices,
                });
                const choicesEmail = Array.from(alredyUsedEmails).reduce((a, b) => {
                    return {
                        [b]: { name: b },
                    };
                }, {});
                const clientEmail = await lib_2.UtilsTerminal.select({
                    question: 'Select client email to check',
                    choices: choicesEmail,
                });
                try {
                    const result = await req.checkAccess({ productId, clientEmail });
                    lib_2.Helpers.info(`Checking result for:
             client email: ${clientEmail}
             product id: ${productId}
             CLIENT HAS ACCESS: ${result}`); // should be true
                    await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
                }
                catch (error) {
                    console.log(error);
                    lib_2.Helpers.error(`Error checking if product purchased: ${error.message}`);
                    await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
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
        const chosenProjectName = await lib_2.UtilsTerminal.select({
            question: 'Select project to set mode:',
            choices,
        });
        const chosenProject = this.getAllSubProjects().find(c => c.name === chosenProjectName);
        const templateType = lib_2.path.basename(lib_2.path.dirname(chosenProject.location));
        const group = lib_2.path.basename(lib_2.path.dirname(lib_2.path.dirname(chosenProject.location)));
        const url = `https://${chosenProjectName}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev`;
        const currentProjectAbsPath = (0, lib_2.crossPlatformPath)([
            this.pathToTempalteInCurrentProject(templateType),
            chosenProjectName,
        ]);
        const cwdWorker = (0, lib_2.crossPlatformPath)([
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
        const mode = await lib_2.UtilsTerminal.select({
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
        const chosenProjectName = await lib_2.UtilsTerminal.select({
            question: 'Select project to set stripe secrets:',
            choices,
        });
        const chosenProject = this.getAllSubProjects().find(c => c.name === chosenProjectName);
        const templateType = lib_2.path.basename(lib_2.path.dirname(chosenProject.location));
        const group = lib_2.path.basename(lib_2.path.dirname(lib_2.path.dirname(chosenProject.location)));
        const url = `https://${chosenProjectName}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev`;
        const currentProjectAbsPath = (0, lib_2.crossPlatformPath)([
            this.pathToTempalteInCurrentProject(templateType),
            chosenProjectName,
        ]);
        const cwdWorker = (0, lib_2.crossPlatformPath)([
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
        const chosenProjectName = await lib_2.UtilsTerminal.select({
            question: 'Select project to deploy:',
            choices,
        });
        const chosenProject = this.getAllSubProjects().find(c => c.name === chosenProjectName);
        const templateType = lib_2.path.basename(lib_2.path.dirname(chosenProject.location));
        const group = lib_2.path.basename(lib_2.path.dirname(lib_2.path.dirname(chosenProject.location)));
        const url = `https://${chosenProjectName}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev`;
        const currentProjectAbsPath = (0, lib_2.crossPlatformPath)([
            this.pathToTempalteInCurrentProject(templateType),
            chosenProjectName,
        ]);
        const cwdWorker = (0, lib_2.crossPlatformPath)([
            currentProjectAbsPath,
            chosenProjectName,
        ]);
        await this.deployment(cwdWorker);
        //#endregion
    }
}
exports.SubProject = SubProject;
//#region  helpers
//#region  helpers / is wrangelr logged in
async function isWranglerLoggedIn(cwd) {
    //#region @backendFunc
    try {
        const data = (await lib_2.UtilsExecProc.spawnAsync('npx wrangler whoami', {
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
async function setSecret(cwdWorker, name, value) {
    //#region @backendFunc
    return new Promise((resolve, reject) => {
        const proc = (0, child_process_1.spawn)('npx', ['wrangler', 'secret', 'put', name], {
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/sub-project.js.map