# CI/CD & Architecture

## Overview

**Taon Cloud CI/CD is under development.** Centralized build execution, automated validation, deployment orchestration, and team-oriented release management are part of the planned Taon Cloud workflow.

However, **you do not need to wait for Taon Cloud to benefit from much of this architecture**. The Taon CLI already provides a practical, lightweight approach to coordinating development, synchronizing multiple repositories, building interconnected projects directly from source, and releasing applications.

For solo developers, small teams, and AI-assisted development, this can be an effective alternative to introducing a full CI/CD platform immediately.

The idea is simple:

> **Design your architecture with Taon standalone projects and containers, build directly from source, synchronize Git repositories with Taon commands, and run releases locally today. Move the orchestration to Taon Cloud when you need it.**

This is **not a claim that manual releases provide every guarantee of Continuous Integration and Continuous Delivery**. Automated tests, independent build environments, branch protection, security checks, and approvals remain important. Rather, Taon reduces the amount of additional infrastructure needed to get started.

---

## 1. Source-First Builds: No Intermediate NPM Releases

In a conventional multi-package workflow, an application build may depend on publishing internal libraries first:

```text
CHANGE SHARED LIBRARY
        │
        ▼
 BUILD / TEST LIBRARY
        │
        ▼
  PUBLISH TO NPM
        │
        ▼
 UPDATE DEPENDENCY VERSIONS
        │
        ▼
 INSTALL NEW PACKAGES
        │
        ▼
 BUILD / TEST APPLICATION
        │
        ▼
      DEPLOY
```

**Taon builds internal dependencies directly from source.** Internal libraries do not need intermediate NPM releases simply to be consumed by an application in the same Taon development environment.

```text
 SHARED PROJECT SOURCE ────┐
                           │
 APPLICATION SOURCE ────────┼──► TAON BUILD ──► ARTIFACT
                           │
 OTHER PROJECT SOURCE ──────┘
```

This reduces dependency-version synchronization and avoids repetitive publishing steps during integrated development. Public library distribution and external consumers can still require ordinary package releases.

---

## 2. The Core Concept: Isomorphic App-Library Projects

In Taon, a project does not have to be exclusively a backend project or a frontend project. **A standalone project can be both an application and a reusable library — an app-lib.**

A project can contain backend controllers, repositories, database entities, frontend Angular components, shared models, validation logic, utilities, and functionality reusable across runtimes.

### Backend and frontend are not fixed project categories

Different app-libraries naturally contain different proportions of backend and frontend code:

```text
              BACKEND / FRONTEND COMPOSITION

Backend-heavy application/library
┌──────────────────────────────────────────────┐
│ BACKEND 90%                      FRONTEND 10% │
│ ████████████████████████████████████░░░░     │
└──────────────────────────────────────────────┘

Balanced full-stack application/library
┌──────────────────────────────────────────────┐
│ BACKEND 50%                      FRONTEND 50% │
│ ████████████████████░░░░░░░░░░░░░░░░░░░░     │
└──────────────────────────────────────────────┘

Frontend-heavy UI application/library
┌──────────────────────────────────────────────┐
│ BACKEND 10%                      FRONTEND 90% │
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     │
└──────────────────────────────────────────────┘

Legend:
████  Backend functionality
░░░░  Frontend functionality
```

These percentages are illustrative, not Taon configuration values. A backend-heavy project might include a small diagnostics interface; a frontend-heavy UI library might include backend controllers to support demos, examples, or tests. A project may also have no meaningful server-side component.

**Isomorphic does not mean every line of code runs everywhere.** Node.js database APIs are not automatically available in browsers, and browser APIs are not automatically available in Node.js. The goal is to keep shared logic reusable while allowing runtime-specific implementations to coexist in one project.

### One project can be both a library and its demonstration application

```text
frontend-ui-storybook-like-app-lib/
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── examples/
│   │   └── pages/
│   │
│   ├── shared/
│   │   ├── models/
│   │   └── utilities/
│   │
│   └── backend/
│       └── controllers/
│
└── taon.json
```

This project can be a reusable UI library, a standalone demonstration application, a testing environment, and a full-stack application when required. The directory names are illustrative, not a mandatory Taon layout.

> **Separate projects by responsibility, not automatically by runtime.**

---

## 3. Design an Entire Company's Software Architecture

Taon standalone projects and containers can represent much more than one application. They can organize the software architecture of an entire company: products, shared libraries, internal tools, documentation, and platform-specific applications.

### Example company structure

```text
my-company/
│
├── shared/
│   ├── core/
│   ├── authentication/
│   ├── database/
│   └── ui-components/
│
├── products/
│   │
│   ├── customer-portal/
│   │   ├── frontend/
│   │   ├── backend/
│   │   └── documentation/
│   │
│   ├── admin-dashboard/
│   │   ├── frontend/
│   │   └── backend/
│   │
│   └── desktop-app/
│       ├── application/
│       └── shared/
│
├── internal-tools/
│   ├── reporting/
│   └── monitoring/
│
└── documentation/
    ├── developer-guide/
    └── architecture/
```

Here `frontend/` and `backend/` indicate *responsibilities*, not a requirement to split each into a separate Taon project. In practice, the company can organize them into isomorphic app-libraries instead.

### Containers as organizational boundaries

```text
                    COMPANY CONTAINER
                           │
          ┌────────────────┼────────────────┐
          │                │                │
     SHARED CODE        PRODUCTS       INTERNAL TOOLS
     (container)       (container)       (container)
          │                │                │
     ┌────┴────┐      ┌────┴────┐      ┌────┴────┐
     │         │      │         │      │         │
    Core      Auth  Customer   Admin  Reports  Monitor
     │                 │
     │             ┌───┴───┐
     │             │       │
     └──────────> Backend Frontend
```

Arrows illustrate conceptual dependencies, not automatic dependency resolution. Teams can own independent areas, share app-libraries, and coordinate work from higher-level containers. AI coding agents can likewise work within well-defined project boundaries.

### A more Taon-native, isomorphic company structure

```text
company-container/                         [Git repository]
│
├── backend-api-more-app-lib/              [Git repository]
│   └── src/
│       ├── controllers/
│       ├── repositories/
│       ├── entities/
│       ├── shared/
│       └── frontend/
│
├── frontend-ui-storybook-like-app-lib/    [Git repository]
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── shared/
│       └── backend/
│
├── authentication-app-lib/               [Git repository]
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── shared/
│       └── frontend/
│
└── customer-portal-app-lib/              [Git repository]
    └── src/
        ├── controllers/
        ├── repositories/
        ├── components/
        └── shared/
```

Each app-library is an independent, reusable unit that may contain both backend and frontend functionality. The labels describe the project's emphasis, not a restriction on what it may contain.

---

## 4. Standalone Projects, Containers, and Git Repositories

A **standalone project** can be developed, built, and maintained independently, including in its own Git repository.

A **container project** groups related Taon projects into one development workspace. A container can also be a Git repository itself.

The `monorepo` setting in `taon.json` controls the repository organization of container children.

| Configuration | Repository organization |
| --- | --- |
| `monorepo: false` | Child projects can be maintained in separate Git repositories. |
| `monorepo: true` | Child projects are included in the container's Git repository. |

### Multi-repository container

```text
company-container/              [Git repository]
│
├── shared-library/             [Git repository]
│   └── src/
│
├── backend-api/                [Git repository]
│   └── src/
│
├── frontend-app/               [Git repository]
│   └── src/
│
└── documentation/              [Git repository]
    └── docs/
```

Here `backend-api` and `frontend-app` are illustrative names only. They could instead be `backend-api-more-app-lib` and `frontend-ui-storybook-like-app-lib`, each still containing isomorphic functionality.

### Monorepo container

```text
company-container/              [Git repository]
│
├── shared-library/
│   └── src/
│
├── backend-api/
│   └── src/
│
├── frontend-app/
│   └── src/
│
└── documentation/
    └── docs/
```

### Combining both approaches

```text
company/
│
├── shared/                     [Separate repositories]
│   ├── core/
│   └── authentication/
│
├── product-a/                  [Single repository]
│   ├── frontend/
│   └── backend/
│
└── product-b/                  [Separate repositories]
    ├── frontend/
    └── backend/
```

These are conceptual organization examples: repository boundaries can follow product ownership, team responsibility, and reuse requirements rather than a universal backend/frontend split.

---

## 5. Synchronize Multiple Git Repositories

When projects live in separate repositories, Taon provides commands to coordinate them from the container.

### Pull across the container

```bash
taon pull:deep
```

### Push across the container

```bash
taon push:deep
```

When working on a shared branch such as `master`, these commands help synchronize the group of projects without manually entering each repository.

```text
                  COMPANY CONTAINER
                         │
                  taon pull:deep
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     REPOSITORY A   REPOSITORY B   REPOSITORY C
          │              │              │
       Updated         Updated        Updated

                  taon push:deep
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     REMOTE REPO A  REMOTE REPO B  REMOTE REPO C
```

This is especially useful when a feature spans several app-libraries or multiple developers and AI agents contribute to the same container. Coordinate branches and review changes as appropriate for your team; multi-repository synchronization does not replace atomic transactions across repositories.

---

## 6. Build the Container Directly from Source

Taon can build a container's **first-level child projects** together.

### Development build

```bash
taon build
```

Short alias:

```bash
taon b
```

### Production build

```bash
taon build:prod
```

Short alias:

```bash
taon bp
```

These commands rebuild first-level children in the selected mode, without requiring intermediate NPM publishing for internal source dependencies.

```text
                  TAON CONTAINER
                         │
                      taon bp
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      APP-LIB A      APP-LIB B      APP-LIB C
          │              │              │
     PROD BUILD     PROD BUILD     PROD BUILD
```

A successful build is not the same as a successful test suite. Run the relevant unit, integration, and end-to-end tests before release.

---

## 7. Release Strategies: Five Types

Taon supports five release strategies for different artifacts and destinations.

| Release type | Purpose |
| --- | --- |
| **Manual** | Build and test locally, then publish to a remote destination such as NPM, an app store, or Taon Cloud. |
| **Cloud** | Perform the equivalent release workflow through remote Taon Cloud execution. Cloud-side orchestration is part of the developing Taon Cloud offering. |
| **Local** | Build and deploy to a local repository, dedicated repository, or special Git branch. |
| **Static Pages** | Publish static websites and Markdown-based documentation to GitHub Pages or similar hosting. |
| **Cloudflare** | Wrap Wrangler for full-stack frontend/backend deployment, with supported Cloudflare services such as KV, D1, and R2. |

The best strategy depends on the project type, target artifacts, team size, codebase complexity, security requirements, and hosting environment.

```text
                       TAON PROJECT
                            │
                      SOURCE CODE
                            │
                       TAON BUILD
                            │
                    RELEASE STRATEGY
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
        MANUAL            LOCAL             CLOUD
          │                 │                 │
       Remote           Local Git        Taon Cloud
     destination       destination       orchestration


                ADDITIONAL TARGETS
                        │
              ┌─────────┴─────────┐
              │                   │
         STATIC PAGES         CLOUDFLARE
              │                   │
          GitHub Pages        Wrangler
          or similar          │
                          ┌───┼───┐
                          KV  D1  R2
```

These categories describe release strategies and common destinations; the diagram is conceptual rather than a claim that all targets are interchangeable.

### Cloudflare release example

```bash
taon automatic:release cloudflare:prod
```

Alias:

```bash
taon ar cloudflare:prod
```

The configured release workflow can deploy frontend and backend functionality to Cloudflare. Cloudflare Workers provide backend execution; D1, KV, and R2 can provide database, key-value, and object storage capabilities when used by the application.

---

## 8. Supported and Planned Release Artifacts

Taon can build different outputs from its project architecture.

| Artifact | Status | Description |
| --- | --- | --- |
| **NPM library and CLI tool** | ✅ Supported | Shared NPM library with an optional global CLI tool. |
| **Angular / Node.js application** | ✅ Supported | Full-stack backend/frontend application; WebSQL mode can run compatible backend functionality in the browser. |
| **VS Code extension** | ✅ Supported | Extension reusing functionality from the NPM library / CLI. |
| **Electron application** | ✅ Supported | Desktop application built around the Angular / Node.js app architecture and Electron IPC. |
| **Mobile application** | ⌛ In progress | Planned Capacitor-based application using compatible frontend and backend architecture. |

Documentation websites generated from Markdown are also a supported output. Shared library code can be reused across applicable artifacts, while documentation websites follow their own build process.

### Artifact composition

```text
                  TAON APP-LIB PROJECT
                           │
                     SHARED SOURCE
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
    NPM / CLI         ANGULAR / NODE        VS CODE
       │                   │                EXTENSION
       │                   │                   │
       │              ┌────┴────┐              │
       │              │         │              │
       │           WEB APP   ELECTRON          │
       │              │      DESKTOP           │
       │              │                        │
       └──────────────┴────────────────────────┘
                           │
                    FUTURE TARGET
                           │
                    CAPACITOR MOBILE
```

The diagram illustrates potential code reuse, not a requirement that every project produce all artifacts.

### Backend/frontend execution depends on the artifact

| Artifact | Backend execution | Frontend execution |
| --- | --- | --- |
| Angular / Node.js | Node.js | Browser |
| Angular WebSQL mode | Browser-compatible backend logic | Browser |
| Electron | Electron / Node.js processes | Electron renderer |
| VS Code extension | VS Code extension host | Optional webview |
| NPM library / CLI | Node.js or compatible runtime | Optional browser-compatible exports |
| Capacitor mobile (planned) | Platform-dependent compatible logic | Mobile WebView |

**Everything can be designed around the same backend/frontend app-library model, but not every API is available in every runtime.**

### WebSQL mode: backend inside the browser

A conventional Angular / Node.js application typically separates execution environments:

```text
          BROWSER                         NODE.JS
   ┌──────────────────┐            ┌──────────────────┐
   │ Angular frontend │ ── HTTP ─► │ Backend services │
   └──────────────────┘            │ Database access  │
                                   └──────────────────┘
```

In Taon WebSQL mode, compatible backend functionality can run in the browser itself:

```text
                       BROWSER
       ┌───────────────────────────────────┐
       │          Angular frontend         │
       │                 │                 │
       │       Backend-like logic          │
       │                 │                 │
       │       Browser-side storage        │
       └───────────────────────────────────┘

               No separate Node.js
               backend required
```

This can simplify standalone demos and end-to-end testing. Browser security, API availability, persistence, and runtime limitations still apply; WebSQL mode does not make arbitrary Node.js code browser-compatible.

---

## 9. Automated Local Releases Before Taon Cloud

For now, a trusted developer's machine can serve as a lightweight release coordinator.

A typical workflow:

1. Developers or AI agents make changes in their assigned projects.
2. Changes are reviewed and pushed to the appropriate Git repositories.
3. Synchronize the container.
4. Build the relevant projects in production mode.
5. Run tests, validation, and security checks required by the project.
6. Finalize Git history and execute the configured release.

```bash
taon pull:deep
taon bp
cd my-app-entrypoint-project
taon ar cloudflare:prod
```

These commands are the build/release skeleton, **not a substitute for a testing step**. Add your project's test commands and approvals between the build and release as needed.

```text
  DEVELOPERS / AI AGENTS
           │
           ▼
   MULTIPLE GIT REPOS
           │
           ▼
     taon pull:deep
           │
           ▼
        taon bp
           │
           ▼
    TESTS / VALIDATION
           │
           ▼
    FINAL GIT COMMIT
           │
           ▼
  taon ar cloudflare:prod
           │
           ▼
      DEPLOYMENT
```

This works especially well for solo developers and small teams where release responsibility is centralized. It is not equivalent to independent, reproducible CI runners or mandatory pull-request gates.

---

## 10. Keep Taon's Core Containers Updated

Update the globally installed Taon CLI:

```bash
npm i -g taon
```

Then synchronize Taon's core containers:

```bash
taon sync
```

Taon uses core containers to centralize NPM installations required by Taon projects. Synchronization keeps that local environment aligned with the latest available Taon changes, fixes, and patches. As with any dependency update, validate the resulting environment before production release.

---

## 11. Rapid Git Checkpoints: `taon push` and `taon melt`

During active development, especially with AI coding agents, it can be useful to save frequent Git checkpoints without stopping to write polished commit messages.

### Step 1: Quick checkpoint commits

```bash
taon push
```

Taon creates a quick commit with the message:

```text
$$$ update $$$
```

Repeated checkpoints might produce this history:

```text
Git history (newest first)

  ●  $$$ update $$$
  │
  ●  $$$ update $$$
  │
  ●  $$$ update $$$
  │
  ●  feat: implement authentication
  │
  ●  initial project setup
```

### Step 2: Melt temporary commits into staged changes

```bash
taon melt
```

Taon converts the latest temporary update commits back into staged changes:

```text
BEFORE: taon melt

  HEAD
   │
   ▼
  ●  $$$ update $$$       ← checkpoint 3
  │
  ●  $$$ update $$$       ← checkpoint 2
  │
  ●  $$$ update $$$       ← checkpoint 1
  │
  ●  feat: authentication ← last finalized commit
  │
  ●  initial setup


             taon melt
                 │
                 ▼


AFTER: taon melt

  HEAD
   │
   ▼
  ●  feat: authentication
  │
  ●  initial setup


  Git staging area:
  ┌────────────────────────────────────┐
  │  Changes from checkpoint 1         │
  │  Changes from checkpoint 2         │
  │  Changes from checkpoint 3         │
  └────────────────────────────────────┘
```

The temporary commits are removed from the current branch history and their combined changes are staged. Review them and create a meaningful commit:

```bash
git diff --cached
git commit -m "feat: complete authentication workflow"
```

### Step 3: Clean final history

```text
FINAL GIT HISTORY

  ●  feat: complete authentication workflow
  │
  ●  feat: implement authentication
  │
  ●  initial project setup
```

### Example checkpoint workflow

```bash
taon push
taon push
taon push
taon melt
git commit -m "feat: implement new functionality"
```

### Release protection

Taon automatically prevents a release when the latest commit message is:

```text
$$$ update $$$
```

This prevents an unfinished checkpoint from being treated as a finalized release commit.

> **Git history warning:** `taon melt` rewrites the latest temporary commits. Coordinate with collaborators before rewriting checkpoints that have already been pushed to a shared branch. Review the staging area before creating the final commit.

---

## 12. Why This Works Well with AI Coding Agents

A container can give different developers or AI agents independent areas of responsibility:

- Developer A: backend-oriented app-library.
- Developer B: UI-oriented app-library.
- AI Agent A: authentication app-library.
- AI Agent B: tests, documentation, or bug fixes.
- Release coordinator: integration, validation, and deployment.

The projects can remain independently versioned while being built from source in one workspace.

```text
                    COMPANY CONTAINER
                           │
              ┌────────────┴────────────┐
              │                         │
       AUTHENTICATION               UI COMPONENTS
          APP-LIB                      APP-LIB
              │                         │
       ┌──────┴──────┐           ┌──────┴──────┐
       │             │           │             │
    Backend       Frontend    Components    Demo App
       │             │           │             │
       └─────────────┴─────┬─────┴─────────────┘
                           │
                     CUSTOMER PORTAL
                         APP-LIB
                           │
                     PRODUCTION BUILD
                           │
                   DEPLOYMENT TARGET
```

`taon push` can save lightweight development checkpoints; `taon melt` can consolidate them for review; `taon pull:deep` can synchronize repositories; and `taon bp` can build the integrated source tree.

**AI agents should not bypass code review, tests, access controls, or release approval merely because the workflow is convenient.**

---

## 13. One Project Architecture, Multiple Build Artifacts

Taon is designed so a project does not have to be permanently tied to one deployment format. The same source architecture can support web applications, desktop applications, reusable libraries, documentation, and — in the future — additional native targets.

```text
                   TAON PROJECT
                        │
                 Shared Source Code
                        │
             ┌──────────┼──────────┐
             │          │          │
          WEB APP     ELECTRON    DOCS
             │          │          │
          Frontend    Desktop    Markdown
          Backend     Package    Website


                  FUTURE TARGETS
                        │
                  Native Apps
                        │
                 Additional Runtimes
```

This is a conceptual view of reuse and possible targets, not a promise that every project currently supports every output type.

### Design the architecture now, even if the target arrives later

```text
product/
│
├── domain/
│   └── business-logic/
│
├── shared/
│   ├── models/
│   └── utilities/
│
├── applications/
│   ├── web/
│   ├── desktop/
│   └── mobile/                 [Future target]
│
└── documentation/
```

A company may start with a website, then need Electron, mobile, or other native applications. Keeping business logic, shared models, and platform-specific functionality in appropriate app-libraries can reduce future restructuring.

Native targets will still require platform-specific code, compatible dependencies, and testing. **The architectural advantage is reuse, not automatic universal runtime compatibility.**

---

## 14. From Local CLI Orchestration to Taon Cloud

Today, Taon CLI coordinates local development and releases:

```text
                  COMPANY PROJECTS
                         │
                 TAON CONTAINERS
                         │
               STANDALONE PROJECTS
                         │
                SOURCE-FIRST BUILDS
                         │
                  TAON CLI
                         │
                 LOCAL RELEASES
```

Taon Cloud is intended to add centralized orchestration to the same underlying project model:

```text
                  COMPANY PROJECTS
                         │
                 TAON CONTAINERS
                         │
               STANDALONE PROJECTS
                         │
                SOURCE-FIRST BUILDS
                         │
                     TAON CLI
                         │
                     TAON CLOUD
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       BUILD          VALIDATE        DEPLOY
          │              │              │
       Artifacts      Tests/Checks   Environments
```

Potential cloud capabilities include remote builds, Git-triggered workflows, automated tests, deployment logs, managed environments, monitoring, and team-based permissions or approvals. These are future-oriented goals rather than claims that every feature is available today.

The key principle is to **reuse the existing Taon project structure and CLI commands instead of inventing a separate cloud-only build system**.

---

## 15. What Traditional CI/CD Still Provides

The local approach is useful, but it does not automatically provide:

- Independent, isolated, reproducible build environments.
- Git-triggered tests and pull-request validation.
- Branch protection and mandatory reviews.
- Centralized logs and durable build artifacts.
- Dependency scanning and security policies.
- Deployment approvals, audit trails, and rollback processes.
- Releases independent of one developer's machine.

Use conventional CI/CD infrastructure when your risk profile, team size, or compliance requirements justify it. Taon's CLI can also be invoked *inside* external CI/CD systems; it does not have to replace them.

---

## 16. Command Reference

| Responsibility | Command | Alias / note |
| --- | --- | --- |
| Pull changes across container projects | `taon pull:deep` | Multi-repository synchronization |
| Push changes across container projects | `taon push:deep` | Multi-repository synchronization |
| Build first-level container children for development | `taon build` | `taon b` |
| Build first-level container children for production | `taon build:prod` | `taon bp` |
| Execute configured Cloudflare production release | `taon automatic:release cloudflare:prod` | `taon ar cloudflare:prod` |
| Update global CLI | `npm i -g taon` | NPM installation |
| Synchronize Taon core containers | `taon sync` | Shared dependency environment |
| Create quick Git checkpoint | `taon push` | `$$$ update $$$` commit |
| Convert latest temporary checkpoints into staged changes | `taon melt` | Review before final commit |

### Typical local release sequence

```bash
npm i -g taon
taon sync
taon pull:deep
taon bp 
```


Run the project's relevant tests and validation checks, review and finalize commits, and then release:

```bash
taon ar cloudflare:prod
```

### Typical rapid-development sequence

```bash
taon push
taon push
taon melt
git diff --cached
git commit -m "feat: implement new functionality"
taon push:deep
```

---

## Conclusion

**Taon Cloud CI/CD is coming, but the foundations are useful already.**

Taon standalone projects and containers can model an entire company's software architecture. Isomorphic app-libraries keep backend and frontend functionality together when that makes sense. Source-first builds remove unnecessary internal NPM publishing. Deep Git commands synchronize multi-repository workspaces. Temporary checkpoint commits make fast-moving development more convenient. Build and release commands coordinate delivery from a local machine.

For solo developers and small teams, that can be enough to start shipping without a dedicated CI/CD server. For larger teams and higher-risk systems, the same commands can participate in conventional CI/CD pipelines today and eventually be orchestrated through Taon Cloud.

> **Design the architecture once. Build directly from source. Release locally today. Automate centrally when you're ready.**
