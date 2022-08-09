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
    // ToDo :   find out why sometimes return type of showQuickPick is undefined .... 
    //          and so not need for this walk around
    async pickFromList(question: string, list: string[]): Promise<string | undefined> {
		let anwserGiven = false;
        let anwser = "";
        while (anwserGiven == false) {
            let anwser_ = await vscode.window.showQuickPick(list, {
                placeHolder: question
            });
            if (anwser_ === undefined) {
                // pass 
            }
            else {
                anwserGiven = true;
                anwser = anwser_!;
            }
        }
        return anwser;
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
}