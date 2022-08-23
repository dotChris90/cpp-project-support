import {Executor} from './Executor';
import * as commandExists from 'command-exists';
import * as fse from 'fs-extra';
import * as path from 'path';

export class Metrixpp {
    private exec : Executor;
    constructor(
        exec : Executor) {
        this.exec = exec;
    }
    public async collect(
        configFile : string,
        srcFolder : string
    ) {
        let cmd = "metrix++";
        let args = fse.readFileSync(configFile, 'utf-8').split("\n");
        args.unshift("collect");
        args.push(srcFolder);
        await this.exec.execWithResult(cmd,args,path.dirname(configFile));
    }
    public async view(
        dbFile : string,
        resultFile : string
    ) {
        let cmd = "metrix++";
        let args = [
            "view"
        ];
        let dbFolder = path.dirname(dbFile);
        let view = await this.exec.execWithResult(cmd, args,dbFolder);
        if (fse.existsSync(resultFile)) {
            fse.removeSync(resultFile);
        }
        var file = fse.createWriteStream(resultFile);
        file.on('error', function(err) { /* error handling */ });
        view.forEach((v) => { file.write(v + '\n'); });
        file.end();
        //fse.writeFileSync(resultFile,view.toString());
    }
}