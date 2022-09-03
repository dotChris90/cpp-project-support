export interface IMsgCenter {
    writeOut(text: string): void;
    writeErr(text: string): void;
    writeWarn(text : string) : void;
    showHint(text : string) : void;
    showError(text : string) : void;
    askInput(question : string, placeHolder : string) : Promise<string>;
    pickFromList(question: string, list : string[]) : Promise<string>;
    pickFromListMulti(question: string, list : string[]) : Promise<string[]>;
    showSVG(uri : string) : void;
    showHtml() : void; 
    showTxt(uri : string) : void; 
    clear() : void;
    getSelectedTreeItem() : Promise<string>;
    getSelectedEditorText() : Promise<string>;
}