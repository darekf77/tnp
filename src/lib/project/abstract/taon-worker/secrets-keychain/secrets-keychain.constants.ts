import type { SecretsKeychainEntity } from './secrets-keychain.entity';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export const SecretsKeychainDefaultsValues = {
  description: '',
  version: 0,
  id: void 0,
} as Partial<SecretsKeychainEntity>;

export enum SecretsKeychainErrors {
  INVALID_PASSWORD_EXAMPLE_ERROR = 'INVALID_PASSWORD_EXAMPLE_ERROR',
}

export const SecretsKeychainTranslationErorsMap = new Map([
  [SecretsKeychainErrors.INVALID_PASSWORD_EXAMPLE_ERROR, t.gettext('Invalid Password')],
]);