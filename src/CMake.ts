import {Executor} from './Executor';
import * as path from 'path';
import * as fse from 'fs-extra';

export class CMake {
    private exec : Executor;
    constructor(
        exec : Executor) {
        this.exec = exec;
    }
    public getAllCMakeOptions(
        cmakeFile: string) {
        let buildDir = path.dirname(cmakeFile).concat('.build');
        fse.mkdirpSync(buildDir);
        let opts = this.exec.execPromise(
            'cmake', 
            ['..'],
            buildDir).then(x => {
                this.exec.execWithResult(
                    'cmake',
                    ['-LA'],
                    buildDir
                    );
            });
        return opts;
    }
    public async getTargets(
        cmakeFile: string) {
        let cmakeDir = path.dirname(cmakeFile);
        let buildDir = path.join(cmakeDir,".cps","build")
        if (fse.pathExistsSync(buildDir)) {
            fse.removeSync(buildDir);
        }
        fse.mkdirpSync(buildDir);
        let cmd = "cmake";
        let args = [
            `${cmakeFile}`
        ];
        let _ = this.exec.execWithResultSync(cmd, args, buildDir);
        args = ['--build',
                     `${buildDir}`,
                    '--target',
                    'help'
                ];
        
        let targets = this.exec.execWithResultSync(cmd, args, buildDir);  
        return targets; 
    }
}