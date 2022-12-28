import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { player, target } from "../utils";

export default () => {
  addCmd({
    name: "page",
    pattern: /^(?:p|page)\s+(?:(.*)\s*=\s*(.*)|(.*))/i,
    flags: "connected",
    render: async (ctx, args) => {
      const [obj, msg, reply] = args.slice(1);
      const en = await player(ctx.socket.cid || "");
      const tars = obj?.split(" ") || en.data?.lastpage || [];
      const targets = [];
      for (const tar of tars) {
        const t = await target(en, tar);
        if (t) targets.push(t);
      }

      // we need to build two lists, a list of target._ids and a list of targets
      // with their Name(alias) notation. We'll use the latter to display the list in
      // the page message.

      const targetIds = targets
        .filter((t) =>
          t._id && t._id !== en._id && t.flags.includes("connected")
            ? true
            : false
        )

        .filter(Boolean)
        .map((t) => t._id!);
      const targetNames = targets.map(
        (t) => `${t.name}${t.data?.alias ? "(" + t.data.alias + ")" : ""}`
      );

      // now we can send the page message to the targets
      let msgOrReply = msg ? msg.trim() : reply.trim();
      let tempmsg = "";
      let sendermsg = "";
      let senderHeader = `To (${targetNames.join(", ")}),`;
      let header =
        targetIds.length > 1 ? `To (${targetNames.join(", ")}),` : "From afar,";
      switch (true) {
        case msgOrReply.trim().startsWith(";"):
          tempmsg = `${header} ${en.name}${
            en.data?.alias ? "(" + en.data?.alias + ")" : ""
          }${msgOrReply.slice(1)}`;
          sendermsg = `${senderHeader} ${en.name}${
            en.data?.alias ? "(" + en.data?.alias + ")" : ""
          }${msgOrReply.slice(1)}`;

          break;
        case msgOrReply.trim().startsWith(":"):
          tempmsg = `${header} ${en.name}${
            en.data?.alias ? "(" + en.data?.alias + ")" : ""
          } ${msgOrReply.slice(1)}`;

          sendermsg = `${senderHeader} ${en.name}${
            en.data?.alias ? "(" + en.data?.alias + ")" : ""
          } ${msgOrReply.slice(1)}`;
          break;
        default:
          tempmsg = `${header} ${en.name}${
            en.data?.alias ? "(" + en.data?.alias + ")" : ""
          } pages: ${msgOrReply}`;

          sendermsg = `${senderHeader} ${en.name}${
            en.data?.alias ? "(" + en.data?.alias + ")" : ""
          } pages: ${msgOrReply}`;
      }

      if (en.data?.lastpage && reply) {
        send(ctx.socket.id, sendermsg);
        return send(en.data.lastpage, tempmsg);
      }

      if (!targetIds.length && !en.data?.lasstpage) {
        return send(ctx.socket.id, "No one to page.");
      }

      // now we can send the page message to the targets
      const targts = Array.from(new Set(targetIds));
      send(targts, tempmsg);
      send(ctx.socket.id, sendermsg);
      en.data ||= {};
      en.data.lastpage = targts;
      await db.update({ _id: en._id }, en);
    },
  });
};
