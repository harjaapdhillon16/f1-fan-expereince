"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

interface ChatMessage {
  created_at: string;
  sentiment: string | null;
}

interface EngagementEvent {
  id: string;
  event_type: string;
  created_at: string;
}

interface FaqView {
  id: string;
  question: string;
  view_count: number | null;
}

export default function AnalyticsPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [engagementEvents, setEngagementEvents] = useState<EngagementEvent[]>([]);
  const [faqs, setFaqs] = useState<FaqView[]>([]);
  const [topicCounts, setTopicCounts] = useState<{ name: string; count: number }[]>([]);
  const [eventType, setEventType] = useState("");
  const [eventMeta, setEventMeta] = useState("{}");
  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const { data: chatData } = await supabase
        .from("chat_messages")
        .select("created_at, sentiment")
        .order("created_at", { ascending: false })
        .limit(300);
      setChatMessages(chatData ?? []);

      const { data: engagementData } = await supabase
        .from("engagement_events")
        .select("id, event_type, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      setEngagementEvents(engagementData ?? []);

      const { data: faqData } = await supabase
        .from("faqs")
        .select("id, question, view_count")
        .order("view_count", { ascending: false })
        .limit(5);
      setFaqs(faqData ?? []);

      const { data: topicsData } = await supabase
        .from("topics")
        .select("id, name");
      const { data: messageTopics } = await supabase
        .from("chat_message_topics")
        .select("topic_id");

      const counts: Record<string, number> = {};
      (messageTopics ?? []).forEach((item) => {
        counts[item.topic_id] = (counts[item.topic_id] ?? 0) + 1;
      });
      const summary = (topicsData ?? []).map((topic) => ({
        name: topic.name,
        count: counts[topic.id] ?? 0,
      }));
      summary.sort((a, b) => b.count - a.count);
      setTopicCounts(summary.slice(0, 5));
    };

    load();
  }, []);

  const queryVolume = useMemo(() => {
    const buckets = Array.from({ length: 6 }).map((_, index) => ({
      label: `${5 - index}h`,
      count: 0,
    }));

    const now = Date.now();
    chatMessages.forEach((message) => {
      const diffHours = Math.floor((now - new Date(message.created_at).getTime()) / 3600000);
      if (diffHours >= 0 && diffHours < buckets.length) {
        buckets[buckets.length - diffHours - 1].count += 1;
      }
    });

    return buckets;
  }, [chatMessages]);

  const dailyVolume = useMemo(() => {
    const buckets = Array.from({ length: 5 }).map((_, index) => ({
      label: `${4 - index}d`,
      count: 0,
    }));
    const now = Date.now();
    chatMessages.forEach((message) => {
      const diffDays = Math.floor(
        (now - new Date(message.created_at).getTime()) / 86400000
      );
      if (diffDays >= 0 && diffDays < buckets.length) {
        buckets[buckets.length - diffDays - 1].count += 1;
      }
    });
    return buckets;
  }, [chatMessages]);

  const sentiment = useMemo(() => {
    const counts: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };
    chatMessages.forEach((message) => {
      if (!message.sentiment) return;
      if (counts[message.sentiment] !== undefined) {
        counts[message.sentiment] += 1;
      }
    });
    return counts;
  }, [chatMessages]);

  const handleLogEvent = async () => {
    if (!supabase) return;
    try {
      const metadata = JSON.parse(eventMeta || "{}");
      const { error } = await supabase.from("engagement_events").insert({
        event_id: eventId || null,
        event_type: eventType,
        metadata,
      });
      setStatus(error ? error.message : "Engagement event logged.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid JSON");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="admin-kicker">
          Analytics & Insights
        </p>
        <h1 className="mt-3 admin-title">
          Live engagement signals
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-card p-6">
          <p className="admin-kicker-muted">
            Query Volume (last 6h)
          </p>
          <div className="mt-4 grid grid-cols-6 items-end gap-2">
            {queryVolume.map((bucket) => (
              <div key={bucket.label} className="text-center text-xs text-opsfog/60">
                <div
                  className="mx-auto w-full rounded-full bg-opssignal/70"
                  style={{ height: `${Math.min(bucket.count, 40) + 10}px` }}
                />
                <p className="mt-2">{bucket.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card p-6">
          <p className="admin-kicker-muted">
            Sentiment Mix
          </p>
          <div className="mt-4 space-y-3 text-sm text-opsfog/70">
            <div className="flex items-center justify-between">
              <span>Positive</span>
              <span>{sentiment.positive}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Neutral</span>
              <span>{sentiment.neutral}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Negative</span>
              <span>{sentiment.negative}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card p-6">
        <p className="admin-kicker-muted">
          Query Volume (last 5d)
        </p>
        <div className="mt-4 grid grid-cols-5 items-end gap-2">
          {dailyVolume.map((bucket) => (
            <div key={bucket.label} className="text-center text-xs text-opsfog/60">
              <div
                className="mx-auto w-full rounded-full bg-opssignal/60"
                style={{ height: `${Math.min(bucket.count, 40) + 10}px` }}
              />
              <p className="mt-2">{bucket.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-card p-6">
          <p className="admin-kicker-muted">
            Most Viewed FAQs
          </p>
          <div className="mt-4 space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="admin-card-inset p-4 text-sm text-opsfog"
              >
                <p>{faq.question}</p>
                <p className="mt-2 text-xs text-opsfog/60">
                  Views: {faq.view_count ?? 0}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card p-6">
          <p className="admin-kicker-muted">
            Top Topics
          </p>
          <div className="mt-4 space-y-3">
            {topicCounts.map((topic) => (
              <div
                key={topic.name}
                className="admin-card-inset p-4 text-sm text-opsfog"
              >
                <p>{topic.name}</p>
                <p className="mt-2 text-xs text-opsfog/60">
                  Mentions: {topic.count}
                </p>
              </div>
            ))}
            {topicCounts.length === 0 && (
              <p className="text-sm text-opsfog/60">No topic data yet.</p>
            )}
          </div>
        </div>

        <div className="admin-card p-6">
          <p className="admin-kicker-muted">
            Log Engagement Event
          </p>
          <input
            className="mt-4 admin-input"
            onChange={(event) => setEventType(event.target.value)}
            placeholder="Event type"
            type="text"
            value={eventType}
          />
          <input
            className="mt-3 admin-input"
            onChange={(event) => setEventId(event.target.value)}
            placeholder="Event ID"
            type="text"
            value={eventId}
          />
          <textarea
            className="mt-3 admin-textarea h-24"
            onChange={(event) => setEventMeta(event.target.value)}
            value={eventMeta}
          />
          <button
            className="mt-4 w-full admin-button-primary"
            onClick={handleLogEvent}
            type="button"
          >
            Log event
          </button>
          {status && <p className="mt-3 text-xs text-opsfog/60">{status}</p>}
        </div>
      </div>

      <div className="admin-card p-6">
        <p className="admin-kicker-muted">
          Recent Engagement Events
        </p>
        <div className="mt-4 space-y-3">
          {engagementEvents.map((event) => (
            <div
              key={event.id}
              className="admin-card-inset p-4 text-sm text-opsfog"
            >
              <p>{event.event_type}</p>
              <p className="mt-2 text-xs text-opsfog/60">{event.created_at}</p>
            </div>
          ))}
          {engagementEvents.length === 0 && (
            <p className="text-sm text-opsfog/60">No engagement events yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
