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

  // Sync online state coming from parent
  useEffect(() => {
    setIsOnlineState(isOnline);
  }, [isOnline]);

  // Socket logic
  useEffect(() => {
    let socket;

    const init = async () => {
      socket = await getSocket();

      if (!socket) return;

      console.log("Topbar socket connected:", socket.id);

      // ---- USER OFFLINE EVENT ----
      const handleUserOffline = (userId) => {
        console.log("user-offline received:", userId);

        if (userId !== otherUserId) return;

        setIsOnlineState(false);

        socket.emit(
          "get-last-seen",
          otherUserId,
          (timestamp) => {
            console.log("last seen received:", timestamp);
            setLastSeen(timestamp ? new Date(timestamp) : null);
          }
        );

        console.log("last seen user",lastSeen)
      };

      socket.on("user-offline", handleUserOffline);
    };

    init();

    // cleanup
    return () => {
      if (socket) {
        socket.off("user-offline");
      }
    };
  }, [otherUserId]);

  // ---------- FORMAT LAST SEEN ----------
  const formatLastSeen = (date) => {
    if (!date) return "Offline";

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return isToday
      ? `Last seen today at ${hours}:${minutes}`
      : `Last seen on ${date.toLocaleDateString()} at ${hours}:${minutes}`;
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
              <p
                className={`text-sm ${
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
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Topbar;
