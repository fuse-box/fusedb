import { Validator } from "../Validator";
import { FieldValidator } from "./FieldValidator";
import { extractValidatorPropeties } from "./utils";

@Validator()
export class RegExpValidator implements FieldValidator {
    validate(field: string, props: any, value: any) {
        const options = extractValidatorPropeties(props);
        options.message = options.message || `Field ${field} is in the wrong format`;
        if (value === undefined) {
            throw new Error(options.message);
        }
        if (options.value instanceof RegExp) {
            if (!options.value.test(value)) {
                throw new Error(options.message);
            }
        }
    }
}