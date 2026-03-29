//#region imports
import { promisify } from 'util';
import { config, LibTypeEnum } from 'tnp-core/lib-prod';
import { chalk, child_process, crossPlatformPath, path, ___NS__first, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__input, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__select, UtilsTerminal__NS__wait } from 'tnp-core/lib-prod';
import { UtilsNetwork__NS__checkIfServerPings, UtilsNetwork__NS__getCurrentPublicIpAddress, UtilsNetwork__NS__getLocalIpAddresses, UtilsNetwork__NS__isValidIp } from 'tnp-core/lib-prod';
import { BaseCliWorker, Helpers__NS__error, Helpers__NS__exists, Helpers__NS__info, Helpers__NS__logInfo, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__warn, HelpersTaon__NS__copy, UtilsDocker__NS__cleanImagesAndContainersByDockerLabel } from 'tnp-helpers/lib-prod';
import { globalSpinner, taonBasePathToGlobalDockerTemplates, } from '../../../../constants';
import { TaonCloudStatus } from '../taon.models';
import { TraefikServiceProvider } from './treafik-service.provider';
//#endregion
export class TraefikProvider {
    taonProjectsWorker;
    //#region fields & getters
    service = new TraefikServiceProvider(this);
    cloudIps = [];
    taonCloudStatus = TaonCloudStatus.NOT_STARED;
    reverseProxyNetworkName = 'traefik-net';
    //#region fields & getters / cloud is enabled
    get cloudIsEnabled() {
        //#region @backendFunc
        return (this.taonCloudStatus === TaonCloudStatus.ENABLED_NOT_SECURE ||
            this.taonCloudStatus === TaonCloudStatus.ENABLED_SECURED);
        //#endregion
    }
    //#endregion
    //#region fields & getters / is dev mode
    get isDevMode() {
        //#region @backendFunc
        return (this.taonCloudStatus === TaonCloudStatus.ENABLED_NOT_SECURE ||
            this.taonCloudStatus === TaonCloudStatus.STARTING_NOT_SECURE_MODE ||
            Helpers__NS__exists([
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
        const pathToComposeDest = crossPlatformPath([
            taonBasePathToGlobalDockerTemplates,
            path.basename(this.pathToTraefikComposeSourceTemplateFilesCwd),
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
            .by(LibTypeEnum.ISOMORPHIC_LIB)
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
            this.taonCloudStatus = TaonCloudStatus.ENABLED_NOT_SECURE;
        }
        else {
            this.taonCloudStatus = TaonCloudStatus.ENABLED_SECURED;
        }
        BaseCliWorker.cloudIp.next(___NS__first(this.cloudIps));
        BaseCliWorker.isCloudEnable.next(true);
    }
    //#endregion
    //#region protected methods / check if docker enabled
    async checkIfDockerEnabled() {
        //#region @backendFunc
        Helpers__NS__taskStarted(`Checking if docker is enabled...`);
        const isEnableDocker = await UtilsOs__NS__isDockerAvailable();
        if (!isEnableDocker) {
            Helpers__NS__error(`

        Docker is not enabled, please enable docker to use cloud features

        `, true, true);
            await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
            return false;
        }
        Helpers__NS__taskDone(`Docker is enabled!`);
        return true;
        //#endregion
    }
    //#endregion
    //#region protected methods / delete traefik network
    async deleteTraefikNetwork() {
        //#region @backendFunc
        try {
            child_process.execSync(`docker network rm ${this.reverseProxyNetworkName}`, { stdio: 'inherit' });
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
            child_process.execSync(`docker network create ${this.reverseProxyNetworkName}`, {
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
        UtilsTerminal__NS__clearConsole();
        Helpers__NS__info(`Taon Cloud Modes Explanation:
=> ${chalk.bold.yellow('DEV MODE (ENABLED_NOT_SECURE)')}:
  In this mode, Taon Cloud is enabled without SSL/TLS encryption.
  This mode is suitable for development and testing purposes.
=> ${chalk.bold.green('PRODUCTION MODE (ENABLED_SECURED)')}:
  In this mode, Taon Cloud is enabled with SSL/TLS encryption.
  This mode is intended for production environments where security is crucial.
    `);
        await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
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
                const isOsWithoutGui = !UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment();
                const optSecure = {
                    [TaonCloudStatus.STARTING_SECURE_MODE]: 'Enable Taon Cloud (PRODUCTION MODE)',
                };
                const optNotSecure = {
                    [TaonCloudStatus.STARTING_NOT_SECURE_MODE]: 'Enable Taon Cloud (DEV MODE)',
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
                const answer = await UtilsTerminal__NS__select({
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
                if (!(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))) {
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
        const execAsync = promisify(child_process.exec);
        globalSpinner.instance.start(`Traefik health: checking...`);
        while (true) {
            tries++;
            if (options.maxTries && tries > options.maxTries) {
                globalSpinner.instance.fail(`Traefik is not running or not healthy after ${tries} tries`);
                return false;
            }
            try {
                const { stdout } = await execAsync(process.platform === 'win32'
                    ? `docker inspect --format="{{json .State.Health.Status}}" traefik`
                    : `docker inspect --format='{{json .State.Health.Status}}' traefik`);
                const status = stdout.trim().replace(/"/g, '');
                globalSpinner.instance.text = `Traefik health: ${status}`;
                if (status === 'healthy') {
                    globalSpinner.instance.succeed(`Traefik is ready`);
                    await UtilsTerminal__NS__wait(1);
                    return true;
                }
                if (status === 'unhealthy') {
                    if (options.waitUntilHealthy) {
                        globalSpinner.instance.text = 'Traefik state is not healthy yet, waiting...';
                    }
                    else {
                        globalSpinner.instance.fail(`Traefik state is not running or not healthy`);
                        return false;
                    }
                }
            }
            catch (error) {
                if (options.waitUntilHealthy) {
                    globalSpinner.instance.text = 'Traefik is not healthy yet, waiting...';
                }
                else {
                    globalSpinner.instance.fail('Traefik is not running or not healthy');
                    return false;
                }
            }
            await UtilsTerminal__NS__wait(1);
        }
        //#endregion
    }
    //#endregion
    //#region protected methods / select cloud ips
    async selectCloudIps() {
        //#region @backendFunc
        //#region select ip type
        const localIps = await UtilsNetwork__NS__getLocalIpAddresses();
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
        const isOsWithoutGui = !UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment();
        const choicesIpType = isOsWithoutGui
            ? {
                ...optPublic,
                ...optLocal,
            }
            : {
                ...optLocal,
                ...optPublic,
            };
        const useIp = await UtilsTerminal__NS__select({
            choices: choicesIpType,
        });
        //#endregion
        if (useIp === 'usePublic') {
            //#region use public ip
            while (true) {
                try {
                    Helpers__NS__info(`Detecting public IP address...`);
                    let publicIp = await UtilsNetwork__NS__getCurrentPublicIpAddress();
                    const choicesPublicIp = {
                        confirm: {
                            name: `Use detected public IP: ${chalk.bold(publicIp)}`,
                        },
                        manual: {
                            name: 'Enter public IP manually',
                        },
                        abort: {
                            name: '< abort and go back >',
                        },
                    };
                    const selectedChoice = await UtilsTerminal__NS__select({
                        choices: choicesPublicIp,
                        question: `Select option for public IP address:`,
                    });
                    if (selectedChoice === 'abort') {
                        return false;
                    }
                    if (selectedChoice === 'manual') {
                        publicIp = await UtilsTerminal__NS__input({
                            question: `Enter public IP address to be used by Taon Cloud:`,
                            required: true,
                            validate: ip => {
                                return UtilsNetwork__NS__isValidIp(ip);
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
                    if (!(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))) {
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
                        const shouldContinue = await UtilsTerminal__NS__confirm({
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
                    const selected = await UtilsTerminal__NS__select({
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
                    if (!(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))) {
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
            Helpers__NS__info(`Validating IP address (ping): ${localIp}...`);
            if (!(await UtilsNetwork__NS__checkIfServerPings(localIp))) {
                Helpers__NS__error(`Server with IP ${localIp} is not reachable! Please select only reachable IPs.`, true, true);
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
        const isDockerRunning = await UtilsOs__NS__isDockerAvailable();
        if (isDockerRunning) {
            Helpers__NS__logInfo(`Docker is running.. checking if Traefik is enabled...`);
        }
        else {
            return;
        }
        const ipFromYml = this.service.getIpFromYml();
        if (!ipFromYml) {
            console.warn(`Can find ip from traefik dynamic config yml, assuming Traefik is not configured.`);
            Helpers__NS__info(`Shutting down Traefik if running...`);
            await this.stopTraefik();
            return;
        }
        this.cloudIps.push(ipFromYml);
        const isTraefikRunning = await this.checkIfTraefikIsRunning();
        if (isTraefikRunning) {
            Helpers__NS__info(`Traefik is running with IP: ${ipFromYml}`);
            Helpers__NS__info(`Restarting Traefik to refresh new settings...`);
            await this.restartTraefik();
            this.setEnabledMode();
        }
        else {
            console.warn(`Traefik is not running even if configured with IP: ${ipFromYml}`);
            Helpers__NS__info(`Shutting down Traefik if running...`);
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
        const execAsync = promisify(child_process.exec);
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
            config.frameworkName === 'tnp' && console.error(error);
            Helpers__NS__warn('Error restarting Traefik:');
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
            this.taonCloudStatus = TaonCloudStatus.NOT_STARED;
            return false;
        }
        await this.makeSureTraefikNetworkCreated();
        console.log(`🚀 Starting Traefik ${this.isDevMode ? 'DEV' : 'PROD'}...`);
        const execAsync = promisify(child_process.exec);
        Helpers__NS__removeFolderIfExists(this.pathToTraefikComposeDestCwd);
        HelpersTaon__NS__copy(this.pathToTraefikComposeSourceTemplateFilesCwd, this.pathToTraefikComposeDestCwd, {
            recursive: true,
        });
        this.service.initServiceReadme();
        // remove not used file
        Helpers__NS__removeFileIfExists([
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
                const workers = BaseCliWorker.getAllWorkersStartedInSystemFromCurrentCli();
                await this.service.registerWorkers(cloudIp, workers);
            }
            await this.restartTraefik();
        }
        else {
            this.taonCloudStatus = TaonCloudStatus.NOT_STARED;
        }
        return isTraefikRunning;
        //#endregion
    }
    //#endregion
    //#region public methods / stop traefik
    async stopTraefik() {
        //#region @backendFunc
        this.taonCloudStatus = TaonCloudStatus.KILLING;
        console.log('Stopping Traefik...');
        await this.deleteTraefikNetwork();
        const execAsync = promisify(child_process.exec);
        const localDevFileBasename = `traefik-compose.local-dev.yml`;
        const prodFileBasename = `traefik-compose.yml`;
        // Start traefik in detached mode
        const devFileExists = Helpers__NS__exists([
            this.pathToTraefikComposeDestCwd,
            localDevFileBasename,
        ]);
        const prodFileExists = Helpers__NS__exists([
            this.pathToTraefikComposeDestCwd,
            prodFileBasename,
        ]);
        let composeDownBothFiles = devFileExists && prodFileExists;
        if (!Helpers__NS__exists(this.pathToTraefikComposeDestCwd)) {
            HelpersTaon__NS__copy(this.pathToTraefikComposeSourceTemplateFilesCwd, this.pathToTraefikComposeDestCwd, {
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
            Helpers__NS__logInfo('Composing down both dev and production mode traefik...');
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
                    if (Helpers__NS__exists([
                        this.pathToTraefikComposeDestCwd,
                        localDevFileBasename,
                    ])) {
                        Helpers__NS__logInfo('Composing down dev mode traefik...');
                        await composeDownFile(localDevFileBasename);
                    }
                    if (Helpers__NS__exists([this.pathToTraefikComposeDestCwd, prodFileBasename])) {
                        Helpers__NS__logInfo('Composing down production mode traefik...');
                        await composeDownFile(prodFileBasename);
                    }
                    break;
                }
                catch (error) {
                    Helpers__NS__error('Error stopping Traefik', true, true);
                    const tryAgain = await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error);
                    if (!tryAgain) {
                        break;
                    }
                }
            }
        }
        await UtilsDocker__NS__cleanImagesAndContainersByDockerLabel('org.opencontainers.image.title', 'Traefik');
        Helpers__NS__removeFolderIfExists(this.pathToTraefikComposeDestCwd);
        this.taonCloudStatus = TaonCloudStatus.NOT_STARED;
        BaseCliWorker.isCloudEnable.next(false);
        // docker compose rm -f traefik
        // docker compose down --remove-orphans
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/traefik/traefik.provider.js.map