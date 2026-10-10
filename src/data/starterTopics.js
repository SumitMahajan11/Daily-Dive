/**
 * Curated first-spin starter topic set (16 topics across all 4 groups).
 * Hydrates instant spin with zero chunk delay on initial load.
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
      },
      {
        "label": "PyTorch MultiheadAttention Docs",
        "url": "https://pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html"
      }
    ]
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
    ]
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
        "label": "State Space Models Annotated (Albert Gu & Tri Dao)",
        "url": "https://srush.github.io/annotated-s4/"
      },
      {
        "label": "Mamba GitHub Repository",
        "url": "https://github.com/state-spaces/mamba"
      }
    ]
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
      },
      {
        "label": "Hugging Face RoPE Implementation in Llama",
        "url": "https://github.com/huggingface/transformers/blob/main/src/transformers/models/llama/modeling_llama.py"
      }
    ]
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
        "label": "Aswath Damodaran: Discounted Cash Flow Valuation (NYU Stern Lecture Notes)",
        "url": "https://pages.stern.nyu.edu/~adamodar/pdfiles/valn2ed/ch12.pdf"
      },
      {
        "label": "CFA Institute: Free Cash Flow Valuation Refresher Reading",
        "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/free-cash-flow-valuation"
      },
      {
        "label": "Corporate Finance Institute: DCF Model Training & Formula Guide",
        "url": "https://corporatefinanceinstitute.com/resources/valuation/dcf-formula-discounted-cash-flow/"
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
        "label": "Aswath Damodaran: Estimating Hurdle Rates and Cost of Capital (NYU Stern)",
        "url": "https://pages.stern.nyu.edu/~adamodar/pdfiles/country/wacc.pdf"
      },
      {
        "label": "CFA Institute: Cost of Capital and Capital Structure Analysis",
        "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/cost-of-capital"
      },
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
        "label": "Franco Modigliani & Merton H. Miller: The Cost of Capital, Corporation Finance and the Theory of Investment (AER 1958)",
        "url": "https://www.jstor.org/stable/1809766"
      },
      {
        "label": "Stewart C. Myers: The Capital Structure Puzzle (Journal of Finance 1984)",
        "url": "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1540-6261.1984.tb03646.x"
      },
      {
        "label": "CFA Institute: Capital Structure Decisions and Leverage Theory",
        "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/capital-structure"
      }
    ]
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
        "label": "Harvard Business Review: The Art of M&A Due Diligence",
        "url": "https://hbr.org/2010/06/the-art-of-ma-due-diligence"
      },
      {
        "label": "Corporate Finance Institute: Accretion Dilution Model Guide",
        "url": "https://corporatefinanceinstitute.com/resources/valuation/accretion-dilution-analysis/"
      },
      {
        "label": "Aswath Damodaran: The Value of Synergy in Mergers & Acquisitions",
        "url": "https://pages.stern.nyu.edu/~adamodar/pdfiles/papers/synergy.pdf"
      }
    ]
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
        "label": "Aristotle: Rhetoric (Translated by W. Rhys Roberts, MIT Classics)",
        "url": "http://classics.mit.edu/Aristotle/rhetoric.html"
      },
      {
        "label": "Stanford Encyclopedia of Philosophy: Aristotle's Rhetoric",
        "url": "https://plato.stanford.edu/entries/aristotle-rhetoric/"
      },
      {
        "label": "Harvard Business Review: The Necessary Art of Persuasion (Jay A. Conger)",
        "url": "https://hbr.org/1998/05/the-necessary-art-of-persuasion"
      }
    ]
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
        "label": "Robert B. Cialdini: Influence: The Psychology of Persuasion (Harper Business)",
        "url": "https://www.influenceatwork.com/our-founder/robert-cialdini-phd/"
      },
      {
        "label": "Association for Psychological Science: The Science of Social Influence",
        "url": "https://www.psychologicalscience.org/observer/the-science-of-influence"
      },
      {
        "label": "Harvard Business Review: Harnessing the Science of Persuasion",
        "url": "https://hbr.org/2001/10/harnessing-the-science-of-persuasion"
      }
    ]
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
    "resources": [
      {
        "label": "Amos Tversky & Daniel Kahneman: The Framing of Decisions and the Psychology of Choice (Science 1981)",
        "url": "https://www.science.org/doi/10.1126/science.7455683"
      },
      {
        "label": "Daniel Kahneman: Thinking, Fast and Slow (Farrar, Straus and Giroux)",
        "url": "https://us.macmillan.com/books/9780374533557/thinkingfastandslow"
      },
      {
        "label": "American Psychological Association: Decision Framing and Behavioral Economics",
        "url": "https://www.apa.org/pubs/journals/xge"
      }
    ]
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
        "label": "Richard E. Petty & John T. Cacioppo: The Elaboration Likelihood Model of Persuasion (Advances in Experimental Social Psychology 1986)",
        "url": "https://www.sciencedirect.com/science/article/pii/S0065260108602142"
      },
      {
        "label": "American Psychological Association: Cognitive Elaboration and Attitude Change",
        "url": "https://www.apa.org/pubs/journals/psp"
      },
      {
        "label": "Journal of Consumer Research: Testing the Central and Peripheral Routes to Persuasion",
        "url": "https://academic.oup.com/jcr"
      }
    ]
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
        "label": "Rudolf Clausius — The Mechanical Theory of Heat (1867)",
        "url": "https://en.wikipedia.org/wiki/Second_law_of_thermodynamics"
      }
    ]
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
        "label": "John S. Bell — Speakable and Unspeakable in Quantum Mechanics (Cambridge)",
        "url": "https://www.cambridge.org"
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
        "label": "Doudna & Charpentier — A Programmable Dual-RNA-Guided DNA Endonuclease in Adaptive Bacterial Immunity (Science 2012)",
        "url": "https://www.science.org/doi/10.1126/science.1225829"
      }
    ]
  }
];

export default starterTopics;
