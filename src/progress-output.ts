import * as _ from 'lodash';
import { CLASS } from 'typescript-class-helpers';

export interface IPROGRESS_DATA {
  /**
   * How man percent of
   */
  value?: number;
  msg?: string;
  type?: PROGRESS_DATA_TYPE;
  date?: Date;
}

export type PROGRESS_DATA_TYPE = 'info' | 'error' | 'warning' | 'event';


@CLASS.NAME('PROGRESS_DATA')
export class PROGRESS_DATA implements IPROGRESS_DATA {

  public static log(log: IPROGRESS_DATA) {
    if (global.tnpShowProgress) {
      console.log(`[[[${JSON.stringify({ value: log.value, msg: log.msg, date: new Date() } as IPROGRESS_DATA)}]]]`)
    }
  }


  public static resolveFrom(chunk: string,
    callbackOnFounded?: (json: PROGRESS_DATA) => any, checkSplit = true): PROGRESS_DATA[] {

    let progress;
    let res: PROGRESS_DATA[] = [];
    if (!_.isString(chunk)) {
      return [];
    }
    chunk = chunk.trim();

    if (checkSplit) {
      const split = chunk.split(/\r\n|\n|\r/);
      if (split.length > 1) {
        // console.log('split founded', split)
        split.forEach(s => {
          res = res.concat(this.resolveFrom(s, callbackOnFounded, false));
        });
        return res;
      }
    }

    if (/\[\[\[.*\]\]\]/g.test(chunk)) {
      chunk = chunk.replace(/^\[\[\[/g, '').replace(/\]\]\]$/g, '');
      progress = chunk;
    }
    if (!_.isUndefined(progress)) {
      try {
        const p = JSON.parse(progress);
        const single = _.merge(new PROGRESS_DATA(), p);
        res = res.concat([single])
        if (_.isFunction(callbackOnFounded)) {
          callbackOnFounded(single);
        }
      } catch (err) {
        console.log(err)
        console.error(`ProgresssBarData: fail to parse "${progress}"`)
      }
    }
    return res;
  }

  public value: number;
  public msg: string;

  public type: PROGRESS_DATA_TYPE = 'event'

  public date: Date;


}

ENV.PROGRESS_DATA = PROGRESS_DATA;
