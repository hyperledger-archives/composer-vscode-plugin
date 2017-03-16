#!/bin/bash
#-- script to auto publish plugin to VSCode marketplace
# Exit on first error, print all commands.
set -ev
set -o pipefail

# check that this is the right node.js version
if [ "${TRAVIS_NODE_VERSION}" != "" -a "${TRAVIS_NODE_VERSION}" != "6"]; then
  echo Not executing as not running primary node.js version
  exit 0
fi
echo Start to install vsce
echo "${VSCETOKEN}"
echo "${TRAVIS_TAG}"
# Push the code to npm there there is a travis tag defined
if [ "${TRAVIS_TAG}" != "" ]; then 
  # Check  vsce installed
  npm install -g vsce

  # publish to the VSCode marketplace using VSCETOKEN

  vsce publish -p "${VSCETOKEN}"
  echo Successfully published the publishing
fi
