import { db } from "./database";
import { DbObj } from "./definitions";
import flags from "./flags";

export class DBObject {
  constructor(public obj: DbObj) {
    this.obj = obj;
  }

  get id() {
    return this.obj._id;
  }

  get name() {
    return this.obj.name;
  }

  get dbref() {
    return this.obj.dbref;
  }

  get flags() {
    return this.obj.flags;
  }

  set flags(flgs: string) {
    const { tags, data } = flags.set(this.obj.flags, this.obj.data || {}, flgs);
    this.obj.flags = tags;
    this.obj.data = data;
  }

  async save() {
    await db.update({ _id: this.id }, this.obj);
  }
}
