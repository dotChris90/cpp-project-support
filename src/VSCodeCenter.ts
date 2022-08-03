import {IMsgCenter} from './IMsgCenter';
import * as vscode from 'vscode';

export class VSCodeCenter implements IMsgCenter {
    private terminal: vscode.OutputChannel;
    constructor() {
        this.terminal = vscode.window.createOutputChannel("CPS");
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
    askInput(question: string, placeHolder: string) {
        return vscode.window.showInputBox({
			value: placeHolder,
			prompt: question,
			placeHolder: placeHolder
		});
    }
    pickFromList(question: string, list: string[]): Thenable<string | undefined> {
		return vscode.window.showQuickPick(list, {
			placeHolder: question
		});
    }
    showSVG(uri: string): void {
        vscode.commands.executeCommand('_svg.showSvgByUri', vscode.Uri.parse(uri));
    }
    showHtml(): void {
        vscode.commands.executeCommand('extension.liveServer.goOnline');
    }
}