import * as path from 'path';
import * as fse from 'fs-extra';
import * as crypto from 'crypto';

export class CodeGenerator {
    private interfacePath : string;
    private interfaceImpPathHpp : string;
    private interfaceImpPathCpp : string;
    private fullClassHpp : string;
    private fullClassCpp : string;
    private structHpp : string;
    constructor(
        cppCodeDir: string
    ) {
        this.interfacePath          = path.join(cppCodeDir,"classes","interface.hpp");
        this.interfaceImpPathHpp    = path.join(cppCodeDir,"classes","interfaceImplementation.hpp");
        this.interfaceImpPathCpp    = path.join(cppCodeDir,"classes","interfaceImplementation.cpp");
        this.fullClassCpp           = path.join(cppCodeDir,"classes","fullClass.cpp");
        this.fullClassHpp           = path.join(cppCodeDir,"classes","fullClass.hpp");
        this.structHpp              = path.join(cppCodeDir,"classes","struct.hpp");
    } 
    
    public generateInterface(
        namespace : string,
        className : string,
        outFile : string
    ) {
        let template = fse.readFileSync(this.interfacePath).toString();
        let hash = crypto.createHash('sha1').update(namespace + "::" + className).digest('hex');
        let interfaceClass = template.replaceAll("INTERFACE_HEADER","HEADER_" + hash + "_END")
                                     .replaceAll("A::B::C",namespace)
                                     .replaceAll("INTERFACE_CLASS",className);
        fse.mkdirpSync(path.dirname(outFile));
        fse.writeFileSync(outFile,interfaceClass);
    }

    public generateInterfaceImplementation(
        namespace : string,
        className : string,
        outFile : string,
        interfaceName : string,
        interfaceClassFile : string
    ) {
        let template = fse.readFileSync(this.interfaceImpPathHpp).toString();
        let hash = crypto.createHash('sha1').update(namespace + "::" + className).digest('hex');
        let interfaceImpHpp = template.replaceAll("INTERFACE_HEADER","HEADER_" + hash + "_END")
                                      .replaceAll("A::B::C",namespace)
                                      .replaceAll("INTERFACE_IMP_CLASS",className)
                                      .replaceAll('#include "A/B/C/interface.hpp"',`#include "${interfaceClassFile}"`)
                                      .replaceAll('INTERFACE_CLASS',interfaceName);
        fse.mkdirpSync(path.dirname(outFile));
        fse.writeFileSync(outFile + ".hpp",interfaceImpHpp);

        template = fse.readFileSync(this.interfaceImpPathCpp).toString();
        hash = crypto.createHash('sha1').update(namespace + "::" + className).digest('hex');

        let classHeader = `${namespace.replaceAll("::","/")}/${className}.hpp`;

        let interfaceImpCpp = template.replaceAll("INTERFACE_HEADER","HEADER_" + hash + "_END")
                                      .replaceAll("A::B::C",namespace)
                                      .replaceAll("INTERFACE_IMP_CLASS",className)
                                      .replaceAll('#include "A/B/C/interface.hpp"',`#include "${classHeader}"`)
                                      .replaceAll('INTERFACE_CLASS',interfaceName);
        
        fse.writeFileSync(outFile + ".cpp",interfaceImpCpp);
    }

    public generateFullClass(
        namespace : string,
        className : string,
        outFile : string
    ) {
        let template = fse.readFileSync(this.fullClassHpp).toString();
        let hash = crypto.createHash('sha1').update(namespace + "::" + className).digest('hex');
        let interfaceClass = template.replaceAll("FULLCLASS_HEADER","HEADER_" + hash + "_END")
                                     .replaceAll("A::B::C",namespace)
                                     .replaceAll("FULL_CLASS",className);
        fse.mkdirpSync(path.dirname(outFile));
        fse.writeFileSync(outFile + '.hpp',interfaceClass);


        template = fse.readFileSync(this.fullClassCpp).toString();
        hash = crypto.createHash('sha1').update(namespace + "::" + className).digest('hex');
        let include = namespace.replaceAll("::","/") + "/" + className + ".hpp";
        interfaceClass = template.replaceAll('#include "A/B/C/interface.hpp"',`#include "${include}"`)
                                     .replaceAll("A::B::C",namespace)
                                     .replaceAll("FULL_CLASS",className);
        fse.mkdirpSync(path.dirname(outFile));
        fse.writeFileSync(outFile + '.cpp',interfaceClass);
    }

    public generateMethodBody(
        namespace : string,
        className : string,
        methodSig : string,
        outfile : string,
    ) {
        let fullName = namespace + "::" + className;
        let signatureFull = "";
        if (methodSig.startsWith("auto")) {
            signatureFull = "auto " + fullName + "::" + methodSig.substring("auto ".length) + " {\n}\n";
        }
        fse.appendFileSync(outfile,signatureFull);
    }

    public async generateStruct(
        namespace : string,
        structName : string,
        outFile : string
    ) {
        let template = fse.readFileSync(this.structHpp).toString();
        let hash = crypto.createHash('sha1').update(namespace + "::" + structName).digest('hex');
        let interfaceClass = template.replaceAll("STRUCT_HEADER","HEADER_" + hash + "_END")
                                     .replaceAll("A::B::C",namespace)
                                     .replaceAll("STRUCT_",structName);
        fse.mkdirpSync(path.dirname(outFile));
        fse.writeFileSync(outFile,interfaceClass);
    }
}