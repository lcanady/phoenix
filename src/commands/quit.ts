import { io } from "../app";
import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { set } from "../utils";

export default () =>
  addCmd({
    name: "quit",
    pattern: "quit",
    render: async (ctx) => {
      ctx.socket.request.session.destroy(async () => {
        if (ctx.socket.cid) {
          const user = await db.findOne({ _id: ctx.socket.cid });
          if (user) await set(user, "!connected");
        }
        send(ctx.socket.id, "See You, Space Cowboy...");
        setTimeout(() => io.to(ctx.socket.id).disconnectSockets(true), 100);
      });
    },
  });
