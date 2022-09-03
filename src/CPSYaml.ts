import * as fse from 'fs-extra';
import * as yaml from 'yaml';
import * as path from 'path';
import { stringify } from 'querystring';

export class CPSYaml {
    name : string = "";
    version : string = "";
    package_manager = "";
    build_system = "";
    license = "";
    author = "";
    url = "";
    description = "";
    topics : string[] = [];
    options : Map<string,string[]> = new Map<string,string[]>();
    packages : Map<string,Map<string,string>> = new Map<string,Map<string,string>>();
    executables : Map<string,Map<string,string[]>> = new Map<string,Map<string,string[]>>();
    libraries : Map<string,Map<string,string[]>> = new Map<string,Map<string,string[]>>();  
    public static buildFromCPSFile(cpsPath : string) {
        
        let cpsYaml = new CPSYaml();
        let yml = fse.readFileSync(cpsPath,'utf8');

        let cpsFile = yaml.parseDocument(yml);
        cpsYaml.name              = cpsFile.get("name") as string;
        cpsYaml.version           = cpsFile.get("version") as string;
        cpsYaml.author            = cpsFile.get("author") as string;
        cpsYaml.build_system      = cpsFile.get("build-system") as string;
        cpsYaml.package_manager   = cpsFile.get("package-manager") as string;
        if (cpsFile.has("options")) {
            let options = cpsFile.get("options") as yaml.YAMLSeq;
            let idx = 0;
            while(idx != -1) {
                let option = options.getIn([idx]) as yaml.YAMLMap;
                if (option === undefined) {
                    idx = -1;
                }
                else {
                    idx++;
                    let optionName = (option.items[0].key as yaml.Scalar).toString();
                    let optionValuesWithDefault = (option.items[0].value as yaml.Scalar).toString();
                    let optionValues = optionValuesWithDefault.replaceAll("[","")
                                                              .replaceAll("]","")
                                                              .split(",");
                    cpsYaml.options.set(optionName,optionValues);
                }
            }
        }
        if (cpsFile.has("packages")) {
            let packages = cpsFile.get("packages") as yaml.YAMLSeq;
            let idx = 0;
            while(idx != -1) {
                let package_ = packages.getIn([idx]) as string;
                if (package_ === undefined) {
                    idx = -1;
                }
                else {
                    idx++;
                    // it has options
                   if (typeof package_ === "object") {
                        let packageMap = package_ as yaml.YAMLMap;
                        let package_idx = packageMap.items[0].key as yaml.Scalar;

                        let packageName = package_idx.value as string;
                        //conanfile.packages.push(packageName);
                        let optionsYaml = packageMap.get(packageName) as yaml.YAMLMap;
                        let optionMap = new Map<string,string>();
                        for(var jdx = 0; jdx < optionsYaml.items.length;jdx++) {
                            let option_jdx = optionsYaml.items[jdx] as yaml.Pair;
                            optionMap.set(option_jdx.key as string,option_jdx.value as string);
                        }
                        cpsYaml.packages.set(packageName,optionMap);
                   }    
                   else {
                        cpsYaml.packages.set(package_, new Map<string,string>());
                   }
                }

            }  
        }
        if (cpsFile.has("executables")) {
            let executables = cpsFile.get("executables") as yaml.YAMLSeq;
            let idx = 0;
            while(idx != -1) {
                let executable = executables.getIn([idx]) as yaml.YAMLMap;
                if (executable === undefined) {
                    idx = -1;
                }
                else {
                    idx++;
                    let exe_map = new Map<string,string[]>();
                    let exe_name = ((executable.items[0] as yaml.Pair).key as yaml.Scalar).toString();
                    let sources = (executable.get(exe_name) as yaml.YAMLMap).get("src",false) as yaml.YAMLSeq;
                    let jdx = 0;
                    let sources_str : string[] = [];
                    while( jdx != -1) {
                        let source = sources.getIn([jdx]) as yaml.Scalar;
                        if (source === undefined) {
                            jdx = -1;
                        }
                        else {
                            jdx++;
                            sources_str.push(source.toString());
                        }
                    }
                    exe_map.set("src",sources_str);
                    if ((executable.get(exe_name) as yaml.YAMLMap).has("requires")) {
                        let requires_str : string[] = [];
                        let requires = (executable.get(exe_name) as yaml.YAMLMap).get("requires",false) as yaml.YAMLSeq;
                        jdx = 0;
                        while( jdx != -1) {
                            let req = requires.getIn([jdx]) as yaml.Scalar;
                            if (req === undefined) {
                                jdx = -1;
                            }
                            else {
                                jdx++;
                                requires_str.push(req.toString());
                            }
                        }
                        exe_map.set("requires",requires_str);   
                    }
                    cpsYaml.executables.set(exe_name,exe_map);
                }
            }
        } 
        if (cpsFile.has("libraries")) {
            let libraries = cpsFile.get("libraries") as yaml.YAMLSeq;
            let idx = 0;
            while(idx != -1) {
                let library = libraries.getIn([idx]) as yaml.YAMLMap;
                if (library === undefined) {
                    idx = -1;
                }
                else {
                    idx++;
                    let lib_map = new Map<string,string[]>();
                    let lib_name = ((library.items[0] as yaml.Pair).key as yaml.Scalar).toString();
                    let sources = (library.get(lib_name) as yaml.YAMLMap).get("src",false) as yaml.YAMLSeq;
                    let jdx = 0;
                    let sources_str : string[] = [];
                    while( jdx != -1) {
                        let source = sources.getIn( [jdx ]) as yaml.Scalar;
                        if (source === undefined) {
                            jdx = -1;
                        }
                        else {
                            jdx++;
                            sources_str.push(source.toString());
                        }
                    }
                    lib_map.set("src",sources_str);
                    if ((library.get(lib_name) as yaml.YAMLMap).has("requires")) {
                        let requires_str : string[] = [];
                        let requires = (library.get(lib_name) as yaml.YAMLMap).get("requires",false) as yaml.YAMLSeq;
                        jdx = 0;
                        while( jdx != -1) {
                            let req = requires.getIn( [jdx ]) as yaml.Scalar;
                            if (req === undefined) {
                                jdx = -1;
                            }
                            else {
                                jdx++;
                                requires_str.push(req.toString());
                            }
                        }
                        lib_map.set("requires",requires_str);   
                    }
                    jdx = 0;
                    if ((library.get(lib_name) as yaml.YAMLMap).has("inc")) {
                        let inc_str : string[] = [];
                        let incs = (library.get(lib_name) as yaml.YAMLMap).get("inc",false) as yaml.YAMLSeq;
                        jdx = 0;
                        while( jdx != -1) {
                            let inc = incs.getIn([jdx ]) as yaml.Scalar;
                            if (inc === undefined) {
                                jdx = -1;
                            }
                            else {
                                jdx++
                                inc_str.push(inc.toString());
                            }
                        }
                        lib_map.set("inc",inc_str);   
                    }
                    cpsYaml.libraries.set(lib_name,lib_map);
                }
            }
        }    
           
        return cpsYaml;
    }
    public getJustPackages(

    ) : string[] {
        let packages : string[] =  [];
        for (let key of this.packages) {
            packages.push(key[0]);
        }
        return packages;
    }
    public getOptionsNames(

    ) {
        let optionNames : string[] =  [];
        for (let key of this.options) {
            optionNames.push(key[0]);
        }
        return optionNames;
    }
    public getDefaultOfOption(
        optionName : string
    ) {
        let defaultOpt = "";
        let allOptions = this.options.get(optionName)!;
        for (var idx = 0; idx < allOptions.length;idx++) {
            if (allOptions[idx].includes("!")) {
                defaultOpt = allOptions[idx].replaceAll("!",""); 
            }
        }
        return defaultOpt;
    }
    public getAllOptionsWithoutDefault(
        optionName : string
    ) {
        let allOptions2 : string[] = [];
        let allOptions = this.options.get(optionName)!;
        for (var idx = 0; idx < allOptions.length;idx++) {
            if (allOptions[idx].includes("!")) {
                allOptions2.push(allOptions[idx].replaceAll("!","")); 
            }
            else {
                allOptions2.push(allOptions[idx]);
            }
        }
        return allOptions2;
    }
    public getOptionsOfPackage(
        packageName : string
    ) {
        let optionNames : string[] =  [];
        for (let key of this.packages.get(packageName)!) {
            optionNames.push(key[0]);
        }
        return optionNames;
    }

    public getExecutables(

    ) {
        let exes : string[] =  [];
        for (let key of this.executables) {
            exes.push(key[0]);
        }
        return exes;
    }

    public getLibraries(

        ) {
            let libs : string[] =  [];
            for (let key of this.libraries) {
                libs.push(key[0]);
            }
            return libs;
    }

    public getSrc(
        target : string
    ) {
        let srcs : string[] = [];
        let found = false;
        for (let key of this.executables) {
            if (key[0] === target) {
                let srcs2 = this.executables.get(target)?.get("src")!;
                for (var idx = 0; idx < srcs2.length;idx++) {
                    srcs.push(srcs2[idx]);
                }
                found = true;
                break;
            }
        }
        if (found) {
            // pass 
        }
        else {
            for (let key of this.libraries) {
                if (key[0] === target) {
                    let srcs2 = this.libraries.get(target)?.get("src")!;
                    for (var idx = 0; idx < srcs2.length;idx++) {
                        srcs.push(srcs2[idx]);
                    }
                    break;
                }
            }
        }
        return srcs;
    }
    public getInc(
        lib : string
    ) {
        let incs : string[] = [];
        for (let key of this.libraries) {
            if (key[0] === lib) {
                let incs2 = this.libraries.get(lib)?.get("inc")!;
                for (var idx = 0; idx < incs2.length;idx++) {
                    incs.push(incs2[idx]);
                    }
                    break;
                }
        }
        return incs;
    }
    public getTargetLinks(
        target : string
    ) {
        let tarLinks : string[] = [];
        let found = false;
        for (let key of this.executables) {
            if (key[0] === target) {
                let tarLinks2 = this.executables.get(target)?.get("requires")!;
                for (var idx = 0; idx < tarLinks2.length;idx++) {
                    tarLinks.push(tarLinks2[idx]);
                }
                found = true;
                break;
            }
        }
        if (found) {
            // pass
        }
        else {
            for (let key of this.libraries) {
                if (key[0] === target) {
                    let tarLinks2 = this.libraries.get(target)?.get("requires")!;
                    for (var idx = 0; idx < tarLinks2.length;idx++) {
                        tarLinks.push(tarLinks2[idx]);
                    }
                    break;
                }
            }
        }
        return tarLinks;
    }
 } 
