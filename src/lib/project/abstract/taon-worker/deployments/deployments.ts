//#region imports
import { MulterFileUploadResponse, Taon } from 'taon/src';
import { _, chalk, CoreModels, dateformat, path } from 'tnp-core/src';
import { FilePathMetaData } from 'tnp-core/src';

import { keysMap } from '../../../../constants';
import { ReleaseArtifactTaon, ReleaseType } from '../../../../options';

import { DeploymentsDefaultsValues } from './deployments.defaults-values';
import { DeploymentReleaseData, DeploymentsStatus } from './deployments.models';
//#endregion

@Taon.Entity({
  className: 'Deployments',
})
export class Deployments
  extends Taon.Base.Entity<Deployments>
  implements DeploymentReleaseData
{
  //#region @websql
  @Taon.Orm.Column.Generated()
  //#endregion
  id: string;

  //#region base file name with hash datetime
  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'varchar',
    length: 500,
    unique: true,
  })
  //#endregion
  baseFileNameWithHashDatetime?: string;
  //#endregion

  //#region size
  //#region @websql
  @Taon.Orm.Column.Number()
  //#endregion
  size: MulterFileUploadResponse['size'];
  //#endregion

  //#region status
  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'varchar',
    length: 20,
    default: DeploymentsStatus.NOT_STARTED,
  })
  //#endregion
  status: DeploymentsStatus;
  //#endregion

  //#region project name
  //#region @websql
  @Taon.Orm.Column.String100()
  //#endregion
  projectName: string;
  //#endregion

  //#region environment name
  //#region @websql
  @Taon.Orm.Column.String100()
  //#endregion
  envName: CoreModels.EnvironmentNameTaon;
  //#endregion

  //#region environment number
  //#region @websql
  @Taon.Orm.Column.String45()
  //#endregion
  envNumber: string;
  //#endregion

  //#region target artifact
  //#region @websql
  @Taon.Orm.Column.String45()
  //#endregion
  targetArtifact: ReleaseArtifactTaon;
  //#endregion

  //#region target artifact
  //#region @websql
  @Taon.Orm.Column.String45()
  //#endregion
  releaseType: ReleaseType;
  //#endregion

  //#region project version
  //#region @websql
  @Taon.Orm.Column.Version()
  //#endregion
  version: string;
  //#endregion

  //#region destination domain
  //#region @websql
  @Taon.Orm.Column.String200()
  //#endregion
  destinationDomain: string;
  //#endregion

  //#region process compose up id
  //#region @websql
  @Taon.Orm.Column.String45()
  //#endregion
  processIdComposeUp?: string | null;
  //#endregion

  //#region process compose down id
  //#region @websql
  @Taon.Orm.Column.String45()
  //#endregion
  processIdComposeDown?: string | null;
  //#endregion

  //#region arrival date
  //#region @websql
  @Taon.Orm.Column.CreateDate()
  //#endregion
  arrivalDate?: Date;
  //#endregion

  //#region getters / release date
  // get releaseData(): Partial<DeploymentReleaseData> {
  //   const data = FilePathMetaData.extractData<DeploymentReleaseData>(
  //     this.baseFileNameWithHashDatetime,
  //     {
  //       keysMap,
  //     },
  //   );
  //   return data || ({} as Partial<DeploymentReleaseData>);
  // }
  //#endregion

  //#region getters / preview string
  get previewString(): string {
    return (
      `${this.id} ${this.projectName || '<unknown-project>'} ` +
      `${this.arrivalDate ? dateformat(this.arrivalDate, 'dd-mm-yyyy HH:MM:ss') : 'unknown date'} `
    );
  }
  //#endregion

  fullPreviewString(options?: { boldValues?: boolean }): string {
    //#region @websqlFunc
    options = options || {};
    const boldValues = !!options.boldValues;
    // const r = this.releaseData;
    let envName = '';
    if (!this.envName) {
      envName = 'unknown environment';
    } else if (this.envName === '__') {
      envName = '< default >';
    } else {
      envName = `${this.envName} ${this.envNumber}`;
    }

    const boldFn = (str: string) => (boldValues ? chalk.bold(str) : str);

    return [
      `Destination domain (${boldFn(this.destinationDomain || '- unknown domain -')})`,
      `Project Name (${boldFn(this.projectName || '- unknown project -')})`,
      `Version (${boldFn(this.version || '- unknown version -')})`,
      `Artifact (${boldFn(this.targetArtifact || '- unknown artifact -')})`,
      `Release Type (${boldFn(this.releaseType || '- unknown release type -')})`,
      `Environment (${boldFn(envName)})`,
      `Arrival Date (${boldFn(
        this.arrivalDate
          ? dateformat(this.arrivalDate, 'dd-mm-yyyy HH:MM:ss')
          : '- unknown date -',
      )})`,
    ].join('\n');
    //#endregion
  }
}
