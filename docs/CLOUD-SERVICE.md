# CLOUD-SERVICE

Taon, out of the box, provides users with a local service for easy project/port/domain management and deployment. It also gives an insight into what the real bare-bones Taon Cloud service feels like. Essentially, *Taon Service* is the same as *Taon Cloud*.
<br>
<br>
By default, each Taon command checks if a working and healthy local Taon service is available. If not, a new terminal console inside the system starts with the Taon user-friendly UI console.


![alt text](image-3.png)

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
    <td  colspan="2">
    - enable or disable possibility of deploying docker projects<br>
    - start/stop treafik and related services<br>
     <br>
    </td>
  </tr>
  <tr>
    <td><b>Projects</b></td>
    <td  colspan="2">
    - discover/view/add/edit projects for deployments <br>
    - create new project (in future - automatic domain purchase ) <br>
    </td>
  </tr>
  <tr>
    <td><b>Deployments</b></td>
    <td colspan="2" >
      - main place where you can specify quickly what to deploy and where<br />
      - deploy projects/artifacts<br />
      - deploy groups of projects/artifacts
    </td>
  </tr>
  <tr>
    <td><b>Domains</b></td>
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
    <td><b>Ports</b></td>
    <td colspan="2">
      - assign automatically ports to projects when starting local build (no
      more --port needed, everything)<br />
      - project from same location use the same ports every time to avoid
      confusion<br />
      - for: projects, services, dockers
    </td>
  </tr>
  
  <tr>
    <td><b>Monitor</b></td>
    <td  colspan="2" >
    - monitor server resources <br>
    - duplicate/scale container <br>
    - set up warning <br>
    - log for processes<br>
    </td>
  </tr>

  <tr>
    <td><b>Settings / Account</b></td>
    <td  colspan="2"  >
      - setup password / 2fa authentication for server <br>
      - enable cloud optional container (etc. portainer)<br>
    </td>
  </tr>
</table>
