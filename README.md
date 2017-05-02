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
