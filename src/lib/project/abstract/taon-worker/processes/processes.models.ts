export type ProcessState =
  | 'created'
  | 'starting'
  | 'restarting'
  | 'active'
  | 'killing'
  | 'killed'
  | 'ended-with-error'
  | 'ended-ok';
export type ProcessAction = 'start' | 'stop';

