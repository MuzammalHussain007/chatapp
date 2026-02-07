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
const openChats = new Map();

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


    socket.onAny((event, ...args) => {
      console.log("🔥 EVENT RECEIVED ON SERVER:", event, args);
    });



   



    socket.on("open-chat", ({ fromUserId, toUserId }) => {
      console.log("💬 OPEN CHAT:", fromUserId, "->", toUserId);
      const prevChat = openChats.get(fromUserId);
      if (prevChat && prevChat !== toUserId) {
        console.log(`${fromUserId} switched from chat with ${prevChat} to ${toUserId}`);
        openChats.delete(fromUserId); 
      }
      openChats.set(fromUserId, toUserId);
      const receiverSocketId = onlineUsers.get(toUserId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("chat-opened", { fromUserId });
        console.log("➡️ Notified", toUserId, "that chat is opened by", fromUserId);
      }
    });

    socket.on("close-chat", ({ fromUserId }) => {
      openChats.delete(fromUserId);
    });



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


    socket.on("send-message", ({ fromUserId, toUserId, message, currentChatId }) => {
      const roomId = [fromUserId, toUserId].sort().join("-");
      console.log(`📤 Message from ${fromUserId} to room ${roomId}:`, message);

      io.to(roomId).emit("receive-message", { fromUserId, message });
      

      // Check if receiver has chat open for this sender
      if (openChats.get(toUserId) === fromUserId) {
        console.log("chat id for given chat", currentChatId)
        console.log("👀 Receiver has chat open, marking as seen:", message.messageId);
        io.to(roomId).emit("message-seen", { messageId: message.messageId, currentChatId });
      } else {
        const receiverSocketId = onlineUsers.get(toUserId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message-delivered", { messageId: message.messageId, currentChatId });
          console.log("📬 Receiver offline, but socket exists. Marking as delivered:", message.messageId);
        }
      }
    });


    socket.on("message-seen", ({ messageId, fromUserId, currentChatId }) => {
      console.log(`👀 Message seen: ${messageId} in chat ${currentChatId}`);
      const roomId = [socket.userId, fromUserId].sort().join("-");
      io.to(roomId).emit("message-seen", { messageId, currentChatId });
    })


    socket.on("mark-seen", ({ messageId, fromUserId }) => {
      const senderSocketId = onlineUsers.get(fromUserId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("message-seen", { messageId });
      }
    });









    socket.on("disconnect", (reason) => {
      const userId = socket.userId;  

      if (!userId) return;  

      onlineUsers.delete(userId);
      openChats.delete(userId); 

      lastSeenUsers.set(userId, new Date().toISOString());

      socket.broadcast.emit("user-offline", userId);

      console.log("Map entries:", [...lastSeenUsers.entries()]);
      console.log(`User ${userId} disconnected. Last seen saved. Map size: ${lastSeenUsers.size}`);
      console.log("🔴 User disconnected:", userId);
      console.log("❌ DISCONNECT:", socket.id, reason);

      io.emit("online-users", [...onlineUsers.keys()]);
    });

  });

  res.socket.server.io = io;
  res.end();
}
