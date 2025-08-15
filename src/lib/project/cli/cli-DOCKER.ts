//#region @backend
import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';

import { BaseCli } from './base-cli';

// @ts-ignore TODO weird inheritance problem
class $Docker extends BaseCli {
  public _(): void {
    console.log(`Hello from taon Docker CLI!`);
    this._exit();
  }

  transmission() {
    Helpers.run(
      `docker run -d \`
  --name transmission \`
  -p 9091:9091 \`
  -p 51413:51413 \`
  -p 51413:51413/udp \`
  -e TZ=Europe/Warsaw \`
  -v "$env:USERPROFILE\\Downloads:/downloads" \`
  -v "$env:USERPROFILE\\transmission-config:/config" \`
  --restart unless-stopped\`
  linuxserver/transmission:latest

      `,
      { output: true },
    ).sync();
    this._exit();
  }
}

export default {
  $Docker: Helpers.CLIWRAP($Docker, '$Docker'),
};
