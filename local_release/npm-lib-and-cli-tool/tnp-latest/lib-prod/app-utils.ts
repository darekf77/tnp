import { crossPlatformPath, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { UtilsTypescript__NS__addBelowPlaceholder, UtilsTypescript__NS__addOrUpdateImportIfNotExists, UtilsTypescript__NS__calculateRelativeImportPath, UtilsTypescript__NS__clearRequireCacheRecursive, UtilsTypescript__NS__collapseFluentChains, UtilsTypescript__NS__DeepWritable, UtilsTypescript__NS__eslintFixAllFilesInsideFolder, UtilsTypescript__NS__eslintFixAllFilesInsideFolderAsync, UtilsTypescript__NS__eslintFixFile, UtilsTypescript__NS__ExportedThirdPartyNamespaces, UtilsTypescript__NS__ExportInfo, UtilsTypescript__NS__exportsFromContent, UtilsTypescript__NS__exportsFromFile, UtilsTypescript__NS__exportsRedefinedFromContent, UtilsTypescript__NS__exportsRedefinedFromFile, UtilsTypescript__NS__extractAngularComponentSelectors, UtilsTypescript__NS__extractClassNameFromString, UtilsTypescript__NS__extractClassNamesFromFile, UtilsTypescript__NS__extractDefaultClassNameFromFile, UtilsTypescript__NS__extractDefaultClassNameFromString, UtilsTypescript__NS__extractRenamedImportsOrExport, UtilsTypescript__NS__fixHtmlTemplatesInDir, UtilsTypescript__NS__FlattenMapping, UtilsTypescript__NS__formatAllFilesInsideFolder, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__GatheredExportsMap, UtilsTypescript__NS__gatherExportsMapFromIndex, UtilsTypescript__NS__getCleanImport, UtilsTypescript__NS__getTaonContextFromContent, UtilsTypescript__NS__getTaonContextsNamesFromFile, UtilsTypescript__NS__hoistTrailingChainComments, UtilsTypescript__NS__injectImportsIntoImportsRegion, UtilsTypescript__NS__migrateFromNgModulesToStandaloneV21, UtilsTypescript__NS__normalizeBrokenLines, UtilsTypescript__NS__NSSPLITNAMESAPCE, UtilsTypescript__NS__ParsedTsDiagnostic, UtilsTypescript__NS__parseTsDiagnostic, UtilsTypescript__NS__recognizeImportsFromContent, UtilsTypescript__NS__recognizeImportsFromFile, UtilsTypescript__NS__RedefinedExportInfo, UtilsTypescript__NS__refactorClassToNamespace, UtilsTypescript__NS__removeRegionByName, UtilsTypescript__NS__removeTaggedArrayObjects, UtilsTypescript__NS__removeTaggedImportExport, UtilsTypescript__NS__removeTaggedLines, UtilsTypescript__NS__RenamedImportOrExport, UtilsTypescript__NS__replaceImportNamespaceWithWithExplodedNamespace, UtilsTypescript__NS__replaceNamespaceWithLongNames, UtilsTypescript__NS__setValueToVariableInTsFile, UtilsTypescript__NS__splitNamespaceForContent, UtilsTypescript__NS__splitNamespaceForFile, UtilsTypescript__NS__SplitNamespaceResult, UtilsTypescript__NS__transformComponentStandaloneOption, UtilsTypescript__NS__transformFlatImports, UtilsTypescript__NS__TsImportExport, UtilsTypescript__NS__updateSplitNamespaceReExports, UtilsTypescript__NS__updateSplitNamespaceResultMapReplaceObj, UtilsTypescript__NS__wrapContentClassMembersDecoratorsWithRegion, UtilsTypescript__NS__wrapFirstImportsInImportsRegion, UtilsTypescript__NS__wrapWithComment } from 'tnp-helpers/lib-prod';

import {
  browserFromImport,
  libFromImport,
  prodSuffix,
  TemplateFolder,
  tmpAppsForDist,
  tmpAppsForDistElectron,
  tmpAppsForDistElectronWebsql,
  tmpAppsForDistWebsql,
  tmpLibsForDist,
  tmpLibsForDistWebsql,
  websqlFromImport,
} from './constants';
import { EnvOptions, ReleaseArtifactTaon, ReleaseType } from './options';
import type { Project } from './project/abstract/project';

export const ALLOWED_TO_RELEASE: {
  [releaseType in ReleaseType]: ReleaseArtifactTaon[];
} = {
  manual: [
    ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    ReleaseArtifactTaon.ANGULAR_NODE_APP,
  ],
  local: [
    ReleaseArtifactTaon.ELECTRON_APP,
    ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    ReleaseArtifactTaon.VSCODE_PLUGIN,
    ReleaseArtifactTaon.ANGULAR_NODE_APP,
  ],
  cloud: [],
  'static-pages': [
    ReleaseArtifactTaon.ANGULAR_NODE_APP,
    ReleaseArtifactTaon.DOCS_DOCS_WEBAPP,
    ReleaseArtifactTaon.ELECTRON_APP,
    ReleaseArtifactTaon.VSCODE_PLUGIN,
  ],
};

/**
 * @returns relative path to proxy angular project build folder
 */
export const angularProjProxyPath = (options: {
  project: Project;
  envOptions: EnvOptions;
  targetArtifact: EnvOptions['release']['targetArtifact'];
}): string => {
  //#region @backendFunc
  const { targetArtifact, project } = options;
  const websql = options.envOptions.build.websql;
  const suffix = options.envOptions.build.prod ? prodSuffix : '';

  if (websql && targetArtifact === ReleaseArtifactTaon.ELECTRON_APP) {
    Helpers__NS__warn(`Electron app with websql is not supported`, true);
    return crossPlatformPath([
      tmpAppsForDistElectronWebsql + suffix,
      project.name,
    ]);
  }
  if (!websql && targetArtifact === ReleaseArtifactTaon.ELECTRON_APP) {
    return crossPlatformPath([tmpAppsForDistElectron + suffix, project.name]);
  }
  if (!websql && targetArtifact === ReleaseArtifactTaon.ANGULAR_NODE_APP) {
    return crossPlatformPath([tmpAppsForDist + suffix, project.name]);
  }
  if (websql && targetArtifact === ReleaseArtifactTaon.ANGULAR_NODE_APP) {
    return crossPlatformPath([tmpAppsForDistWebsql + suffix, project.name]);
  }
  return crossPlatformPath([
    (websql ? tmpLibsForDistWebsql : tmpLibsForDist) + suffix,
    project.name,
  ]);
  //#endregion
};

//#region get proxy ng projects
export const getProxyNgProj = (
  project: Project,
  buildOptions: EnvOptions,
  targetArtifact: EnvOptions['release']['targetArtifact'],
): Project => {
  //#region @backendFunc
  const projPath = crossPlatformPath([
    project.location,
    angularProjProxyPath({
      project: project,
      envOptions: buildOptions,
      targetArtifact: targetArtifact,
    }),
  ]);
  const proj = project.ins.From(projPath);
  return proj as Project;
  //#endregion
};
//#endregion

export const templateFolderForArtifact = (
  artifact: ReleaseArtifactTaon,
): TemplateFolder => {
  //#region @backendFunc

  if (
    [
      ReleaseArtifactTaon.ANGULAR_NODE_APP,
      ReleaseArtifactTaon.ELECTRON_APP,
      ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    ].includes(artifact)
  ) {
    return TemplateFolder.templateApp;
  }

  // if (artifact === ReleaseArtifactTaon.ANGULAR_NODE_APP) {
  //   return TemplateFolder.templateApp;
  // }
  // if (artifact === ReleaseArtifactTaon.ELECTRON_APP) {
  //   return TemplateFolder.templateApp;
  // }
  // if (artifact === ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL) {
  //   return TemplateFolder.templateLib;
  // }
  Helpers__NS__error(`Cannot Template folder for current artifact "${artifact}"`);
  //#endregion
};

export const getCleanImport = (importName: string): string | undefined => {
  return UtilsTypescript__NS__getCleanImport(importName);
};