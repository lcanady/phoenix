// Set does a bunch of different things in MUX.  We're going to replicate them slowly as needed.

import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { canEdit, set } from "../utils";

export default () => {
  addCmd({
    name: "set",
    pattern: /^[@/+]?set\s+(.*)\s*=\s*(.*)/i,
    flags: "connected",
    render: async (ctx, args) => {
      const player = await db.findOne({ _id: ctx.socket.cid });
      let target;
      switch (args[1].trim()) {
        case "me":
          target = player;
          break;
        case "here":
          target = await db.findOne({ _id: player.data?.location });
          break;
        default:
          target = await db.findOne({
            $or: [
              { name: args[1] },
              { _id: args[1] },
              { dbref: parseInt(args[1].slice(1), 10) },
            ],
          });
          break;
      }

      if (!target) return send(ctx.socket.id, "I can't find that.");
      if (!canEdit(player, target))
        return send(ctx.socket.id, "I can't find that.");
      await set(target, args[2]);
      send(ctx.socket.id, "Set.");
    },
  });
};
