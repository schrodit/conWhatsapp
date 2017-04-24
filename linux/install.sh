#!/bin/bash
# Install Whatsapp

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

mkdir -p /usr/share/conWhatsapp

cp  -R $DIR/conWhatsapp-linux-x64/* /usr/share/conWhatsapp/

# cp to bin
cp $DIR/whatsapp /usr/bin/
chmod +x /usr/bin/whatsapp

# cp desktop file
cp $DIR/conWhatsapp.desktop /usr/share/applications/conWhatsapp.desktop