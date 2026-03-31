import React from "react";

const conversations = [
  { initials: "JS", name: "John Smith", time: "03:23 AM", message: "Do you offer vegetarian ...", active: true },
  { initials: "MS", name: "Maria Santos", time: "02:55 AM", message: "I'd like to inquire about y..." },
  { initials: "DL", name: "David Lee", time: "01:25 AM", message: "What's included in the 5..." },
  { initials: "SJ", name: "Sarah Johnson", time: "10:25 PM", message: "Is the venue included in ..." },
];

const CustomerChat = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
    <p className="text-gray-500 mb-6">Manage your catering business</p>
    <h2 className="text-xl font-bold mb-4">Customer Chat</h2>
    <div className="bg-white rounded-lg shadow flex">
      <div className="w-1/3 border-r p-4">
        <div className="flex mb-4">
          <button className="font-bold border-b-2 border-pink-600 mr-4 pb-1">Live Chat</button>
          <button className="text-gray-500 pb-1">Chat History</button>
        </div>
        <input className="border rounded px-2 py-1 w-full mb-4" placeholder="Search conversations..." />
        <div>
          {conversations.map((c, i) => (
            <div key={i} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${c.active ? "bg-pink-50 border-l-4 border-pink-600" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">{c.initials}</div>
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-gray-500">{c.message}</div>
              </div>
              <div className="ml-auto text-xs text-gray-400">{c.time}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="font-bold mb-2">John Smith</div>
        <div className="text-xs text-gray-500 mb-4">Started conversation 4/14/2023, 10:25 AM</div>
        <div className="bg-gray-50 rounded p-3 mb-2 w-fit">
          Hello, I'm interested in your catering services. Do you offer vegetarian options?
          <div className="text-xs text-gray-400 text-right mt-1">03:23 AM</div>
        </div>
      </div>
    </div>
  </div>
);

export default CustomerChat;
