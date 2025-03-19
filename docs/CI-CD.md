**Taon** aside 
migrations - supports 3 types of release ( Local/Repo, Manual and Cloud )<br>
than can be used to achieve proper CI/CD<br>
[*( Continuous Integration (CI) and Continuous Delivery (CD) )*.](https://en.wikipedia.org/wiki/CI/CD)
<br>
<br>
Depending on initial state of project:<br>
 - number of developers<br>
 - size of codebase<br>
 - security level<br>
<br>
..each release type may suit you better than the others.

----
✅ - DONE  <br>
⌛ - IN PROGRESS <br> 
🤔 - MAYBE TODO<br>

💡 - Possible purpose <br>


---

Taon cli support following release artifacts:

⭐ <b>npm lib and cli tool </b> - Shared npm library with global cli tool. <br>
The library code is shared across all other artifacts, except (docs webapp).

⭐ <b>anuglar node app </b> - Backend/frontend NodeJs/Angular app shared across<br>
 artifacts (In websql mode -> there is only frontend with backend inside browser).

⭐ <b>vscode plugin </b> - Visual Studio Code extension/plugin with backend from *npm lib and cli tool*

⭐ <b>electron app   </b> - Electron app with *anuglar node app* as frontend/backend (IPC or UDP/TCP)

⭐ <b>mobile app  </b> - Ionic framework based mobile app with *anuglar node app* as frontend/backend.

⭐ <b>docs webapp  </b> - Combined documentation: MkDocs + Compodoc  + Storybook .
