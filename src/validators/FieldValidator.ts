export interface FieldValidator {
    validate(field: string, value: any, props: any);
}