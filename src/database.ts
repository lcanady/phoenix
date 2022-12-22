import Datastore from "nedb";
import { Channel, DbObj } from "./definitions";

export default class Database<T> {
  db: Datastore<T> | undefined;

  constructor(dbPath: string) {
    this.db = new Datastore({ filename: dbPath, autoload: true });
  }

  public async insert(data: T): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db?.insert(data, (err, doc) => {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  }

  public async find(query: any): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db?.find(query, (err: Error | null, docs: T[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
    });
  }

  public async findOne(query: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db?.findOne(query, (err: Error | null, doc: T) => {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  }

  public async update(query: any, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db?.update(query, data, {}, (err: Error | null) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  public async remove(query: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db?.remove(query, {}, (err: Error | null) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}

export const db = new Database<DbObj>("./data/data.db");
export const chans = new Database<Channel>("./data/channels.db");
