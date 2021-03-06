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

	vscode.commands.registerCommand('cps.newPrj', 		() => { cps.newPrj(); }); 
	vscode.commands.registerCommand('cps.importPkg', 	() => { cps.importPackages("default"); });
	vscode.commands.registerCommand('cps.install', 		() => { cps.installDeps("default","Release"); });
	vscode.commands.registerCommand('cps.installPick', 	() => { cps.installDeps(); });
	vscode.commands.registerCommand('cps.build', 		() => { cps.build(); });
	vscode.commands.registerCommand('cps.deploy', 		() => { cps.deployProject();  });
	vscode.commands.registerCommand('cps.create', 		() => { cps.createPackageAndTest();  });
	vscode.commands.registerCommand('cps.cppcheck', 	() => { cps.generateCppCheckReport();  });
	vscode.commands.registerCommand('cps.packageTree', 	() => { cps.generatePackageTree();  });
	vscode.commands.registerCommand('cps.targetTree', 	() => { cps.generateTargetTree();  });
	vscode.commands.registerCommand('cps.clean', 		() => { cps.clean();  });
	
}

// this method is called when your extension is deactivated
export function deactivate() {}
