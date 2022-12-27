import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import flags from "../flags";
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
        let output = `%chName:%cn ${tar.name}${
          tar.data?.alias ? "(" + tar.data?.alias.toUpperCase() + ")" : ""
        }\n`;
        output += `%chID:%cn ${tar._id}\n`;
        output += `%chDBRef:%cn #${tar.dbref}\n`;
        output += `%chFlags:%cn ${tar.flags}\n`;
        output += `Location: ${displayName(
          en,
          await db.findOne({ _id: en.data?.location })
        )}\n`;
        tar.data ||= {};
        tar.data.attributes ||= [];

        if (tar.data?.lock) output += `Lock: ${tar.data.lock}\n`;
        if (tar.data?.owner) output += `Owner: ${tar.data.owner}\n`;
        tar.data.attributes?.forEach((attr) => {
          output += `%ch${attr.name}[${attr.setter}]%cn: ${attr.value}\n`;
        });

        if (flags.check(en.flags, "builder+")) {
          output += `Data: ${JSON.stringify(tar.data, null, 2)}`;
        }

        return send(ctx.socket.id, output);
      }
      send(ctx.socket.id, "You can't examine that.");
    },
  });
};
