"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import UserInfo from "@/componants/UserInfo";
import MessageArea from "@/componants/message-area";
import Emptycard from "@/componants/emptycard";
import Topbar from "@/componants/topbar";
import Message from "@/componants/Message";
import Loader from "@/componants/Loader";
import { getSocket } from "@/lib/socket-client";
import UserProfile from "@/componants/userprofile";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [chatMap, setchatMap] = useState({}); // messages per chat
  const [AllUser, setAllUser] = useState([]);
  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const otherUserRef = useRef(null);
  const [socket, setsocket] = useState(null);
  const [unseenCountMap, setUnseenCountMap] = useState({});
  const socketRef = useRef(null);
  const [currentChatId, setCurrentChatId] = useState(null); // active chat
  const currentChatRef = useRef(null); // to use inside socket events

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatMap, currentChatId, isTyping]);

  // Initialize socket
  useEffect(() => {
    if (!session?.user?._id) return;

    const setupSocket = async () => {
      const socket = await getSocket();
      socketRef.current = socket;
      setsocket(socket);

      socketRef.current.on("connect", () => {
        socketRef.current.emit("join", session.user._id);
      });

      socketRef.current.on("online-users", (users) => {
        setOnlineUsers(users);
      });

      // Receive message
      socketRef.current.on("receive-message", (data) => {
        if (!data?.message) return;
        const senderId = data.message.sender;
        const chatKey = data.chatId || senderId;

        setchatMap(prev => {
          const prevMessages = prev[chatKey] || [];
          const updatedMessages = [...prevMessages, data.message];

          // If this chat is active, mark message as Seen immediately
          if (chatKey === currentChatRef.current) {
            updatedMessages[updatedMessages.length - 1].status = "Seen";
            socketRef.current.emit("message-seen", {
              messageId: data.message.messageId,
              toUserId: senderId,
              currentChatId: chatKey,
            });
            updateStatusAPI(chatKey, data.message.messageId, "Seen");
          }

          return { ...prev, [chatKey]: updatedMessages };
        });

        // Increment unseen count only if chat is not active
        if (chatKey !== currentChatRef.current) {
          setUnseenCountMap(prev => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1,
          }));
        }
      });

      // Message seen updates
      socketRef.current.on("message-seen", ({ messageId, currentChatId }) => {
        setchatMap(prev => {
          const messages = prev[currentChatId] || [];
          const updated = messages.map(m =>
            m.messageId === messageId ? { ...m, status: "Seen" } : m
          );
          return { ...prev, [currentChatId]: updated };
        });
      });

      socketRef.current.on("chat-opened", ({ toUserId }) => {
        console.log("chat is opended to user ", toUserId)
        const chatKey = currentChatRef.current;
        if (!chatKey) return;

        setchatMap(prev => {
          console.log("i am in chat map ")
          const messages = prev[chatKey] || [];
          const unseenMessages = messages.filter(
            m => {
              console.log("sender id ",m.sender)
                console.log("message status ",m.status)
              
           return   m.sender === toUserId && m.status !== "Seen"
            }

          );


          console.log("")
          console.log("i am before return ")
          if (unseenMessages.length === 0) return prev;
          console.log("i am after return ")

          unseenMessages.forEach(m => {
            console.log("for each loop")
            socketRef.current.emit("message-seen", {
              messageId: m.messageId,
              toUserId,
              currentChatId: chatKey,
            });
            updateStatusAPI(chatKey, m.messageId, "Seen");
          });

          const updated = messages.map(m =>
            unseenMessages.includes(m) ? { ...m, status: "Seen" } : m
          );

          return { ...prev, [chatKey]: updated };
        });
      });
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive-message");
        socketRef.current.off("online-users");
        socketRef.current.off("connect");
        socketRef.current.off("typing");
        socketRef.current.off("stop-typing");
        socketRef.current.off("chat-opened");
        socketRef.current.off("message-delivered");
      }
    };
  }, [session?.user?._id]);

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("typing", ({ fromUserId }) => {
      if (fromUserId === otherUserRef?.current?._id) setIsTyping(true);
    });

    socketRef.current.on("stop-typing", ({ fromUserId }) => {
      if (fromUserId === otherUserRef?.current?._id) setIsTyping(false);
    });

    return () => {
      socketRef.current.off("typing");
      socketRef.current.off("stop-typing");
    };
  }, [otherUserRef.current?._id]);

  useEffect(() => {
    if (!session?.user?._id) return;
    const fetchAllUsers = async () => {
      try {
        const res = await fetch("/api/get-user");
        const data = await res.json();
        if (res.ok) setAllUser(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllUsers();
  }, [session?.user?._id]);

  async function updateStatusAPI(chatId, messageId, status) {
    try {
      await fetch("http://localhost:3000/api/update-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, messageId, status }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  const handleListMessage = async (selectedUser) => {
    try {
      const res = await fetch(`/api/chats?user1=${session.user._id}&user2=${selectedUser}`);
      const data = await res.json();
      const msgs = Array.isArray(data?.data?.messages) ? data.data.messages : [];
      const chatKey = data?.data?._id

      setchatMap(prev => ({ ...prev, [chatKey]: msgs }));
      setCurrentChatId(chatKey);
      currentChatRef.current = chatKey;
      return chatKey;
    } catch (error) {
      console.error(error);
    }
  };

  const handlingSocketForChat = (user) => {
    if (!socketRef.current) return;

    socketRef.current.emit("join-chat", {
      userId: session.user._id,
      otherUserId: user._id,
    });
    socketRef.current.emit("open-chat", {
      fromUserId: session.user._id,
      toUserId: user._id,
    });

    socketRef.current.on("message-delivered", ({ messageId, currentChatId }) => {
      setchatMap(prev => {
        const messages = prev[currentChatId] || [];
        const updated = messages.map(m =>
          m.messageId === messageId && m.status === "Sent"
            ? { ...m, status: "Delivered" }
            : m
        );
        return { ...prev, [currentChatId]: updated };
      });
      updateStatusAPI(currentChatId, messageId, "Delivered");
    });
  };

  const handleProfileClick = async (user) => {
    setIsProfileClicked(true);
    otherUserRef.current = user;
    setIsTyping(false);

    const chatKey = await handleListMessage(user._id);
    setCurrentChatId(chatKey);
    currentChatRef.current = chatKey;

    setUnseenCountMap(prev => {
      const newMap = { ...prev };
      delete newMap[user._id];
      return newMap;
    });

    handlingSocketForChat(user);
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") return <div className="p-8"><Loader/></div>;
  if (!session) return null;

  const currentMessages = chatMap[currentChatId] || [];

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
                deliveredCount={otherUserRef.current?._id === item._id ? 0 : unseenCountMap[item._id] || 0}
                isOnline={isUserOnline(item._id)}
                onClick={() => handleProfileClick(item)}
              />
            ))}
          </div>
        </div>


        <div className="rightSide w-[70vw] bg-white h-screen flex flex-col">
          <Topbar
            otherUserId={otherUserRef.current?._id}
            isTyping={isTyping}
            name={otherUserRef.current?.name}
            srcURL={otherUserRef.current?.picture || "/globe.svg"}
            profileClicked={isProfileClicked}
            isOnline={isUserOnline(otherUserRef.current?._id)}
          />

          {isProfileClicked ? (
            <>
              <div className="overflow-y-auto pb-14 pl-5 pr-5 flex flex-col" ref={messagesEndRef}>
                {currentMessages.map((item, index) => (
                  <Message
                    key={index}
                    text={item.text}
                    sender={item.name}
                    status={item.status}
                    isOwnMessage={item.sender === session.user._id}
                    timestamp={new Date(item.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  />
                ))}
                {isTyping && <Message isTyping={true} isOwnMessage={false} sender={otherUserRef.current?.name} />}
              </div>

              <div className="sticky bottom-0 border-t p-4 mt-auto bg-white">
                <MessageArea
                  socketRef={socketRef}
                  toUser={otherUserRef.current?._id}
                  fromUser={session.user._id}
                  onMessageSent={(response) => {
                    if (!currentChatId) return;
                    const lastMessage = response.message?.[response.message.length - 1];

                    setchatMap(prev => ({
                      ...prev,
                      [currentChatId]: [...(prev[currentChatId] || []), lastMessage],
                    }));

                    socketRef.current?.emit("send-message", {
                      fromUserId: session.user._id,
                      toUserId: otherUserRef.current?._id,
                      message: lastMessage,
                      currentChatId,
                    });

                    updateStatusAPI(currentChatId, lastMessage.messageId, "Delivered");
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
