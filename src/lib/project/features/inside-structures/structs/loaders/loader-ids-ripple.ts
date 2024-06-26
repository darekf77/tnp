import {
  ID_LOADER_PRE_BOOTSTRAP,
  PRE_LOADER_NG_IF_INITED,
} from '../inside-struct-constants';

export function idsRipple(color = 'blue', preloader = false) {
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

<div ${preloader ? ID_LOADER_PRE_BOOTSTRAP : PRE_LOADER_NG_IF_INITED}  class="lds-ripple"><div></div><div></div></div>

  `;
}
