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
        if (tar.data.owner) output += `%chOwner:%cn ${tar.data.owner}\n`;
        if (tar.data.lock) output += `%chLock:%cn ${tar.data.lock}\n`;
        tar.data.attributes?.forEach((attr) => {
          output += `%ch${attr.name}[${attr.setter}]%cn: ${attr.value}\n`;
        });

        return send(ctx.socket.id, output);
      }
      send(ctx.socket.id, "You can't examine that.");
    },
  });

  addCmd({
    name: "examine/data",
    pattern: /^e[xamine]+\/data\s+(.*)/i,
    flags: "connected builder+",
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
        output += `%chData:%cn ${JSON.stringify(tar.data, null, 2)}`;

        return send(ctx.socket.id, output);
      }
      send(ctx.socket.id, "You can't examine that.");
    },
  });
};
