import React, { useState, useEffect, useRef } from "react";
import { FaCommentDots, FaTimes, FaPaperPlane } from "react-icons/fa";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import {
  getDatabase,
  ref,
  set,
  onDisconnect,
  onValue
} from "firebase/database";

const ChatBot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [adminStatus, setAdminStatus] = useState("offline");

  const messagesEndRef = useRef(null);
  
  const userId = user?.id ? user.id.toString() : "guest_" + Math.floor(Math.random() * 10000);
  const userName = user?.fullName || user?.username || "Guest";

  useEffect(() => {
    if (!isOpen) return;

    const rtdb = getDatabase();
    const statusRef = ref(rtdb, `/status/${userId}`);

    set(statusRef, {
      state: "online",
      lastChanged: Date.now()
    });

    onDisconnect(statusRef).set({
      state: "offline",
      lastChanged: Date.now()
    });

    return () => {
      set(statusRef, {
        state: "offline",
        lastChanged: Date.now()
      });
    };
  }, [isOpen, userId]);

  useEffect(() => {
    const rtdb = getDatabase();
    const adminStatusRef = ref(rtdb, `/status/admin`);

    const unsubscribe = onValue(adminStatusRef, (snapshot) => {
      if (snapshot.exists()) {
        setAdminStatus(snapshot.val().state);
      } else {
        setAdminStatus("offline");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const chatDocRef = doc(db, "chats", userId);

    const initChat = async () => {
      const chatSnap = await getDoc(chatDocRef);
      if (!chatSnap.exists()) {
        await setDoc(chatDocRef, {
          userId: userId,
          customerName: userName,
          lastMessage: "",
          updatedAt: serverTimestamp()
        });
      }
    };
    initChat();

    const q = query(
      collection(db, `chats/${userId}/messages`),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [isOpen, userId, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const textToSend = input;
    setInput("");

    try {
      await addDoc(collection(db, `chats/${userId}/messages`), {
        text: textToSend,
        sender: "user",
        createdAt: serverTimestamp()
      });

      await setDoc(
        doc(db, "chats", userId),
        {
          lastMessage: `You: ${textToSend}`,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-pink-600 text-white p-4 rounded-full shadow-2xl hover:bg-pink-700 transition z-50 transform hover:scale-110"
      >
        {isOpen ? <FaTimes size={24} /> : <FaCommentDots size={24} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          
          <div className="bg-pink-600 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold">Live Support</h3>
              <div className="text-xs flex items-center gap-1.5 opacity-90">
                <span className={`w-2 h-2 rounded-full ${adminStatus === 'online' ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                {adminStatus === 'online' ? 'Admin is Online' : 'Admin is Offline'}
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              <FaTimes />
            </button>
          </div>

          <div className="h-80 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 space-y-3 transition-colors duration-300">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-10">
                Send us a message and we'll reply as soon as possible!
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.sender === "user" 
                        ? "bg-pink-600 text-white rounded-br-sm" 
                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-500 transition-colors duration-300"
              />
              <button 
                type="submit" 
                className="bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700 transition min-w-[40px] flex items-center justify-center"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;