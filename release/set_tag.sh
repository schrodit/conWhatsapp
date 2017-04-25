#!/bin/bash

git config --global user.email "builds@travis-ci.com"
git config --global user.name "Travis CI"

VERSION = cat package.json | jq '.version'

echo 'version: '
echo $VERSION

export GIT_TAG=$VERSION
git tag $GIT_TAG -a -m "Generated tag from TravisCI build $TRAVIS_BUILD_NUMBER"
git push origin $GIT_TAG
