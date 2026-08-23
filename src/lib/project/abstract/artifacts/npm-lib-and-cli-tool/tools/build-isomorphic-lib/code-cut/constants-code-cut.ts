import { GlobalStorage } from 'tnp-core/src';
import { EnvOptions } from '../../../../../../../options';

const getKey = (relativePath: string, envOptiosn: EnvOptions): string => {
  return `taon:first:time:compilation:${envOptiosn.build.websql ? 'websql' : 'normal'}:${relativePath}`;
};

export function setDoneFirstTimeCompilation(
  relativePath: string,
  envOptions: EnvOptions,
): void {
  GlobalStorage.set(getKey(relativePath, envOptions), true);
}

export function isFirstTimeCompilation(
  relativePath: string,
  envOptions: EnvOptions,
): boolean {
  return !!GlobalStorage.get(getKey(relativePath, envOptions));
}
