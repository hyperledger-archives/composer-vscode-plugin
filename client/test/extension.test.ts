// 
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as path from 'path';
import * as myExtension from '../src/extension';
import { ExtensionContext, workspace, Uri } from 'vscode';
import { error } from 'util';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {


	// test validation cto
	test("activate", () => {
		
		// let context: ExtensionContext;
		// let serverModule = context.asAbsolutePath(path.join('../server', 'server.js'));

		let uri = vscode.Uri.file(path.join("/Users/Fenglian/dev/git/composer-vscode-plugin/client/test/data", 'test.cto'));
		
		// let uri = vscode.Uri.file(path.join(vscode.workspace.rootPath || '', './data/test.cto'));
		console.log('uri' + uri);
		workspace.openTextDocument(uri).then((document) =>{

			let text = document.getText();
			console.log('text = ' + text);

		}, (err) =>{
			assert.ok(false, `error in OpenTextDocument ${err}`);
            return Promise.reject(err);
		});

		// let serverOptions: ServerOptions = {
		// 	run: { module: serverModule, transport: TransportKind.ipc }
		// }
		console.log('is activate called?');

	});
});