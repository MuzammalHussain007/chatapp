import { io } from "socket.io-client";

let socketInstance = null;

export const getSocket =  () => {
  if (socketInstance && socketInstance.connected) return socketInstance;



  socketInstance = io("http://localhost:3000", {
    path: "/api/socket",
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
  });

  socketInstance.on("connect", () => {
    console.log("✅ Socket connected:", socketInstance.id);
  });

  socketInstance.on("receive-message", (data) => {
    console.log("📥 Received message from server:", data);
  });

  socketInstance.on("message-seen", ({ messageId }) => {
    console.log("👀 Message seen:", messageId);
  });

  socketInstance.on("online-users", (users) => {
    console.log("🟢 Online users:", users);
  });

  socketInstance.on("connect_error", (err) => {
    console.error("❌ Socket connect error:", err);
    socketInstance = null;
  });

  return socketInstance;
};
