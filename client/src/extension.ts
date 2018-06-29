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
'use strict';

import {
    ExtensionContext,
    workspace,
    commands,
    window,
} from 'vscode';
import { BlockchainNetworkExplorerProvider } from './explorer/BlockchainNetworkExplorer';
import { addConfig } from './commands/addConfigCommand';

let blockchainNetworkExplorerProvider;

export function activate(): void {
    console.log('CLIENT activate!!!');

    blockchainNetworkExplorerProvider = new BlockchainNetworkExplorerProvider();

    window.registerTreeDataProvider('blockchainExplorer', blockchainNetworkExplorerProvider);
    commands.registerCommand('blockchainExplorer.refreshEntry', () => blockchainNetworkExplorerProvider.refresh());
    commands.registerCommand('blockchainExplorer.connectEntry', (config) => blockchainNetworkExplorerProvider.connect(config));
    commands.registerCommand('blockchainExplorer.addConfigEntry', addConfig);
    commands.registerCommand('blockchainExplorer.testEntry', (data) => blockchainNetworkExplorerProvider.test(data));
}

/*
 * Needed for testing
 */
export function getBlockchainNetworkExplorerProvider() {
    return blockchainNetworkExplorerProvider;
}
