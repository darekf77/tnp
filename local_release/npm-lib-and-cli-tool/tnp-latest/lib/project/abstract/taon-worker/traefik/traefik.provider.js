"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraefikProvider = void 0;
//#region imports
const util_1 = require("util");
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const constants_1 = require("../../../../constants");
const taon_models_1 = require("../taon.models");
const treafik_service_provider_1 = require("./treafik-service.provider");
//#endregion
class TraefikProvider {
    taonProjectsWorker;
    //#region fields & getters
    service = new treafik_service_provider_1.TraefikServiceProvider(this);
    cloudIps = [];
    taonCloudStatus = taon_models_1.TaonCloudStatus.NOT_STARED;
    reverseProxyNetworkName = 'traefik-net';
    //#region fields & getters / cloud is enabled
    get cloudIsEnabled() {
        //#region @backendFunc
        return (this.taonCloudStatus === taon_models_1.TaonCloudStatus.ENABLED_NOT_SECURE ||
            this.taonCloudStatus === taon_models_1.TaonCloudStatus.ENABLED_SECURED);
        //#endregion
    }
    //#endregion
    //#region fields & getters / is dev mode
    get isDevMode() {
        //#region @backendFunc
        return (this.taonCloudStatus === taon_models_1.TaonCloudStatus.ENABLED_NOT_SECURE ||
            this.taonCloudStatus === taon_models_1.TaonCloudStatus.STARTING_NOT_SECURE_MODE ||
            lib_4.Helpers.exists([
                this.pathToTraefikComposeDestCwd,
                `traefik-compose.local-dev.yml`,
            ]));
        //#endregion
    }
    //#endregion
    //#region fields & getters / get path to compose dest
    /**
     * Path to traefik docker compose cwd where
     * compose will be started
     */
    get pathToTraefikComposeDestCwd() {
        //#region @backendFunc
        const pathToComposeDest = (0, lib_2.crossPlatformPath)([
            constants_1.taonBasePathToGlobalDockerTemplates,
            lib_2.path.basename(this.pathToTraefikComposeSourceTemplateFilesCwd),
        ]);
        return pathToComposeDest;
        //#endregion
    }
    //#endregion
    //#region fields & getters / get path to compose source
    /**
     * Path to traefik docker compose template files
     */
    get pathToTraefikComposeSourceTemplateFilesCwd() {
        //#region @backendFunc
        const pathToComposeSource = this.taonProjectsWorker.ins
            .by(lib_1.LibTypeEnum.ISOMORPHIC_LIB)
            .pathFor(`docker-templates/traefik`);
        return pathToComposeSource;
        //#endregion
    }
    //#endregion
    //#endregion
    constructor(taonProjectsWorker) {
        this.taonProjectsWorker = taonProjectsWorker;
    }
    //#region protected methods
    //#region protected methods / set enabled mode
    setEnabledMode() {
        if (this.isDevMode) {
            this.taonCloudStatus = taon_models_1.TaonCloudStatus.ENABLED_NOT_SECURE;
        }
        else {
            this.taonCloudStatus = taon_models_1.TaonCloudStatus.ENABLED_SECURED;
        }
        lib_4.BaseCliWorker.cloudIp.next(lib_2._.first(this.cloudIps));
        lib_4.BaseCliWorker.isCloudEnable.next(true);
    }
    //#endregion
    //#region protected methods / check if docker enabled
    async checkIfDockerEnabled() {
        //#region @backendFunc
        lib_4.Helpers.taskStarted(`Checking if docker is enabled...`);
        const isEnableDocker = await lib_2.UtilsOs.isDockerAvailable();
        if (!isEnableDocker) {
            lib_4.Helpers.error(`

        Docker is not enabled, please enable docker to use cloud features

        `, true, true);
            await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
            return false;
        }
        lib_4.Helpers.taskDone(`Docker is enabled!`);
        return true;
        //#endregion
    }
    //#endregion
    //#region protected methods / delete traefik network
    async deleteTraefikNetwork() {
        //#region @backendFunc
        try {
            lib_2.child_process.execSync(`docker network rm ${this.reverseProxyNetworkName}`, { stdio: 'inherit' });
            console.log(`🗑️  Network deleted: ${this.reverseProxyNetworkName}`);
        }
        catch (error) {
            console.log(`ℹ️ Network '${this.reverseProxyNetworkName}' probably does not exist, skipping.`);
        }
        //#endregion
    }
    //#endregion
    //#region protected methods / make sure traefik network created
    async makeSureTraefikNetworkCreated() {
        //#region @backendFunc
        try {
            lib_2.child_process.execSync(`docker network create ${this.reverseProxyNetworkName}`, {
                stdio: 'ignore',
            });
            console.log(`✅ Network created: ${this.reverseProxyNetworkName}`);
        }
        catch (error) {
            console.log(`ℹ️ Network '${this.reverseProxyNetworkName}' probably already exists, skipping.`);
        }
        //#endregion
    }
    //#endregion
    //#region protected methods / select mode explain
    async selectModeExplain() {
        //#region @backendFunc
        lib_2.UtilsTerminal.clearConsole();
        lib_4.Helpers.info(`Taon Cloud Modes Explanation:
=> ${lib_2.chalk.bold.yellow('DEV MODE (ENABLED_NOT_SECURE)')}:
  In this mode, Taon Cloud is enabled without SSL/TLS encryption.
  This mode is suitable for development and testing purposes.
=> ${lib_2.chalk.bold.green('PRODUCTION MODE (ENABLED_SECURED)')}:
  In this mode, Taon Cloud is enabled with SSL/TLS encryption.
  This mode is intended for production environments where security is crucial.
    `);
        await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
        //#endregion
    }
    //#endregion
    //#region protected methods / select mode
    async selectMode(options) {
        //#region @backendFunc
        options = options || {};
        // options.skipDisabled = options.skipDisabled || false;
        while (true) {
            try {
                let status;
                const isOsWithoutGui = !lib_2.UtilsOs.isRunningInOsWithGraphicsCapableEnvironment();
                const optSecure = {
                    [taon_models_1.TaonCloudStatus.STARTING_SECURE_MODE]: 'Enable Taon Cloud (PRODUCTION MODE)',
                };
                const optNotSecure = {
                    [taon_models_1.TaonCloudStatus.STARTING_NOT_SECURE_MODE]: 'Enable Taon Cloud (DEV MODE)',
                };
                const optExplain = {
                    explain: {
                        name: '< Explain Taon Cloud modes >',
                    },
                };
                const choices = isOsWithoutGui
                    ? {
                        ...optSecure,
                        ...optNotSecure,
                        ...optExplain,
                    }
                    : {
                        ...optExplain,
                        ...optNotSecure,
                        ...optSecure,
                    };
                const answer = await lib_2.UtilsTerminal.select({
                    choices: choices,
                    question: `Select Taon Cloud mode:`,
                });
                if (answer === 'explain') {
                    await this.selectModeExplain();
                    continue;
                }
                status = answer;
                return status;
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
    //#region protected methods / get worker terminal actions
    async checkIfTraefikIsRunning(options) {
        //#region @backendFunc
        let tries = 0;
        options = options || {};
        if (options.waitUntilHealthy) {
            options.maxTries = options.maxTries || 50;
        }
        const execAsync = (0, util_1.promisify)(lib_2.child_process.exec);
        constants_1.globalSpinner.instance.start(`Traefik health: checking...`);
        while (true) {
            tries++;
            if (options.maxTries && tries > options.maxTries) {
                constants_1.globalSpinner.instance.fail(`Traefik is not running or not healthy after ${tries} tries`);
                return false;
            }
            try {
                const { stdout } = await execAsync(process.platform === 'win32'
                    ? `docker inspect --format="{{json .State.Health.Status}}" traefik`
                    : `docker inspect --format='{{json .State.Health.Status}}' traefik`);
                const status = stdout.trim().replace(/"/g, '');
                constants_1.globalSpinner.instance.text = `Traefik health: ${status}`;
                if (status === 'healthy') {
                    constants_1.globalSpinner.instance.succeed(`Traefik is ready`);
                    await lib_2.UtilsTerminal.wait(1);
                    return true;
                }
                if (status === 'unhealthy') {
                    if (options.waitUntilHealthy) {
                        constants_1.globalSpinner.instance.text = 'Traefik state is not healthy yet, waiting...';
                    }
                    else {
                        constants_1.globalSpinner.instance.fail(`Traefik state is not running or not healthy`);
                        return false;
                    }
                }
            }
            catch (error) {
                if (options.waitUntilHealthy) {
                    constants_1.globalSpinner.instance.text = 'Traefik is not healthy yet, waiting...';
                }
                else {
                    constants_1.globalSpinner.instance.fail('Traefik is not running or not healthy');
                    return false;
                }
            }
            await lib_2.UtilsTerminal.wait(1);
        }
        //#endregion
    }
    //#endregion
    //#region protected methods / select cloud ips
    async selectCloudIps() {
        //#region @backendFunc
        //#region select ip type
        const localIps = await lib_3.UtilsNetwork.getLocalIpAddresses();
        const optPublic = {
            usePublic: {
                name: 'Use Public IP Address (recommended on server)',
            },
        };
        const optLocal = {
            useLocal: {
                name: 'Use Local IP Address',
            },
        };
        const isOsWithoutGui = !lib_2.UtilsOs.isRunningInOsWithGraphicsCapableEnvironment();
        const choicesIpType = isOsWithoutGui
            ? {
                ...optPublic,
                ...optLocal,
            }
            : {
                ...optLocal,
                ...optPublic,
            };
        const useIp = await lib_2.UtilsTerminal.select({
            choices: choicesIpType,
        });
        //#endregion
        if (useIp === 'usePublic') {
            //#region use public ip
            while (true) {
                try {
                    lib_4.Helpers.info(`Detecting public IP address...`);
                    let publicIp = await lib_3.UtilsNetwork.getCurrentPublicIpAddress();
                    const choicesPublicIp = {
                        confirm: {
                            name: `Use detected public IP: ${lib_2.chalk.bold(publicIp)}`,
                        },
                        manual: {
                            name: 'Enter public IP manually',
                        },
                        abort: {
                            name: '< abort and go back >',
                        },
                    };
                    const selectedChoice = await lib_2.UtilsTerminal.select({
                        choices: choicesPublicIp,
                        question: `Select option for public IP address:`,
                    });
                    if (selectedChoice === 'abort') {
                        return false;
                    }
                    if (selectedChoice === 'manual') {
                        publicIp = await lib_2.UtilsTerminal.input({
                            question: `Enter public IP address to be used by Taon Cloud:`,
                            required: true,
                            validate: ip => {
                                return lib_3.UtilsNetwork.isValidIp(ip);
                            },
                        });
                    }
                    this.cloudIps.length = 0;
                    this.cloudIps.push(publicIp);
                    if (!(await this.areCloudIpsValid())) {
                        continue;
                    }
                    return true;
                }
                catch (error) {
                    if (!(await lib_2.UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
                        return false;
                    }
                    else {
                        continue;
                    }
                }
            }
            //#endregion
        }
        else {
            //#region use local ip
            let i = 0;
            while (true) {
                i++;
                try {
                    if (i > 1) {
                        const shouldContinue = await lib_2.UtilsTerminal.confirm({
                            message: `Selecting again IP addresses. Do you want to continue?`,
                            defaultValue: true,
                        });
                        if (!shouldContinue) {
                            return false;
                        }
                    }
                    const choices = [
                        ...localIps
                            .filter(f => f.family === 'IPv4')
                            .map(ip => ({
                            name: `Local IP: ${ip.address} (${ip.type})`,
                            value: ip.address,
                        })),
                    ];
                    const selected = await lib_2.UtilsTerminal.select({
                        choices: choices,
                        question: `Select IP addresses to be used by Taon Cloud:`,
                    });
                    this.cloudIps.length = 0;
                    this.cloudIps.push(selected);
                    if (!(await this.areCloudIpsValid())) {
                        continue;
                    }
                    return true;
                }
                catch (error) {
                    if (!(await lib_2.UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
                        break;
                    }
                    continue;
                }
            }
            //#endregion
        }
        //#endregion
    }
    //#endregion
    //#endregion
    //#region public methods
    //#region protected methods / validate ips
    async areCloudIpsValid() {
        //#region @backendFunc
        for (const localIp of this.cloudIps) {
            lib_4.Helpers.info(`Validating IP address (ping): ${localIp}...`);
            if (!(await lib_3.UtilsNetwork.checkIfServerPings(localIp))) {
                lib_4.Helpers.error(`Server with IP ${localIp} is not reachable! Please select only reachable IPs.`, true, true);
                return false;
            }
        }
        return true;
        //#endregion
    }
    //#endregion
    //#region public methods / initial cloud status check
    async initialCloudStatusCheck() {
        //#region @backendFunc
        const isDockerRunning = await lib_2.UtilsOs.isDockerAvailable();
        if (isDockerRunning) {
            lib_4.Helpers.logInfo(`Docker is running.. checking if Traefik is enabled...`);
        }
        else {
            return;
        }
        const ipFromYml = this.service.getIpFromYml();
        if (!ipFromYml) {
            console.warn(`Can find ip from traefik dynamic config yml, assuming Traefik is not configured.`);
            lib_4.Helpers.info(`Shutting down Traefik if running...`);
            await this.stopTraefik();
            return;
        }
        this.cloudIps.push(ipFromYml);
        const isTraefikRunning = await this.checkIfTraefikIsRunning();
        if (isTraefikRunning) {
            lib_4.Helpers.info(`Traefik is running with IP: ${ipFromYml}`);
            lib_4.Helpers.info(`Restarting Traefik to refresh new settings...`);
            await this.restartTraefik();
            this.setEnabledMode();
        }
        else {
            console.warn(`Traefik is not running even if configured with IP: ${ipFromYml}`);
            lib_4.Helpers.info(`Shutting down Traefik if running...`);
            await this.stopTraefik();
            return;
        }
        //#endregion
    }
    //#endregion
    //#region public methods / restart traefik
    async restartTraefik(options) {
        //#region @backendFunc
        options = options || {};
        if (options.hardRestart) {
            await this.stopTraefik();
            await this.startTraefik();
            return;
        }
        console.log(`🚀 Restarting Traefik ${this.isDevMode ? 'DEV' : 'PROD'}...`);
        const execAsync = (0, util_1.promisify)(lib_2.child_process.exec);
        try {
            await execAsync(`docker compose -f ` +
                ` traefik-compose${this.isDevMode ? '.local-dev' : ''}.yml down`, {
                cwd: this.pathToTraefikComposeDestCwd,
            });
            await execAsync(`docker compose -f ` +
                ` traefik-compose${this.isDevMode ? '.local-dev' : ''}.yml up -d traefik`, {
                cwd: this.pathToTraefikComposeDestCwd,
            });
        }
        catch (error) {
            lib_1.config.frameworkName === 'tnp' && console.error(error);
            lib_4.Helpers.warn('Error restarting Traefik:');
        }
        //#endregion
    }
    //#endregion
    //#region public methods / start traefik
    async startTraefik() {
        //#region @backendFunc
        if (!(await this.checkIfDockerEnabled())) {
            return false;
        }
        this.taonCloudStatus = await this.selectMode({
            skipDisabled: true,
        });
        if (!(await this.selectCloudIps())) {
            console.error('No IPs selected, cannot start Traefik');
            this.taonCloudStatus = taon_models_1.TaonCloudStatus.NOT_STARED;
            return false;
        }
        await this.makeSureTraefikNetworkCreated();
        console.log(`🚀 Starting Traefik ${this.isDevMode ? 'DEV' : 'PROD'}...`);
        const execAsync = (0, util_1.promisify)(lib_2.child_process.exec);
        lib_4.Helpers.removeFolderIfExists(this.pathToTraefikComposeDestCwd);
        lib_4.HelpersTaon.copy(this.pathToTraefikComposeSourceTemplateFilesCwd, this.pathToTraefikComposeDestCwd, {
            recursive: true,
        });
        this.service.initServiceReadme();
        // remove not used file
        lib_4.Helpers.removeFileIfExists([
            this.pathToTraefikComposeDestCwd,
            `traefik-compose${!this.isDevMode ? '.local-dev' : ''}.yml`,
        ]);
        await execAsync(`docker compose -f ` +
            ` traefik-compose${this.isDevMode ? '.local-dev' : ''}.yml up -d traefik`, {
            cwd: this.pathToTraefikComposeDestCwd,
        });
        // Wait until container health becomes healthy
        const isTraefikRunning = await this.checkIfTraefikIsRunning({
            waitUntilHealthy: true,
        });
        if (isTraefikRunning) {
            this.setEnabledMode();
            for (const cloudIp of this.cloudIps) {
                const workers = lib_4.BaseCliWorker.getAllWorkersStartedInSystemFromCurrentCli();
                await this.service.registerWorkers(cloudIp, workers);
            }
            await this.restartTraefik();
        }
        else {
            this.taonCloudStatus = taon_models_1.TaonCloudStatus.NOT_STARED;
        }
        return isTraefikRunning;
        //#endregion
    }
    //#endregion
    //#region public methods / stop traefik
    async stopTraefik() {
        //#region @backendFunc
        this.taonCloudStatus = taon_models_1.TaonCloudStatus.KILLING;
        console.log('Stopping Traefik...');
        await this.deleteTraefikNetwork();
        const execAsync = (0, util_1.promisify)(lib_2.child_process.exec);
        const localDevFileBasename = `traefik-compose.local-dev.yml`;
        const prodFileBasename = `traefik-compose.yml`;
        // Start traefik in detached mode
        const devFileExists = lib_4.Helpers.exists([
            this.pathToTraefikComposeDestCwd,
            localDevFileBasename,
        ]);
        const prodFileExists = lib_4.Helpers.exists([
            this.pathToTraefikComposeDestCwd,
            prodFileBasename,
        ]);
        let composeDownBothFiles = devFileExists && prodFileExists;
        if (!lib_4.Helpers.exists(this.pathToTraefikComposeDestCwd)) {
            lib_4.HelpersTaon.copy(this.pathToTraefikComposeSourceTemplateFilesCwd, this.pathToTraefikComposeDestCwd, {
                recursive: true,
            });
            composeDownBothFiles = true;
        }
        const composeDownFile = async (filename) => {
            return await execAsync(`docker compose -f ${filename} down`, {
                cwd: this.pathToTraefikComposeDestCwd,
            });
        };
        if (composeDownBothFiles) {
            lib_4.Helpers.logInfo('Composing down both dev and production mode traefik...');
            try {
                await composeDownFile(localDevFileBasename);
            }
            catch (error) {
                console.log('Error stopping Traefik dev mode');
            }
            try {
                await composeDownFile(prodFileBasename);
            }
            catch (error) {
                console.log('Error stopping Traefik production mode');
            }
        }
        else {
            while (true) {
                try {
                    if (lib_4.Helpers.exists([
                        this.pathToTraefikComposeDestCwd,
                        localDevFileBasename,
                    ])) {
                        lib_4.Helpers.logInfo('Composing down dev mode traefik...');
                        await composeDownFile(localDevFileBasename);
                    }
                    if (lib_4.Helpers.exists([this.pathToTraefikComposeDestCwd, prodFileBasename])) {
                        lib_4.Helpers.logInfo('Composing down production mode traefik...');
                        await composeDownFile(prodFileBasename);
                    }
                    break;
                }
                catch (error) {
                    lib_4.Helpers.error('Error stopping Traefik', true, true);
                    const tryAgain = await lib_2.UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error);
                    if (!tryAgain) {
                        break;
                    }
                }
            }
        }
        await lib_4.UtilsDocker.cleanImagesAndContainersByDockerLabel('org.opencontainers.image.title', 'Traefik');
        lib_4.Helpers.removeFolderIfExists(this.pathToTraefikComposeDestCwd);
        this.taonCloudStatus = taon_models_1.TaonCloudStatus.NOT_STARED;
        lib_4.BaseCliWorker.isCloudEnable.next(false);
        // docker compose rm -f traefik
        // docker compose down --remove-orphans
        //#endregion
    }
}
exports.TraefikProvider = TraefikProvider;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/traefik/traefik.provider.js.map