import {ConanCodeGen} from './CodeGeneration/ConanCodeGen';
import {Executor} from './Executor';

export class Conan {
    private exec : Executor;
    private codeGen : ConanCodeGen;
    constructor(
        exec : Executor,
        codeGen : ConanCodeGen) {
        this.exec = exec;
        this.codeGen = codeGen;
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
        let cmd = "conan profile list";
        let profiles = this.exec.execWithResult(cmd)
                                .then(x => x.filter(text => text !== 'default'))
                                .then(x => ["default"].concat(x));
        return profiles;
    }
    public getPackageTree(conanfile: string, dstFile: string) {
        let cmd = "conan";
        let args = [
            "info",
            conanfile,
            "-g",
            `${dstFile}.html`
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
}