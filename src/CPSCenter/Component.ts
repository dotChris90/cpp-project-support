import * as vscode from 'vscode';

export abstract class Component extends vscode.TreeItem {
    abstract isLeaf() : boolean;
    constructor(label : string, state : vscode.TreeItemCollapsibleState) {
        super(label, state);
    }
}