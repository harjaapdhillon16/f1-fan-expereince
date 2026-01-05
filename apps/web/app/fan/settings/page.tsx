import Link from "next/link";
import { settingsSections } from "../_components/fanNavigation";

export default function FanSettingsPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Settings
        </p>
        <h1 className="text-3xl font-semibold uppercase tracking-[0.1em] text-ice">
          All fan tools
        </h1>
        <p className="max-w-2xl text-sm text-ice/60">
          Jump to any module that is not pinned in the bottom bar.
        </p>
      </div>

      {settingsSections.map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="text-xl font-semibold uppercase tracking-[0.1em] text-ice/80">
            {section.title}
          </h2>
          <div className="space-y-3">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-3xl border border-ice/15 bg-carbon/70 p-4 transition hover:border-redline/60"
              >
                <div>
                  <p className="text-base font-semibold text-ice">{item.label}</p>
                  {item.description && (
                    <p className="mt-1 text-sm text-ice/60">
                      {item.description}
                    </p>
                  )}
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ice/50">
                  Open
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
