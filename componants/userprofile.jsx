"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
export default function UserProfile({ srcURL, currentlyLoginUserName,logedInUserId}) {
  const [isOnline, setIsOnline] = useState(false);


//     if (!currentlyLoginUserId) return;

//     const socket = getSocket();

//     console.log("in user profile ")

//     const handleStatus = ({ userId, online }) => {
        
//       if (userId === currentlyLoginUserId) setIsOnline(online);
//     };

//     socket.on("user-status", handleStatus);

//     // Emit online when connected
//     if (socket.connected) {
//       socket.emit("user-online", currentlyLoginUserId);
//     } else {
//       socket.on("connect", () => {
//         socket.emit("user-online", currentlyLoginUserId);
//       });
//     }

//     return () => {
//       socket.off("user-status", handleStatus);
//     };
//   }, [currentlyLoginUserId]);

  return (
    <div className="">
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
              logedInUserId ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>
        <div>
          <p className="font-semibold">{currentlyLoginUserName}</p>
          <p className={`text-sm ${logedInUserId ? "text-green-600" : "text-gray-500"}`}>
            {logedInUserId ? "Online" : "Offline"}
          </p>
        </div>
      </div>
    </div>
  );
}
