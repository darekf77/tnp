"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Refactor = void 0;
exports.formatRegions = formatRegions;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const lib_5 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
//#endregion
//#region format regions
/**
 * QUICK_FIX for spaces after and before each region
 * Formats TypeScript region comments:
 * - Ensures a blank line BEFORE each #region / region
 * - Ensures a blank line AFTER each #endregion / endregion
 *   (but skips the "after" blank line if it's the final region before a closing })
 */
function formatRegions(code) {
    const lines = code.split(/\r?\n/);
    const result = [];
    let i = 0;
    while (i < lines.length) {
        const current = lines[i];
        const trimmed = current.trim();
        // === 1. Detect //#region or // region (with optional text after) ===
        const isRegionStart = /^\s*\/\/\s*#?\s*region\b/i.test(trimmed);
        if (isRegionStart) {
            // Ensure there's a blank line BEFORE this region (unless it's the very first line)
            if (result.length > 0) {
                const last = result[result.length - 1];
                if (last !== '') {
                    result.push(''); // insert blank line before region
                }
            }
            result.push(current);
        }
        // === 2. Detect //#endregion or // endregion ===
        else if (/^\s*\/\/\s*#?\s*endregion\b/i.test(trimmed)) {
            result.push(current);
            // Look ahead: skip blank line after if next non-empty line is just "}" (or "};" / "},")
            let nextIdx = i + 1;
            while (nextIdx < lines.length && lines[nextIdx].trim() === '') {
                nextIdx++;
            }
            const nextLineTrimmed = nextIdx < lines.length ? lines[nextIdx].trim() : '';
            const isEndOfBlock = /^[\}\)];?,]?$/.test(nextLineTrimmed);
            if (!isEndOfBlock) {
                // Not the end of a block → ensure blank line after
                if (i + 1 >= lines.length || lines[i + 1].trim() !== '') {
                    result.push(''); // insert blank line
                }
                // else: already has blank line(s), we'll keep just one later if needed
            }
            // else: do NOT add blank line — it's the final region before closing brace
        }
        // === 3. Regular line ===
        else {
            result.push(current);
        }
        i++;
    }
    // Optional: clean up multiple consecutive blank lines (keep only one)
    const cleaned = result
        .join('\n')
        .replace(/\n{3,}/g, '\n\n') // 3+ → 2
        .replace(/^\n+/, '') // remove leading newlines
        .replace(/\n+$/, '\n'); // ensure single trailing newline
    return cleaned;
}
//#endregion
// @ts-ignore TODO weird inheritance problem
class Refactor extends lib_5.BaseFeatureForProject {
    //#region prepare options
    prepareOptions(options) {
        options = options || {};
        if (options.fixSpecificFile) {
            if (lib_3.path.isAbsolute(options.fixSpecificFile) &&
                lib_4.Helpers.exists(options.fixSpecificFile)) {
                // ok
            }
            else {
                options.fixSpecificFile = this.project.pathFor(options.fixSpecificFile);
                if (lib_3.path.isAbsolute(options.fixSpecificFile) &&
                    lib_4.Helpers.exists(options.fixSpecificFile)) {
                    // ok
                }
                else {
                    delete options.fixSpecificFile;
                }
            }
        }
        return options;
    }
    //#endregion
    //#region ALL
    async ALL(options) {
        options = this.prepareOptions(options);
        this.project.taonJson.setFrameworkVersion(('v' +
            this.project.ins.angularMajorVersionForCurrentCli()));
        if (this.project.framework.isContainer) {
            await this.project.init();
            for (const child of this.project.children) {
                await child.refactor.ALL(options);
            }
        }
        if (!options.initingFromParent) {
            await this.project.init();
        }
        this.project.taonJson.detectAndUpdateNpmExternalDependencies();
        this.project.taonJson.detectAndUpdateIsomorphicExternalDependencies();
        await this.changeCssToScss(options);
        await this.taonNames(options);
        await this.flattenImports(options);
        await this.removeBrowserRegion(options);
        await this.properStandaloneNg19(options);
        await this.eslint(options);
        await this.importsWrap(options);
        await this.prettier(options);
        this.project.vsCodeHelpers.toogleFilesVisibilityInVscode({
            action: 'hide-files',
        });
    }
    //#endregion
    async prettier(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        lib_4.Helpers.info(`Running prettier...`);
        if (options.fixSpecificFile) {
            await lib_4.UtilsTypescript.formatFile(options.fixSpecificFile);
            lib_4.Helpers.info(`Prettier done for file ${options.fixSpecificFile}`);
            return;
        }
        lib_4.UtilsTypescript.fixHtmlTemplatesInDir(this.project.pathFor(constants_1.srcMainProject));
        this.project.formatAllFiles();
        lib_4.Helpers.info(`Prettier done`);
        //#endregion
    }
    async eslint(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        lib_4.Helpers.info(`Running eslint fix...`);
        if (options.fixSpecificFile) {
            await lib_4.UtilsTypescript.eslintFixFile(options.fixSpecificFile);
            lib_4.Helpers.info(`Eslint fix done for file ${options.fixSpecificFile}`);
            return;
        }
        await lib_4.UtilsTypescript.eslintFixAllFilesInsideFolderAsync([
            this.project.pathFor(constants_1.srcMainProject),
        ]);
        lib_4.Helpers.info(`Eslint fix done`);
        //#endregion
    }
    async removeBrowserRegion(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        lib_4.Helpers.info(`Running ${'@bro' + 'wser'} region fixer...`);
        const removeBrowserRegion = (content) => {
            const lines = content.trim().split('\n');
            const regionStartRegex = /^\s*\/\/#region\s+@browser\s*$/;
            const regionEndRegex = /^\s*\/\/#endregion\s*$/;
            if (regionStartRegex.test(lines[0])) {
                lines.shift();
            }
            if (regionEndRegex.test(lines[lines.length - 1])) {
                lines.pop();
            }
            return lines.join('\n').trim();
        };
        lib_4.Helpers.getFilesFrom(this.project.pathFor(constants_1.srcMainProject), {
            recursive: true,
            // followSymlinks: false TODO ? maybe ?
        })
            .filter(f => {
            return (f.endsWith('.ts') &&
                !lib_3._.isUndefined(lib_2.frontendFiles.find(ff => lib_3.path.basename(f).endsWith(ff))));
        })
            .forEach(f => {
            let content = lib_4.Helpers.readFile(f);
            if (content) {
                const fixedContent = removeBrowserRegion(content);
                if (fixedContent.trim() !== content.trim()) {
                    lib_4.Helpers.info(`Removing browser region from ${f}`);
                    lib_4.Helpers.writeFile(f, fixedContent);
                }
            }
        });
        lib_4.Helpers.taskDone(`@browser region fixer done`);
        //#endregion
    }
    async changeCssToScss(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        lib_4.Helpers.info(`Changing css to scss replacer.`);
        lib_4.Helpers.getFilesFrom(this.project.pathFor(constants_1.srcMainProject), {
            recursive: true,
            followSymlinks: false,
        }).forEach(f => {
            if (options.fixSpecificFile && f !== options.fixSpecificFile) {
                return;
            }
            const tsFile = (0, lib_3.crossPlatformPath)([
                lib_3.path.dirname(f),
                lib_3.path.basename(f).replace('.css', '.ts'),
            ]);
            const tsFileCmp = (0, lib_3.crossPlatformPath)([
                lib_3.path.dirname(f),
                lib_3.path.basename(f).replace('.css', '.component.ts'),
            ]);
            const tsFileContainer = (0, lib_3.crossPlatformPath)([
                lib_3.path.dirname(f),
                lib_3.path.basename(f).replace('.css', '.container.ts'),
            ]);
            if (f.endsWith('.css') &&
                (lib_4.Helpers.exists(tsFile) ||
                    lib_4.Helpers.exists(tsFileCmp) ||
                    lib_4.Helpers.exists(tsFileContainer))) {
                lib_4.Helpers.writeFile((0, lib_3.crossPlatformPath)([
                    lib_3.path.dirname(f),
                    lib_3.path.basename(f).replace('.css', '.scss'),
                ]), lib_4.Helpers.readFile(f));
                lib_4.Helpers.removeFileIfExists(f);
                const scssBaseName = lib_3.path.basename(f).replace('.css', '.scss');
                if (lib_4.Helpers.exists(tsFile)) {
                    lib_4.Helpers.writeFile(tsFile, (lib_4.Helpers.readFile(tsFile) || '').replace(lib_3.path.basename(f), scssBaseName));
                }
                if (lib_4.Helpers.exists(tsFileCmp)) {
                    lib_4.Helpers.writeFile(tsFileCmp, (lib_4.Helpers.readFile(tsFileCmp) || '').replace(lib_3.path.basename(f), scssBaseName));
                }
                if (lib_4.Helpers.exists(tsFileContainer)) {
                    lib_4.Helpers.writeFile(tsFileContainer, (lib_4.Helpers.readFile(tsFileContainer) || '').replace(lib_3.path.basename(f), scssBaseName));
                }
            }
        });
        lib_4.Helpers.taskDone(`Changing css to scss done`);
        //#endregion
    }
    async properStandaloneNg19(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        lib_4.Helpers.info(`Setting proper standalone property for ng19+...`);
        lib_4.Helpers.getFilesFrom(this.project.pathFor(constants_1.srcMainProject), {
            recursive: true,
            followSymlinks: false,
        }).forEach(f => {
            if (options.fixSpecificFile && f !== options.fixSpecificFile) {
                return;
            }
            if (f.endsWith('.ts')) {
                let content = lib_4.Helpers.readFile(f);
                const fixedComponent = lib_4.UtilsTypescript.transformComponentStandaloneOption(content);
                if (fixedComponent.trim() !== content.trim()) {
                    lib_4.Helpers.info(`Fixing standalone option in ${f}`);
                    lib_4.Helpers.writeFile(f, fixedComponent);
                }
            }
        });
        lib_4.Helpers.taskDone(`Done setting standalone property for ng19+...`);
        //#endregion
    }
    async importsWrap(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        lib_4.Helpers.info(`Wrapping first imports with imports region...`);
        lib_4.Helpers.getFilesFrom(this.project.pathFor(constants_1.srcMainProject), {
            recursive: true,
            followSymlinks: false,
        }).forEach(f => {
            if (options.fixSpecificFile && f !== options.fixSpecificFile) {
                return;
            }
            if (f.endsWith('.ts')) {
                let content = lib_4.Helpers.readFile(f);
                const fixedComponent = formatRegions(lib_4.UtilsTypescript.wrapFirstImportsInImportsRegion(content));
                if (fixedComponent.trim() !== content.trim()) {
                    lib_4.Helpers.info(`Fixing imports region in ${f}`);
                    lib_4.Helpers.writeFile(f, fixedComponent);
                }
            }
        });
        lib_4.Helpers.taskDone(`Done wrapping first imports with region...`);
        //#endregion
    }
    async flattenImports(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        lib_4.Helpers.info(`Flattening imports...`);
        lib_4.Helpers.getFilesFrom(this.project.pathFor(constants_1.srcMainProject), {
            recursive: true,
            followSymlinks: false,
        }).forEach(f => {
            if (options.fixSpecificFile && f !== options.fixSpecificFile) {
                return;
            }
            if (f.endsWith('.ts')) {
                let content = lib_4.Helpers.readFile(f);
                const fixedComponent = formatRegions(lib_4.UtilsTypescript.transformFlatImports(content, lib_1.TAON_FLATTEN_MAPPING));
                if (fixedComponent.trim() !== content.trim()) {
                    lib_4.Helpers.info(`Fixing imports region in ${f}`);
                    lib_4.Helpers.writeFile(f, fixedComponent);
                }
            }
        });
        lib_4.Helpers.taskDone(`Done flattening imports...`);
        //#endregion
    }
    async taonNames(options) {
        //#region @backendFunc
        const names = [
            ...lib_1.BaseTaonClassesNames,
            lib_2.Utils.escapeStringForRegEx('tnp-config'),
        ];
        options = this.prepareOptions(options);
        lib_4.Helpers.info(`Fixing taon class names...`);
        lib_4.Helpers.getFilesFrom(this.project.pathFor(constants_1.srcMainProject), {
            recursive: true,
            followSymlinks: false,
        }).forEach(f => {
            if (options.fixSpecificFile && f !== options.fixSpecificFile) {
                return;
            }
            if (f.endsWith('.ts')) {
                let content = lib_4.Helpers.readFile(f);
                let fixedComponent = content;
                for (const taonClassName of names) {
                    fixedComponent = fixedComponent
                        .replace(new RegExp(`(?<!Taon)${taonClassName}`, 'g'), `Taon${taonClassName}`)
                        .replace(new RegExp(`TaonTaon${taonClassName}`, 'g'), `Taon${taonClassName}`);
                }
                if (fixedComponent.trim() !== content.trim()) {
                    lib_4.Helpers.info(`Fixing taon class names in ${f}`);
                    lib_4.Helpers.writeFile(f, fixedComponent);
                }
            }
        });
        lib_4.Helpers.taskDone(`Done fixing taon class names...`);
        //#endregion
    }
    /**
     * Replaces self imports (imports using the package name) with proper relative paths.
     */
    async selfImports(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        lib_4.Helpers.info(`Using proper relative paths instead package full name...`);
        const baseLibPath = this.project.pathFor([constants_1.srcMainProject, constants_1.libFromSrc]);
        const projectNameForNpmPackage = this.project.nameForNpmPackage;
        const allSymbolsWithPathsAsValue = {};
        //#region gather all files
        const allFiles = lib_2.UtilsFilesFoldersSync.getFilesFrom(this.project.pathFor(constants_1.srcMainProject), {
            followSymlinks: false,
            recursive: true,
        });
        //#endregion
        //#region gather all symbols with paths
        for (const absFilePath of allFiles) {
            const content = lib_4.Helpers.readFile(absFilePath);
            const exportsFromFile = [
                ...lib_4.UtilsTypescript.exportsFromContent(content).map(e => e.name),
                ...lib_4.UtilsTypescript.exportsRedefinedFromContent(content).map(e => e.exportedName),
            ];
            exportsFromFile.forEach(exportElemName => {
                allSymbolsWithPathsAsValue[exportElemName] = absFilePath;
            });
        }
        //#endregion
        //#region fix imports
        allFiles
            .filter(f => f.startsWith(baseLibPath + '/'))
            .map(f => {
            const content = lib_4.Helpers.readFile(f);
            const imports = lib_4.UtilsTypescript.recognizeImportsFromContent(content);
            return {
                imports,
                filePath: f,
            };
        })
            .filter(f => f.imports?.length > 0 &&
            f.imports.some(i => i.type === 'import' &&
                i.cleanEmbeddedPathToFile?.startsWith(projectNameForNpmPackage + '/')))
            .forEach(f => {
            let content = lib_4.Helpers.readFile(f.filePath);
            let currentFileRelativePath = f.filePath.replace(baseLibPath + '/', '');
            const importsToFix = f.imports.filter(i => i.type === 'import' &&
                i.cleanEmbeddedPathToFile?.startsWith(projectNameForNpmPackage + '/'));
            const fixedImportsPaths = [];
            const toReplaceToNothing = [];
            for (const importInfo of importsToFix) {
                const importToDelete = importInfo.getStringPartFrom(content);
                toReplaceToNothing.push(importToDelete);
                for (const importElem of importInfo.importElements) {
                    const absPathForExport = allSymbolsWithPathsAsValue[importElem];
                    if (!absPathForExport) {
                        continue;
                    }
                    let exportFileRelativePath = absPathForExport.replace(baseLibPath + '/', '');
                    // mypath/to/file/here.ts
                    // mypath/to/other/file/there.ts
                    const relativeForExport = lib_4.UtilsTypescript.calculateRelativeImportPath(currentFileRelativePath, exportFileRelativePath);
                    fixedImportsPaths.push(`import { ${importElem} } from '${relativeForExport}';`);
                }
            }
            for (const reaplceLine of toReplaceToNothing) {
                content = content.replace(reaplceLine, ' ');
            }
            content = lib_4.UtilsTypescript.injectImportsIntoImportsRegion(content, fixedImportsPaths);
            const contentOnDisk = lib_4.Helpers.readFile(f.filePath);
            if (contentOnDisk && contentOnDisk?.trim() !== content?.trim()) {
                console.log(`FIXING CIRCULAR DEPS: ${f.filePath}`);
                lib_4.Helpers.writeFile(f.filePath, content);
            }
        });
        //#endregion
        lib_4.Helpers.taskDone(`Done wrapping first imports with region...`);
        await this.eslint(options);
        //#endregion
    }
    async classIntoNs(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        lib_4.Helpers.info(`Changing classes into namespaces..`);
        const baseLibPath = this.project.pathFor([constants_1.srcMainProject, constants_1.libFromSrc]);
        const projectNameForNpmPackage = this.project.nameForNpmPackage;
        const allSymbolsWithPathsAsValue = {};
        //#region gather all files
        const allFiles = lib_2.UtilsFilesFoldersSync.getFilesFrom(this.project.pathFor(constants_1.srcMainProject), {
            followSymlinks: false,
            recursive: true,
        });
        //#endregion
        allFiles.forEach(f => {
            if (!f.endsWith('.ts')) {
                return;
            }
            if (options.fixSpecificFile && f !== options.fixSpecificFile) {
                return;
            }
            let content = lib_4.Helpers.readFile(f);
            const fixedComponent = lib_4.UtilsTypescript.refactorClassToNamespace(content);
            if (fixedComponent.trim() !== content.trim()) {
                lib_4.Helpers.info(`Fixing classes into namespaces in ${f}`);
                lib_4.Helpers.writeFile(f, fixedComponent);
            }
        });
        lib_4.Helpers.taskDone(`Done wrapping first imports with region...`);
        //#endregion
    }
}
exports.Refactor = Refactor;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/refactor.js.map