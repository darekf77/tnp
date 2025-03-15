//#region imports
import { walk } from 'lodash-walk-object/src';
import { config } from 'tnp-config/src';
import { chalk } from 'tnp-core/src';
import { crossPlatformPath, _ } from 'tnp-core/src';
import { path } from 'tnp-core/src';
import { fse } from 'tnp-core/src';
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';

import { Models } from '../../../../../models';
import type { Project } from '../../../project';

import { config as schemaConfig } from './example-environment-config';
//#endregion

//#region handle error
export const handleError = (
  workspaceConfig: Models.EnvConfig,
  fileContent: string,
  pathToConfig: string,
): void => {
  //#region @backendFunc
  let configString = fileContent
    ? fileContent
    : `
  ...
${chalk.bold(JSON.stringify(workspaceConfig, null, 4))}
  ...
  `;

  Helpers.error(
    `Please follow worksapce environment config schema:\n
${Helpers.terminalLine()}
  let { config } = require('tnp/src').default;

  config = ${chalk.bold(JSON.stringify(schemaConfig, null, 4))}

  module.exports = exports = { config };
${Helpers.terminalLine()}

Your config (${pathToConfig}) :
${Helpers.terminalLine()}
${configString}
${Helpers.terminalLine()}
`,
    false,
    true,
  );
  //#endregion
};
//#endregion

//#region validate config
export const validateEnvConfig = (
  workspaceConfig: Models.EnvConfig,
  filePath: string,
  isStandalone = false,
): void => {
  //#region @backendFunc
  if (!_.isObject(workspaceConfig)) {
    handleError(undefined, Helpers.readFile(filePath), filePath);
  }
  // TODO
  //#endregion
};
//#endregion

//#region standalone config by
export const standaloneConfigBy = async (
  standaloneProject: Project,
): Promise<Models.EnvConfig> => {
  //#region @backendFunc
  let configStandaloneEnv: Models.EnvConfig;

  var pathToProjectEnvironment = crossPlatformPath([
    standaloneProject.location,
    config.file.environment,
  ]);

  if (!fse.existsSync(`${pathToProjectEnvironment}.js`)) {
    Helpers.info(`Standalone project ${standaloneProject.location}`);
    Helpers.logInfo(`...without environment.js config...creating new... `);

    Helpers.writeFile(
      `${pathToProjectEnvironment}.js`,
      createExampleConfigFor(standaloneProject),
    );

    UtilsTypescript.formatFile(`${pathToProjectEnvironment}.js`);
  }

  Helpers.requireUncached(pathToProjectEnvironment);
  configStandaloneEnv = Helpers.require(pathToProjectEnvironment).config as any;

  return configStandaloneEnv;
  //#endregion
};
//#endregion

//#region create example config for
const createExampleConfigFor = (proj: Project): string => {
  //#region @backendFunc
  const configPathRequire = '{ config: {} }';

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
  //#endregion
};
//#endregion

//#region save config workspace
export const saveConfigWorkspace = (
  project: Project,
  projectConfig: Models.EnvConfig,
): void => {
  //#region @backendFunc
  projectConfig.currentProjectName = project.name;
  projectConfig.currentProjectGenericName = project.genericName;
  projectConfig.currentProjectType = project.type;
  projectConfig.currentFrameworkVersion = project.ins.Tnp.packageJson.version;
  projectConfig.currentProjectLocation = project.location;
  projectConfig.isStandaloneProject = project.framework.isStandaloneProject;

  const customRootDir = 'customRootDir';

  if (project.framework.isStandaloneProject) {
    projectConfig['pathesTsconfig'] =
      `"paths": ` +
      JSON.stringify({
        [`${project.name}`]: ['./src/lib'],
        [`${project.name}/*`]: ['./src/lib/*'],
      });
  }

  if (
    projectConfig['pathesTsconfig'] &&
    !(projectConfig['pathesTsconfig'] as string)?.endsWith(',')
  ) {
    projectConfig['pathesTsconfig'] = `${projectConfig['pathesTsconfig']},`;
  }

  projectConfig[customRootDir] = `"rootDir": "./src",`;

  projectConfig.currentLibProjectSourceFolder = 'src';

  const tmpEnvironmentPath = path.join(
    project.location,
    config.file.tnpEnvironment_json,
  );
  const tmpEnvironmentPathBrowser = path.join(
    project.location,
    'tmp-environment-for-browser.json',
  );

  if (project.framework.isStandaloneProject) {
    Helpers.writeJson(tmpEnvironmentPath, projectConfig);
    const clonedConfig = _.cloneDeep(projectConfig);
    // console.log(JSON.stringify(clonedConfig))
    walk.Object(clonedConfig, (val, path, newValue) => {
      if (_.last(path.split('.')).startsWith('$')) {
        newValue(null);
      }
    });
    Helpers.writeJson(tmpEnvironmentPathBrowser, clonedConfig);
    Helpers.log(
      `config saved in ${project.framework.isStandaloneProject ? 'standalone' : 'smart container'} ` +
        `project ${chalk.bold(project.genericName)} ${tmpEnvironmentPath}`,
    );
  }
  //#endregion
};
//#endregion
