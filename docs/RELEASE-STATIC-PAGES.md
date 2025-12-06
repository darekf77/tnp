
### Static Pages Release
Take advantage of github pages (or similar solution) in a best possible way.

> 🚀 Purpose: release any compiled/bundled artifact to static pages 
(free [Github Pages](https://pages.github.com/))

> 🚀 Purpose: A convenient way to store artifacts with with versions

> 🚀 Perfect for storing open source apps/libs/docs

<table>
  <tr>
    <th style="font-weight:normal;">Artifact name</th>
    <th><u>Static Pages</u></th>
  </tr>
  <tr>
    <td><b>npm lib and cli tool</b><br>(static-pages)</td>
    <td> 
      ⌛ - publish zipped (also with source code) library/cli to <br>
       <i>static_pages_branch/assets/npm-lib-and-cli-tool/version-X-X-X<i> <br>
      ⌛ - additionally bundled script for cli installation  <br>
    </td>
  </tr>
  <tr>
    <td><b>angular node app</b><br>(static-pages)</td>
    <td> 
    ✅ -  publish angular app with WEBSQL backend to <br>
    <i>static_pages_branch</i>
    </td>
  </tr>
  <tr>
    <td><b>vscode plugin</b><br>(static-pages)</td>
    <td>
     ⌛ - publish zipped (also with source code) vscode plugin to <br>
       <i>static_pages_branch/assets/vscode-plugin/version-X-X-X/</i> <br>
    </td>
  </tr>
  <tr>
    <td><b>electron app</b><br>(static-pages)</td>
    <td>
     ⌛ - publish zipped (also with source code) electron app installer to <br>
       <i>static_pages_branch/assets/electron-app/version-X-X-X</i> <br>
        <br>
    Don't forget to remove gatekeeper after 
    downloading/unpacking your app (on MacOS ARM)<br>
    <code>xattr -d com.apple.quarantine YourApp.app</code>
    </td>
  </tr>
  <tr>
    <td><b>mobile app</b><br>(static-pages)</td>
    <td>
    ⌛ - publish zipped (also with source code) mobile app installer to <br>
      <i>static_pages_branch/assets/mobile-app/version-X-X-X</i> <br>
    </td>
  </tr>
  <tr>
    <td><b>docs webapp</b><br>(static-pages)</td>
    <td>
    ✅ - publish documentation to<br>
       <i>static_pages_branch/documentation</i> <br>
    </td>
  </tr>
</table>
