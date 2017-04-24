#!/bin/bash

git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis"

# bump package.json
gulp bump
VERSION = cat package.json | jq '.version'

# Add tag and push to master.
git commit -a -m "Bump and publish version $VERSION"
git tag -a $VERSION -m "Travis build $VERSION pushed a tag."
git push origin --tags
git fetch origin

echo -e "Done magic with tags.\n"
