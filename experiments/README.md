# NodeJS applications experiments  

##  Unified build process manager
 + screens:
  - MENU child processes selection: TSC, NG1, NG2 (just like in taon)
  - OUTPUT processes unified output
 + purpose:
  - just one command for build: taon build -> displays MENU
  - after selecting child process user goes to OUTPUT
  - pressing "enter" hides outputs from child processes -> MENU is shown
  - MENU is perfect for:
   -> starting/restarting/killing children processes
   -> displaying information about process (pid,ppid,cpu/mem usage)
   -> no more starting many commands like: taon build + taon app => everything in build
