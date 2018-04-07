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

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as myExtension from '../src/extension';
import { ExtensionContext, workspace, Uri } from 'vscode';
import { error } from 'util';

// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Tests', () => {
  const rootPath = path.dirname(__dirname);

  // open a cto document should return the expected document id and line count
  test('activate should return a cto document when open a cto file', () => {

    // const rootPath = path.dirname(__dirname);
    const uri = vscode.Uri.file(path.join(rootPath, '../test/data/valid/cto/test.cto'));

    workspace.openTextDocument(uri).then((document) => {
    const text = document.getText();
    assert.equal(document.languageId, 'composer');
    assert.ok(document.lineCount === 41);

    });
  });

  test('activate should return an acl file when open an acl file', () => {

   const uri = vscode.Uri.file(path.join(rootPath, '../test/data/valid/acl/permissions.acl'));

   workspace.openTextDocument(uri).then((document) => {
    const text = document.getText();
    assert.equal(document.languageId, 'composer-acl');
    assert.ok(document.lineCount === 34);
    });
  });
});
