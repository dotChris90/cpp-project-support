import {Executor} from './Executor';

export class Doxygen {
    private exec : Executor;
    private doxygenBin : string;
    constructor(
        exec : Executor,
        doxygenBin : string
        ) {
        this.exec = exec;
        this.doxygenBin = doxygenBin;
    }
    public async generateDocumentation(
        doxygenFile : string,
        workDir : string
    ) {
        let cmd = this.doxygenBin;
        let args = [
            `${doxygenFile}`
        ];
        return this.exec.execPromise(cmd, args, workDir);
    }
}