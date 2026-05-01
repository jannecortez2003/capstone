import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc
} from "firebase/firestore";
import { db } from "../../firebase";

// 🔥 Realtime DB (for presence)
import {
  getDatabase,
  ref,
  set,
  onDisconnect,
  onValue
} from "firebase/database";

const CustomerChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [adminReply, setAdminReply] = useState("");
  const [userStatus, setUserStatus] = useState("offline");

  const messagesEndRef = useRef(null);

  // 🔥 SET ADMIN ONLINE STATUS
  useEffect(() => {
    const rtdb = getDatabase();
    const userId = "admin"; // change if dynamic auth

    const statusRef = ref(rtdb, `/status/${userId}`);

    set(statusRef, {
      state: "online",
      lastChanged: Date.now()
    });

    onDisconnect(statusRef).set({
      state: "offline",
      lastChanged: Date.now()
    });
  }, []);

  // 🔥 LOAD CONVERSATIONS
  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(chats);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 LOAD MESSAGES
  useEffect(() => {
    if (!activeChatId) return;

    const q = query(
      collection(db, `chats/${activeChatId}/messages`),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [activeChatId]);

  // 🔥 SCROLL TO BOTTOM
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeChatDetails = conversations.find(
    (c) => c.id === activeChatId
  );

  // 🔥 LISTEN TO CUSTOMER STATUS
  useEffect(() => {
    if (!activeChatDetails?.userId) return;

    const rtdb = getDatabase();
    const statusRef = ref(rtdb, `/status/${activeChatDetails.userId}`);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserStatus(snapshot.val().state);
      } else {
        setUserStatus("offline");
      }
    });

    return () => unsubscribe();
  }, [activeChatDetails]);

  // 🔥 SEND MESSAGE
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!adminReply.trim() || !activeChatId) return;

    const textToSend = adminReply;
    setAdminReply("");

    try {
      await addDoc(
        collection(db, `chats/${activeChatId}/messages`),
        {
          text: textToSend,
          sender: "admin",
          createdAt: serverTimestamp()
        }
      );

      await setDoc(
        doc(db, "chats", activeChatId),
        {
          lastMessage: `Admin: ${textToSend}`,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  return (
    <div className="p-2 md:p-6 h-[100vh] flex flex-col">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
          Customer Live Chat
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-1 overflow-hidden border">

        {/* 📱 SIDEBAR */}
        <div
          className={`${
            activeChatId ? "hidden md:block" : "block"
          } w-full md:w-1/3 border-r p-4 overflow-y-auto`}
        >
          <input
            className="border rounded px-3 py-2 w-full mb-4"
            placeholder="Search..."
          />

          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveChatId(c.id)}
              className="p-3 cursor-pointer hover:bg-gray-100 rounded"
            >
              <div className="font-semibold text-sm">
                {c.customerName || "Customer"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {c.lastMessage}
              </div>
            </div>
          ))}
        </div>

        {/* 💬 CHAT */}
        <div
          className={`${
            activeChatId ? "flex" : "hidden md:flex"
          } flex-1 flex-col`}
        >
          {activeChatId ? (
            <>
              {/* HEADER */}
              <div className="p-3 border-b flex items-center gap-2">

                {/* 🔙 BACK BUTTON */}
                <button
                  onClick={() => setActiveChatId(null)}
                  className="md:hidden text-lg"
                >
                  ←
                </button>

                <div>
                  <div className="font-bold">
                    {activeChatDetails?.customerName || "Guest"}
                  </div>

                  {/* 🟢 ONLINE STATUS */}
                  <div className="text-xs flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        userStatus === "online"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></span>

                    {userStatus === "online"
                      ? "Online"
                      : "Offline"}
                  </div>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "admin"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-md p-3 rounded-lg text-sm ${
                        msg.sender === "admin"
                          ? "bg-pink-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <form
                onSubmit={handleSendReply}
                className="p-2 md:p-4 border-t flex gap-2"
              >
                <input
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Type message..."
                  className="flex-1 border rounded px-3 py-2"
                />
                <button className="bg-pink-600 text-white px-4 py-2 rounded">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerChat;