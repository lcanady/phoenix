import { sha512 } from "js-sha512";
import { send } from "../broadcast";
import { addCmd, force } from "../cmds";
import { db } from "../database";
import flags from "../flags";
import { signToken } from "../jwt";
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
          token: await signToken(user._id || ""),
          user: {
            id: user?._id,
            dbref: `#${user.dbref}`,
            username: user?.name,
            flags: user?.flags,
            isAdmin: flags.check(user?.flags || "", "builder+"),
            avatar: user?.data?.avatar,
            header: user?.data?.header,
          },
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
