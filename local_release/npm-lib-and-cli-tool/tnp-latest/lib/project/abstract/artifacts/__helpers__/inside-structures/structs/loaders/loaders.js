"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globaLoaders = void 0;
exports.getLoader = getLoader;
const lib_1 = require("tnp-core/lib");
const loader_ids_default_1 = require("./loader-ids-default");
const loader_ids_ellipsis_1 = require("./loader-ids-ellipsis");
const loader_ids_facebook_1 = require("./loader-ids-facebook");
const loader_ids_grid_1 = require("./loader-ids-grid");
const loader_ids_heart_1 = require("./loader-ids-heart");
const loader_ids_ripple_1 = require("./loader-ids-ripple");
const defaultLoader = 'lds-default';
exports.globaLoaders = {
    'lds-default': (color, preload) => (0, loader_ids_default_1.idsDefault)(color, preload),
    'lds-ellipsis': (color, preload) => (0, loader_ids_ellipsis_1.idsEllipsis)(color, preload),
    'lds-facebook': (color, preload) => (0, loader_ids_facebook_1.idsFacebook)(color, preload),
    'lds-grid': (color, preload) => (0, loader_ids_grid_1.idsGrid)(color, preload),
    'lds-heart': (color, preload) => (0, loader_ids_heart_1.idsHeart)(color, preload),
    'lds-ripple': (color, preload) => (0, loader_ids_ripple_1.idsRipple)(color, preload),
};
function getLoader(loaderName = defaultLoader, color) {
    //#region @backendFunc
    if (lib_1._.isString(color)) {
        color = color.replace('##', '');
    }
    const loaders = {};
    Object.keys(exports.globaLoaders).forEach(loaderKey => {
        // TODO hardcode preload to true
        loaders[loaderKey] = exports.globaLoaders[loaderKey](color, true);
    });
    return loaders[loaderName ? loaderName : defaultLoader];
    //#endregion
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/__helpers__/inside-structures/structs/loaders/loaders.js.map