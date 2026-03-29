//#region imports
import * as crypto from 'crypto';
import * as multer from 'multer';
import { TaonBaseFileUploadMiddleware, TaonMiddleware } from 'taon/lib-prod';
import { fse, path } from 'tnp-core/lib-prod';
import { DEPLOYMENT_LOCAL_FOLDER_PATH } from './deployments.constants';
//#endregion
let DeploymentsMiddleware = class DeploymentsMiddleware extends TaonBaseFileUploadMiddleware {
    uploadDir() {
        return DEPLOYMENT_LOCAL_FOLDER_PATH;
    }
    storage() {
        //#region @backendFunc
        const uploadDir = this.uploadDir();
        if (!fse.existsSync(uploadDir)) {
            try {
                fse.mkdirSync(uploadDir, { recursive: true });
            }
            catch (error) { }
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
};
DeploymentsMiddleware = __decorate([
    TaonMiddleware({
        className: 'DeploymentsMiddleware',
    })
], DeploymentsMiddleware);
export { DeploymentsMiddleware };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/deployments/deployments.middleware.js.map