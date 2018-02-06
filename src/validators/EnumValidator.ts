import { Validator } from "../Validator";
import { FieldValidator } from "./FieldValidator";
import { extractValidatorPropeties } from "./utils";

@Validator()
export class EnumValidator implements FieldValidator {
    validate(field: string, props: any, value: any) {
        
        const options = extractValidatorPropeties(props);
        const enumValues = Object.keys(options.value).map(k => options.value[k]);
        options.message = options.message || `Field ${field} only accept follow values: ${enumValues.toString().replace(/,/g, ', ')}`;
        if (enumValues.indexOf(value) == -1){
            throw new Error(options.message);
        }
    }
}