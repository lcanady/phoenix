import { sha512 } from "js-sha512";
import { send } from "../broadcast";
import { addCmd, force } from "../cmds";
import { db } from "../database";
import flags from "../flags";
import { login } from "../utils";

export default () =>
  addCmd({
    name: "connect",
    pattern: "connect * *",
    flags: "!connected",
    hidden: true,
    render: async (ctx, args) => {
      const user = await db.findOne({
        name: RegExp(args[1], "i"),
        "data.password": sha512(args[2]),
      });

      if (user) {
        const { tags, data } = flags.set(
          user.flags,
          user.data || {},
          "connected"
        );
        await db.update(
          { _id: user._id },
          { ...user, ...{ flags: tags }, ...data }
        );
        ctx.data.player = user;
        send(ctx.socket.id, `Welcome back to the server, ${user.name}!`, {
          cid: user._id,
        });
        await login(ctx, user);
        await force(ctx.socket, "@mail/notify");
        await force(ctx.socket, "@myjobs");
        await force(ctx.socket, "look");
      } else {
        send(ctx.socket.id, "Invalid username or password");
      }
    },
  });
