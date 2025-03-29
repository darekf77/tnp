## Create new project
```bash
tnp new my-standalone-project
tnp new my-organization/main-entry-project
```

## Build & Release artifacts

Supported artifacts by tnp cli:

- npm lib (entrypoint **./src/lib/index.ts**)
- cli tool (entrypoint **./src/cli.ts**)
- fe/be angular/node app  (entrypoint **./src/app.ts**)
- electron app  (entrypoint **./src/app.electron.ts**)
- vscode plugin (entrypoint **./src/app.vscode.ts**)
- mobile cordova app (entrypoint **./src/app.mobile.ts**)
- docs (mkdocs, storybook, compodoc) **\*\*/\*.md, \*\*/\*.story.ts**


### Build process

Single easy to remember build command

```bash 
tnp build
tnp b

tnp build:watch
tnp bw
```

### Release process

Single easy to remember release command

```bash
# show menu
tnp release
tnp r

# repeat last release process based on created config
tnp release:last
tnp rl
```


## Link project or bundle
Similar command to npm link for tnp projects
```bash
# - link local lib/cli development build as global cli tool
# - link local repo cli as global cli tools
tnp  link
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
# Unit/Integration tests (jest)
tnp test
tnp t

tnp test:watch
tnp tw

# recreate jest snapshots
tnp test:up:snapshots
tnp tu

# E2e testing (playwright)
tnp e2e
tnp e2e:watch
```
