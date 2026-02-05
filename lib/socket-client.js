// lib/socket-client.js
import { io } from "socket.io-client";

let socketInstance = null; // singleton instance
const onlineUsers = new Map();

export const getSocket = async () => {
  if (socketInstance && socketInstance.connected) {
    return socketInstance; // return existing instance
  }

  try {
    
    await fetch("/api/socket");
  } catch (err) {
    console.error("Failed to poke socket server", err);
  }

  
  socketInstance = io({
    path: "/api/socket",
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  
  socketInstance.on("connect", () => {
    console.log("✅ Socket connected (singleton):", socketInstance.id);
  });

  socketInstance.on("join", (userId) => {
    onlineUsers.set(userId, socketInstance.id);
    console.log("Online users:", Array.from(onlineUsers.keys()));
    socketInstance.emit("online-users", Array.from(onlineUsers.keys()));
  });

  socketInstance.on("join-chat", ({ userId, otherUserId }) => {
    if (!userId || !otherUserId) return;
    const roomId = [userId, otherUserId].sort().join("-");
    socketInstance.join?.(roomId); 
    console.log(`🟢 ${userId} joined room ${roomId}`);
  });

  socketInstance.on("send-message", ({ fromUserId, toUserId, message }) => {
    const roomId = [fromUserId, toUserId].sort().join("-");
    console.log(`📤 Message from ${fromUserId} to room ${roomId}:`, message);

    socketInstance.emit("send-message-to-server", { fromUserId, toUserId, message });
  });

  socketInstance.on("connect_error", (err) => {
    console.error("❌ Socket Error:", err);
    socketInstance = null;
  });

  return socketInstance;
};
