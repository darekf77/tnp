//#region imports
import { MulterFileUploadResponse, Taon } from 'taon/src';
import { _, chalk, dateformat, path } from 'tnp-core/src';
import { FilePathMetaData } from 'tnp-helpers/src';

import { keysMap } from '../../../../constants';

import { DeploymentsDefaultsValues } from './deployments.defaults-values';
import { DeploymentReleaseData, DeploymentStatus } from './deployments.models';
//#endregion

@Taon.Entity({
  className: 'Deployments',
})
export class Deployments extends Taon.Base.AbstractEntity<Deployments> {
  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'varchar',
    length: 500,
    unique: true,
  })
  //#endregion
  zipFileBasenameMetadataPart?: string;

  //#region @websql
  @Taon.Orm.Column.Number()
  //#endregion
  size: MulterFileUploadResponse['size'];

  //#region @websql
  @Taon.Orm.Column.String45('not-started' as DeploymentStatus)
  //#endregion
  status?: DeploymentStatus;

  //#region @websql
  @Taon.Orm.Column.String45()
  //#endregion
  processId?: string | null;

  //#region @websql
  @Taon.Orm.Column.CreateDate()
  //#endregion
  arrivalDate?: Date;

  get releaseData(): Partial<DeploymentReleaseData> {
    const data = FilePathMetaData.extractData<DeploymentReleaseData>(
      this.zipFileBasenameMetadataPart,
      {
        keysMap,
      },
    );
    return data || ({} as Partial<DeploymentReleaseData>);
  }

  get previewString(): string {
    const r = this.releaseData;
    return (
      `${this.id} ${r.projectName || 'unknown project'} ` +
      `${this.arrivalDate ? dateformat(this.arrivalDate, 'dd-mm-yyyy HH:MM:ss') : 'unknown date'} `
    );
  }

  fullPreviewString(options?: { boldValues?: boolean }): string {
    //#region @websqlFunc
    options = options || {};
    const boldValues = !!options.boldValues;
    const r = this.releaseData;
    let envName = '';
    if (!r.envName) {
      envName = 'unknown environment';
    } else if (r.envName === '__') {
      envName = '< default >';
    } else {
      envName = `${r.envName} ${r.envNumber}`;
    }

    const boldFn = (str: string) => (boldValues ? chalk.bold(str) : str);

    return [
      `Project Name (${boldFn(r.projectName || 'unknown project')})`,
      `Version (${boldFn(r.version || 'unknown version')})`,
      `Artifact (${boldFn(r.targetArtifact || 'unknown artifact')})`,
      `Release Type (${boldFn(r.releaseType || 'unknown release type')})`,
      `Environment (${boldFn(envName)})`,
      `Arrival Date (${boldFn(
        this.arrivalDate
          ? dateformat(this.arrivalDate, 'dd-mm-yyyy HH:MM:ss')
          : 'unknown date',
      )})`,
    ].join('\n');
    //#endregion
  }
}
