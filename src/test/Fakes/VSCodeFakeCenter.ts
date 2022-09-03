import * as vscode from 'vscode';
import {IMsgCenter} from '../../IMsgCenter';

export class VSCodeFakeCenter implements IMsgCenter {
    private mappingInput: Map<string,string>;
    private mappingPick : Map<string,string>;
    private terminal: vscode.OutputChannel;
    constructor() {
        this.mappingInput = new Map<string,string>();
        this.mappingPick = new Map<string,string>();
        this.terminal = vscode.window.createOutputChannel("CPS");
    }
    setInput(question : string, anwser : string) {
        this.mappingInput.set(question,anwser);
    }
    setPick(question : string, anwser : string) {
        this.mappingPick.set(question,anwser);
    }
    writeOut(text: string): void {
        this.terminal.append(text + "\n");
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
    async askInput(question: string, placeHolder: string) : Promise<string> {
        return this.mappingInput.get(question)!;
    }
    // ToDo :   find out why sometimes return type of showQuickPick is undefined .... 
    //          and so not need for this walk around
    async pickFromList(question: string, list: string[]): Promise<string> {
		return this.mappingPick.get(question)!;
    }
    showSVG(uri: string): void {
        vscode.commands.executeCommand('_svg.showSvgByUri', vscode.Uri.parse(uri));
    }
    showHtml(): void {
        vscode.commands.executeCommand('extension.liveServer.goOnline');
    }
    showTxt(uri: string): void {
        vscode.commands.executeCommand('vscode.open',vscode.Uri.parse(uri));
    }
    showError(text: string): void {
        vscode.window.showErrorMessage(text);
    }
    async getSelectedTreeItem(): Promise<string> {
        return "bla"; 
    }
    async getSelectedEditorText(): Promise<string> {
        return "blu";
    }
    async pickFromListMulti(question: string, list: string[]): Promise<string[]> {
        return [""];
    }
}
