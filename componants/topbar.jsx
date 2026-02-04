import React, { useEffect, useState } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";

const Topbar = ({ isTyping, name, srcURL, profileClicked, isOnline, socketRef, otherUserid }) => {
  const [isOnlineState, setIsOnlineState] = useState(isOnline);
  const [lastSeen, setLastSeen] = useState(null);




  useEffect(() => {

    if (!socketRef) {

      console.log("Socket not initialized");
      return;
    }

    console.log("Socket initialized:", socketRef.id);

    setIsOnlineState(isOnline);

    // See Tomarrow explanation about this part

    if (!isOnline) {
      socketRef.emit("get-last-seen", otherUserid, (timestamp) => {
        console.log("Last seen timestamp received:", timestamp);
        if (timestamp) setLastSeen(new Date(timestamp));
      });
    }

  }, [isOnline, otherUserid]);

  const formatLastSeen = (isoString) => {
    if (!isoString) return null;
    const last = new Date(isoString);
    const now = new Date();

    const isToday = last.toDateString() === now.toDateString();
    const hours = last.getHours();
    const minutes = last.getMinutes().toString().padStart(2, "0");

    return isToday
      ? `Last seen today at ${hours}:${minutes}`
      : `Last seen on ${last.toLocaleDateString()} at ${hours}:${minutes}`;
  };

  return (
    <div className="w-full p-4 h-20 flex bg-green-50 items-center justify-between">
      {profileClicked ? (
        <div className="flex items-center gap-4">
  <div className="relative w-10 h-10 flex items-center justify-center">
    <Image
      src={srcURL || "/globe.svg"}
      fill
      className="rounded-full object-cover"
      alt=""
      unoptimized
    />

    <span
      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
        isOnlineState ? "bg-green-500" : "bg-gray-400"
      }`}
    />
  </div>

  <div className="flex flex-col justify-center">
    <p className="font-semibold">{name}</p>

    {isTyping ? (
      <p className="text-sm text-green-600 italic animate-pulse">
        typing...
      </p>
    ) : (
      <p className={`text-sm ${isOnlineState ? "text-green-600" : "text-gray-500"}`}>
        {isOnlineState ? "Online" : formatLastSeen(lastSeen)}
      </p>
    )}
  </div>
</div>

      ) : (
        <div className="h-14" />
      )}

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Topbar;