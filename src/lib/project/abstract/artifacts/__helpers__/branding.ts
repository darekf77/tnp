//#region imports
import { config } from 'tnp-config/src';
import { CoreModels, crossPlatformPath, path } from 'tnp-core/src';
import { fse } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import type { Project } from '../../project';
//#endregion

const htmlBasename = 'html-pwa.html';
const generatedPwa = [config.folder.generated, 'pwa'];
const subPath = [config.folder.src, config.folder.assets, ...generatedPwa];

/**
 * Automatically brand you project (based on logo.png, taon.json, etc)
 */ // @ts-ignore TODO weird inheritance problem
export class Branding extends BaseFeatureForProject<Project> {
  //#region path
  private get path(): string {
    //#region @backendFunc
    let proj = this.project;

    const dest = crossPlatformPath([proj.location, ...subPath]);
    return dest;
    //#endregion
  }
  //#endregion

  //#region exists
  get exist(): boolean {
    return Helpers.exists([this.path, htmlBasename]);
  }
  //#endregion

  //#region html index replace tag
  get htmlIndexRepaceTag(): string {
    const toReplace = '<!-- BRANDING_GENERATED_MANIFEST -->';
    return toReplace;
  }
  //#endregion

  //#region html lines to add
  get htmlLinesToAdd(): string[] {
    //#region @backendFunc
    return Helpers.readFile([this.path, htmlBasename]).split('\n');
    //#endregion
  }
  //#endregion

  //#region icons to add
  get iconsToAdd(): CoreModels.ManifestIcon[] {
    //#region @backendFunc
    const manifest = Helpers.readJson([
      this.path,
      config.file.manifest_webmanifest,
    ]) as CoreModels.PwaManifest;
    return manifest.icons;
    //#endregion
  }
  //#endregion

  //#region apply
  async apply(force = false): Promise<void> {
    //#region @backendFunc
    if (this.project.typeIsNot('isomorphic-lib')) {
      return;
    }
    const proj = this.project;

    const sourceLogoPng = crossPlatformPath([
      proj.location,
      config.file.logo_png,
    ]);

    if (!Helpers.exists(sourceLogoPng)) {
      const coreLogoProj = this.project.ins.by(
        'isomorphic-lib',
        this.project.framework.frameworkVersion,
      );
      const coreLogoPath = crossPlatformPath([
        coreLogoProj.location,
        config.file.logo_png,
      ]);
      Helpers.copyFile(coreLogoPath, sourceLogoPng);
    }

    Helpers.log(`Project ${proj.genericName} branding started`);

    const dest = this.path;

    if (Helpers.exists(crossPlatformPath([dest, htmlBasename]))) {
      Helpers.log(`Branding already generated for ${proj.genericName}.`);
      return;
    } else {
      if (!force) {
        return;
      }
    }

    let pathIcons = `/${['assets', 'assets-for', proj.name, ...generatedPwa].join('/')}`;

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
  

    Helpers.log(`Project ${proj.genericName} branding ended`);
    //#endregion
  }
  //#endregion
}