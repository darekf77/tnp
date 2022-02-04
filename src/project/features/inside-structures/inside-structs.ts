//#region @backend
import { Helpers, path, _ } from "tnp-core";
import { Project } from "../../abstract/project/project";
import { InsideStruct } from "./inside-struct";


export function angularAppFromV3IsomorphicLib(project: Project) {
  if (!project.frameworkVersionAtLeast('v3') || project.typeIsNot('isomorphic-lib')) {
    return
  }
  const tmpProjectsStandalone = `tmp-apps-for-{{{outFolder}}}/${project.name}`;
  const tmpProjects = `tmp-apps-for-{{{outFolder}}}/${project.name}--for--{{{client}}}`;
  return InsideStruct.from({
    relateivePathesFromContainer: [
      'app/src/app/app.component.html',
      'app/src/app/app.component.scss',
      'app/src/app/app.component.spec.ts',
      'app/src/app/app.component.ts',
      'app/src/app/app.module.ts',
      'app/src/assets/.gitkeep',
      'app/src/environments/environment.prod.ts',
      'app/src/environments/environment.ts',
      'app/src/app',
      'app/src/assets',
      'app/src/environments',
      'app/src/favicon.ico',
      'app/src/index.html',
      'app/src/main.ts',
      'app/src/polyfills.ts',
      'app/src/styles.scss',
      'app/src/test.ts',
      'app/.browserslistrc',
      'app/.editorconfig',
      'app/.gitignore',
      // 'app/README.md',
      'app/angular.json',
      'app/karma.conf.js',
      'app/package-lock.json',
      'app/package.json',
      'app/src',
      'app/.nvmrc',
      'app/tsconfig.app.json',
      'app/tsconfig.json',
      'app/tsconfig.spec.json'
    ],
    projtectType: project._type,
    frameworkVersion: project._frameworkVersion,
    pathReplacements: [
      ['app/', ({ client }) => {
        if (project.isStandaloneProject) {
          return `${tmpProjectsStandalone}/`;
        }
        return `${tmpProjects}/`;
      }],
    ],
    linkNodeModulesTo: ['app/'],
    linksFuncs: [
      [
        ({ outFolder, client }) => {
          if (project.isStandaloneProject) {
            return `tmp-src-${outFolder}`;
          }
          return `tmp-src-${outFolder}-browser-for-{{{client}}}`;
        },
        ({ projectName }) => `app/src/app/${projectName}`,
      ],
    ],
    endAction: (({ outFolder, projectName, client, replacement }) => {

      //#region replace app.module.ts
      (() => {
        const appModuleFilePath = project.location
          + '/'
          + replacement(project.isStandaloneProject ? tmpProjectsStandalone : tmpProjects)
          + `/src/app/app.module.ts`;

        let appModuleFile = Helpers.readFile(appModuleFilePath);

        const moduleName = _.upperFirst(_.camelCase(project.name)) + 'Module';
        appModuleFile = `
import { ${moduleName} } from './${projectName}/app';
${appModuleFile}
`;
        appModuleFile = appModuleFile.replace(
          '//<<<TO_REPLACE_MODULE>>>',
          `${moduleName},`
        );
        Helpers.writeFile(appModuleFilePath, appModuleFile);
      })();
      //#endregion

      //#region replace app.component.html
      (() => {
        const appModuleFilePath = project.location
          + '/'
          + replacement(project.isStandaloneProject ? tmpProjectsStandalone : tmpProjects)
          + `/src/app/app.component.html`;

        let appHtmlFile = Helpers.readFile(appModuleFilePath);

        const tagName = `<app-${project.name}>`;

        appHtmlFile = appHtmlFile.replace(
          '<!-- <<<TO_REPLACE_COMPONENT_TAG>>> -->',
          `${tagName}, `
        );
        Helpers.writeFile(appModuleFilePath, appHtmlFile);
      })();
      //#endregion



    })
  })
}

//#endregion
