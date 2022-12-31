import { send } from "../broadcast";
import { addCmd, force } from "../cmds";
import { db } from "../database";
import { player } from "../utils";

export default () => {
  addCmd({
    name: "home",
    pattern: "home",
    flags: "connected",
    render: async (ctx) => {
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      en.data ||= {};
      const home = en.data.home;
      if (!home) return send(ctx.socket.id, "You don't have a home set.");

      send(en.data.location || "", `${en.name} disappears in a puff of smoke.`);
      ctx.socket.leave(en.data.location || "");
      en.data.location = en.data.home;
      send(en.data.location || "", `${en.name} appears in a puff of smoke.`);
      ctx.socket.join(en.data.location || "");
      db.update({ _id: en._id }, en);
      send(ctx.socket.id, "You arrive home.");
      await force(ctx.socket, "look");
    },
  });
};
