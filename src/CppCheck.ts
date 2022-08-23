// cppcheck --force --enable=all --output-file=report.txt ../src/
import {Executor} from './Executor';

export class CppCheck {
    private exec : Executor;
    private cppCheckBin : string;
    constructor(
        exec : Executor,
        cppCheckBin : string
    ) {
        this.exec = exec;
        this.cppCheckBin = cppCheckBin;
    }
    public generateReportXML(
        sourceDir : string,
        reportFile : string,
        workDir : string
    ) {
        let cmd = this.cppCheckBin;
        let args = [
            "--force",
            "--enable=all",
            "--xml",
            "--xml-version=2",
            `--output-file=${reportFile}`,
            `${sourceDir}`
        ];
        return this.exec.exec(cmd, args, workDir);
    }
    public convertXML2HTml(
        sourceDir : string,
        xmlReportFile : string,
        outDst : string,
        workDir : string 
    ) {
        //"cppcheck-htmlreport --source-dir=. --title=VIMs_SRC --file=report-src.xml --report-dir=VIMs_SRC"
        let cmd = this.cppCheckBin + "-htmlreport";
        let args = [
            `--source-dir=${sourceDir}`,
            `--file=${xmlReportFile}`,
            `--report-dir=${outDst}`
        ];
        return this.exec.exec(cmd, args, workDir);
    }
    public generateReportText(
        sourceDir : string,
        reportFile : string,
        workDir : string
    ) {
        let cmd = this.cppCheckBin;
        let args = [
            "--force",
            "--enable=all",
            `--output-file=${reportFile}`,
            `${sourceDir}`
        ];
        return this.exec.exec(cmd, args, workDir);
    }

    public async srcDirHasError(
        sourceDir : string,
        workDir : string
    ) {
        let cmd = this.cppCheckBin;
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