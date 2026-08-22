//#region imports
import { RenameRule } from 'magic-renamer/src';
import type { DocsHeading, IndexData } from 'taon/src';
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
  taonPackageName,
} from 'tnp-core/src';
import { BaseFeatureForProject, Helpers } from 'tnp-helpers/src';

// import type { DocsHeading } from 'taon/src';
import {
  replaceAssetsLinksForApp,
  // replaceSrcAssetsWithRemoveTag,
} from '../../../../app-utils';
import {
  allDocsIndexDataFileTs,
  appFromSrc,
  assetsFor,
  assetsFromNgProj,
  assetsFromNpmPackage,
  assetsFromSrc,
  assetsFromTempSrc,
  baseHrefDocsGen,
  docsMainProject,
  docsRoutes,
  generatedDocsFromMd,
  libFromSrc,
  sharedFromAssets,
  sourceLinkInNodeModules,
  srcMainProject,
  TaonGeneratedFiles,
  THIS_IS_GENERATED_STRING,
} from '../../../../constants';
import { EnvOptions } from '../../../../options';
import { Project } from '../../project';

import { UtilsMdToHtml } from './utils-md-to-html';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class DocsLibraryGenrator extends BaseFeatureForProject<Project> {
  //#region fields & getters

  buildOptions: EnvOptions;

  //#region fields & getters / temporary md docs folder abs path
  private get temporaryMdDocsFolderAbsPath(): string {
    return this.project.pathFor(`.${config.frameworkName}/tmp-temp-docs`);
  }
  //#endregion

  //#region fields & getters / shared md docs assets folder abs path
  private get sharedMdDocsAssetsFolderAbsPath(): string {
    return this.project.pathFor([
      srcMainProject,
      assetsFromSrc,
      sharedFromAssets,
      generatedDocsFromMd,
    ]);
  }
  //#endregion

  //#region fields & getters / all md files abs paths from temporary folder
  private get allMdFilesAbsPathsFromTemporaryPath(): string[] {
    //#region @backendFunc
    return UtilsFilesFoldersSync.getFilesFrom(
      this.temporaryMdDocsFolderAbsPath,
      {
        recursive: true,
        followSymlinks: false,
      },
    ).filter(
      f =>
        f.toLowerCase().endsWith('.md') &&
        ![
          TaonGeneratedFiles.BUILD_INFO_MD,
          TaonGeneratedFiles.APP_FOLDER_INFO_MD,
          TaonGeneratedFiles.LIB_INFO_MD,
          TaonGeneratedFiles.MIGRATIONS_INFO_MD,
        ].includes(path.basename(f) as any),
    );
    //#endregion
  }
  //#endregion

  //#region fields & getters / all md files abs path
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

      ...UtilsFilesFoldersSync.getFilesFrom(
        this.project.pathFor(srcMainProject),
        {
          recursive: false,
          followSymlinks: false,
        },
      ).filter(
        f =>
          f.toLowerCase().endsWith('.md') &&
          [TaonGeneratedFiles.APP_FOLDER_INFO_MD].includes(
            path.basename(f) as any,
          ),
      ),

      ...UtilsFilesFoldersSync.getFilesFrom(
        this.project.pathFor([srcMainProject, appFromSrc]),
        {
          recursive: true,
          followSymlinks: false,
        },
      ).filter(f => f.toLowerCase().endsWith('.md')),

      ...UtilsFilesFoldersSync.getFilesFrom(
        this.project.pathFor([srcMainProject, libFromSrc]),
        {
          recursive: true,
          followSymlinks: false,
        },
      ).filter(f => f.toLowerCase().endsWith('.md')),
    ];
    //#endregion
  }
  //#endregion

  //#endregion

  //#region api / remove temp folders
  public removeTempFolders(): void {
    //#region @backendFunc
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
    //#endregion
  }
  //#endregion

  //#region api / start
  public async start(buildOptions: EnvOptions, force = false): Promise<void> {
    //#region @backendFunc
    this.buildOptions = buildOptions;
    if (force) {
      this.removeTempFolders();
    }

    const requiredPackages = this.analyzeAndGetWhatDocsPackagesRequired(
      this.project.nameForNpmPackage,
    );
    Helpers.info(`

      Creating docs.. using packages ${requiredPackages.join(',')}

      `);
    // const indexData: IndexedData[] = []; // I wonder how to index stuff

    this.copyAllMdFilesToTemporaryPath(requiredPackages);
    this.recreateMdFilesComponents();

    this.recreateMainRoutesWithAllLinks();
    this.recreateIndexingFile();
    //#endregion
  }
  //#endregion

  //#region methods

  //#region methods / get unifedied name from package
  protected getUnifiedNameFromPackage(packageName: string): string {
    const [org, name] = packageName.split('/');
    return packageName.startsWith('@')
      ? `${_.upperFirst(_.camelCase(org))}__${_.upperFirst(_.camelCase(name))}`
      : _.upperFirst(_.camelCase(packageName));
  }
  //#endregion

  //#region methods / get  get route name from package
  protected getRoutesNameFromPackage(packageName: string): string {
    const routesName =
      this.getUnifiedNameFromPackage(packageName) + 'DocsRoutes';
    return routesName;
  }
  //#endregion

  //#region methods / get route name from package
  protected getRoutesNameFromFilePath(relativeFilePath: string): string {
    const routesName = _.upperFirst(_.camelCase(relativeFilePath)) + 'Routes';
    return routesName;
  }
  //#endregion

  //#region methods / get component name from package
  protected getComponentNameFromPackage(packageName: string): string {
    const ComponentNameFromPackage =
      this.getUnifiedNameFromPackage(packageName) + 'Component';
    return ComponentNameFromPackage;
  }
  //#endregion

  //#region methods / get component name from relative file path
  protected getComponentNameFromFilePath(relativeFilePath: string): string {
    const ComponentNameFromFilePath =
      _.upperFirst(_.camelCase(relativeFilePath)) + 'Component';
    return ComponentNameFromFilePath;
  }
  //#endregion

  //#region methods / analyz what packages requred
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

  //#region methods / get project from package
  protected getProjectFromPackage(packageName: string): Project {
    //#region @backendFunc
    const pathToSourceLInk =
      this.project.framework.coreContainer.nodeModules.pathFor([
        packageName,
        sourceLinkInNodeModules,
      ]);

    if (!Helpers.exists(pathToSourceLInk)) {
      const parentChildren = this.project.parent?.children || [];
      const found = parentChildren.find(
        c => c.nameForNpmPackage === packageName,
      );
      if (found) {
        return found;
      }
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

  //#region methods / handle replace assets
  private handleReplaceAssets({
    proj,
    mdFileAbsPath,
    relativePath,
    packageName,
    content,
  }: {
    proj: Project;
    mdFileAbsPath: string;
    relativePath: string;
    packageName: string;
    content: string;
  }): string {
    //#region @backendFunc
    const assetsFromMd = UtilsMdDocs.getAssetsFromFile(mdFileAbsPath);

    for (const assetRelativePathFromFile of assetsFromMd) {
      const hasSlash = relativePath.includes('/');
      const slash = hasSlash ? '/' : '';

      const relativeAssetPath = relativePath.replace(
        slash + path.basename(relativePath),
        slash + assetRelativePathFromFile,
      );

      const properPathInMd = crossPlatformPath([
        srcMainProject,
        assetsFromSrc,
        sharedFromAssets,
        generatedDocsFromMd,
        this.getUnifiedNameFromPackage(packageName),
        relativeAssetPath,
      ]);

      // console.log({ relativePath, relativeAssetPath, properPathInMd });

      content = content.replace(relativeAssetPath, properPathInMd);
      content = content.replace(`./${properPathInMd}`, `/${properPathInMd}`);

      if (UtilsStringRegex.containsNonAscii(relativeAssetPath)) {
        Helpers.warn(
          `Omitting file with non-ascii characters in path: ${relativeAssetPath}`,
        );
        continue;
      }

      const assetSourcetAbsPath = proj.pathFor(relativeAssetPath);

      const assetDestLocationAbsPath = crossPlatformPath([
        this.sharedMdDocsAssetsFolderAbsPath,
        packageName,
        relativeAssetPath,
      ]);

      Helpers.logInfo(
        `Copy asset
          "${assetSourcetAbsPath}"
          to "${assetDestLocationAbsPath}"
          `,
      );

      UtilsFilesFoldersSync.copyFile(
        assetSourcetAbsPath,
        assetDestLocationAbsPath,
      );
    }
    return content;
    //#endregion
  }
  //#endregion

  //#region  methods / handle replace links
  private handleReplaceLinks({
    proj,
    mdFileAbsPath,
    relativePath,
    packageName,
    content,
  }: {
    proj: Project;
    mdFileAbsPath: string;
    relativePath: string;
    packageName: string;
    content: string;
  }): string {
    //#region @backendFunc
    const renderTags = UtilsMdDocs.getRenderImports(content);

    for (const tag of renderTags) {
      const projForLink = tag.isLocal
        ? proj
        : this.getProjectFromPackage(tag.packageName);

      let mdFromOtherFile =
        (projForLink &&
          UtilsFilesFoldersSync.readFile(
            projForLink.pathFor(tag.relativePath),
          )) ||
        ` <h2> NOT ABLE TO RESOLVE @render "${tag.packageName}/${tag.relativePath}" </h2> `;

      if (tag.magicRenameRules) {
        const rules = RenameRule.from(tag.magicRenameRules);
        for (const rule of rules) {
          // console.log({ rule });
          mdFromOtherFile = mdFromOtherFile
            .split('\n')
            .map(line => {
              return rule.replaceInString(line);
            })
            .join('\n');
        }
      }

      // TODO RECRUSIVE MODIFY RENDER TAGS CONTENT
      // TODO RECRUSIVE RENDER ASSETS

      content = content.replace(tag.rawRenderTagString, mdFromOtherFile);
    }
    return content;
    //#endregion
  }
  //#endregion

  //#region methods / copy all md file to temporary path
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
          packageName,
          relativePath,
        ]);

        let content = UtilsFilesFoldersSync.readFile(mdFileAbsPath) || '';

        content = this.handleReplaceAssets({
          proj,
          mdFileAbsPath,
          relativePath,
          packageName,
          content,
        });

        content = this.handleReplaceLinks({
          proj,
          mdFileAbsPath,
          relativePath,
          packageName,
          content,
        });

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

  //#region methods / recreaste libraries ts files from md files
  protected recreateMdFilesComponents(): void {
    //#region @backendFunc
    let allIndexData: IndexData[] = [];
    const allMdFiles = this.allMdFilesAbsPathsFromTemporaryPath;
    for (const mdFileAbsPAth of allMdFiles) {
      const relativePath = mdFileAbsPAth.replace(
        this.temporaryMdDocsFolderAbsPath + '/',
        '',
      );

      const packageName = relativePath.startsWith('@')
        ? relativePath.split('/').slice(0, 2).join('/')
        : relativePath.split('/').slice(0, 1).join('/');

      // console.log({ relativePath, packageName });

      const newPathToComponentTs = this.project.pathFor([
        srcMainProject,
        libFromSrc,
        generatedDocsFromMd,
        relativePath.replace('.md', '.component.ts'),
      ]);

      const newPathToComponentHtml = this.project.pathFor([
        srcMainProject,
        libFromSrc,
        generatedDocsFromMd,
        relativePath.replace('.md', '.component.html'),
      ]);

      const newPathToComponentRoutesTs = this.project.pathFor([
        srcMainProject,
        libFromSrc,
        generatedDocsFromMd,
        relativePath.replace('.md', '.routes.ts'),
      ]);

      const content = UtilsFilesFoldersSync.readFile(mdFileAbsPAth) || '';

      const { headings, resultContent, codeblocks, indexData } =
        UtilsMdToHtml.transform(content, relativePath, packageName);

      allIndexData = allIndexData.concat(indexData);

      UtilsFilesFoldersSync.writeFile(
        newPathToComponentTs,
        this.tempateForAngularComponent({
          absPath: mdFileAbsPAth,
          relativePath,
          headings,
          codeblocks,
        }),
      );

      UtilsFilesFoldersSync.writeFile(
        newPathToComponentHtml,
        `<article  class="taon-md-doc">${resultContent}</article>`,
      );

      UtilsFilesFoldersSync.writeFile(
        newPathToComponentRoutesTs,
        this.getTemplateForDefaultRoutes(relativePath),
      );
    }

    const pathAllIndexData = this.project.pathFor([
      srcMainProject,
      libFromSrc,
      generatedDocsFromMd,
      allDocsIndexDataFileTs,
    ]);

    UtilsFilesFoldersSync.writeFile(
      pathAllIndexData,
      `${taonSkipCut}
      // ${THIS_IS_GENERATED_STRING}
export const ${this.getUnifiedNameFromPackage(this.project.nameForNpmPackage)}DocsIndexData = ${JSON.stringify(allIndexData, null, 2)};

${'exp' + 'ort'} default ${this.getUnifiedNameFromPackage(this.project.nameForNpmPackage)}DocsIndexData;
`,
    );

    //#endregion
  }
  //#endregion

  //#region methods / recreate main route
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
      .map(c => c.replace(baseMdGen + '/', ''))
      .filter(c => path.basename(c) !== docsRoutes);

    const mainRouteContent =
      this.getMainRoutesFileForRelativePaths(relativePaths);

    UtilsFilesFoldersSync.writeFile(
      this.project.pathFor([
        srcMainProject,
        libFromSrc,
        generatedDocsFromMd,
        docsRoutes,
      ]),
      mainRouteContent,
    );
    //#endregion
  }
  //#endregion

  //#region methods / recreate main route
  protected recreateIndexingFile(): void {
    //#region @backendFunc
    // TODO
    // const baseMdGen = this.project.pathFor([
    //   srcMainProject,
    //   libFromSrc,
    //   generatedDocsFromMd,
    // ]);
    // const relativePaths = UtilsFilesFoldersSync.getFilesFrom(baseMdGen, {
    //   recursive: true,
    // })
    //   .filter(f => f.endsWith('.routes.ts'))
    //   .map(c => c.replace(baseMdGen + '/', ''))
    //   .filter(c => path.basename(c) !== docsRoutes);
    // const mainRouteContent =
    //   this.getMainRoutesFileForRelativePaths(relativePaths);
    // UtilsFilesFoldersSync.writeFile(
    //   this.project.pathFor([
    //     srcMainProject,
    //     libFromSrc,
    //     generatedDocsFromMd,
    //     'indexing',
    //   ]),
    //   mainRouteContent,
    // );
    //#endregion
  }
  //#endregion

  //#region methods / template for angular component
  private tempateForAngularComponent({
    absPath,
    relativePath,
    headings,
    codeblocks,
  }: {
    absPath: string;
    relativePath: string;
    headings: DocsHeading[];
    codeblocks: UtilsMdToHtml.CodeBlock[];
  }): string {
    //#region @backendFunc
    const howMuchBack = relativePath.split('/').length;
    const cmpName = this.getComponentNameFromFilePath(relativePath);

    return `//#${'reg' + 'ion'} imports
${'imp' + 'ort'} { BehaviorSubject } from 'rxjs';
${'imp' + 'ort'} { Taon } from '${
      this.project.nameForNpmPackage === taonPackageName
        ? `${_.times(howMuchBack)
            .map(() => '../')
            .join('')}index`
        : `${taonPackageName}/src`
    }';
${'imp' + 'ort'} { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
${'imp' + 'ort'} { RouterOutlet } from '@angular/router';
${'imp' + 'ort'} { TaonDocsPageComponent, DocsHeading } from '${
      this.project.nameForNpmPackage === taonPackageName
        ? `${_.times(howMuchBack)
            .map(() => '../')
            .join('')}ui`
        : `${taonPackageName}/src`
    }';

//#${'end' + 'reg' + 'ion'}

@Component({
  selector: 'app-my-docs-page-${_.kebabCase(path.basename(absPath))}',
  templateUrl: './${path.basename(absPath).replace('.md', '.component.html')}',
  styles: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
${'exp' + 'ort'} class ${cmpName} extends TaonDocsPageComponent {
  @Input() ${baseHrefDocsGen}: string = '/';
  @Input() context: any = {
${codeblocks
  .map(c => {
    return `${taonCutNextLineCut}\n${c.name}: ${JSON.stringify(c.codeContent)}`;
  })
  .join(',\n')}
  };

  headings: DocsHeading[] = ${JSON.stringify(headings, null, 2)};

}

    `;
    //#endregion
  }
  //#endregion

  //#region methods / get template for default routes
  protected getTemplateForDefaultRoutes(relativePath: string): string {
    return `
//#${'reg' + 'ion'} imports
import { Routes } from '@angular/router';
import { ${this.getComponentNameFromFilePath(relativePath)} } from './${path.basename(relativePath).replace('.md', '.component')}';
//#${'end' + 'reg' + 'ion'}

${'exp' + 'ort'} const ${this.getRoutesNameFromFilePath(relativePath)}: Routes = [
  {
    path: '',
    component: ${this.getComponentNameFromFilePath(relativePath)},
  },
];

    `;
  }
  //#endregion

  //#region methods / get lazy route template for package
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

  //#region methods / get main routes files for packages
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

  //#endregion
}
