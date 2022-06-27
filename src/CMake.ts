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
    public async generateBuildFiles(
        cmakeFiles : string,
        toolchainFile : string,
        buildType : string,
        workDir : string
    ) {
        let cmd = "cmake";
        let args = [
            `--toolchain=${toolchainFile}`,
            `-DCMAKE_BUILD_TYPE=${buildType}`,
            `${path.dirname(cmakeFiles)}`
        ];
        return this.exec.execPromise(cmd, args,workDir);
        // cmake --toolchain=/tmp/abc/build/generators/conan_toolchain.cmake -DCMAKE_BUILD_TYPE=Release ..
    }
    public async generateDot(
        workDir : string,
        cmakeFiles : string,
        dstDotFile : string
    ){
        let cmd = "cmake";
        let args = [
            `-S`,
            `${path.dirname(cmakeFiles)}`,
            `--graphviz=${dstDotFile}`
        ];
        return this.exec.execPromise(cmd, args,workDir);
        // cmake -S .. --graphviz=graph.dot
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