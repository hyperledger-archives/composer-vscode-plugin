// 
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as path from 'path';
import { error } from 'util';
import * as server from '../src/server';

// Defines a Mocha test suite to group tests of similar kind together
describe("Server Tests", () => {


	// test validation cto
	it("validateCtoModelFile", () => {
		
		let originatingFileName: string = "./test/data/test.cto";
		console.log('is server called?');
		// server.validateCtoModelFile( originatingFileName);

	});
});