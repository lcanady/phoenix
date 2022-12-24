import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { canEdit, displayName, target } from "../utils";

export default () => {
  addCmd({
    name: "examine",
    pattern: /^e[xamine]+\s+(.*)$/i,
    flags: "connected",
    render: async (ctx, args) => {
      const en = await db.findOne({ _id: ctx.socket.cid });
      const tar = await target(en, args[1]);

      if (en && tar && canEdit(en, tar)) {
        delete tar.data?.password;
        let output = `%chName:%cn ${tar.name}\n`;
        output += `%chDBRef:%cn #${tar.dbref}\n`;
        output += `%chFlags:%cn ${tar.flags}\n`;
        output += `Location: ${displayName(
          en,
          await db.findOne({ _id: en.data?.location })
        )}\n`;
        output += `Owner: ${tar.data?.owner}\n`;
        output += `Contents: ${tar.data?.contents}\n`;
        output += `Exits: ${tar.data?.exits}\n`;
        output += `Data: ${JSON.stringify(tar.data, null, 2)}`;
        send(ctx.socket.id, output);
      }
      send(ctx.socket.id, "You can't examine that.");
    },
  });
};
