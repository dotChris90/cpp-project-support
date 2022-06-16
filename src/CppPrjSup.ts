import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

import {Conan} from './Conan';
import {CMake} from './CMake';
import {IMsgCenter} from './IMsgCenter';
import {Executor} from './Executor';
import {CppCheck} from './CppCheck';

export class CppPrjSup {

    private conan : Conan;
    private cmake : CMake;
    private cppcheck : CppCheck;
    private cppReportFile : string;
    private prjRoot : string;
    private conanFile : string;
    private srcRoot : string;
    private incDir : string;
    private testDir : string;
    private buildDir : string;
    private toolDir : string;
    private pkgDir : string;
    private log : IMsgCenter;
    private conanTemp : string;
    private conanBuildDir: string;
    private doxygenPath : string;
    private cmakePath : string;
    private cppcheckPath : string;

    constructor(
        msg: IMsgCenter,
        cppCodeDir: string,
        prjRoot : string) {
        
        if (!fse.pathExistsSync(prjRoot)) {
        }

        this.prjRoot = prjRoot;
        this.conanFile = path.join(this.prjRoot,"conanfile.py");
        this.srcRoot = path.join(this.prjRoot,"src");
        this.buildDir = path.join(prjRoot,".cps");
        this.conanBuildDir = path.join(this.prjRoot,"build");
        this.toolDir = path.join(this.buildDir,"tools");
        this.cppReportFile = path.join(this.toolDir,"cpp.report");
        this.pkgDir = path.join(this.buildDir,"pkgs");
        this.incDir = path.join(this.buildDir,"include");
        this.testDir = path.join(prjRoot,"test_package");
        this.log = msg;
        this.doxygenPath = path.join(this.toolDir,"doxygen");
        this.cmakePath = path.join(this.toolDir,"cmake");
        this.cppcheckPath = path.join(this.toolDir,"cppcheck");
        this.conanTemp = path.join(cppCodeDir,"conan_new_default");

        let exec = new Executor(msg);
        this.conan = new Conan(exec);
        this.cmake = new CMake(exec);
        this.cppcheck = new CppCheck(exec);

        fse.mkdirpSync(this.toolDir);
        this.installCmakeIfNotPresent();
        this.installCppCheckIfNotPresent();
        this.installDoxyGenIfNotPresent();
        
        this.setupTemplates();

    }   

    private async installCmakeIfNotPresent() {
        if (!fse.pathExistsSync(this.cmakePath)) {
            this.log.showHint('install local cmake');
            await this.conan.deployTool('cmake','3.23.1',this.toolDir);
        }
    }
    private async installCppCheckIfNotPresent() {
        if (!fse.pathExistsSync(this.cppcheckPath)) {
            this.log.showHint('install local cppcheck');
            await this.conan.deployTool('cppcheck','2.7.5',this.toolDir);
        }
    }
    private async installDoxyGenIfNotPresent() {
        if (!fse.pathExistsSync(this.doxygenPath)) {
            this.log.showHint('install local doxygen');
            await this.conan.deployTool('doxygen','1.9.1',this.toolDir);
        }
    }
    
    private async setupTemplates() {
        let conanTemplate = path.join(
            os.homedir(),
            ".conan",
            "templates",
            "command",
            "new",
            "default"
        );
        if (!fse.existsSync(conanTemplate)) {
            fse.copySync(
                this.conanTemp,
                conanTemplate
            );
        }
    }

    public newPrj(
        name : string,
        version : string ) {
        return this.conan.createNewProject(name,version,"default",this.prjRoot);
    }

    public async importPackages(
        profile : string = "default"   
    ) {

        this.log.clear();
        fse.mkdirpSync(this.pkgDir);
        fse.rmdirSync(this.pkgDir);
        fse.mkdirpSync(this.pkgDir);
        await this.conan.deployDeps(profile,"default","Release",this.pkgDir,path.join("..",".."));
        await this.conan.deployDeps(profile,"default","Release",this.pkgDir,path.join("..","..","test_package"));

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

    public async installDeps(
        profile : string = "default",
        buildType : string = "Release"
    ) {
        this.log.clear();
        fse.mkdirpSync(this.conanBuildDir);
        fse.rmdirSync(this.conanBuildDir);
        fse.mkdirpSync(this.conanBuildDir);
        await this.conan.installDeps(profile,"default",buildType,this.buildDir,path.join(".."));
        await this.conan.installDeps(profile,"default",buildType,this.buildDir,path.join("..","test_package"));
    }

    public async build() {
        this.log.clear();
        await this.conan.buildProject(path.join(".."),this.buildDir);
    }

    public async getRequirements(
        pkgName : string, 
        version : string, 
        workDir : string) {
            this.conan.getRequirements(pkgName,version,workDir);
    }

    public async createPkg() {
        this.log.clear();
        await this.conan.createPackage("default","default","Release",this.buildDir,"..");
        fse.mkdirpSync(path.join(this.prjRoot,"pkg"));    
    }

    public async generateCppCheckReport() {
        this.log.clear();
        await this.cppcheck.generateReport(this.srcRoot,this.cppReportFile,this.buildDir);
        return this.cppReportFile;
    }

    public sourceHasError() {
        this.log.clear();
        return this.cppcheck.srcDirHasError(this.srcRoot,this.buildDir);
    }

    public getPackageName() {
        return this.conan.getName(this.conanFile,this.buildDir);
    }

    public getPackageVersion() {
        return this.conan.getVersion(this.conanFile,this.buildDir);    
    }

    public createPackageAndTest(
        profile : string = "default",
        buildType : string = "Release"
    ) {
        return this.conan.createPackage(profile, "default", buildType,this.buildDir,this.conanFile);
    }

    public async deployProject(
        profile : string = "default",
        buildType : string = "Release"
        ) {
        await this.conan.createPackage(profile, "default", buildType,this.buildDir,this.conanFile);
        fse.mkdirpSync(this.pkgDir);
        let packageName = await this.getPackageName();
        let packageVersion = await this.getPackageVersion();
        let packageDir = path.join(this.pkgDir,packageName);
        if (fse.pathExistsSync(packageDir)) {
            fse.removeSync(packageDir);
        }
        this.conan.deployTool(packageName,packageVersion,this.pkgDir);   

        return packageDir;
    }
}