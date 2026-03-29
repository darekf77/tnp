import { BaseCli } from './base-cli';
/**
 # Branding of assets
- from logo.svg or logo.png
  + create icon
  + create favicons
  + create splashscreens
  + create logos inside apps

# Branding of existed modules/projects
  - rename to create similar module or project:
    + files
    + folders
    + files contents

 */ export declare class $Branding extends BaseCli {
    _(): Promise<void>;
    logoVscode(): Promise<void>;
}
declare const _default: {
    $Branding: Function;
};
export default _default;
