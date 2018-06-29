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

// tslint:disable max-classes-per-file
'use strict';
import {
    EventEmitter,
    Event,
    TreeDataProvider,
    TreeItem,
    TreeItemCollapsibleState,
    workspace,
    Command
} from 'vscode';
import * as path from 'path';

import { FabricClientConnection } from '../fabricClientConnection';
import { GenerateTests } from './generateTests';

export class BlockchainNetworkExplorerProvider implements TreeDataProvider<BlockchainTreeItem> {

    private _onDidChangeTreeData: EventEmitter<BlockchainTreeItem | undefined> = new EventEmitter<BlockchainTreeItem | undefined>();
    // tslint:disable-next-line member-ordering
    readonly onDidChangeTreeData: Event<BlockchainTreeItem | undefined> = this._onDidChangeTreeData.event;

    // TODO: not sure if need both of these
    private connection: FabricClientConnection = null;
    private connected: boolean = false;

    constructor() {
        console.log('BANANA');
    }

    refresh(): void {
        console.log('FISH');
        this._onDidChangeTreeData.fire();
    }

    test(data): Promise<void> {
        console.log('TEST', data);
        return GenerateTests.createFile();
    }

    async connect(config: ConfigTreeItem): Promise<void> {
        console.log('CONNECT', config);
        console.log('CONNECT');

        this.connection = new FabricClientConnection(config);
        await this.connection.connect();
        this.connected = true;

        this.refresh();
    }

    getTreeItem(element: BlockchainTreeItem): TreeItem {
        console.log('GET TREE ITEM', element);
        if (element.contextValue === 'blockchain-channel-item') {
            console.log('CLICK ON');
        }

        return element;
    }

    getChildren(element?: BlockchainTreeItem): Thenable<BlockchainTreeItem[]> {
        console.log('GET CHILDREN', element);

        if (element) {
            if (element.contextValue === 'blockchain-channel-item') {
                return this.createPeerTree(element as ChannelTreeItem);
            }

            if (element.contextValue === 'blockchain-peer-item') {
                // return this.createInstalledChaincodeTree(element as PeerTreeItem);
            }
        }

        if (this.connection && this.connected) {
            return this.createConnectedTree();
        } else {
            return this.createConfigTree();
        }
    }

    // private createInstalledChaincodeTree(peerElement: PeerTreeItem) : Promise<Array<InstalledChainCodeTreeItem>> {
    // 	const tree = [];

    // 	const peer = peerElement.peer;

    // 	this.connection.getInstalledChaincode(peer);
    // }

    private createPeerTree(channelElement: ChannelTreeItem): Promise<Array<PeerTreeItem>> {
        const tree: Array<PeerTreeItem> = [];

        const peers: Array<string> = channelElement.peers;

        peers.forEach((peer) => {
            tree.push(new PeerTreeItem(peer));
        });

        return Promise.resolve(tree);
    }

    private async createConnectedTree(): Promise<Array<ChannelTreeItem>> {
        const tree: Array<ChannelTreeItem> = [];

        const channelMap: Map<string, Array<string>> = await this.createChannelMap();

        channelMap.forEach((peers, channel) => {
            tree.push(new ChannelTreeItem(channel, peers));
        });

        return tree;
    }

    private createChannelMap(): Promise<Map<string, Array<string>>> {
        // TODO: this should not return actual peers should just return names
        const allPeers = this.connection.getAllPeers();

        const channelMap = new Map<string, Array<any>>();
        return allPeers.reduce((promise: Promise<void>, peer) => {
            return promise
                .then(() => {
                    // TODO: should just return channelNames
                    return this.connection.getAllChannelsForPeer(peer.getName());
                })
                .then((channels: Array<any>) => {
                    channels.forEach((channel) => {
                        const channelName = channel.channel_id;
                        let peers = channelMap.get(channelName);
                        if (peers) {
                            peers.push(peer);
                            channelMap.set(channelName, peers);
                        } else {
                            peers = [peer];
                            channelMap.set(channelName, peers);
                        }
                    });
                });
        }, Promise.resolve()).then(() => {
            return channelMap;
        });
    }

    private createConfigTree(): Promise<BlockchainTreeItem[]> {
        const tree = [];

        const allConfigurations = this.getNetworkConfig();

        allConfigurations.forEach((config) => {
            tree.push(new ConfigTreeItem(config.name, {
                command: 'blockchainExplorer.connectEntry',
                title: '',
                arguments: [config]
            }));
        });

        // TODO: link this with add config command
        tree.push(new AddConfigTreeItem('Add new network'));

        return Promise.resolve(tree);
    }

    private getNetworkConfig(): Array<any> {
        return workspace.getConfiguration().get('fabric.connections');

    }

}

// TODO: all these classes should go in their own files
abstract class BlockchainTreeItem extends TreeItem {

    // TODO: update the icons
    iconPath = {
        light: path.join(__filename, '..', '..', '..', 'client', 'resources', 'light', 'dependency.svg'),
        dark: path.join(__filename, '..', '..', '..', 'client', 'resources', 'dark', 'dependency.svg')
    };

    contextValue = 'blockchain-tree-item';

    constructor(public readonly label: string,
                public readonly collapsibleState: TreeItemCollapsibleState) {
        super(label, collapsibleState);
    }

    get tooltip(): string {
        return `${this.label}`;
    }
}

class ConfigTreeItem extends BlockchainTreeItem {

    contextValue = 'blockchain-config-item';

    constructor(public readonly label: string,
                public readonly command: Command) {
        super(label, TreeItemCollapsibleState.None);
    }
}

class AddConfigTreeItem extends BlockchainTreeItem {

    contextValue = 'blockchain-add-config-item';

    constructor(public readonly label: string,
                public readonly command?: Command) {
        super(label, TreeItemCollapsibleState.None);
    }
}

class ChannelTreeItem extends BlockchainTreeItem {

    contextValue = 'blockchain-channel-item';

    constructor(private readonly channelName: string,
                public readonly peers: Array<string>) {
        super(channelName, TreeItemCollapsibleState.Collapsed);
    }
}

class PeerTreeItem extends BlockchainTreeItem {

    contextValue = 'blockchain-peer-item';

    constructor(public readonly peer: any) {
        super(peer.getName(), TreeItemCollapsibleState.Collapsed);
    }
}

class InstalledChainCodeTreeItem extends BlockchainTreeItem {

    contextValue = 'blockchain-install-chaincode-item';

    constructor(public readonly name: string,
                public readonly version: string) {
        super(name + '-' + version, TreeItemCollapsibleState.None);
    }
}
