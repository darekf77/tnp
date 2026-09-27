import {
  Helpers,
  path,
  UtilsFilesFoldersSync,
  UtilsOs,
  UtilsSecretEnv,
  UtilsTerminal,
} from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import { environmentsFolder, envTs, tmpEnvFolder } from '../../constants';

import type { Project } from './project';
import { SecretsKeychainController } from './taon-worker/secrets-keychain/secrets-keychain.controller';

interface CallbackTravelFnParam {
  fileAbsPath: string;
  content: string;
  stop: () => void;
}

// @ts-ignore TODO weird inheritance problem
export class SecretEnv extends BaseFeatureForProject<Project> {
  //#region travel and modify orignal fiels
  /**
   * @deprecated
   */
  private async travelAndModifyOrignalFiles(
    callback: (opt: CallbackTravelFnParam) => string | Promise<string>,
  ): Promise<void> {
    //#region @backendFunc
    const allFiles = [
      this.project.pathFor(envTs),

      ...UtilsFilesFoldersSync.getFilesFrom(
        this.project.pathFor(environmentsFolder),
        {
          followSymlinks: false,
          recursive: true,
        },
      ).filter(
        f =>
          path.basename(f).startsWith('env.') &&
          path.basename(f).endsWith('.ts'),
      ),
    ];
    await this.travelAndModify(allFiles, callback);
    //#endregion
  }
  //#endregion

  //#region travel and modify temp env files
  private async travelAndModifyTempEnvFiles(
    callback: (opt: CallbackTravelFnParam) => string | Promise<string>,
  ): Promise<void> {
    //#region @backendFunc
    const allFiles = [
      this.project.pathFor([tmpEnvFolder, envTs]),

      ...UtilsFilesFoldersSync.getFilesFrom(
        this.project.pathFor([tmpEnvFolder, environmentsFolder]),
        {
          followSymlinks: false,
          recursive: true,
        },
      ).filter(
        f =>
          path.basename(f).startsWith('env.') &&
          path.basename(f).endsWith('.ts'),
      ),
    ];
    await this.travelAndModify(allFiles, callback);
    //#endregion
  }
  //#endregion

  //#region travel and modify
  private async travelAndModify(
    allFiles: string[],
    callback: (opt: CallbackTravelFnParam) => string | Promise<string>,
  ): Promise<void> {
    //#region @backendFunc

    let stop = false;
    for (const fileAbsPath of allFiles) {
      if (stop) {
        return;
      }
      const content = UtilsFilesFoldersSync.readFile(fileAbsPath)!;

      const newContent = await callback({
        content,
        fileAbsPath,
        stop: () => {
          stop = true;
        },
      });

      if (stop) {
        return;
      }

      if (newContent !== content) {
        UtilsFilesFoldersSync.writeFile(fileAbsPath, newContent);
      }
    }
    //#endregion
  }
  //#endregion

  //#region can changes be pushed
  /**
   * Returns false if any EnvOptions function property
   * contains a plaintext secret.
   */
  async anyOrgFileWithSecretFn(): Promise<boolean> {
    //#region @backendFunc
    let hasAnySecretFn = false;

    await this.travelAndModifyOrignalFiles(async ({ content }) => {
      await UtilsTypescript.travelAndModifyFunctionsPropsString({
        envFileContent: content,

        modify: ({ contentPropFunction }) => {
          hasAnySecretFn = true;

          return contentPropFunction;
        },
      });

      return content;
    });

    return hasAnySecretFn;
    //#endregion
  }
  //#endregion

  //#region can project be init/build locally
  async everyTempVariableDecoded(): Promise<boolean> {
    //#region @backendFunc
    let canbuildProjectLocally = true;

    await this.travelAndModifyTempEnvFiles(async ({ content }) => {
      await UtilsTypescript.travelAndModifyFunctionsPropsString({
        envFileContent: content,

        modify: ({ contentPropFunction }) => {
          if (
            contentPropFunction.includes(UtilsSecretEnv.TAON_ENCRYPTED_START)
          ) {
            canbuildProjectLocally = false;
          }

          return contentPropFunction;
        },
      });

      return content;
    });

    return canbuildProjectLocally;
    //#endregion
  }
  //#endregion

  //#region get controller
  private async getCtrl(): Promise<SecretsKeychainController> {
    const ctrl =
      await this.project.ins.taonProjectsWorker.secretsKeychainPackagesWorker.getRemoteControllerFor(
        {
          methodOptions: {
            calledFrom: 'secret-env get master password',
          },
          controllerClass: SecretsKeychainController,
        },
      );
    return ctrl;
  }
  //#endregion

  //#region get master password
  async getMasterPassword(requestNew = false): Promise<string> {
    //#region @backendFunc

    const ctrl = await this.getCtrl();
    let masterPassword = '';

    if (!requestNew) {
      try {
        masterPassword = (
          await ctrl.getMasterPassword(this.project.location).request!()
        ).body.text!;
      } catch (error) {}

      if (masterPassword) {
        Helpers.info(`Using master password from worker`);
        return masterPassword;
      }
    }

    masterPassword = await UtilsTerminal.input({
      question: `Please provide${requestNew ? ' new' : ''} master password`,
      required: true,
    });

    return masterPassword;
    //#endregion
  }
  //#endregion

  //#region encode modify fn
  private async encodeModifyFn(
    contentPropFunction: string,
    masterPassword: string,
  ): Promise<string> {
    //#region @backendFunc
    if (contentPropFunction.includes(UtilsSecretEnv.TAON_ENCRYPTED_START)) {
      return contentPropFunction;
    }

    const plainValue =
      UtilsSecretEnv.extractStaticStringFromArrowFunction(contentPropFunction);

    if (typeof plainValue !== 'string') {
      throw new Error(
        `Cannot statically resolve env secret: ${contentPropFunction}`,
      );
    }

    const encrypted = await UtilsSecretEnv.encrypt(plainValue, masterPassword);

    return `() => \`${UtilsSecretEnv.TAON_ENCRYPTED_START}${encrypted}${UtilsSecretEnv.TAON_ENCRYPTED_END}\``;
    //#endregion
  }
  //#endregion

  //#region decode modify fn
  private async decodeModifyFn(
    contentPropFunction: string,
    masterPassword: string,
    opt: {
      decryptErrorCallback: (err: any) => void;
      decryptOKCallback: (masterKey: string) => void;
    },
  ): Promise<string> {
    //#region @backendFunc
    if (!contentPropFunction.includes(UtilsSecretEnv.TAON_ENCRYPTED_START)) {
      return contentPropFunction;
    }

    const encrypted =
      UtilsSecretEnv.extractStaticStringFromArrowFunction(contentPropFunction);

    if (!encrypted) {
      throw new Error(
        `Cannot read encrypted env secret: ${contentPropFunction}`,
      );
    }

    const payload = encrypted
      .replace(UtilsSecretEnv.TAON_ENCRYPTED_START, '')
      .replace(UtilsSecretEnv.TAON_ENCRYPTED_END, '');

    try {
      const decrypted = await UtilsSecretEnv.decrypt(payload, masterPassword);
      await opt.decryptOKCallback(masterPassword);
      return `() => ${JSON.stringify(decrypted)}`;
    } catch (error) {
      await opt.decryptErrorCallback(error);
      return contentPropFunction;
    }

    //#endregion
  }
  //#endregion

  //#region encode original
  async encodeOriginal(masterPassword?: string): Promise<void> {
    //#region @backendFunc
    masterPassword = masterPassword
      ? masterPassword
      : await this.getMasterPassword();

    await this.travelAndModifyOrignalFiles(async ({ content }) => {
      return UtilsTypescript.travelAndModifyFunctionsPropsString({
        envFileContent: content,

        modify: async ({ contentPropFunction }) => {
          return await this.encodeModifyFn(contentPropFunction, masterPassword);
        },
      });
    });
    //#endregion
  }
  //#endregion

  //#region encode temp env
  async encodeTempEnv(masterPassword?: string): Promise<void> {
    //#region @backendFunc
    masterPassword = masterPassword
      ? masterPassword
      : await this.getMasterPassword();

    await this.travelAndModifyTempEnvFiles(async ({ content }) => {
      return UtilsTypescript.travelAndModifyFunctionsPropsString({
        envFileContent: content,

        modify: async ({ contentPropFunction }) => {
          return await this.encodeModifyFn(contentPropFunction, masterPassword);
        },
      });
    });
    //#endregion
  }
  //#endregion

  //#region try to save good master password for 1 day
  private async tryToSaveGoodMasterPassword(
    masterPassword: string,
  ): Promise<void> {
    //#region @backendFunc
    const ctrl = await this.getCtrl();
    Helpers.info(`Saving master password for 1 day`);
    while (true) {
      try {
        await ctrl.setMasterPassword(this.project.location, masterPassword)
          .request!();
        Helpers.info(`Master password saved successfully in taon worker`);
        return;
      } catch (error) {
        Helpers.warn(`Not ablet to save master password inside taon worker`);
        const choices = {
          tryAgain: {
            name: 'try again save ?',
          },
          skipsave: {
            name: 'skip save ?',
          },
        };
        const res = await UtilsTerminal.select<keyof typeof choices>({
          choices,
          question: `Select action`,
        });

        if (res === 'skipsave') {
          return;
        }

        if (res === 'tryAgain') {
          continue;
        }
      }
    }

    //#endregion
  }
  //#endregion

  //#region decode
  private async decode(
    fn:
      | typeof this.travelAndModifyOrignalFiles
      | typeof this.travelAndModifyTempEnvFiles,
    masterPassword?: string,
  ): Promise<void> {
    //#region @backendFunc

    let requestNewPass = false;
    let goodPasswordSave = false;
    while (true) {
      masterPassword =
        masterPassword && !requestNewPass
          ? masterPassword
          : await this.getMasterPassword(requestNewPass);

      await fn.call(this, async ({ content, stop: stopFnTravel }) => {
        return UtilsTypescript.travelAndModifyFunctionsPropsString({
          envFileContent: content,

          modify: async ({ contentPropFunction, stop: stopModify }) => {
            return await this.decodeModifyFn(
              contentPropFunction,
              masterPassword!,
              {
                decryptErrorCallback: err => {
                  stopFnTravel();
                  stopModify();
                  requestNewPass = true;
                  goodPasswordSave = false;

                  Helpers.error(
                    `Decryption failed with saved key.`,
                    !UtilsOs.isRunningInDocker(),
                    true,
                  );
                },
                decryptOKCallback: async masterKey => {
                  requestNewPass = false;
                  if (!goodPasswordSave) {
                    goodPasswordSave = true;
                    await this.tryToSaveGoodMasterPassword(masterPassword!);
                  }
                },
              },
            );
          },
        });
      });
      if (requestNewPass) {
        continue;
      }
      break;
    }

    //#endregion
  }
  //#endregion

  //#region decode original
  async decodeOriginal(masterPassword?: string): Promise<void> {
    //#region @backendFunc
    await this.decode(this.travelAndModifyOrignalFiles, masterPassword);
    //#endregion
  }
  //#endregion

  //#region decode temp env
  async decodeTempEnv(masterPassword?: string): Promise<void> {
    //#region @backendFunc
    await this.decode(this.travelAndModifyTempEnvFiles, masterPassword);
    //#endregion
  }
}
