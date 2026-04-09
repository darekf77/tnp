import type { EnvOptions } from 'tnp/src';
import baseEnv from '../../env';

const env: Partial<EnvOptions> = {
  ...baseEnv,
  release: {
    ...baseEnv.release,
    cli: {
      ...(baseEnv.release?.cli || {}),
      includeNodeModules: true,
    },
  },
};
export default env;
