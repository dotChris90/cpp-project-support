// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path = require('path');
import * as vscode from 'vscode';

import {CppPrjSup} from './CppPrjSup';
import {VSCodeCenter} from './VSCodeCenter';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
	if (!workspaceRoot) {
		return;
	};

	let codePath = path.join(context.extensionUri.path,"out","C++Code");
	vscode.window.showInformationMessage(codePath);
	
	let cps = new CppPrjSup(new VSCodeCenter(),codePath, workspaceRoot);	
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cps" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('cps.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from C++PrjSup!');
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('cps.newPrj', () => {
		vscode.window.showInputBox({
			value: 'default/0.1.0',
			prompt: 'Enter name/version for package',
			placeHolder: 'default/0.1.0'
		}).then(value => {
			cps.newPrj("abc","1.2.3").then(() => {
				vscode.window.showInformationMessage('new project created');
			});
		});
	});
	context.subscriptions.push(disposable);


	disposable = vscode.commands.registerCommand('cps.req', () => {
		vscode.window.showInputBox({
			value: 'iceoryx(2.0.0',
			prompt: 'Enter name/version for package',
			placeHolder: 'iceoryx/2.0.0'
		}).then(value => {
			cps.getRequirements("iceoryx","2.0.0",workspaceRoot).then(() => {
				vscode.window.showInformationMessage('requires');
			});
		});
	});
	context.subscriptions.push(disposable);



	disposable = vscode.commands.registerCommand('cps.importPkg', () => {
		cps.importPackages().then(x => {
			vscode.window.showInformationMessage('Imported depending packages.');
		});
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('cps.install', () => {
		cps.installDeps().then(x => {
			vscode.window.showInformationMessage('Install depending packages.');
		});
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('cps.build', () => {
		cps.build().then(x => {
			vscode.window.showInformationMessage('build.');
		});
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('cps.cppcheck', () => {
		cps.generateCppCheckReport().then((report) => {
			cps.sourceHasError().then(hasError => {
				if (hasError) {
					vscode.window.showInformationMessage(`oh oh - your project has an error - check ${report}`);
				}
				else {
					vscode.window.showInformationMessage('All good!');
				}
			});
		});
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('cps.deploy', () => {
		cps.deployProject().then(pkg => {
			vscode.window.showInformationMessage(`Package deployed at ${pkg}`);
		});
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('cps.create', () => {
		cps.createPackageAndTest().then(pkg => {
			vscode.window.showInformationMessage(`Create Package`);
		});
	});
	context.subscriptions.push(disposable);


}

// this method is called when your extension is deactivated
export function deactivate() {}
