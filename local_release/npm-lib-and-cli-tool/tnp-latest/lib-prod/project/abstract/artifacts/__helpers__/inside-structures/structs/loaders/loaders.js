import { ___NS__isString } from 'tnp-core/lib-prod';
import { idsDefault } from './loader-ids-default';
import { idsEllipsis } from './loader-ids-ellipsis';
import { idsFacebook } from './loader-ids-facebook';
import { idsGrid } from './loader-ids-grid';
import { idsHeart } from './loader-ids-heart';
import { idsRipple } from './loader-ids-ripple';
const defaultLoader = 'lds-default';
export const globaLoaders = {
    'lds-default': (color, preload) => idsDefault(color, preload),
    'lds-ellipsis': (color, preload) => idsEllipsis(color, preload),
    'lds-facebook': (color, preload) => idsFacebook(color, preload),
    'lds-grid': (color, preload) => idsGrid(color, preload),
    'lds-heart': (color, preload) => idsHeart(color, preload),
    'lds-ripple': (color, preload) => idsRipple(color, preload),
};
export function getLoader(loaderName = defaultLoader, color) {
    //#region @backendFunc
    if (___NS__isString(color)) {
        color = color.replace('##', '');
    }
    const loaders = {};
    Object.keys(globaLoaders).forEach(loaderKey => {
        // TODO hardcode preload to true
        loaders[loaderKey] = globaLoaders[loaderKey](color, true);
    });
    return loaders[loaderName ? loaderName : defaultLoader];
    //#endregion
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/__helpers__/inside-structures/structs/loaders/loaders.js.map