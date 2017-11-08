import { Model } from "../Model";
import { FuseDB } from "../FuseDB";
import { storeProp } from "../Utils";
import { Schema } from "../Schema";

const formatMetadataKey = Symbol("Field");

export interface FieldType {
    cls?: typeof Model
    name?: string
}
export function Field(type?:
    string |
    FieldType
) {
    return function PropertyDecorator(
        target: Model<any>,
        propertyKey: string
    ) {

        const schema: Schema = storeProp(target, "$schema", () => new Schema(target));
        schema.add(propertyKey, type);
    }
}
