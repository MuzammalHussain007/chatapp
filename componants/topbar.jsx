import React, { useEffect, useState } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";

const Topbar = ({ isTyping, name, srcURL, profileClicked, isOnline }) => {
  const [isOnlineState, setIsOnlineState] = useState(isOnline);

  useEffect(() => {
    setIsOnlineState(isOnline);
  }, [isOnline]);

  return (
    <div className="w-full p-4 flex bg-green-50 items-center justify-between">
      {profileClicked ? (
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={srcURL || "/globe.svg"}
              width={40}
              height={40}
              className="rounded-full"
              alt=""
              unoptimized
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isOnlineState ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>

          <div>
            <p className="font-semibold">{name}</p>

            {isTyping ? (
              <p className="text-sm text-green-600 italic animate-pulse">
                typing...
              </p>
            ) : (
              <p className={`text-sm ${isOnlineState ? "text-green-600" : "text-gray-500"}`}>
                {isOnlineState ? "Online" : "Offline"}
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