import * as fse from 'fs-extra';
import * as yaml from 'yaml';
import * as path from 'path';
import * as Utils from './Utils';

export class CPSYaml {
    name : string = "";
    version : string = "";
    packageManager = "";
    buildSystem = "";
    license = "";
    author = "";
    url = "";
    description = "";
    topics : string[] = [];
    options : Map<string,Set<string>> = new Map<string,Set<string>>();
    packages : Map<string,Map<string,string>> = new Map<string,Map<string,string>>();
    executables : Map<string,Map<string,Set<string>>> = new Map<string,Map<string,Set<string>>>();
    libraries : Map<string,Map<string,Set<string>>> = new Map<string,Map<string,Set<string>>>();  
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
                    cpsYaml.options.set(optionName,Utils.SetUtils.FromArray(optionValues));
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
                    let exe_map = new Map<string,Set<string>>();
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
                    exe_map.set("src",Utils.SetUtils.FromArray(sources_str));
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
                        exe_map.set("requires",Utils.SetUtils.FromArray(requires_str));   
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
                    let lib_map = new Map<string,Set<string>>();
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
                    lib_map.set("src", Utils.SetUtils.FromArray(sources_str));
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
                        lib_map.set("requires", Utils.SetUtils.FromArray(requires_str));   
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
                        lib_map.set("inc",Utils.SetUtils.FromArray(inc_str));   
                    }
                    cpsYaml.libraries.set(lib_name,lib_map);
                }
            }
        }    
           
        return cpsYaml;
    }
    public getPackages(

    ) : string[] {
        let packages : string[] =  [];
        for (let key of this.packages) {
            packages.push(key[0]);
        }
        return packages;
    }
    public addPackage(
        package_ : string
    ) {
        if (!this.packages.has(package_)) {
            this.packages.set(package_,new Map<string,string>());
        }
    }
    public addOption2Pkg(
        package_ : string,
        optionKey : string,
        optionValue : string
    ) {
        if (this.packages.has(package_)) {
            let option = new Map<string,string>();
            option.set(optionKey,optionValue);
            this.packages.set(package_,option);
        }
        else {

        }
    }
    public rmPackage(
        package_ : string
    ) {
        if (!this.packages.has(package_)) {
            this.packages.delete(package_);
        }
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
        for(let option of allOptions) {
            if (option.includes("!")) {
                defaultOpt = option;
                break;
            }
        }
        return defaultOpt;
    }
    public getAllOptionsWithoutDefault(
        optionName : string
    ) {
        let allOptions2 : string[] = [];
        let allOptions = this.options.get(optionName)!;
        for (let option of allOptions) {
            if (option.includes("!")) {
                allOptions2.push(option.replaceAll("!","")); 
            }
            else {
                allOptions2.push(option);
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

    public getTargets(

    ) {
        let targets = this.getExecutables();
        return targets.concat(this.getLibraries());
    }
    public getTarget(
        target : string
    ) {
        let found = false;
        let targetMap = new Map<string,Set<string>>();
        if (this.executables.has(target)) {
            let found = true;
            targetMap = this.executables.get(target)!;
        }
        if (!found) {
            if (this.libraries.has(target)) {
                found = true;
                targetMap = this.libraries.get(target)!;
            }
        }
        return targetMap;
    }
    public setSrc(
        target : string,
        srcs : Set<string>
    ) {
        let found = false;
        for (let key of this.executables) {
            if (key[0] === target) {
                this.executables.get(target)?.set("src",srcs);
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
                    this.libraries.get(target)?.set("src",srcs);
                    break;
                }
            }
        }
    }

    public setIncs(
        target : string,
        incs : Set<string>
    ) {
        let found = false;
        for (let key of this.executables) {
            if (key[0] === target) {
                this.executables.get(target)?.set("inc",incs);
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
                    this.libraries.get(target)?.set("inc",incs);
                    break;
                }
            }
        }
    }
    public getSrcAsCopy(
        target : string
    ) {
        let targetMap = this.getTarget(target);
        if (!targetMap.has("src")) {
            targetMap.set("src", new Set<string>());
        }
        let srcs = Utils.SetUtils.copy(targetMap.get("src")!);
        return Utils.SetUtils.ToArray(srcs);
    }
    public addSrc2Target(
        target : string,
        src : string
    ) {
        let targetMap = this.getTarget(target);
        if (!targetMap.has("src")) {
            targetMap.set("src", new Set<string>());
        }
        let srcs = targetMap.get("src")!;
        srcs.add(src);
        targetMap.set("src",srcs);
    }
    public rmSrcOfTarget(
        target : string, 
        src : string
    ) {
        let targetMap = this.getTarget(target);
        if (!targetMap.has("src")) {
            targetMap.set("src", new Set<string>());
        }
        let srcs = targetMap.get("src")!;
        if (srcs.has(src)) {
            srcs.delete(src);
        }
        targetMap.set("src",srcs);
    }
    public getIncAsCopy(
        lib : string
    ) {
        let targetMap = this.getTarget(lib);
        if (!targetMap.has("inc")) {
            targetMap.set("inc", new Set<string>());
        }
        let incs = Utils.SetUtils.copy(targetMap.get("inc")!);
        return Utils.SetUtils.ToArray(incs);
    }
    public addInc2Target(
        target : string,
        inc : string
    ) {
        let targetMap = this.getTarget(target);
        if (!targetMap.has("inc")) {
            targetMap.set("inc", new Set<string>());
        }
        let incs = targetMap.get("inc")!;
        incs.add(inc);
        targetMap.set("inc",incs);
    }
    public rmIncOfTarget(
        target : string, 
        inc : string
    ) {
        let targetMap = this.getTarget(target);
        if (!targetMap.has("inc")) {
            targetMap.set("inc", new Set<string>());
        }
        let incs = targetMap.get("inc")!;
        if (incs.has(inc)) {
            incs.delete(inc);
        }
        targetMap.set("inc",incs);
    }
    public setTargetLinks(
        target : string, 
        links : Set<string> 
    ) {
        let found = false;
        for (let key of this.executables) {
            if (key[0] === target) {
                this.executables.get(target)?.set("requires",links);
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
                    this.libraries.get(target)?.set("requires",links);
                    break;
                }
            }
        }
    }
    public addTargetReq(
        target : string,
        requirement : string
    ) {
        let targetMap = this.getTarget(target);
        if (!targetMap.has("requires")) {
            targetMap.set("requires", new Set<string>());
        }
        let reqs = targetMap.get("requires")!;
        reqs.add(requirement);
        targetMap.set("requires",reqs);
    }
    public rmTargetReq(
        target : string,
        requirement : string
    ) {
        let targetMap = this.getTarget(target);
        if (!targetMap.has("requires")) {
            targetMap.set("requires", new Set<string>());
        }
        let reqs = targetMap.get("requires")!;
        if (reqs.has(requirement)) {
            reqs.delete(requirement);
        }
        targetMap.set("requires",reqs);
    }
    public getTargetLinks(
        target : string
    ) {
        let tarLinks : string[] = [];
        let found = false;
        for (let key of this.executables) {
            if (key[0] === target) {
                let tarLinks2 = this.executables.get(target)?.get("requires")!;
                for (let tar of tarLinks2) {
                    tarLinks.push(tar);
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
                    for (let tar of tarLinks2) {
                        tarLinks.push(tar);
                    }
                    break;
                }
            }
        }
        return tarLinks;
    }
    public ToYmlFileContent(

    ) {
        let lines = "";
        lines += `name : "${this.name}"\n`;
        lines += `version : "${this.version}"\n`;
        lines += `package-manager : "${this.package_manager}"\n`;
        lines += `build-system : "${this.build_system}"\n`;
        lines += `license : "${this.license}"\n`;
        lines += `author : "${this.author}"\n`;
        lines += `url : "${this.url}"\n`;
        lines += `description : "${this.description}"\n`;
        lines += `topics : ( `;
        for(let idx = 0;idx <  this.topics.length-1;idx++)
            lines += `"${this.topics[idx]}" ,`;
        if (this.topics.length > 0)
            lines += `${this.topics[this.topics.length-1]}" )\n`;
        else 
            lines += ")\n";
        if (Utils.MapUtils.IsEmpty(this.options)) {
            // pass 
        }
        else {
            let options = Utils.MapUtils.GetKeys(this.options);
            lines += 'options :\n'
            for(let option of options) {
                lines += `  - ${option} : "[`;
                let values = Utils.SetUtils.ToArray(this.options.get(option)!);
                for(let idx = 0; idx < values.length-1;idx++) {
                    lines += `${values[idx]},`
                }
                lines += `${values[values.length-1]}]"\n`;
            }
        }
        if (Utils.MapUtils.IsEmpty(this.packages)) {
            // pass 
        }
        else {
            lines += 'packages :\n';
            let packages = Utils.MapUtils.GetKeys(this.packages);
            for(let package_ of packages) {
                if (Utils.MapUtils.IsEmpty(this.packages.get(package_)!)) {
                    lines += `  - ${package_}\n`;
                }
                else {
                    let options = this.packages.get(package_)!;
                    lines += `  - ${package_} :\n`;
                    let optionNames = Utils.MapUtils.GetKeys(options);
                    for(let optionName of optionNames) {
                        let value = options.get(optionName)!;
                        lines += `      ${optionName} : "${value}"\n`;
                    }
                }
            }
        }
        if (Utils.MapUtils.IsEmpty(this.executables)) {
            // pass 
        }
        else {
            lines += `executables : \n`;
            let exeNames = Utils.MapUtils.GetKeys(this.executables);
            for(let exeName of exeNames) {
                lines += `  - ${exeName} :\n`;
                let sources = this.executables.get(exeName)?.get("src")!;
                lines += "      src :\n";
                for(let source of sources) {
                    lines += `        - ${source}\n`;
                }
                let reqs = this.executables.get(exeName)?.get("requires")!;
                lines += "      requires :\n";
                for(let req of reqs) {
                    lines += `        - ${req}\n`;
                }
            }
        }
        if (Utils.MapUtils.IsEmpty(this.libraries)) {
            // pass 
        }
        else {
            lines += `libraries : \n`;
            let libNames = Utils.MapUtils.GetKeys(this.libraries);
            for(let libName of libNames) {
                lines += `  - ${libName} :\n`;
                let sources = this.libraries.get(libName)?.get("src")!;
                lines += "      src :\n";
                for(let source of sources) {
                    lines += `        - ${source}\n`;
                }
                let incs = this.libraries.get(libName)?.get("inc")!;
                lines += "      inc :\n";
                for(let inc of incs) {
                    lines += `        - ${inc}\n`;
                }
                let reqs = this.libraries.get(libName)?.get("requires")!;
                lines += "      requires :\n";
                for(let req of reqs) {
                    lines += `        - ${req}\n`;
                }
            }
        }
        return lines;
    }
 } 
