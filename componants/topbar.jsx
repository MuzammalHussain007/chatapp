"use client";
import React, { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { getSocket } from "@/lib/socket-client";

const Topbar = ({ name, srcURL, currentUserId, chatUserId }) => {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div className="w-full p-4 flex bg-green-50 items-center justify-between">
      
 
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
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>

        <div>
          <p className="font-semibold">{name}</p>
          <p className={`text-sm ${isOnline ? "text-green-600" : "text-gray-500"}`}>
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

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
