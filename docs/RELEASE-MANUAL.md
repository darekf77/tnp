
### Manual Release
> 🚀 Purpose: release artifacts using cli on development machine

> 🚀 Purpose: A convenient way to check if the Cloud Release will work.

> 🚀 This release creates a config that is used later in the Cloud Release.

<table>
  <tr>
    <th style="font-weight:normal;">Artifact name</th>
    <th><u>Manual</u></th>
  </tr>
  <tr>
    <td><b>npm lib and cli tool</b><br>(manual)</td>
    <td> 
      ⌛ - publish as normal package (project name as npm name) <br>
      ⌛ - publish as organization package (container name as org. name) <br>
      ⌛ - handle public/private npm (login if needed), use .npmrc <br>
      ⌛ - build option: publish only cli without lib code <br>
      🤔 - build option: minify/obscure library code file by file  <br>
      ⌛ - build option: (single one file) minify/obscure whole library/cli<br>
    </td>
  </tr>
  <tr>
    <td><b>angular node app</b><br>(manual)</td>
    <td> 
    ⌛ - build docker with router for NodeJs backend and Angular frontend <br>
    ⌛ - docker can be use with any docker management system<br>
    ⌛ - taon cloud handle start/stop/update/deployment of dockers/apps<br>
    ⌛ - release docs webapp to github_pages special branch: <br>
    </td>
  </tr>
  <tr>
    <td><b>vscode plugin</b><br>(manual)</td>
    <td>
     ⌛ - publish to azure when azure cloud cli available <br>
     ⌛ - publish special website assets as new release <br>
    </td>
  </tr>
  <tr>
    <td><b>electron app</b><br>(manual)</td>
    <td>
     ⌛ - publish to store (ms store, mac app store, snap, flatpak)  <br>
     ⌛ - publish special website assets as new release <br>
    </td>
  </tr>
  <tr>
    <td><b>mobile app</b><br>(manual)</td>
    <td>
    ⌛ - publish to app store (play, app store, app gallery)  <br>
    ⌛ - publish special website assets as new release <br>
    </td>
  </tr>
  <tr>
    <td><b>docs webapp</b><br>(manual)</td>
    <td>
    ⌛ - publish special website assets documentation as new release <br>
    ⌛ - release docs webapp to github_pages special branch: <br>
    </td>
  </tr>
</table>
