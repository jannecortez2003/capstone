import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! Welcome to Mommy Rosal's Catering. 👋 How can I help you today?", 
      sender: 'bot',
      type: 'text'
    }
  ]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Predefined FAQs for Mommy Rosal's
  const faqs = [
    {
      question: "How do I book an event?",
      answer: "Booking is easy! 1. Create an account or Login. 2. Verify your ID. 3. Go to 'Packages', choose your preferred set, select your dishes, and submit your event details!"
    },
    {
      question: "What packages do you offer?",
      answer: "We offer various catering packages suited for Weddings, Birthdays, and Corporate events. You can view the full list and prices in the 'Packages' section of our website."
    },
    {
      question: "Do you require a down payment?",
      answer: "Yes, to secure your date, we typically require a 50% down payment. You can track your payments in your dashboard after booking."
    },
    {
      question: "Where are you located?",
      answer: "We are proudly based in Binan, Laguna. We cater to events throughout the Calabarzon area and Metro Manila."
    },
    {
      question: "Can I customize my menu?",
      answer: "Absolutely! Our packages allow you to select specific dishes from our Menu. If you have special requests or dietary restrictions, you can mention them in the chat with our admin."
    }
  ];

  const handleFAQClick = (faq) => {
    // 1. Add User Question
    const userMsg = { id: Date.now(), text: faq.question, sender: 'user', type: 'text' };
    
    // 2. Add Bot Answer (with small delay for realism)
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, text: faq.answer, sender: 'bot', type: 'text' };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-pink-600 animate-bounce'}`}
      >
        {isOpen ? <FaTimes className="text-white text-xl" /> : <FaComments className="text-white text-2xl" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-fade-in-up h-[500px]">
          
          {/* Header */}
          <div className="bg-pink-600 p-4 flex items-center gap-3 shadow-md">
            <div className="bg-white/20 p-2 rounded-full">
              <FaRobot className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-white font-bold">Mommy Rosal's Assistant</h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-pink-100 text-xs">Online</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 text-sm shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-pink-600 text-white rounded-br-none rounded-2xl' 
                      : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none rounded-2xl'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* FAQ Suggestions Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2 font-medium ml-1">Suggested Questions:</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {faqs.map((faq, index) => (
                <button
                  key={index}
                  onClick={() => handleFAQClick(faq)}
                  className="whitespace-nowrap flex-shrink-0 bg-pink-50 text-pink-700 text-xs px-3 py-2 rounded-full border border-pink-100 hover:bg-pink-100 transition"
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>

          {/* Footer / Input Placeholder */}
          <div className="p-3 bg-gray-50 text-center text-xs text-gray-400 border-t">
            Need more help? <a href="/#contact" className="text-pink-600 hover:underline">Contact Us</a> directly.
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;