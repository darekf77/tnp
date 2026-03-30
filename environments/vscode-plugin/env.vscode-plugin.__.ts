import type { EnvOptions } from 'tnp/src';
import baseEnv from '../../env';

const env: Partial<EnvOptions<EnvVSCodePaths>> = {
  ...baseEnv,
  release: {
    ...baseEnv.release,
    useLocalReleaseBranch: true,
  },
};
export default env;

export interface EnvVSCodePaths {
  vscodeDeployPath?: string;
}
