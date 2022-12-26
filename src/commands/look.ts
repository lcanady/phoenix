import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { center, columns, displayName, idle, ljust, rjust } from "../utils";

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

        const exits = await db.find({
          $and: [{ "data.location": target?._id }, { flags: /exit/i }],
        });
        let desc =
          center(`%ch%b${displayName(player, target)}%b%cn`, 80, "=") +
          "\n" +
          (target.data?.description || "You see nothing special.") +
          "\n";

        if (contents.length) {
          desc += [center("%ch%bCharacters%cn%b", 80, "-")] + "\n";
          for (const cont of contents.sort((a, b) =>
            a.name.localeCompare(b?.name)
          )) {
            desc +=
              ljust(displayName(player, cont), 25) +
              rjust(
                idle(
                  (cont._id === player._id ? 0 : cont.data?.lastCommand) || 0
                ),
                5
              );
            const shortdesc = cont.data?.shortdesc
              ? "%b%b" + cont.data?.shortdesc
              : "%b%b%ch%cxUse '@shortdesc <desc>' to set this.%cn";
            desc += shortdesc.padEnd(48) + "\n";
          }
        }

        if (exits.length) {
          desc +=
            [center("%ch%bExits%cn%b", 80, "-")] +
            columns(
              exits
                .map((item) => displayName(player, item))
                .sort((a, b) => a.localeCompare(b)),
              80,
              2
            );
        }
        desc += "=".repeat(80);
        send(ctx.socket.id, desc);
      }
    },
  });
