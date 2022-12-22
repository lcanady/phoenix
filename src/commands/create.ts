import { sha512 } from "js-sha512";
import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { Cmd } from "../definitions";
import { id, login } from "../utils";

export default () =>
  addCmd({
    name: "create",
    pattern: "create * *",
    flags: "!connected",
    hidden: true,
    render: async (ctx, args) => {
      const used = await db.findOne({ name: RegExp(args[1], "i") });
      const limbo = await db.findOne({
        $or: [{ name: "Limbo" }, { dbref: 0 }],
      });
      if (!used) {
        const user = await db.insert({
          name: args[1],
          dbref: await id(),
          flags: "player connected",
          data: {
            location: limbo._id,
            home: limbo._id,
            password: sha512(args[2]),
          },
        });

        send(ctx.socket.id, `Welcome to the game, ${args[1]}!`);
        await login(ctx, user);
      } else {
        send(ctx.socket.id, "That name is already in use");
      }
    },
  });
