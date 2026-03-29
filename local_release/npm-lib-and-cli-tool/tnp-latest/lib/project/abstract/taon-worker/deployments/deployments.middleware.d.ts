import * as multer from 'multer';
import { TaonBaseFileUploadMiddleware } from 'taon';
export declare class DeploymentsMiddleware extends TaonBaseFileUploadMiddleware {
    uploadDir(): string;
    storage(): multer.StorageEngine;
}