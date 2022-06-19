// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path = require('path');
import * as vscode from 'vscode';

import {CppPrjSup} from './CppPrjSup';
import {VSCodeCenter} from './VSCodeCenter';

import { TreeDataProvider } from './CPSCenter/TreeDataProvider';

function getWorkSpace() : string {
	return (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
	? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
}

function getNewCPSInstance(context : vscode.ExtensionContext) : CppPrjSup {
	const workspaceRoot = getWorkSpace();
	let codePath = path.join(context.extensionUri.path,"out","C++Code");
	return new CppPrjSup(new VSCodeCenter(),codePath, workspaceRoot!);
}

export function activate(context: vscode.ExtensionContext) {

	let cps = getNewCPSInstance(context);
	
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
			cps.getRequirements("iceoryx","2.0.0",getWorkSpace()).then(() => {
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

	let tp = new TreeDataProvider(cps);
	vscode.window.registerTreeDataProvider('buildAndPack',tp );
	vscode.commands.registerCommand("cps.center.installdefault",() => tp.installDefaultRelease());
}

// this method is called when your extension is deactivated
export function deactivate() {}
