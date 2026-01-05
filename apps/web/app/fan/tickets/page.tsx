"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useSupabaseUser } from "../_components/useSupabaseUser";

interface TicketRecord {
  id: string;
  seat: string | null;
  status: string;
  qr_payload: string | null;
  wallet_pass_url: string | null;
}

export default function TicketsPage() {
  const { user } = useSupabaseUser();
  const [tickets, setTickets] = useState<TicketRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!supabase || !user) return;
      const { data } = await supabase
        .from("tickets")
        .select("id, seat, status, qr_payload, wallet_pass_url")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });
      setTickets(data ?? []);
    };

    load();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Ticket Retrieval
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Your tickets and QR codes
        </h1>
      </div>

      {!user && (
        <p className="text-sm text-ice/60">
          Sign in to view your tickets and wallet passes.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-3xl border border-ice/15 bg-carbon/70 p-6"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
              Seat {ticket.seat ?? "General"}
            </p>
            <p className="mt-2 text-sm text-ice/70">Status: {ticket.status}</p>
            <div className="mt-4 rounded-2xl border border-ice/10 bg-ink/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
                QR Payload
              </p>
              <p className="mt-2 break-all text-xs text-ice/60">
                {ticket.qr_payload ?? "No QR assigned"}
              </p>
            </div>
            {ticket.wallet_pass_url && (
              <a
                className="mt-4 inline-block rounded-full border border-redline/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-redline"
                href={ticket.wallet_pass_url}
              >
                Open Wallet Pass
              </a>
            )}
          </div>
        ))}
        {user && tickets.length === 0 && (
          <p className="text-sm text-ice/60">No tickets linked yet.</p>
        )}
      </div>
    </div>
  );
}
