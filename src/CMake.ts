import {Executor} from './Executor';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as commandExists from 'command-exists';

export class CMake {
    private exec : Executor;
    private cmakeBin : string;
    constructor(
        exec : Executor,
        cmakeBin : string
    ) {
        this.exec = exec;
        this.cmakeBin = cmakeBin;
    }
    public getAllCMakeOptions(
        cmakeFile: string) {
        let buildDir = path.dirname(cmakeFile).concat('.build');
        fse.mkdirpSync(buildDir);
        // To Do : Check if this is correct
        let opts = this.exec.execWithResult(
            this.cmakeBin, 
            ['..'],
            buildDir).then(x => {
                this.exec.execWithResult(
                    this.cmakeBin,
                    ['-LA'],
                    buildDir
                    );
            });
        return opts;
    }
    public async generateBuildFiles(
        cmakeFiles : string,
        toolchainFile : string,
        buildType : string,
        workDir : string
    ) {
        let cmd = this.cmakeBin;
        let args = [
            `--toolchain=${toolchainFile}`,
            `-DCMAKE_BUILD_TYPE=${buildType}`,
            `${path.dirname(cmakeFiles)}`
        ];
        return this.exec.exec(cmd, args,workDir);
        // cmake --toolchain=/tmp/abc/build/generators/conan_toolchain.cmake -DCMAKE_BUILD_TYPE=Release ..
    }
    public async generateDot(
        workDir : string,
        cmakeFiles : string,
        dstDotFile : string
    ){
        let cmd = this.cmakeBin;
        let args = [
            `-S`,
            `${path.dirname(cmakeFiles)}`,
            `--graphviz=${dstDotFile}`
        ];
        return this.exec.exec(cmd, args,workDir);
        // cmake -S .. --graphviz=graph.dot
    }
    
}