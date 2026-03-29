import { config, folderName, taonPackageName } from 'tnp-core/lib-prod';
import { chalk, crossPlatformPath, glob, path, ___NS__first, ___NS__isObject, UtilsOs__NS__isRunningInWindowsPowerShell } from 'tnp-core/lib-prod';
import { UtilsTerminal__NS__select } from 'tnp-core/lib-prod';
import { Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__exists, Helpers__NS__foldersFrom, Helpers__NS__info, Helpers__NS__log, Helpers__NS__mkdirp, Helpers__NS__readFile, Helpers__NS__removeFileIfExists, Helpers__NS__removeIfExists, Helpers__NS__run, Helpers__NS__writeFile, HelpersTaon__NS__CLIWRAP } from 'tnp-helpers/lib-prod';
import { binMainProject, cliTsFromSrc, libFromNpmPackage, localReleaseMainProject, nodeModulesMainProject, srcMainProject, debugSuffix, debugBrkSuffix, suffixLatest, inspectSuffix, inspectBrkSuffix, startJsFromBin, libFromSrc, startTsFromLib, indexTsFromSrc, } from '../../constants';
import { ReleaseArtifactTaon } from '../../options';
import { BaseCli } from './base-cli';
/**
 * TODO refactor move to tnp-helpers
 */ // @ts-ignore TODO weird inheritance problem
export class $Link extends BaseCli {
    async _() {
        let project = this.project;
        if (!project.framework.isStandaloneProject) {
            Helpers__NS__error(`Command not supported in this project`, false, true);
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
            const res = await UtilsTerminal__NS__select({
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
        Helpers__NS__info(`Linking DONE!`);
        this._exit();
    }
    _getDetectedLocalCLi() {
        const destBaseLatest = this.project.pathFor(`${nodeModulesMainProject}/${ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL}`);
        return Helpers__NS__foldersFrom(destBaseLatest).filter(f => {
            const proj = this.ins.From(f);
            return !!proj;
        });
    }
    async local(pathToFolder) {
        const localReleaseFolder = pathToFolder ||
            this.firstArg ||
            `${localReleaseMainProject}/${ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL}/${this.project.nameForCli}${suffixLatest}`;
        this.recreateCliBasicStructure();
        Helpers__NS__info(`Linking

      ${localReleaseFolder}

    as global cli tool, please wait...

    `);
        Helpers__NS__run(`npm link`, { cwd: localReleaseFolder, output: true }).sync();
        Helpers__NS__info(`Global link created for ` +
            `local/repo version of ${chalk.bold(this.project.nameForCli)}`);
        this._exit();
    }
    recreateCliBasicStructure(globalBinFolderPath) {
        //#region @backendFunc
        const pattern = `${this.project.pathFor(binMainProject)}/*`;
        const countLinkInPackageJsonBin = glob
            .sync(pattern)
            .map(f => crossPlatformPath(f))
            .filter(f => {
            return (Helpers__NS__readFile(f) || '').startsWith('#!/usr/bin/env');
        });
        Helpers__NS__removeFileIfExists(this.project.pathFor([binMainProject, this.project.name]));
        // if (countLinkInPackageJsonBin.length === 0) {
        const pathNormalLink = this.project.pathFor([
            binMainProject,
            this.project.nameForCli,
        ]);
        Helpers__NS__writeFile(pathNormalLink, `#!/usr/bin/env -S node --no-deprecation
//#${'reg' + 'ion'} @${'back' + 'end'}
// --stack-trace-limit=10000
${'req' + 'uire'}('./start');
//#${'endreg' + 'ion'}
`);
        countLinkInPackageJsonBin.push(pathNormalLink);
        Helpers__NS__removeFileIfExists(this.project.pathFor([
            binMainProject,
            `${this.project.name}${debugSuffix.replace('--', '-')}`,
        ]));
        const pathDebugLink = this.project.pathFor([
            binMainProject,
            `${this.project.nameForCli}${debugSuffix.replace('--', '-')}`,
        ]);
        Helpers__NS__writeFile(pathDebugLink, `#!/usr/bin/env -S node --inspect --stack-trace-limit=10000 --no-deprecation
//#${'reg' + 'ion'} @${'back' + 'end'}
// --stack-trace-limit=10000
${'req' + 'uire'}('./start');
//#${'endreg' + 'ion'}
`);
        countLinkInPackageJsonBin.push(pathDebugLink);
        Helpers__NS__removeFileIfExists(this.project.pathFor([
            binMainProject,
            `${this.project.name}${debugBrkSuffix.replace('--', '-')}`,
        ]));
        const pathBrkDebugLink = this.project.pathFor([
            binMainProject,
            `${this.project.nameForCli}${debugBrkSuffix.replace('--', '-')}`,
        ]);
        Helpers__NS__writeFile(pathBrkDebugLink, `#!/usr/bin/env -S node --inspect-brk --stack-trace-limit=10000 --no-deprecation
//#${'reg' + 'ion'} @${'back' + 'end'}
${'req' + 'uire'}('./start');
//#${'endreg' + 'ion'}
`);
        countLinkInPackageJsonBin.push(pathBrkDebugLink);
        if (this.project.nameForCli !== taonPackageName) {
            // QUICK_FIX For custom taon cli
            this.project.framework.recreateFileFromCoreProject({
                forceRecrete: true,
                fileRelativePath: crossPlatformPath([srcMainProject, cliTsFromSrc]),
            });
        }
        this.project.framework.recreateFileFromCoreProject({
            forceRecrete: true,
            fileRelativePath: crossPlatformPath([srcMainProject, indexTsFromSrc]),
        });
        this.project.framework.recreateFileFromCoreProject({
            forceRecrete: true,
            fileRelativePath: crossPlatformPath([binMainProject, startJsFromBin]),
        });
        if (!this.project.hasFile([srcMainProject, libFromSrc, startTsFromLib])) {
            this.project.framework.recreateFileFromCoreProject({
                fileRelativePath: crossPlatformPath([
                    srcMainProject,
                    libFromSrc,
                    startTsFromLib,
                ]),
            });
        }
        // }
        const bin = {};
        countLinkInPackageJsonBin.forEach(p => {
            bin[path.basename(p)] = `${binMainProject}/${path.basename(p)}`;
        });
        this.project.packageJson.bin = bin;
        if (globalBinFolderPath && ___NS__isObject(this.project.packageJson.bin)) {
            Object.keys(this.project.packageJson.bin).forEach(globalName => {
                const localPath = path.join(this.project.location, this.project.packageJson.bin[globalName]);
                const destinationGlobalLink = path.join(globalBinFolderPath, globalName);
                Helpers__NS__removeIfExists(destinationGlobalLink);
                const inspect = globalName.endsWith(debugSuffix.replace('--', '')) ||
                    globalName.endsWith(inspectSuffix.replace('--', ''));
                const selectedInspect = globalName.endsWith(debugBrkSuffix.replace('--', '')) ||
                    globalName.endsWith(inspectBrkSuffix.replace('--', ''));
                const attachDebugParam = inspect
                    ? inspectSuffix
                    : selectedInspect
                        ? inspectBrkSuffix
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
                    Helpers__NS__createSymLink(localPath, destinationGlobalLink);
                    const command = `chmod +x ${destinationGlobalLink}`;
                    Helpers__NS__log(`Trying to make file executable global command "${chalk.bold(globalName)}".

            command: ${command}
            `);
                    Helpers__NS__run(command).sync();
                }
                Helpers__NS__info(`Global link created for: ${chalk.bold(globalName)}`);
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
        let globalBinFolderPath = path.dirname((___NS__first(Helpers__NS__run(`${UtilsOs__NS__isRunningInWindowsPowerShell() ? 'where.exe' : 'which'} ${config.frameworkName}`, { output: false })
            .sync()
            .toString()
            .split('\n')) || '').trim());
        // console.log(`globalBinFolderPath "${globalBinFolderPath}"`, );
        // process.exit(0)
        if (process.platform === 'win32') {
            globalBinFolderPath = crossPlatformPath(globalBinFolderPath);
            if (/^\/[a-z]\//.test(globalBinFolderPath)) {
                globalBinFolderPath = globalBinFolderPath.replace(/^\/[a-z]\//, `${globalBinFolderPath.charAt(1).toUpperCase()}:/`);
            }
        }
        const globalNodeModules = crossPlatformPath(path.join(globalBinFolderPath, process.platform === 'win32'
            ? folderName.node_modules
            : `../${libFromNpmPackage}/${folderName.node_modules}`));
        const packageInGlobalNodeModules = crossPlatformPath(path.resolve(path.join(globalNodeModules, project.nameForNpmPackage)));
        // packageInGlobalNodeModules
        Helpers__NS__removeIfExists(packageInGlobalNodeModules);
        project.linkTo(packageInGlobalNodeModules);
        if (!Helpers__NS__exists(project.pathFor(binMainProject))) {
            Helpers__NS__mkdirp(project.pathFor(binMainProject));
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
            Helpers__NS__writeFile(destinationGlobalLink, `
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
            const destinationGlobalLinkPS1File = path.join(globalBinFolderPath, `${globalName}.ps1`);
            Helpers__NS__writeFile(destinationGlobalLinkPS1File, attachDebugParam
                ? `#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$basedir = Split-Path $MyInvocation.MyCommand.Definition -Parent
$exe = if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) { ".exe" } else { "" }

$nodePath = if (Test-Path "$basedir/node$exe") { "$basedir/node$exe" } else { "node$exe" }
$scriptToRun = "$basedir/node_modules/${this.project.nameForNpmPackage}/${binMainProject}/${globalName}"

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
& "$basedir/node$exe"  "$basedir/node_modules/${this.project.nameForNpmPackage}/${binMainProject}/${globalName}" $args
$ret=$LASTEXITCODE
} else {
& "node$exe"  "$basedir/node_modules/${this.project.nameForNpmPackage}/${binMainProject}/${globalName}" $args
$ret=$LASTEXITCODE
}
exit $ret
      `.trim() + '\n');
            const destinationGlobalLinkCmdFile = path.join(globalBinFolderPath, `${globalName}.cmd`);
            Helpers__NS__writeFile(destinationGlobalLinkCmdFile, `
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
            Helpers__NS__error(`Check if you cli is not active in another terminal and try again`, false, true);
        }
    }
}
export default {
    $Link: HelpersTaon__NS__CLIWRAP($Link, '$Link'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-LINK.js.map