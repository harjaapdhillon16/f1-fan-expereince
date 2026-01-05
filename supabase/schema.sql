-- F1 Fan Experience schema for Supabase (Postgres)

create extension if not exists "pgcrypto";

-- Core user profile
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  primary_role text default 'fan',
  preferred_language text default 'en',
  accessibility jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Venues and events
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  country text,
  timezone text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references public.venues(id) on delete set null,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'live', 'completed')),
  start_at timestamptz,
  end_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  session_type text not null check (session_type in ('practice', 'qualifying', 'race', 'support')),
  start_at timestamptz,
  end_at timestamptz,
  broadcast_channel text,
  is_featured boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.user_schedules (
  user_id uuid references auth.users(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, session_id)
);

-- Ticketing
create table if not exists public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_id uuid references public.events(id) on delete cascade,
  ticket_type_id uuid references public.ticket_types(id) on delete set null,
  seat text,
  qr_payload text,
  wallet_pass_url text,
  status text not null default 'active' check (status in ('active', 'used', 'revoked')),
  issued_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

-- FAQs
create table if not exists public.faq_categories (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  category_id uuid references public.faq_categories(id) on delete set null,
  question text not null,
  answer text not null,
  language text default 'en',
  is_active boolean default true,
  priority integer default 0,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Maps
create table if not exists public.map_layers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  layer_type text default 'poi',
  is_active boolean default true,
  sort_order integer default 0,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.map_points (
  id uuid primary key default gen_random_uuid(),
  layer_id uuid references public.map_layers(id) on delete cascade,
  name text not null,
  point_type text,
  latitude double precision,
  longitude double precision,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.saved_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  map_point_id uuid references public.map_points(id) on delete set null,
  label text,
  created_at timestamptz default now()
);

create table if not exists public.wayfinding_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_id uuid references public.events(id) on delete cascade,
  start_lat double precision,
  start_lng double precision,
  destination_point_id uuid references public.map_points(id) on delete set null,
  status text default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz default now()
);

-- Transport and alerts
create table if not exists public.transport_updates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  route_name text not null,
  status text not null,
  detail text,
  severity text default 'info' check (severity in ('info', 'warning', 'critical')),
  start_at timestamptz,
  end_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.transport_routes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  mode text not null check (mode in ('shuttle', 'metro', 'parking', 'rideshare')),
  zone text,
  instructions text,
  is_active boolean default true,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.user_transport_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  mode text not null,
  zone text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  alert_type text not null check (alert_type in ('safety', 'weather', 'medical', 'security')),
  title text not null,
  message text not null,
  severity text default 'info' check (severity in ('info', 'warning', 'critical')),
  start_at timestamptz,
  end_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.alert_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  alert_type text not null check (alert_type in ('safety', 'weather', 'medical', 'security')),
  severity text default 'info' check (severity in ('info', 'warning', 'critical')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.emergency_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_id uuid references public.events(id) on delete cascade,
  request_type text not null check (request_type in ('medical', 'security', 'lost', 'other')),
  message text,
  status text default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz default now()
);

-- Announcements
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  title text not null,
  message text not null,
  language text default 'en',
  targeting jsonb default '{}'::jsonb,
  status text default 'draft' check (status in ('draft', 'scheduled', 'sent')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Notifications and preferences
create table if not exists public.notification_preferences (
  user_id uuid references auth.users(id) on delete cascade,
  topic text not null,
  channel text not null,
  enabled boolean default true,
  created_at timestamptz default now(),
  primary key (user_id, topic, channel)
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null,
  keys jsonb not null,
  created_at timestamptz default now()
);

-- Chatbot interactions
create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  is_anonymous boolean default false,
  status text default 'open' check (status in ('open', 'closed')),
  created_at timestamptz default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.chat_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'agent')),
  message text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.chat_message_topics (
  message_id uuid references public.chat_messages(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete cascade,
  primary key (message_id, topic_id)
);

create table if not exists public.engagement_events (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Feedback surveys
create table if not exists public.feedback_surveys (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  title text not null,
  status text default 'draft' check (status in ('draft', 'live', 'closed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.feedback_questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references public.feedback_surveys(id) on delete cascade,
  question text not null,
  question_type text not null check (question_type in ('rating', 'text', 'choice')),
  options jsonb default '[]'::jsonb,
  sort_order integer default 0
);

create table if not exists public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references public.feedback_surveys(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  overall_rating integer,
  created_at timestamptz default now()
);

create table if not exists public.feedback_answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid references public.feedback_responses(id) on delete cascade,
  question_id uuid references public.feedback_questions(id) on delete cascade,
  answer_text text,
  answer_number numeric,
  answer_json jsonb default '{}'::jsonb
);

create table if not exists public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references public.feedback_surveys(id) on delete cascade,
  generated_by uuid references auth.users(id) on delete set null,
  summary text,
  report_url text,
  created_at timestamptz default now()
);

-- Lost items
create table if not exists public.lost_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  description text not null,
  last_location text,
  status text default 'open' check (status in ('open', 'found', 'returned')),
  contact_email text,
  created_at timestamptz default now()
);

create table if not exists public.race_highlights (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  title text not null,
  summary text,
  media_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Sponsors
create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text,
  logo_url text,
  created_at timestamptz default now()
);

create table if not exists public.sponsor_campaigns (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references public.sponsors(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  title text not null,
  cta_text text,
  status text default 'draft' check (status in ('draft', 'live', 'paused', 'completed')),
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.sponsor_interactions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.sponsor_campaigns(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  created_at timestamptz default now()
);

-- Documents and uploads
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  title text not null,
  file_url text not null,
  file_type text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  status text default 'inactive' check (status in ('inactive', 'active', 'error')),
  config jsonb default '{}'::jsonb,
  last_sync_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.pwa_installs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  platform text,
  installed_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

-- Zones for targeting
create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  zone_type text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Roles and permissions
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role_id uuid references public.roles(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, role_id, event_id)
);

-- System health and audit
create table if not exists public.system_health (
  id uuid primary key default gen_random_uuid(),
  service text not null,
  status text not null,
  latency_ms integer,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Consent tracking
create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  consent_type text not null,
  accepted boolean default false,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

create unique index if not exists consents_user_type_idx
  on public.consents (user_id, consent_type);

alter table public.profiles
  add column if not exists favorite_event_id uuid references public.events(id);

alter table public.faqs
  add column if not exists view_count integer default 0;

alter table public.chat_messages
  add column if not exists sentiment text;

-- Helper functions
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = uid and r.name in ('admin', 'ops', 'security')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.user_schedules enable row level security;
alter table public.tickets enable row level security;
alter table public.faqs enable row level security;
alter table public.map_layers enable row level security;
alter table public.map_points enable row level security;
alter table public.saved_locations enable row level security;
alter table public.wayfinding_requests enable row level security;
alter table public.transport_updates enable row level security;
alter table public.transport_routes enable row level security;
alter table public.user_transport_plans enable row level security;
alter table public.alerts enable row level security;
alter table public.alert_templates enable row level security;
alter table public.emergency_requests enable row level security;
alter table public.announcements enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.engagement_events enable row level security;
alter table public.feedback_surveys enable row level security;
alter table public.feedback_questions enable row level security;
alter table public.feedback_responses enable row level security;
alter table public.feedback_answers enable row level security;
alter table public.feedback_reports enable row level security;
alter table public.lost_items enable row level security;
alter table public.race_highlights enable row level security;
alter table public.sponsor_campaigns enable row level security;
alter table public.sponsor_interactions enable row level security;
alter table public.documents enable row level security;
alter table public.integration_connections enable row level security;
alter table public.pwa_installs enable row level security;
alter table public.system_health enable row level security;
alter table public.audit_logs enable row level security;
alter table public.consents enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.sessions enable row level security;
alter table public.ticket_types enable row level security;
alter table public.faq_categories enable row level security;
alter table public.sponsors enable row level security;
alter table public.zones enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.topics enable row level security;
alter table public.chat_message_topics enable row level security;

-- Profiles
create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);

create policy "Profiles are editable by owner" on public.profiles
  for update using (auth.uid() = id);

create policy "Profiles can be inserted by owner" on public.profiles
  for insert with check (auth.uid() = id);

-- Public read tables
create policy "Public read faqs" on public.faqs
  for select using (true);

create policy "Public read venues" on public.venues
  for select using (true);

create policy "Public read events" on public.events
  for select using (status <> 'draft' or public.is_admin(auth.uid()));

create policy "Public read sessions" on public.sessions
  for select using (true);

create policy "Public read ticket types" on public.ticket_types
  for select using (true);

create policy "Public read faq categories" on public.faq_categories
  for select using (true);

create policy "Public read sponsors" on public.sponsors
  for select using (true);

create policy "Public read zones" on public.zones
  for select using (true);

create policy "Public read topics" on public.topics
  for select using (true);

create policy "Public read map layers" on public.map_layers
  for select using (true);

create policy "Public read map points" on public.map_points
  for select using (true);

create policy "Public read transport updates" on public.transport_updates
  for select using (true);

create policy "Public read transport routes" on public.transport_routes
  for select using (true);

create policy "Public read alerts" on public.alerts
  for select using (true);

create policy "Public read announcements" on public.announcements
  for select using (true);

create policy "Public read sponsor campaigns" on public.sponsor_campaigns
  for select using (true);

create policy "Public read documents" on public.documents
  for select using (true);

create policy "Public read race highlights" on public.race_highlights
  for select using (true);

create policy "Public read integration connections" on public.integration_connections
  for select using (true);

create policy "Public read feedback surveys" on public.feedback_surveys
  for select using (status = 'live');

create policy "Public read feedback questions" on public.feedback_questions
  for select using (
    exists (
      select 1
      from public.feedback_surveys s
      where s.id = feedback_questions.survey_id
        and s.status = 'live'
    )
  );

-- Admin write policies
create policy "Admin manage faqs" on public.faqs
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage venues" on public.venues
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage events" on public.events
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage sessions" on public.sessions
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage ticket types" on public.ticket_types
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage faq categories" on public.faq_categories
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage sponsors" on public.sponsors
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage zones" on public.zones
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage topics" on public.topics
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage map layers" on public.map_layers
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage map points" on public.map_points
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage transport updates" on public.transport_updates
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage transport routes" on public.transport_routes
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage alerts" on public.alerts
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage alert templates" on public.alert_templates
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage emergency requests" on public.emergency_requests
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage wayfinding requests" on public.wayfinding_requests
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage announcements" on public.announcements
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage sponsor campaigns" on public.sponsor_campaigns
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage documents" on public.documents
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage surveys" on public.feedback_surveys
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage survey questions" on public.feedback_questions
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage feedback reports" on public.feedback_reports
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage race highlights" on public.race_highlights
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage integration connections" on public.integration_connections
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage engagement events" on public.engagement_events
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage pwa installs" on public.pwa_installs
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage system health" on public.system_health
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage audit logs" on public.audit_logs
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage roles" on public.roles
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage user roles" on public.user_roles
  for all using (public.is_admin(auth.uid()));

create policy "Admin manage chat message topics" on public.chat_message_topics
  for all using (public.is_admin(auth.uid()));

-- User owned data
create policy "Users manage schedules" on public.user_schedules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage saved locations" on public.saved_locations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage transport plans" on public.user_transport_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage wayfinding requests" on public.wayfinding_requests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage emergency requests" on public.emergency_requests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage engagement events" on public.engagement_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage pwa installs" on public.pwa_installs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users read own roles" on public.user_roles
  for select using (auth.uid() = user_id);

create policy "Users read tickets" on public.tickets
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Admins manage tickets" on public.tickets
  for all using (public.is_admin(auth.uid()));

create policy "Users manage notification prefs" on public.notification_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage push subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage chat threads" on public.chat_threads
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users read chat messages" on public.chat_messages
  for select using (
    exists (
      select 1
      from public.chat_threads t
      where t.id = chat_messages.thread_id
        and (t.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

create policy "Users insert chat messages" on public.chat_messages
  for insert with check (
    exists (
      select 1
      from public.chat_threads t
      where t.id = chat_messages.thread_id
        and (t.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

create policy "Users manage feedback responses" on public.feedback_responses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Admin read feedback responses" on public.feedback_responses
  for select using (public.is_admin(auth.uid()));

create policy "Users manage feedback answers" on public.feedback_answers
  for all using (
    exists (
      select 1
      from public.feedback_responses r
      where r.id = feedback_answers.response_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.feedback_responses r
      where r.id = feedback_answers.response_id
        and r.user_id = auth.uid()
    )
  );

create policy "Admin read feedback answers" on public.feedback_answers
  for select using (public.is_admin(auth.uid()));

create policy "Users manage lost items" on public.lost_items
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users manage sponsor interactions" on public.sponsor_interactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Admin read sponsor interactions" on public.sponsor_interactions
  for select using (public.is_admin(auth.uid()));

create policy "Users manage consents" on public.consents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
