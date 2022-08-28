// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path = require('path');
import * as vscode from 'vscode';

import {CppPrjSup} from './CppPrjSup';
import {VSCodeCenter} from './VSCodeCenter';
import {Config} from './Config';

//import { TreeDataProvider } from './CPSCenter/TreeDataProvider';

function getWorkSpace() : string {
	return (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
	? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
}

export function activate(context: vscode.ExtensionContext) {

	const workspaceRoot = getWorkSpace();
	let codePath = path.join(context.extensionUri.path,"out","C++Code");

	let config = new Config();

	config.srcDir 		= vscode.workspace.getConfiguration().get('conf.cps.srcDir')!;
	config.buildDir 	= vscode.workspace.getConfiguration().get('conf.cps.buildDir')!;
	config.metrixppFile = vscode.workspace.getConfiguration().get('conf.cps.metrixpp_file')!;
	config.doxygenFile 	= vscode.workspace.getConfiguration().get('conf.cps.doxygen_file')!;
	config.deployDir    = vscode.workspace.getConfiguration().get('conf.cps.deployDir')!;
	
	let cps = new CppPrjSup(new VSCodeCenter(),codePath, workspaceRoot!,config);

	vscode.commands.registerCommand('cps.newPrj', 			() => { cps.newPrj(); }); 
	vscode.commands.registerCommand('cps.importPkg', 		() => { cps.importPackages(); });
	vscode.commands.registerCommand('cps.install', 			() => { cps.installDeps(); });
	// ToDo : rethink if need 2 separate install commands
	//vscode.commands.registerCommand('cps.installPick', 		() => { cps.installDeps(); });
	vscode.commands.registerCommand('cps.build', 			() => { cps.build(); });
	vscode.commands.registerCommand('cps.deploy', 			() => { cps.deployProject();  });
	vscode.commands.registerCommand('cps.create', 			() => { cps.createPackageAndTest();  });
	vscode.commands.registerCommand('cps.cppcheckText', 	() => { cps.generateCppCheckTextReport();  });
	vscode.commands.registerCommand('cps.packageTree', 		() => { cps.generatePackageTree();  });
	vscode.commands.registerCommand('cps.targetTree', 		() => { cps.generateTargetTree();  });
	vscode.commands.registerCommand('cps.clean', 			() => { cps.clean();  });
	vscode.commands.registerCommand('cps.metrix', 			() => { cps.createMetrix();  });
	vscode.commands.registerCommand('cps.doxygen', 			() => { cps.createDocumentation();  });
	vscode.commands.registerCommand('cps.importTemplate', 	() => { cps.importDefaultTemplate();  });
	vscode.commands.registerCommand('cps.inspect', 			() => { cps.inspectAllPkgOptions();  });
	vscode.commands.registerCommand('cps.installCPSTools', 	() => { cps.installToolsIfNotPresent();  });
	vscode.commands.registerCommand('cps.generateInterface',() => { cps.generateInterface();  });
	vscode.commands.registerCommand('cps.addIFClick', 		() => { cps.generateInterfaceInTreeView();  });
	vscode.commands.registerCommand('cps.addFullClass',     () => { cps.generateFullClasInTreeView();   });
	vscode.commands.registerCommand('cps.genMethBody',      () => { cps.generateMethodBody();   });
	vscode.commands.registerCommand('cps.getPkgTarget',     () => { cps.getPackageTargets();   });
	vscode.commands.registerCommand('cps.getPrjTarget',     () => { cps.getProjectTargets();   });


	// ToDo : better format and add command to package.json
	//vscode.commands.registerCommand('cps.cppcheckHtml', 	() => { cps.generateCppCheckHtmlReport();  });
	
}

// this method is called when your extension is deactivated
export function deactivate() {}
