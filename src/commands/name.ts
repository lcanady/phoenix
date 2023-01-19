import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { canEdit, player, target } from "../utils";

export default () => {
  addCmd({
    name: "name",
    pattern: /^[@/+]?name\s+(.*)\s*=\s*(.*)/i,
    flags: "connected",
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid || "");
      const potential = await db.findOne({ name: new RegExp(args[2], "i") });
      let tar = await target(en, args[1]);
      if (!tar) return send(ctx.socket.id, "I can't find that.");
      if (!canEdit(en, tar))
        return send(ctx.socket.cid || "", "I can't find that.");
      if (
        potential &&
        args[2].toLowerCase() !== tar.name?.toLowerCase() &&
        tar.flags.includes("player")
      )
        return send(ctx.socket.id, "That name is already taken.");
      tar.name = args[2];
      await db.update({ _id: tar._id }, tar);
      send(ctx.socket.id, "Set.");
    },
  });
};
