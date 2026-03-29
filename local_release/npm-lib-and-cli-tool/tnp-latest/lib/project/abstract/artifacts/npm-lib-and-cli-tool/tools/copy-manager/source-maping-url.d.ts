import { EnvOptions } from '../../../../../../options';
export declare class SourceMappingUrl {
    private absFilePath;
    static readonly SOURCEMAPDES = "//# sourceMappingURL=";
    static fixContent(absFilePath: string, buildOptions: EnvOptions): string;
    private readonly content;
    private readonly contentLines;
    private readonly mappingLineIndex;
    private constructor();
    process(buildOptions: EnvOptions): string;
}
