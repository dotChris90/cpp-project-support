import {IMsgCenter} from './IMsgCenter';
import * as vscode from 'vscode';

export class VSCodeCenter implements IMsgCenter {
    private terminal: vscode.OutputChannel;
    constructor() {
        this.terminal = vscode.window.createOutputChannel("CPS");
    }
    writeOut(text: string): void {
        this.terminal.append(text);
    };
    writeErr(text: string): void {
        this.terminal.append(text);
    }
    writeWarn(text: string): void {
        
    }
    clear(): void {
        this.terminal.clear();
        this.terminal.show();
    }
    showHint(text: string): void {
        vscode.window.showInformationMessage(text);   
    }
}