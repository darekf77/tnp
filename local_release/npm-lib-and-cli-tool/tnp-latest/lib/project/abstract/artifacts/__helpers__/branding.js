"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branding = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const lib_4 = require("tnp-helpers/lib");
const constants_1 = require("../../../../constants");
const options_1 = require("../../../../options");
//#endregion
const htmlBasename = 'html-pwa.html';
const generatedPwa = [constants_1.generatedFromAssets, constants_1.pwaGeneratedFolder];
const subPath = [constants_1.srcMainProject, constants_1.assetsFromSrc, ...generatedPwa];
/**
 * Automatically brand you project (based on logo.png, taon.json, etc)
 */ // @ts-ignore TODO weird inheritance problem
class Branding extends lib_4.BaseFeatureForProject {
    //#region path
    get path() {
        //#region @backendFunc
        let proj = this.project;
        const dest = (0, lib_2.crossPlatformPath)([proj.location, ...subPath]);
        return dest;
        //#endregion
    }
    //#endregion
    //#region exists
    get exist() {
        return lib_3.Helpers.exists([this.path, htmlBasename]);
    }
    //#endregion
    //#region html index replace tag
    get htmlIndexRepaceTag() {
        const toReplace = '<!-- BRANDING_GENERATED_MANIFEST -->';
        return toReplace;
    }
    //#endregion
    //#region html lines to add
    get htmlLinesToAdd() {
        //#region @backendFunc
        return lib_3.Helpers.readFile([this.path, htmlBasename]).split('\n');
        //#endregion
    }
    //#endregion
    //#region icons to add
    get iconsToAdd() {
        //#region @backendFunc
        const manifest = lib_3.Helpers.readJson([
            this.path,
            lib_1.fileName.manifest_webmanifest,
        ]);
        return manifest.icons;
        //#endregion
    }
    //#endregion
    //#region apply
    async apply(force = false) {
        //#region @backendFunc
        if (this.project.typeIsNot(lib_1.LibTypeEnum.ISOMORPHIC_LIB)) {
            console.error(`Branding is only available for isomorphic-lib projects`);
            return;
        }
        const proj = this.project;
        const sourceLogoPng = proj.pathFor(lib_1.fileName.logo_png);
        if (!lib_3.Helpers.exists(sourceLogoPng)) {
            const coreLogoProj = this.project.ins.by(lib_1.LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion);
            const coreLogoPath = coreLogoProj.pathFor(lib_1.fileName.logo_png);
            lib_3.HelpersTaon.copyFile(coreLogoPath, sourceLogoPng);
        }
        lib_3.Helpers.log(`Project ${proj.genericName} branding started`);
        const dest = this.path;
        if (!force) {
            if (lib_3.Helpers.exists((0, lib_2.crossPlatformPath)([dest, htmlBasename]))) {
                lib_3.Helpers.info(`Branding already generated for ${proj.genericName}.`);
                return;
            }
        }
        let pathIcons = `/${[constants_1.assetsFromNgProj, constants_1.assetsFor, proj.nameForNpmPackage, constants_1.assetsFromNpmLib, ...generatedPwa].join('/')}`;
        const configuration = {
            path: pathIcons, // Path for overriding default icons path. `string`
            appName: null, // Your application's name. `string`
            appShortName: null, // Your application's short_name. `string`. Optional. If not set, appName will be used
            appDescription: null, // Your application's description. `string`
            developerName: null, // Your (or your developer's) name. `string`
            developerURL: null, // Your (or your developer's) URL. `string`
            cacheBustingQueryParam: null, // Query parameter added to all URLs that acts as a cache busting system. `string | null`
            dir: 'auto', // Primary text direction for name, short_name, and description
            lang: 'en-US', // Primary language for name and short_name
            background: '#fff', // Background colour for flattened icons. `string`
            theme_color: '#fff', // Theme color user for example in Android's task switcher. `string`
            appleStatusBarStyle: 'black-translucent', // Style for Apple status bar: "black-translucent", "default", "black". `string`
            display: 'standalone', // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
            orientation: 'any', // Default orientation: "any", "natural", "portrait" or "landscape". `string`
            scope: '/', // set of URLs that the browser considers within your app
            start_url: '/?homescreen=1', // Start URL when launching the application from a device. `string`
            preferRelatedApplications: false, // Should the browser prompt the user to install the native companion app. `boolean`
            relatedApplications: undefined, // Information about the native companion apps. This will only be used if `preferRelatedApplications` is `true`. `Array<{ id: string, url: string, platform: string }>`
            version: '1.0', // Your application's version string. `string`
            pixel_art: false, // Keeps pixels "sharp" when scaling up, for pixel art.  Only supported in offline mode.
            loadManifestWithCredentials: false, // Browsers don't send cookies when fetching a manifest, enable this to fix that. `boolean`
            manifestMaskable: false, // Maskable source image(s) for manifest.json. "true" to use default source. More information at https://web.dev/maskable-icon/. `boolean`, `string`, `buffer` or array of `string`
            icons: {
                // Platform Options:
                // - offset - offset in percentage
                // - background:
                //   * false - use default
                //   * true - force use default, e.g. set background for Android icons
                //   * color - set background for the specified icons
                //
                android: true, // Create Android homescreen icon. `boolean` or `{ offset, background }` or an array of sources
                appleIcon: true, // Create Apple touch icons. `boolean` or `{ offset, background }` or an array of sources
                appleStartup: true, // Create Apple startup images. `boolean` or `{ offset, background }` or an array of sources
                favicons: true, // Create regular favicons. `boolean` or `{ offset, background }` or an array of sources
                windows: true, // Create Windows 8 tile icons. `boolean` or `{ offset, background }` or an array of sources
                yandex: true, // Create Yandex browser icon. `boolean` or `{ offset, background }` or an array of sources
            },
            // shortcuts: [
            //   // Your applications's Shortcuts (see: https://developer.mozilla.org/docs/Web/Manifest/shortcuts)
            //   // Array of shortcut objects:
            //   {
            //     name: "View your Inbox", // The name of the shortcut. `string`
            //     short_name: "inbox", // optionally, falls back to name. `string`
            //     description: "View your inbox messages", // optionally, not used in any implemention yet. `string`
            //     url: "/inbox", // The URL this shortcut should lead to. `string`
            //     icon: "test/inbox_shortcut.png", // source image(s) for that shortcut. `string`, `buffer` or array of `string`
            //   },
            //   // more shortcuts objects
            // ],
        };
        // TODO implement for sharp for taon branding
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        lib_3.Helpers.log(`Project ${proj.genericName} branding ended`);
        //#endregion
    }
    //#endregion
    //#region create logo for vscode plugin release
    async createPngIconsFromPngLogo(absPathToLogoPng, absPathDestinationVscodeLogoPng) {
        //#region @backendFunc
        try {
            const sharePackageName = 'sharp';
            const sharp = require(sharePackageName);
            // Ensure input file exists
            if (!lib_3.Helpers.exists(absPathToLogoPng)) {
                throw new Error(`[${lib_1.config.frameworkName}/branding] Logo file does not exist at: ${absPathToLogoPng}`);
            }
            // Ensure destination directory exists
            const destDir = lib_2.path.dirname(absPathDestinationVscodeLogoPng);
            if (!lib_3.Helpers.exists(destDir)) {
                await lib_3.Helpers.mkdirp(destDir);
            }
            // Resize to 128x128 and save
            await sharp(absPathToLogoPng)
                .resize(128, 128)
                .png()
                .toFile(absPathDestinationVscodeLogoPng);
            console.log(`✅ Logo created at: ${absPathDestinationVscodeLogoPng}`);
        }
        catch (error) {
            console.error(`❌ Failed to create logo:`, error);
            throw error;
        }
        //#endregion
    }
    //#endregion
    //#region generate logo for vscode locations
    async generateLogoFroVscodeLocations() {
        //#region @backendFunc
        lib_3.Helpers.taskStarted('Creating vscode icons');
        const destinationDirnames = [
            ...options_1.ReleaseTypeWithDevelopmentArr.map(releaseType => {
                return this.project.pathFor([
                    constants_1.tmpVscodeProj,
                    releaseType,
                    this.project.name,
                ]);
            }),
            ...options_1.ReleaseTypeWithDevelopmentArr.map(releaseType => {
                return this.project.pathFor([
                    constants_1.tmpVscodeProj,
                    releaseType + constants_1.prodSuffix,
                    this.project.name,
                ]);
            }),
        ];
        let firstPath;
        for (const destinationDirnameAbsPath of destinationDirnames) {
            const destinationIconAbsPath = (0, lib_2.crossPlatformPath)([
                destinationDirnameAbsPath,
                constants_1.iconVscode128Basename,
            ]);
            if (firstPath) {
                lib_3.HelpersTaon.copyFile(firstPath, destinationIconAbsPath);
            }
            else {
                await this.createPngIconsFromPngLogo(this.project.pathFor('logo.png'), destinationIconAbsPath);
                firstPath = destinationIconAbsPath;
            }
            lib_3.Helpers.logInfo(`Updated icon ${destinationIconAbsPath}`);
        }
        lib_3.Helpers.taskDone('Vscode icons created');
        //#endregion
    }
}
exports.Branding = Branding;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/__helpers__/branding.js.map