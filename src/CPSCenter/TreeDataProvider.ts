import {Build} from './Build';
import {Component} from './Component';
import {Composite} from './Composite';
import {InstallAndImport} from './InstallAndImport';
import {Leaf} from './Leaf';
import {CppPrjSup} from '../CppPrjSup';

import * as vscode from 'vscode';

export class TreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	onDidChangeTreeData?: vscode.Event<Component |null |undefined>|undefined;
  
	cps : CppPrjSup;
	data: Composite[];
  
	constructor(cps : CppPrjSup ) {
	  this.data = [];
	  this.cps = cps;
	  this.data.push(new InstallAndImport(cps));
	  this.data.push(new Build(cps));
	}
  
	public getTreeItem(element: vscode.TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
	  return element;
	}
  
	public getChildren(element?: Component | undefined): vscode.ProviderResult<Component[]> {
	  if (element === undefined) {
		return this.data;
	  }
	  if (element.isLeaf()) {
		return [];
	  }
	  else {
		let comp = element as Composite;
		return comp.getChildren();
	  }
	}
	public installDefaultRelease() {
		this.cps.installDeps("default","Release");
	}
  }
