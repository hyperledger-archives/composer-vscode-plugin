#!/bin/bash
#-- script to automate preinstall, server compile, and package
# Exit on first error, print all commands.
set -ev
set -o pipefail

if [$TRAVIS_OS_NAME == 'linux']; then
    export CXX="g++-4.9" CC="gcc-4.9" DISPLAY=:99.0;
    sh -e /etc/init.d/xvfb start;
    sleep 3;
fi