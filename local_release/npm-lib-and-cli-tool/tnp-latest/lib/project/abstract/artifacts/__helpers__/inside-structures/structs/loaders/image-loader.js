"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageLoader = imageLoader;
const inside_struct_constants_1 = require("../inside-struct-constants");
function imageLoader(pathToLoaderImageInAssets, preloader = false) {
    return (`
<style>
  .taon-image-pre-loader {
    display: block;
    position: absolute;
    left: 50%;
    top: 48%;
    transform: translate(-50%, -50%);
  }
  .taon-image-ngbootstrap-loader {
    display: block;
    position: absolute;
    left: 50%;
    top: 48%;
    transform: translate(-50%, -50%);
  }
</style>

<img  src="${pathToLoaderImageInAssets.replace(/\/\/\//g, '/').replace(/\/\//g, '/')}` +
        `" ${preloader ? inside_struct_constants_1.ID_LOADER_PRE_BOOTSTRAP : inside_struct_constants_1.PRE_LOADER_NG_IF_INITED}  class="taon-image-${preloader ? 'pre' : 'ngbootstrap'}-loader">

  `);
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/__helpers__/inside-structures/structs/loaders/image-loader.js.map