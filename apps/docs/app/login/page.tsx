"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState("Use your ops email to sign in.");

  const handleSendOtp = async () => {
    if (!supabase) {
      setStatus("Supabase is not configured yet.");
      return;
    }
    if (!email) {
      setStatus("Enter your email.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setStatus(error.message);
      return;
    }
    setOtpSent(true);
    setStatus("OTP sent. Check your inbox for the code.");
  };

  const handleVerifyOtp = async () => {
    if (!supabase) {
      setStatus("Supabase is not configured yet.");
      return;
    }
    if (!email) {
      setStatus("Enter your email.");
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
    setStatus(error ? error.message : "Signed in. Redirecting...");
    if (!error) {
      setOtp("");
      setOtpSent(false);
    }
  };

  return (
    <div className="min-h-screen bg-opsink text-opsfog">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center px-6">
        <div className="grid w-full gap-10 admin-card p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="admin-kicker">Admin Access</p>
            <h1 className="mt-4 admin-title-lg">F1 Ops Sign In</h1>
            <p className="mt-3 admin-description">
              Secure access for organizers, security, and live ops teams.
            </p>
            <div className="mt-6 space-y-2 text-xs font-semibold uppercase tracking-[0.22em] text-opsfog/50">
              <p>Role-based permissions</p>
              <p>Audit logs and session tracking</p>
              <p>SSO ready via Supabase Auth</p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              className="admin-input"
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
                className="admin-input"
                onChange={(event) => setOtp(event.target.value)}
                placeholder="OTP code"
                type="text"
                value={otp}
              />
            ) : null}
            {otpSent ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  className="w-full admin-button-primary"
                  onClick={handleVerifyOtp}
                  type="button"
                >
                  Verify OTP
                </button>
                <button
                  className="w-full admin-button-secondary"
                  onClick={handleSendOtp}
                  type="button"
                >
                  Resend OTP
                </button>
              </div>
            ) : (
              <button
                className="w-full admin-button-primary"
                onClick={handleSendOtp}
                type="button"
              >
                Send OTP
              </button>
            )}
            <p className="text-xs text-opsfog/60">{status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
