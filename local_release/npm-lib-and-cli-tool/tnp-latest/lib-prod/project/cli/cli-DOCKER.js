import { HelpersTaon__NS__CLIWRAP } from 'tnp-helpers/lib-prod';
import { BaseCli } from './base-cli';
// @ts-ignore TODO weird inheritance problem
class $Docker extends BaseCli {
    _() {
        console.log(`Hello from taon Docker CLI!`);
        this._exit();
    }
}
export default {
    $Docker: HelpersTaon__NS__CLIWRAP($Docker, '$Docker'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-DOCKER.js.map