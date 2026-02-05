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


    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "toUser": toUser,
      "fromUser": fromUser,
      "message": {
        "messageId": Date.now().toString(),
        "sender": fromUser,
        "text": message
      }
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("http://localhost:3000/api/message", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log("Message sent successfully:", result);

        onMessageSent(result.data);

        socketRef.current?.emit("stop-typing", {
          fromUserId: fromUser,
          toUserId: toUser,
        });


        setMessage("");


      })
      .catch((error) => console.error(error));

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
