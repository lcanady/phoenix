import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { text } from "../cmds";

export default async () => {
  const dirent = await readdir(join(__dirname, "../../text"), {
    withFileTypes: true,
  });
  const files = dirent.filter(
    (dirent) => dirent.isFile() && dirent.name.endsWith(".txt")
  );
  for (const file of files) {
    const textFile = await readFile(
      join(__dirname, `../../text/${file.name}`),
      "utf8"
    );
    text.set(file.name.replace(".txt", ""), textFile);
  }
};
