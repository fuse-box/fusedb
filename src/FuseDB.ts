import * as os from "os";
import * as path from "path";
import { ActiveQuery } from "./ActiveQuery";
import { Model } from "./Model";
import { Schema } from "./Schema";
import { SubQuery } from "./SubQuery";
import { fastHash } from "./Utils";
import { IAdapter } from "./adapters/Adapter";
import { FileAdapter } from "./adapters/FileAdapter";

export interface Options {
  adapter?: IAdapter;
}

export class FuseDB {
  public schema: Schema;
  public serializer: string;
  constructor(public model: Model<any>) {
    this.schema = model["$schema"];
  }

  public static setup(opts: Options) {
    Config.adapter = opts.adapter;
    Config.adapter.close();
  }

  public static async checkConnection() {
    if (Config.adapter) {
      return Config.adapter.checkConnection();
    }
  }

  public getAdapter(): IAdapter {
    return Config.adapter;
  }

  public async saveRecord(): Promise<any> {
    let extraValidationRequired = false;
    this.schema.validate(this.model);
    if (typeof this.model["onBeforeSave"] === "function") {
      extraValidationRequired = true;
      await this.model["onBeforeSave"]();
    }

    if (this.model["_id"] !== undefined) {
      if (typeof this.model["onBeforeUpdate"] === "function") {
        extraValidationRequired = true;
        await this.model["onBeforeUpdate"]();
      }
      const record = this.updateRecord(extraValidationRequired);
      if (typeof this.model["onAfterSave"] === "function") {
        await this.model["onAfterSave"]();
      }
      return record;
    }
    if (typeof this.model["onBeforeCreate"] === "function") {
      extraValidationRequired = true;
      await this.model["onBeforeCreate"]();
    }
    const record = await this.createRecord(extraValidationRequired);

    if (typeof this.model["onAfterSave"] === "function") {
      await this.model["onAfterSave"]();
    }
    return record;
  }

  public async updateRecord(extraValidationRequired: boolean): Promise<any> {
    const adapter = this.getAdapter();
    const response = await adapter.update(
      this.schema.name,
      this.model["_id"],
      this.schema.toDatabase(this.model, extraValidationRequired)
    );
    return this.model;
  }

  public find(opts: any): ActiveQuery<any> {
    return new ActiveQuery(opts, this) as any;
  }

  public async drop(): Promise<boolean> {
    const adapter = this.getAdapter();
    await adapter.drop(this.schema.name);
    return true;
  }

  public async query(query: ActiveQuery<any>): Promise<any[]> {
    const adapter = this.getAdapter();
    const response = await adapter.fetch({
      collection: this.schema.name,
      query: query.getQuery(),
      limit: query.getLimit(),
      skip: query.getSkip(),
      sort: query.getSort(),
    });
    const subQuery = new SubQuery(this, query);
    await subQuery.map(response);

    return this.schema.mapValues(response);
  }

  private async mapResponse(
    query: ActiveQuery<any>,
    response: { [key: string]: any }[]
  ) {
    const withConditions = query.getWithConditions();
    if (withConditions.size === 0) {
      return;
    }
  }

  public async count(query: ActiveQuery<any>): Promise<number> {
    const adapter = this.getAdapter();
    const response = await adapter.count(this.schema.name, query.getQuery());
    return response;
  }

  public async remove(): Promise<number> {
    const adapter = this.getAdapter();
    const response = await adapter.delete(this.schema.name, this.getId());
    return response;
  }

  public async createRecord(extraValidationRequired?: boolean): Promise<any> {
    const adapter = this.getAdapter();
    if (!this.model["_id"]) {
      const newId = adapter.generateId();
      if (newId) {
        this.model["_id"] = newId;
      }
    }
    const response = await adapter.create(
      this.schema.name,
      this.schema.toDatabase(this.model, extraValidationRequired)
    );
    this.assignProps(response);
    return this.model;
  }

  public assignProps(props?: any) {
    if (typeof props === "object") {
      for (let key in props) {
        let value = props[key];
        if (this.schema.contains(key)) {
          this.model[key] = value;
        }
      }
    }
  }

  private getId() {
    return this.model["_id"];
  }

  public toJSON() {
    const collection = this.schema.getCollection();
    const json = {};
    for (const key in collection) {
      const props = collection[key];
      if (typeof props === "object") {
        if (!props.hidden) {
          const hasToJson = typeof props.toJSON === "function";
          json[key] = hasToJson
            ? props.toJSON(this.model[key])
            : this.model[key];
        }
      } else {
        json[key] = this.model[key];
      }
    }
    return json;
  }
}

export let Config: Options = {
  adapter: FileAdapter({
    database: fastHash(path.dirname(process.cwd())).toString(),
    path: path.join(os.homedir(), ".fusedb"),
  }),
};
