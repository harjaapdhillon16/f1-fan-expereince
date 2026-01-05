"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

interface Survey {
  id: string;
  title: string;
  status: string;
}

interface Question {
  id: string;
  question: string;
  question_type: string;
}

export default function FeedbackSurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyStatus, setSurveyStatus] = useState("draft");
  const [surveyEventId, setSurveyEventId] = useState("");
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("text");
  const [questionOptions, setQuestionOptions] = useState("[]");
  const [questionSort, setQuestionSort] = useState(0);
  const [status, setStatus] = useState("");

  const loadSurveys = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("feedback_surveys")
      .select("id, title, status")
      .order("created_at", { ascending: false });
    setSurveys(data ?? []);
  };

  const loadQuestions = async (surveyId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from("feedback_questions")
      .select("id, question, question_type")
      .eq("survey_id", surveyId)
      .order("sort_order", { ascending: true });
    setQuestions(data ?? []);
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  useEffect(() => {
    if (selectedSurveyId) {
      loadQuestions(selectedSurveyId);
    } else {
      setQuestions([]);
    }
  }, [selectedSurveyId]);

  const handleCreateSurvey = async () => {
    if (!supabase) return;
    const { error } = await supabase.from("feedback_surveys").insert({
      event_id: surveyEventId || null,
      title: surveyTitle,
      status: surveyStatus,
    });
    setStatus(error ? error.message : "Survey created.");
    setSurveyTitle("");
    loadSurveys();
  };

  const handleCreateQuestion = async () => {
    if (!supabase || !selectedSurveyId) return;
    try {
      const options = JSON.parse(questionOptions || "[]");
      const { error } = await supabase.from("feedback_questions").insert({
        survey_id: selectedSurveyId,
        question: questionText,
        question_type: questionType,
        options,
        sort_order: questionSort,
      });
      setStatus(error ? error.message : "Question added.");
      setQuestionText("");
      loadQuestions(selectedSurveyId);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid options JSON");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="admin-kicker">
          Feedback Surveys
        </p>
        <h1 className="mt-3 admin-title">
          Build post-race surveys
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-card p-6">
          <p className="admin-kicker-muted">
            Create Survey
          </p>
          <input
            className="mt-4 admin-input"
            onChange={(event) => setSurveyTitle(event.target.value)}
            placeholder="Survey title"
            type="text"
            value={surveyTitle}
          />
          <input
            className="mt-3 admin-input"
            onChange={(event) => setSurveyEventId(event.target.value)}
            placeholder="Event ID"
            type="text"
            value={surveyEventId}
          />
          <select
            className="mt-3 admin-select"
            onChange={(event) => setSurveyStatus(event.target.value)}
            value={surveyStatus}
          >
            <option value="draft">Draft</option>
            <option value="live">Live</option>
            <option value="closed">Closed</option>
          </select>
          <button
            className="mt-4 w-full admin-button-primary"
            onClick={handleCreateSurvey}
            type="button"
          >
            Create survey
          </button>
        </div>

        <div className="admin-card p-6">
          <p className="admin-kicker-muted">
            Active Surveys
          </p>
          <div className="mt-4 space-y-3">
            {surveys.map((survey) => (
              <button
                key={survey.id}
                className={`w-full admin-card-inset px-4 py-3 text-left text-sm transition ${
                  selectedSurveyId === survey.id
                    ? "border-opssignal/50 bg-opssignal/10 text-opsfog"
                    : "hover:border-opsfog/30"
                }`}
                onClick={() => setSelectedSurveyId(survey.id)}
                type="button"
              >
                <p className="text-opsfog">{survey.title}</p>
                <p className="mt-2 text-xs text-opsfog/60">{survey.status}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-card p-6">
          <p className="admin-kicker-muted">
            Add Questions
          </p>
          <input
            className="mt-4 admin-input"
            onChange={(event) => setQuestionText(event.target.value)}
            placeholder="Question"
            type="text"
            value={questionText}
          />
          <select
            className="mt-3 admin-select"
            onChange={(event) => setQuestionType(event.target.value)}
            value={questionType}
          >
            <option value="text">Text</option>
            <option value="rating">Rating</option>
            <option value="choice">Choice</option>
          </select>
          <input
            className="mt-3 admin-input"
            onChange={(event) => setQuestionSort(Number(event.target.value))}
            placeholder="Sort order"
            type="number"
            value={questionSort}
          />
          <textarea
            className="mt-3 admin-textarea h-20"
            onChange={(event) => setQuestionOptions(event.target.value)}
            placeholder='Options JSON (e.g. ["Good","Bad"])'
            value={questionOptions}
          />
          <button
            className="mt-4 w-full admin-button-primary"
            onClick={handleCreateQuestion}
            type="button"
          >
            Add question
          </button>
        </div>

        <div className="admin-card p-6">
          <p className="admin-kicker-muted">
            Survey Questions
          </p>
          <div className="mt-4 space-y-3">
            {questions.map((question) => (
              <div
                key={question.id}
                className="admin-card-inset p-4 text-sm text-opsfog"
              >
                <p>{question.question}</p>
                <p className="mt-2 text-xs text-opsfog/60">
                  Type: {question.question_type}
                </p>
              </div>
            ))}
            {questions.length === 0 && (
              <p className="text-sm text-opsfog/60">No questions yet.</p>
            )}
          </div>
        </div>
      </div>
      {status && <p className="text-xs text-opsfog/60">{status}</p>}
    </div>
  );
}
