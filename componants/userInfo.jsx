// components/UserInfo.js
import Image from "next/image";

const UserInfo = ({ username, imageSrc, onClick, isOnline }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 w-72 h-20"
    >
      {/* Avatar with fixed size */}
      <div className="relative flex-shrink-0 w-14 h-14">
        <Image
          src={imageSrc || "/globe.svg"}
          alt={username}
          width={56}  // slightly smaller than container to fit well
          height={56}
          className="rounded-full object-cover w-full h-full"
          unoptimized
        />
        {/* Online/Offline Dot */}
        <span
          className={`
            absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white
            ${isOnline ? "bg-green-500 animate-ping" : "bg-gray-400"}
          `}
        />
      </div>

      {/* Username and status */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-lg font-bold text-gray-800 truncate">{username}</h2>
        <p className={`text-sm ${isOnline ? "text-green-600" : "text-gray-500"}`}>
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>
    </div>
  );
};

export default UserInfo;
