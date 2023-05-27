//#region @backend
import chalk from 'chalk';
import { crossPlatformPath, _ } from 'tnp-core';
import { path } from 'tnp-core'
import { fse } from 'tnp-core'

import { config, ConfigModels } from 'tnp-config';
import { Models } from 'tnp-models';
import { Helpers } from 'tnp-helpers';
import { Project } from '../../abstract';
import { config as schemaConfig } from './example-environment-config';
import { walk } from 'lodash-walk-object';

//#region handle error
export function handleError(workspaceConfig: Models.env.EnvConfig, fileContent: string, pathToConfig: string) {

  let configString = fileContent ? fileContent : `
  ...
${chalk.bold(JSON.stringify(workspaceConfig, null, 4))}
  ...
  `

  Helpers.error(`Please follow worksapce environment config schema:\n
${Helpers.terminalLine()}
  let { config } = require('tnp').default;

  config = ${chalk.bold(JSON.stringify(schemaConfig, null, 4))}

  module.exports = exports = { config };
${Helpers.terminalLine()}

Your config (${pathToConfig}) :
${Helpers.terminalLine()}
${configString}
${Helpers.terminalLine()}
`, false, true)
}
//#endregion

//#region validate config
export function validateEnvConfig(workspaceConfig: Models.env.EnvConfig, filePath: string, isStandalone = false) {
  if (!_.isObject(workspaceConfig)) {
    handleError(undefined, Helpers.readFile(filePath), filePath);
  }
  // TODO
}
//#endregion

//#region standalone config by
export async function standaloneConfigBy(standaloneProject: Project): Promise<Models.env.EnvConfig> {
  let configStandaloneEnv: Models.env.EnvConfig;


  var pathToProjectEnvironment = crossPlatformPath([standaloneProject.location, config.file.environment]);

  if (!fse.existsSync(`${pathToProjectEnvironment}.js`)) {

    Helpers.info(`Standalone project ${standaloneProject.location}
      ...without environment.js config... creating new... `);

    Helpers.writeFile(`${pathToProjectEnvironment}.js`, createExampleConfigFor(standaloneProject));

    Helpers.tsCodeModifier.formatFile(`${pathToProjectEnvironment}.js`);
  }

  requireUncached(pathToProjectEnvironment);
  configStandaloneEnv = Helpers.require(pathToProjectEnvironment).config as any;

  return configStandaloneEnv;
}
//#endregion

function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

//#region create example config for
function createExampleConfigFor(proj: Project) {

  const configPathRequire = proj.isStandaloneProject ? '{ config: {} }' : `require('tnp').default`;

  return `
const path = require('path')
var { config } = ${configPathRequire};

config = {

  domain: '${proj.name}.example.domain.com',
  useDomain: false,
  title: '${_.startCase(proj.name)}',
  pwa: {
    // start_url: ''
  }

}
module.exports = exports = { config };
  `;
}
//#endregion


export function saveConfigWorkspca(project: Project, projectConfig: Models.env.EnvConfig) {

  projectConfig.currentProjectName = project.name;
  projectConfig.currentProjectGenericName = project.genericName;
  projectConfig.currentProjectLaunchConfiguration = project.getTemlateOfLaunchJSON(projectConfig);
  projectConfig.currentProjectTasksConfiguration = project.getTemlateOfTasksJSON(projectConfig);
  projectConfig.currentProjectType = project._type;
  projectConfig.currentFrameworkVersion = Project.Tnp.version;
  projectConfig.currentProjectLocation = project.location;
  projectConfig.currentProjectIsStrictSite = project.isSiteInStrictMode;
  projectConfig.currentProjectIsDependencySite = project.isSiteInDependencyMode;
  projectConfig.currentProjectIsStatic = project.isGenerated;
  projectConfig.isStandaloneProject = project.isStandaloneProject;
  projectConfig.frameworks = project.frameworks;

  let libs = Helpers.linksToFoldersFrom(path.join(project.location, config.folder.src, 'libs'));
  const isSmartWorkspaceChild = project.isSmartContainerChild;
  if (isSmartWorkspaceChild) {
    libs = project.parent.children.filter(f => {
      return f.frameworkVersionAtLeast('v3') && f.typeIs('isomorphic-lib');
    }).map(f => {
      return path.join(f.location);
    })
  }
  const customRootDir = 'customRootDir';

  if (libs.length > 0) {
    const parentPath = project.isSmartContainerChild ? project.parent.location : path.join(project.location, '../../..')
    const parent = Project.From(parentPath);
    if (parent) {
      const generatedPathes = `"paths": ` + JSON.stringify((libs).reduce((a, b) => {
        if (isSmartWorkspaceChild) {
          const pathRelative = path.join(path.basename(b), config.folder.src, 'lib');
          return _.merge(a, {
            [`@${parent.name}/${path.basename(b)}`]: [`../${pathRelative}`],
            [`@${parent.name}/${path.basename(b)}/*`]: [`../${pathRelative}/*`],
          })
        } else {
          const pathRelative = b.replace(parent.location, '').split('/').slice(4).join('/');
          return _.merge(a, {
            [`@${parent.name}/${path.basename(b)}`]: [`./${pathRelative}`],
            [`@${parent.name}/${path.basename(b)}/*`]: [`./${pathRelative}/*`],
          })
        }
      }, {}));
      projectConfig['pathesTsconfig'] = generatedPathes;
      projectConfig['pathesTsconfigSourceDist'] = generatedPathes.replace(/\/src/g, '/tmp-source-dist')
      projectConfig['pathesTsconfigSourceBundle'] = generatedPathes.replace(/\/src/g, '/tmp-source-bundle')

      // workspaceConfig['exclusion'] = `exclude:[]`;
    } else {
      Helpers.warn(`[env config] parent not found by path ${parentPath}`);
    }

  } else {
    projectConfig['pathesTsconfig'] = `"paths": ` + JSON.stringify({});
  }

  if (projectConfig['pathesTsconfig'] && !(projectConfig['pathesTsconfig'] as string)?.endsWith(',')) {
    projectConfig['pathesTsconfig'] = `${projectConfig['pathesTsconfig']},`;
  }

  if (project.isSmartContainerChild) {
    projectConfig[customRootDir] = `"rootDir": "../",`;
  } else if (project.isSite) {
    projectConfig[customRootDir] = `"rootDir": "./tmp-src",`
  } else {
    projectConfig[customRootDir] = `"rootDir": "./src",`
  }


  let currentLibProjectSourceFolder: 'src';

  if (project.typeIs('isomorphic-lib')) {
    currentLibProjectSourceFolder = 'src';
  }
  projectConfig.currentLibProjectSourceFolder = currentLibProjectSourceFolder;

  const tmpEnvironmentPath = path.join(project.location, config.file.tnpEnvironment_json)
  const tmpEnvironmentPathBrowser = path.join(project.location, 'tmp-environment-for-browser.json')

  if (project.isStandaloneProject) {

    Helpers.writeJson(tmpEnvironmentPath, projectConfig);
    const clonedConfig = _.cloneDeep(projectConfig);
    // console.log(JSON.stringify(clonedConfig))
    walk.Object(clonedConfig, (val, path, newValue) => {
      if (_.last(path.split('.')).startsWith('$')) {
        newValue(null);
      }
    })
    Helpers.writeJson(tmpEnvironmentPathBrowser, clonedConfig);
    Helpers.log(`config saved in standalone project ${chalk.bold(project.genericName)} ${tmpEnvironmentPath}`);

  }
}



//#endregion
