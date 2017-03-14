#!/bin/bash
#-- script to automate preinstall, server compile, and package
# Exit on first error, print all commands.
set -ev
set -o pipefail

cd ./server
npm run compile


cd ../client

npm run package
npm test
echo "build successfully!"
