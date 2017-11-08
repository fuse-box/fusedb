import { Validator } from "../Validator";
import { FieldValidator } from "./FieldValidator";
import { extractValidatorPropeties } from "./utils";

@Validator()
export class MaxValidator implements FieldValidator {
    validate(field: string, props: any, value: any) {

        const options = extractValidatorPropeties(props);
        options.message = options.message || `Field ${field} is required to be max ${options.value} symbols`;
        if (value === undefined || value.toString().length > options.value) {
            throw new Error(options.message);
        }
    }
}