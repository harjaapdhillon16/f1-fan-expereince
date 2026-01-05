export interface FanNavItem {
  href: string;
  label: string;
  shortLabel?: string;
  description?: string;
  icon?: "clock" | "map" | "chat" | "bell" | "spark" | "settings";
}

export interface FanNavSection {
  title: string;
  items: FanNavItem[];
}

export const primaryNavItems: FanNavItem[] = [
  {
    href: "/fan/countdown",
    label: "Event Countdown",
    shortLabel: "Countdown",
    icon: "clock",
  },
  { href: "/fan/map", label: "Venue Map", shortLabel: "Venue", icon: "map" },
  { href: "/fan/chat", label: "Chat", shortLabel: "Chat", icon: "chat" },
  {
    href: "/fan/alerts",
    label: "Alerts",
    shortLabel: "Alerts",
    icon: "bell",
  },
  {
    href: "/fan/settings",
    label: "Settings",
    shortLabel: "Settings",
    icon: "settings",
  },
];

const fanSections: FanNavSection[] = [
  {
    title: "Pre-Race",
    items: [
      {
        label: "Event Countdown",
        description: "Track the next session start in real time.",
        href: "/fan/countdown",
      },
      {
        label: "Dynamic FAQ",
        description: "Gate times, security rules, and ticketing info.",
        href: "/fan/faq",
      },
      {
        label: "Schedule Builder",
        description: "Pick the sessions you want to follow.",
        href: "/fan/schedule",
      },
      {
        label: "Venue Map",
        description: "Explore entrances, seating, and amenities.",
        href: "/fan/map",
      },
      {
        label: "Transport Planner",
        description: "Plan public transport, parking, or ride share.",
        href: "/fan/transport-planner",
      },
      {
        label: "Ticket Wallet",
        description: "Retrieve tickets and QR codes.",
        href: "/fan/tickets",
      },
    ],
  },
  {
    title: "Race Day",
    items: [
      {
        label: "Fan Chatbot",
        description: "Ask real-time questions with quick prompts.",
        href: "/fan/chat",
      },
      {
        label: "Wayfinding",
        description: "Find seats, exits, food, and facilities.",
        href: "/fan/wayfinding",
      },
      {
        label: "Transport Updates",
        description: "Live shuttles, traffic, and metro alerts.",
        href: "/fan/transport-updates",
      },
      {
        label: "Language",
        description: "Switch assistant language and locale.",
        href: "/fan/languages",
      },
      {
        label: "Emergency Help",
        description: "Medical, security, and lost property.",
        href: "/fan/emergency",
      },
      {
        label: "Alerts",
        description: "Safety, weather, and session notifications.",
        href: "/fan/alerts",
      },
      {
        label: "Notification Settings",
        description: "Customize push and SMS topics.",
        href: "/fan/notifications",
      },
    ],
  },
];

const primaryHrefs = new Set(primaryNavItems.map((item) => item.href));

export const settingsSections = fanSections
  .map((section) => ({
    ...section,
    items: section.items.filter((item) => !primaryHrefs.has(item.href)),
  }))
  .filter((section) => section.items.length > 0);
