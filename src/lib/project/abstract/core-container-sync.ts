import { fse, path, child_process, crossPlatformPath } from 'tnp-core/src';
import { Helpers } from 'tnp-core/src';

import { Project } from './project';

export class CoreContainerSync {
  private readonly source: Project;

  private readonly target: Project;

  private readonly sourceRoot: string;

  private readonly targetRoot: string;

  private readonly syncRef = 'refs/taon-sync/tnp-core';

  private stashCommit?: string;

  private fetchAttempted = false;

  private synchronizationCompleted = false;

  constructor(source: Project, target: Project) {
    this.source = source;
    this.target = target;

    this.sourceRoot = path.resolve(path.dirname(source.location));
    this.targetRoot = path.resolve(path.dirname(target.location));
  }

  async run(): Promise<void> {
    //#region @backendFunc
    this.logLocations();

    if (this.sourceRoot === this.targetRoot) {
      Helpers.info(`Source and target are the same repository.`);
      return;
    }

    this.validateRepositories();
    this.validateSyncRef();

    try {
      // this.backupTargetChanges();
      try {
        this.runGit(['reset', '--hard']);
      } catch (error) {}

      try {
        this.runGit(['clean', '-fd']);
      } catch (error) {}

      if (
        this.source.git.lastCommitMessage() ===
          this.target.git.lastCommitMessage() &&
        this.source.git.lastCommitHash() !== this.target.git.lastCommitHash()
      ) {
        try {
          this.runGit(['reset', '--hard', 'HEAD~1']);
        } catch (error) {}
      }

      this.fetchSourceHistory();

      const commonCommit = this.getCommonCommit();

      Helpers.info(`Common commit: ${commonCommit}`);

      if (this.hasTargetOnlyCommits()) {
        return;
      }

      this.syncCommittedHistory();
      this.syncUncommittedSourceChanges();

      this.synchronizationCompleted = true;

      Helpers.info(`Core containers synchronized successfully.`);

      Helpers.remove(this.target.pathFor('../.vscode'));
    } finally {
      this.cleanup();
    }
    //#endregion
  }

  //#region git execution

  private runGit(args: string[], project = this.target): string {
    //#region @backendFunc
    return child_process
      .execFileSync('git', args, {
        cwd: path.resolve(path.dirname(project.location)),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 50 * 1024 * 1024,
      })
      .trim();
    //#endregion
  }

  private runGitRaw(args: string[], project = this.target): string {
    //#region @backendFunc
    return child_process.execFileSync('git', args, {
      cwd: path.resolve(path.dirname(project.location)),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 50 * 1024 * 1024,
    });
    //#endregion
  }

  private getGitLines(args: string[], project = this.target): string[] {
    //#region @backendFunc
    return this.runGit(args, project).split(/\r?\n/).filter(Boolean);
    //#endregion
  }

  private getOptionalGitRef(
    ref: string,
    project = this.target,
  ): string | undefined {
    //#region @backendFunc
    const result = child_process.spawnSync(
      'git',
      ['rev-parse', '--verify', '--quiet', ref],
      {
        cwd: path.resolve(path.dirname(project.location)),
        encoding: 'utf8',
      },
    );

    if (result.error) {
      throw result.error;
    }

    if (result.status === 1) {
      return undefined;
    }

    if (result.status !== 0) {
      throw new Error(
        `Could not resolve Git reference "${ref}": ${result.stderr}`,
      );
    }

    return result.stdout.trim() || undefined;
    //#endregion
  }

  //#endregion

  //#region validation

  private logLocations(): void {
    //#region @backendFunc
    Helpers.info(`Syncing TNP core container`);
    Helpers.info(`Source: ${crossPlatformPath(this.sourceRoot)}`);
    Helpers.info(`Target: ${crossPlatformPath(this.targetRoot)}`);
    //#endregion
  }

  private validateRepositories(): void {
    //#region @backendFunc
    for (const project of [this.source, this.target]) {
      const repositoryRoot = path.resolve(
        this.runGit(['rev-parse', '--show-toplevel'], project),
      );

      const expectedRoot = path.resolve(path.dirname(project.location));

      const sameRoot =
        process.platform === 'win32'
          ? repositoryRoot.toLowerCase() === expectedRoot.toLowerCase()
          : repositoryRoot === expectedRoot;

      if (!sameRoot) {
        throw new Error(`Unexpected Git repository root: ${repositoryRoot}`);
      }

      const gitDir = this.runGit(['rev-parse', '--absolute-git-dir'], project);

      const unfinishedOperations = [
        'rebase-merge',
        'rebase-apply',
        'MERGE_HEAD',
        'CHERRY_PICK_HEAD',
        'REVERT_HEAD',
        'BISECT_LOG',
      ];

      if (
        unfinishedOperations.some(name =>
          fse.existsSync(path.join(gitDir, name)),
        )
      ) {
        throw new Error(`Unfinished Git operation in ${project.location}`);
      }
    }
    //#endregion
  }

  private validateSyncRef(): void {
    //#region @backendFunc
    const existingRef = this.getOptionalGitRef(this.syncRef);

    if (existingRef) {
      throw new Error(
        `Temporary synchronization reference already exists: ${this.syncRef}`,
      );
    }
    //#endregion
  }

  //#endregion

  //#region backup and restore

  private backupTargetChanges(): void {
    //#region @backendFunc
    const status = this.runGitRaw([
      'status',
      '--porcelain=v1',
      '-z',
      '--untracked-files=all',
    ]);

    if (!status.length) {
      return;
    }

    Helpers.info(`Backing up target changes...`);

    const stashBefore = this.getOptionalGitRef('refs/stash');

    this.runGit([
      'stash',
      'push',
      '--include-untracked',
      '-m',
      'taon-core-sync-backup',
    ]);

    const stashAfter = this.getOptionalGitRef('refs/stash');

    if (!stashAfter || stashAfter === stashBefore) {
      throw new Error(`Unable to stash target changes before synchronization.`);
    }

    this.stashCommit = stashAfter;
    //#endregion
  }

  private restoreTargetChanges(): void {
    //#region @backendFunc
    if (!this.stashCommit) {
      return;
    }

    Helpers.info(`Restoring previous target changes...`);

    try {
      this.runGit(['stash', 'apply', '--index', this.stashCommit]);

      const currentStash = this.getOptionalGitRef('refs/stash');

      if (currentStash === this.stashCommit) {
        this.runGit(['stash', 'drop', 'stash@{0}']);
      }

      Helpers.info(`Previous target changes restored.`);
    } catch (error) {
      Helpers.warn(
        `Could not automatically restore target changes. ` +
          `Your backup remains in Git stash: ${this.stashCommit}`,
      );

      if (this.synchronizationCompleted) {
        throw error;
      }
    }
    //#endregion
  }

  private cleanup(): void {
    //#region @backendFunc
    if (this.fetchAttempted) {
      try {
        this.runGit(['update-ref', '-d', this.syncRef]);
      } catch {
        Helpers.warn(
          `Could not remove temporary Git reference: ${this.syncRef}`,
        );
      }
    }

    // this.restoreTargetChanges();
    //#endregion
  }

  //#endregion

  //#region fetch and history synchronization

  private fetchSourceHistory(): void {
    //#region @backendFunc
    Helpers.info(`Fetching local TNP history...`);

    this.fetchAttempted = true;

    this.runGit([
      '-c',
      'protocol.file.allow=always',
      'fetch',
      '--no-tags',
      '--no-write-fetch-head',
      this.sourceRoot,
      `HEAD:${this.syncRef}`,
    ]);
    //#endregion
  }

  private getCommonCommit(): string {
    //#region @backendFunc
    try {
      const commit = this.runGit(['merge-base', 'HEAD', this.syncRef]);

      if (!commit) {
        throw new Error();
      }

      return commit;
    } catch {
      throw new Error(`Core containers do not share a common commit.`);
    }
    //#endregion
  }

  private hasTargetOnlyCommits(): boolean {
    //#region @backendFunc
    const commits = this.getGitLines(['rev-list', `${this.syncRef}..HEAD`]);

    if (!commits.length) {
      return false;
    }

    Helpers.warn(
      `Please update from git your local ` +
        `tnp taon-containers. ` +
        `Core container has ${commits.length} ` +
        `commit(s) not present in TNP core container.`,
    );

    return true;
    //#endregion
  }

  private syncCommittedHistory(): void {
    //#region @backendFunc
    const commits = this.getGitLines([
      'rev-list',
      '--reverse',
      `HEAD..${this.syncRef}`,
    ]);

    if (!commits.length) {
      Helpers.info(`Git commits already synchronized.`);
      return;
    }

    Helpers.info(`Synchronizing ${commits.length} commits...`);

    this.runGit(['merge', '--ff-only', this.syncRef]);
    //#endregion
  }

  //#endregion

  //#region uncommitted file synchronization

  private syncUncommittedSourceChanges(): void {
    //#region @backendFunc
    const status = this.runGitRaw(
      ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
      this.source,
    );

    const changedPaths = this.getChangedPaths(status);

    Helpers.info(`Synchronizing ${changedPaths.size} changed files...`);

    for (const relativePath of changedPaths) {
      this.syncFile(relativePath);
    }
    //#endregion
  }

  private getChangedPaths(status: string): Set<string> {
    //#region @backendFunc
    const entries = status.split('\0').filter(Boolean);
    const changedPaths = new Set<string>();

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      const fileStatus = entry.slice(0, 2);
      const relativePath = entry.slice(3);

      changedPaths.add(relativePath);

      if (fileStatus.includes('R') || fileStatus.includes('C')) {
        const originalPath = entries[++i];

        if (fileStatus.includes('R') && originalPath) {
          changedPaths.add(originalPath);
        }
      }
    }

    return changedPaths;
    //#endregion
  }

  private syncFile(relativePath: string): void {
    //#region @backendFunc
    const sourcePath = this.resolveSafePath(this.sourceRoot, relativePath);

    const targetPath = this.resolveSafePath(this.targetRoot, relativePath);

    if (!fse.existsSync(sourcePath)) {
      fse.removeSync(targetPath);
      return;
    }

    const stat = fse.lstatSync(sourcePath);

    if (stat.isSymbolicLink()) {
      const linkTarget = fse.readlinkSync(sourcePath);

      fse.removeSync(targetPath);
      fse.ensureSymlinkSync(linkTarget, targetPath);

      return;
    }

    if (!stat.isFile()) {
      return;
    }

    fse.ensureDirSync(path.dirname(targetPath));
    fse.removeSync(targetPath);
    fse.copyFileSync(sourcePath, targetPath);
    fse.chmodSync(targetPath, stat.mode);
    //#endregion
  }

  private resolveSafePath(root: string, relativePath: string): string {
    //#region @backendFunc
    const absolutePath = path.resolve(root, relativePath);
    const relative = path.relative(root, absolutePath);

    if (
      relative === '' ||
      relative === '..' ||
      relative.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relative)
    ) {
      throw new Error(`Invalid repository path: ${relativePath}`);
    }

    const parts = relative.split(path.sep);

    if (parts.some(part => part.toLowerCase() === '.git')) {
      throw new Error(`Cannot synchronize Git metadata: ${relativePath}`);
    }

    return absolutePath;
    //#endregion
  }

  //#endregion
}
