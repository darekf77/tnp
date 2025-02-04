import { chalk, path } from 'tnp-core/src';
import { fse } from 'tnp-core/src';
import { _ } from 'tnp-core/src';

import { Project } from '../../abstract/project';
import { Models } from '../../../models';
import { Helpers } from 'tnp-helpers/src';
import { config } from 'tnp-config/src';

//#region dedupe packages

export function dedupePackages(
  projectLocation: string,
  packagesNames?: string[],
  countOnly = false,
  warnings = true,
) {
  Helpers.taskStarted(
    `${countOnly ? 'Counting' : 'Fixing/removing'} duplicates ${path.basename(
      projectLocation,
    )}/node_modules`,
  );

  const rules: {
    [key: string]: { ommitParents: string[]; onlyFor: string[] };
  } = {};

  packagesNames = packagesNames.reduce((a, current, i, arr) => {
    return a.concat([
      ...(Array.isArray(current)
        ? ((depsArr: string[]) => {
            const first: string = _.first(depsArr);
            depsArr = depsArr.slice(1);
            rules[first] = {
              ommitParents: depsArr
                .filter(f => f.startsWith('!'))
                .map(f => f.replace(/^\!/, '')),
              onlyFor: depsArr.filter(f => !f.startsWith('!')),
            };
            if (rules[first].onlyFor.length === 0) {
              delete rules[first].onlyFor;
            }
            if (rules[first].ommitParents.length === 0) {
              delete rules[first].ommitParents;
            }

            return [first];
          })(current)
        : [current]),
    ]);
  }, []);

  packagesNames.forEach(f => {
    let organizationProjectSeondPart = '';
    if (f.search('/') !== -1) {
      organizationProjectSeondPart = f.split('/')[1];
      f = _.first(f.split('/'));
    }
    let pathToCurrent = path.join(
      projectLocation,
      config.folder.node_modules,
      f,
      organizationProjectSeondPart,
    );

    const current = Project.ins.From(pathToCurrent);

    if (!current) {
      warnings && Helpers.log(`Project with name ${f} not founded`);
      return;
    }
    Helpers.logInfo(
      `Scanning for duplicates of current ${current.universalPackageName}@${current.version} ....\n`,
    );
    const nodeMod = path.join(projectLocation, config.folder.node_modules);
    if (!fse.existsSync(nodeMod)) {
      Helpers.mkdirp(nodeMod);
    }
    const removeCommand = `find ${
      config.folder.node_modules
    }/ -name ${f.replace('@', '\\@')} `;
    // console.log(`removeCommand: ${removeCommand}`)
    const res = Helpers.run(removeCommand, {
      output: false,
      cwd: projectLocation,
    })
      .sync()
      .toString();
    const duplicates = res
      .split('\n')
      .map(l => l.replace(/\/\//g, '/'))
      .filter(l => !!l)
      .filter(l => !l.startsWith(`${config.folder.node_modules}/${f}`))
      .filter(
        l =>
          !l.startsWith(`${config.folder.node_modules}/${config.folder._bin}`),
      )
      .filter(
        l => path.basename(path.dirname(l)) === config.folder.node_modules,
      );

    if (countOnly) {
      duplicates.forEach((duplicateRelativePath, i) => {
        let p = path.join(
          projectLocation,
          duplicateRelativePath,
          organizationProjectSeondPart,
        );
        const nproj = Project.ins.From(p);
        if (!nproj) {
          // Helpers.warn(`Not able to identyfy project in ${p}`)
        } else {
          p = p.replace(
            path.join(projectLocation, config.folder.node_modules),
            '',
          );
          Helpers.info(
            `${i + 1}. Duplicate "${nproj.name}@${
              nproj.version
            }" in:\n\t ${chalk.bold(p)}\n`,
          );
        }
      });
      if (duplicates.length === 0) {
        Helpers.logInfo(`No dupicate of ${current.name} fouded.`);
      }
    } else {
      duplicates.forEach(duplicateRelativePath => {
        const p = path.join(projectLocation, duplicateRelativePath);
        const projRem = Project.ins.From(p);
        const versionRem = projRem && projRem.version;

        let parentName = path.basename(
          path
            .dirname(p)
            .replace(
              new RegExp(
                `${Helpers.escapeStringForRegEx(
                  config.folder.node_modules,
                )}\/?$`,
              ),
              '',
            )
            .replace(/\/$/, ''),
        );

        const org = path.basename(path.dirname(path.dirname(path.dirname(p))));
        if (org.startsWith('@') || org.startsWith('@')) {
          parentName = `${org}/${parentName}`;
        }

        const parentLabel = parentName ? `${parentName}/` : ''; // TODO not working !

        if (rules[current.name]) {
          const r = rules[current.name];
          if (
            _.isArray(r.ommitParents) &&
            (r.ommitParents.includes(parentName) ||
              _.isObject(
                r.ommitParents.find(o =>
                  o.startsWith(parentName.replace('*', '')),
                ),
              ))
          ) {
            Helpers.logWarn(
              `[excluded] Ommiting duplicate of ` +
                `${parentLabel}${
                  current.name
                }@${versionRem} inside ${chalk.bold(parentName)}`,
            );
            return;
          }
          if (_.isArray(r.onlyFor) && !r.onlyFor.includes(parentName)) {
            Helpers.logWarn(
              `[not included] Ommiting duplicate of ` +
                `${parentLabel}${
                  current.name
                }@${versionRem} inside ${chalk.bold(parentName)}`,
            );
            return;
          }
        }

        Helpers.remove(p, true);
        Helpers.logWarn(
          `Duplicate of ${parentLabel}${current.name}@${versionRem}` +
            ` removed from ${chalk.bold(parentName)}`,
        );
      });
    }
  });

  Helpers.taskDone(
    `${
      countOnly ? 'Counting' : 'Fixing/removing'
    } duplicates from npm container`,
  );
}
//#endregion

//#region add dependencies
export function addDependenceis(
  project: Project,
  context: string,
  allNamesBefore: string[] = [],
) {
  let newNames = [];
  if (!allNamesBefore.includes(project.name)) {
    newNames.push(project.name);
  }

  Models.ArrNpmDependencyType.forEach(depName => {
    newNames = newNames.concat(
      project
        .__getDepsAsProject(depName, context)
        .filter(d => !allNamesBefore.includes(d.name))
        .map(d => d.name),
    );
  });

  const uniq = {};
  newNames.forEach(name => (uniq[name] = name));
  newNames = Object.keys(uniq);

  const projects = newNames
    .map(name => {
      return Project.ins.From(
        path.join(context, config.folder.node_modules, name),
      );
    })
    .filter(f => !!f);

  // console.log('projects', projects.length)
  allNamesBefore = allNamesBefore.concat(newNames);

  projects.forEach(dep => {
    allNamesBefore = addDependenceis(dep, context, allNamesBefore);
  });

  return allNamesBefore;
}
//#endregion
