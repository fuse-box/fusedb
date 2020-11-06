import { utils } from "realm-utils";
import { FuseDB } from "./FuseDB";
import { Model } from "./Model";
import { ensureDatabaseCorrectValues } from "./Utils";
import { FieldType } from "./decorators/FIeld";
import { FieldValidator } from "./validators/FieldValidator";
interface FieldValidationProperties {
  props: any;
}
export class Schema {
  public name: string;
  private cls: any;
  private validators = new Map<
    string,
    { props: any; validator: FieldValidator }[]
  >();
  private collection: { [key: string]: boolean | string | FieldType };

  public static validators = new Map<string, FieldValidator>();

  constructor(public proto: any) {
    if (proto.$collection) {
      this.name = proto.$collection;
    } else {
      this.name = proto.constructor.name;
    }

    this.cls = proto.constructor;
    this.collection = {
      _id: true,
    };
  }

  public add(name: string, type?: string | FieldType) {
    if (!this.contains(name)) {
      this.collection[name] = type || true;
    }
  }

  public addValidator(field: string, props: any, validator: FieldValidator) {
    let info: { props: any; validator: FieldValidator }[] = this.validators.get(
      field
    );
    if (!info) {
      info = [];
      this.validators.set(field, info);
    }
    info.push({
      props: props,
      validator: validator,
    });
  }

  public validate(instance: Model<any>) {
    const values: any = {};
    if (instance["_id"]) {
      values._id = instance["_id"];
    }
    const errors: any = {};
    for (let key in this.collection) {
      if (key !== "_id") {
        let value = instance[key];
        const validators = this.validators.get(key);
        let errored = false;
        if (this.validators.get(key)) {
          for (const item of validators) {
            try {
              item.validator.validate(key, item.props, value);
            } catch (e) {
              errored = true;
              errors[key] =
                e.message ||
                `Uknown error message while validating "${key}" property`;
            }
          }
        }
      }
    }
    if (Object.keys(errors).length) {
      throw { $fields: errors };
    }
  }

  public toDatabase(
    instance: Model<any>,
    extraValidationRequired?: boolean
  ): { [key: string]: any } {
    if (extraValidationRequired) {
      this.validate(instance);
    }
    const values: any = {};
    if (instance["_id"]) {
      values._id = instance["_id"];
    }
    for (let key in this.collection) {
      if (key !== "_id") {
        let value = instance[key];
        values[key] = ensureDatabaseCorrectValues(value);
      }
    }
    return values;
  }

  public createInstance(values: any): Model<any> {
    return new this.cls(values);
  }

  public mapValues(values: any[]): Model<any>[] {
    let items = [];
    for (let item of values) {
      const instance = this.createInstance(item);
      if (instance["onFetched"]) {
        instance["onFetched"](item);
      }
      items.push(instance);
    }
    return items;
  }

  public getValues(instance: any): { [key: string]: any } {
    const values = {};
    for (let key in this.collection) {
      if (instance[key] !== undefined) {
        values[key] = instance[key];
      }
    }
    return values;
  }

  public contains(name: string) {
    return this.collection[name] !== undefined;
  }

  public getCollection() {
    return this.collection;
  }
}
