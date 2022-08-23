import {Executor} from './Executor';

export class Dot {
    private exec : Executor;
    private dotBin : string;
    constructor(
        exec : Executor,
        dotBin : string
        ) {
        this.exec = exec;
        this.dotBin = dotBin;
    }
    public async generateSvgFromDot(
        dotFile : string, 
        dstSvgFile : string
    ) {
        let cmd = this.dotBin;
        let args = [
            `-Tsvg`,
            `-o`,
            `${dstSvgFile}`,
            `${dotFile}`
        ];
        return this.exec.exec(cmd, args);
        // dot -Tsvg -o graph.svg ./graph.dot
    }
}