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
  render: (ctx: Context, args: string[]) => Promise<void>;
  flags?: string;
  hidden?: boolean;
  category?: string;
}

export interface MuSocket extends Socket {
  cid?: string;
}

export interface DbObj {
  _id?: string;
  name: string;
  dbref: number;
  flags: string;

  data?: {
    [key: string]: any;
    lastCommand?: number;
    location?: string;
    attributes?: { name: string; value: string; setter: string }[];
    destination?: string;
    description?: string;
    password?: string;
    channels?: ChanEntry[];
    tempMail?: Mail;
    mailread?: string[];
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

export interface Mail {
  _id?: string;
  from: string;
  to: string[];
  message: string;
  subject: string;
  cc?: string[];
  bcc?: string[];
  date: number;
}

export interface Wiki {
  _id?: string;
  slug: string;
  title: string;
  body: string;
  tags?: string[];
  lock?: string;
  shortImg?: string;
  longImg?: string;
  featured?: Boolean;
  default?: Boolean;
  landing?: Boolean;
  category: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  updatedBy: string;
}

export interface Archetype {
  _id?: string;
  name: string;
  description: string;
  shortdesc?: string;
  lock?: string;
  blood: number;
  heart: number;
  mind: number;
  Spirit: number;
  mortality: number;
  night: number;
  power: number;
  wild: number;
}

export interface Move {
  _id?: string;
  name: string;
  description: string;
  shortdesc?: string;
  lock?: string;
  flags?: string;
}
