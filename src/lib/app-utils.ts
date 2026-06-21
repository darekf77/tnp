//#region imports
import { config, crossPlatformPath, Helpers, Utils, _ } from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';

import {
  assetsFor,
  assetsFromNgProj,
  assetsFromNpmPackage,
  assetsFromSrc,
  browserFromImport,
  libFromImport,
  oldBuildModePrefix,
  oldBuildModePrefixShort,
  prodSuffix,
  srcMainProject,
  TemplateFolder,
  tmpAppsForDist,
  tmpAppsForDistElectron,
  tmpAppsForDistElectronWebsql,
  tmpAppsForDistWebsql,
  tmpLibsForDist,
  tmpLibsForDistWebsql,
  TO_REMOVE_TAG,
  websqlFromImport,
} from './constants';
import { EnvOptions, ReleaseArtifactTaon, ReleaseType } from './options';
import type { Project } from './project/abstract/project';
//#endregion

//#region allowed to release map
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
//#endregion

//#region extract first level regions
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
//#endregion

//#region angular projx project path
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
//#endregion

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

//#region template folder for artifact
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
//#endregion

//#region get clean import
export const getCleanImport = (importName: string): string | undefined => {
  return UtilsTypescript.getCleanImport(importName);
};
//#endregion

export interface AiMdFile {
  filename: string;
  content: string;
}

//#region parse ai md content
export function parseAiMdContent(input: string): AiMdFile[] {
  const results: AiMdFile[] = [];

  // Remove AI-MD wrapper markers if present
  input = input
    .replace(/===\s*start of AI-MD multi-file markdown structure\s*===/i, '')
    .replace(/===\s*end of AI-MD multi-file markdown structure\s*===/i, '')
    .trim();

  // Match blocks like:
  // # filename.ext (optional)
  // ```lang
  // content
  // ```
  const blockRegex =
    /^#?\s*([^\n`]+?)\s*(?:\([^)]+\))?\s*\n```[^\n]*\n([\s\S]*?)\n```/gm;

  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(input)) !== null) {
    const rawFilename = match[1].trim();
    const content = match[2];

    results.push({
      filename: (rawFilename || '').replace(`#`, '').trim(),
      content,
    });
  }

  return results;
}
//#endregion

//#region error main worker communication
export const errorMainWorkerCommunication = (): void => {
  Helpers.warn(`Not able to communicate with main worker or current build worker:
- restart build (that is failing)
OR
- restart taon worker: ${config.frameworkName} cloud --restart
OR
- use old build mode that does not need worker
(add flag ${oldBuildModePrefix} or short version ${oldBuildModePrefixShort})

  `);
};
//#endregion

//#region replace assets links for app
export const replaceAssetsLinksForApp = (
  rawContentForAPPONLYBrowser: string,
  relativePath: string,
  project: Project,
  buildOptions: EnvOptions,
): string => {
  //#region @backendFunc

  if (!rawContentForAPPONLYBrowser) {
    return rawContentForAPPONLYBrowser;
  }

  rawContentForAPPONLYBrowser = rawContentForAPPONLYBrowser.replace(
    new RegExp(Utils.escapeStringForRegEx(TO_REMOVE_TAG), 'g'),
    '',
  );

  //#region prepare variables

  // console.log(`[incremental-build-process processAssetsLinksForApp '${this.buildOptions.baseHref}'`)
  const baseHref =
    project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(
      buildOptions.clone(),
    );
  // console.log(`Fixing with basehref: '${baseHref}'`)

  const howMuchBack = relativePath.split('/').length - 1;
  const back =
    howMuchBack === 0
      ? './'
      : _.times(howMuchBack)
          .map(() => '../')
          .join('');
  //#endregion

  //#region to replace fn
  const toReplaceFn = (relativeAssetPathPart: string) => {
    // console.log({ relativeAssetPathPart });
    return [
      {
        from: `${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: `${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        makeSureSlashAtBegin: true,
      },
      {
        from: ` '/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: ` '${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
      },
      {
        from: ` "/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: ` "${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
      },
      {
        from: `src="/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: `src="${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
      },
      {
        from: `[src]="'/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: `[src]="'${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
      },
      {
        from: `href="/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: `href="${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
      },
      {
        from: `[href]="'/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: `[href]="'${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
      },
      {
        from: `url(/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: `url(${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
      },
      {
        from: `url('/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: `url('${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
      },
      {
        from: `url("/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: `url("${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
      },
      {
        from: `Taon.asset('/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: `Taon.asset('${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
      },
      {
        from: `Taon.asset("/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: `Taon.asset("${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
      },
      /**
         *

  import * as json1 from '/shared/src/assets/hamsters/test.json';
  console.log({ json1 }) -> WORKS NOW
         */
      {
        from: ` from '/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: ` from '${back}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
      },
      {
        from: ` from "/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        to: ` from "${back}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
      },
      /**
         * what can be done more
         * import * as json2 from '@codete-rxjs-quick-start/shared/assets/shared//src';
  console.log({ json2 })

  declare module "*.json" {
  const value: any;
  export default value;
  }

         */
    ] as {
      from: string;
      to: string;
      makeSureSlashAtBegin?: boolean;
    }[];
  };
  //#endregion

  //#region process file content

  const cases = toReplaceFn(project.nameForNpmPackage);
  for (let index = 0; index < cases.length; index++) {
    const { to, from, makeSureSlashAtBegin } = cases[index];
    if (makeSureSlashAtBegin) {
      rawContentForAPPONLYBrowser = rawContentForAPPONLYBrowser.replace(
        new RegExp(Utils.escapeStringForRegEx(`/${from}`), 'g'),
        `/${to}`,
      );

      rawContentForAPPONLYBrowser = rawContentForAPPONLYBrowser.replace(
        new RegExp(Utils.escapeStringForRegEx(from), 'g'),
        `/${to}`,
      );
    } else {
      rawContentForAPPONLYBrowser = rawContentForAPPONLYBrowser.replace(
        new RegExp(Utils.escapeStringForRegEx(from), 'g'),
        to,
      );
    }
  }

  //#endregion

  return rawContentForAPPONLYBrowser;
  //#endregion
};
//#endregion

export const replaceImportToAssetsIMport = (
  rawContentForBrowser: string,
  nameForNpmPackage: string,
): string => {
  if (!rawContentForBrowser) {
    return rawContentForBrowser;
  }
  const from = `${srcMainProject}/${assetsFromSrc}/`;
  const to =
    `${TO_REMOVE_TAG}${assetsFromNgProj}/` +
    `${assetsFor}/${nameForNpmPackage}/${assetsFromNpmPackage}/`;

  rawContentForBrowser = rawContentForBrowser.replace(
    new RegExp(Utils.escapeStringForRegEx(`/${from}`), 'g'),
    to,
  );
  rawContentForBrowser = rawContentForBrowser.replace(
    new RegExp(Utils.escapeStringForRegEx(from), 'g'),
    to,
  );
  return rawContentForBrowser;
};
