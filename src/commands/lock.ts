import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { canEdit, displayName, player, target } from "../utils";

export default () => {
  addCmd({
    name: "@lock",
    pattern: /^[@\+]?lock\s+(.*)\s*=\s*(.*)/i,
    flags: "connected builder+",
    render: async (ctx, args) => {
      const [obj, key] = args.slice(1);
      const en = await player(ctx.socket.cid || "");
      const tar = await target(en, obj);

      if (!tar || !canEdit(en, tar))
        send(ctx.socket.id, "You can't lock that.");
      if (tar && canEdit(en, tar)) {
        tar.data ||= {};
        tar.data.lock = key;
        await db.update({ _id: tar._id }, tar);
        send(ctx.socket.id, `You lock ${displayName(en, tar)}.`);
      }
    },
  });

  addCmd({
    name: "@unlock",
    pattern: /^[@\+]?unlock\s+(.*)/i,
    flags: "connected builder+",
    render: async (ctx, args) => {
      const [obj] = args.slice(1);
      const en = await player(ctx.socket.cid || "");
      const tar = await target(en, obj);

      if (!tar || !canEdit(en, tar))
        send(ctx.socket.id, "You can't unlock that.");
      if (tar && canEdit(en, tar)) {
        tar.data ||= {};
        tar.data.lock = "";
        await db.update({ _id: tar._id }, tar);
        send(ctx.socket.id, `You unlock ${displayName(en, tar)}.`);
      }
    },
  });
};
