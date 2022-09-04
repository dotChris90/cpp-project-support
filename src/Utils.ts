import * as glob from 'glob';
import * as path from 'path';
import internal = require('stream');

export class SetUtils {
    public static FromArray<Type>(arr : Type[]) {
        let bufferSet = new Set<Type>();
        for(let idx = 0; idx < arr.length;idx++)
            bufferSet.add(arr[idx]);
        return bufferSet;
    }  
    public static ToArray<Type>(set : Set<Type>) {
        let bufferArr : Type[] = [];
        for(let idx of set)
            bufferArr.push(idx);
        return bufferArr;
    }
    public static AddArrayToSet<Type>(set : Set<Type>,arr : Type[]) {
        for(let element of arr) 
            set.add(element);
    }
    public static RemoveArrayFromSet<Type>(set : Set<Type>,arr : Type[]) {
        for(let element of arr) {
            if (set.has(element)) {
                set.delete(element);
            }
        }
    }
}

export class ArrayUtils {
    public static Diff(arr1 : string[],arr2 : string[]) {
        let set1 = SetUtils.FromArray(arr1);
        for(let element of arr2) {
            if (set1.has(element)) {
                set1.delete(element);
            }
        }
        return SetUtils.ToArray(set1);
    }
}

export class FileSearch {
    public static SearchRecursive(pattern : string[], cwd : string) {
        let results : string[] = [];
        for(let pattern_idx of pattern) {
            let srcSearch = new glob.GlobSync(pattern_idx,{
                "cwd" : cwd
            });
            let buffer : string[] = [];
            for(let res of srcSearch.found)
                buffer.push(res);
            results = results.concat(buffer);
        } 
        return results;
    }
}

export class MapUtils {
    public static IsEmpty<Key,Value>(map : Map<Key,Value>) {
        let elements = 0;
        for(let element of map)
            elements++;
        return (elements === 0);
    }
    public static GetKeys<Key,Value>(map : Map<Key,Value>) {
        let keys : Key[] = [];
        for(let element of map)
            keys.push(element[0]);
        return keys;
    }
    public static MergeMaps<Key,Value>(map1 : Map<Key,Value>,map2 : Map<Key,Value>) {
        return new Map([...Array.from(map1.entries()), ...Array.from(map2.entries())]);
    }
    public static GetValuesFlat<Key,Value>(map : Map<Key,Value[]>) {
        let keys : Value[] = [];
        for(let element of map)
            keys = keys.concat(element[1]);
        return keys;
    }
}

export class Path {
    public static AddFolderEachElement(arr : string[],folder : string) {
        for(let idx = 0; idx < arr.length;idx++) {
            arr[idx] = folder + path.sep + arr[idx];
        }
        return arr;
    }
}