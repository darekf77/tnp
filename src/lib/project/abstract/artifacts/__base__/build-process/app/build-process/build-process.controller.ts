//#region imports
import { Taon } from 'taon/src';
import { _ } from 'tnp-core/src';

import { PortUtils } from '../../../../../../../constants';
import type { Project } from '../../../../../project';

import { BuildProcess } from './build-process';
//#endregion

/**
 * Isomorphic Controller for BuildProcess
 *
 * + only create here isomorphic controller methods
 * + use this.backend for any backend/db operations
 */
@Taon.Controller({
  //#region controller options
  className: 'BuildProcessController',
  //#endregion
})
export class BuildProcessController extends Taon.Base.CrudController<any> {
  private project: Project;
  entityClassResolveFn = (): typeof BuildProcess => BuildProcess;

  //#region main
  @Taon.Http.GET({ path: '/', pathIsGlobal: true })
  main(): Taon.Response<string> {
    //#region @backendFunc
    return async (req, res) => {
      return `

      backend port: ${
        this.project?.artifactsManager.artifact.angularNodeApp.backendPort ||
        '< resolving in progress >'
      } <br>
      currentPorts.NORMAL_APP ${
        this.project?.artifactsManager.artifact.angularNodeApp
          .standaloneNormalAppPort || '< resolving in progress >'
      } <br>
      currentPorts.WEBSQL_APP ${
        this.project?.artifactsManager.artifact.angularNodeApp
          .standaloneWebsqlAppPort || '< resolving in progress >'
      } <br>

      `;
    };
    //#endregion
  }
  //#endregion

  //#region get ports
  @Taon.Http.GET()
  getPorts(): Taon.Response<BuildProcess> {
    //#region @backendFunc
    return async (req, res) => {
      const all = await this.db.find();
      return _.first(all);
    };
    //#endregion
  }
  //#endregion

  //#region initialize server
  async initializeServer(project: Project): Promise<void> {
    //#region @backendFunc
    this.project = project;
    this.project.artifactsManager.artifact.angularNodeApp.standaloneNormalAppPort =
      this.resolve_standaloneNormalAppPort;
    this.project.artifactsManager.artifact.angularNodeApp.standaloneWebsqlAppPort =
      this.resolve_standaloneWebsqlAppPort;

    const portsToSave = {
      backendPort:
        this.project.artifactsManager.artifact.angularNodeApp.backendPort,
      standaloneNormalAppPort:
        this.project.artifactsManager.artifact.angularNodeApp
          .standaloneNormalAppPort,
      standaloneWebsqlAppPort:
        this.project.artifactsManager.artifact.angularNodeApp
          .standaloneWebsqlAppPort,
    };
    await this.db.save(new BuildProcess().clone(portsToSave));
    //#endregion
  }
  //#endregion

  //#region initialize client to remote server
  async initializeClientToRemoteServer(project: Project) {
    //#region @backendFunc
    this.project = project;
    const { backendPort, standaloneNormalAppPort, standaloneWebsqlAppPort } = (
      await this.getPorts().received
    ).body.json;
    project.artifactsManager.artifact.angularNodeApp.backendPort = backendPort;
    project.artifactsManager.artifact.angularNodeApp.standaloneNormalAppPort =
      standaloneNormalAppPort;
    project.artifactsManager.artifact.angularNodeApp.standaloneWebsqlAppPort =
      standaloneWebsqlAppPort;
    //#endregion
  }
  //#endregion

  //#region set project info
  private get resolve_projectInfoPort(): number | undefined {
    //#region @backendFunc
    if (!this.project) {
      return void 0;
    }
    let port =
      this.project.artifactsManager.artifact.angularNodeApp.projectInfoPort;
    if (!port && this.project.framework.isSmartContainerTarget) {
      return this.project.framework.smartContainerTargetParentContainer
        .artifactsManager.artifact.angularNodeApp.projectInfoPort;
    }
    return port;
    //#endregion
  }
  //#endregion

  //#region get standalone normal app port
  private get resolve_standaloneNormalAppPort(): number | undefined {
    //#region @backendFunc
    if (!this.project) {
      return void 0;
    }
    const resolvePort = PortUtils.instance(
      this.resolve_projectInfoPort,
    ).calculateClientPortFor(this.project, { websql: false });
    // console.log(`resolveStandaloneNormalAppPort ${resolvePort}`);
    return resolvePort;
    //#endregion
  }
  //#endregion

  //#region get standalone websql app port
  private get resolve_standaloneWebsqlAppPort(): number | undefined {
    //#region @backendFunc
    if (!this.project) {
      return void 0;
    }
    const resolvePort = PortUtils.instance(
      this.resolve_projectInfoPort,
    ).calculateClientPortFor(this.project, { websql: true });
    return resolvePort;
    //#endregion
  }
  //#endregion
}
