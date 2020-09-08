#!/bin/sh

WORKDIR=$(pwd)
sudo cp -r ./app /opt/Linux-Rocks
cd /opt/Linux-Rocks
sudo npm install
cd $WORKDIR
sudo mkdir -p /srv/opt
sudo cp -r ./html /srv/opt/Linux-Rocks
sudo cp ./LICENSE /srv/opt/Linux-Rocks/LICENSE
sudo systemctl start mariadb
echo 'In the line that follows, enter the root password for your MariaDB server, NOT your system root password'
mysql -u root -p < setup.sql
sudo systemctl stop mariadb
sudo cp ./linux-rocks.service /usr/lib/systemd/system
sudo systemctl daemon-reload
