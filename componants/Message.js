// components/Message.js
import React from "react";

const Message = ({ text, sender, isOwnMessage, timestamp, status }) => {
  return (
    <div className={`flex w-full mb-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm flex flex-col ${
          isOwnMessage
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        }`}
      >
        {/* Sender name for other messages (optional, for group chat) */}
        {!isOwnMessage && (
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-gray-500">
            {sender}
          </p>
        )}

        {/* Message text */}
        <p className="text-sm leading-relaxed break-words">{text}</p>

        {/* Timestamp + status */}
        <div className="flex justify-end items-center mt-1 text-[10px] opacity-80 space-x-1">
          <span className={`${isOwnMessage ? "text-white" : "text-gray-500"}`}>
            {timestamp}
          </span>

          {/* Only show status for own messages */}
          {isOwnMessage && status && (
            <span
              className={`${
                status === "Seen" ? "text-green-400" : "text-gray-300"
              } font-bold`}
            >
              {status === "Seen" ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
