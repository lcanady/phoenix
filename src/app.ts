import express, {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
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
import dbRoute from "./routes/db";
import wiki from "./routes/wiki";
import { resolve } from "path";
import auth from "./middleware/auth";
import cors from "cors";
import multer from "multer";

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

app.use(express.static(resolve(__dirname, "../public")));
app.use(cors({ origin: "*", allowedHeaders: "*" }));
app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".")[1]
    );
  },
});

const upload = multer({ storage: diskStorage });

app.post("/upload", auth, upload.single("img"), (req, res, next) => {
  const file = req.file;
  console.log(req.file);
  if (!file) return next(new Error("No file uploaded!"));
  res.status(200).json({ file: file?.filename });
});

const server = createServer(app);

app.use("/db", auth, dbRoute);
app.use("/auth", authorization);
app.use("/wiki", wiki);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err });
});

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
