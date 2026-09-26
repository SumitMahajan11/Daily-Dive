import json
import os
import re

DATA_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'compiledTopics.json'))
JS_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'compiledTopics.js'))

with open(DATA_FILE, 'r', encoding='utf-8') as f:
    topics = json.load(f)

print(f"Loaded {len(topics)} topics from {DATA_FILE}")

def split_into_sentences(text):
    protected = text
    # Protect single initials like " T. ", " D.A. ", " J. "
    protected = re.sub(r'\b([A-Z])\.\s*', r'__INIT_\1__ ', protected)
    # Protect common Latin / title abbreviations
    protected = re.sub(r'\be\.g\.', '__EG__', protected, flags=re.IGNORECASE)
    protected = re.sub(r'\bi\.e\.', '__IE__', protected, flags=re.IGNORECASE)
    protected = re.sub(r'\bvs\.', '__VS__', protected, flags=re.IGNORECASE)
    protected = re.sub(r'\bDr\.', '__DR__', protected)
    protected = re.sub(r'\bProf\.', '__PROF__', protected)
    protected = re.sub(r'\bMr\.', '__MR__', protected)
    protected = re.sub(r'\bMs\.', '__MS__', protected)
    
    parts = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"\'])', protected)
    
    restored = []
    for part in parts:
        p = part
        p = re.sub(r'__INIT_([A-Z])__\s*', r'\1. ', p)
        p = p.replace('__EG__', 'e.g.')
        p = p.replace('__IE__', 'i.e.')
        p = p.replace('__VS__', 'vs.')
        p = p.replace('__DR__', 'Dr.')
        p = p.replace('__PROF__', 'Prof.')
        p = p.replace('__MR__', 'Mr.')
        p = p.replace('__MS__', 'Ms.')
        restored.append(p.strip())
    return [r for r in restored if r]

# Explicit, domain-accurate rewrites for key topics that need expert precision under 165 chars
MANUAL_REWRITES = {
    "aristotelian-rhetorical-triangle-ethos-pathos-logos": "Persuasion balances three core appeals: Ethos (credibility), Pathos (emotional resonance), and Logos (reasoning) to inspire lasting conviction.",
    "cialdini-principles-of-persuasion": "Six behavioral triggers—Reciprocity, Scarcity, Authority, Consistency, Liking, and Consensus—that guide human compliance and decision-making.",
    "framing-effects-and-cognitive-anchoring-in-persuasion": "Identical choices produce different decisions based on framing: emphasizing loss activates far greater urgency than highlighting equivalent gain.",
    "elaboration-likelihood-model-central-vs-peripheral": "Persuasion operates via two pathways: the Central Route using deep logical scrutiny for lasting change, and the Peripheral Route relying on surface cues.",
    "monroe-motivated-sequence-persuasive-speech": "A five-step persuasive flow—Attention, Need, Satisfaction, Visualization, and Action—engineered to move an audience from curiosity to decisive action.",
    "inoculation-theory-building-cognitive-resistance": "Exposing people to weakened counter-arguments with refutations builds mental resilience, protecting their beliefs against subsequent persuasive attacks.",
    "principled-negotiation-getting-to-yes": "Focuses negotiations on shared underlying interests rather than rigid positions, separating personal emotions from the objective problem.",
    "batna-and-reservation-value-negotiation": "Your Best Alternative to a Negotiated Agreement sets your walk-away reservation value, defining the absolute limit of acceptable deal terms.",
    "anchoring-effects-in-negotiation": "The initial numerical offer establishes a mental reference point that disproportionately biases subsequent counter-offers and final settlements.",
    "nonviolent-communication-nvc-framework": "A four-step framework—Observations, Feelings, Needs, and Requests—that resolves conflicts by expressing needs without blame or judgment.",
    "tactical-empathy-and-calibrated-questions-voss": "Uses emotional labeling and calibrated open-ended questions to de-escalate tension and uncover the counterpart's underlying motivations.",
    "slack-hygiene-and-context-collapse-prevention": "Organizes team messaging into disciplined threads and public channels, preventing fragmented communication and context collapse.",
    "proxemics-and-spatial-interaction-zones-hall": "Studies how humans structure personal space across intimate, personal, social, and public zones, where violating boundaries triggers stress responses.",
    "high-context-vs-low-context-communication-hall": "Differentiates communication where meaning is explicit in words (low-context) versus embedded in shared cultural norms and subtle cues (high-context).",
    "asynchronous-video-messaging-and-loom-hygiene": "Bridges text and meetings by conveying demonstrations and tone without scheduling, best kept under 5 minutes with clear action items.",
    "reductio-ad-absurdum-and-proof-by-contradiction": "Proves a proposition by demonstrating that assuming its opposite leads to an inescapable logical contradiction or absurdity.",
    "utilitarianism-and-consequentialist-ethics": "An ethical framework holding that actions are morally right if they maximize overall happiness and well-being for the greatest number.",
    "hume-is-ought-problem-and-the-naturalistic-fallacy": "Argues that one cannot logically deduce prescriptive moral values ('ought') purely from descriptive factual claims ('is').",
    "confirmation-bias-and-motivated-reasoning": "The cognitive tendency to seek out, interpret, and remember evidence that confirms existing beliefs while dismissing contradictions.",
    "peak-end-rule-and-duration-neglect": "A heuristic where people judge past experiences primarily by how they felt at the peak and the end, rather than the total duration.",
    "halo-effect-and-horns-effect-cognitive-generalization": "A cognitive bias where a positive impression in one domain leads people to assume positive traits across unrelated areas.",
    "cognitive-dissonance-theory-festinger": "The psychological tension felt when holding conflicting beliefs or actions, prompting people to change attitudes to restore harmony.",
    "self-determination-theory-autonomy-competence-relatedness": "Identifies three core psychological needs—autonomy, competence, and relatedness—essential for intrinsic motivation and thriving.",
    "regulatory-focus-theory-promotion-vs-prevention": "Distinguishes motivation focused on growth and maximizing gains (Promotion) from motivation focused on security and avoiding errors (Prevention).",
    "group-polarization-and-the-risky-shift-phenomenon": "Occurs when group discussions cause members to adopt more extreme positions than their initial individual inclinations.",
    "abilene-paradox-and-mismanaged-agreement-harvey": "A paradox where a group collectively pursues a decision that no individual member actually wanted due to miscommunicated consent.",
    "first-principles-thinking": "Breaks down complex problems into fundamental, undeniable truths, building novel solutions from scratch rather than reasoning by analogy.",
    "second-order-thinking": "Evaluates the downstream, unintended consequences of decisions over time rather than focusing only on immediate, obvious results.",
    "occams-razor": "When presented with competing hypotheses that explain an outcome equally well, select the one that makes the fewest assumptions.",
    "hanlons-razor": "Never attribute to malice that which is adequately explained by carelessness, misunderstanding, or systemic friction.",
    "circle-of-competence": "Operating strictly within areas of deep knowledge while recognizing boundaries avoids catastrophic risks and high-stakes blind spots.",
    "cognitive-dissonance": "The mental discomfort experienced when holding contradictory beliefs, often resolved by rationalizing or dismissing conflicting facts.",
    "the-dunning-kruger-effect": "A cognitive bias where novices overestimate their ability due to low metacognition, while experts underestimate their relative competence.",
    "availability-heuristic": "A mental shortcut where people assess an event's likelihood based on how easily examples come to mind, overestimating dramatic occurrences.",
    "confirmation-bias": "The tendency to search for, favor, and recall information that confirms preexisting beliefs while ignoring contradictory evidence.",
    "sunk-cost-fallacy": "Continuing an endeavor solely because of previously invested time or money, rather than evaluating future utility and expected value.",
    "loss-aversion": "The psychological tendency to feel the pain of a loss nearly twice as intensely as the pleasure of an equivalent gain.",
    "hedonic-treadmill": "The observed tendency of humans to quickly return to a baseline level of happiness despite major positive or negative life events.",
    "eisenhower-matrix-prioritization": "Prioritization quadrant separating urgency from importance, emphasizing that long-term career growth requires focusing on non-urgent, high-value tasks.",
    "discounted-cash-flow-dcf-valuation": "Determines an asset's intrinsic value by projecting future free cash flows and discounting them back using a risk-adjusted rate.",
    "discounted-cash-flow": "Estimates the intrinsic value of an investment by projecting future cash flows and discounting them to the present using an appropriate rate.",
    "wacc-hurdle-rate": "Calculates a firm's blended cost of capital across equity and debt, serving as the minimum acceptable hurdle rate for new capital investments.",
    "backdoor-roth-and-mega-backdoor-conversions": "A tax-advantaged strategy that converts non-deductible traditional IRA funds into a Roth account, bypassing direct income limits.",
    "bond-pricing-yields-and-duration-convexity": "Measures bond price sensitivity to interest rate shifts using duration and convexity, showing how yields move inversely to price.",
    "reit-structures-and-funds-from-operations-ffo": "Real estate entities that distribute over 90% of taxable income to avoid corporate tax, evaluated using Funds From Operations (FFO).",
    "position-sizing-and-the-kelly-criterion": "A mathematical formula that determines the optimal fraction of capital to risk per bet to maximize long-term wealth growth.",
    "grouped-query-attention-gqa": "Shares key-value heads across multiple query heads, dramatically reducing memory bandwidth while preserving multi-head model quality.",
    "direct-preference-optimization-dpo": "Optimizes language models directly on human preference pairs without needing a separate reward model or complex RL loops.",
    "continuous-batching-orca": "Schedules LLM generation at the token iteration level rather than the request level, eliminating idle GPU compute.",
    "variational-autoencoders-vae": "Maps inputs into a smooth continuous latent space using the reparameterization trick, allowing stable generation of new samples.",
    "adamw-decoupled-weight-decay": "Decouples weight decay from gradient momentum updates, preventing L2 regularization from degrading adaptive learning rates.",
    "tree-of-thoughts-prompting": "Expands prompt reasoning into a tree of intermediate thoughts, allowing models to search, evaluate, and backtrack along paths.",
    "synthetic-data-generation-evol-instruct": "Iteratively rewrites seed prompts into increasingly complex, multi-step instructions using structured evolutionary mutation prompts.",
    "scaled-dot-product-attention": "Calculates compatibility between query and key vectors using dot products to dynamically weigh and aggregate value representations.",
    "sparse-mixture-of-experts": "Replaces dense neural layers with specialized expert sub-networks, activating only a subset per token to boost capacity efficiently.",
    "diffusion-models": "Generative models that synthesize data by iteratively reversing a gradual noise-injection process, producing high-fidelity images and audio.",
    "reinforcement-learning-ppo": "An on-policy actor-critic algorithm that limits policy update step sizes, stabilizing neural network training against destructive updates.",
    "beam-search-and-top-p-sampling": "Decoding strategies for language models; nucleus (top-p) sampling dynamically samples from the smallest token set exceeding probability threshold p.",
    "pulumi-engine-and-imperative-constructs": "Runs real programming languages to declare cloud infrastructure, orchestrating state updates through an engine-managed resource DAG.",
    "k8s-pod-disruption-budgets-and-drain": "Guarantees a minimum number of running pod replicas during voluntary node drains and rolling cluster maintenance.",
    "k8s-network-policies-and-calico-enforcement": "Enforces declarative micro-segmentation at Layer 3/4, isolating pod traffic using Kubernetes label selectors and network plugins.",
    "kubernetes-architecture": "An open-source orchestration system that automates deployment, scaling, and operational management of containerized applications.",
    "docker-containerization": "Packages applications and their entire runtime dependencies into isolated containers, ensuring identical execution across environments.",
    "distributed-profiling-and-ebpf-continuous-profiling": "Uses eBPF kernel probes to sample CPU instructions and stack traces without code instrumentation, exposing production bottlenecks.",
    "bloom-filters": "A space-efficient probabilistic data structure that tests set membership with zero false negatives and configurable false positive rates.",
    "cuckoo-filters": "A probabilistic data structure supporting dynamic deletions and lookups by storing compact fingerprints across dual hash locations.",
    "lsm-trees": "Log-Structured Merge-trees optimize write throughput by buffering updates in memory before flushing sequentially to immutable disk files.",
    "b-trees": "A self-balancing search tree optimized for block storage, keeping disk read operations minimal by maintaining wide multi-way branching factors.",
    "hopcroft-karp-bipartite-matching": "Finds the maximum cardinality matching in bipartite graphs in optimal O(E * sqrt(V)) time by discovering shortest augmenting paths.",
    "robin-hood-and-cuckoo-hashing": "Collision resolution techniques that minimize probe variances by stealing slots from rich items or using dual candidate locations.",
    "master-theorem-for-divide-and-conquer": "Provides asymptotic time complexity bounds for divide-and-conquer recurrences by comparing subproblem splits against combination work.",
    "consistent-hashing": "Distributes keys across dynamic cluster nodes with minimal remapping when nodes are added or removed, preventing cascading failovers.",
    "raft-consensus": "A distributed consensus algorithm designed for understandability, electing a leader to manage and replicate a centralized state log.",
    "paxos-consensus": "A foundational fault-tolerant protocol ensuring multiple distributed nodes reach consensus on values over an unreliable network.",
    "cap-theorem": "States that a distributed data store can simultaneously guarantee at most two out of three properties: Consistency, Availability, and Partition tolerance.",
    "acid-vs-base": "Contrasts ACID's strict transactional consistency with BASE's eventual consistency model tailored for horizontally scalable distributed systems.",
    "two-phase-commit": "A distributed protocol where a coordinator ensures all participating nodes either commit or abort a transaction together across two phases.",
    "linearizability-and-atomic-registers": "A strong consistency model guaranteeing that every read and write operation appears to take effect instantaneously at a distinct point.",
    "moesi-and-shared-dirty-states": "Extends cache coherence with an Owner state, letting dirty cache lines be shared among cores without writing back to main memory.",
    "dynamo-style-quorum-systems": "Leaderless distributed storage where configurable read and write quorums (R + W > N) guarantee strong consistency across node failures.",
    "google-truetime-and-spanner-commit-wait": "Uses atomic clocks and GPS to provide bounded time uncertainty, using commit-wait intervals to enforce global serializability.",
    "strict-vs-partial-quorums-tradeoffs": "Balances strict quorum consistency against lower tail latencies and higher availability under partial quorums.",
    "erasure-coding-vs-replication": "Divides data into fragments with parity chunks to survive multiple disk failures with 30–50% storage overhead versus 200% for 3x replication.",
    "react-server-components": "Components that render exclusively on the server, streaming structured UI to the client without shipping JavaScript execution overhead.",
    "speculative-parsing-and-preload-scanner": "Scans HTML ahead of blocking scripts using a background thread, discovering and preloading external assets concurrently.",
    "module-federation-micro-frontends": "Enables independent JavaScript applications to dynamically load and share components and dependencies at runtime.",
    "cambrian-explosion-radiation": "A rapid evolutionary radiation 541 million years ago that produced nearly all modern animal body plans and phyla.",
    "photovoltaic-effect-bandgaps": "The physical process where absorbed photons excite electrons across a semiconductor bandgap, generating direct electric current.",
    "schrodinger-what-is-life-negentropy": "Schrödinger's insight that living systems avoid thermal decay by absorbing negative entropy from their external environment.",
    "smallpox-eradication-d-a-henderson": "A landmark global public health campaign using targeted surveillance and containment vaccination to eradicate smallpox in 1980.",
    "mariners-magnetic-compass": "The suspended magnetic needle that enabled open-ocean navigation independent of celestial visibility or coastal landmarks.",
    "torricelli-barometer-vacuum": "Proved atmospheric air has weight by inverting a mercury tube, demonstrating the physical reality of a vacuum in 1643."
}

def rewrite_description(topic):
    tid = topic.get('id', '')
    title = topic.get('title', '')
    orig = topic.get('description', '').strip()

    if tid in MANUAL_REWRITES:
        return MANUAL_REWRITES[tid]

    # Clean academic / attribution intros
    text = orig
    intro_patterns = [
        r'^(?:According to [^,]+,\s*)',
        r'^(?:Developed by [^,]+,\s*)',
        r'^(?:Formulated by [^,]+,\s*)',
        r'^(?:Proposed by [^,]+,\s*)',
        r'^(?:Introduced by [^,]+,\s*)',
        r'^(?:Coined by [^,]+,\s*)',
        r'^(?:Under [A-Z][a-zA-Z\s\.\']+(?:and [A-Z][a-zA-Z\s\.\']+)?,\s*)',
        r'^(?:Led by [A-Z][a-zA-Z\s\.\']+(?:and [A-Z][a-zA-Z\s\.\']+)?,\s*)',
        r'^(?:In [^,]+,\s*(?:author|economist|philosopher|researcher|CEO|physicist|mathematician)?\s*[^,]+ (?:defines|argues that|posits that|demonstrates that)\s*)',
        r'^[A-Z][a-zA-Z\s\.\']+(?:demonstrated|showed|discovered|argued|posited|observed|established|found) that\s+',
        r'^[A-Z][a-zA-Z\s\.\']+\'s (?:research|paper|model|theory|law|framework|formula|theorem|invention|experiment) (?:demonstrates|shows|identifies|establishes|posits|states|reveals) that\s+',
        r'^[A-Z][a-zA-Z\s\.\']+\'s (?:invention|formulation|principle|concept|paradox|trilemma) (?:states|posits|asserts|holds) that\s+',
        r'^(?:A fundamental (?:principle|concept|theorem|model|framework) (?:in|of) [^:]+:\s*)',
        r'^(?:A core (?:principle|concept|technique|model|framework) (?:in|of) [^:]+:\s*)',
    ]
    for p in intro_patterns:
        text = re.sub(p, '', text, flags=re.IGNORECASE).strip()

    if text:
        text = text[0].upper() + text[1:]

    # Split into clean grammatical sentences
    sentences = split_into_sentences(text)
    if not sentences:
        sentences = [text]

    s1 = sentences[0].strip()

    # Simplify overly long parentheticals inside s1
    def clean_paren(match):
        content = match.group(1).strip()
        if len(content) > 35:
            # take first comma item
            first = content.split(',')[0].strip()
            if len(first) < 25:
                return f"({first})"
            return ""
        return f"({content})"

    s1 = re.sub(r'\(([^)]+)\)', clean_paren, s1)
    s1 = re.sub(r'\s+', ' ', s1).strip()
    s1 = re.sub(r'\(\s*\)', '', s1).strip()

    # If s1 is already between 70 and 165 chars, check if we can cleanly use it
    if 65 <= len(s1) <= 165 and s1.endswith(('.', '!', '?')):
        # Check if s2 can also fit cleanly
        if len(sentences) > 1:
            s2 = sentences[1].strip()
            combo = f"{s1} {s2}"
            if len(combo) <= 165:
                return combo
        return s1

    # Fluff trimming on s1
    fluff_replacements = [
        (r'is a psychological phenomenon wherein individuals', 'occurs when individuals'),
        (r'is a mental shortcut where individuals', 'a heuristic where people'),
        (r'is a cognitive bias in which', 'a cognitive bias where'),
        (r'is a cognitive bias that causes', 'causes'),
        (r'is the tendency for individuals to', 'the tendency to'),
        (r'is the tendency to', 'the tendency to'),
        (r'refers to the phenomenon where', 'occurs when'),
        (r'refers to the process of', 'the process of'),
        (r'is designed to provide', 'provides'),
        (r'is a distributed protocol that', 'a protocol that'),
        (r'is an algorithmic technique that', 'an algorithm that'),
        (r'guarantees that every', 'ensures every'),
        (r'with linear computational complexity relative to', 'with linear complexity relative to'),
    ]
    trimmed = s1
    for pat, rep in fluff_replacements:
        trimmed = re.sub(pat, rep, trimmed, flags=re.IGNORECASE)
    trimmed = re.sub(r'\s+', ' ', trimmed).strip()

    if 65 <= len(trimmed) <= 165 and trimmed.endswith(('.', '!', '?')):
        return trimmed

    # If trimmed is still > 165, break at natural clause boundary
    if len(trimmed) > 165:
        # Check colon, semicolon, or dash
        match = re.search(r'[:;—]\s*', trimmed[:155])
        if match and match.start() > 70:
            candidate = trimmed[:match.start()].strip() + '.'
            if len(candidate) <= 165:
                return candidate

        # Check for conjunction clauses (, which / , where / , allowing / , enabling / , yielding)
        conj = re.search(r',\s+(?:which|where|allowing|enabling|yielding|ensuring|while|thereby)\b', trimmed[:160])
        if conj and conj.start() > 70:
            candidate = trimmed[:conj.start()].strip() + '.'
            if len(candidate) <= 165:
                return candidate

        # Check last comma before 160
        last_comma = trimmed[:160].rfind(',')
        if last_comma > 75:
            candidate = trimmed[:last_comma].strip() + '.'
            if len(candidate) <= 165:
                return candidate

        # Emergency word boundary wrap
        words = trimmed[:163].split()
        if len(words) > 1:
            words.pop()
        res = " ".join(words).strip()
        res = re.sub(r'[,;:\-—\s]+$', '', res) + '.'
        return res

    # If s1 was too short (< 65 chars), try combining with s2 or rest
    if len(trimmed) < 65 and len(sentences) > 1:
        s2 = sentences[1].strip()
        combo = f"{trimmed} {s2}".strip()
        if len(combo) <= 165:
            return combo
        else:
            # take first clause of s2
            words = (trimmed + " " + s2)[:163].split()
            words.pop()
            res = " ".join(words).strip()
            res = re.sub(r'[,;:\-—\s]+$', '', res) + '.'
            return res

    if not trimmed.endswith('.'):
        trimmed += '.'
    return trimmed

print("Rewriting 692 topics...")
rewritten_topics = []
issues = []

ILLEGAL_ENDINGS = set([
    'the', 'a', 'an', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'from', 'by',
    'their', 'its', 'his', 'her', 'our', 'your', 'and', 'or', 'but', 'as', 'into',
    'onto', 'upon', 'through', 'over', 'under', 'between', 'among', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'that', 'which', 'who', 'whom', 'whose'
])

for idx, t in enumerate(topics):
    desc = rewrite_description(t)
    
    # Strict validation
    if len(desc) > 165:
        words = desc[:163].split()
        words.pop()
        desc = " ".join(words).strip()
        desc = re.sub(r'[,;:\-—\s]+$', '', desc) + '.'

    m = re.search(r'\b([a-zA-Z]+)[^a-zA-Z0-9]*\.\s*$', desc)
    last_word = m.group(1).lower() if m else ''
    
    # Exception for quoted philosophical terms like ('is')
    if desc.endswith("('is')."):
        last_word = 'valid_is'

    if len(desc) < 45 or len(desc) > 165 or not desc.endswith(('.', '!', '?')) or last_word in ILLEGAL_ENDINGS:
        issues.append((t['id'], len(desc), f"Ending: '{last_word}' | Desc: {desc}"))

    new_t = dict(t)
    new_t['description'] = desc
    rewritten_topics.append(new_t)

print(f"Total rewritten: {len(rewritten_topics)}")
print(f"Issues (len < 45 or len > 165 or bad ending): {len(issues)}")
for iss in issues:
    print(f"  ISSUE: {iss[0]} (len {iss[1]}): {iss[2]}")

orig_lengths = [len(t.get('description', '')) for t in topics]
orig_words = [len(t.get('description', '').split()) for t in topics]

new_lengths = [len(t.get('description', '')) for t in rewritten_topics]
new_words = [len(t.get('description', '').split()) for t in rewritten_topics]

print("\n" + "="*50)
print("FULL DATASET 692-TOPIC LENGTH VERIFICATION")
print("="*50)
print(f"BEFORE: Min = {min(orig_lengths)} chars | Avg = {sum(orig_lengths)/len(orig_lengths):.1f} chars | Max = {max(orig_lengths)} chars")
print(f"        Min = {min(orig_words)} words | Avg = {sum(orig_words)/len(orig_words):.1f} words | Max = {max(orig_words)} words")
print(f"AFTER:  Min = {min(new_lengths)} chars | Avg = {sum(new_lengths)/len(new_lengths):.1f} chars | Max = {max(new_lengths)} chars")
print(f"        Min = {min(new_words)} words | Avg = {sum(new_words)/len(new_words):.1f} words | Max = {max(new_words)} words")
print("="*50)

# Save to compiledTopics.json and compiledTopics.js
with open(DATA_FILE, 'w', encoding='utf-8') as f:
    json.dump(rewritten_topics, f, indent=2, ensure_ascii=False)
print(f"Saved {len(rewritten_topics)} topics to {DATA_FILE}")

with open(JS_FILE, 'w', encoding='utf-8') as f:
    f.write("/**\n * Daily Dive Compiled Built-in Topics Dataset\n")
    f.write(f" * Total topics: {len(rewritten_topics)} across 12 categories\n")
    f.write(" * Short-form micro-learning standard: 1–2 complete sentences, max <= 165 chars\n */\n\n")
    f.write("export const COMPILED_TOPICS = ")
    json.dump(rewritten_topics, f, indent=2, ensure_ascii=False)
    f.write(";\n")
print(f"Saved {len(rewritten_topics)} topics to {JS_FILE}")
