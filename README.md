# LRaaS

[Linux Rocks](https://github.com/DonaldKellett/Linux-Rocks) as a (systemd) Service

## System Requirements

A Linux host with [systemd](https://systemd.io) as its init system:

- If you're running Windows/macOS, you'll definitely need to create a Linux virtual machine to run this service
- If you're a Linux user with no idea what systemd is, chances are the distro you're using already runs systemd ;-)
- If your distro does not use systemd, e.g. [Alpine](https://alpinelinux.org), [Devuan](https://devuan.org) or [Artix](https://artixlinux.org), you will need to modify your local copy of this repo accordingly to work with the init system running on your distro

_It is highly recommended that this service be installed and run on an isolated Linux virtual machine separate from your base system, even if you are running Linux natively._ I will **not** be responsible for any potential damage done to your base (Linux) system by (un)installing the service via the scripts provided in this repo. You've been warned ;-)

TODO: mention dependencies

## Installation

Simply `cd` to the root of this repo and run the install script:

```bash
$ ./install.sh
```

You will be prompted for your `sudo` password when necessary.

## Starting the service

TODO

## Uninstallation

Simply `cd` to the root of this repo and run the uninstall script;

```bash
$ ./uninstall.sh
```

You will be prompted for your `sudo` password when necessary.

## License

[GPLv3](./LICENSE)
