import parser from "./parser";
import { io } from "./app";

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
