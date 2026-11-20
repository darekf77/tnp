# Let AI Agents Build Your Full-Stack Applications

### One language. One architecture. Unlimited possibilities.

Modern AI coding agents can generate enormous amounts of code.

But generating code is only part of software development.

Agents still need to understand project structures, configure build tools, manage dependencies, synchronize frontend and backend interfaces, run tests, and prepare deployments.

**Taon is designed to reduce that complexity.**

Instead of making AI agents repeatedly solve infrastructure problems, Taon provides a consistent, strongly typed, isomorphic development environment.

You define the architecture. AI agents implement functionality. Taon handles much of the repetitive development infrastructure.

## 1. One Language for Frontend, Backend, and Database

**TypeScript everywhere.** 🚀

Use one language across Angular applications, Node.js services, database entities, shared models, and business logic.

Developers and AI agents can work across the entire stack without constantly switching programming languages or translating models between incompatible systems.

## 2. Rock-Solid Frameworks as the Foundation

**Built on proven technologies.** ⭐

Taon combines TypeScript, Angular, Node.js, RxJS, NgRx, TypeORM, and Express.js into a unified development experience.

Rather than inventing replacements for established technologies, Taon brings them together under a consistent architecture.

AI agents can use their existing knowledge of these widely adopted frameworks.

## 3. Never Repeat Code Unnecessarily

**Write once. Reuse across environments.** ✅

Taon's isomorphic architecture allows compatible functionality to be shared between frontend, backend, and libraries.

Shared models, validation rules, and business logic don't need to be independently recreated for each runtime.

The goal is to eliminate unnecessary duplication while keeping environment-specific implementations where they belong.

## 4. Strongly Typed Frontend, Backend, and Database

**Refactor across the stack with confidence.** ✍️

Imagine changing a property in a database entity and having TypeScript immediately identify the affected controllers, services, Angular components, and templates.

With shared types and proper tooling, a single refactoring can propagate through the entire application.

For AI coding agents, this is especially valuable: the compiler becomes an additional feedback mechanism for detecting incomplete changes.

## 5. Automatically Generated Configuration

**Less setup. More development.** ✏️

Taon manages and regenerates essential framework configuration files.

Developers and agents can focus on application functionality instead of repeatedly configuring build systems, development servers, and tooling.

## 6. Developer-Friendly Visual Studio Code Workflow

**Your editor becomes your development command center.** 👨‍💻

Taon is designed for a productive Visual Studio Code workflow, including debugging, building, testing, and running applications.

AI coding agents can operate within the same project structure and development tools used by human developers.

## 7. Stable, Shared NPM Dependencies

**One dependency foundation. Many projects.** 🐳

Taon uses shared core containers located under:

```text
~/.taon/taon/projects/container-*
```

Instead of maintaining a complete independent `node_modules` installation for every project, Taon can link projects to centrally managed dependencies.

This can reduce disk usage, accelerate project setup, and simplify dependency maintenance.

Centralized dependencies also make updates and security patch management easier, although dependency vulnerabilities still require monitoring and updates.

## 8. Simplified Project Releases

**Complex release workflows. Simple commands.** ⚡

Taon supports standalone projects, organizational containers, and multiple release strategies.

For example:

```bash
taon ar cloudflare:prod
```

A single command can execute a configured production release workflow.

Future Taon Cloud integration will extend this approach with centralized orchestration.

## 9. Develop Applications and Libraries Together

**Every project can be an app-library.** 🌟

A Taon project doesn't have to be exclusively an application or a library.

It can provide reusable functionality while also containing an application for developing, testing, and demonstrating that functionality.

This is especially useful for AI agents working on independent features or shared components.

## 10. Backend and Angular Libraries Together

**Full-stack packages without artificial separation.** 🤝

Taon supports project structures combining Node.js functionality with Angular-compatible libraries.

Backend controllers, shared models, and Angular components can coexist within the same project architecture.

A project might be 90% backend, 90% frontend, or anything in between.

**Separate projects by responsibility, not automatically by runtime.**

## 11. Shared Assets Inside Packages

**Reuse more than TypeScript code.** 💾

Taon supports shared package assets through:

```text
src/assets/shared/
```

Images and other shared resources can be distributed alongside reusable functionality.

## 12. WebSQL — Run Backend Functionality in the Browser

**Why require a separate backend server when the browser can run the application?** 🌐

Taon's WebSQL development mode allows compatible backend and database functionality to execute inside the browser.

Using technologies such as TypeORM and SQL.js, applications can work with SQL databases in a browser environment, with persistence through browser storage.

This creates interesting opportunities for:

- Serverless application demonstrations.
- Local development without a separate backend process.
- Browser-based integration and end-to-end testing.
- Portable, self-contained development environments.

For AI agents, this can significantly simplify the environment needed to run and test full-stack application behavior.

## 13. CI/CD Without Unnecessary Infrastructure

**Start locally. Automate progressively.** ⚡

Taon already provides commands for coordinating repositories, building projects, and executing releases.

```bash
taon pull:deep
taon bp
taon ar cloudflare:prod
```

You can begin with a static WebSQL application hosted on GitHub Pages or a similar platform.

When your requirements grow, you can move to a full-stack deployment strategy such as Cloudflare.

Taon Cloud is planned to provide centralized CI/CD orchestration, but you don't need to wait for it to start building and releasing applications.

## 14. A Development Process Designed for Humans and AI Agents

**Infrastructure should support developers, not dominate their work.** 🧠

Taon aims to minimize repetitive DevOps configuration through consistent project structures, generated configuration, shared dependencies, and CLI automation.

Human developers remain responsible for architecture, security, quality, and release decisions.

AI agents can focus on implementation, testing, refactoring, and maintenance within those boundaries.

---

## 15. Let AI Agents Build — Let Taon Keep Everything Together

The real opportunity isn't simply generating more code.

It's enabling multiple AI agents to contribute to a coherent software architecture.

```text
                  SOFTWARE ARCHITECT
                         │
                  TAON CONTAINER
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
    AI AGENT A        AI AGENT B        AI AGENT C
       │                 │                 │
   Backend-heavy     Frontend-heavy    Shared Library
     App-Lib           App-Lib           App-Lib
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                  SHARED TYPES
                  SHARED SOURCE
                         │
                  TAON BUILD
                         │
                  TEST & VALIDATE
                         │
                  TAON RELEASE
                         │
                  PRODUCTION
```

Each agent can work on a different project or feature.

Taon's containers provide a common workspace, source-first builds allow projects to be integrated without intermediate NPM releases, and TypeScript helps detect incompatible changes.

The developer controls the architecture and reviews the results.

**AI agents write the code. Taon provides the structure to build, integrate, test, and release it.**

### The Philosophy

Don't make developers and AI agents spend their time rebuilding the same infrastructure.

Give them a predictable architecture, powerful existing frameworks, shared source code, and simple commands.

**Build the architecture once. Let humans and AI agents develop it together. Deploy wherever your application needs to run.**
