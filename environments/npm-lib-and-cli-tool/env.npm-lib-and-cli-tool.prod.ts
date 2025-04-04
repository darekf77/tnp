import type { EnvOptions } from '../../src/lib/options';
import baseEnv from './env.npm-lib-and-cli-tool.__';

const env: Partial<EnvOptions> = {
  ...baseEnv,
  build: {
    cli: {
      includeNodeModules: true,
    },
  },
};
export default env;
