#!/bin/sh

sudo systemctl stop linux-rocks
sudo rm /usr/lib/systemd/system/linux-rocks.service
sudo systemctl daemon-reload
sudo systemctl start mariadb
echo 'In the line that follows, enter the root password for your MariaDB server, NOT your system root password'
mysql -u root -p < teardown.sql
sudo systemctl stop mariadb
sudo rm -rf /srv/opt/Linux-Rocks
sudo rm -rf /opt/Linux-Rocks
