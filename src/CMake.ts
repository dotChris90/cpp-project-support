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
    public getTargets(
        cmakeFile: string) {
        let buildDir = path.dirname(cmakeFile).concat('.build');
        fse.mkdirpSync(buildDir);
        let opts = this.exec.execPromise(
            'cmake', 
            ['..'],
            buildDir).then(x => {
                this.exec.execWithResult(
                    'cmake',
                    ['--build',
                     '.',
                    '--target',
                    'help'
                    ],
                    buildDir
                    );
            });
        return opts;    
    }
}