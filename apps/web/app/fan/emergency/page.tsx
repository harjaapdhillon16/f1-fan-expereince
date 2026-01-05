"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useActiveEvent } from "../_components/useActiveEvent";
import { useSupabaseUser } from "../_components/useSupabaseUser";

interface EmergencyRequest {
  id: string;
  request_type: string;
  message: string | null;
  status: string;
}

export default function EmergencyPage() {
  const { user } = useSupabaseUser();
  const { activeEventId } = useActiveEvent();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [type, setType] = useState("medical");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!supabase || !user) return;
      const { data } = await supabase
        .from("emergency_requests")
        .select("id, request_type, message, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setRequests(data ?? []);
    };

    load();
  }, [user]);

  const handleSubmit = async () => {
    if (!user) {
      setStatus("Sign in to request help.");
      return;
    }
    if (!supabase) return;
    const { data, error } = await supabase
      .from("emergency_requests")
      .insert({
        user_id: user.id,
        event_id: activeEventId,
        request_type: type,
        message,
      })
      .select("id, request_type, message, status")
      .single();

    if (error) {
      setStatus(error.message);
      return;
    }
    if (data) {
      setRequests((prev) => [data, ...prev]);
      setMessage("");
      setStatus("Request sent.");
    }
  };

  const handleCancel = async (id: string) => {
    if (!supabase) return;
    await supabase.from("emergency_requests").delete().eq("id", id);
    setRequests((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Emergency Help
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Request assistance
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
          <select
            className="w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
            onChange={(event) => setType(event.target.value)}
            value={type}
          >
            <option value="medical">Medical</option>
            <option value="security">Security</option>
            <option value="lost">Lost and Found</option>
            <option value="other">Other</option>
          </select>
          <textarea
            className="mt-3 h-28 w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Describe the situation"
            value={message}
          />
          <button
            className="mt-4 w-full rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
            onClick={handleSubmit}
            type="button"
          >
            Send request
          </button>
          {status && <p className="mt-3 text-xs text-ice/60">{status}</p>}
        </div>

        <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
            Recent requests
          </p>
          <div className="mt-4 space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-ice/10 bg-ink/70 p-4 text-sm text-ice/80"
              >
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-[0.2em] text-ice/60">
                    {request.request_type}
                  </span>
                  <span className="text-xs text-ice/60">{request.status}</span>
                </div>
                <p className="mt-2 text-xs text-ice/60">{request.message}</p>
                <button
                  className="mt-3 rounded-full border border-ice/30 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-ice/70"
                  onClick={() => handleCancel(request.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
            {requests.length === 0 && (
              <p className="text-sm text-ice/60">No requests yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
