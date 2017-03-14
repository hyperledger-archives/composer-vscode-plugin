#!/bin/bash
#-- script to automate preinstall, server compile, and package
# Exit on first error, print all commands.
set -ev
set -o pipefail

echo "preinstall server dependencies"
cd ./server
echo "compile server component..."
npm run compile

echo "preinstall client dependencies..."
cd ../client
echo "package the VSIX file..."
npm run package
npm test
echo "build successfully!"
