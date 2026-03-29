import * as fs from 'node:fs/promises';
import { crossPlatformPath, path, Helpers__NS__isFolder, UtilsFilesFoldersSync__NS__getFilesFrom, UtilsFilesFoldersSync__NS__readFile, UtilsFilesFoldersSync__NS__writeFile } from 'tnp-core/lib-prod';
import { UtilsTypescript__NS__formatFile } from 'tnp-helpers/lib-prod';
import { parseAiMdContent } from './app-utils';
//namespace FrameworkUtils
//#region copy component for AI
export async function FrameworkUtils__NS__copyToAiContent(absPathToFolder, onlyfiles = []) {
    //#region @backendFunc
    if (!Helpers__NS__isFolder(absPathToFolder)) {
        absPathToFolder = crossPlatformPath(path.dirname(absPathToFolder));
    }
    const files = onlyfiles
        ? onlyfiles
        : UtilsFilesFoldersSync__NS__getFilesFrom(absPathToFolder, {
            followSymlinks: false,
            recursive: false,
        });
    const content = `=== start of AI-MD multi-file markdown structure ===
${files
        .map(f => `# ${path.basename(f)}
\`\`\`${path.extname(f).replace('.', '')}
${UtilsFilesFoldersSync__NS__readFile(f)}
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
export async function FrameworkUtils__NS__pasteFromAIMDContentToFiles(absPathToFolder, MdAIcontent) {
    //#region @backendFunc
    if (!Helpers__NS__isFolder(absPathToFolder)) {
        absPathToFolder = crossPlatformPath(path.dirname(absPathToFolder));
    }
    const toProcess = parseAiMdContent(MdAIcontent);
    toProcess.forEach(f => {
        const fullPath = crossPlatformPath([absPathToFolder, f.filename]);
        UtilsFilesFoldersSync__NS__writeFile(fullPath, f.content);
        UtilsTypescript__NS__formatFile(fullPath);
    });
    return toProcess;
    //#endregion
}
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
export async function FrameworkUtils__NS__copyTree(cwd, omitFolderPatterns = ['node_modules', '.*'], options = {}) {
    //#region @backendFunc
    const { maxDepth = Infinity, includeFiles = true, includeDirs = false, followSymlinks = false, sort = 'dirsFirst', omitPatterns = omitFolderPatterns, } = options;
    const kind = await pathIsFileOrDir(cwd);
    const rootDir = kind === 'file' ? path.dirname(cwd) : cwd;
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
            const abs = path.join(dirAbs, e.name);
            const rel = path.relative(rootDir, abs).split(path.sep).join('/'); // posix-like output
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
//#endregion
//end of namespace FrameworkUtils
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/framework-utils.js.map