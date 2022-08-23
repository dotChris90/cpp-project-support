import {Composite} from './Composite';
import * as vscode from 'vscode';
import { Leaf } from './Leaf';
import {CppPrjSup} from '../CppPrjSup';

export class InstallAndImport extends Composite {
    contextValue = 'install';
    constructor(cps : CppPrjSup){
        super("Install & Import",cps);
    }
    public getChildren(): Leaf[] {
        let leafs : Leaf[] = [];
        leafs.push(new Leaf("all"));
        let reqs = this.cps.getRequirementsOfProject();
        return leafs;
    }
}