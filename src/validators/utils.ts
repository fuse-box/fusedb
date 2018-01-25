export function extractValidatorPropeties(props: any, defaultMessage?: string): { value: any, message?: any } {
    const result: { value: any, message?: any } = {
        value: props,
        message: defaultMessage
    };
    if (typeof props === "object") {
        if (props.value !== undefined) {
            result.value = props.value;
        }
        if (props.message !== undefined) {
            result.message = props.message;
        }
    }
    return result;
}