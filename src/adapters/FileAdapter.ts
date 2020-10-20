import * as fsExtra from "fs-extra";
import * as Datastore from "nedb";
import * as path from "path";
import * as shortid from "shortid";
import { IAdapter } from "./Adapter";
const DATABASES = {};

export interface FileAdapterOptions {
  database: string;
  path?: string;
}

export function FileAdapter(opts: FileAdapterOptions) {
  return new FileAdapterImpl(opts);
}

export class FileAdapterImpl implements IAdapter {
  constructor(public opts: FileAdapterOptions) {}
  close() {}

  public generateId(): string {
    return shortid.generate();
  }

  public async checkConnection() {
    return { connected: true };
  }

  private getConnection(name: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const fDir = path.join(this.opts.path, this.opts.database);
      const fPath = path.join(fDir, name);
      if (DATABASES[fPath]) {
        return resolve(DATABASES[fPath]);
      }
      fsExtra.ensureDirSync(fDir);
      let db = new Datastore({ filename: fPath });
      db.loadDatabase((err) => {
        DATABASES[fPath] = db;
        return resolve(db);
      });
    });
  }

  async count(collection: string, query: any): Promise<number> {
    const db = await this.getConnection(collection);
    return new Promise<number>((resolve, reject) => {
      db.count(query || {}, function (err, count) {
        if (err) {
          return reject(err);
        }
        return resolve(count);
      });
    });
  }

  async fetch(opts: {
    collection: string;
    query?: any;
    limit?: number;
    skip?: number;
    sort?: any;
  }): Promise<{ [key: string]: any }[]> {
    const db = await this.getConnection(opts.collection);
    const q = db.find(opts.query || {});
    if (opts.limit !== undefined) {
      q.limit(opts.limit);
    }
    if (opts.skip !== undefined) {
      q.skip(opts.skip);
    }
    if (opts.sort !== undefined) {
      q.sort(opts.sort);
    }
    return new Promise<{ [key: string]: any }[]>((resolve, reject) => {
      q.exec(function (err, docs: { [key: string]: any }[]) {
        // docs is [doc3, doc1]
        return resolve(docs);
      });
    });
  }

  async create(collection: string, doc: any): Promise<{ [key: string]: any }> {
    const db = await this.getConnection(collection);
    return new Promise((resolve, reject) => {
      db.insert(doc, function (err, newDoc) {
        if (err) {
          return reject(err);
        }
        return resolve(newDoc);
      });
    });
  }

  async update(collection: string, id: any, doc: any): Promise<number> {
    const db = await this.getConnection(collection);
    return new Promise<number>((resolve, reject) => {
      db.update({ _id: id }, doc, (err, updated: number) => {
        if (err) {
          return reject(err);
        }
        return resolve(updated);
      });
    });
  }

  async delete(collection: string, id: any): Promise<number> {
    const db = await this.getConnection(collection);
    return new Promise<number>((resolve, reject) => {
      db.remove({ _id: id }, (err, removed: number) => {
        if (err) {
          return reject(err);
        }
        return resolve(removed);
      });
    });
  }

  async drop(collection: string): Promise<number> {
    const db = await this.getConnection(collection);
    return new Promise<number>((resolve, reject) => {
      db.remove({}, { multi: true }, (err, removed: number) => {
        db.loadDatabase((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(removed);
        });
      });
    });
  }
}
