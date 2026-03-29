//#region imports
import { config, fileName, LibTypeEnum } from 'tnp-core/lib-prod';
import { crossPlatformPath, path } from 'tnp-core/lib-prod';
import { Helpers__NS__exists, Helpers__NS__info, Helpers__NS__log, Helpers__NS__logInfo, Helpers__NS__mkdirp, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__taskDone, Helpers__NS__taskStarted, HelpersTaon__NS__copyFile } from 'tnp-helpers/lib-prod';
import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';
import { assetsFor, assetsFromNgProj, assetsFromNpmLib, assetsFromSrc, generatedFromAssets, iconVscode128Basename, prodSuffix, pwaGeneratedFolder, srcMainProject, tmpVscodeProj, } from '../../../../constants';
import { ReleaseTypeWithDevelopmentArr } from '../../../../options';
//#endregion
const htmlBasename = 'html-pwa.html';
const generatedPwa = [generatedFromAssets, pwaGeneratedFolder];
const subPath = [srcMainProject, assetsFromSrc, ...generatedPwa];
/**
 * Automatically brand you project (based on logo.png, taon.json, etc)
 */ // @ts-ignore TODO weird inheritance problem
export class Branding extends BaseFeatureForProject {
    //#region path
    get path() {
        //#region @backendFunc
        let proj = this.project;
        const dest = crossPlatformPath([proj.location, ...subPath]);
        return dest;
        //#endregion
    }
    //#endregion
    //#region exists
    get exist() {
        return Helpers__NS__exists([this.path, htmlBasename]);
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
        return Helpers__NS__readFile([this.path, htmlBasename]).split('\n');
        //#endregion
    }
    //#endregion
    //#region icons to add
    get iconsToAdd() {
        //#region @backendFunc
        const manifest = Helpers__NS__readJson([
            this.path,
            fileName.manifest_webmanifest,
        ]);
        return manifest.icons;
        //#endregion
    }
    //#endregion
    //#region apply
    async apply(force = false) {
        //#region @backendFunc
        if (this.project.typeIsNot(LibTypeEnum.ISOMORPHIC_LIB)) {
            console.error(`Branding is only available for isomorphic-lib projects`);
            return;
        }
        const proj = this.project;
        const sourceLogoPng = proj.pathFor(fileName.logo_png);
        if (!Helpers__NS__exists(sourceLogoPng)) {
            const coreLogoProj = this.project.ins.by(LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion);
            const coreLogoPath = coreLogoProj.pathFor(fileName.logo_png);
            HelpersTaon__NS__copyFile(coreLogoPath, sourceLogoPng);
        }
        Helpers__NS__log(`Project ${proj.genericName} branding started`);
        const dest = this.path;
        if (!force) {
            if (Helpers__NS__exists(crossPlatformPath([dest, htmlBasename]))) {
                Helpers__NS__info(`Branding already generated for ${proj.genericName}.`);
                return;
            }
        }
        let pathIcons = `/${[assetsFromNgProj, assetsFor, proj.nameForNpmPackage, assetsFromNpmLib, ...generatedPwa].join('/')}`;
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
        Helpers__NS__log(`Project ${proj.genericName} branding ended`);
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
            if (!Helpers__NS__exists(absPathToLogoPng)) {
                throw new Error(`[${config.frameworkName}/branding] Logo file does not exist at: ${absPathToLogoPng}`);
            }
            // Ensure destination directory exists
            const destDir = path.dirname(absPathDestinationVscodeLogoPng);
            if (!Helpers__NS__exists(destDir)) {
                await Helpers__NS__mkdirp(destDir);
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
        Helpers__NS__taskStarted('Creating vscode icons');
        const destinationDirnames = [
            ...ReleaseTypeWithDevelopmentArr.map(releaseType => {
                return this.project.pathFor([
                    tmpVscodeProj,
                    releaseType,
                    this.project.name,
                ]);
            }),
            ...ReleaseTypeWithDevelopmentArr.map(releaseType => {
                return this.project.pathFor([
                    tmpVscodeProj,
                    releaseType + prodSuffix,
                    this.project.name,
                ]);
            }),
        ];
        let firstPath;
        for (const destinationDirnameAbsPath of destinationDirnames) {
            const destinationIconAbsPath = crossPlatformPath([
                destinationDirnameAbsPath,
                iconVscode128Basename,
            ]);
            if (firstPath) {
                HelpersTaon__NS__copyFile(firstPath, destinationIconAbsPath);
            }
            else {
                await this.createPngIconsFromPngLogo(this.project.pathFor('logo.png'), destinationIconAbsPath);
                firstPath = destinationIconAbsPath;
            }
            Helpers__NS__logInfo(`Updated icon ${destinationIconAbsPath}`);
        }
        Helpers__NS__taskDone('Vscode icons created');
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/__helpers__/branding.js.map