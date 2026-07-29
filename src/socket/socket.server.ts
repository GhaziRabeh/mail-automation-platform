import { Server } from "socket.io";

let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3001",
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
  });
}

export function emitReply(data: any) {
  if (io) {
    io.emit("new_reply", data);
  }
}
