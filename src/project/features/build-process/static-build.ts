//#region @backend
import * as path from 'path';
import * as sleep from 'sleep';
import * as glob from 'glob';
import * as fse from 'fs-extra';
import { Project, FeatureForProject } from '../../abstract';
import { Helpers } from '../../../helpers';
import chalk from 'chalk';
import { config } from '../../../config';
import { Models } from '../../../models';

export class StaticBuild extends FeatureForProject {

  static alerdyRegenerated = [];
  async regenerate(regenerateWorkspaceChildren = true) {
    // console.log(StaticBuild.alerdyRegenerated)
    if (StaticBuild.alerdyRegenerated.includes(this.project.location)) {
      Helpers.log(`Already regenrated workspace ${this.project.genericName}`)
      return;
    } else {
      // console.log(`NOT YET GENERATED ${this.project.genericName}`)
    }
    if (this.project.isWorkspaceChildProject) {
      if (!this.project.parent.distribution) {
        await this.project.parent.staticBuild.regenerate();
        return;
      }
      await this.project.parent.staticBuild.regenerate(false);
    }
    await regenerateDistribution(this.project);
    if (this.project.isWorkspace && regenerateWorkspaceChildren) {
      for (let index = 0; index < this.project.children.length; index++) {
        const c = this.project.children[index];
        await regenerateDistribution(c);
      }
    }
  }

}

async function regenerateDistribution(project: Project) {
  Helpers.info(`Actual Regenerating project: ${project.genericName}`);
  StaticBuild.alerdyRegenerated.push(project.location)
  const outDir: Models.dev.BuildDir = 'dist';

  const locationOfGeneratedProject = getLocationOfGeneratedProject(project, outDir);

  if (project.isWorkspace && project.isSite) {
    const genLocationBaseline = path.join(project.location, outDir, project.baseline.name);
    await initBaseline(project);
    generateBaselineSourceInDist(project, genLocationBaseline);
    await initGeneratedBaselienInDist(genLocationBaseline);
  }

  if (project.isWorkspace) {
    if (project.distribution) {
      project.copyManager.generateSourceCopyIn(project.distribution.location, { override: false, });
    } else {
      project.copyManager.generateSourceCopyIn(locationOfGeneratedProject);
    }
  } else if (project.isWorkspaceChildProject) {
    project.copyManager.generateSourceCopyIn(locationOfGeneratedProject, { override: false });
  }

}

async function initBaseline(project: Project) {
  const initAll = project.isWorkspace;
  const baselineWorkspace = project.isWorkspaceChildProject ? project.parent.baseline : project.baseline;
  // prevent npm full instatalation
  const binInBasleine = path.join(baselineWorkspace.location, config.folder.node_modules, config.folder._bin);
  if (!fse.existsSync(binInBasleine)) {
    fse.mkdirpSync(binInBasleine);
  }
  await baselineWorkspace.filesStructure.init('');
  if (initAll) {
    for (let index = 0; index < baselineWorkspace.children.length; index++) {
      const child = baselineWorkspace.children[index];
      await child.filesStructure.init('');
    }
  }
}

function getLocationOfGeneratedProject(project: Project, outDir: string) {
  return project.isWorkspace ?
    path.join(project.location, outDir, project.name) :
    path.join(project.parent.location, outDir, project.parent.name, project.name);
}


async function initGeneratedBaselienInDist(generatedInDistBaselineWorkspaceLocation: string) {

  const generateBaselineWorkspaceInDist: Project = Project.From(generatedInDistBaselineWorkspaceLocation);

  // prevent npm full instatalation
  const binInBasleine = path.join(
    generateBaselineWorkspaceInDist.location,
    config.folder.node_modules,
    config.folder._bin);
  if (!fse.existsSync(binInBasleine)) {
    fse.mkdirpSync(binInBasleine);
  }
  await generateBaselineWorkspaceInDist.filesStructure.init('');
  for (let index = 0; index < generateBaselineWorkspaceInDist.children.length; index++) {
    const child = generateBaselineWorkspaceInDist.children[index];
    await child.filesStructure.init('');
  }
}

function generateBaselineSourceInDist(project: Project, genLocationBaseline: string) {
  project.baseline.copyManager.generateSourceCopyIn(genLocationBaseline);
  for (let index = 0; index < project.baseline.children.length; index++) {
    const baselineChild = project.baseline.children[index];
    baselineChild.copyManager.generateSourceCopyIn(path.join(genLocationBaseline, baselineChild.name));
  }
}


 //#endregion
