import express, { Express, Request, Response } from "express";
import { createServer, IncomingMessage } from "http";
import { Server } from "socket.io";
import { matchCmd, text } from "./cmds";
import "./telnet";
import { send } from "./broadcast";
import { MuSocket } from "./definitions";
import session from "express-session";
import fileStorage from "session-file-store";
import { player, set } from "./utils";
import authorization from "./routes/authorization";

declare module "http" {
  interface IncomingMessage {
    cookieHolder?: string;
    session: session.Session & {
      cid: string;
    };
  }
}

const app: Express = express();
const fileStore = fileStorage(session);

const sessionMiddleware = session({
  secret: "secret",
  store: new fileStore(),
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = createServer(app);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use("/auth", authorization);

const io = new Server(server, {
  allowRequest: (req, callback) => {
    // with HTTP long-polling, we have access to the HTTP response here, but this is not
    // the case with WebSocket, so we provide a dummy response object
    const fakeRes = {
      getHeader() {
        return [];
      },
      setHeader(key: any, values: any) {
        req.cookieHolder = values[0];
      },
      writeHead() {},
    };

    sessionMiddleware(req as Request, fakeRes as unknown as Response, () => {
      if (req.session) {
        // trigger the setHeader() above
        fakeRes.writeHead();
        // manually save the session (normally triggered by res.end())
        req.session.save();
      }
      callback(null, true);
    });
  },
});

io.engine.on(
  "initial_headers",
  (headers: { [key: string]: string }, req: IncomingMessage) => {
    if (req.cookieHolder) {
      headers["set-cookie"] = req.cookieHolder;
      delete req.cookieHolder;
    }
  }
);

io.on("connection", async (socket: MuSocket) => {
  const session = socket.request.session;
  const cid = socket.handshake.headers.cid as string;

  session.reload(async (err) => {
    if (err) {
      console.log(err);
    }

    if (session.cid || cid) {
      const en = await player(session.cid);
      socket.cid ||= session.cid || cid;
      socket.join(session.cid);
      socket.join(en?.data?.location || "");
      set(en, "connected");
    } else {
      const connect = text.get("connect") || "Welcome to the game!";
      send(socket.id, connect);

      session.save();
    }
  });

  socket.on("chat message", (msg) => {
    matchCmd({ socket, text: msg.msg, data: msg.data, scope: {} });
  });

  socket.on("disconnect", async (reason) => {
    if (reason.endsWith("transport close") || reason.endsWith("ping timeout"))
      return;
    if (socket.cid) {
      const en = await player(socket.cid);
      delete en.data?.lastpage;
      delete en.data?.lastcmd;
      await set(en, "!connected");
      if (en) send(en.data?.location || "", `${en.name} has disconnected.`);
    }
  });
});

export { io, server };
