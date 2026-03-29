"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idsHeart = idsHeart;
const inside_struct_constants_1 = require("../inside-struct-constants");
function idsHeart(color = 'red', preloader = false) {
    return `
<style>
  .lds-heart {
    display: block;
    position: absolute;
    width: 80px;
    height: 80px;
    left: calc(50% - 40px);
    top: calc(48% - 40px);
    transform: rotate(45deg);
    transform-origin: 40px 40px;
  }
  .lds-heart div {
    top: 32px;
    left: 32px;
    position: absolute;
    width: 32px;
    height: 32px;
    background: ${color};
    animation: lds-heart 1.2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  .lds-heart div:after,
  .lds-heart div:before {
    content: " ";
    position: absolute;
    display: block;
    width: 32px;
    height: 32px;
    background: ${color};
  }
  .lds-heart div:before {
    left: -24px;
    border-radius: 50% 0 0 50%;
  }
  .lds-heart div:after {
    top: -24px;
    border-radius: 50% 50% 0 0;
  }
  @keyframes lds-heart {
    0% {
      transform: scale(0.95);
    }
    5% {
      transform: scale(1.1);
    }
    39% {
      transform: scale(0.85);
    }
    45% {
      transform: scale(1);
    }
    60% {
      transform: scale(0.95);
    }
    100% {
      transform: scale(0.9);
    }
  }
</style>

<div ${preloader ? inside_struct_constants_1.ID_LOADER_PRE_BOOTSTRAP : inside_struct_constants_1.PRE_LOADER_NG_IF_INITED}  class="lds-heart"><div></div></div>

  `;
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/__helpers__/inside-structures/structs/loaders/loader-ids-heart.js.map