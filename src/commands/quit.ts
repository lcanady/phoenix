import { io } from "../app";
import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import flags from "../flags";

export default () =>
  addCmd({
    name: "quit",
    pattern: "quit",
    flags: "connected",
    render: async (ctx) => {
      if (ctx.socket.cid) {
        const user = await db.findOne({ _id: ctx.socket.cid });
        if (user) {
          const { tags } = flags.set(user.flags || "", {}, "!connected");
          await db.update({ _id: user._id }, { ...{ flags: tags }, ...user });
          await db.update({ _id: ctx.data._id }, { flags: tags });
          ctx.socket.emit("chat message", "Disconnected");
        }
      }

      ctx.socket.request.session.destroy(async () => {
        send(ctx.socket.id, "See You, Space Cowboy...");
        setTimeout(() => io.to(ctx.socket.id).disconnectSockets(true), 100);
      });
    },
  });
