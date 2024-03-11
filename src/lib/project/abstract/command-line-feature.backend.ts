import { Helpers } from "tnp-helpers/src";
import { _ } from "tnp-core/src";
import { Project } from "./project";
import { CLASS } from "typescript-class-helpers/src";
import { argsToClear } from "../../../cli";

export abstract class CommandLineFeature<PARAMS = any> {
  protected readonly params: PARAMS;
  protected readonly args: string[];
  constructor(
    protected readonly argsWithParams: string,
    protected readonly project: Project,
    private readonly methodNameToCall: string,
  ) {
    // console.log({ args, methodNameToCall })

    // this.project = Project.Current as Project;
    const methods = CLASS.getMethodsNames(this).filter(f => !f.startsWith('_'));
    const firstArg = _.first(argsWithParams.split(' '));
    const method = methods.find(m => m === firstArg);
    if (method) {
      methodNameToCall = method;
      argsWithParams = argsWithParams.split(' ').slice(1).join(' ');
      this.argsWithParams = argsWithParams;
    }
    this.params = (require('minimist')(argsWithParams.split(' ')) || {});
    delete this.params['_']; // TODO quickfix
    const allArgsToClear = Object.keys(this.params);
    // for (const deleteArgKey of allArgsToClear) {
    //   delete this.params[deleteArgKey];
    // }
    // console.log({ clearArgs: allArgsToClear })
    this.args = Helpers.cliTool.removeArgFromString(argsWithParams, allArgsToClear).split(' ').filter(f => !!f);

    if (methodNameToCall) {
      if (_.isFunction(this[methodNameToCall])) {
        this[methodNameToCall](argsWithParams, this.project);
      } else {
        Helpers.error(`Class ${CLASS.getName(this as any)} doesn't have method '${methodNameToCall}'`, false, true);
      }

    } else {
      this._(argsWithParams, this.project);
    }
  }

  protected exit() {
    process.exit(0)
  }
  public abstract _(args: string, project: Project);
}
