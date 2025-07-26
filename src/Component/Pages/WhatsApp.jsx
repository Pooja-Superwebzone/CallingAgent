import React, { useState, useRef, useEffect } from "react";
import {
  Paperclip, Smile, Send, RefreshCw
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const dummyUsers = [
  {
    id: 1,
    name: "F24",
    avatar: "",
    messages: [
      { from: "bot", text: "👋 Welcome to Financier24! How can I assist you today?", time: "10:30" },
      { from: "user", text: "hi", time: "10:31" },
    ],
  },
  {
    id: 2,
    name: "Alice",
    avatar: "",
    messages: [
      { from: "bot", text: "Hi Alice, looking for leasing options?", time: "09:45" },
    ],
  },
  {
    id: 3,
    name: "Bob",
    avatar: "",
    messages: [
      { from: "bot", text: "Hello Bob! Want to browse BMW or Audi?", time: "08:20" },
    ],
  },
];

const WhatsApp = () => {
  const [chats, setChats] = useState(dummyUsers);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const fileRef = useRef();
  const selectedChat = chats.find(c => c.id === selectedChatId);

  useEffect(() => {
    const savedChats = localStorage.getItem("whatsapp_chats");
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("whatsapp_chats", JSON.stringify(chats));
  }, [chats]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMsg = {
      from: "user",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedChats = chats.map(chat =>
      chat.id === selectedChatId ? {
        ...chat,
        messages: [...chat.messages, newMsg]
      } : chat
    );
    setChats(updatedChats);
    setInputMessage("");

    setIsTyping(true);
    setTimeout(() => {
      const botReply = {
        from: "bot",
        text: "Thanks for your message! We'll help you shortly.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats(prev =>
        prev.map(chat =>
          chat.id === selectedChatId ? {
            ...chat,
            messages: [...chat.messages, botReply]
          } : chat
        )
      );
      setIsTyping(false);
    }, 2000);
  };

  const handleRefresh = () => {
    const refreshed = chats.map(chat =>
      chat.id === selectedChatId
        ? { ...chat, messages: [...chat.messages] }
        : chat
    );
    setChats(refreshed);
    alert("Chat refreshed!");
  };

  const handleEmojiClick = (e) => {
    setInputMessage(prev => prev + e.emoji);
    setShowEmoji(false);
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[300px] border-r border-[#cdd1d6] bg-gray-50 hidden md:flex flex-col">
        <div className="p-4 border-b border-[#cdd1d6]">
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full px-3 py-2 border border-[#cdd1d6] rounded-md text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {chats.filter(chat => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(chat => (
            <div
              key={chat.id}
              className={`flex items-center gap-3 p-4 cursor-pointer border-b border-[#cdd1d6] hover:bg-gray-100 ${selectedChatId === chat.id ? "bg-gray-100" : ""}`}
              onClick={() => setSelectedChatId(chat.id)}
            >
              <img
                src={chat.avatar || "/avatar.png"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold">{chat.name}</div>
                <div className="text-xs text-gray-500 truncate w-[200px]">
                  {chat.messages[chat.messages.length - 1]?.text}
                </div>
              </div>
            </div>
          ))}
      </aside>

      {/* Chat Panel */}
      <main className="flex-1 flex flex-col relative">
        {selectedChat ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#cdd1d6] bg-white">
              <div className="flex items-center gap-3">
                <img
                  src={selectedChat.avatar || "/avatar.png"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleRefresh} className="text-gray-500 hover:text-black">
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {selectedChat.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.from === "user" ? "justify-end" : "items-start gap-2"}`}
                >
                  {msg.from === "bot" && (
                    <img src="/avatar.png" className="w-10 h-10 rounded-full" />
                  )}
                  <div className={`p-3 rounded-lg shadow max-w-sm text-sm ${msg.from === "user" ? "bg-blue-500 text-white" : "bg-white"}`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-400 self-end ml-1">{msg.time}</span>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start gap-2">
                  <img src="/avatar.png" className="w-10 h-10 rounded-full" />
                  <div className="p-3 rounded-lg shadow max-w-sm text-sm bg-white font-medium text-gray-400">
                    … typing
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#cdd1d6] flex items-center gap-3 bg-white relative">
              <input
                type="file"
                hidden
                ref={fileRef}
                onChange={(e) => alert(`File selected: ${e.target.files[0].name}`)}
              />
              <button onClick={() => fileRef.current.click()} className="text-gray-500">
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border border-[#cdd1d6] rounded-full px-4 py-2 text-sm"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <div className="relative">
                <button className="text-gray-500" onClick={() => setShowEmoji(!showEmoji)}>
                  <Smile size={20} />
                </button>
                {showEmoji && (
                  <div className="absolute bottom-12 right-0 z-50">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full" onClick={handleSendMessage}>
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-3">
            <div className="bg-gray-200 p-4 rounded-full">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="text-3xl text-gray-400" height="40" width="40" xmlns="http://www.w3.org/2000/svg">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </div>
            <p className="text-base font-medium">Select a chat to start messaging</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WhatsApp;
