## Running nodejs backend app 
Usually you **don't** use this command for development 

-> **debugger** from Visual Studio Code is for this 
(F5 on keyboard, Task "Debug/Start Server"). 
```bash
tnp run
```


## Tnp extension for Visual Studio Code 
 Install essential vscode plugins from project workspace recommended

```bash
tnp vscode:ext
tnp ext
```

## Tnp global config for Visual Studio Code 

Apply best global config for VScode

```bash
tnp vscode:global
```
## Install pip3 manually on linux
```bash 
sudo apt update # UBUNTU/DEBIAN ONLY
sudo apt install python3-pip # UBUNTU/DEBIAN ONLY
# or
sudo dnf install python3-pip # FEDORA ONLY
# or 
sudo pacman -S python-pip # ARCH
```

## Install pipx manually on linux
Only needed on debian/ubuntu 
(if external-managed-environment problem and you can do pip3 install mkdocs)
```bash
sudo apt install pipx
```

## Install mkdocs manually

- Linux/Windows
```bash
pip3 install mkdocs
pip3 install mkdocs-material --user
# or 
pipx install mkdocs # ubuntu/debian linux with external managed environment
pipx inject mkdocs mkdocs-material
```

- MacOS
```bash
brew install mkdocs
brew install mkdocs-material
```

## Pause
Pause terminal test
```bash
tnp pause
```

## Github pages from /docs to branch
Pause terminal test
```bash
tnp ghPagesInit
tnp gh:pages:init
tnp ghpagesinit
tnp ghPagesInit --full # full process with deleting /docs files
tnp ghPagesInit --provider bitbucket # specify different provider
```

## Show version of projects inside container
```bash
tnp versions
```


## Download video as mp3

Download mp3 from url (got to ~/Download/mp3-from-websites)

```bash
tnp mp3 <url to video>
```


## Download video as mp4 video

Download mp4 from url (got to ~/Download/mp4-from-websites)

```bash
tnp mp4 <url to video>
```

