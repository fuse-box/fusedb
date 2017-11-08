import { FuseDB } from './FuseDB';
import { ActiveQuery } from './ActiveQuery';
import { Model } from './Model';
import { each } from "realm-utils";


export class CollectionTask {
    public ids = new Set<any>();
    private modelCollection = new Map<string, Model<any>>();
    constructor(public field: string, public withValue: typeof Model | ActiveQuery<any>) { }

    private addId(id: any) {
        if (!this.ids.has(id)) { this.ids.add(id); }
    }

    public register(val: string | string[]) {
        if (typeof val == "string") {
            this.addId(val);
        }
        if (Array.isArray(val)) {
            val.forEach(id => this.addId(id))
        }
    }

    public getById(id: any) {
        return this.modelCollection.get(id);
    }

    public map(record: any) {
        if (typeof record == "string") {
            return this.getById(record);
        }
        if (Array.isArray(record)) {
            let newArray = [];
            record.forEach(id => newArray.push(this.getById(id)));
            return newArray;
        }
    }

    public async resolve() {
        let query: ActiveQuery<any> = this.withValue as ActiveQuery<any>;
        //console.log(this.ids);
        const q = query.find({ _id: { $in: [...this.ids] } })

        const models = await q.all();
        models.forEach(model => this.modelCollection.set(model._id, model));
    }
}
export class SubQuery {
    private collections = new Map<string, CollectionTask>();
    private conditions: Map<string, typeof Model | ActiveQuery<any>>;
    private data: { [key: string]: any }[];

    constructor(public db: FuseDB, public query: ActiveQuery<any>) {
        this.conditions = this.query.getWithConditions();
    }

    public async map(values: { [key: string]: any }[]) {
        this.data = values;
        if (this.conditions.size === 0) {
            return;
        }
        await each(this.conditions, (value, key) => this.onCondition(value, key))
        await each(this.collections, (task: CollectionTask) => task.resolve())
        await this.assign();
    }

    private async assign() {
        for (let i in this.data) {
            const record = this.data[i];
            for (let key in record) {
                this.collections.forEach((task, field) => {
                    if (field === key) {
                        record[key] = task.map(record[key])
                    }
                });
            }
        }
    }

    public async onCondition(value: typeof Model | ActiveQuery<any>, field: string) {
        for (let i in this.data) {
            const record = this.data[i];
            for (let key in record) {
                if (key === field) {
                    let collectionTask = this.collections.get(key);
                    if (!collectionTask) {
                        collectionTask = new CollectionTask(key, value);
                        this.collections.set(key, collectionTask)
                    }
                    collectionTask.register(record[key])
                }
            }
        }
    }
}