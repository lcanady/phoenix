import { send } from "../broadcast";
import { addCmd, force } from "../cmds";
import { chans, db } from "../database";
import flags from "../flags";
import { player } from "../utils";

export default () => {
  addCmd({
    name: "@ccreate",
    pattern: /^@ccreate\s+(.*)/i,
    flags: "connected admin+",
    hidden: true,
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid);
      const channel = await chans.findOne({
        name: RegExp(args[1].split("=")[0], "i"),
      });

      if (!channel) {
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
          en.data ||= {};
          en.data.channels ||= [];
          en.data.channels.push({
            channel: name,
            alias,
            active: true,
          });
          await db.update({ _id: en._id }, en);
          ctx.socket.join(name);
          await force(ctx.socket, `${alias} :joins the channel.`);
          send(
            ctx.socket.id,
            `You have joined ${name} with the alias '${alias}'.`
          );
        }
      } else {
        send(ctx.socket.id, `Channel ${args[1].split("=")[0]} already exists.`);
      }
    },
  });

  addCmd({
    name: "@cdelete",
    pattern: /^@cdelete\s+(.*)/i,
    flags: "connected admin+",
    hidden: true,
    render: async (ctx, args) => {
      const chan = await chans.findOne({ name: RegExp(args[1], "i") });

      if (chan) {
        const players = await db.find({ flags: /player/ });
        for (const plyr of players) {
          plyr.data ||= {};
          plyr.data.channels = plyr.data.channels?.filter(
            (c) => c.channel !== chan.name
          );
          await db.update({ _id: plyr._id }, plyr);
        }
        await chans.remove({ _id: chan._id });
        send(ctx.socket.id, `Channel ${args[1]} deleted.`);
      } else {
        send(ctx.socket.id, `Channel ${args[1]} not found.`);
      }
    },
  });

  addCmd({
    name: "@cset",
    pattern: /^[@\+]?cset\s+(.*)\/(.*)\s*=\s*(.*)?/i,
    flags: "connected admin+",
    hidden: true,
    render: async (ctx, args) => {
      const chan = await chans.findOne({ name: RegExp(args[1], "i") });
      if (chan) {
        const key = args[2].toLowerCase();
        const val = args[3];
        if (key === "alias") {
          chan.alias = val;
          await chans.update({ _id: chan._id }, chan);
          send(ctx.socket.id, `Channel ${args[1]} updated.`);
        } else if (key === "header") {
          chan.header = val;
          await chans.update({ _id: chan._id }, chan);
          send(ctx.socket.id, `Channel ${args[1]} updated.`);
        } else if (key === "hidden") {
          chan.hidden = !!val;
          await chans.update({ _id: chan._id }, chan);
          send(ctx.socket.id, `Channel ${args[1]} updated.`);
        } else if (key === "name") {
          const taken = await chans.findOne({ name: RegExp(val, "i") });
          if (!taken) {
            chan.name = val;
            await chans.update({ _id: chan._id }, chan);
            send(ctx.socket.id, `Channel ${args[1]} updated.`);
          } else {
            send(ctx.socket.id, `Channel ${val} already exists.`);
          }
        } else if (key === "alias") {
          chan.alias = val;
          await chans.update({ _id: chan._id }, chan);
          send(ctx.socket.id, `Channel ${args[1]} updated.`);
        } else if (key === "lock") {
          chan.lock = val;
          await chans.update({ _id: chan._id }, chan);
          send(ctx.socket.id, `Channel ${args[1]} updated.`);
        } else {
          send(ctx.socket.id, `Invalid setting ${key}.`);
        }
      } else {
        send(ctx.socket.id, `Channel ${args[1]} not found.`);
      }
    },
  });

  addCmd({
    name: "addcom",
    pattern: /^addcom\s+(.*)\s*=\s*(.*)/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const chan = await chans.findOne({ name: RegExp(args[1], "i") });
      if (!flags.check(ctx.socket.flags || "", chan.lock || "")) {
        send(ctx.socket.id, "Permission denied.");
        return;
      }

      if (chan) {
        const en = await player(ctx.socket.cid);
        en.data ||= {};
        en.data.channels ||= [];
        en.data.channels.push({
          channel: chan.name,
          alias: args[1],
          active: true,
        });
        await db.update({ _id: en._id }, en);
        send(ctx.socket.id, `You join channel ${chan.name}.`);
        ctx.socket.join(chan.name);
        await force(ctx.socket, `${chan.alias} :joins the channel.`);
        send(
          ctx.socket.id,
          `You have joined ${chan.name} with the alias '${chan.alias}'.`
        );
      } else {
        send(ctx.socket.id, `Channel ${args[1]} not found.`);
      }
    },
  });

  addCmd({
    name: "delcom",
    pattern: /^delcom\s+(.*)/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid);
      en.data ||= {};
      en.data.channels ||= [];
      en.data.channels.forEach(async (c) => {
        if (c.alias !== args[1]) return;
        en.data!.channels = en.data?.channels?.filter(
          (c) => c.alias !== args[1]
        );
        send(ctx.socket.id, `You leave channel ${c.channel}.`);
        await force(ctx.socket, `${args[1]} :leaves the channel.`);
        ctx.socket.leave(c.channel);
        await db.update({ _id: en._id }, en);
      });
    },
  });

  addCmd({
    name: "comlist",
    pattern: /^comlist/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid);
      en.data ||= {};
      en.data.channels ||= [];
      let msg = "Your channels:%r";
      msg += "=======================================================%r";
      msg += `ALIAS                  CHANNEL                 STATUS%r`;
      msg += "=======================================================";
      en.data.channels.forEach((c) => {
        msg += `%r${c.alias.padEnd(20)}   ${c.channel.padEnd(20)}    ${
          c.active ? "active" : "inactive"
        }`;
      });
      send(ctx.socket.id, msg);
    },
  });

  addCmd({
    name: "comtitle",
    pattern: /^comtitle\s+(.*)\s*=\s*(.*)/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid);
      en.data ||= {};
      en.data.channels ||= [];
      en.data.channels.forEach(async (c) => {
        if (c.alias !== args[1]) return;
        c.title = args[2];
        await db.update({ _id: en._id }, en);
        send(ctx.socket.id, `Channel ${c.channel} title updated.`);
      });
    },
  });
};
