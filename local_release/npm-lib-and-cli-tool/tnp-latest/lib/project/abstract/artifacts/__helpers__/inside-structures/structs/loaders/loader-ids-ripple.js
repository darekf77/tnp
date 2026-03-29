"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idsRipple = idsRipple;
const inside_struct_constants_1 = require("../inside-struct-constants");
function idsRipple(color = 'blue', preloader = false) {
    return `
<style>
  .lds-ripple {
    display: block;
    position: absolute;
    width: 80px;
    height: 80px;
    left: 50%;
    top: 48%;
    transform: translate(-50%, -50%);
  }
  .lds-ripple div {
    position: absolute;
    border: 4px solid ${color};
    opacity: 1;
    border-radius: 50%;
    animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  }
  .lds-ripple div:nth-child(2) {
    animation-delay: -0.5s;
  }
  @keyframes lds-ripple {
    0% {
      top: 36px;
      left: 36px;
      width: 0;
      height: 0;
      opacity: 0;
    }
    4.9% {
      top: 36px;
      left: 36px;
      width: 0;
      height: 0;
      opacity: 0;
    }
    5% {
      top: 36px;
      left: 36px;
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      top: 0px;
      left: 0px;
      width: 72px;
      height: 72px;
      opacity: 0;
    }
  }
</style>

<div ${preloader ? inside_struct_constants_1.ID_LOADER_PRE_BOOTSTRAP : inside_struct_constants_1.PRE_LOADER_NG_IF_INITED}  class="lds-ripple"><div></div><div></div></div>

  `;
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/__helpers__/inside-structures/structs/loaders/loader-ids-ripple.js.map