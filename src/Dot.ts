import {Executor} from './Executor';

export class Dot {
    private exec : Executor;
    constructor(
        exec : Executor) {
        this.exec = exec;
    }
    public async generateSvgFromDot(
        dotFile : string, 
        dstSvgFile : string
    ) {
        let cmd = "dot";
        let args = [
            `-Tsvg`,
            `-o`,
            `${dstSvgFile}`,
            `${dotFile}`
        ];
        return this.exec.execPromise(cmd, args);
        // dot -Tsvg -o graph.svg ./graph.dot
    }
}