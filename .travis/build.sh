#!/bin/bash
#-- script to automate preinstall, server compile, and package
# Exit on first error, print all commands.
set -ev
set -o pipefail

echo "preinstall server dependencies"
cd ./server
npm install
echo "compile server component..."
npm run compile

echo "preinstall client dependencies..."
cd ../client
npm install
echo "package the VSIX file..."
npm run package
echo "build successfully!"
