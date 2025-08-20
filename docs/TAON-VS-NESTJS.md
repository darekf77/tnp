Taon isomorphic architecture wit code cutting makes it unique
in world of TypeScript frameworks.


<table>
  <tr>
    <th></th>
    <th>NestJS</th>
    <th>Taon.dev</th>
  </tr>
  <tr>
    <td>Approach</td>
    <td>More Genreal (rest api, graphql - everything)</td>
    <td>More Focused (on seemles, elegant rest api)</td>
  </tr>
  <tr>
    <td>Code Cutting and shipping it separated version of the same file into client(browser) and backend</td>
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
    <td>Each class is singleton inside context</td>
  </tr>
  <tr>
    <td>Class Names</td>
    <td>framework does not use class names for any specyfic purpose</td>
    <td>Context names and TypeScript class names are being use to build automatic api paths and identify/replace class during inheritance</td>
  </tr>
  <tr>
    <td>Inheritance possibilities</td>
    <td>Similar to Angular DI</td>
    <td>Everything can be easliy inherited/extended from Contexts, Controllers, Repositores etc. - everthing is singleton in context and
    everything has a unique name</td>
  </tr>
   <tr>
    <td>Controllers</td>
    <td>class methods with decorators can be used as way to access api</td>
    <td> automatically generated rest api calls base on: contexts, intehriance, controllers, class methods names and decorators </td>
  </tr>
  <tr>
    <td>Databases</td>
    <td>Everything there is</td>
    <td> sql.js for development, maridb for production </td>
  </tr>
</table>
