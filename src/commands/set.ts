// Set does a bunch of different things in MUX.  We're going to replicate them slowly as needed.

import e from "express";
import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { canEdit, set, target } from "../utils";

export default () => {
  addCmd({
    name: "set",
    pattern: /^[@/+]?set\s+(.*)\s*=\s*(.*)/i,
    flags: "connected",
    render: async (ctx, args) => {
      const player = await db.findOne({ _id: ctx.socket.cid });
      let target;
      switch (args[1].trim()) {
        case "me":
          target = player;
          break;
        case "here":
          target = await db.findOne({ _id: player.data?.location });
          break;
        default:
          target = await db.findOne({
            $or: [
              { name: args[1] },
              { _id: args[1] },
              { dbref: parseInt(args[1].slice(1), 10) },
            ],
          });
          break;
      }

      if (!target) send(ctx.socket.id, "I can't find that.");
      if (!canEdit(player, target))
        return send(ctx.socket.id, "I can't find that.");
      await set(target, args[2]);
      send(ctx.socket.id, "Set.");
    },
  });

  addCmd({
    name: "data",
    pattern: /^@data\s+(.*)\/(.*)\s*=\s*(.*)?/i,
    flags: "connected admin+",
    render: async (ctx, args) => {
      const player = await db.findOne({ _id: ctx.socket.cid });
      const tar = await target(player, args[1]);

      if (!tar) return send(ctx.socket.id, "I can't find that.");

      if (!canEdit(player, tar)) {
        send(ctx.socket.id, "I can't find that.");
      } else if (args[2].toLowerCase() === "lastcommand") {
        send(ctx.socket.id, "You can't set that.");
      } else if (args[2].toLowerCase() === "attributes") {
        send(ctx.socket.id, "You can't set that.");
      } else if (args[2].toLowerCase() === "channels") {
        send(ctx.socket.id, "You can't set that.");
      } else if (args[2].toLowerCase() === "password") {
        send(ctx.socket.id, "You can't set that.");
      } else {
        tar.data ||= {};
        if (args[3] === "null") delete tar.data[args[2]];
        tar.data[args[2]] = args[3];
        send(ctx.socket.id, "Set.");
        await db.update({ _id: tar._id }, tar);
      }
    },
  });

  addCmd({
    name: "@shortdesc",
    pattern: /^[@/+]?shortdesc\s+(.*)/i,
    flags: "connected",
    render: async (ctx, args) => {
      const player = await db.findOne({ _id: ctx.socket.cid });

      if (player) {
        player.data ||= {};
        player.data.shortdesc = args[1];
        send(ctx.socket.id, "shortdesc set.");
        await db.update({ _id: player._id }, player);
      }
    },
  });

  addCmd({
    name: "@desc",
    pattern: /^[@/+]?des[cription]+\s+(.*)\s*=\s*(.*)/i,
    flags: "connected",
    render: async (ctx, args) => {
      const en = await db.findOne({ _id: ctx.socket.cid });
      const tar = await target(en, args[1]);

      if (!tar) return send(ctx.socket.id, "I can't find that.");
      if (!canEdit(en, tar)) return send(ctx.socket.id, "I can't find that.");

      tar.data ||= {};
      tar.data.description = args[2];
      send(ctx.socket.id, `${tar.name}'s description set.`);
      await db.update({ _id: tar._id }, tar);
    },
  });
};
