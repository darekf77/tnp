//#region imports
import {
  config,
  fileName,
  folderName,
  taonPackageName,
  Utils,
} from 'tnp-core/src';
import { chalk, _, crossPlatformPath, glob, path, UtilsOs } from 'tnp-core/src';
import { UtilsTerminal } from 'tnp-core/src';
import { BaseCommandLineFeature, Helpers, HelpersTaon } from 'tnp-helpers/src';

import {
  binMainProject,
  cliTsFromSrc,
  distMainProject,
  libFromImport,
  libFromNpmPackage,
  localReleaseMainProject,
  nodeModulesMainProject,
  srcMainProject,
  debugSuffix,
  debugBrkSuffix,
  suffixLatest,
  inspectSuffix,
  inspectBrkSuffix,
  startJsFromBin,
  libFromSrc,
  startTsFromLib,
  indexTsFromSrc,
} from '../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../options';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';
//#endregion

/**
 * TODO refactor move to tnp-helpers
 */ // @ts-ignore TODO weird inheritance problem
export class $Link extends BaseCli {
  //#region _
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
        release: {
          name: 'Link repo with special release branch as global cli tool',
        },
      };
      const res = await UtilsTerminal.select<keyof typeof options>({
        question: 'What would you like to link?',
        choices: options,
        autocomplete: false,
      });

      if (res === 'global') {
        await this.global();
      } else if (res === 'release') {
        await this.global();
      } else {
        await this.local(res as any);
      }
    }

    Helpers.info(`Linking DONE!`);
    this._exit();
  }
  //#endregion

  //#region api / local
  async local(absPathToFolderWithCli: string) {
    //#region @backend
    let localReleaseFolder =
      absPathToFolderWithCli ||
      this.firstArg ||
      `${localReleaseMainProject}/${
        ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL
      }/${this.project.name}${suffixLatest}`;

    if (!path.isAbsolute(localReleaseFolder)) {
      localReleaseFolder = this.project.pathFor(localReleaseFolder);
    }

    this.createGlobalSystemLinks();

    Helpers.info(`Linking

      ${localReleaseFolder}

    as global cli tool, please wait...

    `);
    Helpers.run(`npm link --force`, {
      cwd: localReleaseFolder,
      output: true,
    }).sync();
    Helpers.info(
      `Global link created for ` +
        `local/repo version of ${chalk.bold(this.project.name)}`,
    );

    this._exit();
    //#endregion
  }
  //#endregion

  //#region api / global
  async global() {
    //#region @backendFunc
    let project = this.project;
    // if (process.platform !== 'win32') {
    //   await Helpers.isElevated();
    // }

    let globalBinFolderPath = path.dirname(
      (
        (_.first(
          Helpers.run(
            `${UtilsOs.isRunningInWindowsPowerShell() ? 'where.exe' : 'which'} ${config.frameworkName}`,
            { output: false },
          )
            .sync()
            .toString()
            .split('\n'),
        ) || '') as string
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
          : `../${libFromNpmPackage}/${folderName.node_modules}`,
      ),
    );

    const packageInGlobalNodeModules = crossPlatformPath(
      path.resolve(path.join(globalNodeModules, project.nameForNpmPackage)),
    );

    // packageInGlobalNodeModules
    Helpers.removeIfExists(packageInGlobalNodeModules);
    project.linkTo(packageInGlobalNodeModules);

    if (!Helpers.exists(project.pathFor(binMainProject))) {
      Helpers.mkdirp(project.pathFor(binMainProject));
    }

    this.createGlobalSystemLinks(globalBinFolderPath);

    this._exit();
    //#endregion
  }
  //#endregion

  //#region api / release
  async release() {
    //#region @backendFunc
    const repoName = `repo-${this.project.name}-release-cli`;
    const repoRoot = this.project.pathFor([
      `.${config.frameworkName}`,
      'linked-clis',
    ]);

    try {
      this.project.git.fetch(true);
    } catch (error) {
      Helpers.error(
        `Not able to fetch in ${this.project.location}`,
        false,
        true,
      );
    }
    const repoPath = crossPlatformPath([repoRoot, repoName]);
    const repoUrl = this.project.git.remoteOriginUrl;

    const detectedBranches = Utils.uniqArray(
      this.project.git
        .getBranchesNamesBy(/release\/local\//)
        .map(f => f.replace('remotes/origin/', ''))
        .filter(f => f.startsWith('release/local/')),
    );
    // console.log({ detectedBranches });

    const selectedBranch =
      detectedBranches.length <= 1
        ? _.first(detectedBranches)
        : await UtilsTerminal.select({
            question: `Select release branch to link`,
            choices: detectedBranches.map(c => {
              return { name: c, value: c };
            }),
          });

    if (!selectedBranch) {
      Helpers.error(`No branch to clone for cli relase link.`, false, true);
    }

    if (!Helpers.exists(repoPath)) {
      Helpers.mkdirp(repoRoot);
      try {
        await HelpersTaon.git.clone({
          cwd: repoRoot,
          url: repoUrl,
          override: true,
          destinationFolderName: repoName,
        });
      } catch (error) {
        Helpers.error(`Not able to clone selected release branch`, false, true);
      }
    }

    try {
      HelpersTaon.git.resetHard(repoPath);
      HelpersTaon.git.checkout(repoPath, selectedBranch, {
        createBranchIfNotExists: false,
        fetchBeforeCheckout: false,
        switchBranchWhenExists: false,
      });
    } catch (error) {
      Helpers.error(
        `Not able to switch to branch=${selectedBranch}.`,
        false,
        true,
      );
    }

    const projFromRepo = this.project.ins.From(repoPath);
    if (!projFromRepo) {
      Helpers.error(
        `Cloned release branch is not a taon project repo.`,
        false,
        true,
      );
    }

    try {
      await projFromRepo.git.pullCurrentBranch();
    } catch (error) {
      Helpers.error(
        `Not able to pull branch=${selectedBranch} in ${projFromRepo.location}`,
        false,
        true,
      );
    }

    const localClis = this._getDetectedLocalCLi(projFromRepo);
    const selectedCliPath =
      localClis.length <= 1
        ? _.first(localClis)
        : await UtilsTerminal.select({
            question: `Select version to link from branch=${selectedBranch}`,
            choices: localClis.map(c => {
              return { name: c, value: c };
            }),
          });

    if (!selectedCliPath) {
      Helpers.error(
        `Not detected local clis in branch=${selectedBranch}.`,
        false,
        true,
      );
    }

    await this.local(selectedCliPath);
    //#endregion
  }
  //#endregion

  //#region recreate cli basic structure
  createGlobalSystemLinks(globalBinFolderPath?: string): void {
    //#region @backendFunc
    this.project.artifactsManager.recreateCliBasicStructure();

    if (globalBinFolderPath && _.isObject(this.project.packageJson.bin)) {
      Object.keys(this.project.packageJson.bin).forEach(globalName => {
        const localPath = path.join(
          this.project.location,
          this.project.packageJson.bin[globalName],
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
    //#endregion
  }
  //#endregion

  //#region write win 32 link files
  _writeWin32LinkFiles(options: {
    destinationGlobalLink: string;
    attachDebugParam: '--inspect' | '--inspect-brk' | '';
    globalName: string;
    globalBinFolderPath: string;
  }) {
    const {
      attachDebugParam,
      destinationGlobalLink,
      globalName,
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
          this.project.nameForNpmPackage
        }/bin/${globalName}" "$@"
ret=$?
else
node ${attachDebugParam} "$basedir/node_modules/${
          this.project.nameForNpmPackage
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
              this.project.nameForNpmPackage
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
              this.project.nameForNpmPackage
            }/${binMainProject}/${globalName}" $args
$ret=$LASTEXITCODE
} else {
& "node$exe"  "$basedir/node_modules/${
              this.project.nameForNpmPackage
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
          this.project.nameForNpmPackage
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

  //#region get detected local cli
  /**
   * @returns Absolute paths for detected clis
   */
  _getDetectedLocalCLi(project = this.project): string[] {
    const destBaseLatest = project.pathFor(
      `${localReleaseMainProject}/${ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL}`,
    );
    return Helpers.foldersFrom(destBaseLatest).filter(f => {
      const proj = this.ins.From(f);
      return !!proj;
    });
  }
  //#endregion

  localDetected() {
    const localClis = this._getDetectedLocalCLi();
    console.log({ localClis });
    this._exit();
  }
}

export default {
  $Link: HelpersTaon.CLIWRAP($Link, '$Link'),
};
