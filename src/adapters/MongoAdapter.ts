import { ensureDatabaseCorrectValues, ensureValidMongoID } from "../Utils";
import { IAdapter, IConnectedResult } from "./Adapter";
const DATABASES = {};

export interface MongoAdapterOptions {
  dbName?: string;
  options?: Record<string, any>;
  url?: string;
}

export function MongoAdapter(opts: MongoAdapterOptions) {
  return new MongoAdapterImpl(opts);
}
export function getMongoModule() {
  return require("mongodb");
}

let ActiveConnection: any;
let Connecting = false;
let PendingConnections = [];
export class MongoAdapterImpl implements IAdapter {
  constructor(public opts: MongoAdapterOptions) {}
  public async close() {
    if (ActiveConnection) {
      try {
        ActiveConnection.client.close();
      } catch (e) {
        console.log(e);
      }
    }
  }

  public async checkConnection(): Promise<IConnectedResult> {
    try {
      await this.getConnection();
      return { connected: true };
    } catch (e) {
      return { connected: false, error: e };
    }
  }

  public generateId(): string {
    return undefined;
  }

  private async getConnection(): Promise<any> {
    if (ActiveConnection) {
      return ActiveConnection;
    }
    if (Connecting === false) {
      Connecting = true;
      const MongoClient = getMongoModule().MongoClient;
      const url = this.opts.url || "mongodb://localhost:27017/fusedb";
      const dbName = this.opts.dbName || "myproject";
      let client, db;
      try {
        // waiting for connections on port 27017
        // Use connect method to connect to the Server
        client = await MongoClient.connect(url, this.opts.options || {});
        db = client.db(dbName);
      } catch (err) {
        Connecting = false;
        throw err;
      }
      ActiveConnection = {
        client: client,
        db: db,
      };
      PendingConnections.forEach((resolve) => {
        resolve(ActiveConnection);
      });
      PendingConnections = [];
      return ActiveConnection;
    } else {
      return new Promise((resolve, reject) => {
        PendingConnections.push(resolve);
      });
    }
  }

  async count(name: string, query: any): Promise<number> {
    const connection = await this.getConnection(name);
    const collection = connection.db.collection(name);
    const q = collection.find(query ? ensureDatabaseCorrectValues(query) : {});
    const count = await q.count();
    return count;
  }

  async fetch(opts: {
    collection: string;
    query?: any;
    limit?: number;
    skip?: number;
    sort?: any;
  }): Promise<{ [key: string]: any }[]> {
    const connection = await this.getConnection(opts.collection);
    const collection = connection.db.collection(opts.collection);
    const q = collection.find(
      opts.query ? ensureDatabaseCorrectValues(opts.query) : {}
    );
    if (opts.limit) {
      q.limit(opts.limit);
    }
    if (opts.skip) {
      q.skip(opts.skip);
    }
    if (opts.sort) {
      q.sort(opts.sort);
    }
    const results = await q.toArray();
    return results;
  }

  async create(collection: string, doc: any): Promise<{ [key: string]: any }> {
    const connection = await this.getConnection(collection);
    let record = await connection.db.collection(collection).insertOne(doc);
    return record.ops[0];
  }

  async update(collection: string, id: any, doc: any): Promise<number> {
    const connection = await this.getConnection(collection);
    id = ensureValidMongoID(id);
    const _coll = connection.db.collection(collection);
    const record = await _coll.update({ _id: id }, { $set: doc });
    return record.result.nModified;
  }

  async delete(collection: string, id: any): Promise<number> {
    const connection = await this.getConnection(collection);
    id = ensureValidMongoID(id);
    const _coll = connection.db.collection(collection);
    const record = await _coll.deleteOne({ _id: id });
    return record.deletedCount;
  }

  async drop(collection: string): Promise<number> {
    const connection = await this.getConnection(collection);
    const collections = await connection.db
      .listCollections({ name: collection })
      .toArray();
    const collectionExists = collections.find(
      (item) => item.name === collection
    );
    if (collectionExists) {
      const _coll = connection.db.collection(collection);
      await _coll.drop();
      return 1;
    }
    return 0;
  }
}
