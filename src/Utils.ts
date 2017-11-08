import { Model } from './Model';
import { utils } from 'realm-utils';

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

export function ensureDatabaseCorrectValues(value: any) {
    if (value instanceof Model) {
        return value._id;
    } else {
        if (utils.isArray(value)) {
            return value.map(i => ensureDatabaseCorrectValues(i));
        }
        if (utils.isPlainObject(value)) {
            let obj = {};
            for (let key in value) {
                obj[key] = ensureDatabaseCorrectValues(obj[key]);
            }
            return obj;
        }
    }
    return value;

}