/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
import * as vscode from 'vscode';

import * as chai from 'chai';

const should = chai.should();

// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Tests', () => {

    // Defines a Mocha unit test
    test('Check all the commands are registered', async () => {

        // execute a command to force the extension activation
        await vscode.commands.executeCommand('blockchainExplorer.refreshEntry');

        const allCommands = await vscode.commands.getCommands();

        const blockchainCommands = allCommands.filter((command) => {
            return command.startsWith('blockchain');
        });

        blockchainCommands.should.deep.equal([
            'blockchainExplorer.refreshEntry',
            'blockchainExplorer.connectEntry',
            'blockchainExplorer.addConfigEntry',
            'blockchainExplorer.testEntry']);
    });
});
