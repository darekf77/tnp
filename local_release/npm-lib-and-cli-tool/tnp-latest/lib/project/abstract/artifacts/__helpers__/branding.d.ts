import { CoreModels } from 'tnp-core';
import { BaseFeatureForProject } from 'tnp-helpers';
import type { Project } from '../../project';
/**
 * Automatically brand you project (based on logo.png, taon.json, etc)
 */ export declare class Branding extends BaseFeatureForProject<Project> {
    private get path();
    get exist(): boolean;
    get htmlIndexRepaceTag(): string;
    get htmlLinesToAdd(): string[];
    get iconsToAdd(): CoreModels.ManifestIcon[];
    apply(force?: boolean): Promise<void>;
    createPngIconsFromPngLogo(absPathToLogoPng: string, absPathDestinationVscodeLogoPng: string): Promise<void>;
    generateLogoFroVscodeLocations(): Promise<void>;
}