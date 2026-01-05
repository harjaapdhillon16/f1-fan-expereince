export interface AdminNavItem {
  href: string;
  label: string;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const adminNavSections: AdminNavSection[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Overview" }],
  },
  {
    title: "Live Operations",
    items: [
      { href: "/admin/live-questions", label: "Live Questions" },
      { href: "/admin/alerts", label: "Alerts" },
      { href: "/admin/transport-updates", label: "Transport Updates" },
      { href: "/admin/emergency-requests", label: "Emergency Requests" },
    ],
  },
  {
    title: "Communication",
    items: [
      { href: "/admin/announcements", label: "Announcements" },
      { href: "/admin/alert-templates", label: "Alert Templates" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/faqs", label: "FAQs" },
      { href: "/admin/map-layers", label: "Map Layers" },
      { href: "/admin/map-points", label: "Map Points" },
    ],
  },
  {
    title: "Admin Settings",
    items: [
      { href: "/admin/events", label: "Events" },
      { href: "/admin/sessions", label: "Sessions" },
      { href: "/admin/ticket-types", label: "Ticket Types" },
      { href: "/admin/tickets", label: "Tickets" },
      { href: "/admin/transport-routes", label: "Transport Routes" },
      { href: "/admin/system-health", label: "System Health" },
      { href: "/admin/wayfinding-requests", label: "Wayfinding" },
    ],
  },
];

export const adminOverviewSections = adminNavSections.filter(
  (section) => section.title !== "Overview"
);
