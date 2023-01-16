import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";

export default () =>
  addCmd({
    name: "pose",
    pattern: /^(pose\s+|:|;)(.*)$/i,
    flags: "connected",
    render: async (ctx, args) => {
      const player = await db.findOne({ _id: ctx.socket.cid });
      const msg =
        args[1] === ";"
          ? `${player.name}${args[2]}%cn`
          : `${player.name} ${args[2]}%cn`;
      if (player) {
        send(player.data?.location || "", msg, {
          cmd: "pose",
          enactor: {
            _id: player._id,
            dbref: `#${player.dbref}`,
            name: player.name,
            avatar: player.data?.avatar || "",
          },
        });
      }
    },
  });
