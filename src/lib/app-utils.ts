import { crossPlatformPath, Helpers, Utils } from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';

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

export const extractFirstLevelRegions = (
  content: string,
): { regionName: string; regionContent: string }[] => {
  const lines = content.split(/\r?\n/);

  const result: { regionName: string; regionContent: string }[] = [];

  let depth = 0;
  let currentRegionName: string | null = null;
  let buffer: string[] = [];

  for (const line of lines) {
    const startMatch = line.match(/^\s*\/\/#region\s*(.*)$/);
    const endMatch = line.match(/^\s*\/\/#endregion/);

    // REGION START
    if (startMatch) {
      depth++;

      // If entering first level
      if (depth === 1) {
        currentRegionName = startMatch[1].trim();
        buffer = [];
      } else if (depth > 1) {
        // Nested region → keep it in content
        buffer.push(line);
      }

      continue;
    }

    // REGION END
    if (endMatch) {
      if (depth === 1 && currentRegionName) {
        result.push({
          regionName: currentRegionName,
          regionContent: buffer.join('\n'),
        });

        currentRegionName = null;
        buffer = [];
      } else if (depth > 1) {
        // Nested region end → keep it
        buffer.push(line);
      }

      depth--;
      continue;
    }

    // Normal content inside first level region
    if (depth >= 1 && currentRegionName) {
      buffer.push(line);
    }
  }

  return result;
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
    Helpers.warn(`Electron app with websql is not supported`, true);
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
  Helpers.error(`Cannot Template folder for current artifact "${artifact}"`);
  //#endregion
};

export const getCleanImport = (importName: string): string | undefined => {
  return UtilsTypescript.getCleanImport(importName);
};
