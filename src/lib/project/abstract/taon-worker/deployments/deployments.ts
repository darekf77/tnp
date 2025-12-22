//#region imports
import { MulterFileUploadResponse, Taon, TaonEntity } from 'taon/src';
import { TaonBaseEntity, PrimaryGeneratedColumn, CreateDateColumn, Column, String100Column, String45Column, String200Column, NumberColumn, VersionColumn } from 'taon/src';
import { _, chalk, CoreModels, dateformat, path } from 'tnp-core/src';
import { FilePathMetaData } from 'tnp-core/src';

import { keysMap } from '../../../../constants';
import { ReleaseArtifactTaon, ReleaseType } from '../../../../options';

import { DeploymentsDefaultsValues } from './deployments.defaults-values';
import { DeploymentReleaseData, DeploymentsStatus } from './deployments.models';

//#endregion

@TaonEntity({
  className: 'Deployments',
})
export class Deployments
  extends TaonBaseEntity<Deployments>
  implements DeploymentReleaseData
{

  //#region @websql
  @PrimaryGeneratedColumn()
  //#endregion

  id: string;

  //#region base file name with hash datetime

  //#region @websql
  @Column({
    type: 'varchar',
    length: 500,
    unique: true,
  })
  //#endregion

  baseFileNameWithHashDatetime?: string;
  //#endregion

  //#region size

  //#region @websql
  @NumberColumn()
  //#endregion

  size: MulterFileUploadResponse['size'];
  //#endregion

  //#region status

  //#region @websql
  @Column({
    type: 'varchar',
    length: 20,
    default: DeploymentsStatus.NOT_STARTED,
  })
  //#endregion

  status: DeploymentsStatus;
  //#endregion

  //#region project name

  //#region @websql
  @String100Column()
  //#endregion

  projectName: string;
  //#endregion

  //#region environment name

  //#region @websql
  @String100Column()
  //#endregion

  envName: CoreModels.EnvironmentNameTaon;
  //#endregion

  //#region environment number

  //#region @websql
  @String45Column()
  //#endregion

  envNumber: string;
  //#endregion

  //#region target artifact

  //#region @websql
  @String45Column()
  //#endregion

  targetArtifact: ReleaseArtifactTaon;
  //#endregion

  //#region target artifact

  //#region @websql
  @String45Column()
  //#endregion

  releaseType: ReleaseType;
  //#endregion

  //#region project version

  //#region @websql
  @VersionColumn()
  //#endregion

  version: string;
  //#endregion

  //#region destination domain

  //#region @websql
  @String200Column()
  //#endregion

  destinationDomain: string;
  //#endregion

  //#region process compose up id

  //#region @websql
  @String45Column()
  //#endregion

  processIdComposeUp?: string | null;
  //#endregion

  //#region process compose down id

  //#region @websql
  @String45Column()
  //#endregion

  processIdComposeDown?: string | null;
  //#endregion

  //#region arrival date

  //#region @websql
  @CreateDateColumn()
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
      `${this.id} ${this.destinationDomain || '<unknown-domain>'} v${this.version} ` +
      `(${this.status}) ` +
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
      `Status (${boldFn(this.status || '- unknown version -')})`,
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
