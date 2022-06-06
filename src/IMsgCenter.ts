export interface IMsgCenter {
    writeOut(text: string): void;
    writeErr(text: string): void;
    writeWarn(text : string) : void;
    showHint(text : string) : void;
    clear(): void;
}