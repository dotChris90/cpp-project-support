import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as commandExists from 'command-exists';

import {Conan} from './Conan';
import {CMake} from './CMake';
import {Dot} from './Dot';
import {IMsgCenter} from './IMsgCenter';
import {Executor} from './Executor';
import {CppCheck} from './CppCheck';
import {Metrixpp} from './Metrixpp';
import {Config} from './Config';
import {Doxygen} from './Doxygen';

export class CppPrjSup {

    private conan : Conan;
    private cmake : CMake;
    private cppcheck : CppCheck;
    private cppReportFile : string;
    private dotFile : string;
    private svgFile : string;
    private packageTreeFile : string;
    private prjRoot : string;
    private conanFile : string;
    private cmakeFile : string;
    private srcRoot : string;
    private incDir : string;
    private testDir : string;
    private testBuildDir : string;
    private buildDir : string;
    private toolDir : string;
    private pkgDir : string;
    private log : IMsgCenter;
    private conanTemp : string;
    private conanBuildDir: string;
    private doxygen : Doxygen;
    private doxygenPath : string;
    private doxygenBin : string;
    private cmakePath : string;
    private cppcheckPath : string;
    private toolchainFile : string;
    private dot : Dot;
    private cmakeBin : string;
    private cppcheckBin : string;
    private metrixpp : Metrixpp;
    private metrixppConfig : string;
    private doxygenConfig : string;
    private conanDefaultTemplatePath : string;

    constructor(
        msg: IMsgCenter,
        cppCodeDir: string,
        prjRoot : string, 
        config : Config) {
        
        if (!fse.pathExistsSync(prjRoot)) {
        }

        this.prjRoot = prjRoot;
        this.conanFile = path.join(this.prjRoot,"conanfile.py");
        this.cmakeFile = path.join(this.prjRoot,"CMakeLists.txt");
        this.srcRoot = path.join(this.prjRoot,config.srcDir);
        this.buildDir = path.join(prjRoot,".cps");
        this.dotFile = path.join(this.buildDir,"target.dot");
        this.svgFile = path.join(this.buildDir,"target.svg");
        this.conanBuildDir = path.join(this.prjRoot,config.buildDir);
        this.toolchainFile = path.join(this.conanBuildDir,path.join("generators","conan_toolchain.cmake"));
        this.toolDir = path.join(this.buildDir,"tools");
        this.cppReportFile = path.join(this.toolDir,"cpp.report");
        this.pkgDir = path.join(this.buildDir,"pkgs");
        this.incDir = path.join(this.buildDir,"include");
        this.testDir = path.join(prjRoot,"test_package");
        this.testBuildDir = path.join(this.testDir,"build");
        this.packageTreeFile = path.join(this.buildDir,"package");
        this.log = msg;
        this.doxygenPath = path.join(this.toolDir,"doxygen");
        this.doxygenBin = path.join(this.doxygenPath,"bin","doxygen");
        this.cmakePath = path.join(this.toolDir,"cmake");
        this.cmakeBin = path.join(this.cmakePath,"bin","cmake");
        this.cppcheckPath = path.join(this.toolDir,"cppcheck");
        this.cppcheckBin = path.join(this.cppcheckPath,"bin","cppcheck");
        this.conanTemp = path.join(cppCodeDir,"conan_new_default");
        this.metrixppConfig = path.join(this.prjRoot,config.metrixppFile);
        this.doxygenConfig = path.join(this.prjRoot,config.doxygenFile);
        this.conanDefaultTemplatePath = path.join(
            os.homedir(),
            ".conan",
            "templates",
            "command",
            "new",
            "default"
        );

        let exec = new Executor(msg);
        this.conan = new Conan(exec);
        this.metrixpp = new Metrixpp(exec);
        
        fse.mkdirpSync(this.toolDir);
        //CMake
        this.installCmakeIfNotPresent();
        if (commandExists.sync("cmake") ) {
            this.cmake = new CMake(exec,"cmake"); 
        }
        else {
            this.cmake = new CMake(exec,this.cmakeBin);
        }
        // Cppcheck
        this.installCppCheckIfNotPresent();
        if (commandExists.sync("cppcheck")) {
            this.cppcheck = new CppCheck(exec,"cppcheck");
        }
        else {
            this.cppcheck = new CppCheck(exec,this.cppcheckBin);
        }
        // Doxygen
        this.installDoxyGenIfNotPresent();
        if (commandExists.sync("doxygen")) {
            this.doxygen = new Doxygen(exec,"doxygen");
        }
        else {
            this.doxygen = new Doxygen(exec,this.doxygenBin);
        }
        // Dot
        this.dot = new Dot(exec,"dot");
        
        if (!this.conanDefaultTemplateExists()) {
            this.importDefaultTemplate();
        }

    }   

    private async installCmakeIfNotPresent() {
        if (commandExists.sync("cmake") || !fse.pathExistsSync(this.cmakePath)) {
            this.log.showHint('install local cmake');
            await this.conan.deployTool('cmake','3.23.1',this.toolDir);
        }
    }
    private async installCppCheckIfNotPresent() {
        if (commandExists.sync("cppcheck") || !fse.pathExistsSync(this.cppcheckPath)) {
            this.log.showHint('install local cppcheck');
            await this.conan.deployTool('cppcheck','2.7.5',this.toolDir);
        }
    }
    private async installDoxyGenIfNotPresent() {
        if (commandExists.sync("doxygen") || !fse.pathExistsSync(this.doxygenPath)) {
            this.log.showHint('install local doxygen');
            await this.conan.deployTool('doxygen','1.9.1',this.toolDir);
        }
    }

    public newPrj() {
        this.log.askInput("Enter name/version for package","default/0.1.0").then(packageName => {
            let name = packageName?.split("/")[0]!;
            let version = packageName?.split("/")[1]!;
            return this.conan.createNewProject(name,version,"default",this.prjRoot);
        }).then( () => {
            this.log.showHint("Project created.");
        }); 
    }

    public async importPackages(
        profile : string = ""   
    ) {
        this.log.clear();
        if (profile === "") {
            let profile_ = await this.log.askInput("Choose a profile","default");
            profile = profile_!;
        }
        // ToDo : Check
        //fse.mkdirpSync(this.pkgDir);
        //fse.removeSync(this.pkgDir);
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
        this.log.showHint('Imported depending packages.');
    }

    public async installDeps(
        profile : string = "",
        buildType : string = ""
    ) {
        this.log.clear();
        if (profile === "") {
            let profiles = await this.conan.getProfiles();
            let profile_ = await this.log.pickFromList("Choose Profile",profiles);
            profile = profile_!;
        }
        if (buildType === "") {
            let buildType_ = await this.log.pickFromList("Choose build type",["Debug","Release"]);
            buildType = buildType_!;
        }
        // ToDo : Check
        //fse.mkdirpSync(this.conanBuildDir);
        //fse.removeSync(this.conanBuildDir);
        fse.mkdirpSync(this.conanBuildDir);
        await this.conan.installDeps(profile,"default",buildType,this.conanBuildDir,path.join(".."));
        await this.conan.installDeps(profile,"default",buildType,this.conanBuildDir,path.join("..","test_package"));
        this.log.showHint('Install depending packages.');
    }

    public async generatePackageTree() {
        this.log.clear();
        await this.conan.geneneratePackageTree(this.conanFile,this.packageTreeFile);
        await this.dot.generateSvgFromDot(`${this.packageTreeFile}.dot`,`${this.packageTreeFile}.svg`);
        this.log.showSVG(`${this.packageTreeFile}.svg`);
    }

    public async generateTargetTree() {
        this.log.clear();
        await this.installDeps("default","Release");
        await this.cmake.generateBuildFiles(this.cmakeFile,this.toolchainFile,"Release",this.conanBuildDir);
        await this.cmake.generateDot(this.conanBuildDir,this.cmakeFile,this.dotFile);
        await this.dot.generateSvgFromDot(this.dotFile,this.svgFile);
        this.log.showSVG(`${this.svgFile}`);
    }

    public async build() {
        this.log.clear();
        await this.cppcheck.generateReport(this.srcRoot,this.cppReportFile,this.buildDir);
        let hasError = await this.reportHasError();
        if (hasError) {
            this.log.showHint(`oh oh build failed - your project has an error - check ${this.cppReportFile}`);
        }
        else {
            await this.conan.buildProject(path.join(".."),this.conanBuildDir);
            this.log.showHint('build finish.');
        }
    }

    public async getRequirements(
        pkgName : string, 
        version : string, 
        workDir : string) {
            return this.conan.getRequirements(pkgName,version,workDir);
    }

    public getRequirementsOfProject() {
        let workDir = this.prjRoot;
        return this.conan.getProjectRequirementsSync(workDir);
    }

    public async createPkg() {
        this.log.clear();
        await this.conan.createPackage("default","default","Release",this.buildDir,"..");
        fse.mkdirpSync(path.join(this.prjRoot,"pkg"));    
    }

    public async generateCppCheckReport() {
        this.log.clear();
        await this.cppcheck.generateReport(this.srcRoot,this.cppReportFile,this.buildDir);
        let hasError = await this.reportHasError();
        if (hasError) {
            this.log.showHint(`oh oh - your project has an error - check ${this.cppReportFile}`);
        }
        else {
            this.log.showHint('All good!');
        }
    }

    public reportHasError() {
        this.log.clear();
        return this.cppcheck.srcDirHasError(this.srcRoot,this.buildDir);
    }

    public getPackageName() {
        return this.conan.getName(this.conanFile,this.buildDir);
    }

    public getPackageVersion() {
        return this.conan.getVersion(this.conanFile,this.buildDir);    
    }

    public async createPackageAndTest(
        profile : string = "default",
        buildType : string = "Debug"
    ) {
        fse.removeSync(this.testBuildDir);
        let buildType_ = await this.log.pickFromList("Choose build type",["Debug","Release"]);
        buildType = buildType_!;
        this.conan.createPackage(profile, "default", buildType,this.buildDir,this.conanFile).then( () => {
            let testBin = path.join(
                this.testBuildDir,
                fse.readdirSync(this.testBuildDir)[0],
                "bin",
                "pkg_test"
            );
            if (fse.existsSync(testBin)) {
                fse.linkSync(
                    testBin,
                    path.join(this.testBuildDir, "pkg_test")
                );
            }
        }
        );
        this.log.showHint(`Created Package`);
    }

    public clean(

    ) {
        fse.removeSync(this.conanBuildDir);
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
        this.log.showHint(`Package deployed at ${this.pkgDir}`);
    }

    public async createMetrix(

    ) {
        this.metrixpp.collect(this.metrixppConfig,"src");
        this.metrixpp.view(path.join(this.prjRoot,"metrixpp.db"),path.join(this.prjRoot,"metrixpp.view"));
    }

    public async createDocumentation(
    ) {
        fse.removeSync(path.join(this.prjRoot,"docs"));
        this.doxygen.generateDocumentation(this.doxygenConfig,this.prjRoot).then(
            () => {
                this.log.showHtml();
            }
        );
    }
    
    private conanDefaultTemplateExists() {
        return fse.existsSync(this.conanDefaultTemplatePath);
    }

    public async importDefaultTemplate(

    ) {
        if (this.conanDefaultTemplateExists()) {
            let overwrite_ = await this.log.pickFromList("Overwrite default template?",["yes","no"]);
            let overwrite = (overwrite_ === undefined) ? "yes" : overwrite_!;
            if (overwrite === "yes") {
                fse.removeSync(this.conanDefaultTemplatePath);
            }
        }
        fse.copySync(
            this.conanTemp,
            this.conanDefaultTemplatePath
        );
    }
}