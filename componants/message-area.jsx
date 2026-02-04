"use client";
import { useState, useRef } from "react";

export default function MessageArea({
  fromUser,
  toUser,
  socketRef,
  onMessageSent,
}) {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);

  // 🔹 Typing handler
  const handleTyping = () => {
    socketRef.current?.emit("typing", {
      fromUserId: fromUser,
      toUserId: toUser,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop-typing", {
        fromUserId: fromUser,
        toUserId: toUser,
      });
    }, 800);
  };

  // 🔹 Send message
  const sendMessage = () => {
    if (!message.trim()) return;

    onMessageSent({
      sender: fromUser,
      text: message,
      createdAt: new Date().toISOString(),
    });

    socketRef.current?.emit("stop-typing", {
      fromUserId: fromUser,
      toUserId: toUser,
    });

    setMessage("");
  };

  // 🔹 Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      sendMessage();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <textarea
        value={message}
        placeholder="Type a message..."
        rows={1}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        onKeyDown={handleKeyDown}
        className="flex-1 resize-none border rounded-lg p-3 focus:outline-none"
      />

      {/* ✅ SEND BUTTON (VISIBLE) */}
      <button
        onClick={sendMessage}
        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
      >
        Send
      </button>
    </div>
  );
}
