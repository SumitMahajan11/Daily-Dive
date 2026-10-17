/**
 * Curated first-spin starter topic set (16 topics across all 4 groups).
 * Hydrates instant spin with zero chunk delay on initial load.
 * Generated automatically by scripts/tools/split_topics_by_group.mjs
 */
export const starterTopics = [
  {
    "id": "multi-head-self-attention",
    "title": "Scaled Dot-Product",
    "description": "Calculates pairwise dynamic compatibility across token representations via query-key dot products to route value embeddings across multiple representation subspaces.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "deep-learning",
      "transformers",
      "nlp"
    ],
    "resources": [
      {
        "label": "Attention Is All You Need (Vaswani et al., 2017)",
        "url": "https://arxiv.org/abs/1706.03762"
      },
      {
        "label": "The Illustrated Transformer (Jay Alammar)",
        "url": "https://jalammar.github.io/illustrated-transformer/"
      }
    ],
    "lesson": {
      "idea": "Scaled dot-product attention allows a model to connect every word in a sentence to every other word at the same time. Multiple attention heads let the system look at relationships from different angles simultaneously.",
      "why": "Before this method, models read text a word at a time in order, often forgetting earlier details in long paragraphs. Multi-head attention captures rich context instantly across long passages.",
      "example": "In the sentence 'The bank approved the loan because it had funds', an attention head links 'it' to 'bank' while another links 'funds' to 'loan'."
    }
  },
  {
    "id": "mixture-of-experts-moe",
    "title": "Sparse Mixture of Experts (MoE)",
    "description": "Replaces dense feed-forward networks with multiple specialized expert sub-networks dynamically selected per token by a top-k router.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "transformers",
      "sparse-computing",
      "llm-architecture"
    ],
    "resources": [
      {
        "label": "Outrageously Large Neural Networks: The Sparsely-Gated MoE Layer",
        "url": "https://arxiv.org/abs/1701.06538"
      },
      {
        "label": "Hugging Face Mixture of Experts Explained",
        "url": "https://huggingface.co/blog/moe"
      },
      {
        "label": "Mixtral of Experts Paper",
        "url": "https://arxiv.org/abs/2401.04088"
      }
    ],
    "lesson": {
      "idea": "Sparse Mixture of Experts (MoE) architectures replace dense feed-forward layers with multiple expert sub-networks, routing each token through a top-k gating mechanism.",
      "why": "Dense layers waste parameter capacity on tokens that require specialized computation. Sparse routing scales capacity while keeping per-token computation bounded.",
      "example": "Routing algorithms send coding tokens to math experts and punctuation to syntax experts during language generation."
    }
  },
  {
    "id": "mamba-state-space-models",
    "title": "Mamba & Selective State Space Models",
    "description": "Sub-quadratic sequence models that parameterize continuous-time state spaces with input-dependent selection mechanisms and hardware-aware scan kernels.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "sequence-models",
      "state-space-models",
      "deep-learning"
    ],
    "resources": [
      {
        "label": "Mamba: Linear-Time Sequence Modeling with Selective State Spaces",
        "url": "https://arxiv.org/abs/2312.00752"
      },
      {
        "label": "Mamba GitHub Repository",
        "url": "https://github.com/state-spaces/mamba"
      }
    ],
    "lesson": {
      "idea": "Mamba processes long sequences of data continuously in linear time by updating an internal memory state instead of comparing every word to all past words.",
      "why": "Standard attention models become significantly slower as text length increases because processing cost grows quadratically. Mamba handles very long context windows efficiently without ballooning memory usage.",
      "example": "A smart assistant can read an entire lengthy financial report in a single pass without slowing down on the final pages."
    }
  },
  {
    "id": "rotary-positional-embeddings-rope",
    "title": "Rotary Position Embeddings (RoPE)",
    "description": "Encodes token position information into query and key representations by rotating 2D slice vectors using orthogonal rotation matrices.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "transformers",
      "positional-encoding",
      "nlp"
    ],
    "resources": [
      {
        "label": "RoFormer: Enhanced Transformer with Rotary Position Embedding (Su et al.)",
        "url": "https://arxiv.org/abs/2104.09864"
      },
      {
        "label": "EleutherAI: Rotary Embeddings Explanation",
        "url": "https://blog.eleuther.ai/rotary-embeddings/"
      }
    ],
    "lesson": {
      "idea": "Rotary Position Embeddings (RoPE) encode token locations by rotating query and key representations using orthogonal rotation matrices in paired dimensions.",
      "why": "Absolute position vectors degrade when sequence context expands past pre-training boundaries. Relative vector rotations enable attention layers to extrapolate across extended contexts smoothly.",
      "example": "Attention queries rotate across vector coordinates to determine relative distance between input words during transformer inference."
    }
  },
  {
    "id": "discounted-cash-flow-dcf-valuation",
    "title": "Discounted Cash Flow (DCF) Valuation",
    "description": "Determines an asset's intrinsic value by projecting future free cash flows and discounting them back using a risk-adjusted rate.",
    "category": "finance",
    "group": "money-career",
    "group_name": "money-career",
    "tags": [
      "corporate-finance",
      "valuation",
      "dcf",
      "financial-modeling",
      "intrinsic-value"
    ],
    "resources": [
      {
        "label": "CFA Institute: Free Cash Flow Valuation Refresher Reading",
        "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/free-cash-flow-valuation"
      }
    ]
  },
  {
    "id": "weighted-average-cost-of-capital-wacc",
    "title": "Weighted Average Cost of Capital (WACC) & Hurdle Rate Determination",
    "description": "WACC represents a company's blended cost of capital across all sources of funding, weighting the after-tax cost of debt and the cost of equity (derived via CAPM).",
    "category": "finance",
    "group": "money-career",
    "group_name": "money-career",
    "tags": [
      "corporate-finance",
      "wacc",
      "cost-of-capital",
      "hurdle-rate",
      "valuation"
    ],
    "resources": [
      {
        "label": "Harvard Business Review: A Refresher on Cost of Capital",
        "url": "https://hbr.org/2015/04/a-refresher-on-cost-of-capital"
      }
    ]
  },
  {
    "id": "capital-structure-and-modigliani-miller-theorem",
    "title": "Capital Structure",
    "description": "The Modigliani-Miller theorem states that in a frictionless market without taxes or bankruptcy costs, enterprise value is independent of capital structure.",
    "category": "finance",
    "group": "money-career",
    "group_name": "money-career",
    "tags": [
      "capital-structure",
      "modigliani-miller",
      "corporate-finance",
      "debt-equity",
      "leverage"
    ],
    "resources": [
      {
        "label": "CFA Institute: Capital Structure Decisions and Leverage Theory",
        "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/capital-structure"
      }
    ],
    "lesson": {
      "idea": "Capital structure theory states that in a friction-free market without taxes or bankruptcy costs, a firm's total value remains unchanged whether financed by debt or equity.",
      "why": "Understanding this baseline helps financial managers focus on real-world market imperfections like tax benefits from debt interest and the risks of insolvency.",
      "example": "A software business evaluates whether taking a bank loan or issuing new stock slices the corporate pie differently without changing its underlying operating power."
    }
  },
  {
    "id": "mergers-and-acquisitions-accretion-dilution",
    "title": "M&A Mechanics",
    "description": "Accretion/dilution analysis evaluates whether a merger or acquisition increases or decreases the acquirer's post-transaction Earnings Per Share (EPS).",
    "category": "finance",
    "group": "money-career",
    "group_name": "money-career",
    "tags": [
      "m-and-a",
      "corporate-finance",
      "accretion-dilution",
      "synergies",
      "investment-banking"
    ],
    "resources": [
      {
        "label": "Wikipedia: Accretion/dilution analysis",
        "url": "https://en.wikipedia.org/wiki/Accretion%2Fdilution_analysis"
      }
    ],
    "lesson": {
      "idea": "An accretion-dilution analysis tests whether buying another company will increase or decrease the combined company's earnings per share after the deal closes.",
      "why": "Shareholders track deal mechanics and earnings per share closely to evaluate corporate leadership. A deal that shrinks earnings per share can trigger immediate investor skepticism.",
      "example": "A profitable retailer buys a growing supplier with cash; because the supplier's profits exceed the lost bank interest, earnings per share rise, making the deal accretive."
    }
  },
  {
    "id": "aristotelian-rhetorical-triangle-ethos-pathos-logos",
    "title": "The Aristotelian Rhetorical Triangle",
    "description": "Persuasion balances three core appeals: Ethos (credibility), Pathos (emotional resonance), and Logos (reasoning) to inspire lasting conviction.",
    "category": "communication",
    "group": "mind-growth",
    "group_name": "mind-growth",
    "tags": [
      "rhetoric",
      "persuasion",
      "classical-rhetoric",
      "argumentation",
      "philosophy"
    ],
    "resources": [
      {
        "label": "Stanford Encyclopedia of Philosophy: Aristotle's Rhetoric",
        "url": "https://plato.stanford.edu/entries/aristotle-rhetoric/"
      },
      {
        "label": "Harvard Business Review: The Necessary Art of Persuasion (Jay A. Conger)",
        "url": "https://hbr.org/1998/05/the-necessary-art-of-persuasion"
      }
    ],
    "lesson": {
      "idea": "Aristotle showed that persuasive communication rests on three pillars: credibility, emotional connection, and logical reasoning.",
      "why": "An argument relying solely on dry data often fails to move people, while pure emotion without logic quickly loses trust. Balancing this rhetorical triangle creates enduring persuasion.",
      "example": "A doctor explaining a vaccine shares medical trials for logic, personal clinical experience for credibility, and a patient story for empathy."
    }
  },
  {
    "id": "cialdini-principles-of-persuasion",
    "title": "Cialdini's Six Principles of Influence",
    "description": "Six behavioral triggers—Reciprocity, Scarcity, Authority, Consistency, Liking, and Consensus—that guide human compliance and decision-making.",
    "category": "communication",
    "group": "mind-growth",
    "group_name": "mind-growth",
    "tags": [
      "persuasion",
      "influence",
      "cialdini",
      "behavioral-psychology",
      "social-proof"
    ],
    "resources": [
      {
        "label": "Harvard Business Review: Harnessing the Science of Persuasion",
        "url": "https://hbr.org/2001/10/harnessing-the-science-of-persuasion"
      }
    ],
    "lesson": {
      "idea": "Human decisions are guided by key behavioral shortcuts including reciprocity, scarcity, authority, consistency, liking, and social consensus.",
      "why": "People face thousands of daily choices and rely on mental shortcuts to make fast decisions. Understanding these principles of influence helps teams design honest and compelling messages.",
      "example": "An online course mentions that only ten seats remain, triggering the scarcity principle to encourage prompt student enrollment."
    }
  },
  {
    "id": "framing-effects-and-cognitive-anchoring-in-persuasion",
    "title": "Framing Effects",
    "description": "Identical choices produce different decisions based on framing: emphasizing loss activates far greater urgency than highlighting equivalent gain.",
    "category": "communication",
    "group": "mind-growth",
    "group_name": "mind-growth",
    "tags": [
      "framing",
      "cognitive-bias",
      "kahneman-tversky",
      "persuasion",
      "decision-making"
    ],
    "resources": []
  },
  {
    "id": "elaboration-likelihood-model-central-vs-peripheral",
    "title": "The Elaboration Likelihood Model (ELM)",
    "description": "Persuasion operates via two pathways: the Central Route using deep logical scrutiny for lasting change, and the Peripheral Route relying on surface cues.",
    "category": "communication",
    "group": "mind-growth",
    "group_name": "mind-growth",
    "tags": [
      "elaboration-likelihood",
      "elm",
      "persuasion",
      "cognitive-processing",
      "psychology"
    ],
    "resources": [
      {
        "label": "Wikipedia: Elaboration likelihood model",
        "url": "https://en.wikipedia.org/wiki/Elaboration_likelihood_model"
      }
    ],
    "lesson": {
      "idea": "The elaboration likelihood model explains that people process persuasive messages through two routes: a deep central path focused on facts, or a fast peripheral path guided by surface cues.",
      "why": "Audience attention dictates message design. Motivated audiences demand rigorous evidence, while distracted audiences respond primarily to design quality and speaker charm.",
      "example": "A car advertisement highlights crash test ratings for analytical buyers while showcasing an attractive celebrity driving along the coast for casual viewers."
    }
  },
  {
    "id": "entropy-second-law-thermodynamics",
    "title": "Entropy & The Second Law of Thermodynamics",
    "description": "In any isolated system, total entropy must increase over time, defining the thermodynamic arrow of time.",
    "category": "science-nature",
    "group": "world-ideas",
    "group_name": "world-ideas",
    "tags": [
      "physics",
      "thermodynamics",
      "entropy"
    ],
    "resources": [
      {
        "label": "Wikipedia: Second law of thermodynamics",
        "url": "https://en.wikipedia.org/wiki/Second_law_of_thermodynamics"
      }
    ],
    "lesson": {
      "idea": "Entropy measures the degree of disorder in a physical system. The second law of thermodynamics states that total entropy in an isolated system consistently increases over time.",
      "why": "This universal law explains why heat flows from hot objects to cold ones and why time moves in a forward direction.",
      "example": "A hot cup of coffee left on a desk cools down as its heat disperses into the cooler surrounding room, without spontaneously reheating."
    }
  },
  {
    "id": "wave-particle-duality-double-slit",
    "title": "Wave-Particle Duality",
    "description": "Particles like electrons exhibit wave interference patterns when unobserved, yet collapse to localized point impacts upon detector measurement.",
    "category": "science-nature",
    "group": "world-ideas",
    "group_name": "world-ideas",
    "tags": [
      "quantum-mechanics",
      "physics",
      "experiments"
    ],
    "resources": [
      {
        "label": "Richard Feynman — The Character of Physical Law (MIT Press)",
        "url": "https://mitpress.mit.edu"
      }
    ]
  },
  {
    "id": "quantum-entanglement-bell-theorem",
    "title": "Quantum Entanglement & Bell's Theorem",
    "description": "John Stewart Bell mathematically proved that no local hidden variable theory can reproduce the quantum mechanical predictions of entangled states.",
    "category": "science-nature",
    "group": "world-ideas",
    "group_name": "world-ideas",
    "tags": [
      "quantum-physics",
      "bells-theorem",
      "entanglement"
    ],
    "resources": [
      {
        "label": "Wikipedia: Quantum entanglement",
        "url": "https://en.wikipedia.org/wiki/Quantum_entanglement"
      }
    ]
  },
  {
    "id": "crispr-cas9-gene-editing",
    "title": "CRISPR-Cas9 & Bacterial Adaptive Immunity",
    "description": "Discovered by Jennifer Doudna and Emmanuelle Charpentier as an ancient bacterial immune mechanism against phages.",
    "category": "science-nature",
    "group": "world-ideas",
    "group_name": "world-ideas",
    "tags": [
      "biology",
      "crispr",
      "genetics"
    ],
    "resources": [
      {
        "label": "Wikipedia: CRISPR",
        "url": "https://en.wikipedia.org/wiki/CRISPR"
      }
    ]
  }
];
