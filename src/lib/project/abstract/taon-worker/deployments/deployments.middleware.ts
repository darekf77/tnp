//#region imports
import * as crypto from 'crypto';

import * as multer from 'multer';
import { Taon, TaonBaseFileUploadMiddleware, TaonMiddleware } from 'taon/src';
import { fse, path, UtilsOs } from 'tnp-core/src';
import { _, crossPlatformPath } from 'tnp-core/src';

import { DEPLOYMENT_LOCAL_FOLDER_PATH } from './deployments.constants';

//#endregion

@TaonMiddleware({
  className: 'DeploymentsMiddleware',
})
export class DeploymentsMiddleware extends TaonBaseFileUploadMiddleware {
  uploadDir(): string {
    return DEPLOYMENT_LOCAL_FOLDER_PATH;
  }

  storage(): multer.StorageEngine {

    //#region @backendFunc
    const uploadDir = this.uploadDir();
    if (!fse.existsSync(uploadDir)) {
      try {
        fse.mkdirSync(uploadDir, { recursive: true });
      } catch (error) {}
    }
    return multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const base = path.basename(file.originalname, ext);

        const uniq = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
        const filenameToProcess = `${base}-${uniq}${ext}`;
        cb(null, filenameToProcess);
      },
    });
    //#endregion

  }
}
