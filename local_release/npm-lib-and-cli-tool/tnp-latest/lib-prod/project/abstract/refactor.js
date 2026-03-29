//#region imports
import { BaseTaonClassesNames, TAON_FLATTEN_MAPPING } from 'taon/lib-prod';
import { frontendFiles, Utils__NS__escapeStringForRegEx, UtilsFilesFoldersSync__NS__getFilesFrom } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, ___NS__isUndefined } from 'tnp-core/lib-prod';
import { Helpers__NS__exists, Helpers__NS__getFilesFrom, Helpers__NS__info, Helpers__NS__readFile, Helpers__NS__removeFileIfExists, Helpers__NS__taskDone, Helpers__NS__writeFile, UtilsTypescript__NS__calculateRelativeImportPath, UtilsTypescript__NS__eslintFixAllFilesInsideFolderAsync, UtilsTypescript__NS__eslintFixFile, UtilsTypescript__NS__exportsFromContent, UtilsTypescript__NS__exportsRedefinedFromContent, UtilsTypescript__NS__fixHtmlTemplatesInDir, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__injectImportsIntoImportsRegion, UtilsTypescript__NS__recognizeImportsFromContent, UtilsTypescript__NS__refactorClassToNamespace, UtilsTypescript__NS__transformComponentStandaloneOption, UtilsTypescript__NS__transformFlatImports, UtilsTypescript__NS__wrapFirstImportsInImportsRegion } from 'tnp-helpers/lib-prod';
import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';
import { libFromSrc, srcMainProject } from '../../constants';
//#endregion
//#region format regions
/**
 * QUICK_FIX for spaces after and before each region
 * Formats TypeScript region comments:
 * - Ensures a blank line BEFORE each #region / region
 * - Ensures a blank line AFTER each #endregion / endregion
 *   (but skips the "after" blank line if it's the final region before a closing })
 */
export function formatRegions(code) {
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
export class Refactor extends BaseFeatureForProject {
    //#region prepare options
    prepareOptions(options) {
        options = options || {};
        if (options.fixSpecificFile) {
            if (path.isAbsolute(options.fixSpecificFile) &&
                Helpers__NS__exists(options.fixSpecificFile)) {
                // ok
            }
            else {
                options.fixSpecificFile = this.project.pathFor(options.fixSpecificFile);
                if (path.isAbsolute(options.fixSpecificFile) &&
                    Helpers__NS__exists(options.fixSpecificFile)) {
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
        Helpers__NS__info(`Running prettier...`);
        if (options.fixSpecificFile) {
            await UtilsTypescript__NS__formatFile(options.fixSpecificFile);
            Helpers__NS__info(`Prettier done for file ${options.fixSpecificFile}`);
            return;
        }
        UtilsTypescript__NS__fixHtmlTemplatesInDir(this.project.pathFor(srcMainProject));
        this.project.formatAllFiles();
        Helpers__NS__info(`Prettier done`);
        //#endregion
    }
    async eslint(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        Helpers__NS__info(`Running eslint fix...`);
        if (options.fixSpecificFile) {
            await UtilsTypescript__NS__eslintFixFile(options.fixSpecificFile);
            Helpers__NS__info(`Eslint fix done for file ${options.fixSpecificFile}`);
            return;
        }
        await UtilsTypescript__NS__eslintFixAllFilesInsideFolderAsync([
            this.project.pathFor(srcMainProject),
        ]);
        Helpers__NS__info(`Eslint fix done`);
        //#endregion
    }
    async removeBrowserRegion(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        Helpers__NS__info(`Running ${'@bro' + 'wser'} region fixer...`);
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
        Helpers__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
            recursive: true,
            // followSymlinks: false TODO ? maybe ?
        })
            .filter(f => {
            return (f.endsWith('.ts') &&
                !___NS__isUndefined(frontendFiles.find(ff => path.basename(f).endsWith(ff))));
        })
            .forEach(f => {
            let content = Helpers__NS__readFile(f);
            if (content) {
                const fixedContent = removeBrowserRegion(content);
                if (fixedContent.trim() !== content.trim()) {
                    Helpers__NS__info(`Removing browser region from ${f}`);
                    Helpers__NS__writeFile(f, fixedContent);
                }
            }
        });
        Helpers__NS__taskDone(`@browser region fixer done`);
        //#endregion
    }
    async changeCssToScss(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        Helpers__NS__info(`Changing css to scss replacer.`);
        Helpers__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
            recursive: true,
            followSymlinks: false,
        }).forEach(f => {
            if (options.fixSpecificFile && f !== options.fixSpecificFile) {
                return;
            }
            const tsFile = crossPlatformPath([
                path.dirname(f),
                path.basename(f).replace('.css', '.ts'),
            ]);
            const tsFileCmp = crossPlatformPath([
                path.dirname(f),
                path.basename(f).replace('.css', '.component.ts'),
            ]);
            const tsFileContainer = crossPlatformPath([
                path.dirname(f),
                path.basename(f).replace('.css', '.container.ts'),
            ]);
            if (f.endsWith('.css') &&
                (Helpers__NS__exists(tsFile) ||
                    Helpers__NS__exists(tsFileCmp) ||
                    Helpers__NS__exists(tsFileContainer))) {
                Helpers__NS__writeFile(crossPlatformPath([
                    path.dirname(f),
                    path.basename(f).replace('.css', '.scss'),
                ]), Helpers__NS__readFile(f));
                Helpers__NS__removeFileIfExists(f);
                const scssBaseName = path.basename(f).replace('.css', '.scss');
                if (Helpers__NS__exists(tsFile)) {
                    Helpers__NS__writeFile(tsFile, (Helpers__NS__readFile(tsFile) || '').replace(path.basename(f), scssBaseName));
                }
                if (Helpers__NS__exists(tsFileCmp)) {
                    Helpers__NS__writeFile(tsFileCmp, (Helpers__NS__readFile(tsFileCmp) || '').replace(path.basename(f), scssBaseName));
                }
                if (Helpers__NS__exists(tsFileContainer)) {
                    Helpers__NS__writeFile(tsFileContainer, (Helpers__NS__readFile(tsFileContainer) || '').replace(path.basename(f), scssBaseName));
                }
            }
        });
        Helpers__NS__taskDone(`Changing css to scss done`);
        //#endregion
    }
    async properStandaloneNg19(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        Helpers__NS__info(`Setting proper standalone property for ng19+...`);
        Helpers__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
            recursive: true,
            followSymlinks: false,
        }).forEach(f => {
            if (options.fixSpecificFile && f !== options.fixSpecificFile) {
                return;
            }
            if (f.endsWith('.ts')) {
                let content = Helpers__NS__readFile(f);
                const fixedComponent = UtilsTypescript__NS__transformComponentStandaloneOption(content);
                if (fixedComponent.trim() !== content.trim()) {
                    Helpers__NS__info(`Fixing standalone option in ${f}`);
                    Helpers__NS__writeFile(f, fixedComponent);
                }
            }
        });
        Helpers__NS__taskDone(`Done setting standalone property for ng19+...`);
        //#endregion
    }
    async importsWrap(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        Helpers__NS__info(`Wrapping first imports with imports region...`);
        Helpers__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
            recursive: true,
            followSymlinks: false,
        }).forEach(f => {
            if (options.fixSpecificFile && f !== options.fixSpecificFile) {
                return;
            }
            if (f.endsWith('.ts')) {
                let content = Helpers__NS__readFile(f);
                const fixedComponent = formatRegions(UtilsTypescript__NS__wrapFirstImportsInImportsRegion(content));
                if (fixedComponent.trim() !== content.trim()) {
                    Helpers__NS__info(`Fixing imports region in ${f}`);
                    Helpers__NS__writeFile(f, fixedComponent);
                }
            }
        });
        Helpers__NS__taskDone(`Done wrapping first imports with region...`);
        //#endregion
    }
    async flattenImports(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        Helpers__NS__info(`Flattening imports...`);
        Helpers__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
            recursive: true,
            followSymlinks: false,
        }).forEach(f => {
            if (options.fixSpecificFile && f !== options.fixSpecificFile) {
                return;
            }
            if (f.endsWith('.ts')) {
                let content = Helpers__NS__readFile(f);
                const fixedComponent = formatRegions(UtilsTypescript__NS__transformFlatImports(content, TAON_FLATTEN_MAPPING));
                if (fixedComponent.trim() !== content.trim()) {
                    Helpers__NS__info(`Fixing imports region in ${f}`);
                    Helpers__NS__writeFile(f, fixedComponent);
                }
            }
        });
        Helpers__NS__taskDone(`Done flattening imports...`);
        //#endregion
    }
    async taonNames(options) {
        //#region @backendFunc
        const names = [
            ...BaseTaonClassesNames,
            Utils__NS__escapeStringForRegEx('tnp-config'),
        ];
        options = this.prepareOptions(options);
        Helpers__NS__info(`Fixing taon class names...`);
        Helpers__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
            recursive: true,
            followSymlinks: false,
        }).forEach(f => {
            if (options.fixSpecificFile && f !== options.fixSpecificFile) {
                return;
            }
            if (f.endsWith('.ts')) {
                let content = Helpers__NS__readFile(f);
                let fixedComponent = content;
                for (const taonClassName of names) {
                    fixedComponent = fixedComponent
                        .replace(new RegExp(`(?<!Taon)${taonClassName}`, 'g'), `Taon${taonClassName}`)
                        .replace(new RegExp(`TaonTaon${taonClassName}`, 'g'), `Taon${taonClassName}`);
                }
                if (fixedComponent.trim() !== content.trim()) {
                    Helpers__NS__info(`Fixing taon class names in ${f}`);
                    Helpers__NS__writeFile(f, fixedComponent);
                }
            }
        });
        Helpers__NS__taskDone(`Done fixing taon class names...`);
        //#endregion
    }
    /**
     * Replaces self imports (imports using the package name) with proper relative paths.
     */
    async selfImports(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        Helpers__NS__info(`Using proper relative paths instead package full name...`);
        const baseLibPath = this.project.pathFor([srcMainProject, libFromSrc]);
        const projectNameForNpmPackage = this.project.nameForNpmPackage;
        const allSymbolsWithPathsAsValue = {};
        //#region gather all files
        const allFiles = UtilsFilesFoldersSync__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
            followSymlinks: false,
            recursive: true,
        });
        //#endregion
        //#region gather all symbols with paths
        for (const absFilePath of allFiles) {
            const content = Helpers__NS__readFile(absFilePath);
            const exportsFromFile = [
                ...UtilsTypescript__NS__exportsFromContent(content).map(e => e.name),
                ...UtilsTypescript__NS__exportsRedefinedFromContent(content).map(e => e.exportedName),
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
            const content = Helpers__NS__readFile(f);
            const imports = UtilsTypescript__NS__recognizeImportsFromContent(content);
            return {
                imports,
                filePath: f,
            };
        })
            .filter(f => f.imports?.length > 0 &&
            f.imports.some(i => i.type === 'import' &&
                i.cleanEmbeddedPathToFile?.startsWith(projectNameForNpmPackage + '/')))
            .forEach(f => {
            let content = Helpers__NS__readFile(f.filePath);
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
                    const relativeForExport = UtilsTypescript__NS__calculateRelativeImportPath(currentFileRelativePath, exportFileRelativePath);
                    fixedImportsPaths.push(`import { ${importElem} } from '${relativeForExport}';`);
                }
            }
            for (const reaplceLine of toReplaceToNothing) {
                content = content.replace(reaplceLine, ' ');
            }
            content = UtilsTypescript__NS__injectImportsIntoImportsRegion(content, fixedImportsPaths);
            const contentOnDisk = Helpers__NS__readFile(f.filePath);
            if (contentOnDisk && contentOnDisk?.trim() !== content?.trim()) {
                console.log(`FIXING CIRCULAR DEPS: ${f.filePath}`);
                Helpers__NS__writeFile(f.filePath, content);
            }
        });
        //#endregion
        Helpers__NS__taskDone(`Done wrapping first imports with region...`);
        await this.eslint(options);
        //#endregion
    }
    async classIntoNs(options) {
        //#region @backendFunc
        options = this.prepareOptions(options);
        Helpers__NS__info(`Changing classes into namespaces..`);
        const baseLibPath = this.project.pathFor([srcMainProject, libFromSrc]);
        const projectNameForNpmPackage = this.project.nameForNpmPackage;
        const allSymbolsWithPathsAsValue = {};
        //#region gather all files
        const allFiles = UtilsFilesFoldersSync__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
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
            let content = Helpers__NS__readFile(f);
            const fixedComponent = UtilsTypescript__NS__refactorClassToNamespace(content);
            if (fixedComponent.trim() !== content.trim()) {
                Helpers__NS__info(`Fixing classes into namespaces in ${f}`);
                Helpers__NS__writeFile(f, fixedComponent);
            }
        });
        Helpers__NS__taskDone(`Done wrapping first imports with region...`);
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/refactor.js.map