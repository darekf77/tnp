import { CoreModels__NS__ManifestIcon } from 'tnp-core/lib-prod';
import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';
import type { Project } from '../../project';
/**
 * Automatically brand you project (based on logo.png, taon.json, etc)
 */ export declare class Branding extends BaseFeatureForProject<Project> {
    private get path();
    get exist(): boolean;
    get htmlIndexRepaceTag(): string;
    get htmlLinesToAdd(): string[];
    get iconsToAdd(): CoreModels__NS__ManifestIcon[];
    apply(force?: boolean): Promise<void>;
    createPngIconsFromPngLogo(absPathToLogoPng: string, absPathDestinationVscodeLogoPng: string): Promise<void>;
    generateLogoFroVscodeLocations(): Promise<void>;
}
