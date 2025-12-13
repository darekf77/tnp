import { config, fileName, folderName } from 'tnp-core/src';
import { chalk, _, crossPlatformPath, glob, path, UtilsOs } from 'tnp-core/src';
import { UtilsTerminal } from 'tnp-core/src';
import { BaseCommandLineFeature, Helpers } from 'tnp-helpers/src';

import {
  binMainProject,
  cliTsFromSrc,
  distMainProject,
  libFromImport,
  libFromNpmPackages,
  localReleaseMainProject,
  nodeModulesMainProject,
  srcMainProject,
  debugSuffix,
  debugBrkSuffix,
  suffixLatest,
  inspectSuffix,
  inspectBrkSuffix,
} from '../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../options';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';

/**
 * TODO refactor move to tnp-helpers
 */ // @ts-ignore TODO weird inheritance problem
export class $Link extends BaseCli {
  async _() {
    let project = this.project;

    if (!project.framework.isStandaloneProject) {
      Helpers.error(`Command not supported in this project`, false, true);
    }
    const localClis = this._getDetectedLocalCLi();
    if (localClis.length === 0) {
      await this.global();
    } else {
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
      const res = await UtilsTerminal.select<keyof typeof options>({
        question: 'What would you like to link?',
        choices: options,
        autocomplete: false,
      });

      if (res === 'global') {
        await this.global();
      } else {
        await this.local(res);
      }
    }

    Helpers.info(`Linking DONE!`);
    this._exit();
  }

  _getDetectedLocalCLi() {
    const destBaseLatest = this.project.pathFor(
      `${nodeModulesMainProject}/${ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL}`,
    );
    return Helpers.foldersFrom(destBaseLatest).filter(f => {
      const proj = this.ins.From(f);
      return !!proj;
    });
  }

  async local(pathToFolder: string) {
    const localReleaseFolder =
      pathToFolder ||
      this.firstArg ||
      `${localReleaseMainProject}/${
        ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL
      }/${this.project.nameForCli}${suffixLatest}`;

    Helpers.info(`Linking

      ${localReleaseFolder}

    as global cli tool... `);
    Helpers.run(`npm link`, { cwd: localReleaseFolder }).sync();
    Helpers.info(
      `Global link created for ` +
        `local/repo version of ${chalk.bold(this.project.nameForCli)}`,
    );
    this._exit();
  }

  //#region global link
  async global() {
    let project = this.project;
    // if (process.platform !== 'win32') {
    //   await Helpers.isElevated();
    // }
    //#region linking to global/local bin
    let globalBinFolderPath = path.dirname(
      (
        _.first(
          Helpers.run(
            `${UtilsOs.isRunningInWindowsPowerShell() ? 'where.exe' : 'which'} ${config.frameworkName}`,
            { output: false },
          )
            .sync()
            .toString()
            .split('\n'),
        ) || ''
      ).trim(),
    );

    // console.log(`globalBinFolderPath "${globalBinFolderPath}"`, );
    // process.exit(0)
    if (process.platform === 'win32') {
      globalBinFolderPath = crossPlatformPath(globalBinFolderPath);
      if (/^\/[a-z]\//.test(globalBinFolderPath)) {
        globalBinFolderPath = globalBinFolderPath.replace(
          /^\/[a-z]\//,
          `${globalBinFolderPath.charAt(1).toUpperCase()}:/`,
        );
      }
    }

    const globalNodeModules = crossPlatformPath(
      path.join(
        globalBinFolderPath,
        process.platform === 'win32'
          ? folderName.node_modules
          : `../${libFromNpmPackages}/${folderName.node_modules}`,
      ),
    );

    const packageInGlobalNodeModules = crossPlatformPath(
      path.resolve(path.join(globalNodeModules, project.name)),
    );

    // packageInGlobalNodeModules
    Helpers.removeIfExists(packageInGlobalNodeModules);
    project.linkTo(packageInGlobalNodeModules);

    if (!Helpers.exists(project.pathFor(binMainProject))) {
      Helpers.mkdirp(project.pathFor(binMainProject));
    }

    const pattern = `${project.pathFor(binMainProject)}/*`;
    const countLinkInPackageJsonBin = glob
      .sync(pattern)
      .map(f => crossPlatformPath(f))
      .filter(f => {
        return (Helpers.readFile(f) || '').startsWith('#!/usr/bin/env');
      });

    if (countLinkInPackageJsonBin.length === 0) {
      const pathNormalLink = Helpers.path.create(
        project.pathFor([binMainProject, project.name]),
      );
      Helpers.writeFile(pathNormalLink, this._templateBin());
      countLinkInPackageJsonBin.push(pathNormalLink);

      const pathDebugLink = Helpers.path.create(
        project.pathFor([
          binMainProject,
          `${project.name}${debugSuffix.replace('--', '-')}`,
        ]),
      );
      Helpers.writeFile(pathDebugLink, this._templateBin(true));
      countLinkInPackageJsonBin.push(pathDebugLink);

      const cliTsFile = Helpers.path.create(
        project.pathFor([srcMainProject, fileName.cli_ts]),
      );
      if (!Helpers.exists(cliTsFile)) {
        this.project.framework.recreateFileFromCoreProject({
          fileRelativePath: crossPlatformPath([srcMainProject, cliTsFromSrc]),
        });
      }
    }

    const bin = {};
    countLinkInPackageJsonBin.forEach(p => {
      bin[path.basename(p)] = `${binMainProject}/${path.basename(p)}`;
    });
    project.packageJson.bin = bin;

    if (_.isObject(project.packageJson.bin)) {
      Object.keys(project.packageJson.bin).forEach(globalName => {
        const localPath = path.join(
          project.location,
          project.packageJson.bin[globalName],
        );
        const destinationGlobalLink = path.join(
          globalBinFolderPath,
          globalName,
        );
        Helpers.removeIfExists(destinationGlobalLink);

        const inspect =
          globalName.endsWith(debugSuffix.replace('--', '')) ||
          globalName.endsWith(inspectSuffix.replace('--', ''));

        const selectedInspect: boolean =
          globalName.endsWith(debugBrkSuffix.replace('--', '')) ||
          globalName.endsWith(inspectBrkSuffix.replace('--', ''));

        const attachDebugParam: '--inspect' | '--inspect-brk' | '' = inspect
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
            project,
          });
        } else {
          Helpers.createSymLink(localPath, destinationGlobalLink);
          const command = `chmod +x ${destinationGlobalLink}`;
          Helpers.log(`Trying to make file executable global command "${chalk.bold(
            globalName,
          )}".

            command: ${command}
            `);
          Helpers.run(command).sync();
        }

        Helpers.info(`Global link created for: ${chalk.bold(globalName)}`);
      });
    }

    this._exit();
    //#endregion
  }
  //#endregion

  //#region write win 32 link files
  _writeWin32LinkFiles(options: {
    destinationGlobalLink: string;
    attachDebugParam: '--inspect' | '--inspect-brk' | '';
    project: Project;
    globalName: string;
    globalBinFolderPath: string;
  }) {
    const {
      attachDebugParam,
      destinationGlobalLink,
      globalName,
      project,
      globalBinFolderPath,
    } = options;
    try {
      Helpers.writeFile(
        destinationGlobalLink,
        `
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
*CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;
esac

if [ -x "$basedir/node" ]; then
"$basedir/node" ${attachDebugParam} "$basedir/node_modules/${
          project.nameForNpmPackage
        }/bin/${globalName}" "$@"
ret=$?
else
node ${attachDebugParam} "$basedir/node_modules/${
          project.nameForNpmPackage
        }/bin/${globalName}" "$@"
ret=$?
fi
exit $ret
      `.trim() + '\n',
      );

      const destinationGlobalLinkPS1File = path.join(
        globalBinFolderPath,
        `${globalName}.ps1`,
      );
      Helpers.writeFile(
        destinationGlobalLinkPS1File,
        attachDebugParam
          ? `#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$basedir = Split-Path $MyInvocation.MyCommand.Definition -Parent
$exe = if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) { ".exe" } else { "" }

$nodePath = if (Test-Path "$basedir/node$exe") { "$basedir/node$exe" } else { "node$exe" }
$scriptToRun = "$basedir/node_modules/${
              project.nameForNpmPackage
            }/${binMainProject}/${globalName}"

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
& "$basedir/node$exe"  "$basedir/node_modules/${
              project.nameForNpmPackage
            }/${binMainProject}/${globalName}" $args
$ret=$LASTEXITCODE
} else {
& "node$exe"  "$basedir/node_modules/${
              project.nameForNpmPackage
            }/${binMainProject}/${globalName}" $args
$ret=$LASTEXITCODE
}
exit $ret
      `.trim() + '\n',
      );
      const destinationGlobalLinkCmdFile = path.join(
        globalBinFolderPath,
        `${globalName}.cmd`,
      );
      Helpers.writeFile(
        destinationGlobalLinkCmdFile,
        `
@ECHO off
SETLOCAL
CALL :find_dp0

IF EXIST "%dp0%\\node.exe" (
SET "_prog=%dp0%\\node.exe"
) ELSE (
SET "_prog=node"
SET PATHEXT=%PATHEXT:;.JS;=;%
)

"%_prog%"  "%dp0%\\node_modules\\${
          project.nameForNpmPackage
        }\\bin\\${globalName}" %*
ENDLOCAL
EXIT /b %errorlevel%
:find_dp0
SET dp0=%~dp0
EXIT /b

      `.trim() + '\n',
      );
    } catch (error) {
      Helpers.error(
        `Check if you cli is not active in another terminal and try again`,
        false,
        true,
      );
    }
  }
  //#endregion

  //#region template bin
  _templateBin(debug = false) {
    return `#!/usr/bin/env node ${debug ? '--inspect' : ''}
  var { fse, crossPlatformPath, path } = require('tnp-core/src');
  var path = {
    dist: path.join(crossPlatformPath(__dirname), '../${distMainProject}/index.js'),
    npm: path.join(crossPlatformPath(__dirname), '../index.js')
  }
  var p = fse.existsSync(path.dist) ? path.dist : path.npm;
  global.globalSystemToolMode = true;
  var run = require(p).run;
  run(process.argv.slice(2));
    `;
  }
  //#endregion
}

export default {
  $Link: Helpers.CLIWRAP($Link, '$Link'),
};
