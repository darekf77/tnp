import { crossPlatformPath, Helpers__NS__error, Helpers__NS__warn } from 'tnp-core/lib-prod';
import { UtilsTypescript__NS__getCleanImport } from 'tnp-helpers/lib-prod';
import { prodSuffix, TemplateFolder, tmpAppsForDist, tmpAppsForDistElectron, tmpAppsForDistElectronWebsql, tmpAppsForDistWebsql, tmpLibsForDist, tmpLibsForDistWebsql, } from './constants';
import { ReleaseArtifactTaon } from './options';
export const ALLOWED_TO_RELEASE = {
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
export const extractFirstLevelRegions = (content) => {
    const lines = content.split(/\r?\n/);
    const result = [];
    let depth = 0;
    let currentRegionName = null;
    let buffer = [];
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
            }
            else if (depth > 1) {
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
            }
            else if (depth > 1) {
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
export const angularProjProxyPath = (options) => {
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
export const getProxyNgProj = (project, buildOptions, targetArtifact) => {
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
    return proj;
    //#endregion
};
//#endregion
export const templateFolderForArtifact = (artifact) => {
    //#region @backendFunc
    if ([
        ReleaseArtifactTaon.ANGULAR_NODE_APP,
        ReleaseArtifactTaon.ELECTRON_APP,
        ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    ].includes(artifact)) {
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
export const getCleanImport = (importName) => {
    return UtilsTypescript__NS__getCleanImport(importName);
};
export function parseAiMdContent(input) {
    const results = [];
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
    const blockRegex = /^#?\s*([^\n`]+?)\s*(?:\([^)]+\))?\s*\n```[^\n]*\n([\s\S]*?)\n```/gm;
    let match;
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/app-utils.js.map