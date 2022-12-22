import { send } from "../broadcast";
import { addCmd } from "../cmds";
import parser from "../parser";

export default () =>
  addCmd({
    name: "think",
    pattern: "think *",
    flags: "connected",
    render: async (ctx, args) => {
      send(
        ctx.socket.id,
        (await parser.run({ msg: args[1], data: {}, scope: {} })) || ""
      );
    },
  });
