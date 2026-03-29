"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Link = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
const options_1 = require("../../options");
const base_cli_1 = require("./base-cli");
/**
 * TODO refactor move to tnp-helpers
 */ // @ts-ignore TODO weird inheritance problem
class $Link extends base_cli_1.BaseCli {
    async _() {
        let project = this.project;
        if (!project.framework.isStandaloneProject) {
            lib_4.Helpers.error(`Command not supported in this project`, false, true);
        }
        const localClis = this._getDetectedLocalCLi();
        if (localClis.length === 0) {
            await this.global();
        }
        else {
            const options = {
                global: {
                    name: 'Link current project as global cli tool',
                },
                ...localClis.reduce((a, b) => {
                    return {
                        ...a,
                        [b]: {
                            name: `Link local/repo cli version from ./${this.project.relative(b)}`,
                        },
                    };
                }, {}),
            };
            const res = await lib_3.UtilsTerminal.select({
                question: 'What would you like to link?',
                choices: options,
                autocomplete: false,
            });
            if (res === 'global') {
                await this.global();
            }
            else {
                await this.local(res);
            }
        }
        lib_4.Helpers.info(`Linking DONE!`);
        this._exit();
    }
    /**
     * @returns Absolute paths for detected clis
     */
    _getDetectedLocalCLi() {
        const destBaseLatest = this.project.pathFor(`${constants_1.nodeModulesMainProject}/${options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL}`);
        return lib_4.Helpers.foldersFrom(destBaseLatest).filter(f => {
            const proj = this.ins.From(f);
            return !!proj;
        });
    }
    async local(absPathToFolderWithCli) {
        let localReleaseFolder = absPathToFolderWithCli ||
            this.firstArg ||
            `${constants_1.localReleaseMainProject}/${options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL}/${this.project.name}${constants_1.suffixLatest}`;
        if (!lib_2.path.isAbsolute(localReleaseFolder)) {
            localReleaseFolder = this.project.pathFor(localReleaseFolder);
        }
        this.recreateCliBasicStructure();
        lib_4.Helpers.info(`Linking

      ${localReleaseFolder}

    as global cli tool, please wait...

    `);
        lib_4.Helpers.run(`npm link --force`, {
            cwd: localReleaseFolder,
            output: true,
        }).sync();
        lib_4.Helpers.info(`Global link created for ` +
            `local/repo version of ${lib_2.chalk.bold(this.project.name)}`);
        this._exit();
    }
    recreateCliBasicStructure(globalBinFolderPath) {
        //#region @backendFunc
        const pattern = `${this.project.pathFor(constants_1.binMainProject)}/*`;
        const countLinkInPackageJsonBin = lib_2.glob
            .sync(pattern)
            .map(f => (0, lib_2.crossPlatformPath)(f))
            .filter(f => {
            return (lib_4.Helpers.readFile(f) || '').startsWith('#!/usr/bin/env');
        });
        lib_4.Helpers.removeFileIfExists(this.project.pathFor([constants_1.binMainProject, this.project.name]));
        // if (countLinkInPackageJsonBin.length === 0) {
        const pathNormalLink = this.project.pathFor([
            constants_1.binMainProject,
            this.project.nameForCli,
        ]);
        lib_4.Helpers.writeFile(pathNormalLink, `#!/usr/bin/env -S node --no-deprecation
//#${'reg' + 'ion'} @${'back' + 'end'}
// --stack-trace-limit=10000
${'req' + 'uire'}('./start');
//#${'endreg' + 'ion'}
`);
        countLinkInPackageJsonBin.push(pathNormalLink);
        lib_4.Helpers.removeFileIfExists(this.project.pathFor([
            constants_1.binMainProject,
            `${this.project.name}${constants_1.debugSuffix.replace('--', '-')}`,
        ]));
        const pathDebugLink = this.project.pathFor([
            constants_1.binMainProject,
            `${this.project.nameForCli}${constants_1.debugSuffix.replace('--', '-')}`,
        ]);
        lib_4.Helpers.writeFile(pathDebugLink, `#!/usr/bin/env -S node --inspect --stack-trace-limit=10000 --no-deprecation
//#${'reg' + 'ion'} @${'back' + 'end'}
// --stack-trace-limit=10000
${'req' + 'uire'}('./start');
//#${'endreg' + 'ion'}
`);
        countLinkInPackageJsonBin.push(pathDebugLink);
        lib_4.Helpers.removeFileIfExists(this.project.pathFor([
            constants_1.binMainProject,
            `${this.project.name}${constants_1.debugBrkSuffix.replace('--', '-')}`,
        ]));
        const pathBrkDebugLink = this.project.pathFor([
            constants_1.binMainProject,
            `${this.project.nameForCli}${constants_1.debugBrkSuffix.replace('--', '-')}`,
        ]);
        lib_4.Helpers.writeFile(pathBrkDebugLink, `#!/usr/bin/env -S node --inspect-brk --stack-trace-limit=10000 --no-deprecation
//#${'reg' + 'ion'} @${'back' + 'end'}
${'req' + 'uire'}('./start');
//#${'endreg' + 'ion'}
`);
        countLinkInPackageJsonBin.push(pathBrkDebugLink);
        if (this.project.nameForCli !== lib_1.taonPackageName) {
            // QUICK_FIX For custom taon cli
            this.project.framework.recreateFileFromCoreProject({
                forceRecrete: true,
                fileRelativePath: (0, lib_2.crossPlatformPath)([constants_1.srcMainProject, constants_1.cliTsFromSrc]),
            });
        }
        this.project.framework.recreateFileFromCoreProject({
            forceRecrete: true,
            fileRelativePath: (0, lib_2.crossPlatformPath)([constants_1.srcMainProject, constants_1.indexTsFromSrc]),
        });
        this.project.framework.recreateFileFromCoreProject({
            forceRecrete: true,
            fileRelativePath: (0, lib_2.crossPlatformPath)([constants_1.binMainProject, constants_1.startJsFromBin]),
        });
        if (!this.project.hasFile([constants_1.srcMainProject, constants_1.libFromSrc, constants_1.startTsFromLib])) {
            this.project.framework.recreateFileFromCoreProject({
                fileRelativePath: (0, lib_2.crossPlatformPath)([
                    constants_1.srcMainProject,
                    constants_1.libFromSrc,
                    constants_1.startTsFromLib,
                ]),
            });
        }
        // }
        const bin = {};
        countLinkInPackageJsonBin.forEach(p => {
            bin[lib_2.path.basename(p)] = `${constants_1.binMainProject}/${lib_2.path.basename(p)}`;
        });
        this.project.packageJson.bin = bin;
        if (globalBinFolderPath && lib_2._.isObject(this.project.packageJson.bin)) {
            Object.keys(this.project.packageJson.bin).forEach(globalName => {
                const localPath = lib_2.path.join(this.project.location, this.project.packageJson.bin[globalName]);
                const destinationGlobalLink = lib_2.path.join(globalBinFolderPath, globalName);
                lib_4.Helpers.removeIfExists(destinationGlobalLink);
                const inspect = globalName.endsWith(constants_1.debugSuffix.replace('--', '')) ||
                    globalName.endsWith(constants_1.inspectSuffix.replace('--', ''));
                const selectedInspect = globalName.endsWith(constants_1.debugBrkSuffix.replace('--', '')) ||
                    globalName.endsWith(constants_1.inspectBrkSuffix.replace('--', ''));
                const attachDebugParam = inspect
                    ? constants_1.inspectSuffix
                    : selectedInspect
                        ? constants_1.inspectBrkSuffix
                        : '';
                if (process.platform === 'win32') {
                    this._writeWin32LinkFiles({
                        attachDebugParam,
                        destinationGlobalLink,
                        globalBinFolderPath,
                        globalName,
                    });
                }
                else {
                    lib_4.Helpers.createSymLink(localPath, destinationGlobalLink);
                    const command = `chmod +x ${destinationGlobalLink}`;
                    lib_4.Helpers.log(`Trying to make file executable global command "${lib_2.chalk.bold(globalName)}".

            command: ${command}
            `);
                    lib_4.Helpers.run(command).sync();
                }
                lib_4.Helpers.info(`Global link created for: ${lib_2.chalk.bold(globalName)}`);
            });
        }
        //#endregion
    }
    //#region global link
    async global() {
        let project = this.project;
        // if (process.platform !== 'win32') {
        //   await Helpers.isElevated();
        // }
        //#region linking to global/local bin
        let globalBinFolderPath = lib_2.path.dirname((lib_2._.first(lib_4.Helpers.run(`${lib_2.UtilsOs.isRunningInWindowsPowerShell() ? 'where.exe' : 'which'} ${lib_1.config.frameworkName}`, { output: false })
            .sync()
            .toString()
            .split('\n')) || '').trim());
        // console.log(`globalBinFolderPath "${globalBinFolderPath}"`, );
        // process.exit(0)
        if (process.platform === 'win32') {
            globalBinFolderPath = (0, lib_2.crossPlatformPath)(globalBinFolderPath);
            if (/^\/[a-z]\//.test(globalBinFolderPath)) {
                globalBinFolderPath = globalBinFolderPath.replace(/^\/[a-z]\//, `${globalBinFolderPath.charAt(1).toUpperCase()}:/`);
            }
        }
        const globalNodeModules = (0, lib_2.crossPlatformPath)(lib_2.path.join(globalBinFolderPath, process.platform === 'win32'
            ? lib_1.folderName.node_modules
            : `../${constants_1.libFromNpmPackage}/${lib_1.folderName.node_modules}`));
        const packageInGlobalNodeModules = (0, lib_2.crossPlatformPath)(lib_2.path.resolve(lib_2.path.join(globalNodeModules, project.nameForNpmPackage)));
        // packageInGlobalNodeModules
        lib_4.Helpers.removeIfExists(packageInGlobalNodeModules);
        project.linkTo(packageInGlobalNodeModules);
        if (!lib_4.Helpers.exists(project.pathFor(constants_1.binMainProject))) {
            lib_4.Helpers.mkdirp(project.pathFor(constants_1.binMainProject));
        }
        this.recreateCliBasicStructure(globalBinFolderPath);
        this._exit();
        //#endregion
    }
    //#endregion
    //#region write win 32 link files
    _writeWin32LinkFiles(options) {
        const { attachDebugParam, destinationGlobalLink, globalName, globalBinFolderPath, } = options;
        try {
            lib_4.Helpers.writeFile(destinationGlobalLink, `
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
*CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;
esac

if [ -x "$basedir/node" ]; then
"$basedir/node" ${attachDebugParam} "$basedir/node_modules/${this.project.nameForNpmPackage}/bin/${globalName}" "$@"
ret=$?
else
node ${attachDebugParam} "$basedir/node_modules/${this.project.nameForNpmPackage}/bin/${globalName}" "$@"
ret=$?
fi
exit $ret
      `.trim() + '\n');
            const destinationGlobalLinkPS1File = lib_2.path.join(globalBinFolderPath, `${globalName}.ps1`);
            lib_4.Helpers.writeFile(destinationGlobalLinkPS1File, attachDebugParam
                ? `#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$basedir = Split-Path $MyInvocation.MyCommand.Definition -Parent
$exe = if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) { ".exe" } else { "" }

$nodePath = if (Test-Path "$basedir/node$exe") { "$basedir/node$exe" } else { "node$exe" }
$scriptToRun = "$basedir/node_modules/${this.project.nameForNpmPackage}/${constants_1.binMainProject}/${globalName}"

$ret = & $nodePath ${`"${attachDebugParam}"`} $scriptToRun @args
exit $ret
`.trim() + '\n'
                : `
#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
# Fix case when both the Windows and Linux builds of Node
# are installed in the same directory
$exe=".exe"
}
$ret=0
if (Test-Path "$basedir/node$exe") {
& "$basedir/node$exe"  "$basedir/node_modules/${this.project.nameForNpmPackage}/${constants_1.binMainProject}/${globalName}" $args
$ret=$LASTEXITCODE
} else {
& "node$exe"  "$basedir/node_modules/${this.project.nameForNpmPackage}/${constants_1.binMainProject}/${globalName}" $args
$ret=$LASTEXITCODE
}
exit $ret
      `.trim() + '\n');
            const destinationGlobalLinkCmdFile = lib_2.path.join(globalBinFolderPath, `${globalName}.cmd`);
            lib_4.Helpers.writeFile(destinationGlobalLinkCmdFile, `
@ECHO off
SETLOCAL
CALL :find_dp0

IF EXIST "%dp0%\\node.exe" (
SET "_prog=%dp0%\\node.exe"
) ELSE (
SET "_prog=node"
SET PATHEXT=%PATHEXT:;.JS;=;%
)

"%_prog%"  "%dp0%\\node_modules\\${this.project.nameForNpmPackage}\\bin\\${globalName}" %*
ENDLOCAL
EXIT /b %errorlevel%
:find_dp0
SET dp0=%~dp0
EXIT /b

      `.trim() + '\n');
        }
        catch (error) {
            lib_4.Helpers.error(`Check if you cli is not active in another terminal and try again`, false, true);
        }
    }
}
exports.$Link = $Link;
exports.default = {
    $Link: lib_4.HelpersTaon.CLIWRAP($Link, '$Link'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-LINK.js.map