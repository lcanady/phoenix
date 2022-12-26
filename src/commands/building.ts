import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { DbObj } from "../definitions";
import { id, player } from "../utils";

export default () => {
  addCmd({
    name: "@dig",
    pattern: /^[@/+]?dig\s+([^=]+)(?:\s*=\s*(.*))?/i,
    flags: "connected builder+",
    render: async (ctx, args) => {
      const [, room, exits] = args;
      const en = await player(ctx.socket.cid);
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
    },
  });
};
