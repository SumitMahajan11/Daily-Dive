import os
import csv
import json
import re

SEEDS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'seeds'))
OUTPUT_JSON = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'compiledTopics.json'))
OUTPUT_JS = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'compiledTopics.js'))
os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)

# ── 1. READ ALL SEED CSVs ──
seed_files = sorted([f for f in os.listdir(SEEDS_DIR) if f.startswith('topics_') and f.endswith('.csv')])
all_topics = []
seen_ids = set()
seen_titles = set()
duplicates_removed = []

print(f"Reading {len(seed_files)} seed CSVs from {SEEDS_DIR}...")

TITLE_OVERRIDES = {
    'rlhf-proximal-policy-optimization': 'RLHF: Reinforcement Learning from Human Feedback & Policy Alignment'
}

for sf in seed_files:
    path = os.path.join(SEEDS_DIR, sf)
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            tid = row['id'].strip()
            title = TITLE_OVERRIDES.get(tid, row['title'].strip())
            title_lower = title.lower()

            if tid in seen_ids or title_lower in seen_titles:
                duplicates_removed.append({'reason': 'seed_collision', 'id': tid, 'title': title})
                continue

            # Parse tags
            raw_tags = row.get('tags', '')
            parsed_tags = []
            if isinstance(raw_tags, str):
                try:
                    loaded = json.loads(raw_tags)
                    if isinstance(loaded, list):
                        parsed_tags = loaded
                    elif isinstance(loaded, str):
                        parsed_tags = [loaded]
                except Exception:
                    parsed_tags = [raw_tags]
            elif isinstance(raw_tags, list):
                parsed_tags = raw_tags

            clean_tags = []
            for pt in parsed_tags:
                if isinstance(pt, str):
                    for sub in re.split(r'[;,]', pt):
                        s = sub.strip().strip('"\'[]')
                        if s and s not in clean_tags:
                            clean_tags.append(s)
            tags = clean_tags[:6]

            # Parse resources
            raw_res = row.get('resources', '')
            if isinstance(raw_res, str) and raw_res.strip().startswith('['):
                try:
                    resources = json.loads(raw_res)
                except Exception:
                    resources = []
            else:
                resources = []

            seen_ids.add(tid)
            seen_titles.add(title_lower)

            all_topics.append({
                'id': tid,
                'group_name': row['group_name'].strip(),
                'category': row['category'].strip(),
                'tags': tags if isinstance(tags, list) else ['notes'],
                'title': title,
                'description': row['description'].strip(),
                'resources': resources if isinstance(resources, list) else []
            })

print(f"Loaded {len(all_topics)} canonical topics from seed CSVs.")

# ── 2. NEW CATEGORY: money-career::career-strategy (45 topics) ──
career_strategy_topics = [
    {
        "id": "two-track-career-ladder",
        "title": "The Dual-Track Career Ladder: IC vs Management",
        "description": "Distinguishes technical leadership (Individual Contributor Track) from organizational orchestration (Management Track). High-maturity tech organizations provide parallel compensation and prestige milestones so engineers aren't forced into people management to advance.",
        "tags": ["career-growth", "staff-engineering", "org-design"],
        "resources": [{"label": "Camille Fournier — The Manager's Path (O'Reilly)", "url": "https://www.oreilly.com/library/view/the-managers-path/9781491973882/"}]
    },
    {
        "id": "high-leverage-activities",
        "title": "High-Leverage Activities & Andy Grove's Output Formula",
        "description": "In High Output Management, Intel CEO Andy Grove defines a manager's output as the output of the organization plus the output of neighboring teams influenced. High-leverage actions create disproportionate multiplier effects per unit of time invested.",
        "tags": ["management", "leverage", "productivity"],
        "resources": [{"label": "Andy Grove — High Output Management (Vintage)", "url": "https://www.goodreads.com/book/show/324750.High_Output_Management"}]
    },
    {
        "id": "staff-archetypes",
        "title": "The Four Archetypes of Staff+ Engineering",
        "description": "Will Larson categorizes principal technical roles into four distinct operating modes: The Tech Lead (guiding a specific team), The Architect (driving domain system direction), The Solver (parachuting into deep crises), and The Right Hand (executing for VP/CTO).",
        "tags": ["staff-engineering", "leadership", "technical-strategy"],
        "resources": [{"label": "Will Larson — Staff Engineer: Leadership beyond the management track", "url": "https://staffeng.com/book"}]
    },
    {
        "id": "maker-vs-manager-schedule",
        "title": "Maker's Schedule vs. Manager's Schedule",
        "description": "Paul Graham explains that creative and technical workers require large contiguous blocks of uninterrupted time (half-days), whereas executives operate in 30-minute meeting slots. Interjecting single meetings into a maker's afternoon destroys focus and productivity.",
        "tags": ["deep-work", "time-management", "focus"],
        "resources": [{"label": "Paul Graham — Maker's Schedule, Manager's Schedule (2009)", "url": "http://www.paulgraham.com/makersschedule.html"}]
    },
    {
        "id": "radical-candor-framework",
        "title": "Radical Candor: Care Personally & Challenge Directly",
        "description": "Kim Scott's feedback matrix positions high-performance team culture at the intersection of caring personally and challenging directly. Avoids Ruinous Empathy (withholding critique to be nice) and Obnoxious Aggression (blunt attacks without care).",
        "tags": ["feedback", "communication", "leadership"],
        "resources": [{"label": "Kim Scott — Radical Candor: Be a Kick-Ass Boss", "url": "https://www.radicalcandor.com/"}]
    },
    {
        "id": "scr-communication-framework",
        "title": "Situation-Complication-Resolution (SCR) Framework",
        "description": "McKinsey's executive communication scaffold begins with an uncontroversial baseline (Situation), introduces the acute disruption or pain point (Complication), and immediately proposes the decisive strategic intervention (Resolution).",
        "tags": ["executive-presence", "persuasion", "storytelling"],
        "resources": [{"label": "Barbara Minto — The Pyramid Principle in Strategic Problem Solving", "url": "https://www.mckinsey.com"}]
    },
    {
        "id": "first-90-days-transitions",
        "title": "The First 90 Days: Transition Curve & Early Wins",
        "description": "Michael Watkins demonstrates that professional credibility is established during initial onboarding by building alliances, avoiding assumptions from prior companies, identifying quick wins, and diagnosing the STARS situation (Start-up, Turnaround, Accelerated growth, Realignment, Sustaining success).",
        "tags": ["career-transitions", "onboarding", "leadership"],
        "resources": [{"label": "Michael D. Watkins — The First 90 Days (Harvard Business Review Press)", "url": "https://hbr.org/books"}]
    },
    {
        "id": "single-threaded-ownership",
        "title": "Single-Threaded Ownership & Amazon's 2-Pizza Teams",
        "description": "Amazon's organizational doctrine stipulates that any vital initiative must be led by a single leader with a dedicated team whose sole accountability is that outcome. Eliminates cross-department dependency deadlocks and diffusion of responsibility.",
        "tags": ["org-design", "amazon", "ownership"],
        "resources": [{"label": "Colin Bryar & Bill Carr — Working Backwards: Insights, Stories, and Secrets from Inside Amazon", "url": "https://workingbackwards.com/"}]
    },
    {
        "id": "cynefin-decision-framework",
        "title": "The Cynefin Framework for Contextual Decision-Making",
        "description": "Dave Snowden's sense-making model classifies organizational situations into five domains: Clear (best practice), Complicated (expert analysis), Complex (emergent probes), Chaotic (immediate action), and Confused. Treating complex problems as complicated causes catastrophic paralysis.",
        "tags": ["decision-making", "complexity", "strategy"],
        "resources": [{"label": "Dave Snowden & Mary Boone — A Leader's Framework for Decision Making (HBR)", "url": "https://hbr.org/2007/11/a-leaders-framework-for-decision-making"}]
    },
    {
        "id": "conways-law-inverse",
        "title": "Conway's Law & The Inverse Conway Maneuver",
        "description": "Melvin Conway observed that organizations design systems that mirror their internal communication structures. The Inverse Conway Maneuver intentionally reshapes team topologies and boundaries to naturally foster desired decoupled microservice architectures.",
        "tags": ["system-architecture", "org-design", "conways-law"],
        "resources": [{"label": "Melvin E. Conway — How Do Committees Invent? (Datamation 1968)", "url": "http://www.melconway.com/Home/Committees_Paper.html"}]
    },
    {
        "id": "blameless-postmortems",
        "title": "Blameless Post-Mortems & Psychological Safety",
        "description": "Etsy and Google SRE pioneered blameless post-incident reviews, operating under the premise that engineers do not deliberately introduce outages. Removing personal culpability uncovers root systemic, process, and tooling vulnerabilities that punishment would conceal.",
        "tags": ["sre", "culture", "psychological-safety"],
        "resources": [{"label": "Google SRE Book — Chapter 15: Postmortem Culture: Learning from Failure", "url": "https://sre.google/sre-book/postmortem-culture/"}]
    },
    {
        "id": "technical-debt-quadrant",
        "title": "Martin Fowler's Technical Debt Quadrant",
        "description": "Categorizes code shortcuts across two axes: Deliberate vs Inadvertent, and Prudent vs Reckless. Prudent deliberate debt accelerates critical product delivery when repaid with interest; reckless inadvertent debt stems from poor craftsmanship and ruins maintainability.",
        "tags": ["software-engineering", "refactoring", "technical-debt"],
        "resources": [{"label": "Martin Fowler — Technical Debt Quadrant", "url": "https://martinfowler.com/bliki/TechnicalDebtQuadrant.html"}]
    },
    {
        "id": "product-led-growth-mechanics",
        "title": "Product-Led Growth (PLG) & The Viral Loop",
        "description": "PLG relies on the software product itself as the primary driver of customer acquisition, retention, and expansion. Self-serve onboarding, frictionless time-to-value, and viral collaboration loops replace heavy top-down enterprise sales cycles.",
        "tags": ["plg", "saas", "growth"],
        "resources": [{"label": "Wes Bush — Product-Led Growth: How to Build a Product That Sells Itself", "url": "https://productled.com/book"}]
    },
    {
        "id": "innovators-dilemma-disruption",
        "title": "The Innovator's Dilemma & Low-End Disruption",
        "description": "Clayton Christensen showed that market-leading incumbents fail not from poor management, but by listening rationally to their most profitable customers. This blinds them to simple, cheap innovations that enter the low-end market and march upward.",
        "tags": ["innovation", "strategy", "business"],
        "resources": [{"label": "Clayton M. Christensen — The Innovator's Dilemma (Harvard Business Review)", "url": "https://hbr.org/books"}]
    },
    {
        "id": "jobs-to-be-done-theory",
        "title": "Jobs to Be Done (JTBD) Theory of Customer Choice",
        "description": "Customers do not buy products; they 'hire' them to make progress in specific life situations. Focusing on the underlying emotional, functional, and social job reveals true competitive alternatives that demographic personas overlook.",
        "tags": ["product-management", "jtbd", "customer-research"],
        "resources": [{"label": "Clayton Christensen — Competing Against Luck: The Story of Innovation and Customer Choice", "url": "https://hbr.org"}]
    },
    {
        "id": "okr-framework-execution",
        "title": "OKRs: Objectives and Key Results for Alignment",
        "description": "Andy Grove created and John Doerr popularized OKRs to connect high-level strategic ambitions with measurable, quantitative deliverables. Effective Key Results measure business outcomes rather than task activity checklists.",
        "tags": ["okrs", "alignment", "goal-setting"],
        "resources": [{"label": "John Doerr — Measure What Matters (Penguin)", "url": "https://www.whatmatters.com/"}]
    },
    {
        "id": "north-star-metric-architecture",
        "title": "The North Star Metric & Input Metric Trees",
        "description": "A company's North Star Metric captures the core value delivered to customers and leading indicators of sustainable revenue. Decomposing it into actionable input metrics gives independent squads clear, unconflicted ownership.",
        "tags": ["product-analytics", "metrics", "strategy"],
        "resources": [{"label": "Amplitude — Every Product Needs a North Star Metric", "url": "https://amplitude.com/north-star"}]
    },
    {
        "id": "kano-model-features",
        "title": "The Kano Model of Customer Satisfaction",
        "description": "Categorizes product features into Must-Be (baseline requirements that cause dissatisfaction if absent), One-Dimensional (satisfaction scales linearly with performance), and Attractive Delighters (unexpected innovations that create deep brand loyalty).",
        "tags": ["product-design", "prioritization", "kano"],
        "resources": [{"label": "Noriaki Kano — Attractive Quality and Must-Be Quality (1984)", "url": "https://en.wikipedia.org/wiki/Kano_model"}]
    },
    {
        "id": "crossing-the-chasm-tech",
        "title": "Crossing the Chasm in Technology Adoption",
        "description": "Geoffrey Moore identifies a perilous market gap between Visionaries (Early Adopters eager to experiment) and Pragmatists (Early Majority requiring references and complete whole-product solutions). To cross, companies must target a niche beachhead market.",
        "tags": ["go-to-market", "adoption", "strategy"],
        "resources": [{"label": "Geoffrey A. Moore — Crossing the Chasm (HarperBusiness)", "url": "https://www.harpercollins.com"}]
    },
    {
        "id": "unit-economics-saas",
        "title": "SaaS Unit Economics: CAC, LTV & Payback Period",
        "description": "Evaluates commercial sustainability by comparing Customer Acquisition Cost (CAC) to Customer Lifetime Value (LTV). Healthy subscription models maintain an LTV/CAC ratio above 3:1 with a customer payback period under 12 months.",
        "tags": ["saas", "finance", "unit-economics"],
        "resources": [{"label": "David Skok — SaaS Metrics 2.0: A Guide to Measuring and Improving What Matters", "url": "https://www.forentrepreneurs.com/saas-metrics-2/"}]
    },
    {
        "id": "cohort-retention-analysis",
        "title": "Cohort Retention Curves & Product-Market Fit",
        "description": "Tracking customer cohorts over time reveals whether product engagement flattens parallel to the x-axis (indicating genuine product-market fit) or decays to zero (indicating a leaky bucket reliant on unsustainable paid acquisition).",
        "tags": ["retention", "cohorts", "product-market-fit"],
        "resources": [{"label": "Brian Balfour — Why Retention Is The King of Growth Strategy", "url": "https://brianbalfour.com"}]
    },
    {
        "id": "eisenhower-matrix-prioritization",
        "title": "The Eisenhower Matrix: Urgent vs. Important",
        "description": "Dwight D. Eisenhower's quadrant separates urgent crises from truly important long-term leverage. Great careers are built in Quadrant II (Important, Not Urgent: relationship building, refactoring, strategic planning) before they become emergencies.",
        "tags": ["productivity", "prioritization", "focus"],
        "resources": [{"label": "Stephen R. Covey — The 7 Habits of Highly Effective People", "url": "https://www.franklincovey.com"}]
    },
    {
        "id": "batna-negotiation-dynamics",
        "title": "BATNA: Best Alternative to a Negotiated Agreement",
        "description": "From Fisher & Ury's Getting to Yes, your negotiating leverage is strictly determined by your BATNA—the alternative course of action if talks collapse. You never accept an offer inferior to your BATNA, nor reject one clearly superior.",
        "tags": ["negotiation", "strategy", "game-theory"],
        "resources": [{"label": "Roger Fisher & William Ury — Getting to Yes: Negotiating Agreement Without Giving In", "url": "https://www.williamury.com/books/getting-to-yes/"}]
    },
    {
        "id": "pyramid-principle-minto",
        "title": "The Minto Pyramid Principle for Structured Thought",
        "description": "Developed by Barbara Minto at McKinsey, this communication method requires stating the executive conclusion or recommendation first, followed by mutually exclusive, collectively exhaustive (MECE) supporting rationale.",
        "tags": ["writing", "clarity", "executive-communication"],
        "resources": [{"label": "Barbara Minto — The Minto Pyramid Principle: Logic in Writing and Thinking", "url": "https://minto.com"}]
    },
    {
        "id": "galls-law-systems",
        "title": "Gall's Law & Iterative System Evolution",
        "description": "John Gall's rule of systems engineering states: 'A complex system that works is invariably found to have evolved from a simple system that worked.' Complex systems designed from scratch invariably fail and can never be patched to work.",
        "tags": ["systems-thinking", "engineering", "evolution"],
        "resources": [{"label": "John Gall — Systemantics: How Systems Work and Especially How They Fail (1975)", "url": "https://en.wikipedia.org/wiki/John_Gall_(author)"}]
    },
    {
        "id": "parkinsons-law-time",
        "title": "Parkinson's Law & Scope Expansion",
        "description": "Cyril Northcote Parkinson's dictum that 'work expands so as to fill the time available for its completion.' Enforcing strict sprint horizons, timeboxing, and minimum viable deliverables counteracts the natural creep of unnecessary complexity.",
        "tags": ["productivity", "project-management", "timeboxing"],
        "resources": [{"label": "C. Northcote Parkinson — Parkinson's Law (1955)", "url": "https://www.economist.com"}]
    },
    {
        "id": "flywheel-effect-collins",
        "title": "Jim Collins' Flywheel Effect & Cumulative Momentum",
        "description": "Sustainable business success does not result from a single breakthrough or miraculous launch, but from pushing a giant, heavy flywheel turn upon turn, building compound momentum where each rotation enables subsequent acceleration.",
        "tags": ["business-strategy", "momentum", "compound-growth"],
        "resources": [{"label": "Jim Collins — Good to Great: Why Some Companies Make the Leap... and Others Don't", "url": "https://www.jimcollins.com"}]
    },
    {
        "id": "good-strategy-bad-strategy-kernel",
        "title": "The Kernel of Good Strategy (Rumelt)",
        "description": "Richard Rumelt demystifies strategy by defining its essential three-part kernel: a Diagnosis that defines the fundamental challenge, a Guiding Policy for dealing with it, and Coherent Actions designed to focus organizational resources.",
        "tags": ["strategy", "focus", "leadership"],
        "resources": [{"label": "Richard Rumelt — Good Strategy/Bad Strategy: The Difference and Why It Matters", "url": "https://goodstrategybadstrategy.com"}]
    },
    {
        "id": "raci-matrix-governance",
        "title": "RACI Matrix for Cross-Functional Governance",
        "description": "Clarifies organizational roles across four dimensions: Responsible (doing the work), Accountable (the single individual answerable for the outcome), Consulted (two-way input), and Informed (one-way progress updates). Eliminates decision bottlenecks.",
        "tags": ["governance", "project-management", "raci"],
        "resources": [{"label": "Project Management Institute — Roles & Responsibilities Matrix", "url": "https://www.pmi.org"}]
    },
    {
        "id": "peter-principle-ceilings",
        "title": "The Peter Principle & Competence Ceilings",
        "description": "Laurence J. Peter observed that employees in a hierarchy tend to be promoted based on success in their current role until they reach their level of incompetence. Prevents over-promoting specialized technical geniuses into administrative roles.",
        "tags": ["org-behavior", "promotions", "management"],
        "resources": [{"label": "Laurence J. Peter — The Peter Principle (William Morrow & Co)", "url": "https://en.wikipedia.org/wiki/Peter_principle"}]
    },
    {
        "id": "power-law-venture-capital",
        "title": "The Power Law of Startup & Venture Returns",
        "description": "Sebastian Mallaby and Peter Thiel observe that venture returns are not normally distributed; a single outperforming investment returns more capital than all other portfolio companies combined. Drives aggressive focus on high-upside asymmetric bets.",
        "tags": ["venture-capital", "power-law", "investing"],
        "resources": [{"label": "Sebastian Mallaby — The Power Law: Venture Capital and the Making of the New Future", "url": "https://www.penguinrandomhouse.com"}]
    },
    {
        "id": "delegation-levels-authority",
        "title": "7 Levels of Delegation & Autonomy",
        "description": "Jurgen Appelo's delegation continuum moves leaders from micro-management to true autonomy: Tell, Sell, Consult, Agree, Advise, Inquire, and Delegate. Provides a gradual trust-building scaffold for empowering reports.",
        "tags": ["leadership", "delegation", "management"],
        "resources": [{"label": "Jurgen Appelo — Management 3.0: Leading Agile Developers", "url": "https://management30.com"}]
    },
    {
        "id": "career-moats-specific-knowledge",
        "title": "Building Career Moats via Specific Knowledge",
        "description": "Naval Ravikant defines specific knowledge as rare, highly contextual domain expertise that cannot be taught in a standard course or outsourced. Combining two or three distinct disciplines creates an unassailable personal competitive advantage.",
        "tags": ["career-moat", "leverage", "personal-growth"],
        "resources": [{"label": "Naval Ravikant — How to Get Rich (Without Getting Lucky)", "url": "https://nav.al"}]
    },
    {
        "id": "moscow-prioritization-method",
        "title": "MoSCoW Prioritization Framework",
        "description": "Categorizes scope for releases into Must have (non-negotiable minimum viable requirement), Should have (important but viable workarounds exist), Could have (nice-to-have if time permits), and Won't have (explicitly deferred for this cycle).",
        "tags": ["agile", "prioritization", "scope-management"],
        "resources": [{"label": "DSDM Consortium — Agile Project Framework: MoSCoW Prioritisation", "url": "https://www.agilebusiness.org"}]
    },
    {
        "id": "value-proposition-canvas",
        "title": "Strategyzer's Value Proposition Canvas",
        "description": "Alexander Osterwalder maps customer profiles (Jobs, Pains, Gains) directly against product offerings (Products & Services, Pain Relievers, Gain Creators). Guarantees that feature backlogs address real customer motivations.",
        "tags": ["product-design", "strategyzer", "customer-value"],
        "resources": [{"label": "Alexander Osterwalder — Value Proposition Design (Wiley)", "url": "https://www.strategyzer.com"}]
    },
    {
        "id": "pirate-metrics-aarrr",
        "title": "Dave McClure's Pirate Metrics (AARRR Funnel)",
        "description": "Deconstructs user lifecycle economics into five measurable conversion milestones: Acquisition (traffic discovery), Activation (first magic moment), Retention (repeat engagement), Referral (advocacy), and Revenue (monetization).",
        "tags": ["growth-marketing", "funnel", "metrics"],
        "resources": [{"label": "Dave McClure — Startup Metrics for Pirates: AARRR! (500 Startups)", "url": "https://500.co"}]
    },
    {
        "id": "framing-effect-persuasion",
        "title": "The Framing Effect in Executive Alignment",
        "description": "Kahneman & Tversky demonstrated that people react differently to choices depending on whether they are framed as losses or gains. High-stakes proposals presented in terms of mitigating existential organizational risks receive faster budget authorization.",
        "tags": ["psychology", "executive-influence", "framing"],
        "resources": [{"label": "Daniel Kahneman — Thinking, Fast and Slow (Farrar, Straus and Giroux)", "url": "https://us.macmillan.com"}]
    },
    {
        "id": "sponsorship-vs-mentorship",
        "title": "Mentorship vs. Sponsorship in Leadership",
        "description": "Sylvia Ann Hewlett clarifies that while mentors give guidance, sponsors use their social capital and influence to advocate for you behind closed doors where promotions and high-visibility project assignments are determined.",
        "tags": ["career-advancement", "sponsorship", "leadership"],
        "resources": [{"label": "Sylvia Ann Hewlett — Forget a Mentor, Find a Sponsor (HBR)", "url": "https://hbr.org"}]
    },
    {
        "id": "lean-startup-bml-loop",
        "title": "Build-Measure-Learn Feedback Loop (Lean Startup)",
        "description": "Eric Ries emphasizes that the goal of a startup is not to build software, but to minimize the total time through the Build-Measure-Learn feedback loop. Releases serve primarily as scientific experiments to validate value hypotheses.",
        "tags": ["lean-startup", "experimentation", "iteration"],
        "resources": [{"label": "Eric Ries — The Lean Startup (Crown Business)", "url": "https://theleanstartup.com"}]
    },
    {
        "id": "iron-triangle-project-management",
        "title": "The Project Management Triangle (Scope, Cost, Time)",
        "description": "The triple constraint states that project quality is constrained by Scope, Budget, and Schedule. Altering one constraint inevitably impacts the other two; leadership cannot fix all three simultaneously without degrading craftsmanship.",
        "tags": ["project-management", "tradeoffs", "quality"],
        "resources": [{"label": "Project Management Institute — PMBOK Guide", "url": "https://www.pmi.org"}]
    },
    {
        "id": "disagree-and-commit-doctrine",
        "title": "Disagree and Commit Leadership Principle",
        "description": "Amazon and Intel principle requiring leaders to vigorously debate decisions while they are open, but once a decision is made, completely commit without second-guessing or passive-aggressive resistance. Unlocks fast execution.",
        "tags": ["amazon", "culture", "alignment"],
        "resources": [{"label": "Jeff Bezos — 2016 Letter to Shareholders", "url": "https://www.aboutamazon.com"}]
    },
    {
        "id": "one-on-one-meeting-architecture",
        "title": "The High-Yield One-on-One Meeting",
        "description": "Ben Horowitz notes that 1-on-1s belong to the report, not the manager. It is the primary forum for surfacing hidden organizational blockers, career growth aspirations, and subtle cultural friction before it manifests as employee attrition.",
        "tags": ["management", "1-on-1", "retention"],
        "resources": [{"label": "Ben Horowitz — The Hard Thing About Hard Things (HarperBusiness)", "url": "https://a16z.com"}]
    },
    {
        "id": "comparative-advantage-specialization",
        "title": "David Ricardo's Comparative Advantage in Team Roles",
        "description": "Even if a senior executive is faster at drafting documentation than an intern, their comparative advantage is in executive negotiation. Delegating tasks where your relative efficiency advantage is smallest maximizes total organizational output.",
        "tags": ["economics", "delegation", "leverage"],
        "resources": [{"label": "David Ricardo — On the Principles of Political Economy and Taxation (1817)", "url": "https://en.wikipedia.org/wiki/Comparative_advantage"}]
    },
    {
        "id": "principle-of-charity-discourse",
        "title": "The Principle of Charity in Technical Debates",
        "description": "Methodological principle of philosophy: when critiquing an opponent's design proposal, interpret it in its strongest, most plausible form before attempting a rebuttal. Eliminates strawman arguments and establishes intellectual rigor.",
        "tags": ["critical-thinking", "debates", "collaboration"],
        "resources": [{"label": "Donald Davidson — Inquiries into Truth and Interpretation (Oxford)", "url": "https://global.oup.com"}]
    },
    {
        "id": "opportunity-cost-capital-allocation",
        "title": "Opportunity Cost in Engineering Roadmap Allocation",
        "description": "The true cost of building any engineering feature is not the developer salaries, but the value of the next-best initiative that could not be built simultaneously. Ruthlessly prevents low-yield vanity projects from entering the pipeline.",
        "tags": ["strategy", "opportunity-cost", "product-management"],
        "resources": [{"label": "Henry Hazlitt — Economics in One Lesson", "url": "https://mises.org"}]
    }
]

for t in career_strategy_topics:
    tid = t['id']
    if tid not in seen_ids and t['title'].lower() not in seen_titles:
        seen_ids.add(tid)
        seen_titles.add(t['title'].lower())
        all_topics.append({
            'id': tid,
            'group_name': 'money-career',
            'category': 'career-strategy',
            'tags': t['tags'],
            'title': t['title'],
            'description': t['description'],
            'resources': t['resources']
        })

print(f"Added Career Strategy topics. Total topics: {len(all_topics)}")

# ── 3. NEW CATEGORY: world-ideas::science-nature (45 topics) ──
science_nature_topics = [
    {
        "id": "entropy-second-law-thermodynamics",
        "title": "Entropy & The Second Law of Thermodynamics",
        "description": "In any isolated system, total entropy (disorder or informational microstates) must increase over time, defining the thermodynamic arrow of time. Living organisms maintain local order only by continuously dissipating heat and increasing entropy in their surrounding environment.",
        "tags": ["physics", "thermodynamics", "entropy"],
        "resources": [{"label": "Rudolf Clausius — The Mechanical Theory of Heat (1867)", "url": "https://en.wikipedia.org/wiki/Second_law_of_thermodynamics"}]
    },
    {
        "id": "wave-particle-duality-double-slit",
        "title": "Wave-Particle Duality & The Double-Slit Experiment",
        "description": "Thomas Young's experiment and subsequent quantum formulations showed that particles like electrons exhibit wave interference patterns when unobserved, yet collapse to localized point impacts upon detector measurement.",
        "tags": ["quantum-mechanics", "physics", "experiments"],
        "resources": [{"label": "Richard Feynman — The Character of Physical Law (MIT Press)", "url": "https://mitpress.mit.edu"}]
    },
    {
        "id": "quantum-entanglement-bell-theorem",
        "title": "Quantum Entanglement & Bell's Theorem",
        "description": "John Stewart Bell mathematically proved that no local hidden variable theory can reproduce the quantum mechanical predictions of entangled states, definitively confirming that quantum mechanics violates local realism (spooky action at a distance).",
        "tags": ["quantum-physics", "bells-theorem", "entanglement"],
        "resources": [{"label": "John S. Bell — Speakable and Unspeakable in Quantum Mechanics (Cambridge)", "url": "https://www.cambridge.org"}]
    },
    {
        "id": "crispr-cas9-gene-editing",
        "title": "CRISPR-Cas9 & Bacterial Adaptive Immunity",
        "description": "Discovered by Jennifer Doudna and Emmanuelle Charpentier as an ancient bacterial immune mechanism against phages, CRISPR uses guide RNA sequences to direct the Cas9 endonuclease to introduce precise double-strand DNA cuts for genomic editing.",
        "tags": ["biology", "crispr", "genetics"],
        "resources": [{"label": "Doudna & Charpentier — A Programmable Dual-RNA-Guided DNA Endonuclease in Adaptive Bacterial Immunity (Science 2012)", "url": "https://www.science.org/doi/10.1126/science.1225829"}]
    },
    {
        "id": "central-dogma-molecular-biology",
        "title": "The Central Dogma of Molecular Biology",
        "description": "Francis Crick formalized the fundamental direction of genetic information flow in biological systems: DNA is transcribed into messenger RNA (mRNA), which is translated into functional proteins. Information cannot transfer back from protein to nucleic acid.",
        "tags": ["genetics", "molecular-biology", "dna"],
        "resources": [{"label": "Francis Crick — Central Dogma of Molecular Biology (Nature 1970)", "url": "https://www.nature.com/articles/227561a0"}]
    },
    {
        "id": "natural-selection-genetic-drift",
        "title": "Natural Selection vs. Sewall Wright's Genetic Drift",
        "description": "While natural selection preserves adaptive phenotypic variations that improve reproductive fitness, genetic drift causes neutral or deleterious allele frequencies to fluctuate purely by random sampling errors, especially in small populations.",
        "tags": ["evolution", "biology", "genetics"],
        "resources": [{"label": "Sewall Wright — Evolution in Mendelian Populations (Genetics 1931)", "url": "https://www.genetics.org"}]
    },
    {
        "id": "neuroplasticity-synaptic-pruning",
        "title": "Neuroplasticity & Hebbian Synaptic Pruning",
        "description": "Donald Hebb's postulate that 'neurons that fire together, wire together' explains synaptic plasticity. Long-Term Potentiation (LTP) strengthens active synapses, while microglial cells actively prune unused neural connections throughout development.",
        "tags": ["neuroscience", "brain", "plasticity"],
        "resources": [{"label": "Donald Hebb — The Organization of Behavior (1949)", "url": "https://en.wikipedia.org/wiki/Hebbian_theory"}]
    },
    {
        "id": "blood-brain-barrier-pharmacology",
        "title": "The Blood-Brain Barrier & Pharmacokinetics",
        "description": "Specialized brain capillary endothelial cells connected by tight junctions and astrocyte foot processes strictly filter solutes from entering the central nervous system. Only small, highly lipid-soluble molecules or specific receptor ligands can cross.",
        "tags": ["neuroscience", "medicine", "physiology"],
        "resources": [{"label": "Abbott et al. — Structure and Function of the Blood-Brain Barrier (Neurobiology of Disease)", "url": "https://www.sciencedirect.com"}]
    },
    {
        "id": "cellular-respiration-atp-synthase",
        "title": "Cellular Respiration & The ATP Synthase Rotor",
        "description": "Through glycolysis, the Krebs cycle, and the mitochondrial electron transport chain, cells establish a proton gradient across the inner mitochondrial membrane that physically rotates ATP Synthase to generate adenosine triphosphate (ATP).",
        "tags": ["biochemistry", "cellular-biology", "energy"],
        "resources": [{"label": "Peter Mitchell — Chemiosmotic Hypothesis (Nobel Prize in Chemistry 1978)", "url": "https://www.nobelprize.org"}]
    },
    {
        "id": "photosynthesis-calvin-cycle",
        "title": "Photosynthesis: Light Reactions & The Calvin Cycle",
        "description": "Chloroplasts capture photons via chlorophyll pigments to split water molecules (photolysis) and produce ATP and NADPH. The enzyme RuBisCO then fixes atmospheric carbon dioxide into glucose during the light-independent Calvin cycle.",
        "tags": ["botany", "biochemistry", "photosynthesis"],
        "resources": [{"label": "Melvin Calvin — The Path of Carbon in Photosynthesis (Nobel Lecture 1961)", "url": "https://www.nobelprize.org"}]
    },
    {
        "id": "plate-tectonics-wilson-cycle",
        "title": "Plate Tectonics & The Wilson Supercontinent Cycle",
        "description": "The Earth's lithosphere is divided into rigid tectonic plates that float on the convective asthenosphere. J. Tuzo Wilson's cycle shows that supercontinents assemble, rift apart, form ocean basins, and reassemble over ~300–500 million year periods.",
        "tags": ["geology", "earth-science", "plate-tectonics"],
        "resources": [{"label": "J. Tuzo Wilson — Did the Atlantic Close and then Re-Open? (Nature 1966)", "url": "https://www.nature.com"}]
    },
    {
        "id": "fermi-paradox-great-filter",
        "title": "The Fermi Paradox & Robin Hanson's Great Filter",
        "description": "Enrico Fermi asked: with billions of stars and planets older than our solar system, where is everyone? Robin Hanson proposed the Great Filter: an evolutionary or technological barrier so extraordinarily difficult that almost no species survives past it.",
        "tags": ["astrobiology", "cosmology", "fermi-paradox"],
        "resources": [{"label": "Robin Hanson — The Great Filter: Are We Almost Past It? (1998)", "url": "https://mason.gmu.edu/~rhanson/greatfilter.html"}]
    },
    {
        "id": "general-relativity-spacetime-curvature",
        "title": "General Relativity: Spacetime Curvature & Geodesics",
        "description": "Albert Einstein replaced Newtonian gravitational action-at-a-distance with Riemannian geometry: mass and energy warp the fabric of 4D spacetime, and freely falling objects follow natural curved trajectories called geodesics.",
        "tags": ["physics", "relativity", "gravity"],
        "resources": [{"label": "Albert Einstein — The Foundation of the General Theory of Relativity (Annalen der Physik 1916)", "url": "https://einsteinpapers.press.princeton.edu"}]
    },
    {
        "id": "special-relativity-time-dilation",
        "title": "Special Relativity: Time Dilation & Lorentz Contraction",
        "description": "Because the speed of light in a vacuum (c) is constant for all inertial observers, time dilates and lengths contract for objects traveling at relativistic speeds relative to a stationary observer, uniting space and time into Minkowski spacetime.",
        "tags": ["physics", "relativity", "einstein"],
        "resources": [{"label": "Albert Einstein — On the Electrodynamics of Moving Bodies (1905)", "url": "https://einsteinpapers.press.princeton.edu"}]
    },
    {
        "id": "black-hole-thermodynamics-hawking",
        "title": "Black Hole Thermodynamics & Hawking Radiation",
        "description": "Stephen Hawking combined quantum field theory with general relativity to show that black holes emit thermal radiation due to virtual particle-antiparticle pair production at the event horizon, eventually causing black holes to evaporate over cosmic epochs.",
        "tags": ["black-holes", "astrophysics", "hawking"],
        "resources": [{"label": "Stephen W. Hawking — Particle Creation by Black Holes (Communications in Mathematical Physics 1975)", "url": "https://projecteuclid.org"}]
    },
    {
        "id": "cosmic-microwave-background-big-bang",
        "title": "The Cosmic Microwave Background (CMB) Radiation",
        "description": "Discovered by Penzias and Wilson in 1965, the CMB is the thermal relic radiation from the epoch of recombination (~380,000 years post Big Bang) when the universe cooled sufficiently for protons and electrons to form neutral hydrogen.",
        "tags": ["cosmology", "big-bang", "astronomy"],
        "resources": [{"label": "Arno Penzias & Robert Wilson — A Measurement of Excess Antenna Temperature (Astrophysical Journal 1965)", "url": "https://iopscience.iop.org"}]
    },
    {
        "id": "dark-matter-rotation-curves",
        "title": "Dark Matter & Galactic Rotation Curves",
        "description": "Vera Rubin's observations of spiral galaxy rotation curves revealed that outer stars orbit at velocities far exceeding predictions from visible baryonic mass, providing decisive evidence for an invisible halo of non-baryonic dark matter.",
        "tags": ["astrophysics", "dark-matter", "astronomy"],
        "resources": [{"label": "Vera C. Rubin & W. Kent Ford — Rotation of the Andromeda Nebula from a Spectroscopic Survey (1970)", "url": "https://iopscience.iop.org"}]
    },
    {
        "id": "dark-energy-accelerating-universe",
        "title": "Dark Energy & The Accelerating Cosmic Expansion",
        "description": "Observations of Type Ia supernovae in 1998 showed that cosmic expansion is accelerating rather than decelerating under gravity, driven by dark energy (represented by Einstein's cosmological constant) comprising ~68% of the universe's total energy density.",
        "tags": ["cosmology", "dark-energy", "supernovae"],
        "resources": [{"label": "Perlmutter, Schmidt & Riess — Discovery of Accelerating Universe (Nobel Prize in Physics 2011)", "url": "https://www.nobelprize.org"}]
    },
    {
        "id": "standard-model-particle-physics",
        "title": "The Standard Model of Particle Physics",
        "description": "The gauge theory describing fundamental constituents of matter (6 quarks, 6 leptons) and three of the four fundamental forces mediated by vector bosons (gluons, W/Z bosons, photons), unified by the scalar Higgs boson field.",
        "tags": ["particle-physics", "quantum-mechanics", "standard-model"],
        "resources": [{"label": "CERN — The Standard Model of Particle Physics", "url": "https://home.cern/science/physics/standard-model"}]
    },
    {
        "id": "higgs-boson-symmetry-breaking",
        "title": "The Higgs Mechanism & Electroweak Symmetry Breaking",
        "description": "Peter Higgs and collaborators showed that fundamental particles acquire mass through interactions with a non-zero vacuum expectation value of the scalar Higgs field, confirmed experimentally at CERN's Large Hadron Collider in 2012.",
        "tags": ["higgs-boson", "cern", "physics"],
        "resources": [{"label": "Peter Higgs — Broken Symmetries and the Masses of Gauge Bosons (Phys. Rev. Lett. 1964)", "url": "https://journals.aps.org"}]
    },
    {
        "id": "chaos-theory-lorenz-attractor",
        "title": "Chaos Theory & The Butterfly Effect",
        "description": "Edward Lorenz's computational weather models revealed deterministic chaos: non-linear dynamical systems exhibit sensitive dependence on initial conditions. Small perturbations in early state variables cascade into completely unpredictable trajectories.",
        "tags": ["chaos-theory", "complexity", "mathematics"],
        "resources": [{"label": "Edward N. Lorenz — Deterministic Nonperiodic Flow (Journal of the Atmospheric Sciences 1963)", "url": "https://journals.ametsoc.org"}]
    },
    {
        "id": "cellular-automata-conway",
        "title": "Cellular Automata & Conway's Game of Life",
        "description": "John Conway proved that a simple two-dimensional grid governed by four elementary local neighbor rules can produce complex emergent behaviors, self-replicating gliders, and universal Turing completeness.",
        "tags": ["computation", "cellular-automata", "emergence"],
        "resources": [{"label": "Martin Gardner — Mathematical Games: The fantastic combinations of John Conway's new game of 'life' (1970)", "url": "https://www.scientificamerican.com"}]
    },
    {
        "id": "epigenetics-dna-methylation",
        "title": "Epigenetics: DNA Methylation & Histone Modification",
        "description": "Heritable changes in gene expression that do not alter the underlying nucleotide sequence. Methyl groups attached to CpG islands and histone acetylation turn genes on or off in response to environmental conditions and cell differentiation.",
        "tags": ["epigenetics", "genetics", "biology"],
        "resources": [{"label": "Adrian Bird — DNA Methylation Patterns and Epigenetic Memory (Genes & Development 2002)", "url": "https://genesdev.cshlp.org"}]
    },
    {
        "id": "telomeres-hayflick-limit",
        "title": "Telomeres & Leonard Hayflick's Replicative Limit",
        "description": "Telomeres are repetitive nucleotide caps at the ends of linear chromosomes that protect genomic integrity. Because DNA polymerase cannot fully replicate chromosome ends (end-replication problem), somatic cells can divide only ~50 times before entering senescence.",
        "tags": ["cellular-biology", "aging", "genetics"],
        "resources": [{"label": "Leonard Hayflick — The Serial Cultivation of Human Diploid Cell Strains (1961)", "url": "https://www.sciencedirect.com"}]
    },
    {
        "id": "innate-vs-adaptive-immunity",
        "title": "The Dual Immune Architecture: Innate vs. Adaptive",
        "description": "Innate immunity provides rapid, non-specific anatomical barriers, phagocytes, and complement cascades. Adaptive immunity utilizes T cells and antibody-secreting B cells to construct hyper-targeted immunological memory against specific pathogens.",
        "tags": ["immunology", "medicine", "biology"],
        "resources": [{"label": "Janeway's Immunobiology (Garland Science)", "url": "https://www.ncbi.nlm.nih.gov/books/NBK10757/"}]
    },
    {
        "id": "prions-protein-misfolding",
        "title": "Prions & The Protein-Only Infectious Hypothesis",
        "description": "Stanley Prusiner demonstrated that transmissible spongiform encephalopathies (like Creutzfeldt-Jakob and Mad Cow Disease) are caused not by viruses or bacteria, but by infectious misfolded proteins that catalyze normal cellular proteins into amyloid fibrils.",
        "tags": ["biochemistry", "pathology", "prions"],
        "resources": [{"label": "Stanley B. Prusiner — Novel Proteinaceous Infectious Particles Cause Scrapie (Science 1982)", "url": "https://www.science.org"}]
    },
    {
        "id": "anthropocene-sixth-extinction",
        "title": "The Anthropocene & The Sixth Mass Extinction",
        "description": "Geological and ecological epoch defined by dominant human atmospheric and biological disruption. Background extinction rates currently exceed historical fossil averages by 100 to 1,000 times due to habitat fragmentation, ocean acidification, and carbon emissions.",
        "tags": ["ecology", "climate", "geology"],
        "resources": [{"label": "Paul Crutzen & Eugene Stoermer — The 'Anthropocene' (IGBP Newsletter 2000)", "url": "https://www.igbp.net"}]
    },
    {
        "id": "exoplanet-detection-methods",
        "title": "Exoplanet Detection: Transit Photometry & Radial Velocity",
        "description": "Astronomers discover planets orbiting distant stars via Transit Photometry (measuring minute dips in starlight as an exoplanet transits the stellar disc) and Radial Velocity (detecting Doppler shifts in stellar spectral lines from gravitational wobbling).",
        "tags": ["astronomy", "exoplanets", "kepler"],
        "resources": [{"label": "NASA Exoplanet Exploration Program", "url": "https://exoplanets.nasa.gov"}]
    },
    {
        "id": "stellar-nucleosynthesis-fusion",
        "title": "Stellar Nucleosynthesis & The Origin of Elements",
        "description": "Stars fuse hydrogen into helium via the proton-proton chain and CNO cycle. In massive stars, nucleosynthesis progresses through carbon, oxygen, neon, and silicon fusion up to iron-56, where nuclear fusion ceases to yield net energy.",
        "tags": ["astrophysics", "nuclear-physics", "stars"],
        "resources": [{"label": "Burbidge, Burbidge, Fowler & Hoyle — Synthesis of the Elements in Stars (Reviews of Modern Physics 1957)", "url": "https://journals.aps.org"}]
    },
    {
        "id": "supernovae-r-process-elements",
        "title": "Supernovae, Neutron Star Mergers & The R-Process",
        "description": "Elements heavier than iron (gold, platinum, uranium) cannot form through standard stellar fusion; they are forged via rapid neutron capture (the r-process) during core-collapse supernovae and colliding neutron star kilonova mergers.",
        "tags": ["astrophysics", "elements", "kilonova"],
        "resources": [{"label": "Abbott et al. — Multi-messenger Observations of a Binary Neutron Star Merger (Astrophysical Journal Letters 2017)", "url": "https://iopscience.iop.org"}]
    },
    {
        "id": "great-oxidation-event-cyanobacteria",
        "title": "The Great Oxidation Event & Cyanobacteria",
        "description": "Approximately 2.4 billion years ago, photosynthetic cyanobacteria produced free oxygen that saturated mineral sinks and oxygenated the atmosphere. This triggered the Huronian glaciation and mass extinction of obligate anaerobic organisms while enabling complex aerobic life.",
        "tags": ["earth-history", "evolution", "geobiology"],
        "resources": [{"label": "Heinrich Holland — The Oxygenation of the Atmosphere and Oceans (Phil. Trans. R. Soc. B 2006)", "url": "https://royalsocietypublishing.org"}]
    },
    {
        "id": "endosymbiotic-theory-margulis",
        "title": "Endosymbiotic Theory & Eukaryotic Origins",
        "description": "Lynn Margulis proved that mitochondria and chloroplasts originated as free-living prokaryotic bacteria that were engulfed by ancestral host cells, forming an obligate endosymbiotic relationship that gave rise to all complex eukaryotic life.",
        "tags": ["evolutionary-biology", "eukaryotes", "mitochondria"],
        "resources": [{"label": "Lynn Margulis — Origin of Eukaryotic Cells (Yale University Press 1970)", "url": "https://yalebooks.yale.edu"}]
    },
    {
        "id": "cambrian-explosion-radiation",
        "title": "The Cambrian Explosion & Morphological Radiation",
        "description": "Occurring ~541 million years ago, a geologically brief period of 20–25 million years saw the sudden appearance of nearly all major modern animal phyla in the fossil record, driven by escalating predator-prey arms races, eye evolution, and rising oxygen levels.",
        "tags": ["paleontology", "evolution", "cambrian"],
        "resources": [{"label": "Stephen Jay Gould — Wonderful Life: The Burgess Shale and the Nature of History", "url": "https://wwnorton.com"}]
    },
    {
        "id": "hardy-weinberg-equilibrium",
        "title": "The Hardy-Weinberg Principle of Population Genetics",
        "description": "States that allele and genotype frequencies in a population remain constant across generations in the absence of evolutionary influences (no mutation, no migration, random mating, infinite population size, and no natural selection).",
        "tags": ["genetics", "population-genetics", "biology"],
        "resources": [{"label": "G. H. Hardy — Mendelian Proportions in a Mixed Population (Science 1908)", "url": "https://www.science.org"}]
    },
    {
        "id": "quantum-chromodynamics-gluons",
        "title": "Quantum Chromodynamics & Asymptotic Freedom",
        "description": "David Gross, Frank Wilczek, and David Politzer demonstrated that the strong nuclear force binding quarks via gluons becomes paradoxically weaker at extremely short distances or high energies (asymptotic freedom), but infinitely strong as quarks separate (color confinement).",
        "tags": ["particle-physics", "qcd", "quarks"],
        "resources": [{"label": "Gross & Wilczek — Ultraviolet Behavior of Non-Abelian Gauge Theories (1973)", "url": "https://journals.aps.org"}]
    },
    {
        "id": "superconductivity-bcs-theory",
        "title": "BCS Theory of Superconductivity",
        "description": "John Bardeen, Leon Cooper, and John Robert Schrieffer explained that at near-absolute zero temperatures, electron-phonon interactions cause electrons to pair into Cooper pairs that act as bosons, condensing into a zero-electrical-resistance superfluid.",
        "tags": ["condensed-matter", "superconductivity", "physics"],
        "resources": [{"label": "Bardeen, Cooper & Schrieffer — Theory of Superconductivity (Physical Review 1957)", "url": "https://journals.aps.org"}]
    },
    {
        "id": "photovoltaic-effect-bandgaps",
        "title": "The Photovoltaic Effect & Semiconductor Bandgaps",
        "description": "Edmond Becquerel discovered and Albert Einstein explained the mechanism whereby photons with energy exceeding a semiconductor's bandgap excite electrons from the valence band to the conduction band, generating an electric current across a p-n junction.",
        "tags": ["clean-energy", "physics", "solar"],
        "resources": [{"label": "Albert Einstein — Concerning an Heuristic Point of View Toward the Emission and Transformation of Light (1905)", "url": "https://einsteinpapers.press.princeton.edu"}]
    },
    {
        "id": "gravitational-waves-ligo",
        "title": "Gravitational Waves & Laser Interferometry",
        "description": "Predicted by Einstein in 1916 and detected by LIGO in 2015, gravitational waves are ripples in spacetime generated by cataclysmic accelerating cosmic masses (like colliding black holes), measured using kilometer-scale laser interferometers to within 1/10,000th the width of a proton.",
        "tags": ["ligo", "gravitational-waves", "astrophysics"],
        "resources": [{"label": "B. P. Abbott et al. — Observation of Gravitational Waves from a Binary Black Hole Merger (Phys. Rev. Lett. 2016)", "url": "https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.116.061102"}]
    },
    {
        "id": "schrodinger-what-is-life-negentropy",
        "title": "Negative Entropy & Erwin Schrödinger's What is Life?",
        "description": "In 1944, physicist Erwin Schrödinger introduced the concept that living organisms maintain self-organization by constantly drawing negative entropy from their environment, and correctly anticipated that genetic inheritance is encoded in an 'aperiodic crystal' (DNA).",
        "tags": ["biophysics", "thermodynamics", "origin-of-life"],
        "resources": [{"label": "Erwin Schrödinger — What is Life? The Physical Aspect of the Living Cell (Cambridge)", "url": "https://www.cambridge.org"}]
    },
    {
        "id": "miller-urey-abiogenesis",
        "title": "The Miller-Urey Experiment & Prebiotic Chemistry",
        "description": "Stanley Miller and Harold Urey stimulated primordial Earth atmospheric conditions (water, methane, ammonia, and hydrogen) with electric discharges, yielding spontaneous formation of over 20 amino acids and demonstrating the plausibility of abiogenesis.",
        "tags": ["abiogenesis", "biochemistry", "origin-of-life"],
        "resources": [{"label": "Stanley L. Miller — A Production of Amino Acids Under Possible Primitive Earth Conditions (Science 1953)", "url": "https://www.science.org"}]
    },
    {
        "id": "mendelian-genetics-laws",
        "title": "Mendelian Genetics: Segregation & Independent Assortment",
        "description": "Gregor Mendel's hybridization experiments with pea plants established particulate inheritance, disproving blending inheritance through the Law of Segregation (alleles separate during gamete formation) and the Law of Independent Assortment.",
        "tags": ["genetics", "biology", "mendel"],
        "resources": [{"label": "Gregor Mendel — Experiments in Plant Hybridization (1866)", "url": "https://www.mendelweb.org"}]
    },
    {
        "id": "drake-equation-seti",
        "title": "The Drake Equation for Extraterrestrial Intelligence",
        "description": "Frank Drake framed the probabilistic argument estimating the number of active, communicative extraterrestrial civilizations in the Milky Way by multiplying stellar formation rates, planetary fractions, habitable zones, and civilization lifespans.",
        "tags": ["seti", "astrobiology", "astronomy"],
        "resources": [{"label": "Frank Drake — Project Ozma and the Drake Equation (1961)", "url": "https://www.seti.org/drake-equation"}]
    },
    {
        "id": "hubble-lemaltre-law",
        "title": "Hubble-Lemaître Law & Cosmic Metric Expansion",
        "description": "Edwin Hubble and Georges Lemaître demonstrated that the recessional velocity of distant galaxies is directly proportional to their distance from Earth, confirming that spacetime itself is uniformly expanding in all directions.",
        "tags": ["cosmology", "astronomy", "big-bang"],
        "resources": [{"label": "Edwin Hubble — A Relation between Distance and Radial Velocity among Extra-Galactic Nebulae (PNAS 1929)", "url": "https://www.pnas.org"}]
    },
    {
        "id": "cno-cycle-nucleosynthesis",
        "title": "The Carbon-Nitrogen-Oxygen (CNO) Fusion Cycle",
        "description": "Proposed by Hans Bethe and Carl Friedrich von Weizsäcker, the CNO cycle is the dominant catalytic nuclear fusion mechanism in stars heavier than 1.3 solar masses, converting hydrogen into helium using carbon, nitrogen, and oxygen nuclei as catalysts.",
        "tags": ["astrophysics", "nuclear-physics", "stars"],
        "resources": [{"label": "Hans Bethe — Energy Production in Stars (Physical Review 1939)", "url": "https://journals.aps.org"}]
    },
    {
        "id": "mitochondrial-eve-coalescence",
        "title": "Mitochondrial Eve & Coalescence Theory",
        "description": "Cann, Stoneking, and Wilson analyzed mitochondrial DNA (mtDNA) inherited strictly through the maternal lineage to date the most recent common matrilineal ancestor of all living humans to approximately 150,000–200,000 years ago in East Africa.",
        "tags": ["genetics", "anthropology", "evolution"],
        "resources": [{"label": "Cann, Stoneking & Wilson — Mitochondrial DNA and Human Evolution (Nature 1987)", "url": "https://www.nature.com"}]
    }
]

for t in science_nature_topics:
    tid = t['id']
    if tid not in seen_ids and t['title'].lower() not in seen_titles:
        seen_ids.add(tid)
        seen_titles.add(t['title'].lower())
        all_topics.append({
            'id': tid,
            'group_name': 'world-ideas',
            'category': 'science-nature',
            'tags': t['tags'],
            'title': t['title'],
            'description': t['description'],
            'resources': t['resources']
        })

print(f"Added Science & Nature topics. Total topics: {len(all_topics)}")

# ── 4. NEW CATEGORY: world-ideas::history-innovation (45 topics) ──
history_innovation_topics = [
    {
        "id": "gutenberg-printing-press",
        "title": "The Gutenberg Movable Type Press & The Information Explosion",
        "description": "Johannes Gutenberg's 1440 invention combined movable metal type, oil-based ink, and a wooden screw press, collapsing book manufacturing costs by 99% and catalyzing the scientific revolution, public literacy, and the Protestant Reformation.",
        "tags": ["history", "printing", "innovation"],
        "resources": [{"label": "Elizabeth Eisenstein — The Printing Press as an Agent of Change (Cambridge)", "url": "https://www.cambridge.org"}]
    },
    {
        "id": "watt-steam-engine-industrialization",
        "title": "James Watt's Separate Condenser & The Steam Age",
        "description": "By introducing a separate condensing vessel in 1769, James Watt eliminated the continuous heating and cooling cycles of Newcomen engines, multiplying fuel efficiency by 4x and freeing manufacturing from geographic dependency on watermills.",
        "tags": ["industrial-revolution", "energy", "mechanics"],
        "resources": [{"label": "H. W. Dickinson — A Short History of the Steam Engine (Cambridge)", "url": "https://www.cambridge.org"}]
    },
    {
        "id": "bessemer-steel-process",
        "title": "The Bessemer Process & Mass Structural Steel",
        "description": "Henry Bessemer's 1856 converter blew air through molten pig iron to oxidize impurities through exothermic reactions, slashing steel manufacturing time from weeks to 20 minutes and enabling transcontinental railways, skyscrapers, and industrial civil infrastructure.",
        "tags": ["materials", "steel", "industrial-revolution"],
        "resources": [{"label": "Henry Bessemer — Sir Henry Bessemer: An Autobiography", "url": "https://archive.org"}]
    },
    {
        "id": "bell-labs-transistor-1947",
        "title": "The Point-Contact Transistor at Bell Labs (1947)",
        "description": "John Bardeen, Walter Brattain, and William Shockley invented the solid-state semiconductor amplifier, replacing fragile, power-hungry vacuum tubes and laying the foundation for modern microprocessors, digital computing, and global communications.",
        "tags": ["semiconductors", "computing", "bell-labs"],
        "resources": [{"label": "Michael Riordan & Lillian Hoddeson — Crystal Fire: The Invention of the Transistor", "url": "https://wwnorton.com"}]
    },
    {
        "id": "haber-bosch-nitrogen-fixation",
        "title": "The Haber-Bosch Process & Synthetic Fertilizers",
        "description": "Fritz Haber and Carl Bosch developed high-pressure catalytic synthesis to fix atmospheric dinitrogen (N2) into ammonia (NH3). Synthetic nitrogen fertilizer supports over 50% of the modern human population's food supply, revolutionizing global agrarian carrying capacity.",
        "tags": ["chemistry", "agriculture", "haber-bosch"],
        "resources": [{"label": "Vaclav Smil — Enriching the Earth: Fritz Haber, Carl Bosch, and the Transformation of World Food Production (MIT Press)", "url": "https://mitpress.mit.edu"}]
    },
    {
        "id": "morse-telegraph-instant-communication",
        "title": "The Electric Telegraph & The Annihilation of Space",
        "description": "Samuel Morse's 1844 electromagnetic telegraph decoupled information velocity from physical transportation for the first time in human history, enabling synchronized financial markets, unified military command, and global journalistic news agencies.",
        "tags": ["telecommunications", "telegraph", "information-age"],
        "resources": [{"label": "Tom Standage — The Victorian Internet: The Remarkable Story of the Telegraph", "url": "https://www.bloomsbury.com"}]
    },
    {
        "id": "double-entry-bookkeeping-pacioli",
        "title": "Luca Pacioli & Double-Entry Bookkeeping (1494)",
        "description": "Franciscan friar Luca Pacioli documented the Venetian accounting method of balancing debits against credits. Providing a continuous, mathematical ledger of enterprise solvency, it became the accounting bedrock of modern merchant capitalism and corporate governance.",
        "tags": ["finance", "capitalism", "accounting"],
        "resources": [{"label": "Luca Pacioli — Summa de arithmetica, geometria, proportioni et proportionalita (1494)", "url": "https://en.wikipedia.org/wiki/Luca_Pacioli"}]
    },
    {
        "id": "bretton-woods-monetary-order",
        "title": "The Bretton Woods Agreement & Modern Monetary Architecture",
        "description": "In 1944, delegates from 44 Allied nations met in New Hampshire to establish the post-WWII economic architecture: the IMF, the World Bank, and an exchange rate regime pegging global currencies to the US dollar backed by gold.",
        "tags": ["economics", "monetary-policy", "history"],
        "resources": [{"label": "Benn Steil — The Battle of Bretton Woods: John Maynard Keynes, Harry Dexter White, and the Making of a New World Order", "url": "https://press.princeton.edu"}]
    },
    {
        "id": "silk-road-economic-diffusion",
        "title": "The Silk Road & Ancient Eurasian Globalization",
        "description": "A transcontinental network of Eurasian trade corridors connecting Han China to the Mediterranean. It facilitated not only luxury commodity exchange (silk, spices, glass), but the profound transmission of paper, gunpowder, mathematics, and pandemic pathogens.",
        "tags": ["world-history", "trade", "globalization"],
        "resources": [{"label": "Peter Frankopan — The Silk Roads: A New History of the World", "url": "https://www.bloomsbury.com"}]
    },
    {
        "id": "fleming-penicillin-antibiotic-era",
        "title": "Alexander Fleming & The Penicillin Revolution",
        "description": "Fleming's 1928 discovery of Penicillium notatum mold lysing staphylococcus colonies, scaled by Florey and Chain, inaugurated the antibiotic era, transforming bacterial infections from leading causes of human mortality into curable clinical conditions.",
        "tags": ["medicine", "antibiotics", "pharmacology"],
        "resources": [{"label": "Alexander Fleming — On the Antibacterial Action of Cultures of a Penicillium (1929)", "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2048009/"}]
    },
    {
        "id": "germ-theory-pasteur-koch",
        "title": "The Germ Theory of Disease (Pasteur & Koch)",
        "description": "Louis Pasteur and Robert Koch definitively overthrew the ancient miasma theory of foul air by demonstrating that specific microscopic pathogens cause specific infectious diseases, establishing sterile antiseptic surgical protocols and bacteriological water sanitation.",
        "tags": ["medicine", "public-health", "microbiology"],
        "resources": [{"label": "Robert Koch — The Etiology of Anthrax (1876)", "url": "https://en.wikipedia.org/wiki/Germ_theory_of_disease"}]
    },
    {
        "id": "james-lind-scurvy-trials",
        "title": "James Lind, Scurvy & The Birth of Clinical Trials (1747)",
        "description": "Royal Navy physician James Lind conducted the first documented controlled prospective clinical trial on HMS Salisbury, treating six pairs of scorbutic sailors with different diets and proving conclusively that citrus fruits cure and prevent scurvy.",
        "tags": ["clinical-trials", "evidence-based-medicine", "history"],
        "resources": [{"label": "James Lind — A Treatise of the Scurvy (1753)", "url": "https://archive.org"}]
    },
    {
        "id": "brahmagupta-zero-decimal-system",
        "title": "Brahmagupta & The Indian Positional Decimal System",
        "description": "In 628 CE, mathematician Brahmagupta in the Brahmasphutasiddhanta established the rules for arithmetic computation with zero (shunya) and negative numbers, creating the positional base-10 numerical system later transmitted to Europe via Al-Khwarizmi.",
        "tags": ["mathematics", "history-of-science", "india"],
        "resources": [{"label": "Brahmagupta — Brahmasphutasiddhanta (628 CE)", "url": "https://en.wikipedia.org/wiki/Brahmasphutasiddhanta"}]
    },
    {
        "id": "turing-enigma-bletchley-cryptanalysis",
        "title": "Alan Turing, The Bombe & Cryptanalysis at Bletchley",
        "description": "Alan Turing designed the electromechanical 'Bombe' to systematically eliminate impossible rotor combinations of the German Enigma cipher machine, shortening World War II by years and establishing foundational theoretical foundations of algorithmic computation.",
        "tags": ["cryptography", "computing", "turing"],
        "resources": [{"label": "Andrew Hodges — Alan Turing: The Enigma (Princeton University Press)", "url": "https://press.princeton.edu"}]
    },
    {
        "id": "arpanet-packet-switching",
        "title": "ARPANET & The Genesis of Packet Switching",
        "description": "Paul Baran and Donald Davies conceived packet switching to route discrete digitized data blocks across distributed, decentralized networks. Deployed on ARPANET in 1969, it replaced vulnerable circuit-switched telecommunications with fault-tolerant IP networking.",
        "tags": ["networking", "internet-history", "arpanet"],
        "resources": [{"label": "Paul Baran — On Distributed Communications (RAND Corporation 1964)", "url": "https://www.rand.org"}]
    },
    {
        "id": "tim-berners-lee-world-wide-web",
        "title": "Tim Berners-Lee & The World Wide Web Protocol",
        "description": "At CERN in 1989, Tim Berners-Lee synthesized hypertext, URIs, and HTTP into the World Wide Web, deciding to release the protocol royalty-free to the global commons, sparking the largest collaborative information explosion in human history.",
        "tags": ["internet", "web-history", "cern"],
        "resources": [{"label": "Tim Berners-Lee — Information Management: A Proposal (CERN 1989)", "url": "https://www.w3.org/History/1989/proposal.html"}]
    },
    {
        "id": "ford-assembly-line-mass-production",
        "title": "Henry Ford's Moving Assembly Line (1913)",
        "description": "By moving car chassis past specialized workstations via automated conveyor belts, Ford reduced Model T assembly time from 12 hours to 93 minutes, simultaneously doubling factory wages to $5/day and creating the modern mass-consumer middle class.",
        "tags": ["manufacturing", "economics", "fordism"],
        "resources": [{"label": "Henry Ford — My Life and Work (Doubleday 1922)", "url": "https://archive.org"}]
    },
    {
        "id": "norman-borlaug-green-revolution",
        "title": "Norman Borlaug & The Green Revolution",
        "description": "Nobel Laureate Norman Borlaug bred semi-dwarf, disease-resistant, high-yield wheat varieties in Mexico, Pakistan, and India. Credited with saving over one billion people from starvation, it transformed developing world agriculture.",
        "tags": ["agriculture", "green-revolution", "public-health"],
        "resources": [{"label": "Norman Borlaug — Nobel Peace Prize Lecture (1970)", "url": "https://www.nobelprize.org"}]
    },
    {
        "id": "shipping-container-intermodal-revolution",
        "title": "Malcolm McLean & The Standard Shipping Container",
        "description": "Malcolm McLean's 1956 introduction of the standardized intermodal steel shipping container collapsed cargo dock-loading costs from $5.86/ton to $0.16/ton, driving a 90% drop in international shipping costs and birthing modern globalized supply chains.",
        "tags": ["logistics", "globalization", "trade"],
        "resources": [{"label": "Marc Levinson — The Box: How the Shipping Container Made the World Smaller and the World Economy Bigger", "url": "https://press.princeton.edu"}]
    },
    {
        "id": "smallpox-eradication-d-a-henderson",
        "title": "Smallpox Eradication: Public Health's Greatest Victory",
        "description": "Led by D.A. Henderson and the World Health Organization through aggressive ring-vaccination and contact tracing, smallpox became the first human disease eradicated from Earth in 1980, having previously claimed over 300 million lives in the 20th century alone.",
        "tags": ["public-health", "vaccines", "eradication"],
        "resources": [{"label": "World Health Organization — The Global Eradication of Smallpox (1980)", "url": "https://www.who.int"}]
    },
    {
        "id": "apollo-guidance-computer-margaret-hamilton",
        "title": "The Apollo Guidance Computer & Real-Time Software",
        "description": "Margaret Hamilton's team at MIT developed the AGC's priority-driven asynchronous executive software. During Apollo 11's lunar descent, the system shed low-priority radar tasks to prioritize thruster control, preventing mission abort minutes before touchdown.",
        "tags": ["software-engineering", "space", "apollo"],
        "resources": [{"label": "Margaret Hamilton — Universal Systems Language and the Apollo Computer", "url": "https://www.nasa.gov"}]
    },
    {
        "id": "ac-dc-war-of-currents",
        "title": "The War of the Currents: Tesla vs. Edison",
        "description": "Nikola Tesla and George Westinghouse championed Alternating Current (AC) using step-up transformers for low-loss high-voltage long-distance transmission, defeating Thomas Edison's low-voltage Direct Current (DC) system that required generating stations every mile.",
        "tags": ["electrification", "energy", "physics"],
        "resources": [{"label": "Jill Jonnes — Empires of Light: Edison, Tesla, Westinghouse, and the Race to Electrify the World", "url": "https://www.penguinrandomhouse.com"}]
    },
    {
        "id": "longitude-problem-john-harrison",
        "title": "John Harrison's Marine Chronometer & The Longitude Problem",
        "description": "While astronomers sought celestial moon tables, self-taught carpenter John Harrison spent 40 years engineering the frictionless, temperature-compensated H4 marine clock, enabling navigators to calculate longitude at sea and preventing catastrophic fleet shipwrecks.",
        "tags": ["navigation", "horology", "inventions"],
        "resources": [{"label": "Dava Sobel — Longitude: The True Story of a Lone Genius Who Solved the Greatest Scientific Problem of His Time", "url": "https://www.bloomsbury.com"}]
    },
    {
        "id": "dutch-east-india-company-voc",
        "title": "The Dutch East India Company (VOC) & Public Equity",
        "description": "Chartered in 1602, the VOC became the world's first publicly traded corporation, introducing limited liability, continuous tradable equity shares, and the Amsterdam Stock Exchange to fund capital-intensive maritime trading fleets.",
        "tags": ["finance", "corporations", "capitalism"],
        "resources": [{"label": "Femme S. Gaastra — The Dutch East India Company: Expansion and Decline", "url": "https://en.wikipedia.org/wiki/Dutch_East_India_Company"}]
    },
    {
        "id": "code-of-hammurabi-jurisprudence",
        "title": "The Code of Hammurabi & Statutory Jurisprudence",
        "description": "Inscribed on a basalt stele in 1750 BCE Babylon, Hammurabi's legal code established public statutory law, moving human civilization from arbitrary monarchic retribution to codified standards of evidence, contracts, and proportional justice (lex talionis).",
        "tags": ["law", "civilization", "ancient-history"],
        "resources": [{"label": "The Code of Hammurabi (Translated by L. W. King, Yale Avalon Project)", "url": "https://avalon.law.yale.edu"}]
    },
    {
        "id": "magna-carta-rule-of-law",
        "title": "The Magna Carta (1215) & Constitutional Limitations",
        "description": "Signed at Runnymede by King John under baronial pressure, the Great Charter established that the sovereign is bound by the rule of law, formulating the foundational principle of habeas corpus and due process rights that underpin constitutional democracies.",
        "tags": ["constitutional-law", "governance", "history"],
        "resources": [{"label": "The British Library — Magna Carta: An Introduction", "url": "https://www.bl.uk/magna-carta"}]
    },
    {
        "id": "rosetta-stone-champollion",
        "title": "The Rosetta Stone & Deciphering Hieroglyphics",
        "description": "Discovered in 1799 containing the same decree in Egyptian Hieroglyphics, Demotic, and Ancient Greek, Jean-François Champollion unlocked the phonetic nature of the script in 1822, restoring three millennia of lost Egyptian historical knowledge.",
        "tags": ["archaeology", "linguistics", "history"],
        "resources": [{"label": "The British Museum — Everything You Ever Wanted to Know About the Rosetta Stone", "url": "https://www.britishmuseum.org"}]
    },
    {
        "id": "treaty-of-westphalia-nation-state",
        "title": "The Peace of Westphalia (1648) & The Sovereign State",
        "description": "Concluding the catastrophic Thirty Years' War, the Westphalian treaties established the principle of national territorial sovereignty (cuius regio, eius religio), banning foreign intervention in domestic affairs and defining modern international law.",
        "tags": ["geopolitics", "sovereignty", "international-relations"],
        "resources": [{"label": "Leo Gross — The Peace of Westphalia, 1648–1948 (American Journal of International Law)", "url": "https://www.jstor.org"}]
    },
    {
        "id": "marshall-plan-reconstruction",
        "title": "The Marshall Plan & European Economic Reconstruction",
        "description": "The US European Recovery Program (1948) transferred over $13 billion to rebuild war-devastated Western European industry, lowering interstate trade barriers, stabilizing currencies, and cementing the Western democratic alliance.",
        "tags": ["economics", "geopolitics", "post-war"],
        "resources": [{"label": "US National Archives — The Marshall Plan (1948)", "url": "https://www.archives.gov"}]
    },
    {
        "id": "neolithic-agricultural-revolution",
        "title": "The Neolithic Agricultural Transition",
        "description": "Beginning ~10,000 BCE in the Fertile Crescent, humanity transitioned from nomadic foraging to settled cereal crop cultivation (wheat, barley) and animal husbandry, creating caloric food surpluses that birthed cities, taxation, written language, and organized states.",
        "tags": ["anthropology", "agriculture", "ancient-history"],
        "resources": [{"label": "James C. Scott — Against the Grain: A Deep History of the Earliest States (Yale)", "url": "https://yalebooks.yale.edu"}]
    },
    {
        "id": "roman-aqueducts-pozzolana-concrete",
        "title": "Roman Aqueducts & Pozzolanic Hydraulic Concrete",
        "description": "Roman civil engineers combined volcanic pozzolana ash with lime to create underwater-curing hydraulic concrete, engineering gravity-fed municipal aqueduct systems spanning hundreds of kilometers that sustained high-density urban sanitary standards.",
        "tags": ["engineering", "architecture", "rome"],
        "resources": [{"label": "Vitruvius — De architectura (Ten Books on Architecture)", "url": "https://en.wikipedia.org/wiki/De_architectura"}]
    },
    {
        "id": "verge-escapement-mechanical-clocks",
        "title": "The Verge Escapement & Mechanical Clockwork (13th Century)",
        "description": "The medieval European invention of the oscillating verge escapement and foliot balance allowed mechanical gear trains to measure uniform units of time, breaking temporal dependence on sun or water and instigating modern industrial punctuality.",
        "tags": ["horology", "technology", "time"],
        "resources": [{"label": "David S. Landes — Revolution in Time: Clocks and the Making of the Modern World (Harvard)", "url": "https://www.hup.harvard.edu"}]
    },
    {
        "id": "manhattan-project-los-alamos",
        "title": "The Manhattan Project & The Atomic Age",
        "description": "Under J. Robert Oppenheimer and General Leslie Groves, thousands of physicists, chemists, and engineers concentrated industrial resources across Los Alamos, Oak Ridge, and Hanford to achieve controlled uranium enrichment, plutonium breeding, and nuclear chain reactions.",
        "tags": ["nuclear-physics", "history", "ww2"],
        "resources": [{"label": "Richard Rhodes — The Making of the Atomic Bomb (Simon & Schuster)", "url": "https://www.simonandschuster.com"}]
    },
    {
        "id": "jonas-salk-polio-vaccine",
        "title": "Jonas Salk & The Unpatented Polio Vaccine (1955)",
        "description": "Jonas Salk developed the first effective inactivated polio vaccine and refused to patent the formula, prioritizing rapid, cheap global immunization. When Edward R. Murrow asked who owned the patent, Salk famously replied: 'Well, the people, I would say. Could you patent the sun?'",
        "tags": ["medicine", "public-health", "ethics"],
        "resources": [{"label": "David M. Oshinsky — Polio: An American Story (Oxford University Press)", "url": "https://global.oup.com"}]
    },
    {
        "id": "lithium-ion-battery-revolution",
        "title": "The Lithium-Ion Battery (Goodenough, Whittingham, Yoshino)",
        "description": "John Goodenough, Stanley Whittingham, and Akira Yoshino commercialized rechargeable lithium-ion intercalation batteries with lightweight cobalt oxide cathodes, providing the high energy density that powered mobile phones, laptops, and electric transportation.",
        "tags": ["materials-science", "energy", "batteries"],
        "resources": [{"label": "Nobel Prize in Chemistry 2019 — Development of Lithium-Ion Batteries", "url": "https://www.nobelprize.org"}]
    },
    {
        "id": "optical-fiber-telecommunications",
        "title": "Charles Kao & Fiber-Optic Telecommunications",
        "description": "In 1966, Charles Kao calculated that laser light could transmit digital data across tens of kilometers of ultrapure fused silica glass with minimal attenuation, laying the transoceanic fiber-optic cable infrastructure that carries 99% of global internet traffic.",
        "tags": ["telecommunications", "photonics", "physics"],
        "resources": [{"label": "Charles K. Kao & G. A. Hockham — Dielectric-fibre surface waveguides for optical frequencies (1966)", "url": "https://digital-library.theiet.org"}]
    },
    {
        "id": "cai-lun-papermaking",
        "title": "Cai Lun & The Invention of Plant-Fiber Paper (105 CE)",
        "description": "Han Dynasty official Cai Lun standardized paper manufacturing by macerating mulberry bark, hemp waste, and old rags, replacing expensive silk scrolls and heavy bamboo tablets with a durable, lightweight medium that transformed governance and literature.",
        "tags": ["papermaking", "ancient-china", "information"],
        "resources": [{"label": "Denis Twitchett & Michael Loewe — The Cambridge History of China: Volume 1", "url": "https://www.cambridge.org"}]
    },
    {
        "id": "mariners-magnetic-compass",
        "title": "The Magnetic Mariner's Compass",
        "description": "First recorded in Song Dynasty China and adapted by Mediterranean sailors, the magnetized needle suspended in a dry card or fluid bowl freed navigation from visible coastlines, enabling open-ocean exploration and global trade circumnavigation.",
        "tags": ["navigation", "maritime", "exploration"],
        "resources": [{"label": "Joseph Needham — Science and Civilisation in China (Volume 4)", "url": "https://www.cambridge.org"}]
    },
    {
        "id": "torricelli-barometer-vacuum",
        "title": "Evangelista Torricelli & The Atmospheric Barometer (1643)",
        "description": "By inverting a mercury-filled glass tube into a dish, Torricelli proved that atmospheric air has measurable weight and demonstrated the physical reality of a vacuum, disproving Aristotle's millennia-old dogma that 'nature abhors a vacuum'.",
        "tags": ["physics", "scientific-revolution", "experiment"],
        "resources": [{"label": "Evangelista Torricelli — Opera Geometrica (1644)", "url": "https://en.wikipedia.org/wiki/Evangelista_Torricelli"}]
    },
    {
        "id": "scientific-revolution-royal-society",
        "title": "The Royal Society & Nullius in Verba (1660)",
        "description": "Founded in London with the motto 'Nullius in Verba' (Take nobody's word for it), the Royal Society established modern peer review, empirical experimental verification, and public dissemination of scientific truth over scholastic dogma.",
        "tags": ["scientific-revolution", "peer-review", "philosophy-of-science"],
        "resources": [{"label": "The Royal Society — History of the Royal Society", "url": "https://royalsociety.org"}]
    },
    {
        "id": "standard-time-zones-fleming",
        "title": "Sir Sandford Fleming & The Standardization of Time Zones (1884)",
        "description": "Before railways, every municipality set local noon by the solar meridian, creating over 300 conflicting time standards across North America. Sandford Fleming championed the International Meridian Conference dividing Earth into 24 standard 15-degree hourly time zones.",
        "tags": ["time", "railways", "standardization"],
        "resources": [{"label": "International Meridian Conference (Washington 1884 Proceedings)", "url": "https://www.gutenberg.org"}]
    },
    {
        "id": "gps-satellite-constellation",
        "title": "The Global Positioning System (GPS) & Relativistic Clocks",
        "description": "Developed by the US Department of Defense, GPS trilaterates ground positions using signals from 24+ orbiting satellites carrying atomic clocks. To maintain accuracy within meters, onboard clocks must continuously compensate for both special and general relativistic time dilation.",
        "tags": ["satellite", "navigation", "relativity"],
        "resources": [{"label": "Neil Ashby — Relativity in the Global Positioning System (Living Reviews in Relativity)", "url": "https://link.springer.com"}]
    },
    {
        "id": "transcontinental-railroad-1869",
        "title": "The First Transcontinental Railroad (1869)",
        "description": "Connecting the Central Pacific and Union Pacific at Promontory Summit, Utah, the transcontinental railway reduced cross-continental travel time from six months to six days, integrating continental agriculture, mining, and manufacturing into an integrated market.",
        "tags": ["transportation", "railroads", "us-history"],
        "resources": [{"label": "David Haward Bain — Empire Express: Building the First Transcontinental Railroad", "url": "https://www.penguinrandomhouse.com"}]
    },
    {
        "id": "pasteurization-food-safety",
        "title": "Louis Pasteur & Thermal Pasteurization (1864)",
        "description": "Pasteur discovered that heating milk, wine, and beer to ~60–70°C destroys spoilage microbes without altering chemical compositions, eliminating bovine tuberculosis, typhoid, and scarlet fever as major public foodborne epidemics.",
        "tags": ["food-science", "public-health", "pasteur"],
        "resources": [{"label": "Louis Pasteur — Studies on Fermentation (1876)", "url": "https://archive.org"}]
    },
    {
        "id": "steam-locomotive-george-stephenson",
        "title": "George Stephenson's Rocket & Intercity Passenger Rail (1829)",
        "description": "Stephenson's multi-tubular boiler Rocket won the Rainhill Trials and opened the Liverpool and Manchester Railway, initiating the global railway boom that mechanized terrestrial logistics and unified national economies.",
        "tags": ["railroads", "steam", "transportation"],
        "resources": [{"label": "Michael Robbins — The Railway Age in Britain (Penguin)", "url": "https://www.penguin.co.uk"}]
    }
]

for t in history_innovation_topics:
    tid = t['id']
    if tid not in seen_ids and t['title'].lower() not in seen_titles:
        seen_ids.add(tid)
        seen_titles.add(t['title'].lower())
        all_topics.append({
            'id': tid,
            'group_name': 'world-ideas',
            'category': 'history-innovation',
            'tags': t['tags'],
            'title': t['title'],
            'description': t['description'],
            'resources': t['resources']
        })

print(f"Added History of Innovation topics. Total topics: {len(all_topics)}")

# ── 5. DE-DUPLICATION AUDIT & RECONCILIATION ──
print(f"\nFinal topic count across all categories: {len(all_topics)}")

category_breakdown = {}
for t in all_topics:
    key = f"{t['group_name']}::{t['category']}"
    category_breakdown[key] = category_breakdown.get(key, 0) + 1

print("\n=== EXPANDED CATEGORY BREAKDOWN ===")
for cat, count in sorted(category_breakdown.items()):
    print(f"  {cat}: {count} topics")

# Write to JSON
with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
    json.dump(all_topics, f, indent=2, ensure_ascii=False)
print(f"\nWritten {len(all_topics)} topics to {OUTPUT_JSON}")

# Write to JS Module for direct import
with open(OUTPUT_JS, 'w', encoding='utf-8') as f:
    f.write("/**\n * Daily Dive Compiled Built-in Topics Dataset\n")
    f.write(f" * Total topics: {len(all_topics)} across {len(category_breakdown)} categories\n */\n\n")
    f.write("export const COMPILED_TOPICS = ")
    json.dump(all_topics, f, indent=2, ensure_ascii=False)
    f.write(";\n")
print(f"Written JS module to {OUTPUT_JS}")
