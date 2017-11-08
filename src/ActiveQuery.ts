import { Model } from "./Model";
import { FuseDB } from "./FuseDB";

export class ActiveQuery<T> {
    private _sort: any;
    private _limit: number;
    private _skip: number;
    private withConditions = new Map<string, typeof Model | ActiveQuery<T>>();
    constructor(private query: any, public db: FuseDB) { }

    public sort(key: any, direction?: string): ActiveQuery<T> {
        if (typeof key === "string") {
            this._sort = {}
            this._sort[key] = direction === "desc" ? -1 : 1;
        }
        return this;
    }

    public find(query: any): ActiveQuery<T> {
        query = query || {}
        for (let item in query) {
            this.query[item] = query[item]
        }
        return this;
    }

    public limit(num: number): ActiveQuery<T> {
        this._limit = num;
        return this;
    }

    public with(field: string, query: typeof Model | ActiveQuery<T>): ActiveQuery<T> {
        this.withConditions.set(field, query);
        return this;
    }

    public getWithConditions() {
        return this.withConditions;
    }

    public skip(num: number): ActiveQuery<T> {
        this._skip = num;
        return this;
    }

    public async first(): Promise<T> {
        this.limit(1);
        const results = await this.db.query(this);
        return results[0] as T;
    }

    public async count(): Promise<number> {
        const count = await this.db.count(this);
        return count
    }


    public async remove(): Promise<number> {
        const count = await this.db.remove();
        return count;
    }


    public async all(): Promise<T[]> {
        const results = await this.db.query(this);
        return results;
    }


    public getSort() {
        return this._sort;
    }

    public getSkip() {
        return this._skip;
    }

    public getLimit() {
        return this._limit;
    }

    public getQuery() {
        return this.query || {};
    }
}