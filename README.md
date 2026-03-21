# SaaS Atlas - Searchable SaaS Product Directory

Searchable directory of 200+ SaaS products with direct links to official documentation.

**Live:** [mindlyft.in](https://mindlyft.in)

---

## What It Is

You know the tool you need. Finding its docs shouldn't take five Google results. SaaS Atlas is a single search interface across the SaaS ecosystem — search by product name or category, land directly on the official documentation.

It's also part of the broader Navigator ecosystem. Navigator needs to know what SaaS tools exist and where their documentation lives. SaaS Atlas is that index, built as a public product.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Deployment | Vercel |
| Domain | mindlyft.in |

---

## Architecture

Intentionally minimal. Three files that matter:

```
app/
  page.tsx                  # Renders <CompanyDirectory />
components/
  CompanyDirectory.tsx      # Search + list + detail — the entire UI
lib/
  supabase.ts               # Client setup
  types.ts                  # Company interface
```

Data model: `id · name · category · docs_url · description`. All filtering is client-side. The Supabase query runs once on load, sorted alphabetically by name.

---

## Running Locally

```bash
git clone https://github.com/hrshitkunwar-tech/saas-atlas
cd saas-atlas
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

```bash
npm run dev
# → localhost:3000
```

To populate your own database, create a `companies` table in Supabase:

| Column | Type |
|---|---|
| id | int8, primary key |
| name | text |
| category | text |
| docs_url | text |
| description | text, nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

---

## Part of the Mindlyft Ecosystem

```
SaaS Atlas     → indexes what tools exist + where their docs live
     ↓
Navigator      → uses that context when executing workflows inside those tools
     ↓
Users          → get an agent that already understands the tool before it touches it
```

As Navigator grows, SaaS Atlas grows with it. Every tool in the directory is a tool Navigator can automate.

---

## Screenshot

![SaaS Atlas](screenshot.png)

---

## Template

This repo is a public GitHub template. Fork it to build a category-specific software directory — developer tools, no-code platforms, analytics stacks, whatever the ecosystem you know well.
