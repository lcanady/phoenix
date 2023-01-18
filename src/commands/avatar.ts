import axios from "axios";
import { createWriteStream } from "fs";
import { unlink, writeFile } from "fs/promises";
import { send } from "../broadcast";
import { addCmd } from "../cmds";
import { db } from "../database";
import { canEdit, displayName, player, target } from "../utils";

export default () => {
  addCmd({
    name: "avatar",
    pattern: /^[@/+]?avatar\s+(.*)\s*=\s*(.*)/i,
    flags: "connected",
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid || "");
      const tar = await target(en, args[1]);
      if (!tar || !canEdit(en, tar))
        return send(ctx.socket.id, "I don't see that here");

      tar.data ||= {};
      if (en.data?.avatar) unlink(`./public/uploads/${tar.data.avatar}`);
      tar.data.avatar = "";

      if (args[2]) {
        try {
          const res = await axios.get(args[2], {
            responseType: "stream",
          });

          const name = `${tar._id}-${Date.now()}.${
            args[2].split(".").pop() || "png"
          }`;
          const writer = createWriteStream(`./public/uploads/${name}`);

          await new Promise((resolve, reject) => {
            res.data.pipe(writer);
            let error: any = null;
            writer.on("error", (err) => {
              error = err;
              writer.close();
              reject(err);
            });
            writer.on("close", () => {
              if (!error) {
                resolve(true);
              }
            });
          });

          tar.data ||= {};
          tar.data.avatar = name;
          await db.update({ _id: tar._id }, tar);
          send(ctx.socket.id, `Avatar for %xh${displayName(en, tar)}%cn set.`);
        } catch (error: any) {
          send(ctx.socket.id, `Error: ${error.message}`);
        }
      } else {
        tar.data ||= {};
        await unlink(`./public/uploads/${tar.data.avatar}`).catch(() => {}); // ignore errors if file doesn't exist
        tar.data.avatar = "";
        await db.update({ _id: tar._id }, tar);
        send(
          ctx.socket.id,
          `Avatar for %xh${displayName(en, tar)}%cn cleared.`
        );
      }
    },
  });

  addCmd({
    name: "header",
    pattern: /^[@/+]?header\s+(.*)\s*=\s*(.*)/i,
    flags: "connected",
    render: async (ctx, args) => {
      try {
        const en = await player(ctx.socket.cid || "");
        const tar = await target(en, args[1]);
        if (!tar || !canEdit(en, tar))
          return send(ctx.socket.id, "I don't see that here");

        tar.data ||= {};
        if (en.data?.header) unlink(`./public/uploads/${tar.data.header}`);
        tar.data.header = "";

        if (args[2]) {
          const res = await axios.get(args[2], {
            responseType: "stream",
          });

          const name = `${tar._id}-${Date.now()}.${
            args[2].split(".").pop() || "png"
          }`;
          const writer = createWriteStream(`./public/uploads/${name}`);

          await new Promise((resolve, reject) => {
            res.data.pipe(writer);
            let error: any = null;
            writer.on("error", (err) => {
              error = err;
              writer.close();
              reject(err);
            });
            writer.on("close", () => {
              if (!error) {
                resolve(true);
              }

              tar.data ||= {};
              tar.data.header = name;
              db.update({ _id: tar._id }, tar);

              send(
                ctx.socket.id,
                `Header for %xh${displayName(en, tar)}%cn set.`
              );
            });
          });
        }
      } catch (error: any) {
        send(ctx.socket.id, `Error: ${error.message}`);
      }
    },
  });
};
