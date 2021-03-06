// cppcheck --force --enable=all --output-file=report.txt ../src/
import {Executor} from './Executor';
import * as fse from 'fs-extra';

export class CppCheck {
    private exec : Executor;
    constructor(
        exec : Executor) {
        this.exec = exec;
    }
    public generateReport(
        sourceDir : string,
        reportFile : string,
        workDir : string
    ) {
        let cmd = "cppcheck";
        let args = [
            "--force",
            "--enable=all",
            `--output-file=${reportFile}`,
            `${sourceDir}`
        ];
        return this.exec.execPromise(cmd, args, workDir);
    }

    public async srcDirHasError(
        sourceDir : string,
        workDir : string
    ) {
        let cmd = "cppcheck";
        let args = [
            "--force",
            `${sourceDir}`
        ];
        let buffer = this.exec.execSync(cmd,args);
    
        if (buffer.stderr.toString() === "") {
            return false;
        }
        else {
            return true;
        }
    }
}