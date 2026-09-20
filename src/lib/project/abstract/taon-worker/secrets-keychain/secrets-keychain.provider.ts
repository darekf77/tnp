//#region imports
import { Taon, TaonBaseProvider, TaonProvider } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

@TaonProvider({
  className: 'SecretsKeychainProvider',
})
export class SecretsKeychainProvider extends TaonBaseProvider {
  enabledSecretsKeychainOption: boolean = true;
}