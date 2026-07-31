import { Server } from "socket.io";

let io: Server | null = null;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3001",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
}

export function emitEvent(event: string, data: any) {
  if (!io) {
    console.log("Socket.IO not initialized");

    return;
  }

  io.emit(event, data);
}

// For email replies
export function emitReply(data: any) {
  emitEvent("new_reply", data);
}

// For Excel imports
export function emitImport(data: any) {
  emitEvent("prospects_imported", data);
}
