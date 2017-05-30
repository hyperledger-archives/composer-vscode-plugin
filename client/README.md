# Hyperledger Composer Extension for VSCode 

Validate Composer model files that define the structure of your business network 
in terms of Assets, Participants and Transactions.

This VSCode extension parses .cto files using the Hyperledger Composer parser
and reports any validation errors. It will also parse and validate Hyperledger
Composer "permissions.acl" files. To work with models that use imports and span 
multiple files, you must open all related files. To validate the ACL file, the 
corresponding model files must also be opened.

This extention is currently in beta so please raise any problems you find as an 
[issue](https://github.com/hyperledger/composer-vscode-plugin/issues).
