import { ReleaseArtifactTaon } from '../../../../../options';
import { InsideStruct } from '../../__helpers__/inside-structures/inside-struct';
import { BaseInsideStruct } from '../../__helpers__/inside-structures/structs/base-inside-struct';
export declare class InsideStructAngularApp extends BaseInsideStruct {
    getCurrentArtifact(): ReleaseArtifactTaon;
    get isElectron(): boolean;
    private resolveTmpProjectStandalonePath;
    insideStruct(): InsideStruct;
}
