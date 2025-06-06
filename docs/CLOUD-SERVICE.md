# CLOUD-SERVICE

Taon, out of the box, provides users with a local service for easy project/port/domain management and deployment. It also gives an insight into what the real bare-bones Taon Cloud service feels like. Essentially, *Taon Service* is the same as *Taon Cloud*.
<br>
<br>
By default, each Taon command checks if a working and healthy local Taon service is available. If not, a new terminal console inside the system starts with the Taon user-friendly UI console.


![alt text](image-3.png)

**Taon UI Console** – basically, it’s everything you would ever need for deploying and managing your remote projects through SSH. No need for a browser UI, no distractions, security concerns. 

## Behavior - on server vs on localhost
<table>
  <tr>
    <th style="font-weight: normal">Manager</th>
    <th><u>Projects</u></th>
    <th><u>Domains</u></th>
    <th><u>Ports</u></th>
    <th><u>Deployments</u></th>
    <th><u>Environments</u></th>
  </tr>
  <tr>
    <td>Localhost</td>
    <td>discover / monitor / change / deploy / remove your git projects</td>
    <td>
      - manage /etc/host file<br />
      - create fake domains for temporary simulation of real service/website
    </td>
    <td>
      - assign automatically ports to projects when starting local build (no
      more --port needed, everything )<br />
      - project from same location use the same ports everytime to avoid
      confusion <br />
      - for: projects, services, dockers
    </td>
    <td>
      - main place where you can specify quickly what to deploy and where<br />
      - deploy projects/artifacts<br />
      - deploy groups of projects/artifacts<br />
    </td>
    <td>
      modify/preview environment assigned for each deployed project artifact
    </td>
  </tr>
  <tr>
    <td>Cloud</td>
    <td>-||-</td>
    <td>
      - display all domains that are assigned for server public ip<br />
      - (in future - deep service integration with providers that will let you
      skip learning about redirecting/assigning domains => just buy/configure
      domain from here!)
    </td>
    <td>-||-</td>
    <td>-||-</td>
    <td>-||-</td>
  </tr>
</table>
