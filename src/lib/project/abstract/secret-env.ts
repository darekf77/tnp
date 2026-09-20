import {
  Helpers,
  path,
  UtilsFilesFoldersSync,
  UtilsSecretEnv,
  UtilsTerminal,
} from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import { environmentsFolder, envTs } from '../../index';

import type { Project } from './project';
import { SecretsKeychainController } from './taon-worker/secrets-keychain/secrets-keychain.controller';

// @ts-ignore TODO weird inheritance problem
export class SecretEnv extends BaseFeatureForProject<Project> {
  private async travelAndModifyAllFiles(
    callback: (opt: {
      fileAbsPath: string;
      content: string;
    }) => string | Promise<string>,
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

    for (const fileAbsPath of allFiles) {
      const content = UtilsFilesFoldersSync.readFile(fileAbsPath);

      const newContent = await callback({
        content,
        fileAbsPath,
      });

      if (newContent !== content) {
        UtilsFilesFoldersSync.writeFile(fileAbsPath, newContent);
      }
    }
    //#endregion
  }

  //#region can changes be pushed
  /**
   * Returns false if any EnvOptions function property
   * contains a plaintext secret.
   */
  async canChangesBePush(): Promise<boolean> {
    //#region @backendFunc
    let canPush = true;

    await this.travelAndModifyAllFiles(async ({ content }) => {
      UtilsTypescript.travelAndModifyFunctionsPropsString({
        envFileContent: content,

        modify: ({ contentPropFunction }) => {
          if (
            !contentPropFunction.includes(UtilsSecretEnv.TAON_ENCRYPTED_START)
          ) {
            canPush = false;
          }

          return contentPropFunction;
        },
      });

      return content;
    });

    return canPush;
    //#endregion
  }
  //#endregion

  //#region can project be init/build locally
  async canBeInitedLocally(): Promise<boolean> {
    //#region @backendFunc
    let canbuildProjectLocally = true;

    await this.travelAndModifyAllFiles(async ({ content }) => {
      UtilsTypescript.travelAndModifyFunctionsPropsString({
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

  //#region get master password
  async getMasterPassword(): Promise<string> {
    //#region @backendFunc

    const ctrl = await this.getCtrl();
    let masterPassword = '';

    try {
      masterPassword = (
        await ctrl.getMasterPassword(this.project.location).request()
      ).body.text;
    } catch (error) {}

    if (masterPassword) {
      Helpers.info(`Using master password from worker`);
      return masterPassword;
    }

    masterPassword = await UtilsTerminal.input({
      question: `Please provide master password`,
      required: true,
    });

    try {
      await ctrl
        .setMasterPassword(this.project.location, masterPassword)
        .request();
    } catch (error) {
      Helpers.warn(`Not ablet to set temporary master password`);
    }

    return masterPassword;
    //#endregion
  }
  //#endregion

  //#region encode
  async encode(masterPassword?: string): Promise<void> {
    //#region @backendFunc
    masterPassword = masterPassword
      ? masterPassword
      : await this.getMasterPassword();

    await this.travelAndModifyAllFiles(async ({ content }) => {
      return UtilsTypescript.travelAndModifyFunctionsPropsString({
        envFileContent: content,

        modify: async ({ contentPropFunction }) => {
          if (
            contentPropFunction.includes(UtilsSecretEnv.TAON_ENCRYPTED_START)
          ) {
            return contentPropFunction;
          }

          const plainValue =
            UtilsSecretEnv.extractStaticStringFromArrowFunction(
              contentPropFunction,
            );

          if (typeof plainValue !== 'string') {
            throw new Error(
              `Cannot statically resolve env secret: ${contentPropFunction}`,
            );
          }

          const encrypted = await UtilsSecretEnv.encrypt(
            plainValue,
            masterPassword,
          );

          return `() => \`${UtilsSecretEnv.TAON_ENCRYPTED_START}${encrypted}${UtilsSecretEnv.TAON_ENCRYPTED_END}\``;
        },
      });
    });
    //#endregion
  }
  //#endregion

  //#region decode
  async decode(masterPassword?: string): Promise<void> {
    //#region @backendFunc
    masterPassword = masterPassword
      ? masterPassword
      : await this.getMasterPassword();

    await this.travelAndModifyAllFiles(async ({ content }) => {
      return UtilsTypescript.travelAndModifyFunctionsPropsString({
        envFileContent: content,

        modify: async ({ contentPropFunction }) => {
          if (
            !contentPropFunction.includes(UtilsSecretEnv.TAON_ENCRYPTED_START)
          ) {
            return contentPropFunction;
          }

          const encrypted =
            UtilsSecretEnv.extractStaticStringFromArrowFunction(
              contentPropFunction,
            );

          if (!encrypted) {
            throw new Error(
              `Cannot read encrypted env secret: ${contentPropFunction}`,
            );
          }

          const payload = encrypted
            .replace(UtilsSecretEnv.TAON_ENCRYPTED_START, '')
            .replace(UtilsSecretEnv.TAON_ENCRYPTED_END, '');

          const decrypted = await UtilsSecretEnv.decrypt(
            payload,
            masterPassword,
          );

          return `() => ${JSON.stringify(decrypted)}`;
        },
      });
    });
    //#endregion
  }
  //#endregion
}
