import * as fse from 'fs-extra';

export class CMakeLists {
    name : string = "";
    version : string = "";   
    findPackage : string[] = [];
    executables : Map<string,string[]> = new Map<string,string[]>();
    libraries : Map<string,string[]> = new Map<string,string[]>();
    targetLinkLibraries : Map<string,string[]> = new Map<string,string[]>();
    publicHeaders : Map<string,String[]> = new Map<string,string[]>();

    public async generateFile(
        fileDst : string
    ) {
        let lines = "";
        lines += 'cmake_minimum_required(VERSION 3.15) \n';
        lines += `project(${this.name} CXX)\n\n`;
        for(var idx = 0; idx < this.findPackage.length;idx++) {
            lines += `find_package(${this.findPackage[idx]} REQUIRED)`;
        }
        lines += '\n';
        let targetNames = this.executables.keys();
        for (var target of targetNames) {
            lines += `add_executable(${target} \n`;
            let sources = this.executables.get(target)!;
            for(var jdx = 0;jdx < sources.length;jdx++) {
                lines += `               ${sources[jdx]} \n`;
            }
            lines += ')\n';
        }
        targetNames = this.libraries.keys();
        for (var target of targetNames) {
            lines += `add_library(${target} \n`;
            let sources = this.libraries.get(target)!;
            for(var jdx = 0;jdx < sources.length;jdx++) {
                lines += `           ${sources[jdx]} \n`;
            }
            lines += ')\n';
        }
        targetNames = this.targetLinkLibraries.keys();
        for (var target of targetNames) {
            lines += `target_link_libraries(${target} \n`;
            let libs = this.targetLinkLibraries.get(target)!;
            for(var jdx = 0;jdx < libs.length;jdx++) {
                lines += `                     ${libs[jdx]} \n`;
            }
            lines += ')\n';
        }
        targetNames = this.publicHeaders.keys();
        for (var target of targetNames) {
            lines += `set_target_properties(${target} PROPERTIES PUBLIC_HEADER \n`;
            let headers = this.publicHeaders.get(target)!;
            for(var jdx = 0;jdx < headers.length;jdx++) {
                lines += `                     "${headers[jdx]}" \n`;
            }
            lines += ')\n';
        }
        let targets : string[] = [];
        targetNames = this.executables.keys();
        for (var target of targetNames) {
            targets.push(target);
        }
        targetNames = this.libraries.keys();
        for (var target of targetNames) {
            targets.push(target);
        }
        lines += 'install(TARGETS \n';
        for (var idx = 0; idx < targets.length;idx++) {
            lines += `               ${targets[idx]}\n`;
        }
        lines += '        DESTINATION "."\n';
        lines += '        PUBLIC_HEADER DESTINATION include\n';
        lines += '        RUNTIME DESTINATION bin\n';
        lines += '        ARCHIVE DESTINATION lib\n';
        lines += '        LIBRARY DESTINATION lib\n';
        lines += ')\n'
        
        fse.writeFileSync(fileDst,lines);
    }

    public async getLibsNames() {
        let libs : string[] = [];
        for(let lib of this.libraries) {
            libs.push(lib[0]);
        }
        return libs;
    }
}