"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameworkUtils = void 0;
const fs = require("node:fs/promises");
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const app_utils_1 = require("./app-utils");
var FrameworkUtils;
(function (FrameworkUtils) {
    //#region copy component for AI
    async function copyToAiContent(absPathToFolder, onlyfiles = []) {
        //#region @backendFunc
        if (!lib_1.Helpers.isFolder(absPathToFolder)) {
            absPathToFolder = (0, lib_1.crossPlatformPath)(lib_1.path.dirname(absPathToFolder));
        }
        const files = onlyfiles
            ? onlyfiles
            : lib_1.UtilsFilesFoldersSync.getFilesFrom(absPathToFolder, {
                followSymlinks: false,
                recursive: false,
            });
        const content = `=== start of AI-MD multi-file markdown structure ===
${files
            .map(f => `# ${lib_1.path.basename(f)}
\`\`\`${lib_1.path.extname(f).replace('.', '')}
${lib_1.UtilsFilesFoldersSync.readFile(f)}
\`\`\`
  `)
            .join('\n')}
=== end of AI-MD multi-file markdown structure ===

IMPORTANT:
You are operating in AI-MD multi-file mode.
If the structure is not preserved, the output is invalid.
Example output response structure:

=== start of AI-MD multi-file markdown structure ===
any-filename.extension
\`\`\`extension
code of any-filename.extension
\`\`\`

any-filename-next.any-other-extension
\`\`\`any-other-extension
code of any-filename-next.any-other-extension
\`\`\`
=== end of AI-MD multi-file markdown structure ===

Keep structure flat: any-filename.extension is just basename.
Just like any-filename-next.any-other-extension...
Use ONE OUTPUT MARKDOWN CODE BOX FIELD for the whole response.

    `;
        return content;
        //#endregion
    }
    FrameworkUtils.copyToAiContent = copyToAiContent;
    async function pasteFromAIMDContentToFiles(absPathToFolder, MdAIcontent) {
        //#region @backendFunc
        if (!lib_1.Helpers.isFolder(absPathToFolder)) {
            absPathToFolder = (0, lib_1.crossPlatformPath)(lib_1.path.dirname(absPathToFolder));
        }
        const toProcess = (0, app_utils_1.parseAiMdContent)(MdAIcontent);
        toProcess.forEach(f => {
            const fullPath = (0, lib_1.crossPlatformPath)([absPathToFolder, f.filename]);
            lib_1.UtilsFilesFoldersSync.writeFile(fullPath, f.content);
            lib_2.UtilsTypescript.formatFile(fullPath);
        });
        return toProcess;
        //#endregion
    }
    FrameworkUtils.pasteFromAIMDContentToFiles = pasteFromAIMDContentToFiles;
    function isGlobMatch(name, pattern) {
        // minimal glob support: "*", ".*", "*.ext", "prefix*", "*suffix"
        // (If you want full globbing later, swap this for "picomatch".)
        if (pattern === '*')
            return true;
        // treat pattern as path segment matcher (not full path)
        // ".*" matches dotfiles/dirs
        if (pattern === '.*')
            return name.startsWith('.');
        const star = pattern.indexOf('*');
        if (star === -1)
            return name === pattern;
        const left = pattern.slice(0, star);
        const right = pattern.slice(star + 1);
        return name.startsWith(left) && name.endsWith(right);
    }
    function shouldOmit(name, omitPatterns) {
        return omitPatterns.some(p => isGlobMatch(name, p));
    }
    async function pathIsFileOrDir(p) {
        const st = await fs.lstat(p);
        return st.isDirectory() ? 'dir' : 'file';
    }
    async function copyTree(cwd, omitFolderPatterns = ['node_modules', '.*'], options = {}) {
        //#region @backendFunc
        const { maxDepth = Infinity, includeFiles = true, includeDirs = false, followSymlinks = false, sort = 'dirsFirst', omitPatterns = omitFolderPatterns, } = options;
        const kind = await pathIsFileOrDir(cwd);
        const rootDir = kind === 'file' ? lib_1.path.dirname(cwd) : cwd;
        const lines = [];
        async function walk(dirAbs, depth) {
            if (depth > maxDepth)
                return;
            let entries = await fs.readdir(dirAbs, { withFileTypes: true });
            // filter omitted
            entries = entries.filter(e => !shouldOmit(e.name, omitPatterns));
            // sorting
            if (sort !== 'none') {
                entries.sort((a, b) => {
                    if (sort === 'alpha')
                        return a.name.localeCompare(b.name);
                    // dirsFirst
                    const ad = a.isDirectory() ? 0 : 1;
                    const bd = b.isDirectory() ? 0 : 1;
                    if (ad !== bd)
                        return ad - bd;
                    return a.name.localeCompare(b.name);
                });
            }
            for (const e of entries) {
                const abs = lib_1.path.join(dirAbs, e.name);
                const rel = lib_1.path.relative(rootDir, abs).split(lib_1.path.sep).join('/'); // posix-like output
                const isDir = e.isDirectory();
                // symlink handling
                if (e.isSymbolicLink()) {
                    if (!followSymlinks) {
                        // show it as a file-like entry (optional)
                        if (includeFiles)
                            lines.push(`|${rel}@`);
                        continue;
                    }
                    // follow symlink target
                    const st = await fs.stat(abs).catch(() => null);
                    if (!st)
                        continue;
                    if (st.isDirectory()) {
                        if (includeDirs)
                            lines.push(`|${rel}/`);
                        await walk(abs, depth + 1);
                    }
                    else {
                        if (includeFiles)
                            lines.push(`|${rel}`);
                    }
                    continue;
                }
                if (isDir) {
                    if (includeDirs)
                        lines.push(`|${rel}/`);
                    await walk(abs, depth + 1);
                }
                else {
                    if (includeFiles)
                        lines.push(`|${rel}`);
                }
            }
        }
        await walk(rootDir, 0);
        // If you want to show root itself, uncomment:
        // lines.unshift(`|${path.basename(rootDir)}/`);
        return lines.join('\n');
        //#endregion
    }
    FrameworkUtils.copyTree = copyTree;
    //#endregion
})(FrameworkUtils || (exports.FrameworkUtils = FrameworkUtils = {}));
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/framework-utils.js.map