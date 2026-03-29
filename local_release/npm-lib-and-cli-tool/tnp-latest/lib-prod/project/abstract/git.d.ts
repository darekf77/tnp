import { BaseGit } from 'tnp-helpers/lib-prod';
import type { Project } from './project';
export declare class Git extends BaseGit<Project> {
    /**
     * @overload
     */
    isUsingActionCommit(): boolean;
    /**
     * @deprecated
     */
    __removeTagAndCommit(autoReleaseUsingConfig: boolean): void;
    useGitBranchesWhenCommitingAndPushing(): boolean;
    useGitBranchesAsMetadataForCommits(): boolean;
    protected _beforePushProcessAction(setOrigin: 'ssh' | 'http'): Promise<void>;
    protected removeUnnecessaryFoldersAfterPullingFromGit(): Promise<void>;
    protected _afterPullProcessAction(setOrigin: 'ssh' | 'http'): Promise<void>;
    automaticallyAddAllChangesWhenPushingToGit(): boolean;
    duringPushWarnIfProjectNotOnSpecyficDevBranch(): string;
    getDefaultDevelopmentBranch(): string;
}
