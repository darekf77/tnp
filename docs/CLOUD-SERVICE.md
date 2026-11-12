## Cloud-Service

Taon, out of the box, provides users with a local service for easy project/port/domain management and deployment. It also gives an insight into what the real bare-bones Taon Cloud service feels like. Essentially, *Taon Service* is the same as *Taon Cloud*.
<br>
<br>
By default, each Taon command checks if a working and healthy local Taon service is available. If not, a new terminal console inside the system starts with the Taon user-friendly UI console.


![alt text](./image-3.png)

**Taon UI Console** – basically, it’s everything you would ever need for deploying and managing your remote projects through SSH. No need for a browser UI, no distractions, security concerns. 
<style>
  th {
    text-align: center;
  }
</style>

## Behavior - on server vs on localhost
<table>
  <tr>
    <th style="font-weight: normal">Behavior - on server vs on localhost</th>
    <th><u>Localhost</u></th>
    <th><u>Cloud</u></th>
  </tr>
  <tr>
    <td><b>Enable/Disable Cloud</b></td>
    <td >
    - enable or disable possibility of deploying docker projects<br>
    - start/stop traefik and related services<br>
     <br>
    </td>
    <td>
    - domains are secure with automatically generated ssl ceritifacte 
    </td>
  </tr>
  <tr>
    <td><b>Manage Taon Projects</b></td>
    <td  >
    - discover/view/add/edit projects for deployments <br>
    - create new project (in future - automatic domain purchase ) <br>
    </td>
    <td><= same as on localhost</td>
  </tr>
  <tr>
    <td><b>Manage Deployments</b></td>
    <td  >
      - main place where you can specify quickly what to deploy and where<br />
      - deploy projects/artifacts<br />
      - deploy groups of projects/artifacts
    </td>
    <td><= same as on localhost</td>
  </tr>
  <tr>
    <td><b>Manage Domains (and /etc/hosts file)</b></td>
    <td>
      - test domains assigned to server with ping<br>
      - simulate fake domains based on /etc/host  <br>      
    </td>
    <td>
    - (in future) deep service integration with providers that will let you
      skip learning about redirecting/assigning domains<br>
    </td>
  </tr>
  <tr>
    <td><b>Manage Ports</b></td>
    <td >
      - assign automatically ports to projects when starting local build (no
      more --port needed, everything)<br />
      - project from same location use the same ports every time to avoid
      confusion<br />
      - for: projects, services, dockers
    </td>
    <td><= same as on localhost</td>
  </tr>
  
  <tr>
    <td><b>Manage Processes</b></td>
    <td   >
    - see processes realtime logs<br>
    - display log files
    </td>
    <td><= same as on localhost</td>
  </tr>

  <tr>
    <td><b>Manage Instances</b></td>
    <td   >
    - add/list/check/authenticated taon instances<br>
    - each taon instance can be connected to other taon instances<br>    
    </td>
    <td><= same as on localhost</td>
  </tr>

  <tr>
    <td><b>Manage Scheduler</b></td>
    <td   >
    - Start deployment of specific project on specific hour<br>
    - Auto deploy after push to specific branch<br>    
    </td>
    <td><= same as on localhost</td>
  </tr>

  <tr>
    <td><b>Settings</b></td>
    <td    >
      - setup password / 2fa authentication for server <br>
      - enable cloud optional container (etc. portainer)<br>
    </td>
    <td><= same as on localhost</td>
  </tr>
</table>



## Cloudflare Worker subprojects

The `taon sub` workflow is limited to Taon isomorphic library projects that
contain a Worker subproject. It can start local development, authenticate the
machine with Cloudflare, configure Worker secrets, set the Worker mode, and
deploy the subproject:

```sh
taon app:cloudflare
taon sub dev
taon sub login
taon sub secrets
taon sub mode
taon sub deploy
```

Set secrets as Worker bindings, not as browser variables. Cloudflare Workers
run in an ESM runtime rather than full Node.js; use the relevant
[isomorphic code-region rules](https://github.com/darekf77/taon-containers/blob/master/container-v21/isomorphic-lib-v21/.ai/docs/isomorphic-code-regions.md)
and verify that each database and storage adapter supports Workers.

## Deployment checklist

Before a cloud release:

1. Select the intended release type and artifact in `taon.jsonc`.
2. Check the target's database, storage, environment-variable, and secret
   configuration.
3. Build and verify the same artifact locally where the target supports it.
4. Confirm public routes, domain configuration, webhook reachability, and
   monitoring for the actual deployment environment.
5. Test rollback and backup procedures; a successful CLI release does not
   prove that the application is operationally ready.

See the [CLI command guide](./COMMANDS.md),
[Cloud Release](./RELEASE-CLOUD.md), and
[CI/CD notes](./CI-CD.md) for related workflows. Availability and release
steps can vary by artifact and project configuration; verify against the
installed Taon CLI and the project's release configuration.
