import {Component} from './Component';
import {Leaf} from './Leaf';
import * as vscode from 'vscode';
import {CppPrjSup} from '../CppPrjSup';

export abstract class Composite extends Component {
    protected cps : CppPrjSup;
    constructor(label : string, cps : CppPrjSup){
        super(label,vscode.TreeItemCollapsibleState.Collapsed);
        this.cps = cps;
    }
    public isLeaf(): boolean {
        return false;
    }
    abstract getChildren() : Leaf[];
}