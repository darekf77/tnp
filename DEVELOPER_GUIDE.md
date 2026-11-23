# Developer Guide

## Why Do I Need `tnp` to Develop Taon?

The `tnp` CLI serves as a backup development tool for Taon.

- If you modify Taon's internal code, you might accidentally break the build system or CLI, making it impossible to build, release, or manage projects using the `taon` command. The `tnp` CLI provides a fallback in such situations.
- The `tnp` CLI provides more detailed diagnostic information than the standard `taon` CLI.

## How to Set Up a Development Environment for Taon

The Taon ecosystem is split across multiple repositories. However, everything is brought together by the [taon-dev](https://github.com/darekf77/taon-dev) repository, which acts as the parent container for individual Taon projects.

### 1. Install Taon

Follow the installation instructions in the [Taon repository](taon/README.md).

### 2. Clone the `taon-dev` Repository

```bash
git clone https://github.com/darekf77/taon-dev.git
```

### 3. Pull All Projects

Navigate to the `taon-dev` directory and pull all related projects. Follow any additional instructions displayed by the CLI.

```bash
cd taon-dev
taon pull:deep
```

### 4. Link `tnp` Globally

The `tnp` project is located inside the `taon-dev` repository.

```bash
cd tnp
taon link:global
```

### 5. Verify the `tnp` Installation

```bash
tnp version
```

You can now use the `tnp` command wherever you would normally use the `taon` command.

As a first test, try building `tnp` using its own CLI in watch mode:

```bash
tnp bw
```

## How to Modify the Taon Framework, CLI, and Cloud

The `taon-dev` directory contains multiple repositories, including `taon`, `tnp`, `tnp-core`, `taon-typeorm`, and others.

Each repository is responsible for a specific part of the Taon ecosystem.

### CLI — Main Repository (`tnp`)

Use this repository to:

- Add or modify `tnp` and `taon` CLI commands.
- Extend or modify the build system.

```bash
cd taon-dev/tnp
tnp bw
```
You will see changes immediately in you `tnp` tool.

### Framework — Main Repository (`taon`)

Use this repository to:

- Develop and modify Taon framework building blocks.
- Work with controllers, contexts, providers, repositories, and other framework components.

```bash
cd taon-dev/taon
tnp bw
```

### Core Helpers and Utilities (`tnp-core`)

Use this repository to:

- Add, modify, and test core utilities and helper functions.

```bash
cd taon-dev/tnp-core
tnp bw
```

### HTTP Fetch Wrapper (`ng2-rest`)

Use this repository to:

- Develop and maintain Taon's HTTP communication abstractions.
- Modify the HTTP request and response handling mechanisms.

```bash
cd taon-dev/ng2-rest
tnp bw
```

### Advanced Helpers, Utilities, and Types (`tnp-helpers`)

Use this repository to:

- Develop and maintain higher-level utilities, classes, types, and reusable abstractions.

```bash
cd taon-dev/tnp-helpers
tnp bw
```

### TypeORM Fork (`taon-typeorm`)

Use this repository to:

- Maintain and update Taon's TypeORM fork.
- Apply framework-specific changes to TypeORM.

```bash
cd taon-dev/taon-typeorm
tnp bw
```

### Taon UI (`ui`)

Use this repository to:

- Develop and maintain reusable UI components.
- Work on Taon's shared frontend components and abstractions.

**Note:** UI functionality is gradually being migrated from the legacy `taon-ui` repository to the newer `ui` repository.

```bash
cd taon-dev/ui
tnp bw
```

### Taon Admin Modules (`session`, `cms`, `e-commerce`, `analytic`, `seo`)

These repositories provide feature-rich backend and frontend administration tools for Taon applications.

Use them to:

- Extend existing administration features.
- Develop new backend and frontend functionality.
- Improve Taon's back-office tools and interfaces.

For example, to work on the Session module:

```bash
cd taon-dev/session
tnp bw
```

The same development workflow applies to the CMS, E-Commerce, Analytics, and SEO modules.

### Testing Your Changes in an Application

It is also useful to keep a second terminal open to run an actual application while developing.

```bash
tnp an
```

This allows you to test your changes in a running application while the framework or module is being rebuilt in watch mode.

## Additional Development Requirements

### 1. Visual Studio Code or VSCodium

Install either **Visual Studio Code** or **VSCodium**.

Make sure the corresponding command is available globally in your terminal:

- `code` for Visual Studio Code.
- `codium` for VSCodium.

### 2. Taon Development Extension

Install the **`taon-dev.tnp`** extension for Visual Studio Code or VSCodium.

You can install it directly from the `tnp` repository:

```bash
cd taon-dev/tnp
tnp ilvscodeplugin
```

**Restart your editor after installing the extension.**

### Important: Avoid Conflicting Extensions

**Do not use `taon-dev.taon` and `taon-dev.tnp` simultaneously.**

When developing Taon itself, use the `taon-dev.tnp` extension instead of `taon-dev.taon` to avoid potential conflicts.
