"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useActiveEvent } from "../../../fan/_components/useActiveEvent";
import { useSupabaseUser } from "../../../fan/_components/useSupabaseUser";

interface Survey {
  id: string;
  title: string;
}

interface Question {
  id: string;
  question: string;
  question_type: string;
  options: string[];
}

export default function FeedbackPage() {
  const { user } = useSupabaseUser();
  const { activeEventId } = useActiveEvent();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [overallRating, setOverallRating] = useState(5);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadSurvey = async () => {
      if (!supabase) return;
      const surveyQuery = supabase
        .from("feedback_surveys")
        .select("id, title")
        .eq("status", "live")
        .order("created_at", { ascending: false })
        .limit(1);
      if (activeEventId) {
        surveyQuery.eq("event_id", activeEventId);
      }
      const { data: surveyData } = await surveyQuery.maybeSingle();

      if (surveyData) {
        setSurvey(surveyData);
        const { data: questionData } = await supabase
          .from("feedback_questions")
          .select("id, question, question_type, options")
          .eq("survey_id", surveyData.id)
          .order("sort_order", { ascending: true });
        setQuestions(
          (questionData ?? []).map((item) => ({
            ...item,
            options: Array.isArray(item.options) ? item.options : [],
          }))
        );
      }
    };

    loadSurvey();
  }, [activeEventId]);

  const handleSubmit = async () => {
    if (!user) {
      setStatus("Sign in to submit feedback.");
      return;
    }
    if (!supabase || !survey) return;

    const { data: response, error } = await supabase
      .from("feedback_responses")
      .insert({
        survey_id: survey.id,
        user_id: user.id,
        overall_rating: overallRating,
      })
      .select("id")
      .single();

    if (error || !response) {
      setStatus(error?.message ?? "Unable to submit feedback.");
      return;
    }

    const answerRows = questions.map((question) => {
      const value = answers[question.id] ?? "";
      return {
        response_id: response.id,
        question_id: question.id,
        answer_text: question.question_type === "text" ? value : null,
        answer_number:
          question.question_type === "rating" ? Number(value) || null : null,
        answer_json:
          question.question_type === "choice" ? { choice: value } : {},
      };
    });

    const { error: answerError } = await supabase
      .from("feedback_answers")
      .insert(answerRows);

    setStatus(answerError ? answerError.message : "Feedback submitted.");
    if (!answerError) {
      setAnswers({});
    }
  };

  const questionBlocks = useMemo(() => {
    return questions.map((question) => {
      if (question.question_type === "choice") {
        return (
          <select
            key={question.id}
            className="w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
            onChange={(event) =>
              setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
            }
            value={answers[question.id] ?? ""}
          >
            <option value="">Select an option</option>
            {question.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      }

      if (question.question_type === "rating") {
        return (
          <input
            key={question.id}
            className="w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
            max={10}
            min={1}
            onChange={(event) =>
              setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
            }
            placeholder="Rating 1-10"
            type="number"
            value={answers[question.id] ?? ""}
          />
        );
      }

      return (
        <textarea
          key={question.id}
          className="h-24 w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
          onChange={(event) =>
            setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
          }
          placeholder={question.question}
          value={answers[question.id] ?? ""}
        />
      );
    });
  }, [questions, answers]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Fan Feedback
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Share your experience
        </h1>
      </div>

      <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
        <p className="text-sm text-ice/70">
          {survey?.title ?? "No live survey available."}
        </p>
        {survey && (
          <>
            <div className="mt-4">
              <label className="text-xs uppercase tracking-[0.3em] text-ice/50">
                Overall rating
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
                max={5}
                min={1}
                onChange={(event) => setOverallRating(Number(event.target.value))}
                type="number"
                value={overallRating}
              />
            </div>
            <div className="mt-4 space-y-3">{questionBlocks}</div>
            <button
              className="mt-4 w-full rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
              onClick={handleSubmit}
              type="button"
            >
              Submit feedback
            </button>
          </>
        )}
        {status && <p className="mt-3 text-xs text-ice/60">{status}</p>}
      </div>
    </div>
  );
}
