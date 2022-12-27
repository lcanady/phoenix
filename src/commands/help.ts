import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { send } from "../broadcast";
import { addCmd, cmds, text } from "../cmds";
import { db } from "../database";
import flags from "../flags";
import parser from "../parser";
import { center, columns, repeatString } from "../utils";

export default async () => {
  const dirent = await readdir(join(__dirname, "../../help"), {
    withFileTypes: true,
  });
  const files = dirent.filter(
    (dirent) => dirent.isFile() && dirent.name.endsWith(".md")
  );
  for (const file of files) {
    const textFile = await readFile(
      join(__dirname, `../../help/${file.name}`),
      "utf8"
    );
    text.set(`${file.name.replace(".md", "")}`, textFile);
  }

  addCmd({
    name: "help",
    pattern: /^[/+]?help$/i,
    hidden: true,
    render: async (ctx) => {
      const player = await db.findOne({ _id: ctx.socket.cid });
      const flgs = player?.flags || "";
      let commands: any = [];
      text.forEach(
        (_, key) =>
          key.match(/^topic_/) && commands.push(key.replace(/^topic_/, ""))
      );

      commands = [
        ...commands,
        ...cmds
          .filter((cmd) => !cmd.hidden)
          .filter((cmd) => flags.check(flgs, cmd.flags || ""))
          .map((cmd) =>
            text.has(`help_${cmd.name}`) ? cmd.name : `%cr${cmd.name}*%cn`
          ),
      ].sort((a, b) =>
        parser
          .stripSubs("telnet", a)
          .localeCompare(parser.stripSubs("telnet", b))
      );

      let output = center(" %chHelp%cn ", 80, "%cr=%cn") + "\n";
      output += columns(commands, 80, 4, " ") + "\n\n";
      output +=
        "Type '%chhelp <command>%cn' for more information on a command.\n";
      output += repeatString("%cr=%cn", 80);
      send(ctx.socket.id, output);
    },
  });

  addCmd({
    name: "help/topic",
    pattern: /^[/+]?help\s+(.*)/i,
    hidden: true,
    render: async (ctx, args) => {
      const topic = args[1];
      if (text.has(`help_${topic}`)) {
        send(ctx.socket.id, text.get(`help_${topic}`) || "");
      } else if (text.has(`topic_${topic}`)) {
        send(ctx.socket.id, text.get(`topic_${topic}`) || "");
      } else {
        send(ctx.socket.id, `No help available for '${topic}'.`);
      }
    },
  });
};
