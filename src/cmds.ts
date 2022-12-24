import { readdir } from "fs/promises";
import { send } from "./broadcast";
import { matchChannel } from "./channels";
import { db } from "./database";
import { Cmd, Context, MuSocket } from "./definitions";
import flags from "./flags";

let cmds: Cmd[] = [];
let text: Map<string, string> = new Map();

/**
 * Add a list of command objects to the game.
 * @param commands A comma seperated list of command objects to be added to the game.
 * @example
 * addCmd({
 *  name: "test",
 *  pattern: "test",
 *  flags: "connected",
 *  render: (ctx) => await end(ctx.id, "This is a test!")
 * })
 * @returns
 */
export const addCmd = (...commands: Cmd[]) =>
  commands.forEach((cmd) => {
    if (typeof cmd.pattern === "string") {
      const tempPattern = cmd.pattern
        .replace(/([\/\+\(\))])/g, "\\$1")
        .replace(/\*/g, "(.*)")
        .replace(/\s+/, "\\s+")
        .replace(/=/g, "\\s*=\\s*")
        .replace(/^\./, "[\\+@]?");
      cmd.pattern = new RegExp("^" + tempPattern, "i");
    }

    cmds.push(cmd);
  });
/**
 * Match a command pattern and flags with a player.
 * @param ctx The Context being fed to the match system
 * @returns
 */
export const matchCmd = async (ctx: Context) => {
  const player = await db.findOne({ _id: ctx.socket.cid });
  const chans = player?.data?.channels || [];

  if (!(await matchChannel(ctx))) {
    for (const cmd of cmds) {
      const matches = ctx?.text?.replace("\r\n", "").match(cmd?.pattern);
      if (matches) {
        if (flags.check(player?.flags || "", cmd?.flags || "")) {
          ctx.data.player = player;
          return cmd?.render(ctx, matches);
        }
      }
    }
  } else {
    return;
  }

  if (player) return send(ctx.socket.id, "Huh? (Type 'help' for help.)");
};

export const force = async (
  socket: MuSocket,
  text: string,
  args?: string[]
) => {
  const ctx: Context = {
    socket: socket,
    text: text,
    data: {
      player: null,
      args: args,
    },
    scope: {},
  };
  await matchCmd(ctx);
};

export { cmds, text };
