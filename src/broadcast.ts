import parser from "./parser";
import { io } from "./app";
import { Parser } from "@ursamu/parser";

export const send = (
  target: string[] | string,
  msg: string,
  data: any = {}
) => {
  io.to(target).emit("chat message", {
    msg: parser.substitute("telnet", msg),
    data,
  });
};

export const broadcast = (msg: string, data: any = {}) => {
  io.emit("chat message", {
    msg: parser.substitute("telnet", msg),
    data,
  });
};
