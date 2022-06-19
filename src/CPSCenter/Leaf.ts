import {Component} from './Component';
import * as vscode from 'vscode';

export class Leaf extends Component {
    constructor(label : string){
        super(label,vscode.TreeItemCollapsibleState.None);
    }
    public isLeaf(): boolean {
        return true;
    }
}