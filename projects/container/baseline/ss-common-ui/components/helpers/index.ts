export * from './sass';
export * from './base-component';
export * from './resize-service';
export * from './dynamic-resizable-input.directive';

export function stringifyToQueryParams(params, questionMarkAtBegin = false) {
  return Object.keys(params).map(key => key + '=' + params[key]).join('&');
}
