export interface IMsgCenter {
    writeOut(text: string): void;
    writeErr(text: string): void;
    writeWarn(text : string) : void;
    showHint(text : string) : void;
    askInput(question : string, placeHolder : string) : Thenable<string | undefined>;
    pickFromList(question: string, list : string[]) : Thenable<string | undefined>;
    clear(): void;
}