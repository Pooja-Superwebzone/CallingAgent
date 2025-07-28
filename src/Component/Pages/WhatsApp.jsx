
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Paperclip, Smile, Send, RefreshCw } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import {
  getWhatsappChats,
  getWhatsappChatByNumber,
  sendWhatsappTextMessage
} from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

const WhatsApp = () => {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const fileRef = useRef();
  const messageEndRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedPhone = query.get("chat");

  // Load chat list
  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await getWhatsappChats();
        const dataWithIds = res?.data?.map((item, index) => {
          const phone = item.direction === "inbound" ? item.from : item.to;
          return {
            id: index + 1,
            name: item.profile_name?.trim() || "Anonymous",
            avatar: "/avatar.webp",
            phone: phone.replace("whatsapp:", ""),
            messages: [
              {
                from: item.status === "received" ? "bot" : "user",
                text: item.latest_message || "No message",
                time: new Date(item.at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              }
            ],
            loaded: false,
            raw: item
          };
        }) || [];

        setChats(dataWithIds);
      } catch (err) {
        console.error("Failed to fetch chats:", err.message);
      }
    }

    fetchChats();
  }, []);

  // Load full messages for chat from query param only after chats are set
  useEffect(() => {
    if (!selectedPhone || chats.length === 0) return;
    const found = chats.find(c => c.phone === selectedPhone);
    if (found) {
      handleChatSelect(found);
    }
  }, [chats, selectedPhone]);

  const handleChatSelect = async (chat) => {
    navigate(`?chat=${chat.phone}`);

    // ✅ If already loaded, just select it
    if (chat.loaded) {
      setSelectedChatId(chat.id);
      return;
    }

    try {
      const res = await getWhatsappChatByNumber(chat.phone);
      const timestamps = res?.data?.timestamps || [];
      const fullMessages = timestamps
        .sort((a, b) => new Date(a.at) - new Date(b.at))
        .map((msg) => ({
          from: msg.status === "received" ? "bot" : "user",
          text: msg.message,
          time: new Date(msg.at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        }));

      const updatedChats = chats.map((c) =>
        c.id === chat.id
          ? { ...c, messages: fullMessages, loaded: true }
          : c
      );
      setChats(updatedChats);
      setSelectedChatId(chat.id); // ✅ Set after update
    } catch (error) {
      console.error("❌ Failed to load messages:", error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return;

    const selected = chats.find(chat => chat.id === selectedChatId);
    if (!selected || !selected.phone) {
      alert("No phone number selected.");
      return;
    }

    let rawPhone = selected.phone.replace(/\s+/g, '').trim();
    if (!rawPhone.startsWith("+")) {
      rawPhone = "+" + rawPhone;
    }

    if (!/^\+\d{10,15}$/.test(rawPhone)) {
      alert("Invalid phone number format.");
      return;
    }

    const tempMsg = {
      from: "user",
      text: inputMessage,
      file: selectedFile ? URL.createObjectURL(selectedFile) : null,
      fileName: selectedFile?.name || null,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
      pending: true
    };

    setChats(prev =>
      prev.map(chat =>
        chat.id === selectedChatId
          ? { ...chat, messages: [...chat.messages, tempMsg] }
          : chat
      )
    );

    setInputMessage("");
    setSelectedFile(null);

    try {
      await sendWhatsappTextMessage({
        to: rawPhone,
        message: tempMsg.text
      });
    } catch (error) {
      alert("Error sending message: " + (error.response?.data?.message || error.message));
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      const botReply = {
        from: "bot",
        text: "Thanks for your message! We'll help you shortly.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      };
      setChats(prev =>
        prev.map(chat =>
          chat.id === selectedChatId
            ? { ...chat, messages: [...chat.messages, botReply] }
            : chat
        )
      );
      setIsTyping(false);
    }, 2000);
  };

  const handleRefresh = () => {
    const chat = chats.find(c => c.id === selectedChatId);
    if (!chat) return;
    setChats(prev =>
      prev.map(c =>
        c.id === chat.id ? { ...c, loaded: false } : c
      )
    );
    handleChatSelect(chat);
  };

  const handleEmojiClick = (e) => {
    setInputMessage(prev => prev + e.emoji);
    setShowEmoji(false);
  };

  const selectedChat = useMemo(() => {
    return chats.find(c => c.id === selectedChatId);
  }, [chats, selectedChatId]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, selectedChatId]);

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
        {chats
          .filter(chat => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(chat => (
            <div
              key={chat.id}
              className={`flex items-center gap-3 p-4 cursor-pointer border-b border-[#cdd1d6] hover:bg-gray-100 ${selectedChatId === chat.id ? "bg-gray-100" : ""}`}
              onClick={() => handleChatSelect(chat)}
            >
              <img
                src={chat.avatar || "/avatar.png"}
                className="w-10 h-10 rounded-full object-cover"
                alt="avatar"
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
                <div className="font-semibold text-gray-800">{selectedChat.name}</div>
              </div>
              <button onClick={handleRefresh} className="text-gray-500 hover:text-black">
                <RefreshCw size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {selectedChat.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "items-start gap-2"}`}>
                  <div className={`p-3 rounded-lg shadow max-w-sm text-sm ${msg.from === "user" ? "bg-blue-500 text-white" : "bg-white text-black"}`}>
                    {msg.text && <p>{msg.text}</p>}
                    {msg.file && (
                      <a
                        href={msg.file}
                        download={msg.fileName}
                        className="underline text-xs block mt-2"
                      >
                        📎 {msg.fileName}
                      </a>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 self-end ml-1">{msg.time}</span>
                </div>
              ))}
              <div ref={messageEndRef} />
              {isTyping && (
                <div className="flex items-start gap-2">
                  <img src="/avatar.png" className="w-10 h-10 rounded-full" />
                  <div className="p-3 rounded-lg shadow max-w-sm text-sm bg-white font-medium text-gray-400">
                    … typing
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#cdd1d6] flex flex-col bg-white">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  hidden
                  ref={fileRef}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setSelectedFile(file);
                  }}
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
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"
                  onClick={handleSendMessage}
                >
                  <Send size={20} />
                </button>
              </div>
              {selectedFile && (
                <div className="text-xs text-gray-600 mt-2 ml-2">
                  Selected file: {selectedFile.name}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-3">
            <div className="bg-gray-200 p-4 rounded-full">
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-3xl text-gray-400"
                height="40"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
              >
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

