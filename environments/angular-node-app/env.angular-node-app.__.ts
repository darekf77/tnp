import type { EnvOptions } from '../../src/lib/options';
import baseEnv from './env.angular-node-app.__';

const env: Partial<EnvOptions> = {
  ...baseEnv,
  build: {
    ...baseEnv.build,
  },
};
export default env;
