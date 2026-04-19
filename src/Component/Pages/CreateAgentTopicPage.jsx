import React, { useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createAgent,
  generateAgentFaq,
  sendAgentChatMessage,
  startAgentTopic,
} from "../../hooks/useAuth";

export default function CreateAgentTopicPage() {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generatedFaq, setGeneratedFaq] = useState("");
  const [agentCreated, setAgentCreated] = useState(false);
  const chatEndRef = useRef(null);

  const isStarted = !!sessionId;
  const canSendMessage = isStarted && !sending && message.trim().length > 0;
  const canCreateAgent = readyToGenerate && !creating && !agentCreated;

  const startButtonText = useMemo(
    () => (starting ? "Starting..." : "Start"),
    [starting]
  );

  const handleStart = async (e) => {
    e.preventDefault();
    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      toast.error("Please enter topic");
      return;
    }

    try {
      setStarting(true);
      const res = await startAgentTopic({ topic: cleanTopic });
      const nextSessionId = res?.session_id;
      if (!nextSessionId) {
        throw new Error("Session id not received from start API");
      }
      setSessionId(nextSessionId);
      setMessages([
        {
          role: "system",
          text: `Session started for topic: ${cleanTopic}`,
        },
      ]);
      toast.success("Topic started");
    } catch (err) {
      toast.error(err.message || "Failed to start topic");
    } finally {
      setStarting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage || !sessionId) return;

    const nextUserMessage = { role: "user", text: cleanMessage };
    setMessages((prev) => [...prev, nextUserMessage]);
    setMessage("");

    try {
      setSending(true);
      const res = await sendAgentChatMessage({
        session_id: sessionId,
        message: cleanMessage,
      });

      const reply = res?.reply || "No response";
      const isReady = !!res?.ready_to_generate;
      setReadyToGenerate(isReady);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);

      // Scroll to latest response after rendering.
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    } catch (err) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleCreateAgent = () => {
    if (!sessionId) {
      toast.error("Session not found");
      return;
    }

    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      toast.error("Topic is required");
      return;
    }

    const run = async () => {
      try {
        setCreating(true);

        const generateRes = await generateAgentFaq({ session_id: sessionId });
        const faq = (generateRes?.result || "").trim();
        if (!faq || faq.toLowerCase() === "no response") {
          throw new Error("FAQ generation returned no response");
        }

        setGeneratedFaq(faq);

        await createAgent({
          name: cleanTopic,
          welcome_message: cleanTopic,
          body: faq,
        });

        setAgentCreated(true);
        toast.success("Agent created successfully");
      } catch (err) {
        toast.error(err.message || "Failed to create agent");
      } finally {
        setCreating(false);
      }
    };

    run();
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-3xl bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Agent</h2>

        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic"
              disabled={isStarted || starting}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={starting || isStarted}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {startButtonText}
            </button>
          </div>
        </form>

        {isStarted && (
          <div className="mt-6 border rounded-lg">
            <div className="h-80 overflow-y-auto p-4 bg-gray-50 rounded-t-lg space-y-3">
              {messages.map((item, idx) => (
                <div
                  key={`${item.role}-${idx}`}
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    item.role === "user"
                      ? "ml-auto bg-blue-600 text-white"
                      : item.role === "assistant"
                      ? "bg-white border text-gray-800"
                      : "bg-amber-50 border text-amber-800"
                  }`}
                >
                  {item.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t flex gap-2 items-center"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="submit"
                disabled={!canSendMessage}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Chat"}
              </button>
            </form>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleCreateAgent}
            disabled={!canCreateAgent}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Agent"}
          </button>
        </div>
        {!canCreateAgent && isStarted && (
          <p className="text-xs text-gray-500 mt-2">
            Continue chat until AI marks the session ready to generate.
          </p>
        )}

        {generatedFaq && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Generated FAQ
            </h3>
            <div className="border rounded-lg p-4 bg-gray-50 max-h-80 overflow-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {generatedFaq}
              </pre>
            </div>
          </div>
        )}

        {agentCreated && (
          <p className="mt-3 text-sm text-green-700">
            Agent created using this topic and full generated FAQ.
          </p>
        )}
      </div>
    </div>
  );
}
