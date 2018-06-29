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
// tslint:disable no-trailing-whitespace
'use strict';
import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

import { ViewColumn, workspace, window, TextEditorEdit, Position } from 'vscode';

export class GenerateTests {

    static async createFile() {
        const localDocPath = path.join(os.tmpdir(), 'vscode-fabric-editor', 'bob.js');
        await fse.ensureFile(localDocPath);

        const document = await workspace.openTextDocument(localDocPath);

        const column = ViewColumn.One;
        const preserveFocus = false;
        const functionNames = ['buyCar', 'sellCar'];
        const chainCodeName = 'carDealer';

        const requires = `const assert = require('assert'); \n \n`;

        // TODO: add in here to create the before to create the client connection
        const describeStart = `describe('${chainCodeName}', () => { \n`;
        const its = [];
        functionNames.forEach((functionName) => {
            its.push(
`   it('${functionName}', () => {
        assert.equal(true, true);
    });
    
`
            );
        });

        const describeEnd = `});`;
        let data = requires;
        data += describeStart;
        its.forEach((it) => {
            data += it;
        });

        data += describeEnd;

        const textEditor = await window.showTextDocument(document, column, preserveFocus);
        textEditor.edit((editBuilder: TextEditorEdit) => {
            editBuilder.insert(new Position(0, 0), data);
        });

        await document.save();
    }
}
