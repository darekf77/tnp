import type { EnvOptions } from 'tnp/src';

const env: Partial<EnvOptions> = {
  website: {
    domain: 'cli.taon.dev',
  },
  docker: {
    additionalContainer: [
      // 'backend-app-node',
      // 'frontend-app',
      // dockerDatabaseMysql,
    ],
  },
};
export default env;
