// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path = require('path');
import * as vscode from 'vscode';

import {CppPrjSup} from './CppPrjSup';
import {VSCodeCenter} from './VSCodeCenter';
import {Config} from './Config';

import { TreeDataProvider } from './CPSCenter/TreeDataProvider';

function getWorkSpace() : string {
	return (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
	? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
}

export function activate(context: vscode.ExtensionContext) {

	const workspaceRoot = getWorkSpace();
	let codePath = path.join(context.extensionUri.path,"out","C++Code");

	let config = new Config();
	config.srcDir = vscode.workspace.getConfiguration().get('conf.cps.srcDir')!;
	config.buildDir = vscode.workspace.getConfiguration().get('conf.cps.buildDir')!;
	config.metrixppFile = vscode.workspace.getConfiguration().get('conf.cps.metrixpp_file')!;
	config.doxygenFile = vscode.workspace.getConfiguration().get('conf.cps.doxygen_file')!;
	
	let cps = new CppPrjSup(new VSCodeCenter(),codePath, workspaceRoot!,config);

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
	vscode.commands.registerCommand('cps.metrix', 		() => { cps.createMetrix();  });
	vscode.commands.registerCommand('cps.doxygen', 		() => { cps.createDocumentation();  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
