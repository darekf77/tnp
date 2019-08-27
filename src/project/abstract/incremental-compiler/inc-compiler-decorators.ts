
import { CLASS } from 'typescript-class-helpers';
import * as _ from 'lodash';
import { ChangeOfFile } from './change-of-file.backend';
import { error } from '../../../helpers';
import { CompilerManager } from './incremental-compiler.backend';

export function AsyncAction(options?: any[]) {
  return (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor
  ) => {
    // get original method
    // unsub(void 0, void 0);
    const originalMethod = propertyDescriptor.value;
    // redefine descriptor value within own function block
    propertyDescriptor.value = function (...args: any[]) {
      // log arguments before original function
      console.log(`${propertyKey} method called with args:     ${JSON.stringify(args, null, 2)}`);
      const first = _.first(args);
      if (first instanceof ChangeOfFile) {
        const ex = first.clientsForChange.find(f => CLASS.getNameFromObject(f) === CLASS.getName(target));
        if (ex) {
          const indexOfTraget = first.clientsForChange.indexOf(ex);
          first.executedFor.push(ex);
          console.log(`HHHH!!!!! Async Method called fror ${CLASS.getName(target)}`);
        }
      }
      // attach original method implementation
      let result = originalMethod.apply(this, args);
      //log result of method
      // console.log(
      //   `${propertyKey} method return value:
      // ${JSON.stringify(result)}`);
      return result;
    }
  }
}

export interface IncCompilerClassOptions {
  className: string;
}

const instancesNames = [];
export function IncCompilerClass(options: IncCompilerClassOptions) {
  return (target) => {
    const { className } = options;
    if (instancesNames.includes(className)) {
      error(`Compiler class "${className}" already has instance.`, false, true);
    }
    instancesNames.push(className);
    CLASS.NAME(className, { singleton: 'first-instance' })(target);
  };
}
