import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { chans } from "../database";

export default () => {
  addCmd({
    name: "@ccreate",
    pattern: /^@ccreate\s+(.*)/i,
    flags: "connected admin+",
    render: async (ctx, args) => {
      const parts = args[1].split("=");
      const name = parts[0];
      const alias = parts[1];

      const chan = chans.insert({
        name,
        header: `%ch[${name}]%cn`,
        hidden: false,
        alias,
      });

      send(ctx.socket.id, `Channel ${name} created.`);

      if (alias) {
        ctx.socket.join(name);
      }
    },
  });
};
