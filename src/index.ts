import { sha512 } from "js-sha512";
import { join } from "path";
import { server } from "./app";
import { chans, db } from "./database";
import { id, plugins, set } from "./utils";
import config from "config";
server.listen(config.get("server.port"), async () => {
  console.log(`Server started on port ${config.get("server.port")}`);
  plugins(join(__dirname, "commands"));

  const players = await db.find({ flags: /connected/ });
  const users = await db.find({});

  for (const player of players) {
    await set(player, "!connected");
  }

  // Create Limbo if it doesn't exist
  let room;
  const limbo = await db.findOne({ dbref: 0 });
  if (!limbo) {
    console.log("No Limbo!, creating one!");
    room = await db.insert({
      name: "Limbo",
      dbref: 0,

      flags: "room",
    });

    // Create a wizard if there are no players
    if (!users.length && room) {
      console.log("No players found, creating one!");
      const wizard = await db.insert({
        dbref: await id(),
        name: "wizard",
        flags: "player wizard",

        data: {
          password: sha512("potrzebie"),
          location: room?._id,
          home: room?._id,
        },
      });
    }
  }

  // create the default channels
  const channels = await chans.find({});
  if (!channels.length) {
    console.log("No channels found, creating some!");
    await chans.insert({
      name: "Public",
      header: "%ch%cc[Public]%cn",
      alias: "pub",
    });

    await chans.insert({
      name: "Admin",
      header: "%ch%cy[Admin]%cn",
      alias: "ad",
      lock: "admin+",
    });
  }
});

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  console.log("Clearing the DB....");
  const players = await db.find({ flags: /connected/ });
  for (const player of players) {
    delete player.data?.lastpage;
    delete player.data?.lastcommand;
    await set(player, "!connected");
  }
  console.log("Done!");

  process.exit();
});

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  // application specific logging, throwing an error, or other logic here
});
