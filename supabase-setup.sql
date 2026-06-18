-- Run this in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run

create table if not exists study_plans (
  id          uuid primary key default gen_random_uuid(),
  subject     text not null,
  topics      text not null,
  exam_date   date not null,
  plan_content text not null,
  created_at  timestamptz default now()
);

-- Allow all operations (no auth required for this project)
alter table study_plans enable row level security;

create policy "Allow all" on study_plans
  for all using (true) with check (true);
