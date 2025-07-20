import type { EnvOptions } from 'tnp/src';

const env: Partial<EnvOptions> = {
  website: {
    domain: 'cli.taon.dev',
  },
  docker: {
    containers: [
      // 'backend-app-node',
      // 'frontend-nginx',
      // dockerDatabaseMysql,
    ],
  },
};
export default env;
