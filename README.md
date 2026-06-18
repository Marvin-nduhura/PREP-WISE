# PrepWise AI – Smart Study Planner

An AI-powered full-stack study planner built with **Next.js**, **Tailwind CSS**, **Supabase**, and **Groq API**.

## Features
- 🤖 AI-generated personalized study schedules
- 💾 Save plans to Supabase cloud database
- 📅 Day-by-day breakdown based on exam date
- 🗂️ View, organize, and delete saved plans
- ⚡ Built on Next.js App Router with TypeScript

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + Tailwind CSS v4 |
| AI | Groq API (llama-3.3-70b-versatile) |
| Database | Supabase (PostgreSQL) |
| Deploy | Vercel |

## Setup

### 1. Clone & Install
```bash
git clone <your-repo>
cd prepwise-ai
npm install
```

### 2. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://zirskdfsfwrmpoacuvrd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Supabase Database
Go to **Supabase Dashboard → SQL Editor** and run `supabase-setup.sql`:
```sql
create table study_plans (
  id           uuid primary key default gen_random_uuid(),
  subject      text not null,
  topics       text not null,
  exam_date    date not null,
  plan_content text not null,
  created_at   timestamptz default now()
);

alter table study_plans enable row level security;
create policy "Allow all" on study_plans for all using (true) with check (true);
```

### 4. Get Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Create account → API Keys → Create new key
3. Add to `.env.local` as `GROQ_API_KEY`

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel
1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

## Project Structure
```
prepwise-ai/
├── app/
│   ├── page.tsx          # Home - study form + plan preview
│   ├── layout.tsx        # Root layout with navbar
│   ├── globals.css       # Global styles + animations
│   ├── plans/
│   │   └── page.tsx      # Saved plans page
│   └── api/
│       └── generate/
│           └── route.ts  # Groq AI API route
├── components/
│   ├── StudyForm.tsx     # Form component
│   ├── PlanPreview.tsx   # Generated plan preview + save
│   └── PlanCard.tsx      # Saved plan card
├── lib/
│   └── supabase-client.ts # Supabase browser client
├── types/
│   └── index.ts          # TypeScript types
├── .env.local            # Environment variables
└── supabase-setup.sql    # DB setup script
```
