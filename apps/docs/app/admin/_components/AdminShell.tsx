"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const [navOpen, setNavOpen] = useState(false);

  const handleToggleNav = () => {
    setNavOpen((prev) => !prev);
  };

  const handleCloseNav = () => {
    setNavOpen(false);
  };

  return (
    <>
      <AdminHeader onToggleNav={handleToggleNav} isNavOpen={navOpen} />
      {navOpen && (
        <button
          className="fixed inset-0 z-20 bg-opsfog/20 backdrop-blur-sm lg:hidden"
          onClick={handleCloseNav}
          type="button"
          aria-label="Close navigation"
        />
      )}
      <div className="relative">
        <AdminSidebar isOpen={navOpen} onClose={handleCloseNav} />
        <div className="mx-auto w-full max-w-7xl px-6 pb-12 pt-6 lg:pl-80">
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </>
  );
}
