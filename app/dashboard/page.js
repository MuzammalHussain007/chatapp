"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import UserInfo from "@/componants/userInfo";
import MessageArea from "@/componants/message-area";
import Emptycard from "@/componants/emptycard";
import Topbar from "@/componants/topbar";
import Message from "@/componants/Message";
import { getSocket } from "@/lib/socket-client";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [AllUser, setAllUser] = useState([]);
  const [allMessage, setAllMessage] = useState([]);
  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

 
  // Initialize socket
  const socketRef = useRef(null);
  useEffect(() => {
    if (!session?.user?.name) return;

    console.log("Setting up socket for user:", session.user._id);

    const setupSocket = async () => {
      const socket = await getSocket();
      socketRef.current = socket;

      socket.emit("join", session.user.name);


      socket.on("receive-message", (message) => {
        setAllMessage((prev) => [message, ...prev]);
      });
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive-message");
      }
    };
  }, [session?.user?.name]);

  // Fetch all users after session is ready
  useEffect(() => {
    if (!session?.user?.name) return;

    const fetchAllUsers = async () => {
      try {
        const res = await fetch("/api/get-user");
        const data = await res.json();
        if (res.ok) setAllUser(data.data || []);
        else console.error("Failed to fetch users", data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchAllUsers();
  }, [session?.user?.name]);

  // Fetch messages with selected user
  const handleListMessage = async (selectedUser) => {
    try {
      const res = await fetch(
        `/api/chats?user1=${session.user.name}&user2=${selectedUser}`
      );
      const data = await res.json();
      const msgs = data?.data?.message || [];
      // Reverse so newest messages appear at bottom
      setAllMessage([...msgs].reverse());
    } catch (error) {
      console.error("Fetch message error:", error);
    }
  };

  const handleProfileClick = (user) => {
    setIsProfileClicked(true);
    setAllMessage([]); // clear old messages immediately
    setCurrentUser(user);
    handleListMessage(user.name);

    socketRef.current?.emit("join-chat", {
      userId: session.user._id,
      otherUserId: user._id,
    });

  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") return <div className="p-8">Loading...</div>;
  if (!session) return null;

  return (
    <div className="h-screen bg-green-50 text-black overflow-hidden">
      <Topbar name={session.user.name} srcURL={session.user.image} />

      <div className="flex h-[calc(100vh-34px)]">
        {/* Left sidebar - users */}
        <div className="leftside w-[30vw] bg-green-50 p-7 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {AllUser.length === 0 && <div>No users found</div>}
            {AllUser.map((item) => (
              <UserInfo
                key={item._id}
                username={item.name}
                imageSrc={item.picture}
                onClick={() => handleProfileClick(item)}
              />
            ))}
          </div>
        </div>

        {/* Right side - messages */}
        <div className="rightSide w-[70vw] bg-white h-screen flex flex-col">
          {isProfileClicked ? (
            <>
              <div className="overflow-y-auto p-4 flex flex-col mb-20">
                {allMessage.map((item, index) => (
                  <Message
                    key={index}
                    text={item.text}
                    sender={item.name}
                    isOwnMessage={item.sender === session.user.name}
                    timestamp={new Date(item.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  />
                ))}
              </div>
              <div className="sticky bottom-0 bg-white border-t p-4">
                <MessageArea
                  toUser={currentUser._id}
                  fromUser={session.user._id}
                  onMessageSent={(newMessage) => {
                    setAllMessage((prev) => [...prev, newMessage]);
                    // Emit to socket
                    if (socketRef.current) {
                      socketRef.current.emit("send-message", {
                        fromUserId: session.user._id,
                        toUserId: currentUser._id,
                        message: newMessage,
                      });
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <Emptycard />
          )}
        </div>
      </div>
    </div>
  );
}
