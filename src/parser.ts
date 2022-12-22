import { Parser } from "@ursamu/parser";

const parser = new Parser();

parser.addSubs(
  "telnet",
  { before: /%r/g, after: "\n" },
  { before: /%b/g, after: " ", strip: " " },
  { before: /%t/g, after: "\t" },

  //color
  { before: /%[cx]n/g, after: "\x1b[0m", strip: "" },
  { before: /%[cx]x/g, after: "\x1b[30m", strip: "" },
  { before: /%[cx]r/g, after: "\x1b[31m", strip: "" },
  { before: /%[cx]g/g, after: "\x1b[32m", strip: "" },
  { before: /%[cx]y/g, after: "\x1b[33m", strip: "" },
  { before: /%[cx]b/g, after: "\x1b[34m", strip: "" },
  { before: /%[cx]m/g, after: "\x1b[35m", strip: "" },
  { before: /%[cx]c/g, after: "\x1b[36m", strip: "" },
  { before: /%[cx]w/g, after: "\x1b[37m", strip: "" },
  { before: /%[cx]h/g, after: "\x1b[1m", strip: "" },
  { before: /%[cx]u/g, after: "\x1b[4m", strip: "" },
  { before: /%[cx]i/g, after: "\x1b[3m", strip: "" },
  { before: /%[cx]#(\d+)/g, after: "\x1b[38;5;$1m", strip: "" }
);

parser.addSubs(
  "html",
  { before: /%r/g, after: "<br />" },
  { before: /%b/g, after: "&nbsp;", strip: " " },
  { before: /%t/g, after: "&nbsp;&nbsp;&nbsp;&nbsp;" },

  //color
  {
    before: /%[cx]n/g,
    after: "<span style='color: inherit'></b></i>",
    strip: "",
  },
  { before: /%[cx]x/g, after: "<span style='color: grey'>", strip: "" },
  { before: /%[cx]r/g, after: "<span style='color: red'>", strip: "" },
  { before: /%[cx]g/g, after: "<span style='color: green'>", strip: "" },
  { before: /%[cx]y/g, after: "<span style='color: yellow'>", strip: "" },
  { before: /%[cx]b/g, after: "<span style='color: blue'>", strip: "" },
  { before: /%[cx]m/g, after: "<span style='color: magenta'>", strip: "" },
  { before: /%[cx]c/g, after: "<span style='color: cyan'>", strip: "" },
  { before: /%[cx]w/g, after: "<span style='color: white'>", strip: "" },
  { before: /%[cx]h/g, after: "<b>", strip: "" },
  {
    before: /%[cx]u/g,
    after: "<span style='border-bottom: 1px solid'>",
    strip: "",
  },
  { before: /%[cx]i/g, after: "<i>", strip: "" },
  { before: /%[cx]#(\d+)/g, after: "\x1b[38;5;$1m", strip: "" }
);

const repeatString = (string = " ", length: number) => {
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

parser.add("test", async () => "Fooooo!");

parser.add("center", async (args: string[]) => {
  {
    let str = args[0] || "";
    let fill = args[2] || " ";
    let len = parseInt(args[1]) || 0;
    let wordlen = parser.stripSubs("telnet", str).length;

    let left = Math.floor(len / 2 - wordlen);
    let remainder = Math.floor((len - left - wordlen - left) / 2);
    return `${repeatString(fill, left + remainder)}${str}${repeatString(
      fill,
      left + remainder
    )}`;
  }
});

parser.add("ljust", async (args) => {
  let str = args[0].trim() || "";
  let fill = args[2] || " ";
  let len = parseInt(args[1]) || 0;
  let wordlen = parser.stripSubs("telnet", str).length;
  let left = Math.floor(len - wordlen);

  return `${str}${repeatString(fill, left)}`;
});

parser.add("rjust", async (args) => {
  let str = args[0] || "";
  let fill = args[1] || " ";
  let len = parseInt(args[2]) || 0;
  let wordlen = parser.stripSubs("telnet", str).length;
  let left = Math.floor(len - wordlen);

  return `${repeatString(fill, left)}${str}`;
});

parser.add("repeat", async (args) => {
  const str = args[0] || "";
  const len = parseInt(args[1], 10) || 0;
  return `${repeatString(str, len)}`;
});

parser.add("columns", async (args) => {
  const truncate = (input: any, size: any, fill: any) => {
    let length = parser.stripSubs("telnet", input).length;
    return length > size - 3
      ? `${input.substring(0, size - 3)}...`
      : input + fill.repeat(size - length);
  };

  let list = args[0];
  let width = parseInt(args[1], 10) || 78;
  let cols = parseInt(args[2]) || 4;
  let delim = args[3] || " ";
  let fill = args[4] || " ";
  let cell = Math.floor(width / cols);
  list = list.split(delim);
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
});

export default parser;
