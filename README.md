# Life Learning Roulette

A distraction-free, privacy-first progressive web application (PWA) for daily micro-learning on demand. Spin for curated learning topics across technical, psychological, philosophical, and financial disciplines, maintain daily streaks, and review concepts using spaced repetition.

---

## Features

- **Weighted Roulette Engine**: Selects topics dynamically based on spaced repetition weights, categories, and past activity.
- **500+ Curated Topics**: 9 core knowledge domains with concise summaries, actionable mental models, and verified authoritative reference links (arXiv, Stanford Encyclopedia of Philosophy, official docs, etc.).
- **Spaced Repetition & Progress**: Tracks mastery counts, daily streak milestones, and upcoming review items.
- **PWA & Offline First**: Full offline support via Service Worker caching and progressive install support on desktop and mobile.
- **Optional Cloud Sync**: Guest mode by default with Supabase authentication and cross-device synchronization.

---

## Directory Structure

```text
├── public/                 # Static assets, PWA manifest.json, sw.js, and icons
├── src/                    # Application source code
│   ├── components/         # UI screens, navbar, modals, and auth widgets
│   ├── context/            # React Context providers (AuthContext, DataContext)
│   ├── lib/                # Roulette engine, Supabase client, audio, data service
│   ├── App.jsx             # Main layout & navigation container
│   ├── index.css           # Tailwind design tokens & base typography
│   └── main.jsx            # React root mount
├── seeds/                  # Production CSV and SQL seed datasets
│   ├── topics_*.csv        # Curated topic CSVs across 9 categories
│   ├── seed_topics_*.sql   # PostgreSQL insert statements with JSONB resources
│   └── supabase_schema.sql # Database schema, RLS policies, and triggers
├── scripts/
│   ├── generation/         # Domain-specific topic generation & icon build scripts
│   └── validation/         # URL verification, title deduplication, and schema validation
├── docs/
│   └── prototypes/         # Initial static HTML/CSS design mocks & prototypes
├── package.json            # Node.js dependencies & scripts
├── vite.config.js          # Vite build & plugin configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

---

## Getting Started Locally

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (optional, for seed generation scripts)

### Installation
```bash
# Clone the repository
git clone https://github.com/SumitMahajan11/life-learning-roulette.git
cd life-learning-roulette

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Seed Data & Validation

All seed datasets live under the [`seeds/`](seeds/) directory:
- **CSV format**: [`seeds/topics_*.csv`](seeds/)
- **SQL format**: [`seeds/seed_topics_*.sql`](seeds/)

To re-run the end-to-end dataset validator (validates non-empty fields, JSON schema, title uniqueness, and URL syntax):
```bash
python scripts/validation/validate_and_fix_all_seeds.py
```

To regenerate SQL seed scripts from the CSV files:
```bash
python scripts/generation/generate_sql_seed.py
```

---

## Production Deployment

### 1. Supabase Setup
1. Create a project on [Supabase](https://supabase.com).
2. Run [`seeds/supabase_schema.sql`](seeds/supabase_schema.sql) in the **SQL Editor** to create tables and RLS security policies.
3. Run the 9 `seeds/seed_topics_*.sql` scripts in the **SQL Editor** to populate topic datasets.
4. Under **Authentication -> URL Configuration**, set your **Site URL** and add your production domain to **Redirect URLs**.

### 2. Vercel Deployment
1. Import the repository in [Vercel](https://vercel.com).
2. Set the Framework Preset to **Vite**.
3. Add the following environment variables for Production:
   - `VITE_SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
   - `VITE_AUTH_REDIRECT_URL`: `https://<your-app>.vercel.app`
4. Deploy.

---

## License
MIT
