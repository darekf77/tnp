#  taon build

There are 3 modes for taon buid:

+ old build mode (obm) when everthing is being watch
   - 3x tsc processes (esm, cjs,js.maps)
   - 2x ng build processe (browser,websql)
   - build is heavy (on linux takes too much watchers)
+ lightweight build mode
   - everything goes through main worker that decides about builds
   - last project that triggerd change (start lead build of all projects)
   - build only uses no-watch tsc,ngbuild commands
   - nothing is watching whole node_modules
   - very fast and lightweight on linux (that does not like many file watchers)   
+ partial lightweight build mode (DEFAULT MODE)
   - on win,macos -> obm (cjs, esm), lightweight (js.maps, browser,websql)
   - linux -> always lightweight for everything

<img src="./taon-build.drawio.svg" style="height: 300px">
