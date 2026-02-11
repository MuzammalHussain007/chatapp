import React, { useEffect, useState } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { getSocket } from "@/lib/socket-client";

const Topbar = ({
  isTyping,
  name,
  srcURL,
  profileClicked,
  otherUserId,
  isOnline,
}) => {
  const [isOnlineState, setIsOnlineState] = useState(null);
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    setIsOnlineState(isOnline);
  }, [isOnline]);

  useEffect(() => {
    let socket;

    const init = async () => {
      socket = await getSocket();
      if (!socket) return;

      socket.on("user-offline", (offlineUserId) => {
        if (offlineUserId === otherUserId) {
          socket.emit("get-last-seen", otherUserId, (timestamp) => {
            setLastSeen(timestamp ? new Date(timestamp) : null);
          });
        }
      });
    };

    init();

    return () => {
      if (socket) socket.off("user-offline");
    };
  }, [otherUserId]);

  const formatLastSeen = (date) => {
    if (!date) return "Offline";

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return isToday
      ? `Last seen today at ${hours}:${minutes} ${ampm}`
      : `Last seen on ${date.toLocaleDateString()} at ${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4 bg-green-50 shadow-md">
      {profileClicked ? (
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
            <Image
              src={srcURL || "/globe.svg"}
              fill
              className="rounded-full object-cover"
              alt="User Avatar"
              unoptimized
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${
                isOnlineState ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <p className="font-semibold text-sm sm:text-base truncate">{name}</p>
            {isTyping ? (
              <p className="text-xs sm:text-sm text-green-600 italic animate-pulse truncate">
                typing...
              </p>
            ) : (
              <p
                className={`text-xs sm:text-sm truncate ${
                  isOnlineState ? "text-green-600" : "text-gray-500"
                }`}
              >
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
        className="mt-2 sm:mt-0 px-3 sm:px-4 py-1 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Topbar;
