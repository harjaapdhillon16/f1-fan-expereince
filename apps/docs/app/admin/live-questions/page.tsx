"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

interface Thread {
  id: string;
  user_id: string | null;
  status: string;
  created_at: string;
}

interface Message {
  thread_id: string;
  role: string;
  message: string;
  created_at: string;
}

export default function LiveQuestionsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState("");

  const load = async () => {
    if (!supabase) return;
    const { data: threadData } = await supabase
      .from("chat_threads")
      .select("id, user_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    setThreads(threadData ?? []);

    const { data: messageData } = await supabase
      .from("chat_messages")
      .select("thread_id, role, message, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    setMessages(messageData ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const threadMessages = useMemo(() => {
    const map: Record<string, Message[]> = {};
    messages.forEach((message) => {
      if (!map[message.thread_id]) map[message.thread_id] = [];
      map[message.thread_id].push(message);
    });
    return map;
  }, [messages]);

  const handleClose = async (threadId: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("chat_threads")
      .update({ status: "closed" })
      .eq("id", threadId);
    setStatus(error ? error.message : "Thread closed.");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="admin-kicker">
          Live Questions
        </p>
        <h1 className="mt-3 admin-title">
          Fan questions stream
        </h1>
      </div>

      <div className="space-y-4">
        {threads.map((thread) => {
          const threadList = threadMessages[thread.id] ?? [];
          const latest = threadList[0];
          return (
            <div
              key={thread.id}
              className="admin-card p-6"
            >
              <div className="flex items-center justify-between admin-kicker-muted">
                <span>Fan {thread.user_id ? thread.user_id.slice(0, 6) : "Anon"}</span>
                <span>{thread.status}</span>
              </div>
              <p className="mt-3 text-sm text-opsfog">
                {latest?.message ?? "No messages"}
              </p>
              <button
                className="mt-4 admin-button-secondary"
                onClick={() => handleClose(thread.id)}
                type="button"
              >
                Close thread
              </button>
            </div>
          );
        })}
        {threads.length === 0 && (
          <p className="text-sm text-opsfog/60">No active threads.</p>
        )}
      </div>
      {status && <p className="text-xs text-opsfog/60">{status}</p>}
    </div>
  );
}
