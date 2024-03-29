import socketIo from "socket.io-client";
import config from "config";
import { Context } from "./definitions";
import { createServer as tcpServer, Socket } from "net";

interface MuTelnetSocket extends Socket {
  cid?: string;
}

const serv = tcpServer((socket: MuTelnetSocket) => {
  const command = Buffer.from([0xff, 0xfd, 0x21]);
  socket.write(command);

  socket.on("error", (err) => console.log(err));

  const io = socketIo(`http://localhost:${config.get("server.port")}`);

  socket.on("data", (data) => {
    io.emit("chat message", {
      msg: data.toString(),
      data: { telnet: true, cid: socket.cid },
    });
  });

  io.on("chat message", async (ctx: Context) => {
    socket.write(ctx.msg + "\r\n", "utf8");
  });

  socket.on("close", () => {
    io.close();
    socket.end();
  });
  io.on("disconnect", (reason: string) => {
    if (
      reason === "io server disconnect" ||
      reason === "io client disconnect"
    ) {
      socket.end();
    }
  });

  io.on("login", (cid: string) => {
    socket.cid = cid;
  });

  io.on("reconnect", () => {
    console.log("Trying to reconnect.....");
    io.io.opts.query = {
      cid: socket.cid || "",
    };
  });
});

serv.on("error", (err) => console.log(err));

serv.listen(config.get("server.telnetPort"), () =>
  console.log(`TCP Server listening on port ${config.get("server.telnetPort")}`)
);
