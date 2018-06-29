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
import { window, workspace, ConfigurationTarget } from 'vscode';

export async function addConfig(): Promise<void> {
    console.log('ADD CONFIG');
    const connectionName = await showInputBox('Enter a name for the connection');
    const connectionProfilePath = await showInputBox('Enter a file path to the connection profile json file');
    const certificatePath = await showInputBox('Enter a file path to the certificate file');
    const privateKeyPath = await showInputBox('Enter a file path to the private key file');

    const connections: Array<any> = workspace.getConfiguration().get('fabric.connections');
    connections.push({
        name: connectionName,
        connectionProfilePath,
        certificatePath,
        privateKeyPath
    });

    return workspace.getConfiguration().update('fabric.connections', connections, ConfigurationTarget.Global);
}

function showInputBox(question: string): Thenable<string | undefined> {
    const inputBoxOptions = {
        prompt: question
    };
    return window.showInputBox(inputBoxOptions);
}
