import { join } from "path";
import { io } from "../app";
import { addCmd, cmds } from "../cmds";
import { db } from "../database";
import { plugins } from "../utils";

export default () =>
  addCmd({
    name: "reboot",
    pattern: /^@reboot$|^@restart$/g,
    flags: "connected wizard",
    render: async (ctx) => {
      const player = await db.findOne({ _id: ctx.socket.cid });
      io.emit("chat message", {
        msg: `Server reboot initiated by ${player.name}...`,
      });
      cmds.length = 0;
      await plugins(join(__dirname, "../commands"));
      io.emit("chat message", { msg: "...Reboot Complete." });
    },
  });
