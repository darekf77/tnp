import type { EnvOptions } from '../../src/lib/options';
import baseEnv from './env.electron-app.__';

const env: Partial<EnvOptions> = {
  ...baseEnv,
  build: {
    ...baseEnv.build,
    angularProd: true,
  },
};
export default env;
