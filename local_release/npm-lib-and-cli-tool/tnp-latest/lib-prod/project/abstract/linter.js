import { LibTypeEnum } from 'tnp-core/lib-prod';
import { BaseLinter } from 'tnp-helpers/lib-prod';
export class Linter // @ts-ignore TODO weird inheritance problem
// @ts-ignore TODO weird inheritance problem
 extends BaseLinter {
    //#region getters & methods / should not enable lint and prettier
    isEnableForProject() {
        return this.project.typeIs(LibTypeEnum.ISOMORPHIC_LIB);
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/linter.js.map