import * as fse from 'fs-extra';
import * as path from 'path';

import {Conan} from './Conan';
import {CMake} from './CMake';
import {IMsgCenter} from './IMsgCenter';
import {Executor} from './Executor';
import {ConanCodeGen} from './CodeGeneration/ConanCodeGen';
import {CMakeCodeGen} from './CodeGeneration/CMakeCodeGen';
import {tools} from './config/tools';

export class CppPrjSup {

    private conan : Conan;
    private cmake : CMake;
    private prjRoot : string;
    private incDir : string;
    private testDir : string;
    private buildDir : string;
    private toolDir : string;
    private pkgDir : string;
    private log : IMsgCenter;

    constructor(
        msg: IMsgCenter,
        prjRoot : string) {
        
        if (!fse.pathExistsSync(prjRoot)) {
        }

        this.prjRoot = prjRoot;
        this.buildDir = path.join(prjRoot,".cps");
        this.toolDir = path.join(this.buildDir,"tools");
        this.pkgDir = path.join(this.buildDir,"pkgs");
        this.incDir = path.join(this.buildDir,"include");
        this.testDir = path.join(prjRoot,"test_package");
        this.log = msg;

        let exec = new Executor(msg);
        this.conan = new Conan(exec, new ConanCodeGen(this.prjRoot));
        this.cmake = new CMake(exec, new CMakeCodeGen());
    }   
 
    public async setupTools() {
        this.log.showHint('Installing local : doxygen, cmake, cppcheck');
        fse.mkdirpSync(this.toolDir);
        await this.conan.deployTool('doxygen','1.9.1',this.toolDir);
        await this.conan.deployTool('cmake','3.23.1',this.toolDir);
        await this.conan.deployTool('cppcheck','2.7.5',this.toolDir);
    }
    
    public newPrj(
        name : string,
        version : string ) {
        return this.conan.createNewProject(name,version,"default",this.prjRoot);
    }

    public async importPackages() {
        this.log.clear();
        fse.mkdirpSync(this.pkgDir);
        await this.conan.deployDeps("default","default","Release",this.pkgDir,path.join("..",".."));
        await this.conan.deployDeps("default","default","Release",this.pkgDir,path.join("..","..","test_package"));

        let packages = fse.readdirSync(this.pkgDir, { withFileTypes: true })
                          .filter(dirent => dirent.isDirectory())
                          .filter(dirent => !(dirent.name === "include"))
                          .map(dirent => dirent.name);
        
        fse.mkdirpSync(this.incDir);                
        packages.forEach(packageIdx => {
                    let includeIdx = path.join(this.pkgDir, packageIdx, "include");
                    if (fse.existsSync(includeIdx)){
                        fse.copySync(includeIdx, path.join(this.pkgDir, "include"));
                    }
                });
    }

    public async installDeps() {
        this.log.clear();
        fse.mkdirpSync(this.pkgDir);
        await this.conan.installDeps("default","default","Release",this.buildDir,path.join(".."));
        await this.conan.installDeps("default","default","Release",this.buildDir,path.join("..","test_package"));
    }

    public async build() {
        await this.conan.buildProject(path.join(".."),this.buildDir);
    }

}