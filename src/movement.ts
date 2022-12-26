import { send } from "./broadcast";
import { force } from "./cmds";
import { db } from "./database";
import { Context } from "./definitions";
import { player } from "./utils";

export const matchExits = async (ctx: Context) => {
  if (ctx.socket.cid) {
    const en = await player(ctx.socket.cid || "");
    en.data ||= {};
    const exits = await db.find({
      $and: [{ flags: /exit/i }, { "data.location": en.data?.location }],
    });

    for (const exit of exits) {
      const reg = new RegExp(`^${exit.name?.replace(/;/g, "|^")}`, "i");
      const match = ctx.text?.match(reg);

      if (match) {
        const dest = await db.findOne({ _id: exit.data?.destination });

        if (dest) {
          send(en.data.location || "", `${en.name} has left.`);
          ctx.socket.leave(en.data.location || "");
          en.data.location = dest?._id;
          await db.update({ _id: en._id }, en);
          ctx.socket.join(en.data.location || "");
          send(en.data.location || "", `${en.name} has arrived.`);
          force(ctx.socket, "look");
          return true;
        }
      }
    }
  }

  return false;
};
