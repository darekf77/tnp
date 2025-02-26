export namespace TaonModels {
  //#region release version type
  export type ReleaseProcessType = 'manual' | 'local' | 'cloud';

  /**
   * All possible release types for taon
   * for MANUAL/CLOUD release
   */
  export type ReleaseArtifactTaon =
    | 'angular-electron-app'
    | 'angular-frontend-webapp'
    | 'angular-ionic-app'
    | 'mkdocs-docs-webapp'
    | 'nodejs-backend-server'
    | 'npm-lib-pkg-and-cli-tool'
    | 'vscode-extension';

  export const ReleaseArtifactTaonNames = Object.freeze({
    ANGULAR_ELECTRON_APP: 'angular-electron-app' as ReleaseArtifactTaon,
    /**
     * Angular frontend webapp (pwa) inside docker
     */
    ANGULAR_FRONTEND_WEBAPP: 'angular-frontend-webapp' as ReleaseArtifactTaon,
    /**
     * Angular + Ionic
     */
    ANGULAR_IONIC_APP: 'angular-ionic-app' as ReleaseArtifactTaon,
    /**
     * MkDocs documentation webapp (pwa) inside docker
     */
    MKDOCS_DOCS_WEBAPP: 'mkdocs-docs-webapp' as ReleaseArtifactTaon,
    /**
     * Nodejs backend server inside docker
     * (could be backend or frontend or microservice)
     */
    NODEJS_BACKEND_SERVER: 'nodejs-backend-server' as ReleaseArtifactTaon,
    /**
     * Npm lib package and global cli tool
     */
    NPM_LIB_PKG_AND_CLI_TOOL: 'npm-lib-pkg-and-cli-tool' as ReleaseArtifactTaon,
    /**
     * Visual Studio Code extension
     */
    VSCODE_EXTENSION: 'vscode-extension' as ReleaseArtifactTaon,
  });

  export const ReleaseArtifactTaonNamesArr = Object.values(
    ReleaseArtifactTaonNames,
  );

  /**
   * All possible local release types for taon
   * for LOCAL release
   */
  export type LocalReleaseArtifactTaon =
    | 'docker-backend-frontend-app'
    | 'global-cli-tool'
    | 'vscode-extension';

  /**
   * Object with all possible local release types for taon
   * inside LOCAL release
   */
  export const LocalReleaseArtifactTaonNames = Object.freeze({
    DOCKER_BACKEND_FRONTEND_APP:
      'docker-backend-frontend-app' as LocalReleaseArtifactTaon,
    /**
     * Global CLI tool
     */
    GLOBAL_CLI_TOOL: 'global-cli-tool' as LocalReleaseArtifactTaon,
    /**
     * Visual Studio Code extension
     */
    VSCODE_EXTENSION: 'vscode-extension' as LocalReleaseArtifactTaon,
  });

  /**
   * Array with all possible local release types for taon
   * inside LOCAL release
   */
  export const LocalReleaseArtifactTaonNamesArr = Object.values(
    LocalReleaseArtifactTaonNames,
  );


  //#endregion

  export class StructOptions {}

  export class InitOption extends StructOptions {}

  export class BuildOptions extends InitOption {}

  export class ReleaseOptions extends BuildOptions {}

  export class DeployPublish extends ReleaseOptions {}
}
