"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("tnp-helpers/lib");
const base_cli_1 = require("./base-cli");
// @ts-ignore TODO weird inheritance problem
class $Docker extends base_cli_1.BaseCli {
    _() {
        console.log(`Hello from taon Docker CLI!`);
        this._exit();
    }
}
exports.default = {
    $Docker: lib_1.HelpersTaon.CLIWRAP($Docker, '$Docker'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-DOCKER.js.map