"use client";

import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { useSupabaseUser } from "./useSupabaseUser";

interface AdminHeaderProps {
  onToggleNav?: () => void;
  isNavOpen?: boolean;
}

export default function AdminHeader({
  onToggleNav,
  isNavOpen = false,
}: AdminHeaderProps) {
  const { user, hasSupabase } = useSupabaseUser();

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <header className="border-b border-opsfog/10 bg-opspanel/90 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-6 py-4 lg:pl-80">
        <div className="flex flex-wrap items-center justify-between gap-4 lg:justify-end">
          <div className="flex items-center gap-4">
            {onToggleNav && (
              <button
                className="admin-button-secondary px-3 py-2 text-[11px] lg:hidden"
                onClick={onToggleNav}
                type="button"
                aria-controls="admin-sidebar"
                aria-expanded={isNavOpen}
              >
                {isNavOpen ? "Close" : "Menu"}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-opsfog/70">
            {user ? (
              <>
                <span className="admin-pill">
                  {user.email ?? "Signed in"}
                </span>
                <button
                  className="admin-button-muted px-3 py-2 text-[11px]"
                  onClick={handleSignOut}
                  type="button"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                className="admin-button-secondary px-3 py-2 text-[11px]"
                href="/login"
              >
                Sign in
              </Link>
            )}
            {!hasSupabase && (
              <span className="text-xs text-opsred">Supabase missing</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
