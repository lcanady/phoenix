import { send } from "../broadcast";
import { addCmd, force } from "../cmds";
import { db } from "../database";
import { DbObj } from "../definitions";
import { canEdit, dbObj, displayName, id, player, target } from "../utils";

export default () => {
  addCmd({
    name: "@dig",
    pattern: /^[@/+]?dig(?:\/(.*))?\s+([^=]+)(?:\s*=\s*(.*))?/i,
    flags: "connected builder+",
    render: async (ctx, args) => {
      const [, swtch, room, exits] = args;
      const en = await player(ctx.socket.cid || "");
      const [to, from] = exits.split(",");

      // Dig the room.
      let obj: DbObj = {
        name: room,
        dbref: await id(),
        data: {},
        flags: "room",
      };
      const roomObj = await db.insert(obj);
      send(ctx.socket.id, `Room ${room} created with dbref #${roomObj.dbref}.`);

      // If to exit exits, dig it.
      if (to) {
        obj = {
          name: to,
          dbref: await id(),
          data: {
            location: en.data?.location,
            destination: roomObj._id,
          },
          flags: "exit",
        };

        const toObj = await db.insert(obj);
        send(
          ctx.socket.id,
          `Exit ${to.split(";")[0]} created with dbref #${toObj.dbref}.`
        );
      }

      // from exit exits, dig it.
      if (from) {
        obj = {
          name: from,
          dbref: await id(),
          data: {
            location: roomObj._id,
            destination: en.data?.location,
          },
          flags: "exit",
        };

        const fromObj = await db.insert(obj);
        send(
          ctx.socket.id,
          `Exit ${from.split(";")[0]} created with dbref #${fromObj.dbref}.`
        );
      }

      // tel them there if needed.
      if (swtch.toLowerCase() == "teleport") {
        force(ctx.socket, `teleport #${roomObj.dbref}`);
      }
    },
  });

  addCmd({
    name: "@destroy",
    pattern: /^[@/+]?destroy(?:\/(.*))?\s+(.*)/i,
    flags: "connected builder+",
    render: async (ctx, args) => {
      const [swtch, name] = args.slice(1);
      const en = await player(ctx.socket.cid || "");
      const obj = await target(en, name);

      if (!obj || !canEdit(en, obj))
        return send(ctx.socket.id, "You can't destroy that.");
      if (
        obj &&
        obj.flags.includes("safe") &&
        swtch?.toLowerCase() !== "override"
      )
        return send(
          ctx.socket.id,
          "You can't destroy that. It's safe. Try using the 'override' switch."
        );
      // send the player home if they're in a place that's being destroyed.
      if (obj && obj._id === en.data?.location) {
        await force(ctx.socket, `teleport me=${en.data?.home || "#0"}`);
      }
      await db.remove({ _id: obj._id });
      send(ctx.socket.id, `You destroy ${displayName(en, obj)}.`);
      const exits = await db.find({
        $and: [
          {
            $or: [
              { "data.destination": obj._id },
              { "data.location": obj._id },
            ],
          },
          { flags: /exit/ },
        ],
      });

      // destroy any exits that would be orphaned.
      for (const exit of exits) {
        await db.remove({ _id: exit._id });
      }
    },
  });

  addCmd({
    name: "@teleport",
    pattern: /^[@/+]?te[leport]+\s+(.*)\s*=\s*(.*)/i,
    flags: "connected",
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid || "");
      const tar = await target(en, args[2]);

      if (!tar) return send(ctx.socket.id, "You can't teleport there.");
      if (tar && !tar.flags.includes("room")) {
        return send(ctx.socket.id, "You can only teleport to rooms.");
      }

      if (
        tar &&
        tar.flags.includes("room") &&
        (!tar.flags.includes("no_teleport") || canEdit(en, tar))
      ) {
        en.data ||= {};
        const from = en.data.location;
        const to = tar._id;
        ctx.socket.leave(from || "");
        send(from || "", `${en.name} teleports away.`);
        en.data.location = to;
        send(to || "", `${en.name} teleports in.`);
        ctx.socket.join(to || "");
        await db.update({ _id: en._id }, en);
        send(ctx.socket.id, `You teleport to ${tar.name}.`);
        await force(ctx.socket, `look`);
        return;
      } else {
        return send(ctx.socket.id, "You can't teleport there.");
      }
    },
  });

  addCmd({
    name: "@open",
    pattern: /^[@/+]?open\s+(.*)/i,
    flags: "connected builder+",
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid || "");
      const [name, room] = args[1].split("=");
      const roomObj = room && (await target(en, room || ""));

      const exit = await dbObj(name, "exit", {
        location: en.data?.location,
        destination: roomObj && roomObj._id,
      });

      if (roomObj) {
        send(
          ctx.socket.id,
          `You open exit ${displayName(en, exit)} to ${displayName(
            en,
            roomObj
          )}.`
        );
      } else {
        send(ctx.socket.id, `You open exit ${displayName(en, exit)}.`);
      }
    },
  });

  addCmd({
    name: "@link",
    pattern: /^[@/+]?link\s+(.*)\s*=\s*(.*)/i,
    flags: "connected builder+",
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid || "");
      const [from, to] = args.slice(1);

      const fromObj = await target(en, from);
      const toObj = await target(en, to);

      if (
        fromObj &&
        toObj &&
        fromObj.flags.includes("player") &&
        canEdit(en, fromObj) &&
        canEdit(en, toObj) &&
        toObj.flags.includes("room")
      ) {
        fromObj.data ||= {};
        fromObj.data.home = toObj._id;
        await db.update({ _id: fromObj._id }, fromObj);
        return send(
          ctx.socket.id,
          `You link ${displayName(en, fromObj)} to ${displayName(en, toObj)}.`
        );
      }

      if (
        fromObj &&
        toObj &&
        fromObj.flags.includes("exit") &&
        canEdit(en, fromObj) &&
        canEdit(en, toObj) &&
        toObj.flags.includes("room")
      ) {
        fromObj.data ||= {};
        fromObj.data.destination = toObj._id;
        await db.update({ _id: fromObj._id }, fromObj);
        return send(
          ctx.socket.id,
          `You link ${displayName(en, fromObj)} to ${displayName(en, toObj)}.`
        );
      }

      return send(ctx.socket.id, "You can't link there.");
    },
  });
};
