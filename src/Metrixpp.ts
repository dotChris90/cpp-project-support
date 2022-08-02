import {Executor} from './Executor';
import * as commandExists from 'command-exists';
import * as fse from 'fs-extra';
import * as path from 'path';

export class Metrixpp {
    private exec : Executor;
    constructor(
        exec : Executor) {
        this.exec = exec;
        if (commandExists.sync("metrix++")) {
            let cmd = "pip3";
            let args = [
                "install",
                "metrixpp"
            ];
            this.exec.execSync(cmd,args);
        }
        else {
            // pass 
        }
    }
    public async collect(
        configFile : string,
        srcFolder : string
    ) {
        let cmd = "metrix++";
        let args = fse.readFileSync(configFile, 'utf-8').split("\n");
        args.unshift("collect");
        args.push(srcFolder);
        this.exec.execSync(cmd,args);
    }
    public view(
        dbFile : string,
        resultFile : string
    ) {
        let cmd = "metrix++";
        let args = [
            "view"
        ];
        let dbFolder = path.dirname(dbFile);
        let view = this.exec.execWithResultSync(cmd, args,dbFolder);
        fse.writeFileSync(resultFile,view);
    }
}