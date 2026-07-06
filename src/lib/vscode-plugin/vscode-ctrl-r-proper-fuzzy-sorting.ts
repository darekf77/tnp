import { crossPlatformPath, fse, os, path, Utils } from 'tnp-core/src';
import type { ExtensionContext, QuickPickItem } from 'vscode';

type RecentWorkspace = {
  id: string;
  name: string;
  path: string;
  folders: string[];
  lastOpened: number;
  source: 'own' | 'vscode-import';
};

const DB_FILE = 'recent-workspaces.json';

const isAllowedAsRecent = (pathToFolder: string): boolean => {
  if (!pathToFolder) {
    return false;
  }
  const basename = path.basename(crossPlatformPath(pathToFolder));
  if (
    basename.startsWith('tmp-') ||
    basename.startsWith('dist-') ||
    basename === 'dist' ||
    basename === 'node_modules'
  ) {
    return false;
  }
  return true;
};

export async function activateRecentWorkspaces(
  context: ExtensionContext,
  vscode: typeof import('vscode'),
  frameworkName: 'taon' | 'tnp',
) {
  await vscode.workspace.fs.createDirectory(context.globalStorageUri);

  const db = await readOwnDb(context);

  const imported = await importFromVsCodeStorageJson();
  const merged = mergeRecent(db, imported);

  const current = getCurrentWorkspace();
  if (current) {
    merged.unshift(current);
  }

  await writeOwnDb(context, mergeRecent(merged, []));

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${frameworkName}.openRecentWorkspace`,
      async () => {
        const all = await readOwnDb(context);
        await openRecentQuickPick(all);
      },
    ),
  );

  function getCurrentWorkspace(): RecentWorkspace | undefined {
    const folders =
      vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) ?? [];

    if (!folders.length) {
      return;
    }

    const first = folders[0];

    if (!isAllowedAsRecent(first)) {
      return;
    }

    return {
      id: normalizeId(first),
      name: vscode.workspace.name || path.basename(first),
      path: first,
      folders,
      lastOpened: Date.now(),
      source: 'own',
    };
  }

  async function readOwnDb(
    context: ExtensionContext,
  ): Promise<RecentWorkspace[]> {
    const uri = vscode.Uri.joinPath(context.globalStorageUri, DB_FILE);

    try {
      const bytes = await vscode.workspace.fs.readFile(uri);
      const json = Buffer.from(bytes).toString('utf8');
      const data = JSON.parse(json);

      if (Array.isArray(data)) {
        return data;
      }
    } catch {}

    return [];
  }

  async function writeOwnDb(
    context: ExtensionContext,
    items: RecentWorkspace[],
  ) {
    const uri = vscode.Uri.joinPath(context.globalStorageUri, DB_FILE);
    const json = JSON.stringify(items.slice(0, 200), null, 2);

    await vscode.workspace.fs.writeFile(uri, Buffer.from(json, 'utf8'));
  }

  function mergeRecent(items: RecentWorkspace[], imported: RecentWorkspace[]) {
    const map = new Map<string, RecentWorkspace>();

    for (const item of [...items, ...imported]) {
      const id = item.id || normalizeId(item.path);
      const existing = map.get(id);

      if (!existing || item.lastOpened > existing.lastOpened) {
        map.set(id, {
          ...item,
          id,
        });
      }
    }

    return [...map.values()].sort((a, b) => b.lastOpened - a.lastOpened);
  }

  function normalizeId(p: string) {
    return path.normalize(p).toLowerCase();
  }

  // async function importFromVsCodeDbSafe(): Promise<RecentWorkspace[]> {
  //   try {
  //     const vscodeImportedRecentItems = await importFromVsCodeDb();
  //     console.log({ vscodeImportedRecentItems });
  //     return vscodeImportedRecentItems;
  //   } catch (err) {
  //     console.log(err);
  //     return [];
  //   }
  // }

  function getVsCodeStorageJsonPath(): string | undefined {
    if (process.platform === 'win32' && process.env.APPDATA) {
      return path.join(
        process.env.APPDATA,
        'Code',
        'User',
        'globalStorage',
        'storage.json',
      );
    }

    if (process.platform === 'darwin') {
      return path.join(
        os.homedir(),
        'Library',
        'Application Support',
        'Code',
        'User',
        'globalStorage',
        'storage.json',
      );
    }

    return path.join(
      os.homedir(),
      '.config',
      'Code',
      'User',
      'globalStorage',
      'storage.json',
    );
  }

  async function importFromVsCodeStorageJson(): Promise<RecentWorkspace[]> {
    const storageJsonPath = getVsCodeStorageJsonPath();

    if (!storageJsonPath || !fse.existsSync(storageJsonPath)) {
      return [];
    }

    const json = await fse.readJson(storageJsonPath);
    const folders = json['backupWorkspaces.folders'];

    if (!Array.isArray(folders)) {
      return [];
    }

    const result: RecentWorkspace[] = [];

    for (const entry of folders) {
      const fsPath = uriToFsPath(entry?.folderUri);

      if (!isAllowedAsRecent(fsPath)) {
        continue;
      }

      if (!fsPath) {
        continue;
      }

      result.push({
        id: normalizeId(fsPath),
        name: path.basename(fsPath),
        path: fsPath,
        folders: [fsPath],
        lastOpened: Date.now() - result.length,
        source: 'vscode-import',
      });
    }

    return mergeRecent(result, []);
  }

  // async function importFromVsCodeDb(): Promise<RecentWorkspace[]> {
  //   const sqljs = require('sql.js');
  //   const SQL = await sqljs();

  //   const dbPath = getVsCodeStateDbPath();
  //   console.log({ dbPath });
  //   if (!dbPath || !fse.existsSync(dbPath)) {
  //     return [];
  //   }

  //   const dbFile = fse.readFileSync(dbPath);
  //   const db = new SQL.Database(dbFile);

  //   const rows = db.exec(`
  //   select key, value
  //   from ItemTable
  //   where key like '%recent%'
  //      or key like '%Recently%'
  // `);
  //   console.log({ rows });
  //   const result: RecentWorkspace[] = [];

  //   for (const table of rows) {
  //     const keyIndex = table.columns.indexOf('key');
  //     const valueIndex = table.columns.indexOf('value');

  //     for (const row of table.values) {
  //       try {
  //         const valueRaw = row[valueIndex];

  //         if (typeof valueRaw !== 'string') {
  //           continue;
  //         }

  //         const value = JSON.parse(valueRaw);
  //         collectPathsFromUnknown(value, result);
  //       } catch {}
  //     }
  //   }

  //   db.close();

  //   return mergeRecent(result, []);
  // }

  function getVsCodeStateDbPath(): string | undefined {
    const appData = process.env.APPDATA;

    if (process.platform === 'win32' && appData) {
      return path.join(appData, 'Code', 'User', 'globalStorage', 'state.vscdb');
    }

    if (process.platform === 'darwin') {
      return path.join(
        os.homedir(),
        'Library',
        'Application Support',
        'Code',
        'User',
        'globalStorage',
        'state.vscdb',
      );
    }

    return path.join(
      os.homedir(),
      '.config',
      'Code',
      'User',
      'globalStorage',
      'state.vscdb',
    );
  }

  function collectPathsFromUnknown(value: any, out: RecentWorkspace[]) {
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        collectPathsFromUnknown(item, out);
      }
      return;
    }

    if (typeof value === 'object') {
      const uri =
        value.folderUri ||
        value.workspace ||
        value.workspaceUri ||
        value.fileUri ||
        value.path;

      const fsPath = uriToFsPath(uri);

      if (fsPath) {
        out.push({
          id: normalizeId(fsPath),
          name: path.basename(fsPath),
          path: fsPath,
          folders: [fsPath],
          lastOpened: Date.now() - out.length,
          source: 'vscode-import',
        });
      }

      for (const v of Object.values(value)) {
        collectPathsFromUnknown(v, out);
      }
    }
  }

  function uriToFsPath(value: any): string | undefined {
    if (!value) {
      return;
    }

    if (typeof value === 'string') {
      if (value.startsWith('file://')) {
        return vscode.Uri.parse(value).fsPath;
      }

      if (path.isAbsolute(value)) {
        return value;
      }
    }

    if (typeof value === 'object') {
      if (value.fsPath) {
        return value.fsPath;
      }

      if (value.path) {
        return value.path;
      }

      if (value.external) {
        return uriToFsPath(value.external);
      }
    }

    return;
  }

  type RecentPick = QuickPickItem & {
    item: RecentWorkspace;
  };

  async function openRecentQuickPick(all: RecentWorkspace[]) {
    // @ts-ignore
    const qp = vscode.window.createQuickPick<RecentPick>();

    qp.placeholder = '(taon.dev mod) Open recent workspace...';
    qp.matchOnDescription = false;
    qp.matchOnDetail = false;

    const update = (query: string) => {
      qp.items = rankRecent(all, query).map(item => ({
        label: item.name,
        description: item.path,
        detail:
          item.source === 'vscode-import' ? 'Imported from VSCode history' : '',
        item,
      }));
    };

    qp.onDidChangeValue(update);

    qp.onDidAccept(async () => {
      const picked = qp.selectedItems[0];
      qp.hide();

      if (!picked) {
        return;
      }

      await vscode.commands.executeCommand(
        'vscode.openFolder',
        vscode.Uri.file(picked.item.path),
        false,
      );
    });

    qp.onDidHide(() => qp.dispose());

    update('');
    qp.show();
  }

  function rankRecent(items: RecentWorkspace[], query: string) {
    const q = normalizeQuery(query);

    return [...items]
      .map(item => ({
        item,
        score: scoreRecent(item, q),
      }))
      .filter(x => !q || x.score > -999_000)
      .sort((a, b) => b.score - a.score)
      .map(x => x.item);
  }

  function scoreRecent(item: RecentWorkspace, q: string) {
    if (!q) {
      return item.lastOpened / 1_000_000;
    }

    const name = normalizeQuery(item.name);
    const full = normalizeQuery(item.path);
    const base = normalizeQuery(path.basename(item.path));

    let score = 0;

    // Exact always wins
    if (name === q) score += 100_000;
    if (base === q) score += 90_000;

    // Strong prefix
    if (name.startsWith(q)) score += 50_000;
    if (base.startsWith(q)) score += 45_000;

    // Contains
    if (name.includes(q)) score += 20_000;
    if (base.includes(q)) score += 18_000;
    if (full.includes(q)) score += 8_000;

    // Fuzzy subsequence
    const fuzzyName = fuzzySubsequenceScore(name, q);
    const fuzzyPath = fuzzySubsequenceScore(full, q);

    score += fuzzyName * 100;
    score += fuzzyPath * 20;

    // Recency bonus
    score += Math.min(5_000, item.lastOpened / 1_000_000_000);

    if (score <= 0) {
      return -1_000_000;
    }

    return score;
  }

  function normalizeQuery(value: string) {
    return value
      .toLowerCase()
      .replace(/\\/g, '/')
      .replace(/[_\s]+/g, '-')
      .trim();
  }

  function fuzzySubsequenceScore(text: string, query: string) {
    let ti = 0;
    let qi = 0;
    let score = 0;
    let streak = 0;

    while (ti < text.length && qi < query.length) {
      if (text[ti] === query[qi]) {
        streak++;
        score += 10 + streak * 5;

        const prev = text[ti - 1];
        if (
          !prev ||
          prev === '-' ||
          prev === '/' ||
          prev === '_' ||
          prev === ' '
        ) {
          score += 15;
        }

        qi++;
      } else {
        streak = 0;
      }

      ti++;
    }

    if (qi !== query.length) {
      return -10_000;
    }

    return score;
  }
}
