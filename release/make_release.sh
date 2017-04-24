#!/bin/bash

mkdir build

cp linux/* build/
cp -R conWhatsapp-linux-x64 build/

tar -czvf conWhatsapp-linux-x64.tar.gz build/*