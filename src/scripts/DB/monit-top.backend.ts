import * as  psList from 'ps-list';
import { TnpDB } from '../../tnp-db/wrapper-db';
import { CommandInstance } from '../../tnp-db/entites';
import { Models } from 'tnp-models';
import { Helpers } from 'tnp-helpers';
import { Project } from '../../project';

export class DBMonitTop {

  constructor(private db: TnpDB) {

  }

  async start() {
    await this.repeat();
  }

  private repeat(n = 0) {

    return new Promise(async (resolve, reject) => {
      const procs: Models.system.PsListInfo[] = await psList();
      Helpers.clearConsole();

      procs
        .filter(f => f.cmd.search('node') !== -1)
        .filter(f => f.cmd.search(`/Applications/Visual Studio Code.app`) === -1)
        .forEach(p => {

          Helpers.log(`${p.ppid}\t${p.pid}\t${p.name}\t${p.cmd}\n`);
        });


      setTimeout(() => {
        this.repeat(n + 1)
      }, 1000)
    })

  }

}
