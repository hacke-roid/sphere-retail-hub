import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../config/env";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(API_BASE_URL, {
    transports: ["websocket"],
    auth: {
      token,
    },
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
