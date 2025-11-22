import type { EnvOptions } from 'tnp/src';
import baseEnv from './env.npm-lib-and-cli-tool.__';

/**
 * this is for local_release/npm-lib-and-cli-tool/tnp-latest
 * tnp development release
 */
const env: Partial<EnvOptions> = {
  ...baseEnv,
  release: {
    cli: {
      includeNodeModules: true,
      minify: false,
    },
    lib: {
      doNotIncludeLibFiles: true,
    },
  },
};
export default env;
