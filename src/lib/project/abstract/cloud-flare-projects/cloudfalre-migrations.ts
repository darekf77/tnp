//#region imports
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { Models } from 'taon/src';
import { Helpers, path, UtilsTempFolder } from 'tnp-core/src';
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

//#region helpers
function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function splitMigrationSql(sql: string): {
  schemaSql: string;
  migrations: MigrationRegion[];
} {
  //#region @backendFunc
  const lines = sql.replace(/\r\n?/g, '\n').split('\n');

  const schemaLines: string[] = [];
  const migrations: MigrationRegion[] = [];

  let currentLines: string[] | undefined;
  let currentName: string | undefined;

  const startRegion = new RegExp(`^\\s*--\\s*#${'reg' + 'ion'}\\s+(.+?)\\s*$`);

  const endRegion = new RegExp(
    `^\\s*--\\s*#${'end' + 'reg' + 'ion'}(?:\\s+(.+?))?\\s*$`,
  );

  for (const line of lines) {
    const start = line.match(startRegion);
    const end = line.match(endRegion);

    if (start) {
      if (currentLines) {
        throw new Error(`Nested SQL migration: ${start[1]}`);
      }

      currentName = start[1].trim();
      currentLines = [];
      continue;
    }

    if (end) {
      if (!currentLines || !currentName) {
        throw new Error('Unexpected SQL migration end region');
      }

      if (end[1]?.trim() && end[1].trim() !== currentName) {
        throw new Error(
          `Migration region mismatch: ${currentName} / ${end[1]}`,
        );
      }

      if (migrations.some(m => m.name === currentName)) {
        throw new Error(`Duplicate migration region: ${currentName}`);
      }

      migrations.push({
        name: currentName,
        sql: currentLines.join('\n').trim(),
      });

      currentLines = undefined;
      currentName = undefined;
      continue;
    }

    if (currentLines) {
      currentLines.push(line);
    } else {
      schemaLines.push(line);
    }
  }

  if (currentLines) {
    throw new Error(`Unclosed migration region: ${currentName}`);
  }

  return {
    schemaSql: schemaLines.join('\n').trim(),
    migrations,
  };
  //#endregion
}

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
  cwd: string;
  database?: string;
  context?: string;
  wranglerConfig?: string;
}): Promise<RemoteMigration[]> {
  //#region @backendFunc
  const { cwd, database = 'TAON_D1', context, wranglerConfig } = options;

  const query = context
    ? `SELECT * FROM TAON_MIGRATION_META WHERE context = ${sqlLiteral(context)} ORDER BY id`
    : `SELECT * FROM TAON_MIGRATION_META ORDER BY id`;

  const args = [
    'wrangler',
    'd1',
    'execute',
    database,
    '--remote',
    '--json',
    '--command',
    query,
  ];

  if (wranglerConfig) {
    args.push('--config', wranglerConfig);
  }

  const { stdout } = await execFileAsync('npx', args, {
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
    cwd,
    maxBuffer: 10 * 1024 * 1024,
  });

  let response: WranglerD1Result[];

  try {
    response = JSON.parse(stdout);
  } catch {
    throw new Error(`Cannot parse Wrangler D1 JSON output:\n${stdout}`);
  }

  if (!Array.isArray(response) || response.length !== 1) {
    throw new Error('Unexpected Wrangler D1 response');
  }

  const first = response[0];

  if (!first.success) {
    throw new Error(first.error || 'Remote D1 query failed');
  }

  const migrations = first.results || [];

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

//#region get SQL for deployment
export function getSqlFor(
  mode: Models.DBRecreateMode,
  sql: string,
  remoteMigrations: RemoteMigration[] = [],
): MigrationPlan {
  //#region @backendFunc
  const { schemaSql, migrations } = splitMigrationSql(sql);

  const pending: string[] = [];
  const newMigrations: string[] = [];
  const skipped: string[] = [];

  const pendingSql: string[] = [];
  const newSql: string[] = [];

  const remoteByName = new Map(remoteMigrations.map(m => [m.name, m]));

  if (mode === Models.DBRecreateMode.DROP_DB_MIGRATIONS) {
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

  if (mode !== Models.DBRecreateMode.PRESERVE_DATA_MIGRATIONS) {
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
  cwd: string;
  database?: string;
  context?: string;
  wranglerConfig?: string;
}): Promise<MigrationPlan> {
  //#region @backendFunc
  const {
    mode,
    sql,
    cwd,
    database = 'TAON_D1',
    context,
    wranglerConfig,
  } = options;

  if (mode === Models.DBRecreateMode.DROP_DB_MIGRATIONS) {
    return getSqlFor(mode, sql);
  }

  const remoteMigrations = await getRemoteMigrations({
    cwd,
    database,
    context,
    wranglerConfig,
  });

  return getSqlFor(mode, sql, remoteMigrations);
  //#endregion
}
//#endregion

export async function executeRemoteMigrationSql(
  sql: string,
  cwdWorker: string,
  contextName: string,
): Promise<void> {
  //#region @backendFunc
  if (!sql.trim()) return;

  const file = join(
    cwdWorker,
    `tmp-taon-migrations/migration-${contextName}-${new Date().getTime()}.sql`,
  );
  if (!Helpers.exists(path.dirname(file))) {
    Helpers.mkdirp(path.dirname(file));
  }

  try {
    await writeFile(file, sql, 'utf8');

    await execFileAsync(
      'npx',
      [
        'wrangler',
        'd1',
        'execute',
        'TAON_D1',
        '--remote',
        '--file',
        file,
        '--yes',
      ],
      {
        cwd: cwdWorker,
        maxBuffer: 20 * 1024 * 1024,
      },
    );
  } finally {
    await unlink(file).catch(() => {});
  }
  //#endregion
}
