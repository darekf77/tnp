# LINUX KDE

- awesome worksapces
- awesome shortcuts configuration possibility
- awesoem alt-tab configuration possibility

bashrc

```bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Extract git branch (if any)
parse_git_branch() {
    git branch --show-current 2>/dev/null
}

# PS1 with only folder basename
export PS1="\[\e[32m\]\W\[\e[33m\] \$(parse_git_branch)\[\e[0m\]\$ "


```


# check nvidia drivers
```
glxinfo | grep -i "opengl renderer"
```
If it says something like:

"NVIDIA … (nouveau)"

"llvmpipe"

"Mesa"

you’re not using real NVIDIA drivers.

Then install NVIDIA:
```
sudo ubuntu-drivers autoinstall
sudo reboot
```

Reboot:
```
sudo reboot
```


# solutions

## edge freez

```
sudo nano /usr/share/applications/microsoft-edge.desktop
```
Change Exec=... to (multiple places to change): 
```
Exec=microsoft-edge-stable --ozone-platform=x11 %U
```


## keybinding input remapper

1. Install
sudo apt install input-remapper

2. Configure json

~/.config/input-remapper-2/presets/YOUR_KEYBOARD_NAME/macos.json

3. Open input-remapper and run preset


```json
[
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 30,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + a",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 32,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + d",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 18,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + e",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 33,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + f",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 34,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + g",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 35,
                "origin_hash": "c7a57701951be3c5bc2eacf529aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + h",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 23,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + i",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 36,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + j",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 37,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + k",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 38,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + l",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 50,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + m",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 49,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + n",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 24,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + o",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 25,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + p",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 16,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + q",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 19,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + r",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 31,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + s",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 20,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + t",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 22,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + u",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 47,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + v",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 17,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + w",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 45,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + x",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 21,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + y",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 44,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + z",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 105,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "KP_Home",
        "name": "Super Left",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 106,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "KP_End",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 125,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 46,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + c",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 56,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 105,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + Left",
        "mapping_type": "key_macro"
    },
    {
        "input_combination": [
            {
                "type": 1,
                "code": 56,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            },
            {
                "type": 1,
                "code": 106,
                "origin_hash": "c7a57701951be3c5bc2eacf549aa9cf2"
            }
        ],
        "target_uinput": "keyboard",
        "output_symbol": "Control_L + Right",
        "mapping_type": "key_macro"
    }
]

```
