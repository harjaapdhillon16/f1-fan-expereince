import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_CONTEXT = `
Spanish Grand Prix 2026 (DEMO DATA)
Event: Formula 1 Gran Premio de Espana 2026
Venue: Circuit de Barcelona-Catalunya, Montmelo (Barcelona), Spain
Timezone: Europe/Madrid (CEST)
Dates: 22-24 May 2026

Session schedule (local time, demo):
- Fri 22 May: Practice 1 11:30, Practice 2 15:00
- Sat 23 May: Practice 3 10:30, Qualifying 14:00
- Sun 24 May: Race 15:00

Gates & entry (demo):
- Gate 1 (Main): opens 07:30, closest to Fan Village
- Gate 3 (North): opens 08:00, closest to Grandstand G
- Gate 5 (South): opens 08:00, closest to General Admission hills

Transport & parking (demo):
- Train: Rodalies R2 to Montmelo + free shuttle every 10 min
- Parking lots: P1 (premium), P2 (general), P3 (overflow)
- Rideshare drop-off: Gate 3 loop

On-site services (demo):
- Info desk: Fan Village (by Main Stage)
- Medical: posts at Gate 1 and Gate 5
- Lost & found: Info desk until 19:30
- Accessibility: accessible viewing at Grandstand K, ramps at Gate 1

Policies (demo):
- Bag limit: 20L soft bag only
- Prohibited: glass, drones, flares, large umbrellas
- Re-entry: allowed before 18:00 with wristband scan
`;

function buildSystemPrompt(eventName?: string) {
  return `
You are F1 Fan Assist, a friendly on-site chatbot for event attendees.
Use only the demo data provided below when answering questions.
If a detail is not in the demo data, say it is not available in the demo and suggest checking the info desk.
Keep answers short, practical, and confident. Ask one clarifying question only if needed.
Include times with timezone. Do not invent facts.

${eventName ? `Current event focus: ${eventName}` : ""}
${DEMO_CONTEXT}
`;
}

type ChatRole = "user" | "assistant";

interface ChatHistoryItem {
  role: ChatRole;
  content: string;
}

interface ChatRequestBody {
  message?: string;
  history?: ChatHistoryItem[];
  eventName?: string;
}

export async function POST(request: Request) {
  let body: ChatRequestBody | null = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const message = body?.message?.trim();
  if (!message) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  const apiKey = 'sk-05ba3770332f4ca683896c153bafbbac'
  if (!apiKey) {
    return NextResponse.json(
      { error: "DeepSeek API key is not configured." },
      { status: 500 }
    );
  }

  const history = Array.isArray(body?.history) ? body?.history ?? [] : [];
  const sanitizedHistory = history
    .filter(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    )
    .slice(-10);

  const messages = [
    { role: "system", content: buildSystemPrompt(body?.eventName) },
    ...sanitizedHistory,
    { role: "user", content: message },
  ];

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.2,
      max_tokens: 320,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      {
        error: "DeepSeek request failed.",
        detail: errorText.slice(0, 2000),
      },
      { status: 502 }
    );
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    return NextResponse.json(
      { error: "Assistant did not return a reply." },
      { status: 502 }
    );
  }

  return NextResponse.json({ reply });
}
