import React, { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase"; 
import { FaSun, FaMoon } from 'react-icons/fa'; // FIX: Imported Icons

const CustomerChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [adminReply, setAdminReply] = useState("");
  const messagesEndRef = useRef(null);

  // FIX: Added Dark Mode State and Logic
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(chats);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeChatId) return;
    const q = query(collection(db, `chats/${activeChatId}/messages`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!adminReply.trim() || !activeChatId) return;
    const textToSend = adminReply;
    setAdminReply("");
    try {
      await addDoc(collection(db, `chats/${activeChatId}/messages`), {
        text: textToSend,
        sender: "admin",
        createdAt: serverTimestamp()
      });
      await setDoc(doc(db, "chats", activeChatId), {
        lastMessage: `Admin: ${textToSend}`,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const activeChatDetails = conversations.find(c => c.id === activeChatId);

  return (
    // FIX: Added dark mode transition classes
    <div className="p-6 h-[calc(100vh-2rem)] flex flex-col transition-colors duration-300">
      
      {/* FIX: Header with Dark Mode Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-gray-800 dark:text-white transition-colors duration-300">Admin Panel</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Manage your catering business</p>
        </div>
        <button 
          onClick={toggleTheme} 
          className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 p-3 rounded-full shadow-sm hover:text-pink-600 dark:hover:text-pink-400 transition border dark:border-gray-700"
          title="Toggle Dark Mode"
        >
          {theme === 'dark' ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
        </button>
      </div>
      
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white transition-colors duration-300">Customer Live Chat</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-1 overflow-hidden h-full border dark:border-gray-700 transition-colors duration-300">
        
        {/* Sidebar */}
        <div className="w-1/3 border-r dark:border-gray-700 p-4 overflow-y-auto bg-white dark:bg-gray-800 transition-colors duration-300">
          <div className="flex mb-4">
            <button className="font-bold border-b-2 border-pink-600 mr-4 pb-1 text-gray-800 dark:text-white transition-colors duration-300">Live Chat</button>
          </div>
          <input 
            className="border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded px-2 py-2 w-full mb-4 focus:ring-2 focus:ring-pink-500 outline-none transition-colors duration-300 placeholder-gray-400" 
            placeholder="Search conversations..." 
          />
          
          <div className="space-y-2">
            {conversations.map((c) => (
              <div 
                key={c.id} 
                onClick={() => setActiveChatId(c.id)}
                className={`flex items-center gap-2 p-3 rounded cursor-pointer transition-colors duration-300 ${activeChatId === c.id ? "bg-pink-50 dark:bg-gray-700 border-l-4 border-pink-600" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              >
                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-gray-600 flex items-center justify-center font-bold text-pink-700 dark:text-pink-300 transition-colors duration-300">
                  {c.customerName ? c.customerName.substring(0, 2).toUpperCase() : 'C'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 transition-colors duration-300">{c.customerName || "Customer"}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors duration-300">{c.email || c.lastMessage}</div>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center mt-10 transition-colors duration-300">No active chats</div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {activeChatId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm z-10 transition-colors duration-300">
                <div className="font-bold text-lg text-gray-800 dark:text-white transition-colors duration-300">{activeChatDetails?.customerName || "Guest User"}</div>
                <div className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 block"></span> Active Session
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-3 rounded-lg shadow-sm text-sm transition-colors duration-300 ${msg.sender === 'admin' ? 'bg-pink-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border dark:border-gray-700 rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendReply} className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2 transition-colors duration-300">
                <input
                  type="text"
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors duration-300 placeholder-gray-400"
                />
                <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition shadow-md font-medium">
                  Send Reply
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 transition-colors duration-300">
              Select a conversation from the sidebar to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerChat;