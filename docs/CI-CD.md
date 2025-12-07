**Taon** supports 4 types of releases:<br>

 

<table style="width: 100%">
  <tr>
    <td><b>Manual</b></td>
    <td> 
      Locally build/test and then publish to remote server
      ( npm or app store or taon cloud ).
    </td>
  </tr>
  <tr>
    <td><b>Cloud</b></td>
    <td> 
     Everything that *Manual* does, but triggered on remote on server.
    </td>
  </tr>
  <tr>
    <td><b>Local</b></td>
    <td> 
      Build and deploy to local repo, or special repo, or special branch.
    </td>
  </tr>
  <tr>
    <td><b>Static pages</b></td>
    <td> 
      Perfect for publishing stuff to github pages or similar solution
    </td>
  </tr>
</table>


than can be used to achieve proper CI/CD<br>
[*( Continuous Integration (CI) and Continuous Delivery (CD) )*.](https://en.wikipedia.org/wiki/CI/CD)
<br>
<br>
Depending on initial state of project:<br>

- type of project<br>
- type of artifacts that you want to produce<br>
- number of developers<br>
- size of codebase<br>
- security level<br>
<br>

..each release type may suit you better than the others.

----
✅ - DONE  <br>
⌛ - IN PROGRESS <br>
---

Taon cli support following release artifacts:

⭐ <b>npm lib and cli tool </b> - Shared npm library with global cli tool. <br>
The library code is shared across all other artifacts except docs webapp.

⭐ <b>angular node app </b> - Backend/frontend NodeJs/Angular app shared across<br>
 artifacts (In websql mode -> there is only frontend with backend inside browser).

⭐ <b>vscode plugin </b> - Visual Studio Code extension/plugin with backend from *npm lib and cli tool*

⭐ <b>electron app   </b> - Electron app with *angular node app* as IPC  `dfrontend/backend 

⭐ <b>mobile app  </b> - Ionic framework based mobile app with *angular node app* as frontend/backend.

⭐ <b>docs webapp  </b> - Combined documentation: *MkDocs* + *Compodoc*  + *Storybook* .
