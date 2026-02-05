import { Server } from "socket.io";


export const config = {
  api: {
    bodyParser: false, // Disabling bodyParser is crucial for Socket.io
  },
};

export const runtime = "nodejs"; // 🔥 REQUIRED

export const getRoomId = (id1, id2) => {
  // Sort IDs so that (UserA, UserB) and (UserB, UserA) produce the same string
  return [id1, id2].sort().join("-");
};


const onlineUsers = new Map();
const lastSeenUsers = new Map();

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

  io.on("connection", (socket) => {
    console.log("✅ CONNECTED: server side ", socket.id);



    socket.on("get-last-seen", (userId, callback) => {
      console.log("Server received get-last-seen for:", userId);
      const lastSeen = lastSeenUsers.get(userId) || null;
      callback(lastSeen);
    });


    // TYPING START
    socket.on("typing", ({ fromUserId, toUserId }) => {
      console.log("✍️ TYPING EVENT:", { fromUserId, toUserId });

      const receiverSocketId = onlineUsers.get(toUserId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { fromUserId });
        console.log("➡️ TYPING SENT TO:", toUserId);
      } else {
        console.log("⚠️ RECEIVER OFFLINE:", toUserId);
      }
    });


    // TYPING STOP
    socket.on("stop-typing", ({ fromUserId, toUserId }) => {
      console.log("🛑 STOP TYPING:", { fromUserId, toUserId });

      const receiverSocketId = onlineUsers.get(toUserId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stop-typing", { fromUserId });
        console.log("➡️ STOP TYPING SENT TO:", toUserId);
      }
    });



    socket.on("join", (userId) => {
      console.log("🟢 JOIN RECEIVED:", userId);
      onlineUsers.set(userId, socket.id);
      console.log("ONLINE USERS:", [...onlineUsers.keys()]);
      io.emit("online-users", [...onlineUsers.keys()]);
    });



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



    // socket.on("disconnect", (reason) => {

    //   for (const [userId, id] of onlineUsers.entries()) {
    //     if (id === socket.id) {
    //       onlineUsers.delete(userId);
    //       socket.broadcast.emit("user-offline", userId);
    //       lastSeenUsers.set(userId, new Date().toISOString());
    //       console.log(`User ${userId} disconnected. Last seen saved.${lastSeenUsers.size}`);
    //       console.log(`🔴 User ${userId} disconnected`);
    //     }
    //   }

    //   console.log("🔴 DISCONNECT:", socket.id);
    //   io.emit("online-users", [...onlineUsers.keys()]);

    //   console.log("❌ DISCONNECTED:", socket.id, reason);
    // });



    socket.on("disconnect", (reason) => {
  const userId = socket.userId; // directly from socket

  if (!userId) return; // if join was never called

  // Remove from online users
  onlineUsers.delete(userId);

  // Save last seen
  lastSeenUsers.set(userId, new Date().toISOString());

  // Notify others
  socket.broadcast.emit("user-offline", userId);

  // Debug logs
  console.log("Map entries:", [...lastSeenUsers.entries()]);
  console.log(`User ${userId} disconnected. Last seen saved. Map size: ${lastSeenUsers.size}`);
  console.log("🔴 User disconnected:", userId);
  console.log("❌ DISCONNECT:", socket.id, reason);

  // Emit updated online users list
  io.emit("online-users", [...onlineUsers.keys()]);
});









  });

  res.socket.server.io = io;
  res.end();
}
