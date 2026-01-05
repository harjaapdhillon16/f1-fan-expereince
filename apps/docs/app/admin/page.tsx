import Link from "next/link";
import { adminOverviewSections } from "./_components/adminNavigation";

export default function AdminOverview() {
  return (
    <div className="space-y-10">
      <div>
        <p className="admin-kicker">
          F1 Admin Ops
        </p>
        <h1 className="mt-3 admin-title-lg">
          Operations Command Center
        </h1>
        <p className="mt-2 max-w-2xl admin-description">
          Flows for live race weekend operations.
        </p>
      </div>

      {adminOverviewSections.map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="admin-section-title">
            {section.title}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="admin-card p-5 transition hover:border-opssignal/50"
              >
                <p className="text-lg font-semibold text-opsfog">{item.label}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
