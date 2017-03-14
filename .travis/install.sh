#!/bin/bash
#-- script to automate preinstall, server compile, and package
# Exit on first error, print all commands.
set -ev
set -o pipefail

echo "preinstall server dependencies"
cd ./server
npm install

echo "preinstall client dependencies..."
cd ../client
npm install
