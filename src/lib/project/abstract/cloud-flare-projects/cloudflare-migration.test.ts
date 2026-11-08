// @skipCodeCutting
import { splitMigrationSql } from './cloudfalre-migrations';

describe('splitMigrationSql', () => {
  const CONTEXT = 'WwwMattbachataPlContext';
  const OTHER_CONTEXT = 'AnotherContext';

  it('extracts migrations from selected context', () => {
    const sql = `
-- #region ${CONTEXT}

CREATE TABLE users (id INTEGER);

-- #region InitialMigration_100
ALTER TABLE users ADD COLUMN name TEXT;
-- #endregion InitialMigration_100

-- #region AddEmail_200
ALTER TABLE users ADD COLUMN email TEXT;
-- #endregion AddEmail_200

-- #endregion ${CONTEXT}
`;

    expect(splitMigrationSql(sql, CONTEXT)).toEqual({
      schemaSql: 'CREATE TABLE users (id INTEGER);',
      migrations: [
        {
          name: 'InitialMigration_100',
          sql: 'ALTER TABLE users ADD COLUMN name TEXT;',
        },
        {
          name: 'AddEmail_200',
          sql: 'ALTER TABLE users ADD COLUMN email TEXT;',
        },
      ],
    });
  });

  it('ignores migrations and schema from other contexts', () => {
    const sql = `
-- #region ${OTHER_CONTEXT}
CREATE TABLE other_table (id INTEGER);

-- #region OtherMigration_100
ALTER TABLE other_table ADD COLUMN value TEXT;
-- #endregion OtherMigration_100

-- #endregion ${OTHER_CONTEXT}

-- #region ${CONTEXT}
CREATE TABLE my_table (id INTEGER);

-- #region MyMigration_200
ALTER TABLE my_table ADD COLUMN title TEXT;
-- #endregion MyMigration_200

-- #endregion ${CONTEXT}
`;

    expect(splitMigrationSql(sql, CONTEXT)).toEqual({
      schemaSql: 'CREATE TABLE my_table (id INTEGER);',
      migrations: [
        {
          name: 'MyMigration_200',
          sql: 'ALTER TABLE my_table ADD COLUMN title TEXT;',
        },
      ],
    });
  });

  it('includes global SQL outside context regions', () => {
    const sql = `
PRAGMA foreign_keys = ON;

-- #region ${CONTEXT}
CREATE TABLE users (id INTEGER);
-- #endregion ${CONTEXT}

SELECT 1;
`;

    const result = splitMigrationSql(sql, CONTEXT);

    expect(result.schemaSql).toBe(
      'PRAGMA foreign_keys = ON;\n\nCREATE TABLE users (id INTEGER);\n\nSELECT 1;',
    );
    expect(result.migrations).toEqual([]);
  });

  it('returns empty migrations when selected context has no migrations', () => {
    const sql = `
-- #region ${CONTEXT}
CREATE TABLE users (id INTEGER);
-- #endregion ${CONTEXT}
`;

    expect(splitMigrationSql(sql, CONTEXT)).toEqual({
      schemaSql: 'CREATE TABLE users (id INTEGER);',
      migrations: [],
    });
  });

  it('returns global schema when requested context does not exist', () => {
    const sql = `
PRAGMA foreign_keys = ON;

-- #region ${OTHER_CONTEXT}
CREATE TABLE other_table (id INTEGER);
-- #endregion ${OTHER_CONTEXT}
`;

    expect(splitMigrationSql(sql, CONTEXT)).toEqual({
      schemaSql: 'PRAGMA foreign_keys = ON;',
      migrations: [],
    });
  });

  it('supports unnamed endregion markers', () => {
    const sql = `
-- #region ${CONTEXT}
-- #region Migration_100
SELECT 1;
-- #endregion
-- #endregion
`;

    expect(splitMigrationSql(sql, CONTEXT).migrations).toEqual([
      {
        name: 'Migration_100',
        sql: 'SELECT 1;',
      },
    ]);
  });

  it('supports CRLF line endings', () => {
    const sql = [
      `-- #region ${CONTEXT}`,
      '-- #region Migration_100',
      'SELECT 1;',
      '-- #endregion Migration_100',
      `-- #endregion ${CONTEXT}`,
    ].join('\r\n');

    expect(splitMigrationSql(sql, CONTEXT).migrations).toEqual([
      {
        name: 'Migration_100',
        sql: 'SELECT 1;',
      },
    ]);
  });

  it('preserves multiline SQL inside migration regions', () => {
    const sql = `
-- #region ${CONTEXT}
-- #region Migration_100
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO users (id, name)
VALUES (1, 'John');
-- #endregion Migration_100
-- #endregion ${CONTEXT}
`;

    expect(splitMigrationSql(sql, CONTEXT).migrations[0].sql).toBe(
      `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO users (id, name)
VALUES (1, 'John');`,
    );
  });

  it('throws on duplicate migration names within selected context', () => {
    const sql = `
-- #region ${CONTEXT}
-- #region Migration_100
SELECT 1;
-- #endregion Migration_100
-- #region Migration_100
SELECT 2;
-- #endregion Migration_100
-- #endregion ${CONTEXT}
`;

    expect(() => splitMigrationSql(sql, CONTEXT)).toThrow(
      'Duplicate migration region: Migration_100',
    );
  });

  it('throws on duplicate selected context regions', () => {
    const sql = `
-- #region ${CONTEXT}
SELECT 1;
-- #endregion ${CONTEXT}
-- #region ${CONTEXT}
SELECT 2;
-- #endregion ${CONTEXT}
`;

    expect(() => splitMigrationSql(sql, CONTEXT)).toThrow(
      `Duplicate SQL context region: ${CONTEXT}`,
    );
  });

  it('throws on mismatched migration endregion', () => {
    const sql = `
-- #region ${CONTEXT}
-- #region Migration_100
SELECT 1;
-- #endregion WrongMigration
-- #endregion ${CONTEXT}
`;

    expect(() => splitMigrationSql(sql, CONTEXT)).toThrow(
      'SQL region mismatch: Migration_100 / WrongMigration',
    );
  });

  it('throws on mismatched context endregion', () => {
    const sql = `
-- #region ${CONTEXT}
SELECT 1;
-- #endregion WrongContext
`;

    expect(() => splitMigrationSql(sql, CONTEXT)).toThrow(
      `SQL region mismatch: ${CONTEXT} / WrongContext`,
    );
  });

  it('throws on unexpected endregion', () => {
    expect(() => splitMigrationSql('-- #endregion', CONTEXT)).toThrow(
      'Unexpected SQL migration end region',
    );
  });

  it('throws on unclosed migration region', () => {
    const sql = `
-- #region ${CONTEXT}
-- #region Migration_100
SELECT 1;
`;

    expect(() => splitMigrationSql(sql, CONTEXT)).toThrow(
      'Unclosed SQL region: Migration_100',
    );
  });

  it('throws on unclosed context region', () => {
    const sql = `
-- #region ${CONTEXT}
SELECT 1;
`;

    expect(() => splitMigrationSql(sql, CONTEXT)).toThrow(
      `Unclosed SQL region: ${CONTEXT}`,
    );
  });

  it('throws when nesting exceeds two levels', () => {
    const sql = `
-- #region ${CONTEXT}
-- #region Migration_100
-- #region NestedMigration
SELECT 1;
-- #endregion NestedMigration
-- #endregion Migration_100
-- #endregion ${CONTEXT}
`;

    expect(() => splitMigrationSql(sql, CONTEXT)).toThrow(
      'Nested SQL migration: NestedMigration',
    );
  });

  it('allows identical migration names in different contexts', () => {
    const sql = `
-- #region ${OTHER_CONTEXT}
-- #region Migration_100
SELECT 999;
-- #endregion Migration_100
-- #endregion ${OTHER_CONTEXT}

-- #region ${CONTEXT}
-- #region Migration_100
SELECT 1;
-- #endregion Migration_100
-- #endregion ${CONTEXT}
`;

    expect(splitMigrationSql(sql, CONTEXT).migrations).toEqual([
      {
        name: 'Migration_100',
        sql: 'SELECT 1;',
      },
    ]);
  });

  it('does not treat SQL strings containing region text as directives', () => {
    const sql = `
-- #region ${CONTEXT}
-- #region Migration_100
INSERT INTO logs (message) VALUES ('#region NotARegion');
SELECT '#endregion';
-- #endregion Migration_100
-- #endregion ${CONTEXT}
`;

    expect(splitMigrationSql(sql, CONTEXT).migrations[0].sql).toContain(
      "'#region NotARegion'",
    );
  });
});
