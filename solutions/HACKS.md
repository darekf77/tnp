# CHROME

## - Accept any certificate in chrome

type in chrome conole
```
sendCommand(SecurityInterstitialCommandId.CMD_PROCEED)
```

or type
```
thisisunsafe
```


## vscode termianl big sur fix
```
codesign --remove-signature /Applications/Visual\ Studio\ Code.app/Contents/Frameworks/Code\ Helper\ \(Renderer\).app
```

## git vpn-split
```
git config --global url."git://".insteadOf https://
git config --global http.sslVerify false
# hmmmmmmmmm git remote ls suck
```

## - Inspect angular js element

```
angular.element($0).scope()
```

# MACBOOK

fix nvme sleep wake


`alt + command + p + r + power` 

```bash
sudo pmset -a hibernatemode 0 standby 0 autopoweroff 0
# or just ??
sudo pmset hibernatemode 0 standby 0
```

Default:
```bash
sudo pmset restoredefaults
pmset -g
```

# BIG SUR brew
```
/usr/sbin/softwareupdate --install-rosetta --agree-to-license
arch -x86_64 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
arch -x86_64 brew install <package>
```

# set origin name
```
git remote set-url orgin <my-new-origin-name>
```


# node_modules files size
```
du -sh ./node_modules/* | sort -nr | grep '\dM.*'
```


# mp3 download
youtube-dl -x --audio-format mp3 --prefer-ffmpeg youyublink

