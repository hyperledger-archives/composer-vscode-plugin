/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
  IPCMessageReader, IPCMessageWriter,
  createConnection, IConnection, TextDocumentSyncKind,
  TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity,
  InitializeParams, InitializeResult, TextDocumentPositionParams,
  CompletionItem, CompletionItemKind
} from 'vscode-languageserver';

//import { GenericNotificationHandler } from 'vscode-jsonrpc';
import Uri from 'vscode-uri'
import { ModelManager, AclManager, QueryManager, ModelFile, ModelUtil, AclFile, Logger, FileWriter, Writer } from 'composer-common';
import PlantUMLVisitor = require("composer-common/lib/codegen/fromcto/plantuml/plantumlvisitor");

//First, before calling any composer code,
//turn off all composer logging for now until the base fixes errors if log folder cannot be created!
Logger.setFunctionalLogger({
  log: () => {
    //none, zip, nada!
  }
});

//create the three main singleton managers we need to handle all 
//open *.cto, .qry and permissions.acl documents in the workspace.
//note that composer currently only supports one query and one acl file at present
let modelManager = new ModelManager();
let aclManager = new AclManager(modelManager);
let queryManager = new QueryManager(modelManager);

// Create a connection for the server. The connection uses Node's IPC as a transport
let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities. 
let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
  //connection.console.log(`SERVER onInitialize ${JSON.stringify(params)}`); //debug
  workspaceRoot = params.rootPath;
  return {
    capabilities: {
      // Tell the client that the server works in FULL text document sync mode
      textDocumentSync: documents.syncKind,
      // Tell the client that the server support code complete
      // Note: disabled for now as snippets in the client are better, until the parser can
      // parse char by char or line by line rather than whole doc at once
      // completionProvider: {
      //   resolveProvider: false
      // }
      //lots more providers can be added here...
      executeCommandProvider: {
        commands: [
          'composer.generateUML'
        ]
      }
    }
  }
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

// The settings interface describes the server relevant settings part
interface Settings {
  composer: ComposerSettings;
}

// These are the settings defined in the client's package.json file.
interface ComposerSettings {
  contributor: boolean
  maxNumberOfProblems: number
  pUML: {
    keepSourceFileOpen: boolean
    autoShowDiagam: boolean
    includeSystemNamespace: string
    diagramStyle: string
  }
}

// hold the settings
let options: ComposerSettings;
// The settings have changed. Is sent on server activation as well. 
connection.onDidChangeConfiguration((change) => {
  //connection.console.log(`SERVER onDidChangeConfiguration ${JSON.stringify(change)}`); //debug
  options = <ComposerSettings>change.settings.composer;
  options.maxNumberOfProblems = options.maxNumberOfProblems || 10;

  //TODO set options.contributor flag on the model manager once the composer base team add the method.

  // Revalidate any open text documents
  documents.all().forEach(validateTextDocument);
});

/**
 * Server handler for 'composer.generateUML' Command
 * @param {ExecuteCommandParams} params - info passed from client - contains file and event names
 */
connection.onExecuteCommand((params) => {
  //connection.console.log(`SERVER onExecuteCommand ${JSON.stringify(params)}`); //debug

  //sanity check
  if (params.command != 'composer.generateUML') {
    return;
  }

  //create a title from the event info
  let diagramTitle = "Business Network Definition" //sensible default
  let originatingFileName = "";
  //Note: if the command is launched from the keyboard shortcut or the command palette,
  //we will not have any arguments passed in so cannot get the filename to use in the diagram.
  if (params.arguments.length >= 1) {
    if (params.arguments[0].external) {
      originatingFileName = params.arguments[0].external;
      if (originatingFileName.length > 0) {
        //originatingFileName will be url encoded, so parse and decode before using
        let originatingFileNameUri = Uri.parse(originatingFileName);
        let path = originatingFileNameUri.path;
        if (path && path.length > 0) {
          let end = path.lastIndexOf('/');
          if (end !== -1) {
            diagramTitle += " for '" + path.substring(end + 1) + "'";
          }
        }
      }
    }
  }

  handleGenerateUml(diagramTitle, originatingFileName);
});

/**
 * Server processor for 'composer.generateUML' Command
 * @param {string} diagramTitle - pUML diagram title
 * @param {string} originatingFileName - name of the cto file command was activated on as passed to server
 *        note that this can be undefined if the command was activated by a keyboard shortcut!
 */
function handleGenerateUml(diagramTitle: string, originatingFileName: string) {
  //setup the visitor that walks the model
  let visitor = new PlantUMLVisitor();
  let writer = new Writer();
  let parameters = {
    fileWriter: writer
  };

  //get info about classes to include
  let result = [];
  const modelFiles = modelManager.getModelFiles();
  for (let n = 0; n < modelFiles.length; n++) {
    const modelFile: ModelFile = modelFiles[n];
    //we exclude models from the system namespace by default
    if (options.pUML.includeSystemNamespace === "all") {
      result = result.concat(modelFile.getAllDeclarations());
    } else if (modelFile.getNamespace() != ModelUtil.getSystemNamespace()) {
      result = result.concat(modelFile.getAllDeclarations());
    }
  }

  //begin UML definition and global defines
  parameters.fileWriter.writeLine(0, "@startuml composer");
  parameters.fileWriter.writeLine(0, "'** Auto generated content, any changes may be lost **'");
  parameters.fileWriter.writeLine(0, "!define DATE %date[EEE, MMM d, ''yy 'at' HH:mm]%");
  parameters.fileWriter.writeLine(0, "skinparam titleBorderThickness 0.5");
  parameters.fileWriter.writeLine(0, "skinparam titleBorderRoundCorner 6");
  parameters.fileWriter.writeLine(0, "skinparam titleBackgroundColor LightYellow");
  if (options.pUML.diagramStyle === 'handwritten') {
    parameters.fileWriter.writeLine(0, "skinparam handwritten true")
  } else if (options.pUML.diagramStyle === 'monochrome') {
    parameters.fileWriter.writeLine(0, "skinparam monochrome true");
  } else if (options.pUML.diagramStyle === 'monochrome-reverse') {
    parameters.fileWriter.writeLine(0, "skinparam monochrome reverse");
  }

  //add in title sequence
  parameters.fileWriter.writeLine(0, "title");
  parameters.fileWriter.writeLine(0, diagramTitle);
  parameters.fileWriter.writeLine(0, "end title");

  //add in the main body of the diagram - the classes info
  result.forEach((decl) => {
    decl.accept(visitor, parameters);
  });

  if (options.pUML.includeSystemNamespace === "none") {
    //skip system namespace artifacts. Note that we can only hide classes that already exist, 
    //so for now simply search for the relevant string to check for existance. This is
    //not a failsafe solution but should work well enough for now.
    let model: string = writer.getBuffer();
    if (model.includes("org.hyperledger.composer.system.Asset")) {
      parameters.fileWriter.writeLine(0, "hide org.hyperledger.composer.system.Asset");
    }
    if (model.includes("org.hyperledger.composer.system.Participant")) {
      parameters.fileWriter.writeLine(0, "hide org.hyperledger.composer.system.Participant");
    }
    if (model.includes("org.hyperledger.composer.system.Transaction")) {
      parameters.fileWriter.writeLine(0, "hide org.hyperledger.composer.system.Transaction");
    }
    if (model.includes("org.hyperledger.composer.system.Event")) {
      parameters.fileWriter.writeLine(0, "hide org.hyperledger.composer.system.Event");
    }
    if (model.includes("org.hyperledger.composer.system.Registry")) {
      parameters.fileWriter.writeLine(0, "hide org.hyperledger.composer.system.Registry");
    }
  }

  //write closing sequence
  parameters.fileWriter.writeLine(0, 'right footer DATE');
  parameters.fileWriter.writeLine(0, '@enduml');

  //send diagram text to client
  connection.sendRequest("openUML", writer.getBuffer(), originatingFileName);
}

/**
 * Main method driven by the LSP when the user opens or changes a cto, acl or qry file
 * @param {string} textDocument - ".cto", "permissions.acl" or ".qry" document from the client to validate
 */
function validateTextDocument(textDocument: TextDocument): void {
  let langId = textDocument.languageId; //type of file we are processing
  //note - this is the FULL document text as we can't do incremental yet! 
  let txt = textDocument.getText();

  //only add files with data
  if (txt != null && txt.length > 0) {
    //different behaviour for each language type
    if (langId == "composer-acl") {
      //permissions.acl file
      validateNewAclModelFile(textDocument);
    } else if (langId == "composer-qry") {
      //.qry file
      validateNewQueryModelFile(textDocument);
    } else {
      //raw composer .cto file
      validateCtoModelFile(textDocument);

      //if we have an acl file we should revalidate it incase the model changes broke something
      const aclFile = aclManager.getAclFile();
      if (aclFile != null) {
        validateExistingAclModelFile(aclFile);
      }

      //if we have a query file we should revalidate it incase the model changes broke something
      const queryFile = queryManager.getQueryFile();
      if (queryFile != null) {
        validateExistingQueryModelFile(queryFile);
      }
    }
  }

}

/**
 * Validates a cto file that the user has just opened or changed in the workspace.
 * @param {string} textDocument - ".cto" file to validate
 * @private
 */
function validateCtoModelFile(textDocument: TextDocument): void {
  try {
    let modelContents = textDocument.getText(); //*.cto file
    //add or update, depending on existance. ModelFile and modelManager calls may throw an exception
    let model = new ModelFile(modelManager, modelContents, textDocument.uri);
    if (modelManager.getModelFile(model.getNamespace())) {
      modelManager.updateModelFile(model);
    } else {
      modelManager.addModelFile(model);
    }
    sendDiagnosticSuccess(textDocument.uri); //all OK
  } catch (err) {
    buildAndSendDiagnosticFromException(err, textDocument.lineCount, textDocument.uri);
  }
}

/**
 * Validates an acl file that the user has just opened or changed in the workspace.
 * @param {string} textDocument - new "permissions.acl" file to validate
 * @private
 */
function validateNewAclModelFile(textDocument: TextDocument): void {
  try {
    let txt = textDocument.getText(); //permissions.acl file
    let aclFile = aclManager.createAclFile(textDocument.uri, txt);
    aclFile.lineCount = textDocument.lineCount; //store the count so future errors have access
    aclManager.setAclFile(aclFile); //may throw an exception
    sendDiagnosticSuccess(textDocument.uri); //all OK
  } catch (err) {
    buildAndSendDiagnosticFromException(err, textDocument.lineCount, textDocument.uri);
  }
}

/**
 * Validates the existing acl file that the user has open in the workspace.
 * note that currently there can only be one acl file per business network definition
 * @param {string} textDocument - existing "permissions.acl" file to validate
 * @private
 */
function validateExistingAclModelFile(aclFile): void {
  try {
    aclFile.validate(); //may throw an exception
    sendDiagnosticSuccess(aclFile.getIdentifier()); //all OK
  } catch (err) {
    buildAndSendDiagnosticFromException(err, aclFile.lineCount, aclFile.getIdentifier());
  }
}

/**
 * Validates a qry file that the user has just opened or changed in the workspace.
 * @param {string} textDocument - new ".qry" file to validate
 * @private
 */
function validateNewQueryModelFile(textDocument: TextDocument): void {
  try {
    let txt = textDocument.getText(); //.qry file
    let queryFile = queryManager.createQueryFile(textDocument.uri, txt);
    queryFile.lineCount = textDocument.lineCount; //store the count so future errors have access
    queryManager.setQueryFile(queryFile); //may throw an exception
    sendDiagnosticSuccess(textDocument.uri); //all OK
  } catch (err) {
    buildAndSendDiagnosticFromException(err, textDocument.lineCount, textDocument.uri);
  }
}

/**
 * Validates the existing query file that the user has open in the workspace.
 * note that currently there can only be one qry file per business network definition at present
 * @param {string} textDocument - existing ".qry" file to validate
 * @private
 */
function validateExistingQueryModelFile(queryFile): void {
  try {
    queryFile.validate(); //may throw an exception
    sendDiagnosticSuccess(queryFile.getIdentifier()); //all OK
  } catch (err) {
    buildAndSendDiagnosticFromException(err, queryFile.lineCount, queryFile.getIdentifier());
  }
}

/**
 * Turns the 'err' exception into a diagnostic message that it sends back to the client.
 * @param {excepion} err - current validation exception
 * @param {number} lineCount - number of lines in the invalid document
 * @param {string} sourceURI - internal url for the invalid document
 * @private
 */
function buildAndSendDiagnosticFromException(err, lineCount: number, sourceURI: string): void {
  let diagnostics: Diagnostic[] = [];
  let curLine = 0; //vscode lines are 0 based.
  let curColumn = 0; //vscode columns are 0 based
  let endLine = lineCount; //default to highlighting to the end of document
  let endColumn = Number.MAX_VALUE //default to highlighting to the end of the line

  //fill in the base description for the excption
  let fullMsg = err.name + ": "

  //if it's a cto composer exception it will have a short message, but acl and qry ones do not 
  if (typeof err.getShortMessage === "function") {
    //Short msg does not have and file and line info which is what we want
    fullMsg += err.getShortMessage();
  } else {
    //May have file and line info
    fullMsg += err.message;
  }

  let finalMsg = fullMsg;

  //extract Line and Column info if we can, but not all errors have a real line and column
  if (typeof err.getFileLocation === "function") {
    //genuine composer exception
    let location = err.getFileLocation();
    //we will take the default if we have no location
    if (location) {
      curLine = location.start.line - 1; //Composer errors are 1 based
      endLine = location.end.line - 1;
      curColumn = location.start.column - 1; //Composer errors are 1 based
      endColumn = location.end.column - 1;
    }
  } else {
    //possible composer exception
    let index = fullMsg.lastIndexOf(". Line ");
    if (index != -1) {
      //manually pull out what we can.
      finalMsg = fullMsg.substr(0, index + 1);
      let current = fullMsg.substr(index + 7); //step over ". Line "   
      curLine = parseInt(current, 10) - 1; //Composer errors are 1 based 
      if (isNaN(curLine) || curLine < 0) { curLine = 0; } //sanity check 
      endLine = curLine; //in the normal case only highlight the current line 
      index = current.lastIndexOf(" column ");
      current = current.substr(index + 8); //step over " column " 
      curColumn = parseInt(current, 10) - 1; //Composer errors are 1 based 
      if (isNaN(curColumn) || curColumn < 0) { curColumn = 0; } //sanity check 
      endColumn = curColumn; //set to the same to highlight the current word 
    }
  }

  //build the message to send back to the client 
  diagnostics.push({
    severity: DiagnosticSeverity.Error,
    range: {
      start: { line: curLine, character: curColumn },
      end: { line: endLine, character: endColumn }
    },
    code: err.name,
    message: finalMsg,
    source: 'Composer'
  });


  // Send the computed diagnostics to VSCode. This must always be sent because:
  // 1: If there has been an exception, this will report the details (this case).
  // 2: If there has NOT been an exception, this will clear any previous exception details.
  connection.sendDiagnostics({ uri: sourceURI, diagnostics });
}

/**
 * Sends back a successful diagnostics message for the sourceURI document
 * to clear any outstanding errors against this file in the client
 * @param {string} sourceURI - internal url for the valid document
 * @private
 */
function sendDiagnosticSuccess(sourceURI: string): void {
  let diagnostics: Diagnostic[] = [];
  // Send the computed diagnostics to VSCode. This must always be sent because:
  // 1: If there has been an exception, this will report the details.
  // 2: If there has NOT been an exception, this will clear any previous exception details (this case).
  connection.sendDiagnostics({ uri: sourceURI, diagnostics });
}

connection.onDidChangeWatchedFiles((change) => {
  // Monitored files have change in VSCode
  //connection.console.log('We received a file change event');
});


// This handler provides the initial list of the completion items.
connection.onCompletion((textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
  // The pass parameter contains the position of the text document in 
  // which code complete got requested. For the example we ignore this
  // info and always provide the same completion items.
  return [
    {
      label: 'asset',
      kind: CompletionItemKind.Text,
      data: 1
    },
    {
      label: 'participant',
      kind: CompletionItemKind.Text,
      data: 2
    },
    {
      label: 'transaction',
      kind: CompletionItemKind.Text,
      data: 3
    },
    {
      label: 'enum',
      kind: CompletionItemKind.Text,
      data: 4
    }
  ]
});

// This handler resolve additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  if (item.data === 1) {
    item.detail = 'asset details',
      item.documentation = 'Add an asset.'
  } else if (item.data === 2) {
    item.detail = 'participant details',
      item.documentation = 'Add an participant'
  } else if (item.data === 3) {
    item.detail = 'transaction details',
      item.documentation = 'Add an transaction'
  } else if (item.data === 4) {
    item.detail = 'enum details',
      item.documentation = 'Add an enum'
  }
  return item;
});

/*
connection.onDidOpenTextDocument((params) => {
  // A text document got opened in VSCode.
  // params.textDocument.uri uniquely identifies the document. For documents store on disk this is a file URI.
  // params.textDocument.text the initial full content of the document.
  connection.console.log(`${params.textDocument.uri} opened.`);
});

connection.onDidChangeTextDocument((params) => {
  // The content of a text document did change in VSCode.
  // params.textDocument.uri uniquely identifies the document.
  // params.contentChanges describe the content changes to the document.
  connection.console.log(`${params.textDocument.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});

connection.onDidCloseTextDocument((params) => {
  // A text document got closed in VSCode.
  // params.textDocument.uri uniquely identifies the document.
  connection.console.log(`${params.textDocument.uri} closed.`);
});
*/

// Listen on the connection
connection.listen();