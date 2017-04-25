#!/bin/bash

git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis"

VERSION = cat package.json | jq '.version'

echo 'version: '
echo $VERSION

# Add tag and push to master.
git tag -a $VERSION -m "Travis build $VERSION pushed a tag."
git push origin --tags
git fetch origin

echo -e "Done magic with tags.\n"
