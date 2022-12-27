import { readdir } from "fs/promises";
import { send } from "./broadcast";
import { force } from "./cmds";
import { chans, db } from "./database";
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
  const dbref = `#${player.dbref}`;
  ctx.socket.join(dbref);
  ctx.socket.join(`${player?.data?.location}`);
  send(player?.data?.location || "", `${player.name} has entered the game.`);
  ctx.socket.join(`${player?._id}`);
  ctx.socket.cid = player._id;
  ctx.socket.request.session.cid = player._id || "";
  ctx.socket.request.session.save();

  const channels = await chans.find({});
  channels.forEach(async (channel) => {
    if (channel.alias && flags.check(player.flags, channel.lock || "")) {
      const chan = player.data?.channels?.filter(
        (ch) => ch.channel === channel.name
      );

      if (!chan) {
        player.data ||= {};
        player.data.channels ||= [];

        player.data?.channels?.push({
          channel: channel.name,
          alias: channel.alias,
          active: true,
        });
        ctx.socket.join(channel.name);
        await db.update({ _id: player._id }, player);
        await force(ctx.socket, `${channel.alias} :has joined the channel.`);
        send(
          ctx.socket.id,
          `You have joined ${channel.name} with the alias '${channel.alias}'.`
        );
      }
    }
  });

  player.data?.channels?.forEach(
    (channel) => channel.active && ctx.socket.join(channel.channel)
  );

  await set(player, "connected");
};

/**
 *  Display the name of an object depending on the enactor's permissions
 * @param enactor Tge enactor of the command
 * @param target  The target of the command
 */
export const displayName = (enactor: DbObj, target: DbObj) => {
  // If the enactor has a higher level than the target, display the name, dbref
  // and flags of the target
  const name = target.name?.split(";") || [];
  const sc = name[1] ? "<%ch" + name[1].toUpperCase() + "%cn>%b" : "";
  if (canEdit(enactor, target)) {
    const flgs = `(#${target.dbref}${flags.codes(target.flags)})`;
    return `${sc}${name[0].slice(0, 25 - flgs.length)}${flgs}`;
  }

  return sc + target.name.split(";")[0];
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
    string?.repeat(length / parser.stripSubs("telnet", string).length) +
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
    ((flags.lvl(enactor.flags) || 0) > (flags.lvl(target.flags) || 0) ||
      enactor._id === target._id) &&
    flags.check(enactor.flags || "", target.data?.lock || "")
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

export const idle = (secs: number) => {
  const snds = secs ? Math.round((Date.now() - secs) / 1000) : 0;

  let time;
  switch (true) {
    case snds < 60:
      time = `${snds}s`;
      break;
    case snds < 3600:
      time = `${Math.floor(snds / 60)}m`;
      break;
    case snds < 86400:
      time = `${Math.floor(snds / 3600)}h`;
      break;
    case snds < 604800:
      time = `${Math.floor(snds / 86400)}d`;
      break;
    case snds < 2419200:
      time = `${Math.floor(snds / 604800)}w`;
      break;
    case snds < 29030400:
      time = `${Math.floor(snds / 2419200)}m`;
      break;
    default:
      time = `${Math.floor(snds / 29030400)}y`;
      break;
  }

  switch (true) {
    case snds < 60 * 10:
      return `%ch%cg${time}%cn`;
    case snds < 60 * 15:
      return `%ch%cy${time}%cn`;
    case snds < 60 * 25:
      return `%ch%cy${time}%cn`;
    case snds < 60 * 60:
      return `%ch%cr${time}%cn`;
    default:
      return `%ch%cx${time}%cn`;
  }
};

export const dbObj = async (name: string, flags = "", data = {}) => {
  const obj = {
    name,
    flags,
    data,
    dbref: await id(),
  };

  return await db.insert(obj);
};

export const getAttr = (target: DbObj, attr: string) => {
  target.data ||= {};
  target.data.attributes || -[];
  const attribute = target.data.attributes?.find((a) => a.name === attr);
  return { setter: attribute?.setter, value: attribute?.value };
};

export const setAttr = async (
  enactor: DbObj,
  target: DbObj,
  attr: string,
  value: any
) => {
  target.data ||= {};
  target.data.attributes ||= [];

  const attribute = target.data.attributes.find((a) => a.name === attr);
  if (attribute && canEdit(enactor, target)) {
    attribute.value = value;
  } else {
    target.data.attributes.push({
      name: attr,
      value,
      setter: `#${enactor.dbref}`,
    });
  }

  await db.update({ _id: target._id }, target);
};

export const canSee = (enactor: DbObj, target: DbObj) => {
  if (target.flags.includes("dark") && (flags.lvl(enactor.flags) || 0) < 1) {
    return false;
  }
  return true;
};
