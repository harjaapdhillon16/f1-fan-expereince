// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavItems } from "./fanNavigation";

export default function FanBottomNav() {
  const pathname = usePathname();
  const iconMap = {
    clock: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    ),
    map: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s6-5.4 6-10a6 6 0 0 0-12 0c0 4.6 6 10 6 10Z" />
        <circle cx="12" cy="11" r="2.2" />
      </svg>
    ),
    chat: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 4v-4H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
        <path d="M8 10h8" />
        <path d="M8 13h5" />
      </svg>
    ),
    bell: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 17h12c-1.2-1.2-2-2.6-2-6a4 4 0 1 0-8 0c0 3.4-.8 4.8-2 6Z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
    ),
    settings: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        <path d="M19.4 12a7.4 7.4 0 0 0-.1-1l2-1.6-1.7-3-2.5.7a7.8 7.8 0 0 0-1.7-1l-.3-2.6h-3.4l-.3 2.6a7.8 7.8 0 0 0-1.7 1l-2.5-.7-1.7 3 2 1.6a7.4 7.4 0 0 0 0 2l-2 1.6 1.7 3 2.5-.7a7.8 7.8 0 0 0 1.7 1l.3 2.6h3.4l.3-2.6a7.8 7.8 0 0 0 1.7-1l2.5.7 1.7-3-2-1.6c.1-.4.1-.7.1-1Z" />
      </svg>
    ),
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-ice/10 bg-carbon/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6">
        {primaryNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 px-2 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] transition ${
                isActive ? "text-ice" : "text-ice/50 hover:text-ice/80"
              }`}
            >
              <span
                className={`h-1 w-6 rounded-full transition ${
                  isActive ? "bg-redline" : "bg-ice/15"
                }`}
              />
              <span className={isActive ? "text-ice" : "text-ice/70"}>
                {item.icon ? iconMap[item.icon] : null}
              </span>
              <span>{item.shortLabel ?? item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
