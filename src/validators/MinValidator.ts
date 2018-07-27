import { Validator } from "../Validator";
import { FieldValidator } from "./FieldValidator";
import { extractValidatorPropeties } from "./utils";

@Validator()
export class MinValidator implements FieldValidator {
    validate(field: string, props: any, value: any) {

        const options = extractValidatorPropeties(props);
        options.message = options.message || `Should be at least ${options.value} symbols`;
        if (value === undefined || value.toString().length < options.value) {
            throw new Error(options.message);
        }
    }
}