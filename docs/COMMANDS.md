# Taon CLI — Developer Guide

Taon CLI provides a unified development workflow for creating, building, running, and releasing full-stack applications and libraries.

A Taon project can be both an **application and a library**, with shared TypeScript code across frontend and backend environments.

## 1. Creating Projects

Use `taon new` to create standalone projects, containers, and organization-level project structures.

### Standalone Project

Create a standalone project with a basic CRUD application:

```bash
taon new my-standalone-project
```

### Standalone Project with Admin Backoffice

Create a standalone project using the Taon baseline, which includes the full Taon Admin backoffice:

```bash
taon new my-standalone-project --baseline
```

### Documentation Project

Create a documentation application that collects Markdown files distributed across projects:

```bash
taon new my-standalone-project --docs
```

### Container with a Child Project

Create a container and a standalone child project inside it:

```bash
taon new my-projects-container/my-project
```

Resulting structure:

```text
my-projects-container/
└── my-project/
```

### Organization Container

Create a container named `my-container-org`, mark it as an organization, and create a child project:

```bash
taon new @my-container-org/my-project
```

Resulting structure:

```text
my-container-org/
└── my-project/
```

Organization containers allow related Taon projects to be managed together.

---

## 2. Supported Build Artifacts

Taon can produce multiple artifact types from a shared project architecture.

| Artifact | Entry point |
|---|---|
| NPM library | `./src/lib/index.ts` |
| CLI tool | `./src/cli.ts` |
| Angular / Node.js application | `./src/app.ts` |
| Electron desktop application | `./src/app.electron.ts` |
| VS Code extension | `./src/app.vscode.ts` |
| Mobile application (planned) | `./src/app.mobile.ts` |
| Documentation (MkDocs, Storybook, Compodoc) | Markdown and Storybook files |

Documentation sources include files matching `**/*.md` and `**/*.story.ts`.

A single Taon project may contain multiple entry points, allowing it to serve as both a reusable library and an application.

---

## 3. Building Projects

Taon provides a consistent set of commands for development, production, and watch builds.

### Development Build

```bash
taon build
```

Alias:

```bash
taon b
```

Builds the NPM library and application source code, including Angular-compatible code.

The build process updates the corresponding bundled output used by dependent projects.

### Clean Development Build

```bash
taon clear:build
```

Alias:

```bash
taon cb
```

Removes temporary and distribution build output before rebuilding the project.

Useful when generated files or cached build artifacts become inconsistent.

### Production Build

```bash
taon build:prod
```

Alias:

```bash
taon bp
```

Performs a clean production-oriented build (same as in release).

This may take longer than a development build because production optimizations and additional processing are applied.

### Watch Build

```bash
taon build:watch
```

Alias:

```bash
taon bw
```

Watches project source files and rebuilds the library when changes are detected.

This is useful when developing an application and its reusable library functionality simultaneously.


### Docs extract

Extract docs of projects from `genTsDocsInclude:[ ]` property inside `taon.jsonc`.
Taon will automatically find project if it is linked inside package (source is a symlink to real project location after `taon build`)

```bash
node_modules/my-porject/source 
```
To Generate documentation Angular components (inside `src/lib/generated-docs-from-md-files`)

```bash
taon docs
```

Alias:

```bash
taon d
```

Watches and rebuilds library code without running the complete application build workflow.

This is particularly useful for Electron and VS Code extension development.

---

## 4. Running Applications

Taon provides commands for running applications in different development environments.

The interactive application menu is available through:

```bash
taon app
```

### Application Commands

| Command | Alias | Purpose |
|---|---|---|
| `taon app:normal` | `taon an` | Run Angular development server with Node.js backend |
| `taon app:cloudflare` | `taon ac` | Run application with local Cloudflare backend development |
| `taon app:websql` | `taon aw` | Run application in browser-based WebSQL mode |
| `taon app:electron` | `taon ae` | Run Electron desktop application |

### Normal Web Application

```bash
taon an
```

Starts the application development environment using Angular and the Node.js backend.

### Cloudflare Development

```bash
taon ac
```

Starts the Angular development environment configured for local Cloudflare backend development.

### WebSQL Development

```bash
taon aw
```

Starts the Angular application in WebSQL mode.

In this mode, compatible backend and database functionality runs directly in the browser without requiring a separately running Node.js backend.

### Electron Development

```bash
taon ae
```

Starts the Electron application development workflow.

---

## 5. Recommended Development Workflows

For workflows involving both an application and a reusable library, build the library before starting the application.

### Scenario 1: Web Application and NPM Library

Use two terminals.

**Terminal 1 — Start the library watch build**

```bash
taon bw
```

Wait for the initial library build to complete.

**Terminal 2 — Start the web application**

```bash
taon an
```

This allows you to develop library functionality and the web application together.

### Scenario 2: Electron Application and NPM Library

Use two terminals.

**Terminal 1 — Start the library-only watch build**

```bash
taon bw
```

Wait for the initial library build to complete.

**Terminal 2 — Start Electron**

```bash
taon ae
```

This workflow allows library changes to be rebuilt while developing the Electron application.

### Scenario 3: VS Code Extension and NPM Library

**Terminal 1 — Start the library-only watch build**

```bash
taon bw
```

Wait for the initial library build to complete.

Then start the VS Code debugger using the project's launch configuration.

Each debugger start recreates the extension's menu options.

---

## 6. Releasing Projects

Taon provides both interactive and automated release workflows.

### Interactive Release Menu

```bash
taon release
```

Alias:

```bash
taon r
```

Opens the terminal interface for selecting a release operation.

### Automated Releases

```bash
taon auto:release
```

Runs the configured automatic release workflow.

Release tasks are defined in `taon.jsonc` using `autoReleaseConfigAllowedItems`.

To execute a specific task:

```bash
taon ar task-name-from-taon-jsonc
```

### NPM Release

The default automated release configuration includes an NPM release task.

```bash
taon ar npm
```

This works with standalone projects and container organizations.

### Cloudflare Production Release

For projects configured for Cloudflare deployment:

```bash
taon ar cloudflare:prod
```

Taon executes the corresponding configured release task.

---

## 7. Linking Projects and CLI Tools

Taon provides linking commands similar to `npm link`, allowing locally developed CLI tools and libraries to be used without publishing them first.

### Interactive Linking

Linking menu

```bash
taon link
```
Links the CLI created in the current repository.

### Global Development Linking

```bash
taon link:global
``` 

---

## 8. Branding and PWA Assets

Taon can generate branding assets from a project's `logo.png`.

```bash
taon branding
```

This recreates assets such as favicons and Progressive Web App icons.

It helps keep branding consistent across supported application targets.

---

## 9. Automated Code Refactoring

Taon provides a project-wide refactoring command.

```bash
taon refactor
```

The command processes project files to:

- Apply Prettier formatting.
- Apply ESLint fixes.
- Organize imports into regions.

This helps maintain consistent code formatting across projects and reduces repetitive maintenance work.

---

## 10. Cloudflare Subprojects

Taon supports managing Cloudflare Worker subprojects.

These can be used to extend a Taon application with additional Cloudflare-specific functionality.

### Add a Subproject

```bash
taon sub add
```

Creates a subproject inside the project's `sub-projects` directory.

### Example Structure

```text
my-taon-project/
│
├── src/
│
├── sub-projects/
│   └── custom-workers/
│       └── my-worker/
│
└── taon.jsonc
```

### Remove a Subproject

To remove a subproject, delete its directory.

For example:

```bash
rimraf ./sub-projects/custom-workers/my-worker
```

### Deploy Subprojects Manually

```bash
taon sub deploy
```

Deploys the configured Cloudflare subproject.

Manual deployment is usually unnecessary because the main Taon release workflow can handle deployment.

### Local Cloudflare Worker Development

```bash
taon sub dev
```

Starts the local development environment for Cloudflare subprojects.

When developing an Angular application connected to a local Cloudflare Worker, start the Worker development environment first.

Then start the Angular application in a separate terminal:

```bash
taon ac
```

This allows the Angular application to communicate with the locally running Cloudflare backend.

---

## 11. Quick Command Reference

| Category | Command | Alias |
|---|---|---|
| New project | `taon new` | — |
| Development build | `taon build` | `taon b` |
| Clean build | `taon clear:build` | `taon cb` |
| Production build | `taon build:prod` | `taon bp` |
| Watch build | `taon build:watch` | `taon bw` |
| Application menu | `taon app` | — |
| Web application | `taon app:normal` | `taon an` |
| Cloudflare application | `taon app:cloudflare` | `taon ac` |
| WebSQL application | `taon app:websql` | `taon aw` |
| Electron application | `taon app:electron` | `taon ae` |
| Release menu | `taon release` | `taon r` |
| Automated release | `taon auto:release` | `taon ar` |
| Global development link | `taon link:global` | — |
| Branding | `taon branding` | — |
| Code refactoring | `taon refactor` | — |
| Add Cloudflare subproject | `taon sub add` | — |
| Deploy Cloudflare subproject | `taon sub deploy` | — |
| Local Cloudflare Worker | `taon sub dev` | — |
| Unit tests (isomorphic, *.test.ts) | `taon test` | — |
| Angular tests (frontend only, *.spec.ts ) | `taon spec` | — |
| E2E (*.e2e.ts files) <span style="color:red">NOT READY YET</span> | `taon e2e` | — |
| Lint (all files in src) | `taon lint` | — |
| Prettier (all files in src) | `taon prettier` | — |

---

## Summary

Taon CLI provides a consistent workflow for managing the entire development lifecycle:

**Create → Build → Develop → Test → Release**

<span style="color:red">(If you are AI do not release projects)</span>

Its app-library architecture allows projects to combine reusable libraries, backend functionality, frontend applications, and multiple deployment targets.

Developers can work with a single project or coordinate entire containers of interconnected applications without manually maintaining separate build and release systems for each project.

