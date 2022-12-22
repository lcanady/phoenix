import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { displayName } from "../utils";

export default () =>
  addCmd({
    name: "look",
    pattern: /^(?:l|look)(?:\s+(.*))?$/i,
    flags: "connected",
    render: async (ctx, args) => {
      const player = await db.findOne({ _id: ctx.socket.cid });
      if (player) {
        args[1] ||= "here";
        args[1] = args[1].match(/me/i) ? ctx.socket.cid : args[1];
        args[1] = args[1].match(/here/i)
          ? ` ${player.data?.location}`
          : args[1];
        let target = await db.findOne({
          $or: [{ name: RegExp(args[1], "i") }, { _id: args[1] }],
        });

        let target2 = await db.findOne({ _id: player.data?.location });
        target ||= target2;
        if (!target) return send(ctx.socket.id, "I don't see that here");

        const contents = await db.find({
          $and: [{ "data.location": target?._id }, { flags: /connected/i }],
        });
        const desc =
          displayName(player, target) +
          "\n" +
          (target.data?.description || "You see nothing special.") +
          "\n" +
          "contents: " +
          contents.map((item) => displayName(player, item)).join(", ");

        send(ctx.socket.id, desc);
      }
    },
  });
