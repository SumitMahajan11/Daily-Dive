/**
 * Pure functions for weighted random topic selection and streak calculations.
 */

export const INITIAL_TOPICS = [
  // TECH: AI & ML
  {
    id: "rag-llms",
    group_name: "tech",
    category: "ai-ml",
    tags: ["rag", "llms", "vectors"],
    title: "Retrieval-Augmented Generation (RAG)",
    description: "Combines pre-trained parametric models with dense vector retrieval across external knowledge stores to eliminate hallucinations and ground responses in private enterprise data.",
    resources: [
      { type: "Paper", label: "Lewis et al. — Original RAG Paper (arXiv)", desc: "Foundational paper introducing parametric & non-parametric neural memory", url: "https://arxiv.org/abs/2005.11401" },
      { type: "Guide", label: "Pinecone — Dense Retrieval & Vector Indices", desc: "Architecture guide to semantic search pipelines and embeddings", url: "https://www.pinecone.io/learn/vector-database/" },
      { type: "Docs", label: "LangChain — Advanced Chunking & Re-ranking", desc: "Production patterns for multi-stage document retrieval", url: "https://python.langchain.com" }
    ]
  },
  {
    id: "lora-finetuning",
    group_name: "tech",
    category: "ai-ml",
    tags: ["finetuning", "lora", "transformers"],
    title: "LoRA & Low-Rank Model Adaptation",
    description: "Decomposes weight update matrices into rank decomposition matrices, reducing trainable parameter footprints by 99% while preserving model fidelity.",
    resources: [
      { type: "Paper", label: "Hu et al. — LoRA: Low-Rank Adaptation of LLMs", desc: "Original Microsoft research paper on parameter-efficient adaptation", url: "https://arxiv.org/abs/2106.09685" },
      { type: "Guide", label: "Hugging Face — PEFT Documentation", desc: "State-of-the-art Parameter-Efficient Fine-Tuning library guide", url: "https://huggingface.co/docs/peft" }
    ]
  },
  {
    id: "transformer-attention",
    group_name: "tech",
    category: "ai-ml",
    tags: ["transformers", "attention", "nlp"],
    title: "Multi-Head Self-Attention Mechanisms",
    description: "Allows neural representations to jointly attend to information from different representation subspaces at different sequence positions.",
    resources: [
      { type: "Paper", label: "Vaswani et al. — Attention Is All You Need", desc: "Seminal 2017 Transformer architecture paper", url: "https://arxiv.org/abs/1706.03762" },
      { type: "Guide", label: "The Illustrated Transformer by Jay Alammar", desc: "Visual step-by-step breakdown of query, key, and value vectors", url: "https://jalammar.github.io/illustrated-transformer/" }
    ]
  },

  // TECH: Cloud & Infra
  {
    id: "k8s-control-plane",
    group_name: "tech",
    category: "cloud-infra",
    tags: ["k8s", "containers", "orchestration"],
    title: "Kubernetes Control Plane & Raft Etcd Consensus",
    description: "How kube-apiserver, controller-manager, scheduler, and distributed etcd maintain declarative cluster reconciliation loops under network partitions.",
    resources: [
      { type: "Docs", label: "Kubernetes Architecture & Core Concepts", desc: "Official deep dive into master nodes and controller reconciliation loops", url: "https://kubernetes.io/docs/concepts/overview/components/" },
      { type: "Guide", label: "Etcd Raft Algorithm in Practice", desc: "Distributed key-value store architecture behind modern cloud platforms", url: "https://etcd.io/docs/" }
    ]
  },
  {
    id: "terraform-iac",
    group_name: "tech",
    category: "cloud-infra",
    tags: ["terraform", "iac", "devops"],
    title: "Infrastructure as Code & State Locking Patterns",
    description: "Managing declarative cloud resources with DAG dependency graphs, plan/apply lifecycles, and distributed state lock concurrency controls.",
    resources: [
      { type: "Docs", label: "HashiCorp Terraform State Internals", desc: "State backend locking, remote state migration, and graph calculation", url: "https://developer.hashicorp.com/terraform/docs" }
    ]
  },

  // TECH: Web Dev
  {
    id: "rsc-architecture",
    group_name: "tech",
    category: "web-dev",
    tags: ["react", "nextjs", "streaming"],
    title: "React Server Components & Streaming SSR",
    description: "Decouples component execution between build/server time and client browser hydration, eliminating client bundle footprint while enabling async Suspense streaming.",
    resources: [
      { type: "Docs", label: "React RFC — Server Components Specification", desc: "Core RFC explaining protocol streams and boundary serialization", url: "https://react.dev/reference/rsc/server-components" },
      { type: "Guide", label: "Next.js App Router Architecture Guide", desc: "Server Actions, route caching, and selective hydration", url: "https://nextjs.org/docs" }
    ]
  },
  {
    id: "webassembly-simd",
    group_name: "tech",
    category: "web-dev",
    tags: ["wasm", "performance", "rust"],
    title: "WebAssembly (Wasm) & Native Browser Compute",
    description: "Executing compiled C/Rust bytecode at near-native speed within sandboxed browser runtimes with SIMD vector extensions and shared memory threads.",
    resources: [
      { type: "Docs", label: "MDN WebAssembly Concepts & API", desc: "Memory linear addressing, module instantiation, and JavaScript interop", url: "https://developer.mozilla.org/en-US/docs/WebAssembly" }
    ]
  },

  // TECH: Data Structures & Algorithms
  {
    id: "bloom-filters",
    group_name: "tech",
    category: "data-structures-algorithms",
    tags: ["algorithms", "probabilistic", "caching"],
    title: "Bloom Filters & Probabilistic Data Structures",
    description: "Space-efficient probabilistic structure that tests whether an element is definitely not in a set or possibly in a set using multiple bit-array hash functions.",
    resources: [
      { type: "Guide", label: "Mining of Massive Datasets — Filtering Streams", desc: "Stanford CS246 mathematical foundation for hash collision bounds", url: "http://www.mmds.org/" }
    ]
  },

  // TECH: Systems & Distributed Computing
  {
    id: "raft-consensus",
    group_name: "tech",
    category: "systems-distributed-computing",
    tags: ["distributed-systems", "raft", "consensus"],
    title: "Raft Distributed Consensus & Leader Election",
    description: "Deconstructs distributed state machine replication into leader election, log replication, and safety guarantees with strict term numbers and quorum voting.",
    resources: [
      { type: "Paper", label: "In Search of an Understandable Consensus Algorithm (Ongaro & Ousterhout)", desc: "The foundational Stanford paper introducing Raft", url: "https://raft.github.io/raft.pdf" },
      { type: "Guide", label: "The Secret Lives of Data: Raft Visualization", desc: "Interactive visualization of Raft leader election and log synchronization", url: "http://thesecretlivesofdata.com/raft/" }
    ]
  },

  // MONEY & CAREER: Finance
  {
    id: "83b-election",
    group_name: "money-career",
    category: "finance",
    tags: ["equity", "tax", "startups"],
    title: "83(b) Election & QSBS Exemption",
    description: "Filing an 83(b) election notifies the IRS to tax restricted stock at grant date values rather than future vesting dates, potentially shielding capital gains under Section 1202.",
    resources: [
      { type: "Guide", label: "IRS Section 83(b) Detailed Tax Guide", desc: "Timelines, safe harbors, and early-stage startup tax planning strategies", url: "https://www.investopedia.com/terms/1/83b-election.asp" },
      { type: "Article", label: "Holloway Guide to Equity Compensation", desc: "Stock options, ISOs, RSUs, and liquidity event tax structuring", url: "https://www.holloway.com/g/equity-compensation" }
    ]
  },
  {
    id: "network-effects-moats",
    group_name: "money-career",
    category: "finance",
    tags: ["strategy", "moats", "business"],
    title: "7 Powers & Enduring Business Moats",
    description: "Hamilton Helmer's framework for sustainable differential returns: Scale Economies, Network Economies, Counter-Positioning, Switching Costs, Branding, Cornered Resource, and Process Power.",
    resources: [
      { type: "Book", label: "7 Powers: The Foundations of Business Strategy", desc: "Definitive guide to creating structural company value and margins", url: "https://7powers.com" }
    ]
  },

  // MIND & GROWTH: Philosophy & Critical Thinking
  {
    id: "inversion-premortem",
    group_name: "mind-growth",
    category: "philosophy-critical-thinking",
    tags: ["mental-models", "decision-making"],
    title: "Inversion & Pre-Mortem Analysis",
    description: "Structuring decisions backwards by listing failure vectors and systematically eliminating fragility factors before launching operational initiatives.",
    resources: [
      { type: "Essay", label: "Farnam Street — Mental Model: Inversion", desc: "Charlie Munger's algebra of avoiding stupidity over seeking brilliance", url: "https://fs.blog/inversion/" }
    ]
  },

  // MIND & GROWTH: Psychology
  {
    id: "implementation-intentions",
    group_name: "mind-growth",
    category: "psychology",
    tags: ["psychology", "habits", "productivity"],
    title: "Implementation Intentions & Cue-Action Loops",
    description: "Pre-committing to specific 'If [Situation X] occurs, then I will execute [Action Y]' mental triggers doubles habitual follow-through across high-friction tasks.",
    resources: [
      { type: "Research", label: "Gollwitzer — Implementation Intentions (1999)", desc: "Empirical psychological trials on automated action initiation", url: "https://psycnet.apa.org" }
    ]
  },

  // MIND & GROWTH: Communication
  {
    id: "aristotelian-rhetorical-triangle-ethos-pathos-logos",
    group_name: "mind-growth",
    category: "communication",
    tags: ["rhetoric", "persuasion", "classical-rhetoric"],
    title: "The Aristotelian Rhetorical Triangle: Ethos, Pathos & Logos in Modern Discourse",
    description: "Aristotle's Rhetoric establishes that durable persuasion requires balancing three appeals: Ethos (authority and character), Pathos (emotional resonance), and Logos (logical evidence).",
    resources: [
      { type: "Paper", label: "Aristotle: Rhetoric (MIT Classics)", desc: "Foundational classical treatise on persuasive speech", url: "http://classics.mit.edu/Aristotle/rhetoric.html" }
    ]
  }
];

export const CATEGORY_TREE = [
  {
    group: "tech",
    label: "Tech",
    badge: "5 sub-categories · 313 topics",
    categories: [
      { name: "ai-ml", label: "AI & Machine Learning", topicsCount: 63, tags: ["Deep Learning", "Transformers", "NLP", "Computer Vision"] },
      { name: "cloud-infra", label: "Cloud & Infrastructure", topicsCount: 64, tags: ["Kubernetes", "Networking", "Security", "Distributed Systems"] },
      { name: "data-structures-algorithms", label: "Data Structures & Algorithms", topicsCount: 73, tags: ["Trees", "Algorithms", "Data Structures", "Graphs"] },
      { name: "systems-distributed-computing", label: "Systems & Distributed Computing", topicsCount: 57, tags: ["Replication", "Distributed Systems", "Sharding", "Kafka"] },
      { name: "web-dev", label: "Web Architecture & Performance", topicsCount: 56, tags: ["Performance", "JavaScript", "CSS", "Rendering"] }
    ]
  },
  {
    group: "money-career",
    label: "Money & Career",
    badge: "1 sub-category · 68 topics",
    categories: [
      { name: "finance", label: "Finance & Wealth Strategy", topicsCount: 68, tags: ["Corporate Finance", "Personal Finance", "DeFi", "Tax Strategy"] }
    ]
  },
  {
    group: "mind-growth",
    label: "Mind & Growth",
    badge: "3 sub-categories · 176 topics",
    categories: [
      { name: "communication", label: "Communication & Rhetoric", topicsCount: 54, tags: ["Persuasion", "Cross-Cultural", "Public Speaking", "Negotiation"] },
      { name: "philosophy-critical-thinking", label: "Philosophy & Critical Thinking", topicsCount: 42, tags: ["Critical Thinking", "Epistemology", "Fallacies", "Ethics"] },
      { name: "psychology", label: "Psychology & Decision Making", topicsCount: 80, tags: ["Cognitive Biases", "Social Psychology", "Memory", "Decision Systems"] }
    ]
  }
];

/**
 * Pure weighted random topic selection.
 * Unseen topics receive high base weight (100).
 * Seen topics receive recency-decayed weight based on days since last seen.
 */
export function selectWeightedTopic(topics = [], userProgressMap = {}, enabledCategories = {}) {
  if (!topics || topics.length === 0) return null;

  const eligible = topics.filter(t => {
    const group = t.group_name || t.group;
    const cat = t.category || t.sub;

    if (enabledCategories[group] === false) return false;
    if (enabledCategories[`${group}::${cat}`] === false || enabledCategories[cat] === false) return false;
    return true;
  });

  if (eligible.length === 0) return null;

  const now = Date.now();
  const ONE_DAY_MS = 86400000;

  const weightedList = eligible.map(topic => {
    const progress = userProgressMap[topic.id];
    let weight = 100; // Base weight for completely unseen topics

    if (progress && progress.times_seen > 0) {
      const lastSeenTime = progress.last_seen ? new Date(progress.last_seen).getTime() : 0;
      const daysSinceSeen = Math.max(0, (now - lastSeenTime) / ONE_DAY_MS);

      const recencyWeight = Math.min(50, 2 + daysSinceSeen * 1.8);
      const frequencyPenalty = 1 + Math.log2(progress.times_seen + 1) * 0.4;
      weight = Math.max(1, Math.round(recencyWeight / frequencyPenalty));
    }

    return { topic, weight };
  });

  const totalWeight = weightedList.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) {
    return eligible[Math.floor(Math.random() * eligible.length)];
  }

  let randomVal = Math.random() * totalWeight;
  for (const item of weightedList) {
    if (randomVal < item.weight) {
      return item.topic;
    }
    randomVal -= item.weight;
  }

  return weightedList[weightedList.length - 1].topic;
}

/**
 * Calculates updated streak information.
 */
export function calculateUpdatedStreak(currentStreakData = {}, nowDate = new Date()) {
  const todayStr = nowDate.toISOString().slice(0, 10);
  const yesterday = new Date(nowDate.getTime() - 86400000);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const prevActiveDate = currentStreakData.last_active_date;
  let currentStreak = currentStreakData.current_streak || 0;
  let longestStreak = currentStreakData.longest_streak || 0;

  if (prevActiveDate === todayStr) {
    return {
      current_streak: Math.max(1, currentStreak),
      longest_streak: Math.max(longestStreak, currentStreak),
      last_active_date: todayStr
    };
  }

  if (prevActiveDate === yesterdayStr) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_active_date: todayStr
  };
}
