"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useActiveEvent } from "../_components/useActiveEvent";
import { useSupabaseUser } from "../_components/useSupabaseUser";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category_id: string | null;
  language: string | null;
  view_count: number | null;
}

interface Category {
  id: string;
  name: string;
}

export default function FaqPage() {
  const { user } = useSupabaseUser();
  const { activeEventId } = useActiveEvent();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState("");
  const [viewed, setViewed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const faqQuery = supabase
        .from("faqs")
        .select("id, question, answer, category_id, language, view_count")
        .order("priority", { ascending: false })
        .limit(200);
      if (activeEventId) {
        faqQuery.eq("event_id", activeEventId);
      }
      const { data: faqData } = await faqQuery;
      setFaqs(faqData ?? []);

      const categoryQuery = supabase
        .from("faq_categories")
        .select("id, name")
        .order("sort_order", { ascending: true });
      if (activeEventId) {
        categoryQuery.eq("event_id", activeEventId);
      }
      const { data: categoryData } = await categoryQuery;
      setCategories(categoryData ?? []);
    };

    load();
  }, [activeEventId]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesFilter = filter === "all" || faq.category_id === filter;
      const matchesSearch = faq.question
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [faqs, filter, search]);

  const handleToggle = async (faq: FaqItem) => {
    const next = openId === faq.id ? null : faq.id;
    setOpenId(next);

    if (!supabase || viewed[faq.id]) return;
    setViewed((prev) => ({ ...prev, [faq.id]: true }));
    const nextCount = (faq.view_count ?? 0) + 1;
    await supabase.from("faqs").update({ view_count: nextCount }).eq("id", faq.id);
  };

  const handleAsk = async () => {
    if (!user) {
      setStatus("Sign in to ask a question.");
      return;
    }
    if (!supabase) {
      setStatus("Supabase is not configured.");
      return;
    }
    if (!question.trim()) {
      setStatus("Enter a question.");
      return;
    }
    const { data: thread, error: threadError } = await supabase
      .from("chat_threads")
      .insert({ event_id: activeEventId, user_id: user.id, is_anonymous: false })
      .select("id")
      .single();

    if (threadError || !thread) {
      setStatus(threadError?.message ?? "Unable to create thread.");
      return;
    }

    const { error: messageError } = await supabase
      .from("chat_messages")
      .insert({ thread_id: thread.id, role: "user", message: question });

    setStatus(messageError ? messageError.message : "Question sent.");
    if (!messageError) setQuestion("");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Dynamic FAQ
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Find answers instantly
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              className="w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-2 text-sm text-ice"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search FAQ"
              type="text"
              value={search}
            />
            <select
              className="w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-2 text-sm text-ice"
              onChange={(event) => setFilter(event.target.value)}
              value={filter}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-3">
            {filteredFaqs.map((faq) => (
              <button
                key={faq.id}
                className="w-full rounded-2xl border border-ice/10 bg-ink/70 p-4 text-left"
                onClick={() => handleToggle(faq)}
                type="button"
              >
                <div className="flex items-center justify-between text-sm text-ice/80">
                  <span>{faq.question}</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-ice/50">
                    {faq.view_count ?? 0} views
                  </span>
                </div>
                {openId === faq.id && (
                  <p className="mt-3 text-sm text-ice/60">{faq.answer}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
            Ask the assistant
          </p>
          <textarea
            className="mt-4 h-32 w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Type your question"
            value={question}
          />
          <button
            className="mt-4 w-full rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
            onClick={handleAsk}
            type="button"
          >
            Send question
          </button>
          {status && <p className="mt-3 text-xs text-ice/60">{status}</p>}
        </div>
      </div>
    </div>
  );
}
