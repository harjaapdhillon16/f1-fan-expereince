import type { ReactNode } from "react";
import FanBottomNav from "./_components/FanBottomNav";
import FanHeader from "./_components/FanHeader";

export default function FanLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fan-theme relative min-h-screen overflow-hidden bg-ink text-ice">
      <div className="pointer-events-none absolute inset-0 bg-hero-gradient opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-checker opacity-20" />
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-72 w-72 rounded-full bg-redline/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-[-20%] h-96 w-96 rounded-full bg-flare/20 blur-[140px]" />
      <div className="relative z-10">
        <FanHeader />
        <main className="mx-auto max-w-6xl px-6 pb-28 pt-10">{children}</main>
        <FanBottomNav />
      </div>
    </div>
  );
}
