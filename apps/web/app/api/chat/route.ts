import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_CONTEXT = `
Mexico City Grand Prix 2026 
Event: Formula 1 Gran Premio de la Ciudad de México 2026
Venue: Autódromo Hermanos Rodríguez, Mexico City, Mexico
Timezone: America/Mexico_City (CST - Central Standard Time, UTC-6)
Dates: 30 October - 1 November 2026

Session schedule (local time, demo based on typical F1 format):
- Fri 30 Oct: Practice 1 12:30, Practice 2 16:00
- Sat 31 Oct: Practice 3 12:30, Qualifying 16:00
- Sun 1 Nov: Race 14:00

Gates & entry (demo):
- Gate 1 (Velódromo): closest to Metro Velódromo station (Line 9)
- Gates 4-7 (Ciudad Deportiva): closest to Metro Ciudad Deportiva station (Line 9)
- Gates 8-9 (Puebla area): closest to Metro Puebla station (Line 9)
- Gates 13-14 (South): closest to Metrobus Line 2 (UPIICSA, El Rodeo stations)
- Gate opening: typically 07:00-08:00 on event days
- Note: No re-entry allowed once you leave the circuit

Transport & parking (demo):
- Metro: Line 9 (brown line) - Velódromo, Ciudad Deportiva, Puebla stations
- Metrobus: Line 2 (purple) - UPIICSA, El Rodeo stations (south side access)
- No general parking at circuit - public transport strongly recommended
- Taxi/Uber drop-off available but expect traffic delays
- Free shuttle bus travels around circuit perimeter between zones

On-site services (demo):
- Circuit divided into color-coded zones - must enter through correct gate for your zone
- Medical posts available throughout venue
- Info desk: Fan Village area
- 12+ free water refill stations across the circuit
- Accessibility: Accessible viewing and ramps at Green and Blue zones
- Food & drink: 50+ options including tacos, churros, pizza, seafood
- Payment: Citibanamex Cashless rechargeable card system (can top up with cash/card)
- Beer available: 11:00-19:00, Hard liquor: 12:00-19:00

Policies (demo):
- Bag limit: Standard small-size bags only (backpack, messenger bag) - NO camping backpacks
- Prohibited items: Glass bottles, outside alcohol, drones, large umbrellas, camping chairs, 
  professional cameras (lens >300mm), selfie sticks, tripods, fireworks, weapons, balls, 
  horns, whistles, laser pointers, unauthorized transportation (bikes, scooters)
- Allowed items: Hats, sunscreen, sunglasses, beach towels, cameras (lens <300mm, 2 lenses max),
  GoPro cameras, small bags, motorcycle helmets, flags/posters (PVC mast only), 
  raincoats, small strollers, binoculars, external phone batteries, baby food
- Re-entry: NOT allowed - once you exit, you cannot return the same day
- Security: Airport-style screening at all entrances

Special notes (demo):
- Circuit located 2,240m (7,340 ft) above sea level - bring sun protection and stay hydrated
- Famous Foro Sol stadium section provides incredible atmosphere
- Weather in late October: mild days (22°C/72°F), cooler evenings - dress in layers
`;

function buildSystemPrompt(eventName?: string) {
  return `
You are F1 Fan Assist, a friendly on-site chatbot for event attendees.
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