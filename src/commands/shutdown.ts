import { io } from "../app";
import { addCmd } from "../cmds";
import { db } from "../database";
import flags from "../flags";

export default () =>
  addCmd({
    name: "shutdown",
    pattern: "@shutdown",
    flags: "connected wizard",
    render: async (ctx) => {
      const connected = await db.find({ flags: /connected/ });
      for (const user of connected) {
        const { tags, data } = flags.set(
          user.flags,
          user.data || {},
          "!connected"
        );
        user.flags = tags;
        user.data = data;
        await db.update({ _id: user._id }, user);
      }
      io.emit("chat message", { msg: "Server is shutting down." });
      io.emit("chat message", { msg: "See you space cowboy..." });
      setTimeout(() => process.exit(0), 1000);
    },
  });
