# Taon vs. Other Frameworks, CLIs, and Platforms

Taon is a TypeScript framework and CLI for building applications with Angular frontends and REST APIs. Its isomorphic build model lets browser and backend code live in the same TypeScript file. The build produces target-specific versions of that file, so backend-only code can be excluded from browser output.

Taon also offers composable admin modules for content, commerce, and other application features. The comparisons below cover three decisions: how to build your application, how to organize and package your projects, and how much of a website or store you want to assemble yourself.

## Taon vs. NestJS

NestJS gives teams a structured Node.js backend with modules, providers, and decorator-based controllers. Taon centers its architecture on contexts, generated REST APIs, and code shared across browser and backend targets.

| Area | NestJS | Taon |
| --- | --- | --- |
| API design | Supports REST and GraphQL. Decorators define controller routes and handlers. | Focuses on REST. Taon derives routes and generates client calls from context and controller definitions. |
| Browser and backend builds | A NestJS application runs on the server. A separate frontend build can consume shared packages. | The build can produce browser and backend versions of the same TypeScript source file. |
| Dependency injection | Providers are singleton-scoped by default. Request and transient scopes are available. | Taon-managed classes are singletons within their context. |
| Composition and inheritance | Modules expose providers, and injection tokens identify dependencies. Route paths are configured through decorators. | Contexts, controllers, and repositories can be extended. Context and class names participate in route generation and class replacement during context inheritance. |
| Database integration | The application selects its database and integration library. | Taon provides database workflows for its supported targets, including SQL.js-based browser development. |

Choose NestJS when the backend is a separate application and you want its module and provider model. Choose Taon when context inheritance, generated REST calls, and a shared browser/backend source model are central to the application.

## Taon vs. Express

Express provides routing and middleware for Node.js. Taon adds conventions for defining REST APIs in classes and generating the browser calls that consume them.

| Area | Express | Taon |
| --- | --- | --- |
| Route definition | Register handler functions on an application or router. | Define endpoints as decorated controller methods inside a context. |
| Reuse | Compose routers, middleware, and handler functions. | Compose contexts and extend controllers and repositories. |
| REST client calls | The application supplies its own client or adds client generation. | Taon generates REST client calls from controller definitions. |
| Middleware | Middleware runs in the Node.js application. | Taon supports isomorphic middleware for its browser and backend workflows. |
| Browser execution | Express runs on Node.js. | Taon's WebSQL mode can run the backend in the browser. |

Choose Express when you want direct control over routing and middleware with few framework conventions. Choose Taon when you want the framework to connect controller methods, generated client calls, and browser-based backend development.

## Taon CLI vs. Angular CLI

Angular CLI manages Angular workspaces, applications, and libraries. Taon CLI manages Taon projects and their build targets, including projects with Angular frontends.

| Area | Angular CLI | Taon CLI |
| --- | --- | --- |
| Project structure | An Angular workspace can contain multiple applications and libraries. | Taon projects can be organized under a container, with individual projects also usable as libraries. |
| Dependency management | The workspace uses its package manager and dependency configuration. | Taon containers provide a shared package baseline for projects in the container. |
| Library assets and styles | Angular libraries can package assets and Sass entry points through library packaging configuration. | Taon provides project conventions for sharing assets and SCSS entry points such as `index.scss`. |
| Build scope | Builds Angular applications and libraries. | Builds Taon projects for their configured application and library targets. |

Choose Angular CLI for a conventional Angular workspace. Choose Taon CLI when your Angular frontend is part of a Taon application or when several Taon projects need a shared package baseline and build conventions.

## Taon vs. Next.js

Next.js and Taon both support full-stack TypeScript development. They organize the browser/server boundary differently.

| Area | Next.js | Taon |
| --- | --- | --- |
| UI framework | React | Angular |
| Browser/server boundary | Uses React Server and Client Components, route handlers, and framework conventions to define where code runs. | Uses target-specific code splitting to produce browser and backend versions of the same source file. |
| Application APIs | Route handlers expose HTTP endpoints. Server Components can access server-side data directly. | Contexts and decorated controllers define REST endpoints, with generated client calls for consumers. |

Choose Next.js when you want a React application built around its routing and rendering model. Choose Taon when you want Angular, context-based REST APIs, and Taon's approach to sharing TypeScript source across targets.

## Taon vs. WordPress and PrestaShop

WordPress starts with a content management system. WooCommerce adds store features as a separate plugin. PrestaShop starts with a store application and includes tools for managing content pages. Taon starts with a framework, CLI, and modules that developers assemble into a custom application.

| Area | Taon | WordPress with WooCommerce | PrestaShop |
| --- | --- | --- | --- |
| Content | `@taon-dev/cms` provides content and media management. The application defines how content appears on the public site. | WordPress provides posts, pages, a block editor, and themes. Block themes support site-wide editing through the Site Editor. | The backoffice manages content pages alongside the product catalog. |
| Commerce | `@taon-dev/e-commerce` provides products, carts, orders, Stripe checkout, and entitlements. Developers integrate the storefront and configure payments. | WooCommerce adds products, checkout, orders, taxes, and shipping. Payment options and integrations depend on configuration and installed extensions. | Store management centers on products, variants, stock, pricing, shipping, and orders. Payment modules connect the store to payment providers. |
| Backoffice | `@taon-dev/baseline` brings together admin modules such as Session, CMS, and E-commerce. Developers register the contexts and routes and configure access. | WordPress provides the site admin. WooCommerce adds store management screens. | PrestaShop provides a store backoffice with catalog, order, and shop management screens. |
| Customization | Extend the application with TypeScript, Angular components, Taon contexts, and packages. | Customize the site with themes, WordPress plugins, WooCommerce extensions, and custom code. | Customize the store with themes, modules, and custom code. |
| Deployment and maintenance | The team builds and deploys the application for its chosen target and maintains its code, integrations, and data. | The operator maintains WordPress, WooCommerce, the theme, and plugins. Managed hosting can handle some of this work. | The operator maintains PrestaShop, the theme, and modules. Managed hosting can handle some of this work. |

### What building with Taon involves

For a combined website and store, a developer can use Baseline for the backoffice, CMS for content, and E-commerce for products and checkout. The developer connects these modules to the public site, configures permissions and payments, and deploys the application. Once the application is running, the site owner can manage content and products through the configured backoffice.

Taon's Node.js, WebSQL browser, and Cloudflare Worker workflows serve different deployment needs. For example, WebSQL mode can run the backend locally in the browser. Production Stripe credentials and public webhook handling require a server-side deployment.

See the [Taon Admin module guides](https://github.com/darekf77/taon-containers/tree/master/container-v21/isomorphic-lib-v21/.ai/taon-admin) and the [Taon Admin setup tutorial](https://github.com/darekf77/taon-containers/blob/master/container-v21/isomorphic-lib-v21/.ai/tutorial/add-taon-admin-to-existing-project.md).

### Which platform fits your project?

- **Choose Taon** when a development team needs a custom TypeScript application with control over the public site, APIs, permissions, and workflows. The team owns the integration, deployment, and maintenance.
- **Choose WordPress** when publishing is the main job and editors need an established CMS and theme ecosystem. Add WooCommerce when the site also needs a store.
- **Choose PrestaShop** when running a store is the main job and its built-in catalog, stock, and order workflows cover most of your requirements.
