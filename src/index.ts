import { join } from "path";
import { server } from "./app";
import { db } from "./database";
import { plugins } from "./utils";

server.listen(3001, async () => {
  console.log("Server is running on port 3000");
  plugins(join(__dirname, "commands"));
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
