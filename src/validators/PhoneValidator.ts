import { Validator } from "../Validator";
import { FieldValidator } from "./FieldValidator";
import { extractValidatorPropeties } from "./utils";

@Validator()
export class PhoneValidator implements FieldValidator {
    validate(field: string, props: any, value: any) {

        const options = extractValidatorPropeties(props);
        options.message = options.message || `Invalid phone format`;
        const re = /^\s?\+\s?(\()?\d{1,3}(\))?\s?[0-9\s-]+$/;
        if (value === undefined || !re.test(value.toString())) {
            throw new Error(options.message);
        }
    }
}