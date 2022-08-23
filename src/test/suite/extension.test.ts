import * as assert from 'assert';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as child_process from 'child_process';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';

import {CppPrjSup} 	from '../../CppPrjSup'; 
import {Config} 	from '../../Config';
import {VSCodeFakeCenter} from '../Fakes/VSCodeFakeCenter';
import { after } from 'mocha';

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

let tmpDir = "";

suite('Extension Test Suite', () => {
	
	// prepare : 
	// tools : 
	// conan install fmt/8.1.1@_/_ --build 

	let packages = [
		"fmt/8.1.1@_/_",
		"cmake/3.23.1@_/_",
		"cppcheck/2.7.5@_/_",
		"ms-gsl/4.0.0@_/_",
		"gtest/1.11.0@_/_"
	];

	for (var idx = 0; idx < packages.length; idx++) {
		let cmd = `conan install ${packages[idx]} --build=missing`;
		child_process.execSync(cmd);
	}

	let prjRoot = fse.mkdtempSync(path.join(os.tmpdir(), "test"));
	tmpDir = prjRoot;
	let code 	= path.join(__dirname,"..","..","C++Code");
	let conf 	= new Config();

	let fake = new VSCodeFakeCenter();
	fake.setInput("Enter name/version for package","def/0.1.0");
	fake.setPick("Choose Profile","default");
	fake.setPick("Choose build type","Release");

	let cps = new CppPrjSup(
		fake,
		code,
		prjRoot,
		conf
	);
	
	test('all', async () => {
		await cps.newPrj();
		await delay(5000);
		assert(fse.existsSync(path.join(prjRoot,"conanfile.py")));
		await cps.importPackages();
		assert(fse.existsSync(path.join(prjRoot,".cps","pkgs","include","fmt","format.h")));
		assert(fse.existsSync(path.join(prjRoot,".cps","pkgs","include","gsl","gsl")));
		assert(fse.existsSync(path.join(prjRoot,".cps","pkgs","include","gtest","gtest.h")));
		await delay(5000);
		await cps.installDeps();
		await delay(5000);
		assert(fse.existsSync(path.join(prjRoot,"build","generators","fmt-config.cmake")));
		assert(fse.existsSync(path.join(prjRoot,"build","graph_info.json")));
		assert(fse.existsSync(path.join(prjRoot,"build","conaninfo.txt")));
		await delay(5000);
		await cps.build(); 
		assert(fse.existsSync(path.join(prjRoot,".cps","tools","cppcheck_report.txt")));
		assert(!fse.existsSync(path.join(prjRoot,"build","Release","main")));
		let report = fse.readFileSync(path.join(prjRoot,".cps","tools","cppcheck_report.txt")).toString().split('\n');
		assert(report[0],`${prjRoot}/src/Greeter.cpp:17:1: error: Memory leak: vec [memleak]`)
		let greeter = fse.readFileSync(path.join(prjRoot,"src","Greeter.cpp")).toString().split('\n');
		greeter.splice(16,0,"delete vec;");
		fse.writeFileSync(path.join(prjRoot,"src","Greeter.cpp"),greeter.join('\n'));
		await cps.build();
		await delay(5000);
		assert(fse.existsSync(path.join(prjRoot,"build","Release","main")));
		await delay(5000);
		await cps.createPackageAndTest();
		await delay(10000);
		assert(fse.existsSync(path.join(prjRoot,"test_package","build","pkg_test")));
		await cps.deployProject();
		await delay(5000);
		assert(fse.existsSync(path.join(prjRoot,"deploy","default-Release","def","include","Greeter.hpp")));
		assert(fse.existsSync(path.join(prjRoot,"deploy","default-Release","def","bin")));
		await cps.generatePackageTree();
		await delay(5000);
		assert(fse.existsSync(path.join(prjRoot,".cps","package.dot")));
		await cps.generateTargetTree();
		await delay(5000);
		assert(fse.existsSync(path.join(prjRoot,".cps","target.dot")));
		await cps.inspectAllPkgOptions();
		await delay(5000);
		assert(fse.existsSync(path.join(prjRoot,".cps","tools","inspect.txt")));
		cps.clean();
		assert(!fse.existsSync(path.join(prjRoot,"build")));
		await cps.installDeps();
		await delay(5000);
		await cps.build();
		await delay(5000);
		assert(fse.existsSync(path.join(prjRoot,"build","Release","main")));
		let a = 5;
	});
});

after(async () => {
	console.log("Finish");
	fse.removeSync(tmpDir);
});