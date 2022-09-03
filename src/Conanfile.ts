import * as fse from 'fs-extra';

export class Conanfile {
    name : string = "";
    version : string = "";
    license : string = "";
    author : string =  "";
    url : string = "";
    description : string = "";
    topics : string[] = [];
    packages : string[] = [];
    options : string[] = [];
    selfOptions : string[] = [];
    defaultSelfOption : string[] = [];

    public generateFile(conanfilePath : string) {
        let lines = `from conans import ConanFile
from conans import tools
from conan.tools.cmake import CMakeToolchain, CMake, CMakeDeps
from conan.tools.layout import cmake_layout

class CPSCLASS(ConanFile):

    name = "CPS_NAME"
    version = "CPS_VERSION"

    # Optional metadata
    license = "CPS_LICENSE"
    author = "CPS_AUTHOR"
    url = "CPS_URL"
    description = "CPS_DESCRIPTION"
    topics = CPS_TOPICS          `.replace("CPSCLASS",this.name + "File")
                                  .replace("CPS_NAME",this.name)
                                  .replace("CPS_VERSION",this.version)
                                  .replace("CPS_LICENSE",this.license)
                                  .replace("CPS_AUTHOR",this.author)
                                  .replace("CPS_URL",this.url)
                                  .replace("CPS_DESCRIPTION",this.description);
    lines += "\n";
    lines += `    # Binary configuration
    settings = "os", "compiler", "build_type", "arch"
    
    options = {}
    options["fPIC"] = [True, False]`;
    lines += '\n';
    for(var idx = 0; idx < this.selfOptions.length;idx++) {
        lines += "    " + this.selfOptions[idx] + "\n";
    }
    lines += "\n"
    lines += '    default_options = {}\n    default_options["fPIC"] = True\n';
    for(var idx = 0; idx < this.defaultSelfOption.length;idx++) {
        lines += "    " + this.defaultSelfOption[idx] + "\n";
    }
    lines += '\n';
    lines += `
    # Sources are located in the same place as this recipe, copy them to the recipe
    exports_sources = "CMakeLists.txt", "src/*"

    def config_options(self):
        if self.settings.os == "Windows":
            del self.options.fPIC
`
    let topics_str = "( ";
    for (var topic of this.topics) {
        topics_str += '"' + topic + '",';
    }
    topics_str = topics_str.substring(0,topics_str.length-1);
    topics_str += ")";
    lines = lines.replace("CPS_TOPICS",topics_str);

    if (this.packages.length > 0) {
        lines += "\n";
        lines += "    def requirements(self):\n"
        for (var package_idx of this.packages) {
            lines += `        self.requires("${package_idx}")\n`;
        }
    }
    if (this.options.length > 0) {
        for (var option_idx of this.options) {
            let package_ = option_idx.split("::")[0];
            let key = option_idx.split("::")[1].split("=")[0];
            let value = option_idx.split("::")[1].split("=")[1]; 
            lines += `        self.options["${package_}"].${key} = ${value} \n`;
        }
        lines += "\n"; 
    }
    lines += "\n";
    lines += `    def layout(self):
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
        self.cpp_info.libs = tools.collect_libs(self)`;

        fse.writeFileSync(conanfilePath,lines);
    }
}