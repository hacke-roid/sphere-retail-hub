import { createServer } from "http";
import { Server } from "socket.io";

function initSocketServer(
  httpServer: ReturnType<typeof createServer>,
  corsOrigin: string,
) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  io.on("connection", (socket: any) => {
    console.log(socket);
  });
}

export default initSocketServer;
