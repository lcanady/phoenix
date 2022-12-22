import { matchCmd } from "./cmds";
import { MuSocket } from "./definitions";

process.on("message", ({ text, data = {}, scope = {} }, s: MuSocket) => {
  matchCmd({ socket: s, text, data, scope });
});
