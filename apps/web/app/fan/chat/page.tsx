"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../../../lib/supabaseClient";
import { useActiveEvent } from "../_components/useActiveEvent";
import { useSupabaseUser } from "../_components/useSupabaseUser";

interface ChatMessage {
  id: string;
  role: string;
  message: string;
  created_at: string;
}

function createLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createLocalMessage(role: "user" | "assistant", message: string): ChatMessage {
  return {
    id: createLocalId(),
    role,
    message,
    created_at: new Date().toISOString(),
  };
}

function formatChatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const quickPrompts = [
  "When does the 2026 Mexico GP race start?",
  "What is the bag policy?",
];

export default function ChatPage() {
  const { user } = useSupabaseUser();
  const { activeEventId, events } = useActiveEvent();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const activeEvent = useMemo(
    () => events.find((event) => event.id === activeEventId) ?? null,
    [events, activeEventId]
  );

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

  useEffect(() => {
    if (!scrollRef.current) return;
    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages.length, isSending]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (isSending) return;

    setIsSending(true);
    setStatus("");

    try {
      const canPersist = Boolean(user && supabase);
      let activeThreadId = threadId;

      if (canPersist && !activeThreadId) {
        const { data, error } = await supabase!
          .from("chat_threads")
          .insert({ event_id: activeEventId, user_id: user!.id })
          .select("id")
          .single();
        if (error || !data) {
          throw new Error(error?.message ?? "Unable to create chat thread.");
        }
        activeThreadId = data.id;
        setThreadId(data.id);
      }

      if (canPersist) {
        const { data: newMessage, error: messageError } = await supabase!
          .from("chat_messages")
          .insert({ thread_id: activeThreadId, role: "user", message: trimmed })
          .select("id, role, message, created_at")
          .single();

        if (messageError || !newMessage) {
          setStatus(messageError?.message ?? "Unable to send message.");
          return;
        }

        setMessages((prev) => [...prev, newMessage]);
      } else {
        const localMessage = createLocalMessage("user", trimmed);
        setMessages((prev) => [...prev, localMessage]);
      }
      setInput("");

      const history = messages
        .filter(
          (message) =>
            message.role === "user" || message.role === "assistant"
        )
        .slice(-8)
        .map((message) => ({
          role: message.role,
          content: message.message,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history,
          eventName: activeEvent?.name ?? undefined,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error ?? "Unable to reach the assistant."
        );
      }

      const data = await response.json();
      const reply = typeof data?.reply === "string" ? data.reply.trim() : "";
      if (!reply) {
        throw new Error("Assistant did not return a response.");
      }

      if (canPersist) {
        const { data: assistantMessage, error: assistantError } = await supabase!
          .from("chat_messages")
          .insert({
            thread_id: activeThreadId,
            role: "assistant",
            message: reply,
          })
          .select("id, role, message, created_at")
          .single();

        if (assistantError || !assistantMessage) {
          throw new Error(assistantError?.message ?? "Unable to save response.");
        }

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const localReply = createLocalMessage("assistant", reply);
        setMessages((prev) => [...prev, localReply]);
      }
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to reach the assistant."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 -mt-4 px-4 pb-6 sm:px-6 lg:px-10">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Fan Chatbot
        </p>
        <h1 className="mt-2 text-2xl font-semibold uppercase tracking-[0.1em] md:text-3xl">
          Ask the assistant
        </h1>
      </div>

      <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-4 sm:p-5 lg:p-6">
        <div className="flex items-center justify-between border-b border-ice/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-redline/20 text-sm font-semibold uppercase text-redline">
              AI
            </div>
            <div>
              <p className="text-sm font-semibold text-ice">Circuit Assistant</p>
              <p className="text-xs text-ice/60">
                {activeEvent?.name ?? "Mexico Grand Prix 2026 Demo"}
              </p>
            </div>
          </div>
          <span className="rounded-full border border-ice/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-ice/60">
            Live help
          </span>
        </div>

        <div className="mt-4 flex h-[calc(100vh-300px)] min-h-[420px] flex-col lg:h-[calc(100vh-280px)]">
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-auto pr-2 text-sm"
          >
            {messages.map((message) => {
              const isAssistant = message.role === "assistant";
              return (
                <div
                  key={message.id}
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl border px-4 py-3 ${
                      isAssistant
                        ? "border-ice/10 bg-ice/10 text-ice"
                        : "border-redline/40 bg-redline text-ice"
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.3em] text-ice/60">
                      {isAssistant ? "Assistant" : "You"}
                    </div>
                    {isAssistant ? (
                      <ReactMarkdown
                        className="mt-2 space-y-2 text-sm text-ice"
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="text-sm text-ice">{children}</p>
                          ),
                          a: ({ children, href }) => (
                            <a
                              className="text-redline underline decoration-redline/60 underline-offset-2"
                              href={href ?? "#"}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {children}
                            </a>
                          ),
                          ul: ({ children }) => (
                            <ul className="ml-4 list-disc space-y-1 text-sm text-ice">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="ml-4 list-decimal space-y-1 text-sm text-ice">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-sm text-ice">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-ice">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-ice/90">{children}</em>
                          ),
                          code: ({ children }) => (
                            <code className="rounded bg-ink/70 px-1 py-0.5 text-[12px] text-ice">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="mt-2 overflow-x-auto rounded-2xl bg-ink/70 p-3 text-xs text-ice">
                              {children}
                            </pre>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-redline/40 pl-3 text-sm text-ice/80">
                              {children}
                            </blockquote>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-base font-semibold text-ice">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-sm font-semibold text-ice">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-semibold text-ice/90">
                              {children}
                            </h3>
                          ),
                        }}
                      >
                        {message.message}
                      </ReactMarkdown>
                    ) : (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-ice">
                        {message.message}
                      </p>
                    )}
                    {message.created_at && (
                      <span className="mt-2 block text-[10px] text-ice/50">
                        {formatChatTime(message.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {isSending && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-2xl border border-ice/10 bg-ice/10 px-4 py-3 text-xs text-ice/70">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-ice/60">
                    Assistant
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ice/60" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ice/60" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ice/60" />
                  </div>
                </div>
              </div>
            )}
            {messages.length === 0 && !isSending && (
              <div className="flex h-full items-center justify-center text-xs text-ice/60">
                Ask anything about the Mexico Grand Prix 2026 demo event.
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-ice/10 pt-4">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="rounded-full border border-ice/20 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-ice/70 transition hover:border-ice/40 hover:text-ice disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSending}
                  onClick={() => sendMessage(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-ice/10 bg-ink/70 px-3 py-2">
              <input
                className="flex-1 bg-transparent px-1 py-2 text-sm text-ice placeholder:text-ice/40 focus:outline-none"
                disabled={isSending}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question about the event"
                type="text"
                value={input}
              />
              <button
                className="rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSending || !input.trim()}
                onClick={() => sendMessage(input)}
                type="button"
              >
                Send
              </button>
            </div>
            {!user && (
              <p className="mt-3 text-xs text-ice/50">
                Guest mode: chats are not saved unless you sign in.
              </p>
            )}
            {status && <p className="mt-3 text-xs text-ice/60">{status}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
