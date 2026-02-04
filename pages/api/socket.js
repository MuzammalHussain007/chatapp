import { Server } from "socket.io";


export const config = {
  api: {
    bodyParser: false, // Disabling bodyParser is crucial for Socket.io
  },
};

export const getRoomId = (id1, id2) => {
  // Sort IDs so that (UserA, UserB) and (UserB, UserA) produce the same string
  return [id1, id2].sort().join("-");
};

export default function handler(req, res) {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  console.log("🔌 Socket server starting");

  const io = new Server(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
  });

  io.on("connect", (socket) => {
    console.log("✅ CONNECTED:", socket.id);


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

    socket.on("disconnect", (reason) => {
      console.log("❌ DISCONNECTED:", socket.id, reason);
    });
  });

  res.socket.server.io = io;
  res.end();
}
