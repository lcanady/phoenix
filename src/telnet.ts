import socketIo from "socket.io-client";
import parser from "./parser";
import { Context } from "./definitions";
import { createServer as tcpServer, Socket } from "net";

interface MuTelnetSocket extends Socket {
  cid?: string;
}

const serv = tcpServer((socket: MuTelnetSocket) => {
  const command = Buffer.from([0xff, 0xfd, 0x21]);
  socket.write(command);

  const io = socketIo("http://localhost:3001");

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
    console.log("disconnect", reason);
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

serv.listen(4202, () => console.log("TCP Server listening on port 4201"));
