import {Composite} from './Composite';
import * as vscode from 'vscode';
import { Leaf } from './Leaf';
import {CppPrjSup} from '../CppPrjSup';

export class Build extends Composite {
    contextValue = 'build';
    constructor(cps : CppPrjSup){
        super("Build",cps);
    }
    public getChildren(): Leaf[] {
        let leafs : Leaf[] = [];
        leafs.push(new Leaf("all"));
        return leafs;
    }
}