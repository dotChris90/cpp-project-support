import * as path from 'path';
import * as fse from 'fs-extra';
import * as crypto from 'crypto';

export class CodeGenerator {
    private interfacePath : string;
    private interfaceImpPathHpp : string;
    private interfaceImpPathCpp : string;
    constructor(
        cppCodeDir: string
    ) {
        this.interfacePath          = path.join(cppCodeDir,"classes","interface.hpp");
        this.interfaceImpPathHpp    = path.join(cppCodeDir,"classes","interfaceImplementation.hpp");
        this.interfaceImpPathCpp    = path.join(cppCodeDir,"classes","interfaceImplementation.cpp");
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
}