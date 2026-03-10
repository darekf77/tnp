import * as fs from 'node:fs/promises';

import {
  crossPlatformPath,
  Helpers,
  path,
  UtilsFilesFoldersSync,
} from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';

import { AiMdFile, parseAiMdContent } from './app-utils';

export namespace FrameworkUtils {
  //#region copy component for AI
  export async function copyToAiContent(
    absPathToFolder: string,
    onlyfiles: string[] = [],
  ): Promise<string> {
    //#region @backendFunc
    if (!Helpers.isFolder(absPathToFolder)) {
      absPathToFolder = crossPlatformPath(path.dirname(absPathToFolder));
    }
    const files = onlyfiles
      ? onlyfiles
      : UtilsFilesFoldersSync.getFilesFrom(absPathToFolder, {
          followSymlinks: false,
          recursive: false,
        });

    const content = `=== start of AI-MD multi-file markdown structure ===
${files
  .map(
    f => `# ${path.basename(f)}
\`\`\`${path.extname(f).replace('.', '')}
${UtilsFilesFoldersSync.readFile(f)}
\`\`\`
  `,
  )
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

  export async function pasteFromAIMDContentToFiles(
    absPathToFolder: string,
    MdAIcontent: string,
  ): Promise<AiMdFile[]> {
    //#region @backendFunc
    if (!Helpers.isFolder(absPathToFolder)) {
      absPathToFolder = crossPlatformPath(path.dirname(absPathToFolder));
    }

    const toProcess = parseAiMdContent(MdAIcontent);
    toProcess.forEach(f => {
      const fullPath = crossPlatformPath([absPathToFolder, f.filename]);
      UtilsFilesFoldersSync.writeFile(fullPath, f.content);
      UtilsTypescript.formatFile(fullPath);
    });

    return toProcess;
    //#endregion
  }

  //#endregion

  //#region copy tree
  type CopyTreeOptions = {
    omitPatterns?: string[]; // glob-ish: "node_modules", ".*", "*.log", "dist", "coverage", etc.
    maxDepth?: number; // default: Infinity
    includeFiles?: boolean; // default: true
    includeDirs?: boolean; // default: true (prints "folder/" lines too)
    followSymlinks?: boolean; // default: false
    sort?: 'alpha' | 'dirsFirst' | 'none'; // default: "dirsFirst"
  };

  function isGlobMatch(name: string, pattern: string): boolean {
    // minimal glob support: "*", ".*", "*.ext", "prefix*", "*suffix"
    // (If you want full globbing later, swap this for "picomatch".)
    if (pattern === '*') return true;

    // treat pattern as path segment matcher (not full path)
    // ".*" matches dotfiles/dirs
    if (pattern === '.*') return name.startsWith('.');

    const star = pattern.indexOf('*');
    if (star === -1) return name === pattern;

    const left = pattern.slice(0, star);
    const right = pattern.slice(star + 1);
    return name.startsWith(left) && name.endsWith(right);
  }

  function shouldOmit(name: string, omitPatterns: string[]): boolean {
    return omitPatterns.some(p => isGlobMatch(name, p));
  }

  async function pathIsFileOrDir(p: string): Promise<'file' | 'dir'> {
    const st = await fs.lstat(p);
    return st.isDirectory() ? 'dir' : 'file';
  }

  export async function copyTree(
    cwd: string,
    omitFolderPatterns: string[] = ['node_modules', '.*'],
    options: CopyTreeOptions = {},
  ): Promise<string> {
    //#region @backendFunc
    const {
      maxDepth = Infinity,
      includeFiles = true,
      includeDirs = false,
      followSymlinks = false,
      sort = 'dirsFirst',
      omitPatterns = omitFolderPatterns,
    } = options;

    const kind = await pathIsFileOrDir(cwd);
    const rootDir = kind === 'file' ? path.dirname(cwd) : cwd;

    const lines: string[] = [];

    async function walk(dirAbs: string, depth: number) {
      if (depth > maxDepth) return;

      let entries = await fs.readdir(dirAbs, { withFileTypes: true });

      // filter omitted
      entries = entries.filter(e => !shouldOmit(e.name, omitPatterns));

      // sorting
      if (sort !== 'none') {
        entries.sort((a, b) => {
          if (sort === 'alpha') return a.name.localeCompare(b.name);
          // dirsFirst
          const ad = a.isDirectory() ? 0 : 1;
          const bd = b.isDirectory() ? 0 : 1;
          if (ad !== bd) return ad - bd;
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
            if (includeFiles) lines.push(`|${rel}@`);
            continue;
          }
          // follow symlink target
          const st = await fs.stat(abs).catch(() => null);
          if (!st) continue;
          if (st.isDirectory()) {
            if (includeDirs) lines.push(`|${rel}/`);
            await walk(abs, depth + 1);
          } else {
            if (includeFiles) lines.push(`|${rel}`);
          }
          continue;
        }

        if (isDir) {
          if (includeDirs) lines.push(`|${rel}/`);
          await walk(abs, depth + 1);
        } else {
          if (includeFiles) lines.push(`|${rel}`);
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
}
