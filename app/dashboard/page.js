"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import UserInfo from "@/componants/UserInfo";
import MessageArea from "@/componants/message-area";
import Emptycard from "@/componants/emptycard";
import Topbar from "@/componants/topbar";
import Message from "@/componants/Message";
import { getSocket } from "@/lib/socket-client";
import UserProfile from "@/componants/userprofile";


export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [AllUser, setAllUser] = useState([]);
  const [allMessage, setAllMessage] = useState([]);
  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const otherUserRef = useRef(null); 
  const [socket, setsocket] = useState(null)


  // Initialize socket
  const socketRef = useRef(null);
  useEffect(() => {
    if (!session?.user?.name) return;

    console.log("Setting up socket for user:", session.user._id);

    const setupSocket = async () => {
      const socket = await getSocket();
      socketRef.current = socket;
      setsocket(socket);

      socketRef.current.on("connect", () => {

        socketRef.current.emit("join", session.user._id);
      });

      socketRef.current.on("online-users", (users) => {
        console.log("🟢 ONLINE USERS FROM SERVER:", users);
        setOnlineUsers(users);
      });

      socket.on("receive-message", (data) => {
        console.log("Received message via socket:", data);

        if (data && data.message) {
          console.log("Received message via socket: insde if", data.message);
          let newText = data.message;
          setAllMessage((prev) => [...prev, data.message]);
        }
      });
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive-message");
        socketRef.current.off("online-users");
        socketRef.current.off("connect");

      }
    };
  }, [session?.user?.name]);


  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("typing", ({ fromUserId }) => {
      console.log("👀 typing from:", fromUserId);
      if (fromUserId === otherUserRef.current._id) {
        setIsTyping(true);
      }
    });

    socketRef.current.on("stop-typing", ({ fromUserId }) => {
      if (fromUserId === otherUserRef.current._id) {
        setIsTyping(false);
      }
    });

    return () => {
      socketRef.current.off("typing");
      socketRef.current.off("stop-typing");
    };
  }, [otherUserRef.current?._id]);



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


  useEffect(() => {
    const container = messagesEndRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight; // scroll to bottom
    }
  }, [allMessage]);

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const handleListMessage = async (selectedUser) => {
    try {
      const res = await fetch(
        `/api/chats?user1=${session.user._id}&user2=${selectedUser}`
      );
      const data = await res.json();
      const msgs = data?.data?.message || [];
      setAllMessage([...msgs].reverse());
    } catch (error) {
      console.error("Fetch message error:", error);
    }
  };

  const handleProfileClick = (user) => {
    setIsProfileClicked(true);
    setAllMessage([]);
    handleListMessage(user._id);
    otherUserRef.current = user;
     console.log("user from arg ",user)
    console.log("other user useRef",otherUserRef.current._id)



    setIsTyping(false);

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

      <div className="flex h-[calc(100vh-34px)]">

        <div className="leftside w-[30vw] bg-green-50 h-screen flex flex-col p-5">
          <div className="mb-4">
            <UserProfile
              srcURL={session.user.image}
              logedInUserId={session.user._id}
              currentlyLoginUserName={session.user.name}
              onClick={() => console.log("Clicked own profile")}
            />
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-3">
            {AllUser.map((item) => (
              <UserInfo
                key={item._id}
                username={item.name}
                imageSrc={item.picture}
                isOnline={isUserOnline(item._id)}
                onClick={() => handleProfileClick(item)}
              />
            ))}
          </div>
        </div>

        <div className="rightSide w-[70vw] bg-white h-screen flex flex-col">
           <Topbar otherUserId={otherUserRef.current?._id} isTyping={isTyping} name={otherUserRef.current?.name} srcURL={otherUserRef.current?.picture || "/globe.svg"} profileClicked={isProfileClicked} isOnline={isUserOnline(otherUserRef.current?._id)} />
          {isProfileClicked ? (
            <>
              <div className="overflow-y-auto pb-14 pl-5 pr-5 flex flex-col" ref={messagesEndRef}>
                {allMessage.map((item, index) => (
                  <Message
                    key={index}
                    text={item.text}
                    sender={item.name}
                    isOwnMessage={item.sender === session.user._id}
                    timestamp={new Date(item.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  />
                ))}
              </div>
              <div className="sticky bottom-0 border-t p-4 mt-auto bg-white">
                <MessageArea
                  socketRef={socketRef}
                  toUser={otherUserRef.current?._id}
                  fromUser={session.user._id}
                  onMessageSent={(response) => {

                    console.log("dashboard screen",response)
                    if (socketRef.current) {
                      
        
                      socketRef.current.emit("send-message", {
                        fromUserId: session.user._id,
                        toUserId: otherUserRef.current?._id,
                        message: response,
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
