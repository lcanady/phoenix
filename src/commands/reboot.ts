import { join } from "path";
import { io } from "../app";
import { broadcast } from "../broadcast";
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
      broadcast(`%chGAME:%cn Server reboot initiated by ${player.name}...`);
      cmds.length = 0;
      await plugins(join(__dirname, "../commands"));
      broadcast("%chGAME:%cn Reboot complete.");
    },
  });
