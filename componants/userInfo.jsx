// components/UserInfo.js
import Image from "next/image";

const UserInfo = ({ username, imageSrc, onClick, isOnline }) => {
  return (
    <div
      onClick={onClick}
      className="relative flex items-center gap-4 p-4
                 bg-gradient-to-r from-white to-gray-50
                 rounded-2xl shadow-lg hover:shadow-2xl
                 cursor-pointer transition-all duration-300
                 transform hover:scale-105 w-72 h-20"
    >
      {/* Avatar */}
      <div className="relative shrink-0 w-14 h-14 flex items-center justify-center">
        <Image
          src={imageSrc || "/globe.svg"}
          fill
          className="rounded-full object-cover"
          alt="User avatar"
          unoptimized
        />

        {/* Online dot */}
        <span
          className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white
            ${isOnline ? "bg-green-500" : "bg-gray-400"}
          `}
        />
      </div>

      {/* Username */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-xs font-bold text-gray-800 truncate">
          {username}
        </h2>
      </div>

      {/* Status badge (bottom-right) */}
      <span
        className={`absolute bottom-0 right-0 px-3 py-1 text-xs font-bold
          rounded-full ${isOnline ? "text-green-500" : "text-white"} 
          ${isOnline ? "bg-white" : "bg-gray-500"}
        `}
      >
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
};

export default UserInfo;
