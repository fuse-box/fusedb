export interface IConnectedResult {
  connected: boolean;
  error?: any;
}
export interface IAdapter {
  checkConnection(): Promise<IConnectedResult>;
  close(): void;
  count(collection: string, query: any): Promise<number>;
  create(collection: string, data: any): Promise<{ [key: string]: any }>;
  delete(collection: string, id: any): Promise<number>;
  drop(collection: string): Promise<number>;
  fetch(opts: {
    collection: string;
    limit?: number;
    query: any;

    skip?: number;
    sort?: any;
  }): Promise<{ [key: string]: any }[]>;
  generateId(): any;
  update(collection: string, id: any, data: any): Promise<number>;
}
