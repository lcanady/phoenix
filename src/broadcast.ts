import parser from "./parser";
import { io } from "./app";
import Convert from "ansi-to-html";

const convert = new Convert();

export const send = (
  target: string[] | string,
  msg: string,
  data: any = {}
) => {
  io.to(target).emit("chat message", {
    msg: parser.substitute("telnet", msg),
    data: {
      ...data,
      ...{ html: convert.toHtml(parser.substitute("telnet", msg)) },
    },
  });
};

export const broadcast = (msg: string, data: any = {}) => {
  io.emit("chat message", {
    msg: parser.substitute("telnet", msg),
    data: {
      ...data,
      ...{ html: convert.toHtml(parser.substitute("telnet", msg)) },
    },
  });
};
