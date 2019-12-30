//#region @backend
import * as  psList from 'ps-list';
import { TnpDB } from '../../tnp-db/wrapper-db';
import { CommandInstance } from '../../tnp-db/entites';
import { Models } from '../../models';
import { DBProcMonitor } from './db-proc-monitor.backend';
import { CLIWRAP } from '../cli-wrapper.backend';
import { DBMonitTop } from './monit-top.backend';

export async function $LAST(args: string) {
  const db = await TnpDB.Instance;
  const last = db.lastCommandFrom(process.cwd());
  // console.log('last commadn to run', last)
  await db.runCommand(!!last ? last : new CommandInstance(undefined, process.cwd()));
  // process.exit(0)
}

const $DB = async (args: string) => {
  const db = await TnpDB.Instance;

  if (args.trim() === 'reinit') {
    await db.init()
    db.transaction.setCommand('tnp db reinit')
  } else {
    db.transaction.setCommand('tnp db')
  }

  process.exit(0)
}


async function $MONIT_TOP() {
  const db = await TnpDB.Instance;
  (new DBMonitTop(db)).start();

}

async function $EXISTS(args: string) {
  const pid = Number(args.trim())
  const ps: Models.system.PsListInfo[] = await psList();
  console.log(`process.pid: ${process.pid}`)
  console.log(`pid to check: ${pid}`)
  console.log(!!ps.find(p => p.pid === pid))
  process.exit(0)
}

async function $PROC_MONITOR() {
  const db = await TnpDB.Instance;
  (new DBProcMonitor(db)).start();

}

const $DB_REINIT = () => {
  return $DB('reinit')
};


export default {
  $PROC_MONITOR: CLIWRAP($PROC_MONITOR, '$PROC_MONITOR'),
  $MONIT_TOP: CLIWRAP($MONIT_TOP, '$MONIT_TOP'),
  $DB: CLIWRAP($DB, '$DB'),
  $DB_REINIT: CLIWRAP($DB_REINIT, '$DB_REINIT'),
  $LAST: CLIWRAP($LAST, '$LAST'),
  $EXISTS: CLIWRAP($EXISTS, '$EXISTS')
}

//#endregion
