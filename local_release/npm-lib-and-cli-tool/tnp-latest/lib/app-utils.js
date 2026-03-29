"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCleanImport = exports.templateFolderForArtifact = exports.getProxyNgProj = exports.angularProjProxyPath = exports.extractFirstLevelRegions = exports.ALLOWED_TO_RELEASE = void 0;
exports.parseAiMdContent = parseAiMdContent;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const constants_1 = require("./constants");
const options_1 = require("./options");
exports.ALLOWED_TO_RELEASE = {
    manual: [
        options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP,
    ],
    local: [
        options_1.ReleaseArtifactTaon.ELECTRON_APP,
        options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        options_1.ReleaseArtifactTaon.VSCODE_PLUGIN,
        options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP,
    ],
    cloud: [],
    'static-pages': [
        options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP,
        options_1.ReleaseArtifactTaon.DOCS_DOCS_WEBAPP,
        options_1.ReleaseArtifactTaon.ELECTRON_APP,
        options_1.ReleaseArtifactTaon.VSCODE_PLUGIN,
    ],
};
const extractFirstLevelRegions = (content) => {
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
exports.extractFirstLevelRegions = extractFirstLevelRegions;
/**
 * @returns relative path to proxy angular project build folder
 */
const angularProjProxyPath = (options) => {
    //#region @backendFunc
    const { targetArtifact, project } = options;
    const websql = options.envOptions.build.websql;
    const suffix = options.envOptions.build.prod ? constants_1.prodSuffix : '';
    if (websql && targetArtifact === options_1.ReleaseArtifactTaon.ELECTRON_APP) {
        lib_1.Helpers.warn(`Electron app with websql is not supported`, true);
        return (0, lib_1.crossPlatformPath)([
            constants_1.tmpAppsForDistElectronWebsql + suffix,
            project.name,
        ]);
    }
    if (!websql && targetArtifact === options_1.ReleaseArtifactTaon.ELECTRON_APP) {
        return (0, lib_1.crossPlatformPath)([constants_1.tmpAppsForDistElectron + suffix, project.name]);
    }
    if (!websql && targetArtifact === options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP) {
        return (0, lib_1.crossPlatformPath)([constants_1.tmpAppsForDist + suffix, project.name]);
    }
    if (websql && targetArtifact === options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP) {
        return (0, lib_1.crossPlatformPath)([constants_1.tmpAppsForDistWebsql + suffix, project.name]);
    }
    return (0, lib_1.crossPlatformPath)([
        (websql ? constants_1.tmpLibsForDistWebsql : constants_1.tmpLibsForDist) + suffix,
        project.name,
    ]);
    //#endregion
};
exports.angularProjProxyPath = angularProjProxyPath;
//#region get proxy ng projects
const getProxyNgProj = (project, buildOptions, targetArtifact) => {
    //#region @backendFunc
    const projPath = (0, lib_1.crossPlatformPath)([
        project.location,
        (0, exports.angularProjProxyPath)({
            project: project,
            envOptions: buildOptions,
            targetArtifact: targetArtifact,
        }),
    ]);
    const proj = project.ins.From(projPath);
    return proj;
    //#endregion
};
exports.getProxyNgProj = getProxyNgProj;
//#endregion
const templateFolderForArtifact = (artifact) => {
    //#region @backendFunc
    if ([
        options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP,
        options_1.ReleaseArtifactTaon.ELECTRON_APP,
        options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    ].includes(artifact)) {
        return constants_1.TemplateFolder.templateApp;
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
    lib_1.Helpers.error(`Cannot Template folder for current artifact "${artifact}"`);
    //#endregion
};
exports.templateFolderForArtifact = templateFolderForArtifact;
const getCleanImport = (importName) => {
    return lib_2.UtilsTypescript.getCleanImport(importName);
};
exports.getCleanImport = getCleanImport;
function parseAiMdContent(input) {
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/app-utils.js.map