import React, { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Adjust path if needed

const CustomerChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [adminReply, setAdminReply] = useState("");
  const messagesEndRef = useRef(null);

  // 1. Fetch List of Active Conversations from Firestore
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

  // 2. Fetch Messages for the Selected Conversation
  useEffect(() => {
    if (!activeChatId) return;

    const q = query(collection(db, `chats/${activeChatId}/messages`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [activeChatId]);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Handle Admin Sending a Reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!adminReply.trim() || !activeChatId) return;

    const textToSend = adminReply;
    setAdminReply("");

    try {
      // Save message as 'admin'
      await addDoc(collection(db, `chats/${activeChatId}/messages`), {
        text: textToSend,
        sender: "admin",
        createdAt: serverTimestamp()
      });

      // Update the main document's "lastMessage" to reflect the admin's reply
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
    <div className="p-6 h-[calc(100vh-2rem)] flex flex-col">
      <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
      <p className="text-gray-500 mb-6">Manage your catering business</p>
      
      <h2 className="text-xl font-bold mb-4">Customer Live Chat</h2>
      
      <div className="bg-white rounded-lg shadow flex flex-1 overflow-hidden h-full">
        {/* Sidebar: Conversation List */}
        <div className="w-1/3 border-r p-4 overflow-y-auto">
          <div className="flex mb-4">
            <button className="font-bold border-b-2 border-pink-600 mr-4 pb-1">Live Chat</button>
          </div>
          <input className="border rounded px-2 py-1 w-full mb-4" placeholder="Search conversations..." />
          
          <div className="space-y-2">
            {conversations.map((c) => (
              <div 
                key={c.id} 
                onClick={() => setActiveChatId(c.id)}
                className={`flex items-center gap-2 p-3 rounded cursor-pointer transition ${activeChatId === c.id ? "bg-pink-50 border-l-4 border-pink-600" : "hover:bg-gray-50"}`}
              >
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-700">
                  {c.customerName ? c.customerName.substring(0, 2).toUpperCase() : 'C'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-semibold text-sm">{c.customerName || "Customer"}</div>
                  {/* Show email if available, otherwise show last message preview */}
                  <div className="text-xs text-gray-500 truncate">{c.email || c.lastMessage}</div>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="text-sm text-gray-500 text-center mt-10">No active chats</div>
            )}
          </div>
        </div>

        {/* Main Area: Chat Interface */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {activeChatId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white shadow-sm z-10">
                <div className="font-bold text-lg">{activeChatDetails?.customerName || "Guest User"}</div>
                <div className="text-xs text-green-500 flex items-center gap-1">
                   <span className="w-2 h-2 rounded-full bg-green-500 block"></span> Active Session
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-3 rounded-lg shadow-sm text-sm ${msg.sender === 'admin' ? 'bg-pink-600 text-white rounded-br-none' : 'bg-white text-gray-800 border rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendReply} className="p-4 bg-white border-t flex gap-2">
                <input
                  type="text"
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Type your reply to the customer..."
                  className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-pink-500"
                />
                <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition font-medium">
                  Send Reply
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation from the sidebar to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerChat;