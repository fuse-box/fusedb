import { Model } from "../Model";
import { FuseDB } from "../FuseDB";
import { storeProp } from "../Utils";
import { Schema } from "../Schema";


export function Validate(data: { [key: string]: any }) {
    return function ValidateDecorator(
        target: Model<any>,
        propertyKey: string
    ) {

        const schema: Schema = storeProp(target, "$schema", () => new Schema(target));
        //console.log(data, Schema.validators);
        for (let key in data) {
            const props = data[key];
            if (Schema.validators.has(key)) {
                schema.addValidator(propertyKey, props, Schema.validators.get(key));
            }
        }
    }
}
