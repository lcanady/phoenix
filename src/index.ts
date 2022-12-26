import { join } from "path";
import { server } from "./app";
import { db } from "./database";
import { plugins, set } from "./utils";

server.listen(3001, async () => {
  console.log("Server is running on port 3000");
  plugins(join(__dirname, "commands"));
  const players = await db.find({ flags: /connected/ });
  for (const player of players) {
    await set(player, "!connected");
  }
  const limbo = await db.findOne({ dbref: 0 });
  if (!limbo) {
    console.log("No Limbo!, creating one!");
    await db.insert({
      name: "Limbo",
      dbref: 0,
      flags: "room",
    });
  }
});

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  console.log("Clearing the DB....");
  const players = await db.find({ flags: /connected/ });
  for (const player of players) {
    await set(player, "!connected");
  }
  console.log("Done!");

  process.exit();
});
