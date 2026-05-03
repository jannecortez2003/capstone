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

      // --- NEW: Trigger MySQL Notification for the Customer ---
      if (activeChatDetails?.userId) {
          await fetch(`${import.meta.env.VITE_API_URL}/notify_chat_message`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: activeChatDetails.userId })
          });
      }

    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };
  
  return (
    <div className="p-2 md:p-6 h-[100vh] flex flex-col transition-colors duration-300">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
          Customer Live Chat
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
          Respond to customer inquiries in real-time.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex flex-1 overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300">

        {/* 📱 SIDEBAR */}
        <div
          className={`${
            activeChatId ? "hidden md:block" : "block"
          } w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 transition-colors duration-300`}
        >
          <input
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl px-4 py-2 w-full mb-4 focus:ring-2 focus:ring-pink-500 outline-none transition-colors duration-300 placeholder-gray-400"
            placeholder="Search conversations..."
          />

          <div className="space-y-2">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveChatId(c.id)}
                className={`p-3 cursor-pointer rounded-xl transition-colors duration-200 flex items-center gap-3 ${
                  activeChatId === c.id 
                    ? "bg-pink-50 dark:bg-gray-700 border-l-4 border-pink-500 shadow-sm" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-transparent"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-gray-600 flex items-center justify-center font-bold text-pink-700 dark:text-pink-300 shrink-0">
                  {c.customerName ? c.customerName.substring(0, 2).toUpperCase() : 'C'}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate">
                    {c.customerName || "Customer"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {c.lastMessage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 💬 CHAT */}
        <div
          className={`${
            activeChatId ? "flex" : "hidden md:flex"
          } flex-1 flex-col bg-white dark:bg-gray-900 transition-colors duration-300`}
        >
          {activeChatId ? (
            <>
              {/* HEADER */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-800 z-10 transition-colors duration-300">

                {/* 🔙 BACK BUTTON */}
                <button
                  onClick={() => setActiveChatId(null)}
                  className="md:hidden text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 text-xl font-bold pr-2"
                >
                  ←
                </button>

                <div>
                  <div className="font-bold text-lg text-gray-800 dark:text-white">
                    {activeChatDetails?.customerName || "Guest"}
                  </div>

                  {/* 🟢 ONLINE STATUS */}
                  <div className="text-xs flex items-center gap-1.5 mt-0.5 font-medium">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        userStatus === "online"
                          ? "bg-green-500 shadow-[0_0_5px_#22c55e]"
                          : "bg-gray-400 dark:bg-gray-600"
                      }`}
                    ></span>
                    <span className={userStatus === "online" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>
                        {userStatus === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900/50 transition-colors duration-300">
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
                      className={`max-w-[80%] md:max-w-md p-3.5 rounded-2xl shadow-sm text-sm transition-colors duration-300 ${
                        msg.sender === "admin"
                          ? "bg-pink-600 text-white rounded-br-sm"
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-sm"
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
                className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-2 transition-colors duration-300"
              >
                <input
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-500 transition-colors duration-300 placeholder-gray-400"
                />
                <button className="bg-pink-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-pink-700 transition shadow-md">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 transition-colors duration-300">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                  <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </div>
              <p>Select a conversation from the sidebar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerChat;