import { _ } from 'tnp-core/src';

export type JsPrimitive =
  | string
  | number
  | boolean
  | null
  | undefined
  | bigint
  | symbol;

export class TaonStateMachine<T extends JsPrimitive = JsPrimitive> {
  private _currentValue: T;

  constructor(
    private readonly config: {
      defaultValue: T;
      allowedStateMap?: Map<T, T[]>;
      modifyStateBeforeSetting?: (nextState: T, currentState: T) => T;
      effect?: (nextState: T, previousState: T) => void | Promise<void>;
      throwOnInvalidTransition?: boolean;
    },
  ) {
    this._currentValue = config.defaultValue;
  }

  get currentValue(): T {
    return this._currentValue;
  }

  canSet(nextStateRaw: T): boolean {
    const nextState =
      this.config.modifyStateBeforeSetting?.(
        nextStateRaw,
        this._currentValue,
      ) ?? nextStateRaw;

    if (!_.isMap(this.config.allowedStateMap)) {
      return true;
    }

    const allowed = this.config.allowedStateMap.get(this._currentValue) ?? [];
    return allowed.includes(nextState);
  }

  async set(nextStateRaw: T): Promise<boolean> {
    const previousState = this._currentValue;

    const nextState =
      this.config.modifyStateBeforeSetting?.(nextStateRaw, previousState) ??
      nextStateRaw;

    if (_.isMap(this.config.allowedStateMap)) {
      const allowed = this.config.allowedStateMap.get(previousState) ?? [];

      if (!allowed.includes(nextState)) {
        const message = `Invalid state transition: ${String(previousState)} -> ${String(nextState)}`;

        if (this.config.throwOnInvalidTransition) {
          throw new Error(message);
        }

        console.warn(message);
        return false;
      }
    }

    this._currentValue = nextState;

    await this.config.effect?.(nextState, previousState);

    return true;
  }
}
