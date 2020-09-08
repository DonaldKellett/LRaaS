# LRaaS

[Linux Rocks](https://github.com/DonaldKellett/Linux-Rocks) as a (systemd) Service

## System Requirements

A Linux host with [systemd](https://systemd.io) as its init system:

- If you're running Windows/macOS, you'll definitely need to create a Linux virtual machine to run this service
- If you're a Linux user with no idea what systemd is, chances are the distro you're using already runs systemd ;-)
- If your distro does not use systemd, e.g. [Alpine](https://alpinelinux.org), [Devuan](https://devuan.org) or [Artix](https://artixlinux.org), you will need to modify your local copy of this repo accordingly to work with the init system running on your distro

_It is highly recommended that this service be installed and run on an isolated Linux virtual machine separate from your base system, even if you are running Linux natively._ I will **not** be responsible for any potential damage done to your base (Linux) system by (un)installing the service via the scripts provided in this repo. You've been warned ;-)

## Pre-installation

Before proceeding with the installation procedure, make sure that the following dependencies are installed:

- Node.js
- npm
- MariaDB server 

You will also have to ensure that your MariaDB server is set up with a root password.

## Installation

Simply `cd` to the root of this repo and run the install script:

```bash
$ ./install.sh
```

You will be prompted for your `sudo` and MariaDB root passwords when necessary.

## Starting the service

Just run:

```bash
$ sudo systemctl start linux-rocks
```

and point your web browser to the IP address of your Linux host running the service to enjoy the app.

If the app appears to load indefinitely or fails to load altogether, this may be due to firewall settings on the Linux host running the web service and you may have to tweak your firewall settings accordingly. A simple (though insecure!) way to resolve this is to disable the firewall on your Linux host running the service, e.g.

```bash
$ sudo systemctl stop firewalld
```

You may have to adapt the command above depending on which firewall is used.

If you are doing this on an isolated Linux virtual machine separate from your base system as suggested then this should not pose significant security risks to your base system.

## Stopping the service

Just run

```bash
$ sudo systemctl stop linux-rocks
```

You will also probably want to stop the MariaDB server that was automatically started when `linux-rocks` was started:

```bash
$ sudo systemctl stop mariadb
```

Note that the state of the database persists between runs of the service, so next time you (re)start the Linux Rocks voting app, existing results from previous votes should be there.

## Uninstallation

Simply `cd` to the root of this repo and run the uninstall script;

```bash
$ ./uninstall.sh
```

You will be prompted for your `sudo` and MariaDB root passwords when necessary.

Note that uninstallation also removes any data associated with the Linux Rocks voting app so all the voting data since your last install of Linux Rocks will be lost.

## License

[GPLv3](./LICENSE)
