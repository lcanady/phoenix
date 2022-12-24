import { Socket } from "socket.io";

export interface Context {
  socket: MuSocket;
  text: string;
  msg?: string;
  data: { [key: string]: any };
  scope: { [key: string]: any };
}

export interface Cmd {
  name: string;
  pattern: RegExp | string;
  render: (ctx: any, args: string[]) => Promise<void>;
  flags?: string;
  hidden?: boolean;
  category?: string;
}

export interface MuSocket extends Socket {
  cid?: string;
}

export interface DbObj {
  _id?: string;
  name?: string;
  dbref?: number;
  flags: string;
  data?: {
    [key: string]: any;
    location?: string;
    description?: string;
    password?: string;
    channels?: ChanEntry[];
  };
}

export interface Channel {
  _id?: string;
  name: string;
  lock?: string;
  hidden?: boolean;
  header: string;
  alias?: string;
}

export interface ChanEntry {
  _id?: string;
  channel: string;
  alias: string;
  mask?: string;
  title?: string;
  active: boolean;
}
