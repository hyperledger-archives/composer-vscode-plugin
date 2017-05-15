# Hyperledger Composer Extension for VSCode

Validate Composer model files that define the structure of your business network in terms of Assets, Participants and Transactions.

The extension parses Composer model (.cto) files and reports any validation errors. It is currently in beta; please raise any problems you find as an [issue](https://github.com/hyperledger/composer-vscode-plugin/issues).


## Manual Build and Install

Generate the installable VSIX file:

```
git clone https://github.com/hyperledger/composer-vscode-plugin.git
cd composer-vscode-plugin/server
npm install
npm run compile
cd ../client
npm install
npm run package
```

1. Launch VSCode
2. View > Extensions
3. Press the ... and select "Install from VSIX"
4. Browse to the VSIX file
5. Install and restart VSCode
6. Open a .cto file

# Travis CI build
Developers no longer need a manual build, once you have pulled a request from your private Github repository. The build will be automatically performed by Travis.
A successful build will create an installable VSIX file on the build machine. 
The public release version number is defined in the Client package.json file. 

## Publish Release
Below are steps for publishing a release.
1. Go to https://github.com/hyperledger/composer-vscode-plugin
2. Click Releases tab
3. Click Draft a new release on the right
4. Type a Tag version in the Tag version field. e.g. v0.5.7.1
5. Type a Release title in the Release title field e.g v0.5.7.1
6. Provide a short description of this release under the Write tab
7. Uncheck the box for This is a pre-release at the end of this page
8. Click Publish release button to publish the VSIX file to the VSCode Marketplace

## Check the published release
1. Go to the VSCode Marketplace: https://marketplace.visualstudio.com/
2. Type Composer in the search field and hit return key or search button
3. This will bring you to https://marketplace.visualstudio.com/search?term=Composer&target=VSCode&category=All%20categories&sortBy=Relevance

## Install a new release
1. Open Visual Studio Code in your desktop
2. Open the Extensions by View-->Extensions or Ctrl(cmd)+Shift+x 
3. Search for Composer
4. The new published Hyperledger Composer 0.7.1 is showing on the list
5. Click Install button to install it
6. Update button will be shown if you have already installed the same plugin before.



