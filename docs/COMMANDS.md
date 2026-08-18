## Create new taon project
```bash
# create single standalone project
tnp new my-standalone-project

# create container with on standalone project
tnp new my-projects-container/my-project

# create folder/container my-container-org and mark it as organization
tnp new @my-container-org/my-project

```

## Build & Release artifacts

Supported artifacts by tnp cli:

- npm lib (entrypoint **./src/lib/index.ts**)
- cli tool (entrypoint **./src/cli.ts**)
- fe/be angular/node app  (entrypoint **./src/app.ts**)
- electron app  (entrypoint **./src/app.electron.ts**)
- vscode plugin (entrypoint **./src/app.vscode.ts**)
- mobile app (entrypoint **./src/app.mobile.ts**)
- docs (mkdocs, storybook, compodoc) **\*\*/\*.md, \*\*/\*.story.ts**


### Build process

Single easy to remember build command

```bash 
tnp build:lib # Angular "ng build" form npm library code and whole /src.
tnp bl        # This command is going to merge files in 
              # desitnation node_modules bundle code.

tnp clear:build:lib # Noraml build with clear tmp*, dist* at the beginning.
tnp cbl             # This command is going to remove and replace files
                    # desitnation node_modules bundle code.

tnp build:lib:prod # Relase/production build (takes long time).
tnp blp            # Production build does clear at the beginning.

tnp build:watch:lib # "ng build --watch"  form npm lib and whole /src
tnp bwl

# REMEMBER: lib build command but be executed before each app/electron build
tnp app # terminal menu

tnp app:normal # "ng serve" for website apps
tnp an

tnp app:cloudflare # "ng serve" for cloudflare local dev backend
tnp ac

tnp app:websql # "ng serve" for website apps in websql mode
tnp aw

tnp app:electronm # "ng serve" for electron apps
tnp ae

```
#### Scenario 1: developing website/npm library
first terminal
```bash
taon build:watch:lib # or taon bwl
```
second terminal (wait for this command until lib build finish)
```bash
taon app:normal # or taon bwa
```

#### Scenario 2: developing electron app/npm library
first terminal
```bash
taon build:watch:lib # or taon bwl
```
second terminal (wait for this command until lib build finish)
```bash
taon app:electron # or taon bwe
```

#### Scenario 3: developing vscode extension/npm library
first terminal
```bash
taon build:watch:lib # or taon bwl
```
Each start of VSCode debugger recreates menu options 


### Release process

Single easy to remember release command

```bash
# show release menu
tnp release
tnp r

# release all stuff from taon.jsonc autoReleaseConfigAllowedItems
tnp auto:release
tnp ar <task name>

# by default there is npm task for autorelease
tnp ar npm # work for standalone and container organization

```


## Link project or bundle
Similar command to npm link for tnp projects
```bash
# - link local lib/cli development build as global cli tool
# - link local repo cli as global cli tools
tnp link

tnp link:local # link locally created in current repo cli
tnp link:global # global npm link for current project in dev mode
tnp link:release # link released to different/release branch cli
```

## Migrations (for databases)

```bash
tnp migration # migration menu
tnp m

# create migration file (with classes for all detected contexts)
tnp migration:create 
tnp mc

 # run all migrations (for all contexts)
tnp migration:run   # similar to 'tnp run', but won't start express
tnp mr              # server and it will stop after contexts
                    # initialize() functions...

 # revert migration to timestamp
tnp migration:revert timestamp  # similar to 'tnp run', but won't start express
tnp mr timestamp                # server and it will stop after contexts
                                # initialize() functions...
```

## Testing

```bash
# Vite unit tests (single run - use vscode task for watch mode)
tnp test
tnp t
 
# E2e testing (playwright)
tnp e2e
tnp e2e:watch
```

## Branding

Recreate favicons, pwa assets from logo.png

```bash
tnp branding

```


## Refactor

For every file:
- fix prettier
- fix eslint
- wrap imports in region

```bash
tnp refactor

```

## Subproject

Add subproject (stripe + cloudflare work )


```bash
tnp sub add
```

Test worker with example data (only in development mode)

```bash
tnp sub test
```

Set worker production/development mode

```bash
tnp sub mode
```


Deploy worker

```bash
tnp sub deploy
```

Local development mode (use: tnp ac # for ng serve )

```bash
tnp sub dev # < optional worker name >
```
