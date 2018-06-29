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
import { BlockchainNetworkExplorerProvider } from '../../src/explorer/BlockchainNetworkExplorer';
import * as myExtension from '../../src/extension';
import * as vscode from 'vscode';

import * as chai from 'chai';

const should = chai.should();

suite('BlockchainExplorer', () => {

    test('Test a config tree is created with add network at the end', async () => {

        // execute a command to force the extension activation
        await vscode.commands.executeCommand('blockchainExplorer.refreshEntry');

        const blockchainNetworkExplorerProvider = myExtension.getBlockchainNetworkExplorerProvider();
        const allChildren = await blockchainNetworkExplorerProvider.getChildren();

        const addNetwork = allChildren[allChildren.length - 1];

        addNetwork.contextValue.should.equal('blockchain-add-config-item');
    });
});
