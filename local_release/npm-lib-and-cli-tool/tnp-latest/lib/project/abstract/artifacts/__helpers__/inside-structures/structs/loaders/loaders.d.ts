export declare const globaLoaders: {
    'lds-default': (color: any, preload: any) => string;
    'lds-ellipsis': (color: any, preload: any) => string;
    'lds-facebook': (color: any, preload: any) => string;
    'lds-grid': (color: any, preload: any) => string;
    'lds-heart': (color: any, preload: any) => string;
    'lds-ripple': (color: any, preload: any) => string;
};
export declare function getLoader(loaderName?: keyof typeof globaLoaders, color?: string): any;
