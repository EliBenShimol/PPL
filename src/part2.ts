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
            console.log(key+" "+val);
            console.log(Object.entries(table).concat([[key,val]]));
            console.log(Object.fromEntries(Object.entries(table).concat([[key,val]])));
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
   }
    
 

// Q 2.2
export type Reference = { table: string, key: string }

export type TableServiceTable = Table<TableService<object>>

export function isReference<T>(obj: T | Reference): obj is Reference {
    return typeof obj === 'object' && 'table' in obj
}

export async function constructObjectFromTables(tables: TableServiceTable, ref: Reference) {
    async function deref(ref: Reference) {
        return Promise.reject('not implemented')
    }

    return deref(ref)
}

// Q 2.3

export function lazyProduct<T1, T2>(g1: () => Generator<T1>, g2: () => Generator<T2>): () => Generator<[T1, T2]> {
    return function* () {
        // TODO implement!
    }
}

export function lazyZip<T1, T2>(g1: () => Generator<T1>, g2: () => Generator<T2>): () => Generator<[T1, T2]> {
    return function* () {
        // TODO implement!
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

    const handleMutation = async (newTable: Table<T>) => {
        // TODO implement!
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
            return handleMutation(null as any /* TODO */)
        },
        delete(key: string): Promise<void> {
            return handleMutation(null as any /* TODO */)
        },

        subscribe(observer: (table: Table<T>) => void): void {
            // TODO implement!
        }
    }
}