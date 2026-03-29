"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEPLOYMENT_LOCAL_FOLDER_PATH = void 0;
const lib_1 = require("tnp-core/lib");
exports.DEPLOYMENT_LOCAL_FOLDER_PATH = (0, lib_1.crossPlatformPath)([
    lib_1.UtilsOs.getRealHomeDir(),
    lib_1.dotTaonFolder,
    'deployments',
]);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/deployments/deployments.constants.js.map