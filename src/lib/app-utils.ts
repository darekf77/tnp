import { crossPlatformPath, Helpers } from 'tnp-core/src';

import {
  TemplateFolder,
  tmpAppsForDist,
  tmpAppsForDistElectron,
  tmpAppsForDistElectronWebsql,
  tmpAppsForDistWebsql,
  tmpLibsForDist,
  tmpLibsForDistWebsql,
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
  websql: boolean;
  targetArtifact: EnvOptions['release']['targetArtifact'];
}): string => {
  //#region @backendFunc
  const { websql, targetArtifact, project } = options;

  if (websql && targetArtifact === ReleaseArtifactTaon.ELECTRON_APP) {
    Helpers.warn(`Electron app with websql is not supported`, true);
    return crossPlatformPath([tmpAppsForDistElectronWebsql, project.name]);
  }
  if (!websql && targetArtifact === ReleaseArtifactTaon.ELECTRON_APP) {
    return crossPlatformPath([tmpAppsForDistElectron, project.name]);
  }
  if (!websql && targetArtifact === ReleaseArtifactTaon.ANGULAR_NODE_APP) {
    return crossPlatformPath([tmpAppsForDist, project.name]);
  }
  if (websql && targetArtifact === ReleaseArtifactTaon.ANGULAR_NODE_APP) {
    return crossPlatformPath([tmpAppsForDistWebsql, project.name]);
  }
  return crossPlatformPath([
    websql ? tmpLibsForDistWebsql : tmpLibsForDist,
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
      websql: buildOptions.build.websql,
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
