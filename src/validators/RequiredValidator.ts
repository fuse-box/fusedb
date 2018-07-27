import { Validator } from "../Validator";
import { FieldValidator } from "./FieldValidator";
import { extractValidatorPropeties } from "./utils";

@Validator()
export class RequiredValidator implements FieldValidator {
    validate(field: string, props: any, value: any) {

        const options = extractValidatorPropeties(props);
        options.message = options.message || `This field required`;
        if (value === undefined || value === "") {
            throw new Error(options.message);
        }
    }
}