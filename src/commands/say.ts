import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";

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
          `${player.name} says, "${args[2]}%cn"`
        );
      }
    },
  });
