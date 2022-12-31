import { send } from "./broadcast";
import { force } from "./cmds";
import { db } from "./database";
import { Context } from "./definitions";
import flags from "./flags";
import { displayName, getAttr, player } from "./utils";

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
        const room = await db.findOne({ _id: en.data?.location });
        const dest = await db.findOne({ _id: exit.data?.destination });

        if (dest && flags.check(en.flags, exit?.data?.lock || "")) {
          if (!en.flags.includes("dark")) {
            ctx.socket.leave(en.data.location || "");
            send(en.data.location || "", `${en.name} leaves for ${dest.name}.`);
          }

          en.data.location = dest?._id;
          await db.update({ _id: en._id }, en);

          if (!en.flags.includes("dark")) {
            send(
              en.data.location || "",
              `${en.name} arrives from ${room.name}.`
            );
          }
          send(ctx.socket.id, `You arrive in ${displayName(en, dest)}`);
          ctx.socket.join(en.data.location || "");

          force(ctx.socket, "look");
          return true;
        } else {
          send(
            ctx.socket.id,
            getAttr(exit, "fail").value || "You can't go that way."
          );
          return true;
        }
      }
    }
  }

  return false;
};
