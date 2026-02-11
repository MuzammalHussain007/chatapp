"use client";
import { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";

export default function MessageArea({ fromUser, toUser, socketRef, onMessageSent }) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleTyping = () => {
    socketRef.current?.emit("typing", { fromUserId: fromUser, toUserId: toUser });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop-typing", { fromUserId: fromUser, toUserId: toUser });
    }, 800);
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    handleTyping();
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const payload = {
      toUser,
      fromUser,
      message: {
        messageId: Date.now().toString(),
        sender: fromUser,
        text: message,
      },
    };

    fetch("http://localhost:3000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((result) => {
        onMessageSent(result.data);
        socketRef.current?.emit("stop-typing", { fromUserId: fromUser, toUserId: toUser });
        setMessage("");
      })
      .catch((err) => console.error("Error sending message:", err));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col gap-2 relative w-full">
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-0 z-50 sm:left-2">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full">
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition"
        >
          😀
        </button>

        <textarea
          value={message}
          placeholder="Type a message..."
          rows={1}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 min-h-[36px] max-h-28 resize-none border rounded-lg p-2 sm:p-3 focus:outline-none overflow-y-auto w-full"
        />

        <button
          onClick={sendMessage}
          className="px-4 sm:px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition w-full sm:w-auto"
        >
          Send
        </button>
      </div>
    </div>
  );
}
