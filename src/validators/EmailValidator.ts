import { Validator } from "../Validator";
import { FieldValidator } from "./FieldValidator";
import { extractValidatorPropeties } from "./utils";

@Validator()
export class EmailValidator implements FieldValidator {
    validate(field: string, props: any, value: any) {

        const options = extractValidatorPropeties(props);
        options.message = options.message || `It's not a valid email`;
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (value === undefined || !re.test(value.toString())) {
            throw new Error(options.message);
        }
    }
}