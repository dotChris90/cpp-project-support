import { spawn, spawnSync } from 'child_process';
import { IMsgCenter } from './IMsgCenter';
import { execSync } from 'child_process';

export class Executor {
  private log: IMsgCenter;
  constructor(log: IMsgCenter) {
    this.log = log;
  }
  public execSync(command : string, args : string[] ) {
    return spawnSync(command,args);
  }
  public execWithResult(command: string, args: string[] = [""], workingDir: string = "", options: any = {}) : Promise<string[]> {
    workingDir = workingDir === "" ? process.cwd() : workingDir;
    options['cwd'] = workingDir;
    let out = "";
    if (args === [""]) {
      out = execSync(command,options).toString();
    }
    else {
      out = spawnSync(command,args,options).stdout.toString();
    }
    let bufferSplitted = out.split("\n")
      .filter(text => text !== '');
    let bufferPromise: Promise<string[]> = new Promise((resolve, reject) => resolve(bufferSplitted));
    return bufferPromise;
  }
  public execWithResultSync(command: string, args: string[] = [""], workingDir: string = "", options: any = {}) : string[] {
    workingDir = workingDir === "" ? process.cwd() : workingDir;
    options['cwd'] = workingDir;
    let out = "";
    if (args === [""]) {
      out = execSync(command,options).toString();
    }
    else {
      out = spawnSync(command,args,options).stdout.toString();
    }
    let bufferSplitted = out.split("\n")
      .filter(text => text !== '');
    return bufferSplitted;
  }
  public execPromise(command: string, args: string[], workingDir: string = "", options: any = {}) : Promise<any> {
    workingDir = workingDir === "" ? process.cwd() : workingDir;
    return new Promise((resolve, reject) => {
      options['cwd'] = workingDir;
      options['shell'] = true;
      const commandProc = spawn(command, args, options);
      commandProc.stdout.on("data", (data) => {
        this.log.writeOut(data.toString());
      });
      commandProc.stderr.on("data", (data) => {
        this.log.writeErr(data.toString());
      });
      commandProc.on('exit', function (code) {
        // *** Process completed
        resolve(code);
      });
      commandProc.on('error', function (err) {
        // *** Process creation failed
        reject(err);
      });
    });
  }
  public writeOut(text : string) {
    this.log.writeOut(text);
  }
  public writeErr(text : string) {
    this.log.writeErr(text);
  }
  public writeWarn(text : string) {
    this.log.writeWarn(text);
  }
}