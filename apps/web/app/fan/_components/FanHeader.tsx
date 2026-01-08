"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useSupabaseUser } from "./useSupabaseUser";

export default function FanHeader() {
  const { user, hasSupabase } = useSupabaseUser();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSendOtp = async () => {
    if (!supabase) {
      setStatus("Supabase is not configured.");
      return;
    }
    if (!email) {
      setStatus("Enter an email.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setStatus(error.message);
      return;
    }
    setOtpSent(true);
    setStatus("OTP sent. Check your email for the code.");
  };

  const handleVerifyOtp = async () => {
    if (!supabase) {
      setStatus("Supabase is not configured.");
      return;
    }
    if (!email) {
      setStatus("Enter an email.");
      return;
    }
    if (!otp) {
      setStatus("Enter the OTP code.");
      return;
    }
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("");
    setOtp("");
    setOtpSent(false);
    setIsModalOpen(false);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      setStatus(error.message);
      return;
    }
    setIsModalOpen(false);
    setStatus("");
    setOtp("");
    setOtpSent(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setStatus("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setStatus("");
    setOtp("");
    setOtpSent(false);
  };

  return (
    <header className="border-b border-ice/10 bg-ink/80">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-ice/70">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ice/20 bg-carbon/70 font-heading text-lg text-ice">
              F1
            </span>
            <span className="font-heading text-xl">Spanish Grand Prix 2026</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-ice/70">
            {user ? (
              <button
                aria-label="Open profile"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ice/20 bg-carbon/70 text-ice/80 transition hover:border-redline/60 hover:text-ice"
                onClick={handleOpenModal}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="18"
                  viewBox="0 0 24 24"
                  width="18"
                >
                  <path
                    d="M12 13.5c3.175 0 5.75-2.35 5.75-5.25S15.175 3 12 3 6.25 5.35 6.25 8.25 8.825 13.5 12 13.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 21c1.9-3.35 5.1-5 8-5s6.1 1.65 8 5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            ) : (
              <button
                className="group relative overflow-hidden rounded-full border border-redline/50 bg-redline/10 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-redline transition hover:bg-redline/20"
                onClick={handleOpenModal}
                type="button"
              >
                <span className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:250%_250%] bg-[position:200%_0] transition-all duration-700 group-hover:bg-[position:-100%_0]" />
                <span className="relative">Sign In</span>
              </button>
            )}
            {!hasSupabase && (
              <span className="relative overflow-hidden bg-ink px-3 py-1.5 font-mono text-[10px] text-redline clip-angle">
                <span className="absolute inset-0 animate-pulse bg-redline/10" />
                <span className="relative">⚠ SUPABASE_MISSING</span>
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ice/70">
          <Link
            className="flex items-center gap-2 rounded-xl border border-ice/15 bg-carbon/60 px-3 py-2 transition hover:border-redline/60 hover:text-ice"
            href="/fan/emergency"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-redline" />
            Emergency Help
          </Link>
          <Link
            className="flex items-center gap-2 rounded-xl border border-ice/15 bg-carbon/60 px-3 py-2 transition hover:border-redline/60 hover:text-ice"
            href="/fan/transport-updates"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-redline" />
            Transport
          </Link>
          <Link
            className="flex items-center gap-2 rounded-xl border border-ice/15 bg-carbon/60 px-3 py-2 transition hover:border-redline/60 hover:text-ice"
            href="/fan/wayfinding"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-redline" />
            Wayfinding
          </Link>
        </div>
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4 backdrop-blur"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-ice/10 bg-carbon/90 p-6 text-ice shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            {user ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
                      Account
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-ice">
                      Profile
                    </h2>
                    <p className="mt-2 text-sm text-ice/60">
                      Manage your session details.
                    </p>
                  </div>
                  <button
                    className="rounded-full border border-ice/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-ice/70"
                    onClick={handleCloseModal}
                    type="button"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-ice/10 bg-ink/70 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-ice/50">
                    Signed in
                  </p>
                  <p className="mt-2 font-mono text-sm text-ice/90">
                    {user.email ?? "SIGNED_IN"}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    className="rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
                    onClick={handleSignOut}
                    type="button"
                  >
                    Sign Out
                  </button>
                  <button
                    className="rounded-full border border-ice/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice/70"
                    onClick={handleCloseModal}
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
                      Fan Sign In
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-ice">
                      Verify with OTP
                    </h2>
                    <p className="mt-2 text-sm text-ice/60">
                      Enter your email to receive a one-time code.
                    </p>
                  </div>
                  <button
                    className="rounded-full border border-ice/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-ice/70"
                    onClick={handleCloseModal}
                    type="button"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  <input
                    className="w-full rounded-2xl border border-ice/20 bg-ink/70 px-4 py-3 text-sm text-ice"
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (otpSent) {
                        setOtpSent(false);
                        setOtp("");
                      }
                    }}
                    placeholder="Email"
                    type="email"
                    value={email}
                  />
                  {otpSent ? (
                    <input
                      className="w-full rounded-2xl border border-ice/20 bg-ink/70 px-4 py-3 text-sm text-ice"
                      onChange={(event) => setOtp(event.target.value)}
                      placeholder="OTP code"
                      type="text"
                      value={otp}
                    />
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {otpSent ? (
                    <>
                      <button
                        className="rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
                        onClick={handleVerifyOtp}
                        type="button"
                      >
                        Verify OTP
                      </button>
                      <button
                        className="rounded-full border border-ice/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice/70"
                        onClick={handleSendOtp}
                        type="button"
                      >
                        Resend
                      </button>
                    </>
                  ) : (
                    <button
                      className="rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
                      onClick={handleSendOtp}
                      type="button"
                    >
                      Send OTP
                    </button>
                  )}
                  <button
                    className="rounded-full border border-ice/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice/70"
                    onClick={handleCloseModal}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {status && <p className="mt-4 text-xs text-ice/60">{status}</p>}
          </div>
        </div>
      )}
      <style jsx>{`
        .clip-hexagon {
          clip-path: polygon(10px 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0% 50%);
        }
        .clip-angle {
          clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
        }
      `}</style>
    </header>
  );
}
