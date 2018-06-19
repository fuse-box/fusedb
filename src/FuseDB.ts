import { Model } from "./Model";
import { Schema } from "./Schema";
import { IAdapter } from "./adapters/Adapter";
import { FileAdapter } from "./adapters/FileAdapter";
import * as os from "os";
import * as path from "path"
import { ActiveQuery } from "./ActiveQuery";
import { SubQuery } from './SubQuery';
import { fastHash } from './Utils';



export interface Options {
    adapter?: IAdapter;
}

export class FuseDB {
    public schema: Schema;
    public serializer: string;
    constructor(public model: Model<any>) {
        this.schema = model["$schema"];
    }

    public static setup(opts: Options) {
        Config.adapter = opts.adapter;
        Config.adapter.close();

    }

    public getAdapter(): IAdapter {
        return Config.adapter
    }

    public async saveRecord(): Promise<any> {
        if (typeof this.model['onBeforeSave'] === "function") {
            await this.model['onBeforeSave']();
        }

        if (this.model["_id"] !== undefined) {
            if (typeof this.model['onBeforeUpdate'] === "function") {
                await this.model['onBeforeUpdate']();
            }
            const record = this.updateRecord();
            if (typeof this.model['onAfterSave'] === "function") {
                await this.model['onAfterSave']();
            }
            return record;
        }
        if (typeof this.model['onBeforeCreate'] === "function") {
            await this.model['onBeforeCreate']();
        }
        const record = await this.createRecord();

        if (typeof this.model['onAfterSave'] === "function") {
            await this.model['onAfterSave']();
        }
        return record;
    }

    public async updateRecord(): Promise<any> {
        const adapter = this.getAdapter();
        const response = await adapter.update(this.schema.name, this.model["_id"], this.schema.toDatabase(this.model));
        return Promise.resolve(this.model);
    }

    public find(opts: any): ActiveQuery<any> {
        return new ActiveQuery(opts, this) as any
    }

    public async drop(): Promise<boolean> {
        const adapter = this.getAdapter();
        await adapter.drop(this.schema.name)
        return true;
    }

    public async query(query: ActiveQuery<any>): Promise<any[]> {
        const adapter = this.getAdapter();
        const response = await adapter.fetch({
            collection: this.schema.name,
            query: query.getQuery(),
            limit: query.getLimit(),
            skip: query.getSkip(),
            sort: query.getSort()
        });
        const subQuery = new SubQuery(this, query)
        await subQuery.map(response);

        return this.schema.mapValues(response);
    }

    private async mapResponse(query: ActiveQuery<any>, response: { [key: string]: any }[]) {
        const withConditions = query.getWithConditions();
        if (withConditions.size === 0) {
            return;
        }
    }

    public async count(query: ActiveQuery<any>): Promise<number> {
        const adapter = this.getAdapter();
        const response = await adapter.count(this.schema.name, query.getQuery());
        return response;
    }

    public async remove(): Promise<number> {
        const adapter = this.getAdapter();
        const response = await adapter.delete(this.schema.name, this.getId())
        return response;
    }


    public async createRecord(): Promise<any> {
        const adapter = this.getAdapter();
        if (!this.model["_id"]) {
            const newId = adapter.generateId();
            if (newId) {
                this.model["_id"] = newId;
            }
        }
        const response = await adapter.create(this.schema.name, this.schema.toDatabase(this.model))
        this.assignProps(response);
        return Promise.resolve(response);
    }

    public assignProps(props?: any) {

        if (typeof props === "object") {
            for (let key in props) {
                let value = props[key];
                if (this.schema.contains(key)) {
                    this.model[key] = value;
                }
            }
        }
    }

    private getId() {
        return this.model["_id"];
    }
}

export let Config: Options = {
    adapter: FileAdapter({
        path: path.join(os.homedir(), ".fusedb"),
        database: fastHash(path.dirname(process.cwd())).toString()
    })
}

