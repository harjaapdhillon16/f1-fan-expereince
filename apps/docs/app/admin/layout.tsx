import type { ReactNode } from "react";
import AdminShell from "./_components/AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-opsink text-opsfog">
      <div className="pointer-events-none absolute inset-0 bg-ops-gradient opacity-55" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-80 w-80 rounded-full bg-opssignal/15 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-[-20%] h-96 w-96 rounded-full bg-opsred/12 blur-[160px]" />
      <div className="relative z-10">
        <AdminShell>{children}</AdminShell>
      </div>
    </div>
  );
}
