'use strict'

const Git = require("nodegit");
const Repo = Git.Repository;
const Tag = Git.Tag;

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
            
            console.log(rel);

            
        });

        // process.nextTick(function(){
        //     callback(val);
        // });
    }
}
