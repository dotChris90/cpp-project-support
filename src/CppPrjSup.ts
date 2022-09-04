import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as commandExists from 'command-exists';
import * as yaml from 'yaml';
import * as glob from 'glob';

import {CPSYaml} from './CPSYaml';
import * as Utils from './Utils';
import {Conan} from './Conan';
import {Conanfile} from './Conanfile';
import {CMake} from './CMake';
import {Dot} from './Dot';
import {IMsgCenter} from './IMsgCenter';
import {Executor} from './Executor';
import {CppCheck} from './CppCheck';
import {Metrixpp} from './Metrixpp';
import {Config} from './Config';
import {Doxygen} from './Doxygen';
import {CodeGenerator} from './CodeGenerator';
import { urlToHttpOptions } from 'url';
import { timeStamp } from 'console';
import { stringify } from 'querystring';
import { CMakeLists } from './CMakelists';

export class CppPrjSup {

    private conan : Conan;
    private cmake : CMake;
    private cppcheck : CppCheck;
    private cppReportFile : string;
    private cppReportXMLFile : string;
    private cppReportHTMLDir : string;
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
    private deployDir : string;
    private cmakeBin : string;
    private cppcheckBin : string;
    private metrixpp : Metrixpp;
    private metrixppConfig : string;
    private metrixppViewFile : string;
    private doxygenConfig : string;
    private inspectAllFile : string;
    private conanDefaultTemplatePath : string;
    private codeGen : CodeGenerator;

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
        this.cppReportFile = path.join(this.toolDir,"cppcheck_report.txt");
        this.cppReportXMLFile = path.join(this.toolDir,"cppcheck_report.xml");
        this.cppReportHTMLDir = path.join(this.toolDir,"cppcheck_report_html");
        this.pkgDir = path.join(this.buildDir,config.pkgDir);
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
        this.metrixppViewFile = path.join(this.toolDir,"metrixpp_view.txt");
        this.inspectAllFile = path.join(this.toolDir, "inspect.txt");
        this.doxygenConfig = path.join(this.prjRoot,config.doxygenFile);
        this.deployDir = path.join(this.prjRoot,config.deployDir);
        this.conanDefaultTemplatePath = path.join(
            os.homedir(),
            ".conan",
            "templates",
            "command",
            "new",
            "default"
        );
        this.codeGen = new CodeGenerator(cppCodeDir);

        this.log.showHint("CPS check presents of tools and install local if not present");

        if (this.isPIP3Present()) {
            // ToDo : Find a way to avoid init tools with dummy
            let exec        = new Executor(msg);
            this.conan      = new Conan(exec);
            this.metrixpp   = new Metrixpp(exec);   
            this.cmake      = new CMake(exec,"");
            this.cppcheck   = new CppCheck(exec,"");
            this.doxygen    = new Doxygen(exec,"");
            this.dot        = new Dot(exec,"");

            this.installToolsIfNotPresent();
        }
        else {
            this.log.showError("command - pip3 not found - please install python3 and pip3");
            throw new Error("pip3 missing ...");
        }
    }   

    public async installToolsIfNotPresent() {
        
        let exec = new Executor(this.log);
        // Conan 
        this.installConanIfNotPresent(exec);
        this.conan = new Conan(exec);
        // metrixpp
        this.installMetrixppIfNotPresent(exec);
        this.metrixpp = new Metrixpp(exec);

        fse.mkdirpSync(this.toolDir);
        //CMake
        try {
            this.installCmakeIfNotPresent();
            if (commandExists.sync("cmake") ) {
                this.cmake = new CMake(exec,"cmake"); 
            }
            else {
                this.cmake = new CMake(exec,this.cmakeBin);
            }
        } catch(error ) {
            this.log.showError("Error when install cmake - please install manual");
            this.cmake = new CMake(exec,"");
        }
        //Cppcheck
        try {
            this.installCppCheckIfNotPresent();
            if (commandExists.sync("cppcheck") ) {
                this.cppcheck = new CppCheck(exec,"cppcheck"); 
            }
            else {
                this.cppcheck = new CppCheck(exec,this.cppcheckBin);
            }
        } catch(error ) {
            this.log.showError("Error when install cppcheck - please install manual");
            this.cppcheck = new CppCheck(exec,"");
        }
        //Doxygen
        try {
            this.installDoxyGenIfNotPresent();
            if (commandExists.sync("doxygen") ) {
                this.doxygen = new Doxygen(exec,"doxygen"); 
            }
            else {
                this.doxygen = new Doxygen(exec,this.doxygenBin);
            }
        } catch(error ) {
            this.log.showError("Error when install doxygen - please install manual");
            this.doxygen = new Doxygen(exec,"");
        }
        // Dot
        try {
            if (commandExists.sync("dot")) {
                this.dot = new Dot(exec,"dot");
            }
            else {
                throw Error("dot not present");
            }
        }
        catch (error) {
            this.log.showError("Error when install dot - please install manual");
            this.dot = new Dot(exec,"");   
        }
    }

    private isPIP3Present() {
        return commandExists.sync("pip3");
    }

    private async installConanIfNotPresent(exec : Executor) {
        if (!commandExists.sync("conan") ) {
            let cmd = "pip3";
            let args = [
                "install",
                "conan"
            ];
            await exec.exec(cmd,args);
            this.log.showHint(`install conan with pip3`);
        }
    }

    private async installMetrixppIfNotPresent(exec : Executor) {
        if (!commandExists.sync("metrixpp") ) {
            let cmd = "pip3";
            let args = [
                "install",
                "metrixpp"
            ];
            await exec.exec(cmd,args);
            this.log.showHint(`install metrixpp with pip3`);
        }
    }

    private async installCmakeIfNotPresent() {
        if (!commandExists.sync("cmake") || !fse.pathExistsSync(this.cmakePath)) {
            if (!await this.conan.packageIsLocalPresent("cmake/3.23.1")) {
                this.log.showHint("cmake is not globally present and not in conan cache...that will take some time.")    
            }
            this.log.showHint(`install local cmake - see ${this.cmakeBin}`);
            this.conan.deployTool('cmake','3.23.1',this.toolDir);
        }
    }
    private async installCppCheckIfNotPresent() {
        if (!commandExists.sync("cppcheck") || !fse.pathExistsSync(this.cppcheckPath)) {
            if (!await this.conan.packageIsLocalPresent("cppcheck/2.7.5")) {
                this.log.showHint("cppcheck is not globally present and not in conan cache...that will take some time.")    
            }
            this.log.showHint(`install local cppcheck - see ${this.cppcheckBin}`);
            this.conan.deployTool('cppcheck','2.7.5',this.toolDir);
        }
    }
    private async installDoxyGenIfNotPresent() {
        if (!commandExists.sync("doxygen") || !fse.pathExistsSync(this.doxygenPath)) {
            if (!await this.conan.packageIsLocalPresent("doxygen/1.9.1")) {
                this.log.showHint("doxygen is not globally present and not in conan cache...that will take some time.")    
            }
            this.log.showHint(`install local doxygen - see ${this.doxygenBin}`);
            this.conan.deployTool('doxygen','1.9.1',this.toolDir);
        }
    }

    public async newPrj() {
        let templates = await this.conan.getTemplates();
        let template = "default"
        if (templates.includes("default")) {
            // nothing to do 
        }
        else {
            let template_ = await this.log.pickFromList("Choose a template to start",templates);
            template = (template_ === undefined) ? "default" : template_!;
        } 
        this.log.askInput("Enter name/version for package","default/0.1.0").then(packageName => {
            let name = packageName?.split("/")[0]!;
            let version = packageName?.split("/")[1]!;
            return this.conan.createNewProject(name,version,template,this.prjRoot);
        }).then( () => {
            this.log.showHint("Project created.");
        });
    }

    public async importPackages(
    ) {
        this.log.clear();
    
        let profiles    = await this.conan.getProfiles();
        let profile_    = await this.log.pickFromList("Choose a profile",profiles);
        let profile     = (profile_ === undefined ) ? "default" : profile_!;
    
        let buildType_  = await this.log.pickFromList("Choose build type",["Debug","Release"]);
        let buildType   = (buildType_ === undefined) ? "Release" : buildType_!;
    
        // ToDo : Check
        //fse.mkdirpSync(this.pkgDir);
        //fse.removeSync(this.pkgDir);
        fse.mkdirpSync(this.pkgDir);
        await this.conan.deployDeps(profile,"default",buildType,this.pkgDir,path.join("..",".."));
        await this.conan.deployDeps(profile,"default",buildType,this.pkgDir,path.join("..","..","test_package"));

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
            profile     = (profile_ === undefined ) ? "default" : profile_!;
        }
        if (buildType === "") {
            let buildType_ = await this.log.pickFromList("Choose build type",["Debug","Release"]);
            buildType   = (buildType_ === undefined) ? "Release" : buildType_!;
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
        await this.cppcheck.generateReportText(this.srcRoot,this.cppReportFile,this.buildDir);
        let hasError = await this.reportHasError();
        if (hasError) {
            this.log.showError(`oh oh build failed - your project has an error - check ${this.cppReportFile}`);
            this.log.showTxt(this.cppReportFile);
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

    public async generateCppCheckTextReport() {
        this.log.clear();
        await this.cppcheck.generateReportText(this.srcRoot,this.cppReportFile,this.buildDir);
        let hasError = await this.reportHasError();
        if (hasError) {
            this.log.showError(`oh oh - your project has an error - check ${this.cppReportFile}`);
        }
        else {
            this.log.showHint('All good!');
        }
        this.log.showTxt(this.cppReportFile);
    }

    public async generateCppCheckHtmlReport() {
        this.log.clear();
        await this.cppcheck.generateReportText(this.srcRoot,this.cppReportFile,this.buildDir);
        let hasError = await this.reportHasError();
        await this.cppcheck.generateReportXML(this.srcRoot,this.cppReportXMLFile,this.buildDir);
        await this.cppcheck.convertXML2HTml(this.srcRoot,this.cppReportXMLFile,this.cppReportHTMLDir,this.buildDir);
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
        
        ) {

        let profiles = await this.conan.getProfiles();
        let profile_ = await this.log.pickFromList("Choose Profile",profiles);
        let profile = profile_!;

        let buildType_ = await this.log.pickFromList("Choose build type",["Debug","Release"]);
        let buildType = buildType_!;
            
        await this.conan.createPackage(profile, "default", buildType,this.buildDir,this.conanFile);
        fse.mkdirpSync(this.deployDir);
        let packageName = await this.getPackageName();
        let packageVersion = await this.getPackageVersion();
        let deployDir = path.join(this.deployDir,`${profile}-${buildType}`);
        fse.mkdirpSync(deployDir);
        let packageDir = path.join(deployDir,packageName);
        if (fse.pathExistsSync(packageDir)) {
            fse.removeSync(packageDir);
        }
        this.conan.deployTool(packageName,packageVersion,deployDir);


        this.log.showHint(`Package deployed at ${deployDir}`);

        let packageFolders = [
            "bin",
            "include",
            "lib",
            "res"
        ];

        let packages = fse.readdirSync(deployDir, { withFileTypes: true })
                          .filter(dirent => dirent.isDirectory())
                          .filter(dirent => dirent.name != "all")
                          .map(dirent => path.join(deployDir,dirent.name));

        for(var idx = 0; idx < packageFolders.length;idx++) {
            let folder = packageFolders[idx];
            let folder_full = path.join(deployDir,"all",folder);
            fse.mkdirpSync(folder_full);
            for(var jdx = 0; jdx < packages.length;jdx++) {
                let package_ = packages[jdx];
                let package_folder = path.join(package_,folder);
                if (fse.existsSync(package_folder)) {
                    fse.copySync(package_folder,folder_full);
                }
            }
        }    
        let a = 5;
    }

    public async generateMethodBody() {
        this.log.clear();
        let selectedTxt = (await this.log.getSelectedEditorText()).replace(/  +/g, ' ').replaceAll(";","");
        let file = await this.log.getSelectedTreeItem();
        if (file.includes(this.srcRoot)) {
            let file_rel = file.substring(this.srcRoot.length+1);
            file_rel = file_rel.substring(0,file_rel.length-4);
            let fullClassName = file_rel.replaceAll("/","::");
            let splitted = fullClassName?.split("::");
            let className = splitted[splitted?.length-1];
            splitted.splice(splitted?.length-1,1);
            let namespace = splitted.join("::");
            this.codeGen.generateMethodBody(namespace,className,selectedTxt,file.replace(".hpp",".cpp"));
        }
        else {
        }

        let a = 5;
    }

    public async createMetrix(

    ) {
        await this.metrixpp.collect(this.metrixppConfig,"src");
        this.metrixpp.view(path.join(this.prjRoot,"metrixpp.db"),this.metrixppViewFile);
        this.log.showTxt(this.metrixppViewFile);
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
        fse.mkdirpSync(path.dirname(this.conanDefaultTemplatePath));
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

    public async inspectAllPkgOptions(
    ) {
        this.log.showHint("All depending packages of this project are inspected - that take some time.")
        let packages = await this.conan.getProjectPackagesRecursive(this.prjRoot);
        let inspectResult = await this.conan.inspect(this.prjRoot,this.prjRoot);
        inspectResult.push("");
        inspectResult.push("");

        for( let package_idx of packages) {
            let inspect_idx = await this.conan.inspect(package_idx,this.prjRoot);
            inspect_idx.push("");
            inspect_idx.push("");
            inspectResult = inspectResult.concat(inspect_idx);
        }
        var file = fse.createWriteStream(this.inspectAllFile);
        file.on('error', function(err) { /* error handling */ });
        inspectResult.forEach((v) => { file.write(v + '\n'); });
        file.end();
        this.log.showTxt(this.inspectAllFile);
    }
    public async generateInterface() {
        this.log.clear();
        let fullClassName_ = await this.log.askInput("Enter interface class name","A::B::C::ClassName");
        let fullClassName = fullClassName_!;
        let splitted = fullClassName?.split("::");
        let className = splitted[splitted?.length-1];
        let filePath = path.join(this.srcRoot,splitted.join(path.sep)) + ".hpp";
        splitted.splice(splitted?.length-1,1);
        let namespace = splitted.join("::");
        this.codeGen.generateInterface(
            namespace,
            className,
            filePath
        );

        let fullImpClassName_ = await this.log.askInput("Enter implementation class name","A::B::C::ClassName");
        let fullImpClassName = fullImpClassName_!;
        let splittedImp = fullImpClassName?.split("::");
        let classImpName = splittedImp[splittedImp?.length-1];
        let fileImpPath = path.join(this.srcRoot,splittedImp.join(path.sep));
        splittedImp.splice(splittedImp?.length-1,1);
        let namespaceImp = splittedImp.join("::");
        splitted.push(className);
        this.codeGen.generateInterfaceImplementation(
            namespaceImp,
            classImpName,
            fileImpPath,
            namespace + "::" + className,
            splitted.join('/') + '.hpp'
        );
    }
    public async generateInterfaceInTreeView() {
        this.log.clear();
        let file = await this.log.getSelectedTreeItem();
        if (fse.lstatSync(file).isFile()) {
            if (file.includes(this.srcRoot)) {
                let file_rel = file.substring(this.srcRoot.length+1);
                file_rel = file_rel.substring(0,file_rel.length-4);
                let fullClassName = file_rel.replaceAll("/","::");
                let splitted = fullClassName?.split("::");
                let className = splitted[splitted?.length-1];
                let filePath = path.join(this.srcRoot,splitted.join(path.sep)) + ".hpp";
                splitted.splice(splitted?.length-1,1);
                let namespace = splitted.join("::");
                this.codeGen.generateInterface(
                    namespace,
                    className,
                    filePath
                );
            }
            else {
            }
        }
        else {
            this.log.showError(`selected item ${file} is directory not file!`);
        }
    }
    public async generateFullClasInTreeView() {
        this.log.clear();
        let file = await this.log.getSelectedTreeItem();
        if (fse.lstatSync(file).isFile()) {
            if (file.includes(this.srcRoot)) {
                let file_rel = file.substring(this.srcRoot.length+1);
                file_rel = file_rel.substring(0,file_rel.length-4);
                let fullClassName = file_rel.replaceAll("/","::");
                let splitted = fullClassName?.split("::");
                let className = splitted[splitted?.length-1];
                let filePath = path.join(this.srcRoot,splitted.join(path.sep));
                splitted.splice(splitted?.length-1,1);
                let namespace = splitted.join("::");
                this.codeGen.generateFullClass(
                    namespace,
                    className,
                    filePath
                );
            }
            else {
            }
        }
        else {
            this.log.showError(`selected item ${file} is directory not file!`);
        }
    }

    public async generateStruct() 
    {
        this.log.clear();
        let file = await this.log.getSelectedTreeItem();
        if (fse.lstatSync(file).isFile()) {
            if (file.includes(this.srcRoot)) {
                let file_rel = file.substring(this.srcRoot.length+1);
                file_rel = file_rel.substring(0,file_rel.length-4);
                let fullStructName = file_rel.replaceAll("/","::");
                let splitted = fullStructName?.split("::");
                let structName = splitted[splitted?.length-1];
                let filePath = path.join(this.srcRoot,splitted.join(path.sep)) + ".hpp";
                splitted.splice(splitted?.length-1,1);
                let namespace = splitted.join("::");
                this.codeGen.generateStruct(
                    namespace,
                    structName,
                    filePath
                );
            }
            else {
            }
        }
        else {
            this.log.showError(`selected item ${file} is directory not file!`);
        }
    }

    public async getPackageTargets(
    ) {
        let packageName = await this.log.askInput("Package Name",'ms-gsl/4.0.0');
        let targetsFile = path.join(this.toolDir,"targets.txt");
        await this.conan.getPackageTargets(packageName,targetsFile);
        this.log.showTxt(targetsFile);
    }

    public async getProjectTargets(

    ) {
        let prjFolder = path.join(this.toolDir,"project_targets");
        if (fse.existsSync(prjFolder)) {
            fse.removeSync(prjFolder);
        }
        fse.mkdirpSync(prjFolder);
        this.log.showHint(`targets of each package will be present at ${prjFolder}`);
        await this.conan.getProjectTargets(this.prjRoot,prjFolder);
        this.log.showHint("finish targets determination.");
    }

    public async getCMakePkgFromTargetAndConanPkgs(
        conanPkgs : string[],
        target : string
    ) {
        let pkgTargetName = "";
        let found = false;
        
        for(let pkg of conanPkgs) {
            let targetMap = await this.conan.getPackageTargets(pkg,"");
            for(let pkg of targetMap) {
                let pkgName = pkg[0];
                let targets = targetMap.get(pkgName)!;
                if (targets.includes(target)) {
                    pkgTargetName = pkgName;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
        
        return pkgTargetName;
    }

    public async generateConanfile(

    ) {
        let cpsFile = CPSYaml.buildFromCPSFile(path.join(this.prjRoot,"cps.yml"));
        let conanfile = new Conanfile();
        conanfile.name              = cpsFile.name;
        conanfile.version           = cpsFile.version;
        conanfile.author            = cpsFile.author
        
        conanfile.packages = cpsFile.getJustPackages();

        let optionNames = cpsFile.getOptionsNames();

        for(var idx = 0; idx < optionNames.length;idx++) {
            let optionName = optionNames[idx];
            let optionValues = "[" + cpsFile.getAllOptionsWithoutDefault(optionName).join(",") + "]";
            let optionDefault = cpsFile.getDefaultOfOption(optionName);
            conanfile.selfOptions.push(`options["${optionName}"] = ${optionValues}`);
            conanfile.defaultSelfOption.push(`default_options["${optionName}"] = ${optionDefault}`);
        }

        for (var idx = 0; idx < conanfile.packages.length;idx++) {
            let package_ = conanfile.packages[idx];
            let packageName = package_.split("/")[0];
            let pkgMap = cpsFile.packages.get(package_)!;
            let opts = cpsFile.getOptionsOfPackage(package_);
            for (var jdx = 0; jdx < opts.length;jdx++) {
                conanfile.options.push(`${packageName}::${opts[jdx]}=${pkgMap.get(opts[jdx]!)}`);
            } 
        }
        
        let conanfilePath = path.join(this.prjRoot,"conanfile.py");
        if (fse.existsSync(conanfilePath)) {
            if (fse.existsSync(conanfilePath + ".copy")) {
                fse.removeSync(conanfilePath + ".copy");
            }
            fse.moveSync(conanfilePath,conanfilePath + ".copy");
        } 
        conanfile.generateFile(conanfilePath);    
    }

    public async addPackageToCPSYML(

    ) {

    }

    public async addSrcFiles(

    ) {
        let cpsFile = CPSYaml.buildFromCPSFile(path.join(this.prjRoot,"cps.yml"));
        let targets = cpsFile.getTargets();

        if (targets.length === 0) {
            this.log.showError("No targets present in cps.yml - please add one");
            return;
        }

        let selectedTarget = await this.log.pickFromList("Choose target to add source files",targets); 

        let srcs = Utils.FileSearch.SearchRecursive([
            "**/**/*.cpp",
            "**/**/*.cc",
            "**/**/*.c"
        ],this.srcRoot);

        Utils.Path.AddFolderEachElement(srcs,path.basename(this.srcRoot));

        let buffer = cpsFile.getSrc(selectedTarget);
        srcs = Utils.ArrayUtils.Diff(srcs,buffer);
        
        let selectedItems = await this.log.pickFromListMulti("Select *.cpp or *.c or *.cc files to add ",srcs);

        for(let element of selectedItems)
            buffer.push(element);
        
        cpsFile.setSrc(selectedTarget, Utils.SetUtils.FromArray(buffer));

        let ymlContent = cpsFile.ToYmlFileContent();

        fse.writeFileSync(path.join(this.prjRoot,"cps.yml"),ymlContent);
    }  

    public async addIncFiles(

    ) {
        let cpsFile = CPSYaml.buildFromCPSFile(path.join(this.prjRoot,"cps.yml"));
        let targets = cpsFile.getLibraries();

        if (targets.length === 0) {
            this.log.showError("No lib present in cps.yml - please add one");
            return;
        }

        let selectedTarget = await this.log.pickFromList("Choose lib to add header files",targets); 

        let srcs = Utils.FileSearch.SearchRecursive([
            "**/**/*.hpp",
            "**/**/*.h"
        ],this.srcRoot);

        Utils.Path.AddFolderEachElement(srcs,path.basename(this.srcRoot));

        let buffer = cpsFile.getInc(selectedTarget);
        srcs = Utils.ArrayUtils.Diff(srcs,buffer);
        
        let selectedItems = await this.log.pickFromListMulti("Select *.hpp or *.h files to add ",srcs);

        for(let element of selectedItems)
            buffer.push(element);
        
        cpsFile.setIncs(selectedTarget, Utils.SetUtils.FromArray(buffer));
        
        let ymlContent = cpsFile.ToYmlFileContent();

        fse.writeFileSync(path.join(this.prjRoot,"cps.yml"),ymlContent);
    }

    public async addTargetsToCPSYML(

    ) {
        let cpsFile = CPSYaml.buildFromCPSFile(path.join(this.prjRoot,"cps.yml"));
        let targets = cpsFile.getTargets();

        let selectedTarget = await this.log.pickFromList("Select target",targets);
        
        let outMap = new Map<string,string[]>();
        let packages = cpsFile.getJustPackages();
        targets = [];
        for(let package_ of packages) {
            outMap = await this.conan.getPackageTargets(package_,"");
            targets = targets.concat(Utils.MapUtils.GetValuesFlat(outMap));
        }

        let buffer = cpsFile.getTargetLinks(selectedTarget);
        targets = Utils.ArrayUtils.Diff(targets,buffer);
         
        let selected_libs = await this.log.pickFromListMulti(`Select libs for ${selectedTarget}`,targets);
        buffer = buffer.concat(selectedTarget);

        cpsFile.setTargetLinks(selectedTarget,Utils.SetUtils.FromArray(selected_libs));

        let ymlContent = cpsFile.ToYmlFileContent();

        fse.writeFileSync(path.join(this.prjRoot,"cps.yml"),ymlContent);
        
    }

    public async addConanPackage(
    
        ){
            let cpsFile = CPSYaml.buildFromCPSFile(path.join(this.prjRoot,"cps.yml"));
            let searchPattern = await this.log.askInput("Enter Conan search pattern to search for package","iceoryx/*");
            let packages = await this.conan.search(searchPattern);
            if (packages.length === 0) {
                this.log.showError("No package found ... try again.");
                return;
            }
            let existPkgs = cpsFile.getJustPackages();
            packages = Utils.ArrayUtils.Diff(packages,existPkgs);
            let selectedPkgs = await this.log.pickFromList("Select package to add",packages);

            cpsFile.packages.set(selectedPkgs,new Map<string,string>());

            let ymlContent = cpsFile.ToYmlFileContent();
            fse.writeFileSync(path.join(this.prjRoot,"cps.yml"),ymlContent);
    }

    public async generateCMakeFile(

    ) {
        let cpsFile = CPSYaml.buildFromCPSFile(path.join(this.prjRoot,"cps.yml"));
        let cmakelists = new CMakeLists();
        cmakelists.name              = cpsFile.name;
        cmakelists.version           = cpsFile.version;
        
        for(let exe of cpsFile.executables) {
            let exeName = exe[0];
            cmakelists.executables.set(exeName,cpsFile.getSrc(exeName));
            cmakelists.targetLinkLibraries.set(exeName,cpsFile.getTargetLinks(exeName));
        }
        for(let lib of cpsFile.libraries) {
            let libName = lib[0];
            cmakelists.libraries.set(libName,cpsFile.getSrc(libName));
            cmakelists.publicHeaders.set(libName,cpsFile.getInc(libName));
            cmakelists.targetLinkLibraries.set(libName,cpsFile.getTargetLinks(libName));
        }        

        let find_pkg = new Set<string>();
        for(let target of cmakelists.targetLinkLibraries) {
            let targetName = target[0];
            let libs = cmakelists.targetLinkLibraries.get(targetName)!;
            for (let lib of libs) {
                
                if ((await cmakelists.getLibsNames()).includes(lib)) {
                    // pass
                }
                else {
                    find_pkg.add(await this.getCMakePkgFromTargetAndConanPkgs(cpsFile.getJustPackages(), lib));
                }
            } 
        }
        if (find_pkg.has("")) {
            find_pkg.delete("");
        }
        for(let pkg of find_pkg) {
            cmakelists.findPackage.push(pkg);
        }

        let cmakefilePath = path.join(this.prjRoot,"CMakeLists.txt");
        if (fse.existsSync(cmakefilePath)) {
            if (fse.existsSync(cmakefilePath + ".copy")) {
                fse.removeSync(cmakefilePath + ".copy");
            }
            fse.moveSync(cmakefilePath,cmakefilePath + ".copy");
        } 
        cmakelists.generateFile(cmakefilePath);
    }

}