import type { EnvOptions } from 'tnp/src';
import baseEnv from './env.npm-lib-and-cli-tool.__';

const env: Partial<EnvOptions> = {
  ...baseEnv,
  build: {
    prod: true,
  },
  release: {
    cli: {
      ...(baseEnv.release?.cli || {}),
      includeNodeModules: true,
    },
    useLocalReleaseBranch: true,
  },
};
export default env;
