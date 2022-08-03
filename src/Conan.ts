import {Executor} from './Executor';
import * as commandExists from 'command-exists';

export class Conan {
    private exec : Executor;
    constructor(
        exec : Executor
    ) {
        this.exec = exec;
        if (!commandExists.sync("conan")) {
            let cmd = "pip3";
            let args = [
                "install",
                "conan"
            ];
            this.exec.execSync(cmd,args);
        }
        else {
            // pass 
        }
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
        return this.exec.execPromise(cmd, args, workDir);
    }
    public getProfiles() {
        let cmd = "conan";
        let args = [
            "profile",
            `list`,
        ];
        return this.exec.execWithResult(cmd, args).then(x => x.filter(text => text !== 'default'))
                                                  .then(x => ["default"].concat(x));
    }
    public geneneratePackageTree(conanfile: string, dstFile: string) {
        let cmd = "conan";
        let args = [
            "info",
            conanfile,
            "-g",
            `${dstFile}.dot`
        ];
        return this.exec.execPromise(cmd, args);
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
        return this.exec.execPromise(cmd, args, workDir);
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
        return this.exec.execPromise(cmd, args, workDir);
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
        return this.exec.execPromise(cmd,args,dstFolder);
    }
    public buildProject(
        conanfile: string = "..", 
        workDir: string) {
        let cmd = "conan";
        let args = [
            "build",
            conanfile
        ];
        return this.exec.execPromise(cmd, args, workDir);
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
        return this.exec.execPromise(cmd, args, workDir);
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
    public getProjectRequirementsSync(projDir : string) {

        let pkgName = this.getNameSync(".",projDir);
        let version = this.getVersionSync(".",projDir);
        let cmd = "conan";
        let args = [
                "info",
                ".",
                "-n",
                "requires"
            ];
        let out = this.exec.execWithResultSync(cmd,args,projDir);   
        let pkgIdx = out.indexOf(`conanfile.py (${pkgName}/${version})`) + 2; 
        let packages = [];
        while (pkgIdx < out.length) {
            packages.push(out[pkgIdx].trim().trimEnd());
            pkgIdx++;
        }                        
        return packages;
    }
    public getNameSync(
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
        let name_ = this.exec.execWithResultSync(cmd, args, workDir);
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

    public getVersionSync(
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
        let version_ = this.exec.execWithResultSync(cmd, args, workDir);
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

}