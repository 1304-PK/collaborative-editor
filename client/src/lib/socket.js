import { io } from "socket.io-client"
import { useAuth } from "../context/AuthContext";

let socket = null;

export function connectSocket(session, boardId) {
  if (socket?.connected) return socket;

  // Establish connection and send the current access token for information
  socket = io("http://localhost:3000", {
    auth: {
      token: session?.access_token,
      boardId, boardId
    }
  });
  return socket;
}

export function disconnectSocket({boardId}) {
  if (!socket) throw new Error("No socket instance found");

  socket.emit("user-disconnect", {boardId})

  socket.disconnect();
  socket = null;
}