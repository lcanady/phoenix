import { readdir } from "fs/promises";
import { io } from "./app";
import { db } from "./database";
import { Context, DbObj } from "./definitions";
import flags from "./flags";
import parser from "./parser";

export const id = async () => {
  const nums = (await db.find({})).map((obj) => obj.dbref);
  var missing = new Array();

  for (var i = 0; i < nums.length; i++) {
    if (nums.indexOf(i) == -1) {
      missing.push(i);
    }
  }
  return missing.length ? missing[0] : nums.length;
};

export const login = async (ctx: Context, player: DbObj) => {
  const dbref = `${player.dbref}`;
  ctx.socket.join(dbref);
  ctx.socket.join(`${player?.data?.location}`);
  ctx.socket.join(`${player?._id}`);
  ctx.socket.cid = player._id;
  ctx.socket.request.session.cid = player._id || "";
  ctx.socket.request.session.save();
  io.to(ctx.socket.id).emit("login", player._id);
};

/**
 *  Display the name of an object depending on the enactor's permissions
 * @param enactor Tge enactor of the command
 * @param target  The target of the command
 */
export const displayName = (enactor: DbObj, target: DbObj) => {
  // If the enactor has a higher level than the target, display the name, dbref
  // and flags of the target
  if (canEdit(enactor, target)) {
    return `${target.name}(#${target.dbref}${flags.codes(target.flags)})`;
  }

  return target.name;
};

export const plugins = async (dir: string) => {
  const dirent = await readdir(dir);
  const files = dirent.filter((file) => file.endsWith(".ts"));

  files.forEach((file) => {
    delete require.cache[require.resolve(`${dir}/${file}`)];
    require(`${dir}/${file}`).default();
  });
};

export const target = async (enactor: DbObj, target: string) => {
  switch (target) {
    case "me":
      return enactor;

    case "here":
      return await db.findOne({ _id: enactor.data?.location });

    default:
      return await player(target);
  }
};

export const player = async (name: string) =>
  await db.findOne({
    $or: [
      { name: new RegExp(name, "i") },
      { "data.alias": new RegExp(name, "i") },
      { _id: name },
      { dbref: parseInt(name.slice(1), 10) },
    ],
  });

export const repeatString = (string = " ", length: number) => {
  // check how many spaces are left after the filler string is rendered. We will need
  // to render these last few spaces manually.
  const remainder = Math.floor(
    length % parser.stripSubs("telnet", string).length
  );

  // Split the array and filter out empty cells.
  let cleanArray = string.split("%").filter(Boolean);
  // If the array length is longer than 1 (more then one cell), process for ansii
  if (cleanArray.length > 1) {
    // If it's just a clear formatting call 'cn' then we don't need to worry
    // about it.  We'll handle making sure ansii is cleared after each substitution manually.
    cleanArray = cleanArray
      .filter((cell) => {
        if (cell.toLowerCase() !== "cn") {
          return cell;
        }
      })

      // fire the substitutions on each cell.
      .map((cell) => {
        return "%" + cell + "%cn";
      });
  } else {
    cleanArray = cleanArray[0].split("");
  }
  return (
    string.repeat(length / parser.stripSubs("telnet", string).length) +
    cleanArray.slice(0, remainder)
  );
};

export const rjust = (string = "", length: number, filler = " ") => {
  return (
    repeatString(filler, length - parser.stripSubs("telnet", string).length) +
    string
  );
};

export const ljust = (string = "", length: number, filler = " ") => {
  return string + repeatString(filler, length - string.length);
};

export const center = (string = "", length: number, filler = " ") => {
  const left = Math.floor(
    (length - parser.stripSubs("telnet", string).length) / 2
  );
  const right = length - parser.stripSubs("telnet", string).length - left;
  return repeatString(filler, left) + string + repeatString(filler, right);
};

export const columns = (list: string[], width = 78, cols = 3, fill = " ") => {
  const truncate = (input: any, size: any, fill: any) => {
    let length = parser.stripSubs("telnet", input).length;
    return length > size - 3
      ? `${input.substring(0, size - 3)}...`
      : input + fill.repeat(size - length);
  };

  let cell = Math.floor(width / cols);
  let counter = 0;
  let output = "%r";
  for (const item of list) {
    if (counter < cols) {
      output += truncate(item, cell, fill);
    } else {
      output += "%r" + truncate(item, cell, fill);
      counter = 0;
    }
    counter++;
  }

  return output;
};

export const canEdit = (enactor: DbObj, target: DbObj) => {
  if (
    (flags.lvl(enactor.flags) || 0) > (flags.lvl(target.flags) || 0) ||
    enactor._id === target._id
  ) {
    return true;
  }

  return false;
};

export const set = async (target: DbObj, flgs: string) => {
  target.data ||= {};
  const { tags, data } = flags.set(target.flags, target.data, flgs);
  target.flags = tags;
  target.data = data;
  await db.update({ _id: target._id }, target);
  return target;
};
