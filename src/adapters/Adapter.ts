export interface IAdapter {
    close(): void;
    generateId(): any;
    count(collection: string, query: any): Promise<number>;
    fetch(opts: {
        collection: string,
        query: any,
        limit?: number,

        skip?: number,
        sort?: any
    }): Promise<{ [key: string]: any }[]>
    create(collection: string, data: any)
        : Promise<{ [key: string]: any }>
    update(collection: string, id: any, data: any)
        : Promise<number>
    delete(collection: string, id: any)
        : Promise<number>
    drop(collection: string)
        : Promise<number>
}