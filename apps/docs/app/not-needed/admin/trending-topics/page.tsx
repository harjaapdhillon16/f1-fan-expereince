"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

interface Topic {
  id: string;
  name: string;
}

interface ChatMessage {
  id: string;
  message: string;
}

export default function TrendingTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedMessage, setSelectedMessage] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    if (!supabase) return;
    const { data: topicData } = await supabase
      .from("topics")
      .select("id, name")
      .order("name", { ascending: true });
    setTopics(topicData ?? []);

    const { data: messageData } = await supabase
      .from("chat_messages")
      .select("id, message")
      .order("created_at", { ascending: false })
      .limit(50);
    setMessages(messageData ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddTopic = async () => {
    if (!supabase) return;
    const { error } = await supabase
      .from("topics")
      .insert({ name: newTopic });
    setStatus(error ? error.message : "Topic added.");
    setNewTopic("");
    load();
  };

  const handleTagMessage = async () => {
    if (!supabase) return;
    const { error } = await supabase.from("chat_message_topics").insert({
      message_id: selectedMessage,
      topic_id: selectedTopic,
    });
    setStatus(error ? error.message : "Message tagged.");
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="admin-kicker">
          Trending Topics
        </p>
        <h1 className="mt-3 admin-title">
          Tag and track topics
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-card p-6">
          <p className="admin-kicker-muted">
            Add Topic
          </p>
          <input
            className="mt-4 admin-input"
            onChange={(event) => setNewTopic(event.target.value)}
            placeholder="Topic name"
            type="text"
            value={newTopic}
          />
          <button
            className="mt-4 w-full admin-button-primary"
            onClick={handleAddTopic}
            type="button"
          >
            Add topic
          </button>
        </div>

        <div className="admin-card p-6">
          <p className="admin-kicker-muted">
            Tag Message
          </p>
          <select
            className="mt-4 admin-select"
            onChange={(event) => setSelectedTopic(event.target.value)}
            value={selectedTopic}
          >
            <option value="">Select topic</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
          <select
            className="mt-3 admin-select"
            onChange={(event) => setSelectedMessage(event.target.value)}
            value={selectedMessage}
          >
            <option value="">Select message</option>
            {messages.map((message) => (
              <option key={message.id} value={message.id}>
                {message.message.slice(0, 50)}
              </option>
            ))}
          </select>
          <button
            className="mt-4 w-full admin-button-secondary"
            onClick={handleTagMessage}
            type="button"
          >
            Tag message
          </button>
        </div>
      </div>
      {status && <p className="text-xs text-opsfog/60">{status}</p>}
    </div>
  );
}
