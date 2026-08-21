//#region imports
import * as MarkdownIt from 'markdown-it'; // @backend
import {
  UtilsFilesFoldersSync,
  path,
  _,
  UtilsMdDocs,
  fse,
  crossPlatformPath,
  config,
  tnpPackageName,
  UtilsStringRegex,
  chalk,
  TAGS,
  taonCutNextLineCut,
  taonSkipCut,
} from 'tnp-core/src';
import { BaseFeatureForProject, Helpers } from 'tnp-helpers/src';

import {
  replaceAssetsLinksForApp,
  // replaceSrcAssetsWithRemoveTag,
} from '../../../../app-utils';
import {
  assetsFor,
  assetsFromNgProj,
  assetsFromNpmPackage,
  assetsFromSrc,
  assetsFromTempSrc,
  docsMainProject,
  generatedDocsFromMd,
  libFromSrc,
  sharedFromAssets,
  sourceLinkInNodeModules,
  srcMainProject,
} from '../../../../constants';
import { EnvOptions } from '../../../../options';
import { Project } from '../../project';
//#endregion

//#region util md to html
export class UtilsMdToHtml {
  //#region @backend
  private static readonly md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false,
    breaks: false,
  });
  //#endregion

  static transform(content: string): string {
    //#region @backendFunc
    // content = this.removeRenderDirectives(content);
    return this.md.render(content);
    //#endregion
  }

  private static removeRenderDirectives(content: string): string {
    return content
      .replace(/<!--\s*@render\s+(['"])(.*?)\1(?:\s+\{[\s\S]*?\})?\s*-->/g, '')
      .replace(/^\s*\/\/\s*@render\s+(['"])(.*?)\1(?:\s+\{.*\})?\s*$/gm, '');
  }
}
//#endregion

//#region index data
export interface IndexedData {
  orgMdFilesName: string;
  content: string;
}
//#endregion

// @ts-ignore TODO weird inheritance problem
export class DocsLibraryGenrator extends BaseFeatureForProject<Project> {
  //#region temporary md docs folder
  get temporaryMdDocsFolderAbsPath(): string {
    return this.project.pathFor(`.${config.frameworkName}/tmp-temp-docs`);
  }
  //#endregion

  //#region temporary md docs folder
  get sharedMdDocsAssetsFolderAbsPath(): string {
    return this.project.pathFor([
      srcMainProject,
      assetsFromSrc,
      sharedFromAssets,
      generatedDocsFromMd,
    ]);
  }
  //#endregion

  //#region all md files abs path
  private get allMdFilesAbsPathsFromTemporaryPath(): string[] {
    //#region @backendFunc
    return UtilsFilesFoldersSync.getFilesFrom(
      this.temporaryMdDocsFolderAbsPath,
      {
        recursive: true,
        followSymlinks: false,
      },
    ).filter(f => f.toLowerCase().endsWith('.md'));
    //#endregion
  }
  //#endregion

  //#region get unifedied name from package
  protected getUnifiedNameFromPackage(packageName: string): string {
    const [org, name] = packageName.split('/');
    return packageName.startsWith('@')
      ? `${_.upperFirst(_.camelCase(org))}__${_.upperFirst(_.camelCase(name))}`
      : _.upperFirst(_.camelCase(packageName));
  }
  //#endregion

  //#region get route name from package
  protected getRoutesNameFromPackage(packageName: string): string {
    const routesName =
      this.getUnifiedNameFromPackage(packageName) + 'DocsRoutes';
    return routesName;
  }
  //#endregion

  //#region get route name from package
  protected getRoutesNameFromFilePath(relativeFilePath: string): string {
    const routesName = _.upperFirst(_.camelCase(relativeFilePath)) + 'Routes';
    return routesName;
  }
  //#endregion

  //#region get component name from package
  protected getComponentNameFromPackage(packageName: string): string {
    const ComponentNameFromPackage =
      this.getUnifiedNameFromPackage(packageName) + 'Component';
    return ComponentNameFromPackage;
  }
  //#endregion

  //#region get component name from relative file path
  protected getComponentNameFromFilePath(relativeFilePath: string): string {
    const ComponentNameFromFilePath =
      _.upperFirst(_.camelCase(relativeFilePath)) + 'Component';
    return ComponentNameFromFilePath;
  }
  //#endregion

  //#region all md files abs path
  private get allMdFilesAbsPaths(): string[] {
    //#region @backendFunc
    return [
      ...UtilsFilesFoldersSync.getFilesFrom(this.project.location, {
        recursive: false,
        omitPatterns: UtilsFilesFoldersSync.IGNORE_FOLDERS_FILES_PATTERNS,
        followSymlinks: true,
      }).filter(f => f.toLowerCase().endsWith('.md')),
      ...UtilsFilesFoldersSync.getFilesFrom(
        this.project.pathFor(docsMainProject),
        {
          recursive: true,
          followSymlinks: false,
        },
      ).filter(f => f.toLowerCase().endsWith('.md')),
    ];
    //#endregion
  }
  //#endregion

  //#region analyz what packages requred
  public analyzeAndGetWhatDocsPackagesRequired(
    packageName: string,
    alreadyAnalyzed: string[] = [],
  ): string[] {
    const project = this.getProjectFromPackage(packageName);
    if (!project) {
      return alreadyAnalyzed;
    }
    const allMdFiles =
      project.artifactsManager.artifact.docsWebapp.docsGen.allMdFilesAbsPaths;
    const newPackages = [] as string[];

    if (!alreadyAnalyzed.includes(packageName)) {
      alreadyAnalyzed.push(packageName);
    }

    for (const mdFileAbsPAth of allMdFiles) {
      const content = UtilsFilesFoldersSync.readFile(mdFileAbsPAth) || '';
      const links = UtilsMdDocs.getRenderImports(content);
      for (const link of links) {
        if (
          !link.isLocal &&
          link.packageName &&
          !alreadyAnalyzed.includes(link.packageName)
        ) {
          alreadyAnalyzed.push(link.packageName);
          newPackages.push(link.packageName);
        }
      }
    }

    for (const packageName of newPackages) {
      this.analyzeAndGetWhatDocsPackagesRequired(packageName, alreadyAnalyzed);
    }

    return alreadyAnalyzed;
  }
  //#endregion

  //#region get project from package
  protected getProjectFromPackage(packageName): Project {
    //#region @backendFunc
    const pathToSourceLInk =
      this.project.framework.coreContainer.nodeModules.pathFor([
        packageName,
        sourceLinkInNodeModules,
      ]);

    if (!Helpers.exists(pathToSourceLInk)) {
      Helpers.error(
        `Please build project: ${packageName}`,
        config.frameworkName === tnpPackageName,
        true,
      );
      return;
    }

    const pathToProjectReal = crossPlatformPath(
      fse.realpathSync(pathToSourceLInk),
    );

    const projectWithMdFiles = this.ins.nearestTo(pathToProjectReal) as Project;
    if (!projectWithMdFiles) {
      Helpers.error(`Can get project from ${pathToProjectReal}`);
    }
    return projectWithMdFiles;
    //#endregion
  }
  //#endregion

  //#region copy all md file to temporary path
  protected copyAllMdFilesToTemporaryPath(packages: string[]): void {
    //#region @backendFunc
    for (const packageName of packages) {
      const proj = this.getProjectFromPackage(packageName);
      if (!proj) {
        continue;
      }
      const allMdFiles =
        proj.artifactsManager.artifact.docsWebapp.docsGen.allMdFilesAbsPaths;

      for (const mdFileAbsPath of allMdFiles) {
        const relativePath = mdFileAbsPath.replace(proj.location + '/', '');
        const destinationInTempFolderAbsPath = crossPlatformPath([
          this.temporaryMdDocsFolderAbsPath,
          this.getUnifiedNameFromPackage(packageName),
          relativePath,
        ]);
        let content = UtilsFilesFoldersSync.readFile(mdFileAbsPath) || '';

        const assetsFromMd = UtilsMdDocs.getAssetsFromFile(mdFileAbsPath);

        for (const assetRelativePathFromFile of assetsFromMd) {
          const hasSlash = relativePath.includes('/');
          const slash = hasSlash ? '/' : '';

          const relativeAssetPath = relativePath.replace(
            slash + path.basename(relativePath),
            slash + assetRelativePathFromFile,
          );

          // console.log({ relativeAssetPath });

          content = content.replace(
            relativeAssetPath,
            crossPlatformPath([
              srcMainProject,
              assetsFromSrc,
              sharedFromAssets,
              generatedDocsFromMd,
              this.getUnifiedNameFromPackage(packageName),
              relativeAssetPath,
            ]),
          );

          if (UtilsStringRegex.containsNonAscii(relativeAssetPath)) {
            Helpers.warn(
              `Omitting file with non-ascii characters in path: ${relativeAssetPath}`,
            );
            continue;
          }

          const assetSourcetAbsPath = this.project.pathFor(relativeAssetPath);

          const assetDestLocationAbsPath = crossPlatformPath([
            this.sharedMdDocsAssetsFolderAbsPath,
            this.getUnifiedNameFromPackage(packageName),
            relativeAssetPath,
          ]);

          Helpers.logInfo(
            `Copy asset
          "${assetRelativePathFromFile}"
          "${chalk.bold(relativeAssetPath)}"
          to "${assetDestLocationAbsPath}"
          `,
          );

          UtilsFilesFoldersSync.copyFile(
            assetSourcetAbsPath,
            assetDestLocationAbsPath,
          );
        }

        UtilsFilesFoldersSync.writeFile(
          destinationInTempFolderAbsPath,
          content,
        );
        // UtilsFilesFoldersSync.copyFile(mdFileAbsPath, destinationInTempFolder);
      }
    }
    //#endregion
  }
  //#endregion

  //#region recreaste libraries ts files from md files
  protected recreateMdFilesComponents(): void {
    //#region @backendFunc

    const allMdFiles = this.allMdFilesAbsPathsFromTemporaryPath;
    for (const mdFileAbsPAth of allMdFiles) {
      const relativePath = mdFileAbsPAth.replace(
        this.temporaryMdDocsFolderAbsPath + '/',
        '',
      );

      const newPathToComponentTs = this.project.pathFor([
        srcMainProject,
        libFromSrc,
        generatedDocsFromMd,
        relativePath.replace('.md', '.component.ts'),
      ]);

      const newPathToComponentRoutesTs = this.project.pathFor([
        srcMainProject,
        libFromSrc,
        generatedDocsFromMd,
        relativePath.replace('.md', '.routes.ts'),
      ]);

      const content = UtilsFilesFoldersSync.readFile(mdFileAbsPAth) || '';

      UtilsFilesFoldersSync.writeFile(
        newPathToComponentTs,
        this.tempateForAngularComponent({
          absPath: mdFileAbsPAth,
          newAbsPath: newPathToComponentTs,
          relativePath,
          content,
        }),
      );

      UtilsFilesFoldersSync.writeFile(
        newPathToComponentRoutesTs,
        this.getTemplateForDefaultRoutes(relativePath),
      );
    }
    //#endregion
  }
  //#endregion

  //#region start

  protected buildOptions: EnvOptions;

  async start(buildOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    this.buildOptions = buildOptions;
    Helpers.remove(this.temporaryMdDocsFolderAbsPath);
    Helpers.tryRemoveDir(
      this.project.pathFor([srcMainProject, libFromSrc, generatedDocsFromMd]),
    );
    Helpers.tryRemoveDir(
      this.project.pathFor([
        srcMainProject,
        assetsFromSrc,
        sharedFromAssets,
        generatedDocsFromMd,
      ]),
    );

    const requiredPackages = this.analyzeAndGetWhatDocsPackagesRequired(
      this.project.nameForNpmPackage,
    );
    Helpers.info(`

      Creating docs.. using packages ${requiredPackages.join(',')}

      `);
    const indexData: IndexedData[] = []; // I wonder how to index stuff

    this.copyAllMdFilesToTemporaryPath(requiredPackages);
    this.recreateMdFilesComponents();

    this.recreateMainRoutesWithAllLinks();
    //#endregion
  }
  //#endregion

  //#region recreate main route
  protected recreateMainRoutesWithAllLinks(): void {
    //#region @backendFunc
    const baseMdGen = this.project.pathFor([
      srcMainProject,
      libFromSrc,
      generatedDocsFromMd,
    ]);
    const relativePaths = UtilsFilesFoldersSync.getFilesFrom(baseMdGen, {
      recursive: true,
    })
      .filter(f => f.endsWith('.routes.ts'))
      .map(c => c.replace(baseMdGen + '/', ''));

    const mainRouteContent =
      this.getMainRoutesFileForRelativePaths(relativePaths);

    UtilsFilesFoldersSync.writeFile(
      this.project.pathFor([
        srcMainProject,
        libFromSrc,
        generatedDocsFromMd,
        'docs.routes.ts',
      ]),
      mainRouteContent,
    );
    //#endregion
  }
  //#endregion

  //#region template for angular component
  tempateForAngularComponent(opt: {
    newAbsPath: string;
    absPath: string;
    relativePath: string;
    content: string;
  }): string {
    //#region @backendFunc
    const howMuchBack = opt.relativePath.split('/').length;
    const cmpName = this.getComponentNameFromFilePath(opt.relativePath);

    let orgContent = opt.content;
    const assetsFromMd = UtilsMdDocs.getAssets(opt.content)
      .map((c, index) => {
        const assetIndex = `context.asset${index}`;
        orgContent = orgContent.replace(c, assetIndex);
        orgContent = orgContent.replace(`"./${assetIndex}"`, `"${assetIndex}"`);
        orgContent = orgContent.replace(`'./${assetIndex}'`, `'${assetIndex}'`);
        return ` asset${index} : Taon.asset('/${c}')`;
      })
      .join(',\n');

    let html = this.transformToHtml(orgContent);

    let htmlForTs = JSON.stringify(html);

    return `//#${'reg' + 'ion'} @${'bro' + 'wser'}
//#region imports
${'imp' + 'ort'} { Taon } from '${_.times(howMuchBack)
      .map(() => '../')
      .join('')}index';
${'imp' + 'ort'} { ChangeDetectionStrategy, Component, Input } from '@angular/core';
${'imp' + 'ort'} { RouterOutlet } from '@angular/router';
${'imp' + 'ort'} { TaonDocsPageComponent } from '${_.times(howMuchBack)
      .map(() => '../')
      .join('')}ui';

//#endregion

@Component({
  selector: 'app-my-entity',
  template: \`
     <taon-docs-page [html]="resolvedHtml" />
  \`,
  styles: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaonDocsPageComponent],
})
${'exp' + 'ort'} class ${cmpName} {
  @Input() context: any = {
  ${assetsFromMd}

  }

  public get resolvedHtml(): string {
    return this.htmlTemplate.replace(
      /context\\.([a-zA-Z0-9_$]+)/g,
      (_, key) => this.context?.[key] ?? '',
    );
  }

${taonCutNextLineCut}
  private readonly htmlTemplate = ${htmlForTs};


}
//#${'endr' + 'egion'}
    `;
    //#endregion
  }
  //#endregion

  //#region transform md to html
  transformToHtml(content: string): string {
    return UtilsMdToHtml.transform(content);
  }
  //#endregion

  //#region get template for default routes
  protected getTemplateForDefaultRoutes(relativePath: string): string {
    return `
//#region imports
import { Routes } from '@angular/router';
import { ${this.getComponentNameFromFilePath(relativePath)} } from './${path.basename(relativePath).replace('.md', '.component')}';
//#endregion

export const ${this.getRoutesNameFromFilePath(relativePath)}: Routes = [
  {
    path: '',
    component: ${this.getComponentNameFromFilePath(relativePath)},
  },
];

    `;
  }
  //#endregion

  //#region get lazy route template for package
  protected getLazyRouteTemplateForRelativePath(relativePath: string): string {
    const RoutesForRelativePathComponentName = this.getRoutesNameFromFilePath(
      relativePath.replace('.routes.ts', '.md'),
    );
    return `
   {
      path: '${relativePath.replace('.routes.ts', '.md')}',
      loadChildren: () =>
        import('./${relativePath.replace('.ts', '')}').then(
          m => m.${RoutesForRelativePathComponentName},
        ),
    }

  `;
  }
  //#endregion

  //#region get main routes files for packages
  protected getMainRoutesFileForRelativePaths(relativePaths: string[]): string {
    const RoutesForComponentName = this.getRoutesNameFromPackage(
      this.project.nameForNpmPackage,
    );

    const lazyRoutes = relativePaths
      .reduce((a, packageName) => {
        return a.concat(this.getLazyRouteTemplateForRelativePath(packageName));
      }, [] as string[])
      .join(',\n');

    return `
${'imp' + 'ort'}  { Routes } from '@angular/router';
${'exp' + 'ort'}  const ${RoutesForComponentName}: Routes = [
// {
//   path: '', // skipping default route for now
//   component: ComponentHere,
// },
${lazyRoutes}
];

${'exp' + 'ort'} default ${RoutesForComponentName};
    `;
  }
  //#endregion
}
