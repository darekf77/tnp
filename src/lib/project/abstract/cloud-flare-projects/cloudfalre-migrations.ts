//#region imports
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { Models, TaonHelpers } from 'taon/src';
import {
  chalk,
  crossPlatformPath,
  Helpers,
  path,
  spawn,
  UtilsExecProc,
  UtilsFilesFoldersSync,
  UtilsTempFolder,
  UtilsTerminal,
} from 'tnp-core/src';
//#endregion

const execFileAsync = promisify(execFile);

//#region models

export type MigrationStatus = 'pending' | 'completed';

export interface RemoteMigration {
  id: number;
  name: string;
  context: string;
  applied_at: string | null;
  status: MigrationStatus;
}

export interface MigrationRegion {
  name: string;
  sql: string;
}

export interface MigrationPlan {
  sql: string;
  pending: string[];
  newMigrations: string[];
  skipped: string[];
}

interface WranglerD1Result {
  success: boolean;
  results?: RemoteMigration[];
  error?: string;
}
//#endregion

//#region split migration sql
export function splitMigrationSql(
  sql: string,
  context: string,
): {
  schemaSql: string;
  migrations: MigrationRegion[];
} {
  //#region @backendFunc
  const lines = sql.replace(/\r\n?/g, '\n').split('\n');

  const schemaLines: string[] = [];
  const migrations: MigrationRegion[] = [];

  const regionStack: {
    name: string;
    lines: string[];
  }[] = [];

  const startRegion = new RegExp(`^\\s*--\\s*#reg` + `ion\\s+(.+?)\\s*$`);
  const endRegion = new RegExp(
    `^\\s*--\\s*#end` + `reg` + `ion(?:\\s+(.+?))?\\s*$`,
  );

  let foundContext = false;

  for (const line of lines) {
    const start = line.match(startRegion);
    const end = line.match(endRegion);

    if (start) {
      const name = start[1].trim();

      if (regionStack.length >= 2) {
        throw new Error(`Nested SQL migration: ${name}`);
      }

      regionStack.push({
        name,
        lines: [],
      });

      if (regionStack.length === 1 && name === context) {
        if (foundContext) {
          throw new Error(`Duplicate SQL context region: ${context}`);
        }
        foundContext = true;
      }

      continue;
    }

    if (end) {
      if (regionStack.length === 0) {
        throw new Error('Unexpected SQL migration end region');
      }

      const region = regionStack.pop()!;
      const endName = end[1]?.trim();

      if (endName && endName !== region.name) {
        throw new Error(`SQL region mismatch: ${region.name} / ${endName}`);
      }

      // Level 2: migration belonging to requested context.
      if (regionStack.length === 1) {
        const parentContext = regionStack[0].name;

        if (parentContext === context) {
          if (migrations.some(m => m.name === region.name)) {
            throw new Error(`Duplicate migration region: ${region.name}`);
          }

          migrations.push({
            name: region.name,
            sql: region.lines.join('\n').trim(),
          });
        }

        continue;
      }

      // Level 1: context region.
      if (regionStack.length === 0) {
        if (region.name === context) {
          schemaLines.push(...region.lines);
        }

        continue;
      }
    }

    // SQL inside a migration.
    if (regionStack.length === 2) {
      regionStack[1].lines.push(line);
      continue;
    }

    // SQL directly inside a context (schema).
    if (regionStack.length === 1) {
      regionStack[0].lines.push(line);
      continue;
    }

    // Global schema SQL.
    schemaLines.push(line);
  }

  if (regionStack.length > 0) {
    throw new Error(
      `Unclosed SQL region: ${regionStack[regionStack.length - 1].name}`,
    );
  }

  return {
    schemaSql: schemaLines.join('\n').trim(),
    migrations,
  };
  //#endregion
}
//#endregion

//#region execute wranglet quyer
export const executeWranglerQuery = async <T = unknown>(
  sqlQuery: string,
  cwdWorker: string,
): Promise<T> => {
  const child = spawn(
    './node_modules/.bin/wrangler',
    ['d1', 'execute', 'TAON_D1', '--remote', '--json', '--command', sqlQuery],
    {
      cwd: cwdWorker,
      shell: false,
      stdio: 'pipe',
      env: {
        ...process.env,
        CI: 'true',
        NO_COLOR: '1',
        FORCE_COLOR: '0',
      },
    },
  );

  let stdout = '';
  let stderr = '';

  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');

  child.stdout.on('data', chunk => {
    stdout += chunk;
  });

  child.stderr.on('data', chunk => {
    stderr += chunk;
  });

  const exitCode = await new Promise<number>((resolve, reject) => {
    child.once('error', reject);

    // 'close' ensures stdout/stderr streams have finished.
    child.once('close', code => resolve(code ?? -1));
  });

  if (exitCode !== 0) {
    throw new Error(
      `Wrangler failed (exit code ${exitCode})\n` +
        `STDOUT:\n${stdout}\nSTDERR:\n${stderr}`,
    );
  }

  const result = parseJsonText<T>(stdout);

  if (typeof result === 'string') {
    throw new Error(`Wrangler did not return valid JSON:\n${stdout}`);
  }

  return result;
};
//#endregion

//#region prepare pending migration sql
/**
 * For a pending migration, remove the initial migration-meta INSERT.
 *
 * The row already exists remotely.
 * Keep the final UPDATE that marks it completed.
 */
function preparePendingMigrationSql(sql: string): string {
  const lines = sql.split('\n');

  let removed = 0;

  const result = lines.filter(line => {
    const isMigrationInsert =
      /^\s*INSERT\s+INTO\s+["'`]?TAON_MIGRATION_META["'`]?\s*\(/i.test(line);

    if (isMigrationInsert) {
      removed++;
      return false;
    }

    return true;
  });

  if (removed !== 1) {
    throw new Error(`Expected one migration metadata INSERT, found ${removed}`);
  }

  return result.join('\n').trim();
}
//#endregion

//#region get remote migrations
export async function getRemoteMigrations(options: {
  cwdWorker: string;
  contextName?: string;
}): Promise<RemoteMigration[]> {
  //#region @backendFunc
  const { cwdWorker, contextName } = options;

  const query = contextName
    ? `SELECT * FROM TAON_MIGRATION_META WHERE context = '${contextName}' ORDER BY id`
    : `SELECT * FROM TAON_MIGRATION_META ORDER BY id`;

  try {
    var response = await executeWranglerQuery<WranglerD1Result[]>(
      query,
      cwdWorker,
    );
  } catch (error) {
    const notDepoyed = `Couldn't find an auto-provisioned D1`;
    if (error instanceof Error && error.message?.includes(notDepoyed)) {
      Helpers.info(`Worker deployed yet`);
      return [];
    }
    console.error(error);
    Helpers.error(`Failed deployment`, false, true);
  }

  if (!Array.isArray(response) || response.length !== 1) {
    throw new Error('Unexpected Wrangler D1 response');
  }

  const first = response[0];

  if (!first.success) {
    throw new Error(first.error || 'Remote D1 query failed');
  }

  const migrations = first.results || [];

  Helpers.logInfo(`

    Remote migrations length: ${migrations.length}

    `);

  for (const migration of migrations) {
    if (migration.status !== 'pending' && migration.status !== 'completed') {
      throw new Error(
        `Unknown migration status "${migration.status}" for ${migration.name}`,
      );
    }
  }

  return migrations;
  //#endregion
}
//#endregion

//#region parse json text
function parseJsonText<T = unknown>(text: string): T | string {
  // First, try parsing the entire text.
  try {
    return JSON.parse(text) as T;
  } catch {}

  // Remove ANSI escape sequences for searching.
  const clean = text.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');

  // Find the first valid JSON object or array.
  for (let start = 0; start < clean.length; start++) {
    const opening = clean[start];

    if (opening !== '{' && opening !== '[') {
      continue;
    }

    const stack: string[] = [];
    let inString = false;
    let escaped = false;

    for (let i = start; i < clean.length; i++) {
      const char = clean[i];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
      } else if (char === '{') {
        stack.push('}');
      } else if (char === '[') {
        stack.push(']');
      } else if (char === '}' || char === ']') {
        if (stack.pop() !== char) {
          break;
        }

        if (stack.length === 0) {
          const candidate = clean.slice(start, i + 1);

          try {
            return JSON.parse(candidate) as T;
          } catch {
            break;
          }
        }
      }
    }
  }

  // No JSON found — return the original text unchanged.
  return text;
}
//#endregion

//#region get SQL for deployment
export function getSqlFor(
  sql: string,
  mode: Models.DBRecreateMode,
  contextName: string,
  remoteMigrations: RemoteMigration[] = [],
): MigrationPlan {
  //#region @backendFunc
  const { schemaSql, migrations } = splitMigrationSql(sql, contextName);

  const pending: string[] = [];
  const newMigrations: string[] = [];
  const skipped: string[] = [];

  const pendingSql: string[] = [];
  const newSql: string[] = [];

  const remoteByName = new Map(remoteMigrations.map(m => [m.name, m]));

  if (mode === Models.DBRecreateMode.DROP_DB__RUN_MIGRATIONS) {
    return {
      sql:
        [schemaSql, ...migrations.map(m => m.sql)]
          .filter(Boolean)
          .join('\n\n')
          .trim() + '\n',
      pending,
      newMigrations: migrations.map(m => m.name),
      skipped,
    };
  }

  if (mode !== Models.DBRecreateMode.PRESERVE_DATA__RUN_MIGRATIONS) {
    throw new Error(`Unsupported DB recreate mode: ${mode}`);
  }

  for (const migration of migrations) {
    const remote = remoteByName.get(migration.name);

    if (remote?.status === 'completed') {
      skipped.push(migration.name);
      continue;
    }

    if (remote?.status === 'pending') {
      pending.push(migration.name);
      pendingSql.push(preparePendingMigrationSql(migration.sql));
      continue;
    }

    newMigrations.push(migration.name);
    newSql.push(migration.sql);
  }

  // Match ContextDbMigrations:
  // pending migrations first, then new migrations.
  const finalSql = [...pendingSql, ...newSql]
    .filter(Boolean)
    .join('\n\n')
    .trim();

  return {
    sql: finalSql ? finalSql + '\n' : '',
    pending,
    newMigrations,
    skipped,
  };
  //#endregion
}
//#endregion

//#region prepare remote deployment SQL
export async function prepareRemoteDeploymentSql(options: {
  mode: Models.DBRecreateMode;
  sql: string;
  cwdWorker: string;
  contextName?: string;
}): Promise<MigrationPlan> {
  //#region @backendFunc
  const { mode, sql, cwdWorker, contextName } = options;

  if (mode === Models.DBRecreateMode.DROP_DB__RUN_MIGRATIONS) {
    return getSqlFor(sql, mode, contextName);
  }

  const remoteMigrations = await getRemoteMigrations({
    cwdWorker,
    contextName,
  });

  return getSqlFor(sql, mode, contextName, remoteMigrations);
  //#endregion
}
//#endregion

//#region execture remote migration sql
export async function executeRemoteMigrationSql(
  sql: string,
  cwdWorker: string,
  contextNameForMigration?: string,
): Promise<void> {
  //#region @backendFunc
  if (!sql.trim()) return;

  const sqlFileAbs = crossPlatformPath([
    cwdWorker,
    `tmp-taon-sql-exec-files/${contextNameForMigration ? `migration-${contextNameForMigration}` : 'sql-query'}-${new Date().getTime()}.sql`,
  ]);

  UtilsFilesFoldersSync.writeFile(sqlFileAbs, sql);

  const task = Helpers.actionStarted(
    `Executing on coudflare: ${chalk.bold(sqlFileAbs)}`,
  );

  while (true) {
    try {
      await execFileAsync(
        'npx',
        [
          'wrangler',
          'd1',
          'execute',
          'TAON_D1',
          '--remote',
          '--file',
          sqlFileAbs,
          '--yes',
        ],
        {
          cwd: cwdWorker,
          maxBuffer: 20 * 1024 * 1024,
        },
      );
      break;
    } catch (e) {
      await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(e);
    }
  }

  task.done();
  //#endregion
}
//#endregion
