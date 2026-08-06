import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Send, RefreshCw, ArrowLeft, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getWhatsappChats,
  getWhatsappChatThread,
  sendWhatsappText,
  normalizePhone,
} from "../../../api/whatsappApi";

const POLL_INTERVAL_MS = 12000;

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatListTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return formatTime(dateStr);
  }
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
}

function contactLabel(chat) {
  return chat.profile_name?.trim() || chat.contact_number || chat.from || "Unknown";
}

export default function WhatsAppInbox() {
  const [chats, setChats] = useState([]);
  const [businessNumber, setBusinessNumber] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messageEndRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const queryPhone = useMemo(
    () => new URLSearchParams(location.search).get("chat"),
    [location.search]
  );

  const fetchChatList = useCallback(async (silent = false) => {
    if (!silent) setLoadingList(true);
    try {
      const res = await getWhatsappChats();
      const list = Array.isArray(res?.data) ? res.data : [];
      setChats(list);
      if (res?.business_number) setBusinessNumber(res.business_number);
    } catch (err) {
      if (!silent) toast.error(err.message || "Failed to load chats");
    } finally {
      if (!silent) setLoadingList(false);
    }
  }, []);

  const fetchThread = useCallback(async (contactNumber, silent = false) => {
    if (!contactNumber) return;
    if (!silent) setLoadingThread(true);
    try {
      const res = await getWhatsappChatThread(contactNumber);
      const timestamps = res?.data?.timestamps || [];
      const sorted = [...timestamps].sort(
        (a, b) => new Date(a.at.replace(" ", "T")) - new Date(b.at.replace(" ", "T"))
      );
      setMessages(sorted);
      if (res?.data?.profile_name) {
        setSelectedContact((prev) =>
          prev?.contact_number === contactNumber
            ? { ...prev, profile_name: res.data.profile_name }
            : prev
        );
      }
    } catch (err) {
      if (!silent) toast.error(err.message || "Failed to load conversation");
    } finally {
      if (!silent) setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    fetchChatList();
    const id = setInterval(() => fetchChatList(true), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchChatList]);

  useEffect(() => {
    if (!selectedContact?.contact_number) return;
    fetchThread(selectedContact.contact_number);
    const id = setInterval(
      () => fetchThread(selectedContact.contact_number, true),
      POLL_INTERVAL_MS
    );
    return () => clearInterval(id);
  }, [selectedContact?.contact_number, fetchThread]);

  useEffect(() => {
    if (!queryPhone || chats.length === 0) return;
    const normalized = normalizePhone(queryPhone);
    const found = chats.find(
      (c) => normalizePhone(c.contact_number || c.from) === normalized
    );
    if (found) {
      setSelectedContact({
        contact_number: normalizePhone(found.contact_number || found.from),
        profile_name: found.profile_name,
      });
    }
  }, [queryPhone, chats]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectChat = (chat) => {
    const number = normalizePhone(chat.contact_number || chat.from);
    setSelectedContact({ contact_number: number, profile_name: chat.profile_name });
    navigate(`?chat=${encodeURIComponent(number)}`);
    setSidebarOpen(false);
  };

  const handleSend = async () => {
    const text = inputMessage.trim();
    if (!text || !selectedContact?.contact_number) return;

    const to = normalizePhone(selectedContact.contact_number);
    setSending(true);
    setInputMessage("");

    try {
      await sendWhatsappText({ to, message: text });
      toast.success("Message sent");
      await fetchThread(to, true);
      await fetchChatList(true);
    } catch (err) {
      toast.error(err.message || "Failed to send message");
      setInputMessage(text);
    } finally {
      setSending(false);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const label = contactLabel(chat).toLowerCase();
    const phone = (chat.contact_number || chat.from || "").toLowerCase();
    const q = searchTerm.toLowerCase();
    return label.includes(q) || phone.includes(q);
  });

  return (
    <div className="relative flex flex-col md:flex-row h-[calc(100vh-0px)] w-full bg-white">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow z-50 border-b">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-800">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-lg text-gray-800">WhatsApp Inbox</h2>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-800">
          <MessageSquare size={22} />
        </button>
      </div>

      {/* Chat list */}
      <aside
        className={`fixed md:static top-0 left-0 h-full bg-gray-50 z-40 border-r border-gray-200 w-80 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b bg-white">
          <div className="hidden md:flex items-center justify-between mb-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              onClick={() => fetchChatList()}
              className="text-gray-500 hover:text-gray-800"
              title="Refresh"
            >
              <RefreshCw size={16} className={loadingList ? "animate-spin" : ""} />
            </button>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Conversations</h3>
          {businessNumber && (
            <p className="text-xs text-gray-500 mb-2">Business: {businessNumber}</p>
          )}
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-y-auto h-[calc(100vh-140px)]">
          {loadingList && chats.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">Loading chats...</p>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="mx-auto mb-2 opacity-40" size={32} />
              <p className="text-sm font-medium">No conversations yet</p>
            </div>
          ) : (
            filteredChats.map((chat, idx) => {
              const number = normalizePhone(chat.contact_number || chat.from);
              const isSelected = selectedContact?.contact_number === number;
              return (
                <div
                  key={`${number}-${idx}`}
                  onClick={() => handleSelectChat(chat)}
                  className={`flex items-start gap-3 p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-100 ${
                    isSelected ? "bg-indigo-50" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm shrink-0">
                    {(contactLabel(chat)[0] || "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-sm text-gray-800 truncate">
                        {contactLabel(chat)}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatListTime(chat.at)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {chat.latest_message || "—"}
                    </p>
                    <div className="flex gap-1 mt-1">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          chat.direction === "inbound"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {chat.direction === "inbound" ? "Inbound" : "Outbound"}
                      </span>
                      {chat.status && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {chat.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Thread */}
      <main className="flex-1 flex flex-col min-h-0">
        {selectedContact ? (
          <>
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <div>
                <div className="font-semibold text-gray-800">
                  {selectedContact.profile_name || selectedContact.contact_number}
                </div>
                <div className="text-xs text-gray-500">{selectedContact.contact_number}</div>
              </div>
              <button
                onClick={() => fetchThread(selectedContact.contact_number)}
                className="text-gray-500 hover:text-gray-800"
              >
                <RefreshCw size={18} className={loadingThread ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]">
              {loadingThread && messages.length === 0 ? (
                <p className="text-center text-sm text-gray-500">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-sm text-gray-500">No messages in this thread</p>
              ) : (
                messages.map((msg) => {
                  const isOutbound = msg.direction === "outbound";
                  return (
                    <div
                      key={msg.id ?? `${msg.at}-${msg.message}`}
                      className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm text-sm ${
                          isOutbound
                            ? "bg-[#dcf8c6] text-gray-900 rounded-tr-none"
                            : "bg-white text-gray-900 rounded-tl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400">{formatTime(msg.at)}</span>
                          {msg.status && (
                            <span className="text-[10px] text-gray-400">{msg.status}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messageEndRef} />
            </div>

            <div className="p-3 border-t bg-white">
              <p className="text-xs text-amber-600 mb-2">
                Free-text replies work only within the 24-hour session window after the user messages you.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a reply..."
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !inputMessage.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-2.5 rounded-full"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <MessageSquare size={48} className="opacity-30" />
            <p className="text-base font-medium">Select a conversation to view messages</p>
            {businessNumber && (
              <p className="text-xs text-gray-400">Plivo · {businessNumber}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
