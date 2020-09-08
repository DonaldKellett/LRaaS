#!/bin/sh

WORKDIR=$(pwd)
sudo cp -r ./app /opt/Linux-Rocks
cd /opt/Linux-Rocks
sudo npm install
cd $WORKDIR
sudo mkdir -p /srv/opt
sudo cp -r ./html /srv/opt/Linux-Rocks
sudo cp ./LICENSE /srv/opt/Linux-Rocks/LICENSE
