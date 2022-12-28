import { sha512 } from "js-sha512";
import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { player } from "../utils";

export default () => {
  addCmd({
    name: "@password",
    pattern: /^[@/+]?password\s+(.*)\s*=\s*(.*)/i,
    flags: "connected",
    render: async (ctx, args) => {
      // We need to validate the players current password.
      // if it works, we can update the password.
      // if it doesn't work, we need to tell the player that.
      const en = await player(ctx.socket.cid || "");
      const [oldPassword, newPassword] = args.slice(1);
      if (en.data?.password === sha512(oldPassword)) {
        en.data.password = sha512(newPassword);
        await db.update({ _id: en._id }, en);

        send(ctx.socket.id, "You have changed your password.");
      } else {
        send(ctx.socket.id, "Permission denied.");
      }
    },
  });
};
