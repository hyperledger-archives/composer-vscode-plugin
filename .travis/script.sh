#!/bin/bash
#-- script to automate preinstall, server compile, and package
# Exit on first error, print all commands.
set -ev
set -o pipefail

cd ./server
npm run compile:server
npm test --silent

cd ../client

npm run package:vsix
npm install -g vsce

npm test --silent
