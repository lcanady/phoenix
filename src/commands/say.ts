import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import flags from "../flags";

export default () =>
  addCmd({
    name: "say",
    pattern: /^(say\s+|")(.*)$/i,
    flags: "connected",
    render: async (ctx, args) => {
      const player = await db.findOne({ _id: ctx.socket.cid });

      if (player) {
        send(
          player.data?.location || "",
          `${player.name} says, "${args[2]}%cn"`,
          {
            cmd: "say",
            enactor: {
              _id: player._id,
              dbref: `#${player.dbref}`,
              name: player.name,
              flgs: flags.codes(player.flags),
              avatar: player.data?.avatar || "",
            },
          }
        );
      }
    },
  });
