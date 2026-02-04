import { io } from "socket.io-client";

let socket;

export const getSocket = async () => {
  if (!socket || !socket.connected) {
    try {
      await fetch("/api/socket");
    } catch (err) {
      console.error("Failed to poke socket server", err);
    }

    socket = io({
      path: "/api/socket",
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => console.log("✅ Socket Connected:client side ", socket.id));

    socket.on("join-chat", ({ userId, otherUserId }) => {
      if (!userId || !otherUserId) return;
      const roomId = [userId, otherUserId].sort().join("-");
      socket.join(roomId);
      console.log(`🟢 ${userId} joined room ${roomId}`);
    });


    socket.on("send-message", ({ fromUserId, toUserId, message }) => {
      const roomId = [fromUserId, toUserId].sort().join("-");
      console.log(`📤 Message from ${fromUserId} to room ${roomId}:`, message);

      io.to(roomId).emit("receive-message", {
        fromUserId,
        message,
      });
    });


    socket.on("connect_error", (err) => {
      console.error("❌ Socket Error:", err);
      socket = null;
    });


  }
  return socket;
};