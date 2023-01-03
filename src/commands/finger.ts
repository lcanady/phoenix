import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { center, displayName, player, target } from "../utils";

export default () => {
  addCmd({
    name: "finger",
    pattern: /^[\+@]?finger\s+(.*)/i,
    flags: "connected",
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid || "");
      const tar = await target(en, args[1]);
      if (!tar) return send(ctx.socket.id, "I don't see that player here.");

      let output =
        center(`%bFinger Info For %ch${displayName(en, tar)}%cn%b`, 78, "=") +
        "\n";

      output += `Alias: %ch${tar.data?.alias}%cn\n`;
      send(ctx.socket.id, output);
    },
  });
};
