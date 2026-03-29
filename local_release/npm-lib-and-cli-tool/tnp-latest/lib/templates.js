"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPORT_TEMPLATE = void 0;
const EXPORT_TEMPLATE = (folder = 'lib') => `
// import def from './${folder}';
export * from './${folder}';
// export default def;
        `.trimLeft();
exports.EXPORT_TEMPLATE = EXPORT_TEMPLATE;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/templates.js.map