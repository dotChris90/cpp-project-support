import {Executor} from './Executor';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export class Conan {
    private exec : Executor;
    constructor(
        exec : Executor
    ) {
        this.exec = exec;
    }
    public createNewProject(
        projectName: string,
        version: string, 
        templateName: string = "default",
        workDir: string = "") {
        workDir = (workDir === "") ? process.cwd() : workDir;
        let cmd = "conan";
        let args = [
            "new",
            `${projectName}/${version}`,
            "-m",
            templateName
        ];
        return this.exec.exec(cmd, args, workDir);
    }
    public async getProfiles() {
        let cmd = "conan";
        let args = [
            "profile",
            `list`,
        ];
        let profiles = await this.exec.execWithResult(cmd, args);
        return (["default"].concat(profiles.filter(text => text !== 'default')));
    }
    public async getProjectPackagesRecursive(
        projectRoot : string
    ) {
        let package_dot = path.join(fse.mkdtempSync(path.join(os.tmpdir(), 'cps-')),"package.dot");
        let cmd = "conan";
        let args = [
            "info",
            `${projectRoot}`,
            "-g",
            `${package_dot}`
        ];
        await this.exec.exec(cmd,args);
        let diagraph = fse.readFileSync(package_dot).toString().split("\n");
        fse.removeSync(package_dot);
        diagraph.splice(0,1);
        diagraph.splice(diagraph.length-1,1);
        diagraph.splice(diagraph.length-1,1);
        let packages = new Set<string>();
        diagraph.forEach( line => {
            let buffer = line.split("->");
            let leftPackage = buffer[0].trim();
            let rightPackage = buffer[1].trim();
            packages.add(leftPackage);
            packages.add(rightPackage);
        });
        let packages_array = Array.from(packages.values());
        let idx = packages_array.findIndex(package_idx => {
            return (package_idx.startsWith('"conanfile.py ('))
        });
        packages_array.splice(idx,1);
        for (var jdx = 0; jdx < packages_array.length; jdx++) {
            packages_array[jdx] = packages_array[jdx].replace('"','').replace('"','');
        }
        return packages_array;
    }
    public geneneratePackageTree(conanfile: string, dstFile: string) {
        let cmd = "conan";
        let args = [
            "info",
            conanfile,
            "-g",
            `${dstFile}.dot`
        ];
        return this.exec.exec(cmd, args);
    }
    public installDeps(
        buildProfile: string,
        hostProfile: string,
        buildType: string,
        workDir: string,
        conanfile: string = "..") {
        let cmd = "conan";
        let args = [
            "install",
            `-pr:h=${hostProfile}`,
            `-pr:b=${buildProfile}`,
            `-s build_type=${buildType}`,
            conanfile,
            '--build=missing'
        ];
        return this.exec.exec(cmd, args, workDir);
    }
    public deployDeps(
        buildProfile: string,
        hostProfile: string,
        buildType: string,
        workDir: string,
        conanfile: string = "..") {
        let cmd = "conan";
        let args = [
            "install",
            "-g",
            "deploy",
            `-pr:h=${hostProfile}`,
            `-pr:b=${buildProfile}`,
            `-s build_type=${buildType}`,
            conanfile,
            '--build=missing'
        ];
        return this.exec.exec(cmd, args, workDir);
    }
    public deployTool(
        toolName: string,
        version: string,
        dstFolder: string) : Promise<any> {
        let cmd = "conan";
        let args = [
            "install",
            "-g",
            "deploy",
            `${toolName}/${version}@_/_`,
            "--build=missing"
        ];
        return this.exec.exec(cmd,args,dstFolder);
    }
    public buildProject(
        conanfile: string = "..", 
        workDir: string) {
        let cmd = "conan";
        let args = [
            "build",
            conanfile
        ];
        return this.exec.exec(cmd, args, workDir);
    }
    public createPackage(
        buildProfile: string,
        hostProfile: string,
        buildType: string,
        workDir: string,
        conanfile: string = "..",
    ) {
        let cmd = "conan";
        let args = [
            "create",
            `-pr:h=${hostProfile}`,
            `-pr:b=${buildProfile}`,
            `-s build_type=${buildType}`,
            conanfile,
            '--build=missing'
        ];
        return this.exec.exec(cmd, args, workDir);
    }
    public async getRequirements(
        pkgName : string, 
        version : string, 
        workDir : string) {
        let cmd = "conan";
        let args = [
                "info",
                `${pkgName}/${version}@_/_`,
                "-n",
                "requires"
            ];
        let out = await this.exec.execWithResult(cmd,args,workDir);   
        let pkgIdx = out.indexOf(`${pkgName}/${version}`) + 2; 
        let packages = [];
        while (pkgIdx < out.length) {
            if (!out[pkgIdx+1].startsWith(' ')) {
                packages.push(out[pkgIdx].trim().trimEnd());
                break;
            } 
            packages.push(out[pkgIdx].trim().trimEnd());
            pkgIdx++;
        }                        
        return packages;
    }
    public async getProjectRequirementsSync(projDir : string) {

        let pkgName = this.getNameSync(".",projDir);
        let version = this.getVersionSync(".",projDir);
        let cmd = "conan";
        let args = [
                "info",
                ".",
                "-n",
                "requires"
            ];
        let out = await this.exec.execWithResult(cmd,args,projDir);   
        let pkgIdx = out.indexOf(`conanfile.py (${pkgName}/${version})`) + 2; 
        let packages = [];
        while (pkgIdx < out.length) {
            packages.push(out[pkgIdx].trim().trimEnd());
            pkgIdx++;
        }                        
        return packages;
    }
    public inspect(
        conanfileOrPkgName : string,
        workDir : string
    ) {
        let cmd = "conan";
        let args = [
            "inspect",
            `${conanfileOrPkgName}`
        ];
        return this.exec.execWithResult(cmd,args,workDir);
    }
    public async getNameSync(
        conanFile : string,
        workDir : string
    ) {
        let cmd = "conan";
        let args = [
            "inspect",
            "-a",
            "name",
            `${conanFile}`,
        ];
        let name_ = await this.exec.execWithResult(cmd, args, workDir);
        let name = name_[0].substring(6);
        return `${name}`;
    }
    public async getName(
        conanFile : string,
        workDir : string
    ) {
        let cmd = "conan";
        let args = [
            "inspect",
            "-a",
            "name",
            `${conanFile}`,
        ];
        let name_ = await this.exec.execWithResult(cmd, args, workDir);
        let name = name_[0].substring(6);
        return `${name}`;
    }

    public async getVersionSync(
        conanFile : string,
        workDir : string
    ) {
        let cmd = "conan";
        let args = [
            "inspect",
            "-a",
            "version",
            `${conanFile}`,
        ];
        let version_ = await this.exec.execWithResult(cmd, args, workDir);
        let version = version_[0].substring(9);
        return `${version}`;
    }
    public async getVersion(
        conanFile : string,
        workDir : string
    ) {
        let cmd = "conan";
        let args = [
            "inspect",
            "-a",
            "version",
            `${conanFile}`,
        ];
        let version_ = await this.exec.execWithResult(cmd, args, workDir);
        let version = version_[0].substring(9);
        return `${version}`;
    }
    public async getTemplates(

    ) {
        let templateDir = path.join(
                os.homedir(),
                ".conan",
                "templates",
                "command",
                "new"
        );
        return fse.readdirSync(templateDir);
    }

    public async packageIsLocalPresent(
        packageName : string
    ) {
        let cmd = "conan";
        let args = [
            "search",
            `${packageName}`
        ];
        let anwser = (await this.exec.execWithResult(cmd,args)).join("\n");
        return !(anwser.startsWith("There are no packages matching the"));
    }

    public async getPackageTargets(
        packageName : string,
        outFile : string
    ) : Promise<Map<string,string[]>> {
        let conanfilePath = path.join(fse.mkdtempSync(path.join(os.tmpdir(), 'targetDetermination-')),"conanfile.py");
        let randomPkgName = path.basename(path.dirname(conanfilePath));

       let outMap : Map<string,string[]> = new  Map<string,string[]>();
       let conanfileContent = `from json import tool
from conans import ConanFile
from conans import tools
from conan.tools.cmake import CMakeToolchain, CMake, CMakeDeps
from conan.tools.layout import cmake_layout
        
class AbcConan(ConanFile):
        
    name = "BLABLABLA"
    version = "0.0.1"
    license = "<Put the package license here>"
    author = "<Put your name here> <And your email here>"
    url = "<Package recipe repository url here, for issues about the package>"
    description = "<Description of Abc here>"
    topics = ("<Put some tag here>", "<here>", "<and here>")
    settings = "os", "compiler", "build_type", "arch"
    options = {"shared": [True, False], "fPIC": [True, False]}
    default_options = {"shared": False, "fPIC": True}
    exports_sources = "CMakeLists.txt", "src/*"
        
    def config_options(self):
        if self.settings.os == "Windows":
            del self.options.fPIC
        
    def requirements(self):
        self.requires("BLUBLU")
        
    def layout(self):
        cmake_layout(self)
        
    def generate(self):
        tc = CMakeToolchain(self)
        tc.generate()
        cmake = CMakeDeps(self)
        cmake.generate()
        
    def build(self):
        cmake = CMake(self)
        cmake.configure()
        cmake.build()
        
    def package(self):
        cmake = CMake(self)
        cmake.install()
        
    def package_info(self):
        self.cpp_info.libs = tools.collect_libs(self)`.replace("BLABLABLA",randomPkgName)
                                                      .replace("BLUBLU",packageName);
            fse.writeFileSync(conanfilePath,conanfileContent);
            let buildDir = path.join(path.dirname(conanfilePath),"build");
            fse.mkdirpSync(buildDir);

            let cmd = "conan";
            let args = [
                "install",
                "-pr:h=default",
                "-pr:b=default",
                ".."
            ];
            await this.exec.exec(cmd,args,buildDir);
            let targetFiles = fse.readdirSync(path.join(buildDir,"generators"))
                                 .filter(file => file.endsWith("Targets.cmake"));
            
            let targets = [];    
            
            for(var idx = 0; idx < targetFiles.length;idx++) {
                
                let targetFile = targetFiles[idx];
                targetFile = path.basename(targetFile);
                targetFile = targetFile.substring(0,targetFile.length-"Targets.cmake".length);
        
                let cmakefileContent = `cmake_minimum_required(VERSION 3.15)
project(abc CXX)
find_package(BLABLA REQUIRED)`.replace("BLABLA",targetFile);

                let cmakefilePath = path.join(path.dirname(buildDir),"CMakeLists.txt");
                fse.writeFileSync(cmakefilePath,cmakefileContent);
                args = [
                    "build",
                    ".."
                ];
                let target_jdx = "";
                let targets_idx : string[] = [];
                let results = await this.exec.execWithResult(cmd,args,buildDir);
                for(var jdx =0; jdx < results.length; jdx++) {
                    if (results[jdx].startsWith('-- Conan: Target declared ')) {
                        target_jdx = results[jdx].replace('-- Conan: Target declared ','')
                                                 .replaceAll("'","");
                        targets_idx.push(target_jdx);
                        targets.push(target_jdx);
                    }
                    else if (results[jdx].startsWith('-- Conan: Component target declared ')) {
                        target_jdx = results[jdx].replace('-- Conan: Component target declared ','')
                                                 .replaceAll("'","");
                        targets_idx.push(target_jdx);
                        targets.push(target_jdx);
                    }
                    else {
                        // pass
                    }
                }
                outMap.set(targetFile,targets_idx);
            }

            let targets_txt_content = `targets of package '${packageName}' \n`;
            if (outFile != "") {
                let targets_txt_file = outFile;

                for(var idx = 0; idx < targets.length;idx++) {
                    targets_txt_content = targets_txt_content + "- " + targets[idx] + " \n";
                }
                
                fse.writeFileSync(targets_txt_file,targets_txt_content);
            }
            // tidy up --> remove tmp conan package dir
            fse.removeSync(path.dirname(conanfilePath));

            return outMap;
    }

    public async getProjectTargets(
        prjRoot : string,
        outDir : string = "",
    ) : Promise<Map<string,string[]>> {
        let outMap : Map<string,string[]> = new Map<string,string[]>();
        let packages = await this.getProjectPackagesRecursive(prjRoot);
        for (var idx = 0; idx < packages.length;idx++) {
            let package_idx = packages[idx];
            let outMap_ = new Map<string,string[]>();
            if (outDir != "") {
                let outFile = path.join(outDir,"targets_" + package_idx.replaceAll("/","_").replaceAll(".","_") + ".txt");
                outMap_ = await this.getPackageTargets(package_idx,outFile);
            }
            else {
                outMap_ = await this.getPackageTargets(package_idx,"");
            }
            outMap = new Map([...Array.from(outMap.entries()), ...Array.from(outMap_.entries())]);
        };
        return outMap;
    }
}