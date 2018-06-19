import { Model } from './Model';
import { utils } from 'realm-utils';
import { Config } from './FuseDB';
import { MongoAdapter, getMongoModule, MongoAdapterImpl } from './adapters/MongoAdapter';

export function storeProp(target: any, key: string, fn: { (): any }) {
    let data: any = target[key];
    if (!data) {
        Object.defineProperty(target, key, {
            value: fn(),
            enumerable: false
        })
        data = target[key];
    }
    return data;
}

export function isValidObjectID(str) {
    // coerce to string so the function can be generically used to test both strings and native objectIds created by the driver
    str = str + '';
    var len = str.length, valid = false;
    if (len == 12 || len == 24) {
        valid = /^[0-9a-fA-F]+$/.test(str);
    }
    return valid;
}
export function fastHash(text: string) {
    let hash = 0;
    if (text.length == 0) return hash;
    for (let i = 0; i < text.length; i++) {
        let char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
}
export function ensureValidMongoID(id: any) {
    if (Config.adapter instanceof MongoAdapterImpl) {
        const ObjectID = getMongoModule().ObjectID
        if (id instanceof ObjectID) {
            return id;
        }
        if (typeof id === "string" && isValidObjectID(id)) {
            return ObjectID(id);
        }
    }
}

export function ensureDatabaseCorrectValues(value: any) {
    if (Config.adapter instanceof MongoAdapterImpl) {
        if (typeof value === "string" && isValidObjectID(value)) {
            const ObjectID = getMongoModule().ObjectID
            return ObjectID(value);
        }
    }
    if (value instanceof Model) {
        return value._id;
    } else {
        if (utils.isArray(value)) {
            return value.map(i => ensureDatabaseCorrectValues(i));
        }
        if (utils.isPlainObject(value)) {
            let obj = {};
            for (let key in value) {
                value[key] = ensureDatabaseCorrectValues(value[key]);
            }
            return value;
        }
        return value;
    }
    return value;

}