import { io } from "socket.io-client";

let socket = null;

export function connectSocket() {
  if (socket?.connected) return socket;

  socket = io("http://localhost:3000");
  return socket;
}

export function disconnectSocket({boardId, userId}) {
  if (!socket) throw new Error("No socket instance found");

  socket.emit("user-disconnect", {boardId, userId})

  socket.disconnect();
  socket = null;
}