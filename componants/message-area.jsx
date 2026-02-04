// components/MessageArea.js
import { useState, useEffect } from 'react';

import { getSocket } from "@/lib/socket-client";

const MessageArea = ({ toUser, fromUser, onMessageSent }) => {
  const [inputText, setInputText] = useState("");
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const message = {
      sender: fromUser,
      text: inputText,
      createdAt: new Date().toISOString(),
    };


    console.log("Sending message to API:", { toUser, fromUser, message });

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toUser,
          fromUser,
          message,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("API Error:", data);
        return;
      }
      onMessageSent(message);
      setInputText("");

    } catch (error) {
      console.error("Send message failed:", error);
    }
  };

  return (
    <div className="current-user-info flex p-4">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 border border-gray-300 rounded p-2 mr-2"
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
      >
        Send
      </button>
    </div>
  );
};

export default MessageArea;