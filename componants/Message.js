// components/Message.js
import React from "react";

const TypingDots = () => {
  return (
    <div className="flex items-center gap-1 h-5">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
    </div>
  );
};

const Message = ({
  text,
  sender,
  isOwnMessage,
  timestamp,
  status,
  isTyping = false,
  reactions = [] // future use
}) => {
  return (
    <div
      className={`flex w-full mb-2 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div className="flex flex-col max-w-[75%]">

        {/* MESSAGE BUBBLE */}
        <div
          className={`px-4 py-2 rounded-2xl shadow-sm flex flex-col ${
            isOwnMessage
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          }`}
        >
          {/* Sender name (useful later for group chat) */}
          {!isOwnMessage && !isTyping && (
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-gray-500">
              {sender}
            </p>
          )}

          {/* MESSAGE CONTENT */}
          {isTyping ? (
            <TypingDots />
          ) : (
            <p className="text-sm leading-relaxed break-words">
              {text}
            </p>
          )}

          {/* TIME + STATUS */}
          {!isTyping && (
            <div className="flex justify-end items-center mt-1 text-[10px] opacity-80 space-x-1">
              <span
                className={`${
                  isOwnMessage ? "text-white" : "text-gray-500"
                }`}
              >
                {timestamp}
              </span>

              {isOwnMessage && status && (
                <span
                  className={`font-bold ${
                    status === "Seen"
                      ? "text-green-400"
                      : "text-gray-300"
                  }`}
                >
                  {status === "Seen" ? "✓✓" : "✓"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* REACTION AREA (reserved space) */}
        {reactions.length > 0 && (
          <div
            className={`flex gap-1 mt-1 ${
              isOwnMessage ? "justify-end" : "justify-start"
            }`}
          >
            {reactions.map((reaction, index) => (
              <span
                key={index}
                className="text-xs bg-white shadow px-2 py-[2px] rounded-full"
              >
                {reaction}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
