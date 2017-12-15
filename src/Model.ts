import "reflect-metadata";
import { FuseDB } from "./FuseDB";
import { storeProp } from "./Utils";
import { ActiveQuery } from "./ActiveQuery";

export class Model<T> {

    public $fusedb: FuseDB;
    public _id: any;

    constructor(props?: any) {
        storeProp(this, "$fusedb", () => new FuseDB(this));
        if (props) {
            this.$fusedb.assignProps(props);
        }
    }

    public async save(): Promise<Model<T>> {
        return this.$fusedb.saveRecord() as Promise<Model<T>>;
    }


    public async remove(): Promise<number> {
        return this.$fusedb.remove();
    }

    public static drop<T>(opts?: any): Promise<boolean> {
        const Cls = new this();
        return Cls.$fusedb.drop();
    }

    public static find<T>(opts?: any): ActiveQuery<T> {
        const Cls = new this();
        return Cls.$fusedb.find(opts) as ActiveQuery<T>;
    }
}
