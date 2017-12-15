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