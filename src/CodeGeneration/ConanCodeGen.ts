import * as path from 'path';
import * as fse from 'fs-extra';

import * as Code from './Code';

export class ConanCodeGen {
    private prjRoot : string;
    private testDir : string;
    private conanfile : string;
    private cmakeFile : string;
    private mainFile : string;
    private greeterHeader : string;
    private greeterFile : string;
    private conanTestFile : string;
    private cmakeTestFile : string;
    private greeterTestFile : string;
    private mainTestFile : string;

    constructor(prjRoot : string) {
        this.prjRoot = prjRoot;
        this.testDir = path.join(this.prjRoot,"test_package");
        this.conanfile = path.join(this.prjRoot,"conanfile.py");
        this.cmakeFile = path.join(this.prjRoot,"CMakeLists.txt");
        this.mainFile = path.join(this.prjRoot,"src","main.cpp");
        this.greeterHeader = path.join(this.prjRoot,"src","Greeter.hpp");
        this.greeterFile = path.join(this.prjRoot,"src","Greeter.cpp");
        this.conanTestFile = path.join(this.prjRoot,"test_package","conanfile.py");
        this.cmakeTestFile = path.join(this.prjRoot,"test_package","CmakeLists.txt");
        this.greeterTestFile = path.join(this.prjRoot,"test_package","Greeter_test.cpp");
        this.mainTestFile = path.join(this.prjRoot,"test_package","main.cpp");
    }   
    generateProject() {
        
    } 
}