'use strict'

const fs = require('fs');

const comp = require('compare-versions');
const request = require('request');

const repoUrl = 'https://github.com/sp-convey/conWhatsapp';

module.exports = {
    checkforUpdate: (path) => {
        let version = require(path + '/package.json').version;
        let options = {
            url: 'https://api.github.com/repos/sp-convey/conWhatsapp/tags',
            method: 'GET',
            headers: {
                'User-Agent': 'spconvey'
            }
        }
        request(options, function(err, res, body) {  
            let tags = JSON.parse(body);
            tags.sort((a, b) => {
                comp(a.name, b.name);
            });

            //check if already got newest version
            if (comp(version, tags[0].name) === -1) return false;
            else return true;
        });
    },
    update: () => {
        //get latest release
        let options = {
            url: 'https://api.github.com/repos/sp-convey/conWhatsapp/releases/latest',
            method: 'GET',
            headers: {
                'User-Agent': 'spconvey'
            }
        }
        request(options, function(err, res, body) {  
            let rel = JSON.parse(body);

            //download asset
            if(!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
            let file = fs.createWriteStream('./tmp/tmp.tar.gz');

            let url = getAssetUrl(rel.assets);
            options = {
                url: url,
                method: 'GET',
                headers: {
                    'User-Agent': 'spconvey'
                }
            }
            console.log(url);
            r.on('response', (res) => {
                res.pipe(file);
            })
            
        });

        // process.nextTick(function(){
        //     callback(val);
        // });
    }
}

function getAssetUrl(assets) {
    const os = require('os');
    let url;
    switch (os.platform()) {
        case 'linux':
            assets.forEach((asset) => {
                if (asset.name == 'conWhatsapp-linux-x64.tar.gz') url = asset.url;
            });
            break;
        case 'win32':
            assets.forEach((asset) => {
                if (asset.name == 'conWhatsapp-linux-x64.tar.gz') url = asset.url;
            });
            break;
        default:
         throw new Error();
    }
    return url;
}
