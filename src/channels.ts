import { send } from "./broadcast";
import { force } from "./cmds";
import { chans, db } from "./database";
import { Context } from "./definitions";
import { player } from "./utils";

export const matchChannel = async (ctx: Context) => {
  if (ctx.socket.cid) {
    const en = await player(ctx.socket.cid || "");
    const parts = ctx.text.split(" ");
    const trig = parts[0];
    let msg = parts.slice(1).join(" ").trim();
    const match = msg.match(/^(:|;)?(.*)$/i);

    const chan = en.data?.channels?.find((c) => c.alias === trig);
    const channel = await chans.findOne({ name: chan?.channel });
    if (match) {
      if (match[1] === ":") {
        msg = `${chan?.title || ""}${chan?.mask ? chan.mask : en.name} ${
          match[2]
        }`;
      } else if (match[1] === ";") {
        msg = `${chan?.title || ""}${chan?.mask ? chan.mask : en.name}${
          match[2]
        }`;
      } else if (msg.toLowerCase() === "on" && chan?.active === false) {
        chan.active = true;
        ctx.socket.join(chan.channel);
        await db.update({ _id: en._id }, en);
        force(ctx.socket, `${chan.alias} :has joined the channel.`);
        send(ctx.socket.id, `You have joined channel ${chan.channel}.`);
        return true;
      } else if (msg.toLowerCase() === "off" && chan?.active === true) {
        await force(ctx.socket, `${chan.alias} :has left the channel.`);
        chan.active = false;
        ctx.socket.leave(chan.channel);
        await db.update({ _id: en._id }, en);
        send(ctx.socket.id, `You have left channel ${chan.channel}.`);
        return true;
      } else {
        msg = `${chan?.title || ""}${
          chan?.mask ? chan.mask : en.name
        } says, "${msg}"`;
      }

      if (channel && chan?.active) {
        send(channel.name, `${channel.header} ${msg}`);
        return true;
      }
    }
    return false;
  }
};
