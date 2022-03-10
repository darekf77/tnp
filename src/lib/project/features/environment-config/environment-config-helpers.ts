//#region @backend
import chalk from 'chalk';
import { _ } from 'tnp-core';
import { path } from 'tnp-core'
import { fse } from 'tnp-core'

import { config, ConfigModels } from 'tnp-config';
import { Models } from 'tnp-models';
import { Helpers } from 'tnp-helpers';
import { ProxyRouter } from '../proxy-router';
import { Project } from '../../abstract';
import { config as schemaConfig } from './example-environment-config';


export const tmpEnvironmentFileName = config.file.tnpEnvironment_json;



export function err(workspaceConfig: Models.env.EnvConfig, fileContent: string, pathToConfig: string) {

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

export function validateEnvConfig(workspaceConfig: Models.env.EnvConfig, filePath: string, isStandalone = false) {
  if (!_.isObject(workspaceConfig)) {
    err(undefined, Helpers.readFile(filePath), filePath);
  }

  if (isStandalone) {

  } else {
    if (!_.isObject(_.get(workspaceConfig, 'workspace'))) err(workspaceConfig, void 0, filePath);
    if (!_.isArray(_.get(workspaceConfig, 'workspace.projects'))) err(workspaceConfig, void 0, filePath)
    workspaceConfig.workspace.projects.forEach(p => {
      if (_.isUndefined(p.name)) err(workspaceConfig, void 0, filePath)
      if (_.isUndefined(p.port)) err(workspaceConfig, void 0, filePath)
      if (_.isUndefined(p.baseUrl)) err(workspaceConfig, void 0, filePath)
    });

    if (_.isUndefined(_.get(workspaceConfig, 'workspace.build'))) {
      workspaceConfig.workspace.build = {
        browser: {
          aot: false,
          minify: false,
          production: false
        },
        server: {
          minify: false,
          production: false
        }
      }
    }
    if (!_.isObject(_.get(workspaceConfig, 'workspace.build'))) {
      err(workspaceConfig, void 0, filePath)
    }
  }


}

export interface OverridePortType {
  workspaceProjectLocation: string;
  workspaceConfig: Models.env.EnvConfig;
}

export async function handleProjectsPorts(project: Project, configProject: Models.env.EnvConfigProject, generatePorts) {
  if (generatePorts) {
    // Helpers.log(`[handleProject] generatedPort`)


    const port = await ProxyRouter.getFreePort();
    // console.log(`Overrided/Generated port from ${project.getDefaultPort()} to ${port} in project: ${project.name}`)
    project.setDefaultPort(port);
    configProject.port = port;
  } else {
    // Helpers.log(`[handleProject] from config`)

    const port = Number(configProject.port);
    if (!isNaN(port)) {
      if (port != project.getDefaultPort()) {
        // console.log(`Overrided port from ${project.getDefaultPort()} to ${port} in project: ${project.name}`)
      }
      project.setDefaultPort(port)
    } else {
      project.setDefaultPortByType()
      // console.log(`Default port ${project.getDefaultPort()} is set to project: ${project.name}`)
    }
  }
}

export async function overrideWorksapceRouterPort(options: OverridePortType, generatePorts = true) {
  const { workspaceProjectLocation, workspaceConfig } = options;

  if (!workspaceConfig || !workspaceConfig.workspace || !workspaceConfig.workspace.workspace) {
    err(workspaceConfig, void 0, `overrideWorksapceRouterPort - ${options.workspaceProjectLocation}`);
  }

  const project = Project.From<Project>(workspaceProjectLocation)
  if (project === undefined) {
    Helpers.error(`Router (worksapce) port is not defined in your environment.js `);
  }

  const configProject = workspaceConfig.workspace.workspace;

  await handleProjectsPorts(project, configProject, generatePorts && workspaceConfig.dynamicGenIps);

}



export async function overrideDefaultPortsAndWorkspaceConfig(options: OverridePortType, generatePorts = true) {

  const { workspaceProjectLocation, workspaceConfig } = options;

  workspaceConfig.workspace.workspace.port

  for (let i = 0; i < workspaceConfig.workspace.projects.length; i++) {
    const configProject = workspaceConfig.workspace.projects[i];
    const project = Project.From<Project>(path.join(workspaceProjectLocation, configProject.name))
    if (project === undefined) {
      Helpers.error(`Undefined project "${configProject.name}" inside environment.js workpace.projects

      workspace location: ${workspaceProjectLocation}

      `, false, true);
    }
    await handleProjectsPorts(project, configProject, generatePorts && workspaceConfig.dynamicGenIps)
  }
}


function frontendCuttedVersion(workspaceConfig: Models.env.EnvConfig) {
  const c = _.cloneDeep(workspaceConfig);
  // walk.Object(c, (lodashPath, isPrefixed) => { // TODO CUT PREFIXED!!!!
  //   if (isPrefixed) {
  //     _.set(c, lodashPath, null)
  //   }
  // })
  return c;
}

function getPort(project: Project, workspaceConfig: Models.env.EnvConfig) {
  let env: Models.env.EnvConfigProject;
  if (project.isWorkspace) {
    env = workspaceConfig.workspace?.workspace;
  } else {
    env = workspaceConfig.workspace?.projects?.find(p => p.name === project.name);
  }
  const envPort = env?.port;
  return _.isNumber(envPort) ? envPort : project.getDefaultPort();
}

export function saveConfigWorkspca(project: Project, workspaceConfig: Models.env.EnvConfig) {
  workspaceConfig.currentProjectName = project.name;
  workspaceConfig.currentProjectPort = getPort(project, workspaceConfig);
  workspaceConfig.currentProjectLaunchConfiguration = project.getTemlateOfLaunchJSON(workspaceConfig);
  workspaceConfig.currentProjectTasksConfiguration = project.getTemlateOfTasksJSON(workspaceConfig);
  workspaceConfig.currentProjectType = project._type;
  workspaceConfig.currentFrameworkVersion = Project.Tnp.version;
  workspaceConfig.currentProjectLocation = project.location;
  workspaceConfig.currentProjectIsStrictSite = project.isSiteInStrictMode;
  workspaceConfig.currentProjectIsDependencySite = project.isSiteInDependencyMode;
  workspaceConfig.currentProjectIsStatic = project.isGenerated;
  workspaceConfig.isStandaloneProject = project.isStandaloneProject;
  workspaceConfig.frameworks = project.frameworks;

  if (project.typeIs('angular-lib')) {
    const componentsFolder = `browser${project.isStandaloneProject ? '' : `-for-${project.name}`}`;
    workspaceConfig.currentProjectComponentsFolder = componentsFolder;
  }

  let currentLibProjectSourceFolder: 'src' | 'components';
  if (project.typeIs('angular-lib')) {
    currentLibProjectSourceFolder = 'components';
  }
  if (project.typeIs('isomorphic-lib')) {
    currentLibProjectSourceFolder = 'src';
  }
  workspaceConfig.currentLibProjectSourceFolder = currentLibProjectSourceFolder;

  const tmpEnvironmentPath = path.join(project.location, tmpEnvironmentFileName)

  if (project.isStandaloneProject) {

    fse.writeJSONSync(tmpEnvironmentPath, workspaceConfig, {
      encoding: 'utf8',
      spaces: 2
    })
    Helpers.log(`config saved in standalone project ${chalk.bold(project.genericName)} ${tmpEnvironmentPath}`);

  } else if (project.isWorkspace) {

    fse.writeJSONSync(tmpEnvironmentPath, workspaceConfig, {
      encoding: 'utf8',
      spaces: 2
    })
    Helpers.log(`config saved in worksapce ${tmpEnvironmentPath}`);

    project.children.forEach(p => {
      saveConfigWorkspca(p, workspaceConfig);
    })

  } else if (project.isWorkspaceChildProject) {

    if (project.typeIs('angular-client', 'angular-lib', 'ionic-client', 'docker')) {
      fse.writeJSONSync(tmpEnvironmentPath, frontendCuttedVersion(workspaceConfig), {
        encoding: 'utf8',
        spaces: 2
      })
      Helpers.log(`config saved for child ${tmpEnvironmentPath}`)
    } else if (project.typeIs('isomorphic-lib')) {
      fse.writeJSONSync(tmpEnvironmentPath, workspaceConfig, {
        encoding: 'utf8',
        spaces: 2
      })
      Helpers.log(`config saved for child ${tmpEnvironmentPath}`)
    } else {
      Helpers.log(`config not needed for child ${tmpEnvironmentPath}`)
    }

  }
}





export const existedConfigs = {} as { [workspacePath in string]: Models.env.EnvConfig; }


export async function standaloneConfigBy(standaloneProject: Project,
  environment: ConfigModels.EnvironmentName): Promise<Models.env.EnvConfig> {
  let configStandaloneEnv: Models.env.EnvConfig;
  const envSurfix = (environment === 'local') ? '' : `.${environment}`;
  var pathToProjectEnvironment = path.join(standaloneProject.location, `${config.file.environment}${envSurfix}`);
  if (!fse.existsSync(`${pathToProjectEnvironment}.js`)) {
    Helpers.warn(`Standalone project ${standaloneProject.location}
      ...without environment${envSurfix}.js config... creating new... `);
    Helpers.writeFile(`${pathToProjectEnvironment}.js`, createExampleConfigFor(standaloneProject));
    Helpers.tsCodeModifier.formatFile(`${pathToProjectEnvironment}.js`);
  }
  configStandaloneEnv = Helpers.require(pathToProjectEnvironment).config as any;
  validateEnvConfig(configStandaloneEnv, `${pathToProjectEnvironment}.js`, true);
  existedConfigs[standaloneProject.location] = configStandaloneEnv;
  return configStandaloneEnv;
}

export async function workspaceConfigBy(workspace: Project,
  environment: ConfigModels.EnvironmentName): Promise<Models.env.EnvConfig> {
  let configWorkspaceEnv: Models.env.EnvConfig;

  const alreadyExistProject = (workspace && workspace.isWorkspace) ? existedConfigs[workspace.location] : null;

  // console.log('alreadyExistedWorksapceConfig', alreadyExistedWorksapceConfig)


  if (!workspace.isWorkspace) {
    Helpers.error(`Funciton only accessible from workspace type project`);
  }

  if (_.isObject(alreadyExistProject) && alreadyExistProject !== null) {
    configWorkspaceEnv = alreadyExistProject;
    // console.log('Already exist workspaceconfig ', EnvironmentConfig.woksapaceConfigs)
  } else {
    const envSurfix = (environment === 'local') ? '' : `.${environment}`;
    var pathToProjectEnvironment = path.join(workspace.location, `${config.file.environment}${envSurfix}`);
    Helpers.log('pathToProjectEnvironment:' + pathToProjectEnvironment)

    if (workspace.isSiteInStrictMode) {
      if (!fse.existsSync(`${pathToProjectEnvironment}.js`)) {
        Helpers.log(`[SITE QUICKFIX] File doesnt exist: ${pathToProjectEnvironment}.js`)
        try {
          if (workspace.isSiteInStrictMode) { // QUICK_FIX to get in site child last worksapce changes
            Helpers.log('[SITE QUICKFIX] INIT WORKSPACE , BUT RECREATE IT FIRST')
            await workspace.join.start(`QuickFix basleine/site join for "${workspace.genericName}"`);
          }
        } catch (e) {
          Helpers.error(e)
        }
      }
    }

    if (!fse.existsSync(`${pathToProjectEnvironment}.js`)) {
      Helpers.warn(`Workspace ${workspace.location}
        ...without environment${envSurfix}.js config... creating new... `);
      Helpers.writeFile(`${pathToProjectEnvironment}.js`, createExampleConfigFor(workspace));
      Helpers.tsCodeModifier.formatFile(`${pathToProjectEnvironment}.js`);
    }

    try {
      configWorkspaceEnv = Helpers.require(pathToProjectEnvironment).config as any;
    } catch (err) {
      Helpers.error(`Error during reading workspace config file ${pathToProjectEnvironment}.js`, false, true);
    }

    // try {
    // console.log('configWorkspaceEnv', configWorkspaceEnv)
    // } catch (error) {
    //   if (workspace.isSiteInStrictMode) { // QUICK_FIX to get in site child last worksapce changes
    //     console.log('INIT WORKSPACE , BUT RECREATE IT FIRST')
    //     workspace.join.init() // fix for recreating site
    //   }
    //   config = require(pathToProjectEnvironment).config as any;
    // }

  }
  validateEnvConfig(configWorkspaceEnv, `${pathToProjectEnvironment}.js`);
  existedConfigs[workspace.location] = configWorkspaceEnv;


  return configWorkspaceEnv;
}

function createExampleConfigFor(proj: Project) {

  function templetForInfo(project: Project, counter = 0) {
    return JSON.stringify({
      baseUrl: `/${project.name}`,
      name: project.name,
      $db: (project.typeIs('isomorphic-lib')) && {
        database: 'tmp/db.sqlite3',
        type: 'sqlite',
        synchronize: true,
        dropSchema: true,
        logging: false
      },
      port: 9000 + Number(counter)
    }, null, 2)
      .split('\n')
      .map(l => {
        // console.log('l  : '+l)
        l = l.trim();
        const cc = l.match(/^\"[a-zA-Z0-9|\$]+\"/);
        const m = (cc ? cc : []).map(s => s.replace(/\"/g, ""));
        // if (m.length === 2) {
        const first = _.first(m);
        if (first) {
          l = l.replace(`"${first}"`, `${first}`);
        }
        // }
        return l;
      })
      .join('\n');
  }

  const workspacePart = proj.isStandaloneProject ? '' : `
  workspace: {
    workspace: {
      //  baseUrl: "/${proj.name}",
      name: "${proj.name}",
      port: 5000
    },
    projects: [
      ${proj.children.map((c, i) => {
    return templetForInfo(c, i)
  }).join(',\n')}
    ]
  }
  `;

  const configPathRequire = proj.isStandaloneProject ? '{ config: {} }' : `require('tnp/index.js').default`;

  return `
  const path = require('path')
var { config } = ${configPathRequire};

config = {

  domain: '${proj.name}.example.domain.com',
  ${workspacePart}

}
module.exports = exports = { config };
  `;
}


//#endregion