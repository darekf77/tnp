import type { EnvOptions } from 'tnp/src';
import baseEnv from './env.npm-lib-and-cli-tool.__';

const env: Partial<EnvOptions> = {
  ...baseEnv,
  build:{
    prod: true,
  },
  release: {
    skipNpmPublish: true,
    skipReleaseQuestion: true,
    skipResolvingGitChanges: true,
    skipTagGitPush: true,
    lib: {
      doNotIncludeLibFiles: true,
    },
    cli: {
      includeNodeModules: true,
    },
  },
};
export default env;
