//#region imports
// import postcss from 'postcss';
// import postcssScss from 'postcss-scss';
import type { TaonTranslationsMapImport } from '@taon-dev/i18n/src';
import {
  config,
  crossPlatformPath,
  Helpers,
  Utils,
  _,
  UtilsFilesFoldersSync,
  path,
  UtilsI18n,
} from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';

import {
  assetsFor,
  assetsFromNgProj,
  assetsFromNpmPackage,
  assetsFromSrc,
  browserFromImport,
  i18nDataTsFileExt,
  i18nFolder,
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

export function removeCommentsFromScssFile(scss: string): string {
  //#region @backendFunc
  return void 0 as string;
  // const root = postcss.parse(scss, {
  //   parser: postcssScss,
  // });

  // root.walkComments(comment => comment.remove());

  // return root.toString(postcssScss);
  //#endregion
}

//#region allowed to release map
export const ALLOWED_TO_RELEASE: {
  [releaseType in ReleaseType]: ReleaseArtifactTaon[];
} = {
  'manual-taon': [
    ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    ReleaseArtifactTaon.ANGULAR_NODE_APP,
  ],
  'cloud-ci-taon': [],
  'cloud-ci-cloudflare': [],
  'manual-cloudflare': [ReleaseArtifactTaon.ANGULAR_NODE_APP],
  'manual-static-pages': [
    ReleaseArtifactTaon.ANGULAR_NODE_APP,
    ReleaseArtifactTaon.DOCS_DOCS_WEBAPP,
    ReleaseArtifactTaon.ELECTRON_APP,
    ReleaseArtifactTaon.VSCODE_PLUGIN,
  ],
  'cloud-ci-static-pages': [],
  local: [
    ReleaseArtifactTaon.ELECTRON_APP,
    ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    ReleaseArtifactTaon.VSCODE_PLUGIN,
    ReleaseArtifactTaon.ANGULAR_NODE_APP,
  ],
};
//#endregion

//#region is test file
export const isTestFile = (filePath: string): boolean => {
  if (!filePath) {
    Helpers.warn(`[isTestFile] Checking empty path`, true);
    return false;
  }
  return (
    filePath.endsWith('.test.ts') ||
    filePath.endsWith('.test.tsx') ||
    filePath.endsWith('.spec.ts') ||
    filePath.endsWith('.spec.tsx') ||
    filePath.endsWith('.e2e.ts') ||
    filePath.endsWith('.e2e.tsx')
  );
};
//#endregion

//#region create short name
export function createShortName(
  taonProjectName: string,
  opt?: {
    optionalParentProjectName?: string;
  },
): string {
  const MAX_LENGTH = 6;

  const name = taonProjectName.toLowerCase();

  if (name.length <= MAX_LENGTH) {
    return name;
  }

  const parts = name.split('-').filter(Boolean);

  /**
   * Prefer consonants because they usually carry more
   * recognizable information than vowels.
   */
  const compactWord = (word: string, maxLength: number): string => {
    if (word.length <= maxLength) {
      return word;
    }

    if (maxLength <= 1) {
      return word[0];
    }

    const first = word[0];
    const last = word[word.length - 1];

    const middle = word.slice(1, -1).replace(/[aeiou]/g, '');

    const result = first + middle.slice(0, Math.max(0, maxLength - 2)) + last;

    return result.slice(0, maxLength);
  };

  /**
   * Names containing "-" should preferably keep one dash.
   *
   * mattbachat-pl
   * -> mtb-pl
   *
   * application-quiz
   * -> app-qz
   */
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    const leftPart = parts.slice(0, -1).join('');

    // Reserve:
    //   1 char for "-"
    //   up to 2 chars for right side
    const rightLength = Math.min(2, lastPart.length);
    const leftLength = MAX_LENGTH - 1 - rightLength;

    const left = compactWord(leftPart, leftLength);
    const right = compactWord(lastPart, rightLength);

    return `${left}-${right}`;
  }

  /**
   * Single-word project.
   *
   * kloniebachatowepl
   * -> klbpl / similar recognizable shortening
   *
   * myprojecttest
   * -> mypst
   */
  const word = parts[0];

  const consonants = word.slice(1, -2).replace(/[aeiou]/g, '');

  let result = word.slice(0, 2) + consonants.slice(0, 2) + word.slice(-2);

  result = [...new Set(result)].join('');

  /**
   * Deduplication can make it shorter than desired.
   * Fill deterministically from the original name.
   */
  for (const char of word) {
    if (result.length >= MAX_LENGTH) {
      break;
    }

    if (!result.includes(char)) {
      result += char;
    }
  }

  /**
   * Parent can provide deterministic uniqueness if the
   * generated name is unusually short.
   */
  if (result.length < 4 && opt?.optionalParentProjectName) {
    for (const char of opt.optionalParentProjectName) {
      if (/[a-z0-9]/.test(char) && !result.includes(char)) {
        result += char;
      }

      if (result.length >= MAX_LENGTH) {
        break;
      }
    }
  }

  return result.slice(0, MAX_LENGTH);
}
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

//#region replace import to assets imports
export const replaceImportToAssetsIMport = (
  rawContentForBrowser: string,
  nameForNpmPackage: string,
  relativeFilePath: string,
  project: Project,
): string => {
  //#region @backendFunc
  if (!rawContentForBrowser) {
    return rawContentForBrowser;
  }

  if (relativeFilePath.endsWith('.ts') || relativeFilePath.endsWith('.tsx')) {
    //#region replace assets list from
    (() => {
      const assetsFromRegex = /Taon\.assetsListFrom\s*\(\s*(['"])(.*?)\1\s*\)/g;
      rawContentForBrowser = rawContentForBrowser.replace(
        assetsFromRegex,
        (_, quote, folder: string) => {
          folder = folder.replace(/^\//, '').replace(/\/$/, '');
          const files = UtilsFilesFoldersSync.getFilesFrom(
            project.pathFor(folder),
            {
              recursive: true,
              followSymlinks: false,
            },
          ).map(c => c.replace(project.location + '/' + folder + '/', ''));

          if (files.length > 0) {
            Helpers.info(
              `Updating Taon.assetsListFrom(...) ${files.length} files in ${relativeFilePath}`,
            );
          }

          return `[ ${files.map(f => `${quote}${f}${quote}`).join(',')} ]`;
        },
      );
    })();
    //#endregion

    //#region replace assets from
    (() => {
      const assetsFromRegex = /Taon\.assetsFrom\s*\(\s*(['"])(.*?)\1\s*\)/g;
      rawContentForBrowser = rawContentForBrowser.replace(
        assetsFromRegex,
        (_, quote, folder: string) => {
          const files = UtilsFilesFoldersSync.getFilesFrom(
            project.pathFor(folder.replace(/^\//, '').replace(/\/$/, '')),
            {
              recursive: true,
              followSymlinks: false,
            },
          ).map(c => c.replace(project.location + '/', ''));

          if (files.length > 0) {
            Helpers.info(
              `Updating Taon.assetsFrom(...) ${files.length} files in ${relativeFilePath}`,
            );
          }

          return `[ ${files.map(f => `  Taon.asset(${quote}${f}${quote})`).join(',')} ]`;
        },
      );
    })();
    //#endregion

    //#region replace taon FILE RELATIVE PATH
    (() => {
      const assetsFromRegex = /Taon\.__FILE_RELATIVE_PATH/g;
      rawContentForBrowser = rawContentForBrowser.replace(
        assetsFromRegex,
        (_, quote, folder: string) => {
          return `'${crossPlatformPath([srcMainProject, relativeFilePath])}'`;
        },
      );
    })();
    //#endregion

    //#region replace taon LANG IMPORT MAP)
    (() => {
      const assetsFromRegex = /Taon\.LANG_IMPORT_MAP/g;
      rawContentForBrowser = rawContentForBrowser.replace(
        assetsFromRegex,
        (_, quote, folder: string) => {
          // TODO @LAST REFACTOR this
          // - automatically add import from './i18m/*.translation default export where will be stored default imports
          const res = {} as TaonTranslationsMapImport;

          const files = UtilsFilesFoldersSync.getFilesFrom(
            project.pathFor([srcMainProject, path.dirname(relativeFilePath)]),
            {
              recursive: false,
              followSymlinks: false,
            },
          );

          const langs = project.taonJson.generateTranslationsFor;

          for (const lang of langs) {
            for (let index = 0; index < files.length; index++) {
              const fileAbsPath = files[index];
              const base = project.location;
              const relative = fileAbsPath.replace(base + '/', '');
              // console.log({ fileAbsPath, relative });
              const fileInI18PoFile = crossPlatformPath([
                path.dirname(fileAbsPath),
                i18nFolder,
                `${path.basename(fileAbsPath)}.${lang}.po`,
              ]);

              if (Helpers.exists(fileInI18PoFile)) {
                res[relative] = res[relative] || {};
                res[relative][lang] =
                  `####async () => (await import('./${i18nFolder}/${path.basename(
                    fileAbsPath,
                  )}.${lang}${i18nDataTsFileExt.replace('.ts', '')}')).default####` as any;
              }
            }
          }

          return `${JSON.stringify(res)
            .replace(/\"\#\#\#\#/g, '')
            .replace(/\#\#\#\#\"/g, '')} as any`;
        },
      );
    })();
    //#endregion
  }

  (() => {
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
  })();

  return rawContentForBrowser;
  //#endregion
};
//#endregion
