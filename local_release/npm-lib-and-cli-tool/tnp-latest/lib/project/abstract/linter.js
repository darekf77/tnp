"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Linter = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
class Linter // @ts-ignore TODO weird inheritance problem
// @ts-ignore TODO weird inheritance problem
 extends lib_2.BaseLinter {
    //#region getters & methods / should not enable lint and prettier
    isEnableForProject() {
        return this.project.typeIs(lib_1.LibTypeEnum.ISOMORPHIC_LIB);
    }
}
exports.Linter = Linter;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/linter.js.map