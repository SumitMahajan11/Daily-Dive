# Daily Dive

A distraction-free, privacy-first progressive web application (PWA) designed for daily micro-learning on demand. Spin a tactile roulette wheel for curated, high-signal knowledge across technical, philosophical, financial, and psychological disciplines, maintain daily learning streaks, and retain key concepts through spaced repetition.

---

## 30-Second Pitch

Most online learning platforms trap you in endless feeds or require heavy multi-week course commitments. **Daily Dive** takes the opposite approach: **one high-signal micro-dive a day, zero clutter, zero accounts, and 100% local privacy**.

- **Open & Spin**: Receive a curated concept with a 2-minute overview, core mental model, real-world application, and curated reference links.
- **Learn & Retain**: Add topics to your spaced repetition queue to reinforce knowledge over 1, 3, 7, and 14-day intervals.
- **Convert Your Content**: Upload PDFs, presentations, documents, videos, or audio files to turn personal materials into bite-sized dive cards locally in your browser.
- **Own Your Data**: Everything stays in your browser's local storage. No tracking, no cloud sync lock-in, and offline-capable from day one.

---

## Screenshots

### Desktop & Mobile Experience
| Daily Dive Roulette (Desktop) | Daily Dive Roulette (Mobile) |
| :---: | :---: |
| ![Desktop Spin Screen](docs/screenshots/spin_screen_desktop.png) | ![Mobile Spin Screen](docs/screenshots/spin_screen_mobile.png) |

| Spaced Repetition & Progress (Desktop) | Ingestion & Library (Desktop) |
| :---: | :---: |
| ![Progress & Streaks](docs/screenshots/progress_screen_desktop.png) | ![Library & Ingestion](docs/screenshots/library_screen_desktop.png) |

---

## Core Features

- 🎡 **Weighted Roulette Engine**: Spin for random or interest-targeted concepts. The wheel settles smoothly into focused study cards with fluid animations and tactile sound effects.
- 🎯 **Interest Customization**: Filter spins across 12 distinct knowledge domains across technical systems, career strategy, psychology, and philosophy.
- 📥 **Local Ingestion Engine**: Drop PDFs, images, PowerPoint slides (`.pptx`), Word documents (`.docx`), audio, or videos. Text extraction, OCR, and transcriptions run on-demand in-browser.
- 🔁 **Spaced Repetition Queue**: Mark topics as explored or queue them for interval reviews (1d, 3d, 7d, 14d) to lock in long-term retention.
- 🔥 **Streak & History Tracking**: Track daily learning consistency with reconciled streak tracking, completion calendars, and exploration logs.
- 🔗 **Deep Linking & Web Share**: Share any topic card via native Web Share API or copy direct deep-links (`?t=<slug>`) with seamless fallbacks.
- 📅 **Add to Calendar**: Export recurring daily reminder `.ics` calendar events (floating local time) to keep learning consistent.
- 📱 **100% Offline PWA**: Built with Service Worker precaching and installable on iOS, Android, macOS, and Windows.
- 💾 **Durable Backup & Export**: Export your entire exploration history, custom topics, and queue to JSON anytime, or restore from a previous backup file.

---

## Topic Dataset Breakdown

<!-- STATS:START -->
Daily Dive compiles **692 curated micro-topics** spanning **12 categories** and 4 primary knowledge pillars:

| Pillar | Category | Topic Count | Focus Areas |
| :--- | :--- | :---: | :--- |
| **Tech & Systems** | Data Structures & Algorithms | 73 | Trees, graphs, dynamic programming, sorting |
|  | Cloud & Infrastructure | 64 | Kubernetes, networking, serverless, edge computing |
|  | AI & Machine Learning | 63 | LLMs, embeddings, transformer architectures, MLOps |
|  | Systems & Distributed Computing | 57 | Raft, Paxos, replication, CAP theorem, caching |
|  | Web Development & Architecture | 56 | DOM performance, rendering pipelines, security |
| **Mind & Growth** | Psychology & Decision Making | 80 | Cognitive biases, mental models, behavioral science |
|  | Communication & Negotiation | 54 | Framing, persuasion, executive presence, feedback |
|  | Philosophy & Critical Thinking | 42 | Epistemology, ethics, logic, first principles |
| **Money & Career** | Personal Finance & Economics | 68 | Compound interest, macroeconomics, capital markets |
|  | Career Strategy & Leadership | 45 | Leverage, org design, talent density, negotiations |
| **World & Ideas** | Science & Nature | 45 | Quantum mechanics, thermodynamics, biology |
|  | History of Innovation | 45 | Breakthrough inventions, industrial revolutions, tech shifts |
| **Total** | | **692 Topics** | |
<!-- STATS:END -->

---

## Privacy Policy & Data Architecture

- **100% Local Storage & On-Device Progress**: All topic progress, streaks, review history, custom uploads, and settings are saved exclusively in your browser's `localStorage` and `IndexedDB`. Signing in with an account is completely optional, and for now, all learning progress still stays on-device.
- **Zero Third-Party Trackers & Zero Analytics**: No third-party trackers, no tracking cookies, and no remote telemetry. The core application (Spin, Library, and Progress) requires no account and operates fully offline.
- **Optional Gemini API Key (BYOK)**: If you provide an optional Google Gemini API key in Settings to synthesize custom uploaded documents, requests are sent **directly from your browser to Google's API endpoints**. Your key is stored solely in local device storage and is never transmitted to any proxy server.

---

## Topic Schema Structure

Topics are stored as structured JSON objects conforming to the following specification:

```json
{
  "id": "raft-consensus",
  "slug": "raft-consensus",
  "title": "Raft Consensus Algorithm",
  "category": "systems-distributed-computing",
  "group": "tech",
  "summary": "A consensus algorithm designed to be more understandable than Paxos while providing equivalent fault tolerance.",
  "mentalModel": "Understand leader election, log replication, and safety invariants in distributed state machines.",
  "actionableTakeaway": "Use quorum-based leader election to prevent split-brain states in clustered applications.",
  "difficulty": "Advanced",
  "estimatedMinutes": 3,
  "resources": [
    {
      "title": "In Search of an Understandable Consensus Algorithm (USENIX ATC '14)",
      "url": "https://raft.github.io/raft.pdf",
      "type": "Paper"
    }
  ]
}
```

---

## Development & Build Pipeline

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [Python](https://www.python.org/) (v3.10+ for topic compilation and validation scripts)

### Installation
```bash
# Clone the repository
git clone https://github.com/SumitMahajan11/Daily-Dive.git
cd Daily-Dive

# Install Node dependencies
npm install
```

### Running Locally
```bash
# Start Vite development server
npm run dev
```
Navigate to `http://localhost:5173`.

### Compiling & Validating Topic Seeds
```bash
# Validate CSV datasets against schema and check URL health
python scripts/tools/validation/validate_and_fix_all_seeds.py

# Recompile expanded topics into client bundle
python scripts/build_expanded_topics.py
```

### Running Tests & Audits
```bash
# Production build
npm run build

# Run unit and regression test suites
npm test

# Run Playwright end-to-end suites
npm run test:e2e
```

---

## Production Deployment (Vercel)

Daily Dive is optimized for zero-config static deployment on Vercel:

1. Push your changes to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Select the **Vite** framework preset:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Deploy! **No environment variables or backend configurations are required.**

---

## Documentation

- [Extractor Limitations](docs/EXTRACTOR_LIMITATIONS.md): Limitations, synthetic extraction metrics, and title quality notes.
- [Known Issues](docs/KNOWN_ISSUES.md): Known issues register, review criteria, and workarounds.
- [Evaluation Results](docs/RESULTS.md): Benchmark results, precision/recall metrics, and model evaluations.
- [Holdout Protocol](docs/holdout_protocol.md): Holdout evaluation protocol, dataset rules, and blinded testing.
- [Structure Audit](docs/STRUCTURE_AUDIT.md): Comprehensive repository structure map, file classifications, and dependency graph.

---

## Contributing

Contributions are welcome!
1. Fork the project.
2. Create a feature branch (`git checkout -b feature/topic-expansion`).
3. If adding or editing topics in `seeds/*.csv`, run `python scripts/tools/validation/validate_and_fix_all_seeds.py` and `python scripts/build_expanded_topics.py`.
4. Ensure all tests pass (`npm run build`).
5. Commit your changes and open a Pull Request.

---

## License

Distributed under the MIT License. See `LICENSE` for details.
