import { Schema } from "./Schema";
import { storeProp } from "./Utils";

export function Validator() {
    return function (Target) {
        let name: string = Target.name;
        name = name.charAt(0).toLowerCase() + name.slice(1)
        name = name.replace('Validator', '');
        //console.log("set", name);
        Schema.validators.set(name, new Target());
    }
}
