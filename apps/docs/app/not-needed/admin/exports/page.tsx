"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

interface FeedbackResponse {
  id: string;
  survey_id: string;
  user_id: string | null;
  overall_rating: number | null;
  created_at: string;
}

interface FeedbackAnswer {
  id: string;
  response_id: string;
  question_id: string;
  answer_text: string | null;
  answer_number: number | null;
}

function toCsv<T extends Record<string, any>>(rows: T[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return "";
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    lines.push(values.join(","));
  });
  return lines.join("\n");
}

export default function ExportsPage() {
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [answers, setAnswers] = useState<FeedbackAnswer[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const { data: responseData } = await supabase
        .from("feedback_responses")
        .select("id, survey_id, user_id, overall_rating, created_at")
        .order("created_at", { ascending: false });
      setResponses(responseData ?? []);

      const { data: answerData } = await supabase
        .from("feedback_answers")
        .select("id, response_id, question_id, answer_text, answer_number");
      setAnswers(answerData ?? []);
    };

    load();
  }, []);

  const downloadCsv = (filename: string, csv: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="admin-kicker">
          Exportable CSVs
        </p>
        <h1 className="mt-3 admin-title">
          Download survey data
        </h1>
      </div>

      <div className="admin-card p-6">
        <div className="flex flex-wrap gap-4">
          <button
            className="admin-button-primary"
            onClick={() => downloadCsv("feedback-responses.csv", toCsv(responses))}
            type="button"
          >
            Export responses
          </button>
          <button
            className="admin-button-secondary"
            onClick={() => downloadCsv("feedback-answers.csv", toCsv(answers))}
            type="button"
          >
            Export answers
          </button>
        </div>
        <p className="mt-4 admin-description">
          Responses loaded: {responses.length} | Answers loaded: {answers.length}
        </p>
      </div>
    </div>
  );
}
