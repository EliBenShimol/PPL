import { reduceEachLeadingCommentRange } from "typescript";

export const MISSING_KEY = '___MISSING_KEY___'
export const MISSING_TABLE_SERVICE = '___MISSING_TABLE_SERVICE___'

export type Table<T> = Readonly<Record<string, Readonly<T>>>

export type TableService<T> = {
    get(key: string): Promise<T>;
    set(key: string, val: T): Promise<void>;
    delete(key: string): Promise<void>;
}

// Q 2.1 (a)
export function makeTableService<T>(sync: (table?: Table<T>) => Promise<Table<T>>): TableService<T> {
    // optional initialization code
    return {
        get(key: string): Promise<T> {
            const p=sync().then((table) =>
                Object.entries(table).filter(x => x[0]===key).length !==0 ?  Object.entries(table).filter(x => x[0]===key)[0][1] : Promise.reject(MISSING_KEY) 
            );
            
            p.catch((err) => console.error(err));
            return p;

        },
        set(key: string, val: T): Promise<void> {
            const p=sync().then((table) =>{
            const updatedTable : Record<string,Readonly<T>> =Object.fromEntries(Object.entries(table).concat([[key,val]]));
            //console.log(key+" "+val);
            //console.log(Object.entries(table).concat([[key,val]]));
            //console.log(Object.fromEntries(Object.entries(table).concat([[key,val]])));
            sync(updatedTable);
        });
            p.catch((err) => console.error(err));
            return p;

        },
        delete(key: string): Promise<void> {
            const p=sync().then((table) =>{
                const updatedTable : Record<string,Readonly<T>> =Object.fromEntries(Object.entries(table).filter(x => x[0]!=key));
                sync(updatedTable);
            });
                p.catch((err) => console.error(err));
                return p;
        }
    }
}

// Q 2.1 (b)

export function getAll<T>(store: TableService<T>, keys: string[]): Promise<T[]> {
    const a = Promise.all(keys.map((x) => {
        const p = store.get(x).then((item) => item);
        p.catch((err) => console.error(err));
        return p;
    }));
    return a;
    
 }

    
 

// Q 2.2
export type Reference = { table: string, key: string }

export type TableServiceTable = Table<TableService<object>>

export function isReference<T>(obj: T | Reference): obj is Reference {
    return typeof obj === 'object' && 'table' in obj
}

//export async function constructObjectFromTables1(tables: TableServiceTable, ref: Reference) {
//      async function deref(ref: Reference) {
//          Promise < Object > {
//              const a = Object.entries(tables)).filter((x) => x[0] === ref.table).length !== 0 ? Object.entries(tables)).filter((x) => x[0] === ref.table)[0][1].get(ref.key) : Promise.reject(MISSING_TABLE_SERVICE);
//              const content = await a ;
//              const c : Promise<Object> = await Object.fromEntries(Object.entries(content).map((x) => isReference(x[1]) ? [x[0], deref(x[1])] : x));
//              return c;
//          }
//              return await deref(ref);
//          }
//      }
//}
export async function constructObjectFromTables(tables: TableServiceTable, ref: Reference) {
    async function deref(ref: Reference) {
        
        try {
            const neededTable = Object.entries(tables).filter((c) => c[0] === ref['table'])[0][1];
            const objPromise = neededTable.get(ref['key']);
            const obj = await objPromise;
            console.log("Current obj and reference:");
            console.log(obj);
            console.log(ref);
            //console.log(isReference(Object.entries(obj).map((x) => console.log(x))));
            //console.log(isReference(Object.entries(obj).map((x) => isReference(x))));
            const ret = {};
            for (const x of Object.entries(obj)) {
                if (isReference(x[1])) {
                    const content = await deref(x[1]);
                    Object.assign(ret, { [x[0]]:  content });
                }
                else {
                    Object.assign(ret, { [x[0]]: x[1] });
                }
            }
                //console.log("Current derefobj:");

                
            console.log(ret);
            return ret;
        }
        catch (err) {
            return Promise.reject(MISSING_TABLE_SERVICE);
        }
    }
    return deref(ref);
}

// Q 2.3

export function lazyProduct<T1, T2>(g1: () => Generator<T1>, g2: () => Generator<T2>): () => Generator<[T1, T2]> {
    return function* () {
        for (const v1 of g1()) {
            for (const v2 of g2()) {
                yield [v1, v2];
            }
        }
    }
}

export function lazyZip<T1, T2>(g1: () => Generator<T1>, g2: () => Generator<T2>): () => Generator<[T1, T2]> {
    return function* () {
        const gen1: Generator<T1> = g1();
        const gen2: Generator<T2> = g2();
        while (true) {
            const v1 = gen1.next();
            const v2 = gen2.next();
            if (v1.done || v2.done) {
                break;
            }
            else {
                yield [v1.value, v2.value];
            }
            

        }



    }
}

// Q 2.4
export type ReactiveTableService<T> = {
    get(key: string): T;
    set(key: string, val: T): Promise<void>;
    delete(key: string): Promise<void>;
    subscribe(observer: (table: Table<T>) => void): void
}

export async function makeReactiveTableService<T>(sync: (table?: Table<T>) => Promise<Table<T>>, optimistic: boolean): Promise<ReactiveTableService<T>> {
    // optional initialization code
    let _table: Table<T> = await sync()
    let observer_arr: any[] = [];
    const handleMutation = async (newTable: Table<T>) => {
        if (optimistic) {
            for (let v of observer_arr) {
               v(newTable);
            }
        }
        const p = sync(newTable).then((content) => {
            if (!optimistic) {
                for (let v of observer_arr) {
                    v(content);
                }
            }

        }

        ).catch((err) => {
            if (optimistic) {
                for (let v of observer_arr) {
                    v(_table);
                }
                Promise.reject(err);

            }
        });
        //return p;
    }
    return {
        get(key: string): T {
            if (key in _table) {
                return _table[key]
            } else {
                throw MISSING_KEY
            }
        },
        set(key: string, val: T): Promise<void> {
            
            const stringifiedTable = JSON.parse(JSON.stringify(_table));  
            stringifiedTable[key] = val;
            console.log(stringifiedTable);
            return handleMutation(stringifiedTable);
            
        },
        delete(key: string): Promise<void> {
            const stringifiedTable = Object.entries(_table);
            console.log(stringifiedTable);
            const filtered = stringifiedTable.filter((x) => x[0] !== key);
            console.log(filtered);
            return handleMutation(Object.fromEntries(filtered));

            
        },

        subscribe(observer: (table: Table<T>) => void): void {
            observer_arr.push(observer);
        }
    }
}