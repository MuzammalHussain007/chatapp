// components/UserInfo.js
import Image from 'next/image';

const UserInfo = ({ username, imageSrc , onClick }) => {
  return (
    <div className="current-user-info flex items-center justify-between p-5 border-2 border-black" onClick={onClick}>
      <div className="username text-xl font-semibold">
        <h2>{username}</h2>
      </div>

      <div className="image">
        <div className="">
          <Image
        
            src={imageSrc.trim() || "/globe.svg"}
            alt="/globe.svg"
            width={30} 
            height={30} 
            className="rounded-full"
            unoptimized={true}
          />
        </div>
      </div>
    </div>
  );
};

export default UserInfo;