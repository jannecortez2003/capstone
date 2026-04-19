import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

const ChatBot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  // 1. Create a permanent session ID based on the user's actual database ID
  const sessionId = `user_${user?.id}`;
  const customerName = user?.fullName || user?.username || "Customer";

  // 2. Listen for real-time messages from Firestore
  useEffect(() => {
    if (!sessionId) return;
    
    const q = query(collection(db, `chats/${sessionId}/messages`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // If no messages exist yet, show a personalized welcome message
      if (fetchedMessages.length === 0) {
        setMessages([{ 
          id: 1, 
          text: `Hello ${customerName}! Welcome to Mommy Rosal's Catering. 👋 How can I help you today?`, 
          sender: 'bot' 
        }]);
      } else {
        setMessages(fetchedMessages);
      }
    });

    return () => unsubscribe();
  }, [sessionId, customerName]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !sessionId) return;

    const textToSend = inputMessage;
    setInputMessage(""); // Clear input

    try {
      // 3. Save the main Chat Document with the REAL user's details
      await setDoc(doc(db, "chats", sessionId), {
        customerName: customerName,
        email: user?.email || "",
        lastMessage: textToSend,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // 4. Save message to subcollection
      await addDoc(collection(db, `chats/${sessionId}/messages`), {
        text: textToSend,
        sender: 'user',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-pink-600 animate-bounce'}`}
      >
        {isOpen ? <FaTimes className="text-white text-xl" /> : <FaComments className="text-white text-2xl" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-fade-in-up h-[500px]">
          <div className="bg-pink-600 p-4 flex items-center gap-3 shadow-md">
            <div className="bg-white/20 p-2 rounded-full">
              <FaRobot className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-white font-bold">Mommy Rosal's Support</h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-pink-100 text-xs">Online</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-pink-600 text-white rounded-br-none rounded-2xl' : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none rounded-2xl'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-500"
            />
            <button type="submit" className="bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700 transition">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;