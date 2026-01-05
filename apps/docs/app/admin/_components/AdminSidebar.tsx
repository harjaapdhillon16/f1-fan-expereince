"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavSections } from "./adminNavigation";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      id="admin-sidebar"
      className={`fixed inset-y-0 left-0 z-30 w-[85vw] max-w-[320px] transform border-r border-opsfog/10 bg-opspanel/95 backdrop-blur-xl transition-transform duration-300 ease-out lg:fixed lg:inset-y-0 lg:left-0 lg:top-0 lg:z-30 lg:w-72 lg:max-w-none lg:translate-x-0 lg:rounded-none lg:border-r lg:border-opsfog/10 lg:bg-opspanel/95 lg:shadow-[0_22px_40px_rgba(10,10,10,0.12)] lg:before:absolute lg:before:content-[''] lg:before:inset-y-8 lg:before:left-0 lg:before:w-px lg:before:bg-gradient-to-b lg:before:from-transparent lg:before:via-opssignal/40 lg:before:to-transparent ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-opsfog/10 px-5 py-5 lg:px-6 lg:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-opsfog/20 bg-opspanel/90 font-heading text-lg text-opsfog">
                F1
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-opsfog/60">
                  Race Ops
                </p>
                <p className="text-sm font-semibold text-opsfog">
                  Admin Console
                </p>
              </div>
            </div>
            <button
              className="admin-button-secondary px-3 py-2 text-[11px] lg:hidden"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6 lg:px-6">
          {adminNavSections.map((section) => (
            <div
              key={section.title}
              className="space-y-3 border-t border-opsfog/10 pt-5 first:border-t-0 first:pt-0"
            >
              <p className="admin-kicker-muted">{section.title}</p>
              <div className="grid gap-2">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center justify-between rounded-lg border px-4 py-2 text-sm font-medium transition before:absolute before:left-3 before:top-1/2 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full before:bg-opssignal before:opacity-0 before:transition before:content-[''] ${
                        isActive
                          ? "border-opssignal/30 bg-opsink/70 text-opsfog before:opacity-100"
                          : "border-transparent text-opsfog/70 hover:border-opsfog/20 hover:bg-opspanel/70 hover:text-opsfog hover:before:opacity-60"
                      }`}
                      onClick={onClose}
                    >
                      <span className="pl-3">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
