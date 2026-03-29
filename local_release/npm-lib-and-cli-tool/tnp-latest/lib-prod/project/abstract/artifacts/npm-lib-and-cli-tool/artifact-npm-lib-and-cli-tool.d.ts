import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';
import { AssetsManager } from '../angular-node-app/tools/assets-manager';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';
import { AppRoutesAutogenProvider } from './tools/app-routes-autogen-provider';
import { CopyManagerStandalone } from './tools/copy-manager/copy-manager-standalone';
import { FilesTemplatesBuilder } from './tools/files-recreation';
import { IndexAutogenProvider } from './tools/index-autogen-provider';
import { InsideStructuresLib } from './tools/inside-struct-lib';
import { CypressTestRunner } from './tools/test-runner/cypress-test-runner';
import { JestTestRunner } from './tools/test-runner/jest-test-runner';
import { MochaTestRunner } from './tools/test-runner/mocha-test-runner';
import { VitestTestRunner } from './tools/test-runner/vitest-test-runner';
export declare class ArtifactNpmLibAndCliTool extends BaseArtifact<{
    /**
     * for non org: <path-to-release-folder>/tmpLocalCopytoProjDist/my-library/node_modules/my-library
     * for org: <path-to-release-folder>/tmpLocalCopytoProjDist/my-library/node_modules/@my-library
     */
    tmpProjNpmLibraryInNodeModulesAbsPath: string;
    /**
     * check if produced package is an organization package
     * (this can be from standalone with custom name OR container organization)
     */
    isOrganizationPackage?: boolean;
    /**
     * my-library or @my-library/my-inside-lib or @my-library/my-inside-lib/deep-core-lib
     */
    packageName?: string;
}, ReleasePartialOutput> {
    readonly testsMocha: MochaTestRunner;
    readonly testsJest: JestTestRunner;
    readonly testsVite: VitestTestRunner;
    readonly testsCypress: CypressTestRunner;
    readonly copyNpmDistLibManager: CopyManagerStandalone;
    readonly insideStructureLib: InsideStructuresLib;
    readonly indexAutogenProvider: IndexAutogenProvider;
    readonly appTsRoutesAutogenProvider: AppRoutesAutogenProvider;
    readonly filesTemplatesBuilder: FilesTemplatesBuilder;
    readonly assetsManager: AssetsManager;
    constructor(project: Project);
    initPartial(initOptions: EnvOptions): Promise<EnvOptions>;
    buildPartial(buildOptions: EnvOptions, opt?: {
        normalBuildBeforeProd: boolean;
    }): Promise<{
        tmpProjNpmLibraryInNodeModulesAbsPath: string;
        isOrganizationPackage?: boolean;
        packageName?: string;
    }>;
    releasePartial(releaseOptions: EnvOptions): Promise<ReleasePartialOutput>;
    clearPartial(options?: EnvOptions): Promise<void>;
    /**
     * TODO
     * @param options
     * @returns
     */
    clearLib(options: EnvOptions): Promise<void>;
    unlinkNodeModulesWhenTnp(): void;
    private fixPackageJsonForRelease;
    private runAfterReleaseJsCodeActions;
    private preparePackageJsonForReleasePublish;
    private removeNotNpmRelatedFilesFromReleaseBundle;
    private outputFixNgLibBuild;
    private packResource;
    private copyEssentialFilesTo;
    private copyWhenExist;
    private linkWhenExist;
    private backendMinifyCode;
    private backendObscureCode;
    /**
     * because of that
     * In vscode there is a mess..
     * TODO
     */
    private backendRemoveJsMapsFrom;
    /**
     * remove dts files from release
     */
    private backendReleaseRemoveDts;
    private creteBuildInfoFile;
    private showMesageWhenBuildLibDone;
    backendIncludeNodeModulesInCompilation(releaseAbsLocation: string, minify: boolean, prod: boolean): Promise<void>;
}
