"use client";
import { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";

export default function MessageArea({ fromUser, toUser, socketRef, onMessageSent }) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);

  // 🔹 Typing handler
  const handleTyping = () => {
    socketRef.current?.emit("typing", { fromUserId: fromUser, toUserId: toUser });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop-typing", { fromUserId: fromUser, toUserId: toUser });
    }, 800);
  };

  // 🔹 Emoji select handler
  const onEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    handleTyping(); // emoji counts as typing
  };

  // 🔹 Send message
  const sendMessage = () => {
    if (!message.trim()) return;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      toUser,
      fromUser,
      message: {
        messageId: Date.now().toString(),
        sender: fromUser,
        text: message,
      },
    });

    fetch("http://localhost:3000/api/message", {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("Message sent successfully:", result);
        onMessageSent(result.data);
        socketRef.current?.emit("stop-typing", { fromUserId: fromUser, toUserId: toUser });
        setMessage("");
      })
      .catch((err) => console.error("Error sending message:", err));
  };

  // 🔹 Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col gap-2 relative">
      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-0 z-50">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      

      <div className="flex items-center gap-3">
         <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg"
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
          className="flex-1 resize-none border rounded-lg p-3 focus:outline-none"
        />

        {/* Emoji toggle button */}
       

        {/* Send button */}
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
