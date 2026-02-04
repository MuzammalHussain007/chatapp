// components/Message.js
import React from 'react';

const Message = ({ text, sender, isOwnMessage, timestamp }) => {
  return (
    <div className={`flex w-full mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
        isOwnMessage 
          ? 'bg-blue-600 text-white rounded-br-none' 
          : 'bg-gray-100 text-gray-800 rounded-bl-none'
      }`}>
       
        {!isOwnMessage && (
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-gray-500">
            {sender}
          </p>
        )}
        
        <p className="text-sm leading-relaxed">{text}</p>
        
        <p className={`text-[10px] mt-1 text-right opacity-70 ${
          isOwnMessage ? 'text-white' : 'text-gray-500'
        }`}>
          {timestamp}
        </p>
      </div>
    </div>
  );
};

export default Message;