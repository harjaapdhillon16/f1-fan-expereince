"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useActiveEvent } from "../_components/useActiveEvent";
import { useSupabaseUser } from "../_components/useSupabaseUser";

interface ChatMessage {
  id: string;
  role: string;
  message: string;
  created_at: string;
}

const quickPrompts = [
  "Where is the nearest gate?",
  "Show me parking updates",
  "When does qualifying start?",
  "Need help finding my seat",
];

export default function ChatPage() {
  const { user } = useSupabaseUser();
  const { activeEventId } = useActiveEvent();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadThread = async () => {
      if (!supabase || !user) return;
      const { data } = await supabase
        .from("chat_threads")
        .select("id")
        .eq("user_id", user.id)
        .eq("event_id", activeEventId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.id) {
        setThreadId(data.id);
      }
    };

    loadThread();
  }, [user, activeEventId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!supabase || !threadId) return;
      const { data } = await supabase
        .from("chat_messages")
        .select("id, role, message, created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      setMessages(data ?? []);
    };

    loadMessages();
  }, [threadId]);

  const sendMessage = async (text: string) => {
    if (!user) {
      setStatus("Sign in to chat with the assistant.");
      return;
    }
    if (!supabase) return;
    if (!text.trim()) return;

    let activeThreadId = threadId;

    if (!activeThreadId) {
      const { data, error } = await supabase
        .from("chat_threads")
        .insert({ event_id: activeEventId, user_id: user.id })
        .select("id")
        .single();
      if (error || !data) {
        setStatus(error?.message ?? "Unable to create chat thread.");
        return;
      }
      activeThreadId = data.id;
      setThreadId(data.id);
    }

    const { data: newMessage, error: messageError } = await supabase
      .from("chat_messages")
      .insert({ thread_id: activeThreadId, role: "user", message: text })
      .select("id, role, message, created_at")
      .single();

    if (messageError) {
      setStatus(messageError.message);
      return;
    }

    if (newMessage) {
      setMessages((prev) => [...prev, newMessage]);
    }
    setInput("");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Fan Chatbot
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Ask the assistant
        </h1>
      </div>

      <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
        <div className="max-h-80 space-y-3 overflow-auto rounded-2xl border border-ice/10 bg-ink/70 p-4 text-sm">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl px-4 py-2 ${
                message.role === "assistant"
                  ? "bg-ice/10 text-ice"
                  : "bg-redline/20 text-ice"
              }`}
            >
              {message.message}
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-xs text-ice/60">No messages yet.</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              className="rounded-full border border-ice/20 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-ice/70"
              onClick={() => sendMessage(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <input
            className="flex-1 rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a question"
            type="text"
            value={input}
          />
          <button
            className="rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
            onClick={() => sendMessage(input)}
            type="button"
          >
            Send
          </button>
        </div>
        {status && <p className="mt-3 text-xs text-ice/60">{status}</p>}
      </div>
    </div>
  );
}
