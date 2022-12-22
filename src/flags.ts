import { Tags } from "@digibear/tags";

const flags = new Tags(
  {
    name: "wizard",
    code: "W",
    lock: "wizard",
    lvl: 10,
  },
  {
    name: "admin",
    code: "a",
    lock: "wizard",
    lvl: 3,
  },
  {
    name: "builder",
    code: "b",
    lock: "wizard",
    lvl: 2,
  },
  {
    name: "storyteller",
    code: "s",
    lock: "admin+",
    lvl: 1,
  },
  {
    name: "room",
    code: "r",
    lock: "wizard",
  },
  {
    name: "player",
    code: "p",
    lock: "wizard",
  },
  {
    name: "connected",
    code: "c",
    lock: "wizard",
  },
  {
    name: "dark",
    code: "d",
  },
  {
    name: "html",
    code: "h",
  }
);

export default flags;
