Taon’s isomorphic architecture with code splitting makes it unique  
in the world of TypeScript frameworks.

## Taon vs NestJS
<table style="width:100%">
  <tr>
    <th></th>
    <th>NestJS</th>
    <th>Taon.dev</th>
  </tr>
  <tr>
    <td>Approach</td>
    <td>More General (REST API, GraphQL – everything)</td>
    <td>More Focused (on seamless, elegant REST API)</td>
  </tr>
  <tr>
    <td>Code splitting and shipping separate versions of the same file to client (browser) and backend</td>
    <td>No</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Node_Modules</td>
    <td>Normal npm approach</td>
    <td>Taon Containers with base/core packages</td>
  </tr>
  <tr>
    <td>Dependency Injection</td>
    <td>Similar to Angular DI</td>
    <td>Each class is a singleton inside its context</td>
  </tr>
  <tr>
    <td>Class Names</td>
    <td>The framework does not use class names for any specific purpose</td>
    <td>Context names and TypeScript class names are used to build automatic API paths and to identify/replace classes during inheritance</td>
  </tr>
  <tr>
    <td>Inheritance</td>
    <td>Similar to Angular DI</td>
    <td>Everything can be easily inherited/extended from Contexts, Controllers, Repositories, etc. – everything is a singleton in its context and has a unique name</td>
  </tr>
  <tr>
    <td>Controllers</td>
    <td>Class methods with decorators can be used as a way to access APIs</td>
    <td>Automatically generated REST API calls based on contexts, inheritance, controllers, class method names, and decorators</td>
  </tr>
  <tr>
    <td>Databases</td>
    <td>Supports all databases</td>
    <td>SQL.js for development, MariaDB for production</td>
  </tr>
</table>

## Taon Vs ExpressJS

<table style="width:100%">
  <tr>
    <th></th>
    <th>ExpressJS</th>
    <th>Taon.dev</th>
  </tr>
  <tr>
    <td>Controllers for rest api</td>
    <td>Inside functions</td>
    <td>Inside classes</td>
  </tr>
   <tr>
    <td>Inheritance of controllers</td>
    <td>No</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Isomorphic middlewares</td>
    <td>No (only backend middlewares)</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Auto generated rest api endpoint</td>
    <td>No</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Can be started inside browser?</td>
    <td>No</td>
    <td>Yes (in websql mode)</td>
  </tr>
</table>


## Taon CLI Vs Angular CLI

<table style="width:100%">
  <tr>
    <th></th>
    <th>Angular CLI</th>
    <th>Taon CLI</th>
  </tr>
  <tr>
    <td>All nice third party packages already included</td>
    <td>No</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Building packages that can shared assets ?</td>
    <td>No</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Building packages that can shared SCSS files (index.scss) ?</td>
    <td>No</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Normal "npm install" just works</td>
    <td>Yes</td>
    <td>No (different approach -> stable packages base + you are putting your taon projects (each taon project is a library also) inside "organization" parent project. By building and updating organization you have strict control over third party packages)</td>
  </tr>
</table>

## Taon Vs NextJS

<table style="width:100%">
  <tr>
    <th></th>
    <th>NextJS</th>
    <th>Taon.dev</th>
  </tr>
  <tr>
    <td>Frontend Framework</td>
    <td>React</td>
    <td>Angular</td>
  </tr>
  <tr>
    <td>Isomorphic TypeScript capability</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Cutting backend code from isomorphic TypeScript files
    (so the rest can go to frontend) </td>
    <td>No</td>
    <td>Yes</td>
  </tr>
</table>
