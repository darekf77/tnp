import { EnvOptions } from '../../../../../../options';
import type { Project } from '../../../../project';
import { BaseCopyManger } from './base-copy-manager';
export declare abstract class CopyManager extends BaseCopyManger {
    static for(project: Project): CopyManager;
    abstract init(buildOptions: EnvOptions, renameDestinationFolder?: string): void;
}
