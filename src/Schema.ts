import { FuseDB } from "./FuseDB";
import { Model } from "./Model";
import { FieldValidator } from "./validators/FieldValidator";
import { FieldType } from './decorators/FIeld';
import { utils } from "realm-utils";
import { ensureDatabaseCorrectValues } from './Utils';
interface FieldValidationProperties {
    props: any,

}
export class Schema {
    public name: string;
    private cls: any;
    private validators = new Map<string, { props: any, validator: FieldValidator }[]>();
    private collection: { [key: string]: boolean | string | FieldType };

    public static validators = new Map<string, FieldValidator>();



    constructor(public proto: any) {
        this.cls = proto.constructor;
        this.name = proto.constructor.name;
        this.collection = {
            "_id": true
        };
    }

    public add(name: string, type?: string | FieldType) {
        if (!this.contains(name)) {
            this.collection[name] = type || true;
        }
    }

    public addValidator(field: string, props: any, validator: FieldValidator) {

        let info: { props: any, validator: FieldValidator }[] = this.validators.get(field);
        if (!info) {
            info = [];
            this.validators.set(field, info);
        }
        info.push({
            props: props,
            validator: validator
        });
    }

    public toDatabase(instance: Model<any>): { [key: string]: any } {
        const values: any = {};
        if (instance["_id"]) {
            values._id = instance["_id"]
        }

        for (let key in this.collection) {
            if (key !== "_id") {
                let value = instance[key];;
                const validators = this.validators.get(key);
                if (this.validators.get(key)) {
                    for (const item of validators) {
                        item.validator.validate(key, item.props, value);
                    }
                }

                values[key] = ensureDatabaseCorrectValues(value);
            }
        }
        return values;
    }

    public createInstance(values: any): Model<any> {
        return new this.cls(values);
    }

    public mapValues(values: any[]): Model<any>[] {
        let items = [];
        for (let item of values) {
            const instance = this.createInstance(item);
            if (instance["onFetched"]) {
                instance["onFetched"](item);
            }
            items.push(instance);
        }
        return items;
    }


    public getValues(instance: any): { [key: string]: any } {
        const values = {};
        for (let key in this.collection) {
            if (instance[key] !== undefined) {
                values[key] = instance[key];
            }
        }
        return values;
    }


    public contains(name: string) {
        return this.collection[name] !== undefined;
    }

    public getCollection() {
        return this.collection;
    }
}