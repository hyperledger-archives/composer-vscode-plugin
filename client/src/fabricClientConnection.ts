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
    loadFromConfig, ChannelInfo, ChannelQueryResponse, ChaincodeQueryResponse,
    ChaincodeInfo, Peer
} from 'fabric-client';
import * as fs from 'fs';

const ENCODING = 'utf8';

// TODO: error handling
export class FabricClientConnection {

    private connectionProfilePath: string;
    private certificatePath: string;
    private privateKeyPath: string;
    private client: any;

    constructor(configData) {
        this.connectionProfilePath = configData.connectionProfilePath;
        this.certificatePath = configData.certificatePath;
        this.privateKeyPath = configData.privateKeyPath;
    }

    async connect() {
        this.client = await loadFromConfig(this.connectionProfilePath);
        const mspid: string = this.client.getMspid();
        const certString: string = this.loadFileFromDisk(this.certificatePath);
        const privateKeyString: string = this.loadFileFromDisk(this.privateKeyPath);
        // TODO: probably need to use a store rather than this as not every config will be an admin
        this.client.setAdminSigningIdentity(privateKeyString, certString, mspid);

    }

    getAllPeers(): Array<Peer> {
        return this.client.getPeersForOrg(null);
    }

    getPeer(name: string): Peer {
        const allPeers = this.getAllPeers();

        const wantedPeer = allPeers.find((peer) => {
            return peer.getName() === name;
        });

        return wantedPeer;
    }

    async getAllChannelsForPeer(peerName: string): Promise<Array<ChannelInfo>> {
        try {
            // TODO: update this when not just using admin
            const peer: Peer = this.getPeer(peerName);
            const channelResponse: ChannelQueryResponse = await this.client.queryChannels(peer, true);
            return channelResponse.channels;
        } catch (error) {
            console.log(error);
        }
    }

    async getInstalledChaincode(peer: any): Promise<Array<ChaincodeInfo>> {
        try {
            const chaincodeResponse: ChaincodeQueryResponse = await this.client.queryInstalledChaincodes(peer, true);
            return chaincodeResponse.chaincodes;
        } catch (error) {
            console.log(error);
        }
    }

    private loadFileFromDisk(path: string): string {
        try {
            return fs.readFileSync(path, ENCODING) as string;
        } catch (error) {
            console.log(error);
        }
    }
}
