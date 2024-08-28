import { crossPlatformPath } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';
import { Project } from '../abstract/project';

export interface AppBuildConfig {
  build?: boolean;
  prod?: boolean;
  websql?: boolean;
  projName?: string;
  children?: AppBuildConfig[];
}

export class DocsAppBuildConfig extends BaseFeatureForProject<Project> {
  private get configFileName() {
    return 'docs-app-build-config.json5';
  }

  private get path() {
    return crossPlatformPath([this.project.location, this.configFileName]);
  }

  get configExists() {
    return Helpers.exists(this.path);
  }

  get config() {
    let cfg = Helpers.readJson(this.path, void 0, true) as AppBuildConfig;
    cfg = this.fix(cfg);
    return cfg;
  }

  private fix(cfg: AppBuildConfig): AppBuildConfig {
    if (!cfg) {
      cfg = { build: this.project.__isStandaloneProject };
    }
    if (this.project.__isStandaloneProject) {
      cfg.projName = this.project.name;
    }
    if (this.project.__isSmartContainer) {
      cfg.projName = this.project.__smartContainerBuildTarget.name;
    }

    cfg.build = !!cfg.build;
    cfg.prod = !!cfg.prod;
    cfg.websql = !!cfg.websql;
    cfg.children = cfg.children || [];
    if (this.project.__isSmartContainer) {
      const children = this.project.children.map(c => c.name);
      cfg.children = cfg.children.filter(c => children.includes(c.projName));
    }

    for (let index = 0; index < cfg.children.length; index++) {
      cfg.children[index] = this.fix(cfg.children[index]);
    }
    return cfg;
  }

  save(cfg: AppBuildConfig) {
    Helpers.writeFile(
      this.path,
      `// This file is generated by command: taon release
// With this configuration you can use: taon automatic:release:docs
${JSON.stringify(cfg, null, 2)}

    `,
    );
  }
}
