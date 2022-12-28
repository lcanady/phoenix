import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { player, target } from "../utils";

export default () => {
  addCmd({
    name: "@alias",
    pattern: /^@?alias\s+(.+?)\s*=\s*(.+?)$/i,
    flags: "connected",
    render: async (ctx, args) => {
      const [, name, alias] = args;
      const en = await player(ctx.socket.cid!);
      const tar = await target(en, name);

      if (tar) {
        tar.data ||= {};
        tar.data.alias = alias;
        send(ctx.socket.id, `Alias for ${tar.name} set to ${alias}`);
        await db.update({ _id: tar._id }, tar);
      }
    },
  });
};
