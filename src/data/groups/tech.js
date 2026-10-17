/**
 * Daily Dive Topics Group: tech
 * Total topics: 313
 * Generated automatically from data/topics.curated.json
 */

export const topics = [
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
    "id": "residual-connections-resnet",
    "title": "Residual Connections",
    "description": "Introduces identity skip connections that formulate layer mappings as learning residual functions with reference to layer inputs.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "computer-vision",
      "deep-learning",
      "optimization"
    ],
    "resources": [
      {
        "label": "Deep Residual Learning for Image Recognition (He et al., 2015)",
        "url": "https://arxiv.org/abs/1512.03385"
      },
      {
        "label": "Residual Networks Behave Like Ensembles of Relatively Shallow Networks (Veit et al.)",
        "url": "https://arxiv.org/abs/1605.06431"
      },
      {
        "label": "PyTorch ResNet Implementation",
        "url": "https://github.com/pytorch/vision/blob/main/torchvision/models/resnet.py"
      }
    ],
    "lesson": {
      "idea": "Residual connections introduce identity skip paths that let neural layers learn residual functions relative to incoming layer inputs.",
      "why": "Deep networks encounter vanishing gradient signals during backward passes. Adding identity shortcuts preserves gradient flow directly through deep stacks.",
      "example": "ResNet backbones propagate unmodified activations across convolutional stages so deeper image recognition layers learn incremental feature refinements."
    }
  },
  {
    "id": "vision-transformers-vit",
    "title": "Vision Transformers (ViT)",
    "description": "Applies standard Transformer encoder architectures directly to non-overlapping 16x16 image patches treated as sequential token embeddings.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "computer-vision",
      "transformers",
      "deep-learning"
    ],
    "resources": [
      {
        "label": "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale",
        "url": "https://arxiv.org/abs/2010.11929"
      },
      {
        "label": "Google Research ViT JAX Repository",
        "url": "https://github.com/google-research/vision_transformer"
      },
      {
        "label": "Hugging Face Vision Transformer Guide",
        "url": "https://huggingface.co/docs/transformers/model_doc/vit"
      }
    ],
    "lesson": {
      "idea": "Vision Transformers process images by splitting pictures into a grid of small square patches and treating each patch like a word token in text.",
      "why": "Traditional vision models use rigid spatial filters across pixels. Vision transformers learn global relationships across the entire image from the start.",
      "example": "An image of a cat is divided into multiple smaller squares, and the model analyzes how the ear patch relates to the paw patch across the photo."
    }
  },
  {
    "id": "swin-transformer-shifted-windows",
    "title": "Swin Transformer",
    "description": "Constructs hierarchical feature maps with linear complexity relative to image size by computing self-attention only within local non-overlapping windows.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "computer-vision",
      "transformers",
      "vision-backbone"
    ],
    "resources": [
      {
        "label": "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows (Liu et al., ICCV)",
        "url": "https://arxiv.org/abs/2103.14030"
      },
      {
        "label": "Microsoft Swin-Transformer GitHub Repo",
        "url": "https://github.com/microsoft/Swin-Transformer"
      }
    ],
    "lesson": {
      "idea": "Swin transformers compute self-attention inside small local windows and shift window boundaries across successive layers to allow cross-window communication.",
      "why": "Calculating attention across every pixel in high-resolution images is too slow. Shifted windows maintain linear computation while connecting distant image regions.",
      "example": "A camera system inspects an ultra-wide panorama by analyzing local grids first, then shifting grid borders to detect large objects crossing grid lines."
    }
  },
  {
    "id": "sliding-window-and-longformer-attention",
    "title": "Sliding Window",
    "description": "Replaces full dense $O(N^2)$ attention matrices with localized sliding window bands combined with dilated and global attention anchor tokens.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "transformers",
      "sparse-attention",
      "long-context"
    ],
    "resources": [
      {
        "label": "Longformer: The Long-Document Transformer (Beltagy, Peters, Cohan)",
        "url": "https://arxiv.org/abs/2004.05150"
      },
      {
        "label": "Mistral 7B (arXiv:2310.06825)",
        "url": "https://arxiv.org/abs/2310.06825"
      },
      {
        "label": "Generating Long Sequences with Sparse Transformers (Child et al., OpenAI)",
        "url": "https://arxiv.org/abs/1904.10509"
      }
    ],
    "lesson": {
      "idea": "Sliding window attention structures replace dense quadratic matrices with localized attention bands and global anchor tokens across input documents.",
      "why": "Full self-attention across lengthy sequences incurs quadratic computational overhead. Local window patterns preserve essential neighbor context at linear computational cost.",
      "example": "Longformer processors calculate attention within adjacent token bands while routing global summary tokens across entire documents."
    }
  },
  {
    "id": "grouped-query-attention-gqa",
    "title": "Grouped-Query Attention (GQA)",
    "description": "Shares key-value heads across multiple query heads, dramatically reducing memory bandwidth while preserving multi-head model quality.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "transformers",
      "attention",
      "inference"
    ],
    "resources": [
      {
        "label": "GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints",
        "url": "https://arxiv.org/abs/2305.13245"
      },
      {
        "label": "Fast Transformer Decoding: One Write-Head is All You Need (Shazeer, 2019)",
        "url": "https://arxiv.org/abs/1911.02150"
      },
      {
        "label": "The Llama 3 Herd of Models (Meta AI)",
        "url": "https://arxiv.org/abs/2407.21783"
      }
    ],
    "lesson": {
      "idea": "Grouped-Query Attention (GQA) groups multiple query heads to share a smaller pool of key-value heads during transformer decoding.",
      "why": "Standard multi-head attention demands extensive memory bandwidth to transfer cached key-value tensors. Sharing heads relieves memory bandwidth pressure without degrading quality.",
      "example": "Llama checkpoints load consolidated key-value tensors across query head groups to accelerate auto-regressive text decoding."
    }
  },
  {
    "id": "lora-low-rank-adaptation",
    "title": "Low-Rank Adaptation (LoRA)",
    "description": "Freezes pre-trained model weights and injects trainable rank-decomposition matrix pairs into each attention and MLP projection layer.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "peft",
      "fine-tuning",
      "llm-optimization"
    ],
    "resources": [
      {
        "label": "LoRA: Low-Rank Adaptation of Large Language Models (Hu et al.)",
        "url": "https://arxiv.org/abs/2106.09685"
      },
      {
        "label": "Microsoft LoRA GitHub Repo",
        "url": "https://github.com/microsoft/LoRA"
      }
    ],
    "lesson": {
      "idea": "Low-Rank Adaptation (LoRA) freezes pre-trained foundation weights and injects trainable rank-decomposition matrix pairs into attention and MLP projection layers.",
      "why": "Modifying all weights across large parameter foundations requires vast memory overhead. Decomposing updates into compact low-rank matrices enables efficient fine-tuning.",
      "example": "Parameter-efficient adapters train low-rank matrices on downstream domain instructions while base transformer layers remain frozen."
    }
  },
  {
    "id": "qlora-quantized-fine-tuning",
    "title": "QLoRA & 4-bit NormalFloat Quantization",
    "description": "Enables fine-tuning of 65B+ parameter LLMs on a single 48GB GPU by combining 4-bit NormalFloat quantization, double quantization of scale factors.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "quantization",
      "fine-tuning",
      "peft"
    ],
    "resources": [
      {
        "label": "QLoRA: Efficient Finetuning of Quantized LLMs (Dettmers et al.)",
        "url": "https://arxiv.org/abs/2305.14314"
      },
      {
        "label": "Hugging Face Blog: Making LLMs even more accessible with bitsandbytes",
        "url": "https://huggingface.co/blog/4bit-transformers-bitsandbytes"
      }
    ],
    "lesson": {
      "idea": "QLoRA combines 4-bit NormalFloat quantization with low-rank adaptation adapters to enable fine-tuning on constrained GPU memory hardware.",
      "why": "Loading large uncompressed parameters consumes available device memory before fine-tuning begins. Quantizing base layers preserves precision while liberating memory for trainable adapter weights.",
      "example": "Quantized base models retain 4-bit NormalFloat weights in GPU memory while backpropagation updates low-rank adapters."
    }
  },
  {
    "id": "direct-preference-optimization-dpo",
    "title": "Direct Preference Optimization (DPO)",
    "description": "Optimizes language models directly on human preference pairs without needing a separate reward model or complex RL loops.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "alignment",
      "rlhf",
      "post-training"
    ],
    "resources": [
      {
        "label": "Direct Preference Optimization: Your Language Model is Secretly a Reward Model",
        "url": "https://arxiv.org/abs/2305.18290"
      },
      {
        "label": "Hugging Face TRL DPO Trainer Docs",
        "url": "https://huggingface.co/docs/trl/main/en/dpo_trainer"
      }
    ],
    "lesson": {
      "idea": "Direct Preference Optimization (DPO) optimizes language models directly on paired preferences using an implicit reward formulation without reinforcement learning.",
      "why": "Multi-stage reinforcement pipelines require separate reward estimators and unstable policy updates. A closed-form loss optimizes preference likelihood directly through standard cross-entropy.",
      "example": "Language model trainers minimize DPO loss over winning and losing response pairs to align conversational outputs."
    }
  },
  {
    "id": "rlhf-proximal-policy-optimization",
    "title": "RLHF: Reinforcement Learning from Human Feedback & Policy Alignment",
    "description": "Aligns language models with human intentions by first training a Bradley-Terry reward model on human comparisons.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "alignment",
      "reinforcement-learning",
      "llms"
    ],
    "resources": [
      {
        "label": "Training language models to follow instructions with human feedback (InstructGPT)",
        "url": "https://arxiv.org/abs/2203.02155"
      },
      {
        "label": "Deep Reinforcement Learning from Human Preferences (Christiano et al.)",
        "url": "https://arxiv.org/abs/1706.03741"
      },
      {
        "label": "Hugging Face: Illustrating Reinforcement Learning from Human Feedback",
        "url": "https://huggingface.co/blog/rlhf"
      }
    ],
    "lesson": {
      "idea": "RLHF aligns language models with human intentions using policy optimization guided by a reward model trained on comparison feedback.",
      "why": "Supervised training mirrors prompt distributions without distinguishing between subtle response qualities. Scalar reinforcement feedback steers model policies toward human preferences.",
      "example": "InstructGPT pipelines update language policies via reinforcement algorithms against reward scores assigned to generated completions."
    }
  },
  {
    "id": "constitutional-ai-and-rlaif",
    "title": "Constitutional AI",
    "description": "Scales model alignment by using a set of natural language principles ('constitution') and self-critique loops to generate synthetic revision pairs and train.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "alignment",
      "ai-safety",
      "rlhf"
    ],
    "resources": [
      {
        "label": "Constitutional AI: Harmlessness from AI Feedback (Anthropic)",
        "url": "https://arxiv.org/abs/2212.08073"
      },
      {
        "label": "RLAIF: Scaling Reinforcement Learning from Human Feedback with AI Feedback (Google)",
        "url": "https://arxiv.org/abs/2309.00267"
      }
    ],
    "lesson": {
      "idea": "Constitutional AI scales alignment by evaluating model outputs against explicit natural language principles to guide synthetic critique and revision loops.",
      "why": "Gathering continuous human evaluation data introduces severe operational bottlenecks. Principle-driven feedback generates consistent critique data autonomously.",
      "example": "Automated critique loops revise responses according to harmlessness rules before models train on the resulting pairs."
    }
  },
  {
    "id": "kahneman-tversky-optimization-kto",
    "title": "Kahneman-Tversky Optimization (KTO)",
    "description": "Applies behavioral economics prospect theory to LLM alignment by maximizing the expected human utility of generated outputs using unpaired binary feedback.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "alignment",
      "loss-functions",
      "nlp"
    ],
    "resources": [
      {
        "label": "KTO: Model Alignment as Prospect Theoretic Optimization (Ethayarajh et al.)",
        "url": "https://arxiv.org/abs/2402.01306"
      },
      {
        "label": "Contextual AI: KTO Technical Writeup",
        "url": "https://contextual.ai/better-cheaper-faster-llm-alignment-with-kto/"
      },
      {
        "label": "TRL KTO Trainer Docs",
        "url": "https://huggingface.co/docs/trl/main/en/kto_trainer"
      }
    ],
    "lesson": {
      "idea": "Kahneman-Tversky Optimization (KTO) aligns language models using prospect theory utility functions directly on unpaired binary desirable or undesirable signals.",
      "why": "Curating pairwise preference rankings requires complex data collection. Evaluating individual outputs against reference baselines aligns models using independent feedback signals.",
      "example": "Alignment pipelines assign binary desirable flags to helpful responses to update generation policy parameters directly."
    }
  },
  {
    "id": "prompt-tuning-and-prefix-tuning",
    "title": "Prefix-Tuning & Prompt Tuning",
    "description": "Freezes all pre-trained model weights and prepends continuous, task-specific virtual token embeddings to the input sequence or key-value activation layers.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "peft",
      "parameter-efficient",
      "prompting"
    ],
    "resources": [
      {
        "label": "Prefix-Tuning: Optimizing Continuous Prompts for Generation (Li & Liang)",
        "url": "https://arxiv.org/abs/2101.00190"
      },
      {
        "label": "The Power of Scale for Parameter-Efficient Prompt Tuning (Lester et al., Google)",
        "url": "https://arxiv.org/abs/2104.08691"
      },
      {
        "label": "Hugging Face PEFT Prompt Tuning Guide",
        "url": "https://huggingface.co/docs/peft/package_reference/prompt_tuning"
      }
    ],
    "lesson": {
      "idea": "Prefix-Tuning and prompt tuning freeze base model parameters while prepending continuous virtual token vectors to inputs or key-value layers.",
      "why": "Generating distinct model checkpoints for diverse tasks demands excessive storage. Modifying small sets of prefix parameters adapts models without parameter duplication.",
      "example": "Virtual token prompts prepend continuous prefix representations to transformer activation sequences for task adaptation."
    }
  },
  {
    "id": "flashattention-tiling-kernel",
    "title": "FlashAttention & IO-Aware GPU Tiling",
    "description": "Restructures the self-attention softmax computation using online softmax normalization and memory tiling between GPU HBM and SRAM.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "gpu-kernels",
      "cuda",
      "transformer-inference"
    ],
    "resources": [
      {
        "label": "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness (Dao et al.)",
        "url": "https://arxiv.org/abs/2205.14135"
      },
      {
        "label": "FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning",
        "url": "https://arxiv.org/abs/2307.08691"
      }
    ],
    "lesson": {
      "idea": "FlashAttention restructures attention computation using IO-Aware GPU tiling and online softmax scaling to minimize data movement across memory tiers.",
      "why": "Standard attention mechanisms bottleneck on continuous reads and writes between high-bandwidth memory and fast SRAM caches. Tiling preserves intermediate blocks on-chip.",
      "example": "GPU kernels tile key and query blocks in SRAM to compute attention without writing intermediate matrices."
    }
  },
  {
    "id": "kv-caching-autoregressive-decoding",
    "title": "KV-Caching in Autoregressive Generation",
    "description": "Stores key and value tensor representations of historical prompt and generation tokens in GPU memory during autoregressive generation.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "llm-inference",
      "memory-optimization",
      "deep-learning"
    ],
    "resources": [
      {
        "label": "Hugging Face Docs: Cache strategies for Transformer Generation",
        "url": "https://huggingface.co/docs/transformers/kv_cache"
      }
    ],
    "lesson": {
      "idea": "KV-Caching in autoregressive generation retains computed key and value activations in memory across successive token generation steps.",
      "why": "Recomputing attention across historical context tokens at every step imposes quadratic computational penalties. Storing key-value tensors restricts computation to incoming tokens.",
      "example": "Generation loops retrieve previous key and value activations from memory to calculate attention for incoming tokens."
    }
  },
  {
    "id": "pagedattention-virtual-memory",
    "title": "PagedAttention & vLLM Memory Paging",
    "description": "Adapts operating system virtual memory paging concepts to LLM KV-cache management.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "systems-for-ml",
      "inference-serving",
      "vllm"
    ],
    "resources": [
      {
        "label": "Efficient Memory Management for Large Language Model Serving with PagedAttention (Kwon et al.)",
        "url": "https://arxiv.org/abs/2309.06180"
      }
    ],
    "lesson": {
      "idea": "PagedAttention applies virtual memory paging principles to manage key-value caches across non-contiguous physical memory blocks in vLLM serving frameworks.",
      "why": "Continuous memory allocations produce fragmented memory waste when sequence lengths fluctuate during serving. Dynamic paging accommodates fluctuating sequence lengths without allocation waste.",
      "example": "Inference servers allocate non-contiguous memory blocks dynamically to store key-value cache tokens during request processing."
    }
  },
  {
    "id": "speculative-decoding-draft-models",
    "title": "Speculative Decoding",
    "description": "Accelerates memory-bandwidth-bound LLM generation by having a fast, smaller draft model generate $K$ speculative tokens in parallel.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "llm-inference",
      "speedup",
      "algorithms"
    ],
    "resources": [
      {
        "label": "Fast Inference from Transformers via Speculative Decoding (Leviathan et al., Google)",
        "url": "https://arxiv.org/abs/2211.17192"
      },
      {
        "label": "Accelerating Large Language Model Decoding with Speculative Sampling (DeepMind)",
        "url": "https://arxiv.org/abs/2302.01318"
      }
    ],
    "lesson": {
      "idea": "Speculative decoding utilizes a compact draft model to generate candidate tokens that a larger target model verifies simultaneously.",
      "why": "Autoregressive decoding bottlenecks on memory bandwidth during serial token passes. Validating multiple speculative candidates in parallel forward passes amortizes memory latency.",
      "example": "Target transformers evaluate candidate token sequences generated by lightweight draft models in single verification passes."
    }
  },
  {
    "id": "awq-activation-aware-quantization",
    "title": "Activation-Aware Weight Quantization (AWQ)",
    "description": "Compresses LLM weights to 4-bit precision without retraining by observing that preserving the top 1% of weights corresponding to salient activation channels.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "quantization",
      "model-compression",
      "gpu"
    ],
    "resources": [
      {
        "label": "AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration (Lin et al.)",
        "url": "https://arxiv.org/abs/2306.00978"
      },
      {
        "label": "AutoAWQ GitHub Implementation",
        "url": "https://github.com/casper-hansen/AutoAWQ"
      }
    ],
    "lesson": {
      "idea": "Activation-Aware Weight Quantization (AWQ) protects salient weight channels corresponding to prominent activation magnitudes prior to low-bit weight quantization.",
      "why": "Indiscriminate weight quantization degrades model output by truncating critical outlier channels. Shielding sensitive weight coordinates preserves general task accuracy without retraining.",
      "example": "Compression algorithms identify high-magnitude activation channels to scale and protect essential weights during integer quantization."
    }
  },
  {
    "id": "gptq-post-training-quantization",
    "title": "GPTQ: Accurate Post-Training Quantization",
    "description": "Performs second-order Hessian error compensation using Optimal Brain Surgeon equations to compress 175B+ parameter language models to 3-bit or 4-bit integer.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "quantization",
      "compression",
      "nlp"
    ],
    "resources": [
      {
        "label": "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers (Frantar et al.)",
        "url": "https://arxiv.org/abs/2210.17323"
      },
      {
        "label": "AutoGPTQ GitHub Repository",
        "url": "https://github.com/AutoGPTQ/AutoGPTQ"
      },
      {
        "label": "Hugging Face: Overview of Post-Training Quantization Methods",
        "url": "https://huggingface.co/docs/transformers/main_classes/quantization"
      }
    ],
    "lesson": {
      "idea": "GPTQ executes accurate post-training quantization by leveraging second-order Hessian error compensation to adjust remaining unquantized weights iteratively.",
      "why": "Sequential parameter rounding without error compensation compounds output deviation across deep layers. Compensating remaining weights preserves layer output fidelity during compression.",
      "example": "AutoGPTQ routines quantize weight matrices column by column while adjusting subsequent parameters to compensate rounding errors."
    }
  },
  {
    "id": "continuous-batching-orca",
    "title": "Iteration-Level Continuous Batching (Orca)",
    "description": "Schedules LLM generation at the token iteration level rather than the request level, eliminating idle GPU compute.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "llm-serving",
      "gpu",
      "systems-ml"
    ],
    "resources": [
      {
        "label": "Orca: A Distributed Serving System for Transformer-Based Generative Models (Yu et al., OSDI)",
        "url": "https://www.usenix.org/conference/osdi22/presentation/yu"
      },
      {
        "label": "Triton Inference Server Architecture",
        "url": "https://github.com/triton-inference-server/server"
      },
      {
        "label": "TensorRT-LLM Architecture Overview",
        "url": "https://github.com/NVIDIA/TensorRT-LLM"
      }
    ],
    "lesson": {
      "idea": "Iteration-level continuous batching schedules transformer workloads at discrete token steps, inserting and retiring sequences dynamically within active batches.",
      "why": "Static request batching leaves processing hardware underutilized when co-scheduled sequences finish at varying times. Continuous iteration scheduling maximizes hardware occupancy.",
      "example": "Serving engines evict finished sequences and inject incoming generation requests into running batches at iteration boundaries."
    }
  },
  {
    "id": "beam-search-and-top-p-sampling",
    "title": "Nucleus (Top-p) Sampling, Temperature",
    "description": "Decoding strategies for language models; nucleus (top-p) sampling dynamically samples from the smallest token set exceeding probability threshold p.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "decoding",
      "sampling",
      "nlp"
    ],
    "resources": [
      {
        "label": "The Curious Case of Neural Text Degeneration (Holtzman et al., ICLR)",
        "url": "https://arxiv.org/abs/1904.09751"
      },
      {
        "label": "Hugging Face How to Generate Text: Using Different Decoding Methods",
        "url": "https://huggingface.co/blog/how-to-generate"
      }
    ],
    "lesson": {
      "idea": "Nucleus (Top-p) sampling dynamically samples candidate tokens from the smallest set exceeding probability threshold p, while temperature adjusts output probability distributions.",
      "why": "Fixed top-k decoding risks admitting implausible tokens during flat distributions or restricting valid choices during sharp distributions. Adaptive thresholds adjust candidate pools dynamically.",
      "example": "Decoding routines scale output logits with temperature and filter probability tails exceeding threshold p before sampling."
    }
  },
  {
    "id": "dense-retrieval-bi-encoders",
    "title": "Dense Retrieval with Bi-Encoder Architectures",
    "description": "Encodes queries and passage documents into a shared continuous embedding space using twin neural encoders trained with contrastive infoNCE objectives.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "rag",
      "embeddings",
      "vector-search"
    ],
    "resources": [
      {
        "label": "Dense Passage Retrieval for Open-Domain Question Answering (Karpukhin et al., Meta)",
        "url": "https://arxiv.org/abs/2004.04906"
      },
      {
        "label": "Sentence-Transformers Library Documentation",
        "url": "https://sbert.net/"
      },
      {
        "label": "MTEB: Massive Text Embedding Benchmark Leaderboard",
        "url": "https://huggingface.co/spaces/mteb/leaderboard"
      }
    ],
    "lesson": {
      "idea": "Dense retrieval with bi-encoder architectures maps queries and passage texts into a continuous embedding space using twin neural encoders.",
      "why": "Lexical indexing misses relevant passages when query vocabulary diverges from source documents. Continuous vector spaces capture semantic correspondence beyond literal surface words.",
      "example": "Information retrieval pipelines compare query vector embeddings against passage representations using inner product nearest neighbor search."
    }
  },
  {
    "id": "cross-encoder-reranking",
    "title": "Cross-Encoder Reranking in Multi-Stage Retrieval",
    "description": "Feeds candidate document-query pairs jointly through full self-attention layers to capture deep token-level cross-interactions.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "rag",
      "search",
      "information-retrieval"
    ],
    "resources": [
      {
        "label": "Sentence-Transformers Cross-Encoders Guide",
        "url": "https://www.sbert.net/docs/pretrained_cross-encoders.html"
      },
      {
        "label": "Cohere Rerank: Enhancing RAG Systems",
        "url": "https://cohere.com/rerank"
      },
      {
        "label": "Information Retrieval: From Bi-Encoders to Cross-Encoders (Thakur et al.)",
        "url": "https://arxiv.org/abs/2104.08663"
      }
    ],
    "lesson": {
      "idea": "Cross-encoder reranking feeds query-document pairs jointly through full self-attention layers during multi-stage retrieval to capture token-level interactions.",
      "why": "Bi-encoders encode queries and passages separately, precluding granular cross-token attention. Joint encoding yields accurate relevance scoring for candidate re-ranking stages.",
      "example": "Second-stage retrieval ranks candidate passages by processing query and text tokens together through cross-encoder attention layers."
    }
  },
  {
    "id": "hierarchical-navigable-small-world-hnsw",
    "title": "Hierarchical Navigable Small World (HNSW) Graphs",
    "description": "A multi-layer graph data structure for Approximate Nearest Neighbor (ANN) search that achieves logarithmic search complexity by executing skip-list-style greedy.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "vector-search",
      "algorithms",
      "indexing"
    ],
    "resources": [
      {
        "label": "Efficient and Robust Approximate Nearest Neighbor Search Using HNSW (Malkov & Yashunin)",
        "url": "https://arxiv.org/abs/1603.09320"
      },
      {
        "label": "Pinecone Learning Center: Hierarchical Navigable Small World",
        "url": "https://www.pinecone.io/learn/series/faiss/hnsw/"
      },
      {
        "label": "Faiss Library: High-Performance Vector Indexing (Meta)",
        "url": "https://github.com/facebookresearch/faiss"
      }
    ],
    "lesson": {
      "idea": "Hierarchical Navigable Small World (HNSW) graphs organize vectors into hierarchical graph layers to execute approximate nearest neighbor search in logarithmic time.",
      "why": "Exhaustive vector distance scans become computationally prohibitive across massive embedding indexes. Multi-layer graphs allow greedy routing across skip layers toward proximate neighbors.",
      "example": "Vector databases traverse upper graph links to reach relevant clusters before exploring bottom layers for nearest neighbors."
    }
  },
  {
    "id": "graphrag-knowledge-graph-retrieval",
    "title": "GraphRAG",
    "description": "Extracts entity-relationship graphs and community summaries from raw document corpora via LLMs to synthesize answers across diffuse.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "rag",
      "knowledge-graphs",
      "llms"
    ],
    "resources": [
      {
        "label": "From Local to Global: A Graph RAG Approach to Query-Focused Summarization (Microsoft)",
        "url": "https://arxiv.org/abs/2404.16130"
      },
      {
        "label": "Microsoft GraphRAG Official Repository",
        "url": "https://github.com/microsoft/graphrag"
      }
    ],
    "lesson": {
      "idea": "GraphRAG extracts entity-relationship knowledge graphs and community summaries from source text to guide structured context retrieval during query generation.",
      "why": "Standard passage search fails to synthesize dispersed concepts that span separate documents. Structured graph edges connect related entities across heterogeneous text corpora.",
      "example": "Retrieval pipelines query entity relationship graphs and community summaries to answer broad questions across complex corpora."
    }
  },
  {
    "id": "hypothetical-document-embeddings-hyde",
    "title": "Hypothetical Document Embeddings (HyDE)",
    "description": "Zero-shot retrieval technique where an instruction-tuned LLM first generates a hypothetical answer document for a given query.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "rag",
      "retrieval",
      "prompt-engineering"
    ],
    "resources": [
      {
        "label": "Precise Zero-Shot Dense Retrieval without Relevance Labels (Gao et al.)",
        "url": "https://arxiv.org/abs/2212.10496"
      }
    ],
    "lesson": {
      "idea": "Hypothetical Document Embeddings (HyDE) prompts a language model to generate hypothetical documents whose embeddings guide zero-shot dense passage retrieval.",
      "why": "Short or ambiguous search queries lack sufficient lexical context for effective dense vector matching. Synthetic documents mirror the embedding patterns of target source texts.",
      "example": "Search applications embed generated hypothetical answers to locate relevant real documents within dense index collections."
    }
  },
  {
    "id": "denoising-diffusion-probabilistic-models-ddpm",
    "title": "Denoising Diffusion Probabilistic Models (DDPM)",
    "description": "Generates data samples by reversing a parameterized Markov chain that gradually injects Gaussian noise into training images.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "generative-ai",
      "diffusion",
      "computer-vision"
    ],
    "resources": [
      {
        "label": "Denoising Diffusion Probabilistic Models (Ho, Jain, Abbeel, 2020)",
        "url": "https://arxiv.org/abs/2006.11239"
      },
      {
        "label": "What are Diffusion Models? (Lilian Weng)",
        "url": "https://lilianweng.github.io/posts/2021-07-11-diffusion-models/"
      },
      {
        "label": "Hugging Face Diffusers Library Documentation",
        "url": "https://huggingface.co/docs/diffusers/index"
      }
    ],
    "lesson": {
      "idea": "Denoising Diffusion Probabilistic Models (DDPM) generate data samples by learning to reverse a parameterized Markov chain that injects noise into images.",
      "why": "Direct likelihood modeling often encounters unstable adversarial dynamics during generation. Parameterized reverse denoising steps reconstruct sharp sample distributions stably.",
      "example": "Image synthesis models predict and remove injected Gaussian noise across iterative steps to generate realistic pixel outputs."
    }
  },
  {
    "id": "classifier-free-guidance-cfg",
    "title": "Classifier-Free Guidance (CFG)",
    "description": "Steers diffusion sampling towards text prompt alignment without requiring a separate classifier network by jointly training conditional and unconditional.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "diffusion",
      "generative-ai",
      "sampling"
    ],
    "resources": [
      {
        "label": "Classifier-Free Diffusion Guidance (Ho & Salimans, 2021)",
        "url": "https://arxiv.org/abs/2207.12598"
      },
      {
        "label": "Understanding Classifier-Free Guidance (Sander Dieleman)",
        "url": "https://benanne.github.io/2022/05/26/guidance.html"
      }
    ],
    "lesson": {
      "idea": "Classifier-Free Guidance (CFG) steers diffusion generation toward prompt alignment by combining conditional and unconditional sampling predictions without external classifier networks.",
      "why": "Training external classifiers on noisy intermediate representations introduces architectural complexity. Jointly training with null condition dropouts enables direct guidance scaling.",
      "example": "Generative diffusion pipelines extrapolate between conditional text predictions and unconditional outputs to sharpen prompt alignment."
    }
  },
  {
    "id": "latent-diffusion-models-stable-diffusion",
    "title": "Latent Diffusion Models (LDMs)",
    "description": "Transfers the iterative diffusion and denoising process from high-dimensional pixel space into the compressed latent space of a pre-trained autoencoder.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "diffusion",
      "computer-vision",
      "generative-ai"
    ],
    "resources": [
      {
        "label": "High-Resolution Image Synthesis with Latent Diffusion Models (Rombach et al.)",
        "url": "https://arxiv.org/abs/2112.10752"
      },
      {
        "label": "CompVis Stable Diffusion GitHub",
        "url": "https://github.com/CompVis/stable-diffusion"
      },
      {
        "label": "SDXL: Improving Latent Diffusion Models (Stability AI)",
        "url": "https://arxiv.org/abs/2307.01952"
      }
    ],
    "lesson": {
      "idea": "Latent Diffusion Models (LDMs) execute iterative diffusion and denoising operations within the compressed latent space of a pre-trained autoencoder.",
      "why": "Computing multi-step diffusion in raw high-resolution pixel space consumes excessive processing time and memory. Compact latent manifolds preserve perceptual detail while accelerating generation.",
      "example": "Stable Diffusion pipelines denoise compressed latent representations across diffusion steps before decoding latents into final images."
    }
  },
  {
    "id": "variational-autoencoders-vae",
    "title": "Variational Autoencoders",
    "description": "Maps inputs into a smooth continuous latent space using the reparameterization trick, allowing stable generation of new samples.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "generative-ai",
      "probabilistic-ml",
      "deep-learning"
    ],
    "resources": [
      {
        "label": "Auto-Encoding Variational Bayes (Kingma & Welling, 2013)",
        "url": "https://arxiv.org/abs/1312.6114"
      },
      {
        "label": "Tutorial on Variational Autoencoders (Carl Doersch)",
        "url": "https://arxiv.org/abs/1606.05908"
      },
      {
        "label": "PyTorch VAE Implementation Guide",
        "url": "https://github.com/AntixK/PyTorch-VAE"
      }
    ],
    "lesson": {
      "idea": "Variational Autoencoders map input data into smooth continuous latent distributions via the reparameterization trick to support probabilistic reconstruction and sampling.",
      "why": "Standard autoencoder representations develop irregular latent gaps that disrupt generative decoding. Imposing prior distribution penalties enforces continuous, interpolatable latent spaces.",
      "example": "Deep autoencoders sample latent vectors from smooth continuous distributions to reconstruct images with trained decoders."
    }
  },
  {
    "id": "vector-quantized-vae-vqvae",
    "title": "Vector Quantized VAE (VQ-VAE)",
    "description": "Learns discrete latent representations by quantizing continuous encoder vectors to their nearest entry in a learned codebook.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "generative-ai",
      "codebook",
      "discrete-latent"
    ],
    "resources": [
      {
        "label": "Neural Discrete Representation Learning (van den Oord et al., DeepMind)",
        "url": "https://arxiv.org/abs/1711.00937"
      },
      {
        "label": "Generating Diverse High-Resolution Images with VQ-VAE-2 (Razavi et al.)",
        "url": "https://arxiv.org/abs/1906.00446"
      }
    ],
    "lesson": {
      "idea": "Vector Quantized VAE (VQ-VAE) architectures map continuous encoder representations to nearest entries in a learned discrete codebook.",
      "why": "Continuous latent variables frequently experience posterior collapse when paired with expressive decoders. Discrete codebook quantization maintains distinct symbolic bottlenecks without collapse.",
      "example": "Neural audio encoders quantize continuous acoustic features into discrete codebook sequences for autoregressive sequence modeling."
    }
  },
  {
    "id": "adamw-decoupled-weight-decay",
    "title": "AdamW",
    "description": "Decouples weight decay from gradient momentum updates, preventing L2 regularization from degrading adaptive learning rates.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "optimization",
      "deep-learning",
      "training"
    ],
    "resources": [
      {
        "label": "Decoupled Weight Decay Regularization (Loshchilov & Hutter, 2017)",
        "url": "https://arxiv.org/abs/1711.05101"
      }
    ],
    "lesson": {
      "idea": "AdamW decouples weight decay from adaptive gradient momentum updates, ensuring uniform regularization across parameters regardless of historical gradient scale.",
      "why": "Coupling L2 penalties with adaptive moving averages diminishes regularization on weights with infrequent large gradients. Direct parameter decay maintains consistent regularization strength.",
      "example": "Optimization routines apply decoupled weight decay directly to model parameters after computing adaptive Adam step directions."
    }
  },
  {
    "id": "rms-normalization-and-layer-norm",
    "title": "Root Mean Square Normalization (RMSNorm)",
    "description": "A computationally streamlined alternative to LayerNorm that scales input activations by their root mean square alone, discarding mean centering.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "transformers",
      "normalization",
      "deep-learning"
    ],
    "resources": [
      {
        "label": "Root Mean Square Layer Normalization (Zhang & Sennrich, 2019)",
        "url": "https://arxiv.org/abs/1910.07467"
      },
      {
        "label": "Layer Normalization (Ba, Kiros, Hinton, 2016)",
        "url": "https://arxiv.org/abs/1607.06450"
      },
      {
        "label": "Flash-Linear-Attention RMSNorm Kernel",
        "url": "https://github.com/sustcsonglin/flash-linear-attention"
      }
    ],
    "lesson": {
      "idea": "Root Mean Square Normalization (RMSNorm) scales layer input activations by their root mean square alone, omitting the mean centering operation in LayerNorm.",
      "why": "Calculating mean statistics requires additional reduction passes across tensor dimensions without yielding noticeable stability improvements. Normalizing by root mean square preserves scaling stability.",
      "example": "Transformer layers divide incoming token activation vectors by root mean square values to stabilize layer inputs."
    }
  },
  {
    "id": "cosine-annealing-warmup-schedules",
    "title": "Cosine Annealing with Warmup Schedules",
    "description": "Linearly ramps learning rates from zero during initial iterations to stabilize early optimizer variance.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "training",
      "optimization",
      "hyperparameters"
    ],
    "resources": [
      {
        "label": "SGDR: Stochastic Gradient Descent with Warm Restarts (Loshchilov & Hutter)",
        "url": "https://arxiv.org/abs/1608.03983"
      },
      {
        "label": "Scaling Laws for Neural Language Models (Kaplan et al.)",
        "url": "https://arxiv.org/abs/2001.08361"
      }
    ],
    "lesson": {
      "idea": "Cosine annealing with warmup schedules linearly ramps learning rates during initial iterations before gradually decaying them following a cosine curve.",
      "why": "Elevated learning rates during early optimization can destabilize randomly initialized parameters. Gradual warming followed by smooth cosine decay supports stable training convergence.",
      "example": "Training loops scale optimizer learning rates upward over initial steps before decreasing values along cosine curves."
    }
  },
  {
    "id": "gradient-accumulation-and-mixed-precision",
    "title": "FP16/BF16 Mixed Precision",
    "description": "Accelerates deep learning training and halves GPU memory by running tensor contractions in Bfloat16 or FP16 Tensor Cores while maintaining master FP32 parameter.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "cuda",
      "gpu-optimization",
      "training"
    ],
    "resources": [
      {
        "label": "Mixed Precision Training (Micikevicius et al., NVIDIA & Baidu)",
        "url": "https://arxiv.org/abs/1710.03740"
      },
      {
        "label": "NVIDIA Apex Documentation",
        "url": "https://nvidia.github.io/apex/"
      }
    ],
    "lesson": {
      "idea": "FP16 and BF16 mixed precision training accelerates neural computation and halves GPU memory by running tensor contractions in half precision while preserving master weights.",
      "why": "Full precision storage underutilizes modern tensor acceleration cores and limits batch sizes. Half-precision computation conserves bandwidth while master copies prevent precision loss.",
      "example": "Automatic mixed precision contexts cast forward activations into Bfloat16 while storing master parameter copies in full precision."
    }
  },
  {
    "id": "proximal-policy-optimization-ppo",
    "title": "Proximal Policy Optimization (PPO)",
    "description": "An on-policy actor-critic algorithm that maximizes a clipped surrogate objective function to penalize policy updates that deviate excessively from the previous.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "reinforcement-learning",
      "policy-gradient",
      "optimization"
    ],
    "resources": [
      {
        "label": "Proximal Policy Optimization Algorithms (Schulman et al., OpenAI)",
        "url": "https://arxiv.org/abs/1707.06347"
      },
      {
        "label": "OpenAI Spinning Up: Proximal Policy Optimization",
        "url": "https://spinningup.openai.com/en/latest/algorithms/ppo.html"
      },
      {
        "label": "CleanRL: High-Quality Single-File Implementation of PPO",
        "url": "https://github.com/vwxyzjn/cleanrl"
      }
    ],
    "lesson": {
      "idea": "Proximal Policy Optimization (PPO) maximizes a clipped surrogate objective function to prevent policy parameter updates from straying excessively from previous iterations.",
      "why": "Unconstrained policy gradient steps can cause policy collapse when updates move into detrimental performance regions. Clipping probability ratios enforces bounded, stable updates.",
      "example": "Reinforcement learning agents clip surrogate policy objective ratios to stabilize actor updates during environmental interaction."
    }
  },
  {
    "id": "monte-carlo-tree-search-alphazero",
    "title": "Monte Carlo Tree Search (MCTS)",
    "description": "Combines deep policy and value networks with heuristic tree search (selection) using Upper Confidence Bounds applied to Trees (UCT) to guide decision-making.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "reinforcement-learning",
      "search",
      "planning"
    ],
    "resources": [
      {
        "label": "Mastering the Game of Go without Human Knowledge (Silver et al., Nature)",
        "url": "https://www.nature.com/articles/nature24270"
      },
      {
        "label": "DeepMind AlphaGo Research Archive",
        "url": "https://deepmind.google/technologies/alphago/"
      }
    ],
    "lesson": {
      "idea": "Monte Carlo Tree Search (MCTS) combines neural policy and value evaluations with heuristic search trees to navigate complex decision spaces.",
      "why": "Exhaustive evaluation of combinatorial game branches exceeds computational budgets. Heuristic selection using confidence bounds focuses exploration along promising trajectory branches.",
      "example": "AlphaZero systems evaluate board positions by running simulated rollouts and selecting moves using tree search bounds."
    }
  },
  {
    "id": "deep-q-networks-dqn-experience-replay",
    "title": "Deep Q-Networks (DQN)",
    "description": "Overcomes training instability in non-linear function approximation for Q-learning by employing experience replay buffers to break sample temporal correlations.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "reinforcement-learning",
      "deep-learning",
      "q-learning"
    ],
    "resources": [
      {
        "label": "Human-level Control Through Deep Reinforcement Learning (Mnih et al., Nature)",
        "url": "https://www.nature.com/articles/nature14236"
      },
      {
        "label": "Rainbow: Combining Improvements in Deep Reinforcement Learning",
        "url": "https://arxiv.org/abs/1710.02298"
      },
      {
        "label": "PyTorch Reinforcement Learning Tutorial (DQN)",
        "url": "https://pytorch.org/tutorials/intermediate/reinforcement_q_learning.html"
      }
    ],
    "lesson": {
      "idea": "Deep Q-Networks (DQN) combine deep neural networks with experience replay buffers to approximate action-value functions during reinforcement learning.",
      "why": "Sequential state transitions introduce temporal correlation and non-stationary training distributions. Sampling transition batches randomly from replay buffers stabilizes optimization.",
      "example": "DQN controllers sample batches of past environmental transitions from replay buffers to calculate temporal difference errors."
    }
  },
  {
    "id": "clip-contrastive-language-image-pretraining",
    "title": "CLIP: Contrastive Language-Image Pretraining",
    "description": "Pre-trains image and text encoders simultaneously on hundreds of millions of web image-caption pairs using a symmetric cross-entropy loss over matched diagonal.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "multimodal",
      "contrastive-learning",
      "zero-shot"
    ],
    "resources": [
      {
        "label": "Learning Transferable Visual Models From Natural Language Supervision (Radford et al., OpenAI)",
        "url": "https://arxiv.org/abs/2103.00020"
      },
      {
        "label": "OpenCLIP: Open-Source Reproductions of CLIP",
        "url": "https://github.com/mlfoundations/open_clip"
      },
      {
        "label": "OpenAI CLIP GitHub Repository",
        "url": "https://github.com/openai/CLIP"
      }
    ],
    "lesson": {
      "idea": "CLIP pre-trains image and text encoders simultaneously on matched pairs using contrastive language-image pretraining to build a shared multimodal embedding space.",
      "why": "Standard vision classifiers depend on fixed categorical labels that do not transfer across novel domains. Multimodal contrastive objectives align visual concepts with natural language.",
      "example": "Contrastive vision models measure cosine similarity between visual embeddings and text labels to classify images without fine-tuning."
    }
  },
  {
    "id": "llava-visual-instruction-tuning",
    "title": "LLaVA",
    "description": "Connects a pre-trained vision encoder (CLIP ViT) with a language model decoder (Vicuna/Llama) using a linear or MLP projection matrix.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "multimodal",
      "vlm",
      "instruction-tuning"
    ],
    "resources": [
      {
        "label": "Visual Instruction Tuning (Liu et al., NeurIPS)",
        "url": "https://arxiv.org/abs/2304.08485"
      },
      {
        "label": "LLaVA-1.5: Improved Baselines with Visual Instruction Tuning",
        "url": "https://arxiv.org/abs/2310.03744"
      },
      {
        "label": "LLaVA Official GitHub Implementation",
        "url": "https://github.com/haotian-liu/LLaVA"
      }
    ],
    "lesson": {
      "idea": "LLaVA connects a visual feature encoder with a language model decoder via a projection layer, enabling conversational visual instruction following.",
      "why": "Standalone text decoders cannot process raw image inputs directly. Aligning visual features into language embedding spaces enables models to reason over images.",
      "example": "Multimodal dialogue models project visual feature tokens into language decoders to answer questions regarding uploaded images."
    }
  },
  {
    "id": "neural-radiance-fields-nerf",
    "title": "Neural Radiance Fields (NeRF)",
    "description": "Synthesizes novel 3D views of complex scenes by querying a continuous volumetric 5D function parameterized by an MLP.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "3d-vision",
      "neural-rendering",
      "computer-vision"
    ],
    "resources": [
      {
        "label": "NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis (Mildenhall et al.)",
        "url": "https://arxiv.org/abs/2003.08934"
      },
      {
        "label": "Instant Neural Graphics Primitives with a Multiresolution Hash Encoding (Müller et al., NVIDIA)",
        "url": "https://arxiv.org/abs/2201.05989"
      }
    ],
    "lesson": {
      "idea": "Neural Radiance Fields (NeRF) represent continuous volumetric scenes as coordinate functions parameterized by neural networks to render novel 3D views.",
      "why": "Traditional polygonal meshes struggle to capture complex geometries and specular lighting effects accurately. Continuous radiance functions optimize volumetric densities and colors directly.",
      "example": "Volumetric rendering functions query spatial coordinates along camera rays to synthesize novel camera views from photographs."
    }
  },
  {
    "id": "3d-gaussian-splatting",
    "title": "3D Gaussian Splatting for Real-Time Radiance Field Rendering",
    "description": "Represents 3D scenes as millions of anisotropic 3D Gaussians optimized via differentiable tile-based rasterization.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "3d-vision",
      "computer-graphics",
      "real-time"
    ],
    "resources": [
      {
        "label": "3D Gaussian Splatting for Real-Time Radiance Field Rendering (Kerbl et al., SIGGRAPH)",
        "url": "https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/"
      },
      {
        "label": "Gaussian Splatting Paper (arXiv)",
        "url": "https://arxiv.org/abs/2308.04079"
      }
    ],
    "lesson": {
      "idea": "3D Gaussian Splatting for real-time radiance field rendering represents scenes using anisotropic 3D Gaussians optimized via differentiable tile rasterization.",
      "why": "Continuous volumetric ray marching requires dense sampling passes that inhibit real-time frame rates. Differentiable splatting rasterizes explicit primitives with hardware efficiency.",
      "example": "Real-time graphics renderers project anisotropic Gaussian primitives onto screen tiles to display complex reconstructed environments."
    }
  },
  {
    "id": "knowledge-distillation-teacher-student",
    "title": "Knowledge Distillation",
    "description": "Compresses large ensemble or teacher models into compact student models by training the student on the softened logit probability distributions.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "model-compression",
      "distillation",
      "deep-learning"
    ],
    "resources": [
      {
        "label": "Distilling the Knowledge in a Neural Network (Hinton, Vinyals, Dean, 2015)",
        "url": "https://arxiv.org/abs/1503.02531"
      },
      {
        "label": "DistilBERT: A Distilled Version of BERT (Sanh et al.)",
        "url": "https://arxiv.org/abs/1910.01108"
      },
      {
        "label": "PyTorch Knowledge Distillation Tutorial",
        "url": "https://pytorch.org/tutorials/beginner/knowledge_distillation_tutorial.html"
      }
    ],
    "lesson": {
      "idea": "Knowledge distillation compresses large teacher models into compact student models by training student architectures on softened logit distributions.",
      "why": "Raw target labels omit information regarding relative class similarities captured by large architectures. Soft probability distributions convey nuanced relationships that guide compact models.",
      "example": "Compact student transformers train on softened logit distributions produced by larger teacher models to retain task performance."
    }
  },
  {
    "id": "word2vec-skipgram-negative-sampling",
    "title": "Word2Vec Skip-Gram with Negative Sampling (SGNS)",
    "description": "Learns dense geometric word vector embeddings by training a shallow two-layer network to maximize the log-probability of target context words while minimizing.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "nlp",
      "embeddings",
      "representation-learning"
    ],
    "resources": [
      {
        "label": "Distributed Representations of Words and Phrases and their Compositionality (Mikolov et al.)",
        "url": "https://arxiv.org/abs/1310.4546"
      },
      {
        "label": "Word2Vec Explained: Deriving Mikolov et al.'s Negative-Sampling",
        "url": "https://arxiv.org/abs/1402.3722"
      },
      {
        "label": "The Illustrated Word2Vec (Jay Alammar)",
        "url": "https://jalammar.github.io/illustrated-word2vec/"
      }
    ],
    "lesson": {
      "idea": "Word2Vec skip-gram with negative sampling (SGNS) trains shallow networks to maximize context word probabilities while discriminating against negative noise samples.",
      "why": "Full vocabulary softmax calculations become computationally prohibitive over massive corpora. Negative sampling replaces expensive normalizations with binary classification tasks.",
      "example": "Embedding models update target word vectors to predict nearby context tokens while distinguishing randomly sampled noise words."
    }
  },
  {
    "id": "contrastive-representation-learning-simclr",
    "title": "SimCLR",
    "description": "Learns visual representations without human labels by maximizing agreement between differently augmented views (random cropping) of the same image via normalized.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "self-supervised-learning",
      "computer-vision",
      "representation"
    ],
    "resources": [
      {
        "label": "A Simple Framework for Contrastive Learning of Visual Representations (Chen et al., Google)",
        "url": "https://arxiv.org/abs/2002.05709"
      },
      {
        "label": "Momentum Contrast for Unsupervised Visual Representation Learning (MoCo, He et al.)",
        "url": "https://arxiv.org/abs/1911.05722"
      }
    ],
    "lesson": {
      "idea": "SimCLR learns visual representations by maximizing agreement between differently augmented views of images using contrastive loss objectives without human labels.",
      "why": "Supervised feature training requires extensive manual annotation across domain tasks. Self-supervised contrastive learning extracts generalizable visual representations from raw image datasets.",
      "example": "Self-supervised vision pipelines apply data augmentations to input images and pull matching representation views together in feature space."
    }
  },
  {
    "id": "masked-autoencoders-mae",
    "title": "Masked Autoencoders (MAE) Are Scalable Vision Learners",
    "description": "Masks out a high proportion (75%) of random image patches, processes only the remaining unmasked patches through an asymmetric Vision Transformer encoder.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "self-supervised-learning",
      "vision",
      "transformers"
    ],
    "resources": [
      {
        "label": "Masked Autoencoders Are Scalable Vision Learners (He et al., Meta)",
        "url": "https://arxiv.org/abs/2111.06377"
      },
      {
        "label": "Meta Research MAE GitHub",
        "url": "https://github.com/facebookresearch/mae"
      },
      {
        "label": "Hugging Face ViT-MAE Docs",
        "url": "https://huggingface.co/docs/transformers/model_doc/vit_mae"
      }
    ],
    "lesson": {
      "idea": "Masked Autoencoders (MAE) are scalable vision learners that mask high proportions of image patches and reconstruct missing pixels using asymmetric autoencoders.",
      "why": "Processing entire visual frames creates redundant spatial computation during pre-training. Masking high patch fractions accelerates encoder training and discourages shallow texture memorization.",
      "example": "Vision transformer encoders process visible image patches while lightweight decoders reconstruct masked pixel regions during pre-training."
    }
  },
  {
    "id": "chinchilla-compute-optimal-scaling-laws",
    "title": "Chinchilla Scaling Laws for Compute-Optimal Pre-Training",
    "description": "Demonstrates through extensive empirical training runs that for compute-optimal training.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "scaling-laws",
      "pre-training",
      "llms"
    ],
    "resources": [
      {
        "label": "Training Compute-Optimal Large Language Models (Hoffmann et al., DeepMind)",
        "url": "https://arxiv.org/abs/2203.15556"
      },
      {
        "label": "Scaling Laws for Neural Language Models (Kaplan et al., OpenAI)",
        "url": "https://arxiv.org/abs/2001.08361"
      }
    ],
    "lesson": {
      "idea": "Chinchilla scaling laws for compute-optimal pre-training show that model parameters and training dataset tokens should scale proportionally given fixed budgets.",
      "why": "Allocating available compute primarily to model size produces under-trained parameter representations. Balancing parameter counts with token volume optimizes performance per unit computation.",
      "example": "Pre-training budgets allocate resources equally between scaling model parameter counts and expanding dataset token volume."
    }
  },
  {
    "id": "emergent-abilities-and-grokking",
    "title": "Grokking & Phase Transitions in Generalization",
    "description": "Analyzes the phenomenon where overparameterized neural networks achieve zero training loss quickly through memorization but suddenly transition to perfect.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "theory",
      "deep-learning",
      "scaling"
    ],
    "resources": [
      {
        "label": "Grokking: Generalization Beyond Overfitting on Small Algorithmic Datasets (Power et al., OpenAI)",
        "url": "https://arxiv.org/abs/2201.02177"
      },
      {
        "label": "Progress Measures for Grokking via Mechanistic Interpretability (Nanda et al.)",
        "url": "https://arxiv.org/abs/2301.05217"
      },
      {
        "label": "Are Emergent Abilities of LLMs a Mirage? (Schaeffer et al., NeurIPS)",
        "url": "https://arxiv.org/abs/2304.15004"
      }
    ],
    "lesson": {
      "idea": "Grokking and phase transitions in generalization describe sudden transitions where overparameterized neural networks achieve generalization long after memorizing training data.",
      "why": "Standard training assumptions view generalization as occurring concurrently with loss minimization. Prolonged training can induce structural circuit formation well after loss reaches zero.",
      "example": "Neural networks trained on modular arithmetic maintain memorized weights before undergoing sharp phase transitions toward generalization."
    }
  },
  {
    "id": "mechanistic-interpretability-induction-heads",
    "title": "Mechanistic Interpretability",
    "description": "Reverse-engineers neural networks into discrete human-interpretable computational circuits.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "interpretability",
      "ai-safety",
      "mechanistic-analysis"
    ],
    "resources": [
      {
        "label": "In-context Learning and Induction Heads (Anthropic, 2022)",
        "url": "https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html"
      },
      {
        "label": "TransformerLens Library for Mechanistic Interpretability",
        "url": "https://github.com/neelnanda-io/TransformerLens"
      },
      {
        "label": "A Mathematical Framework for Transformer Circuits (Elhage et al.)",
        "url": "https://transformer-circuits.pub/2021/framework/index.html"
      }
    ],
    "lesson": {
      "idea": "Mechanistic interpretability reverse-engineers trained neural networks into discrete computational circuits such as induction heads that perform in-context sequence copying.",
      "why": "Treating neural models as inscrutable black boxes restricts system debugging and safety verification. Isolating discrete internal circuits reveals concrete computational mechanisms.",
      "example": "Interpretability tools trace attention head activations across transformer layers to identify circuits responsible for in-context pattern copying."
    }
  },
  {
    "id": "react-reasoning-and-acting",
    "title": "ReAct",
    "description": "Interleaves dynamic chain-of-thought verbal reasoning traces with domain-specific tool execution actions (APIs, search engines).",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "agents",
      "prompting",
      "tool-use"
    ],
    "resources": [
      {
        "label": "ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al., ICLR)",
        "url": "https://arxiv.org/abs/2210.03629"
      }
    ],
    "lesson": {
      "idea": "ReAct synergizes reasoning and acting in language models by interleaving verbal chain-of-thought traces with tool actions to solve interactive tasks.",
      "why": "Internal reasoning without external actions risks factual hallucination, whereas invoking external tools without planning causes erratic behavior. Alternating traces enables grounded problem solving.",
      "example": "Autonomous agent loops produce explicit reasoning thoughts before calling search APIs and observing return values to update plans."
    }
  },
  {
    "id": "tree-of-thoughts-prompting",
    "title": "Tree of Thoughts (ToT) Problem Solving",
    "description": "Expands prompt reasoning into a tree of intermediate thoughts, allowing models to search, evaluate, and backtrack along paths.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "prompting",
      "reasoning",
      "agents"
    ],
    "resources": [
      {
        "label": "Tree of Thoughts: Deliberate Problem Solving with Large Language Models (Yao et al.)",
        "url": "https://arxiv.org/abs/2305.10601"
      },
      {
        "label": "Tree-of-Thoughts Official GitHub",
        "url": "https://github.com/princeton-nlp/tree-of-thought-llm"
      },
      {
        "label": "Prompt Engineering Guide: Tree of Thoughts",
        "url": "https://www.promptingguide.ai/techniques/tot"
      }
    ],
    "lesson": {
      "idea": "Tree of Thoughts (ToT) problem solving expands reasoning into branching trees of intermediate thoughts, enabling systematic evaluation and backtracking across paths.",
      "why": "Linear generation commits to preliminary choices without opportunity to rectify flawed deductions. Tree exploration allows models to assess alternatives and abandon unpromising paths.",
      "example": "Problem solving prompts generate candidate thought branches and prune unfeasible options using tree search algorithms."
    }
  },
  {
    "id": "function-calling-json-mode-constrained-decoding",
    "title": "Function Calling",
    "description": "Enforces strict JSON schema compliance during token generation by masking out invalid next-token logits that violate Context-Free Grammar (CFG) or regex.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "tool-use",
      "structured-outputs",
      "decoding"
    ],
    "resources": [
      {
        "label": "OpenAI Structured Outputs Guide",
        "url": "https://platform.openai.com/docs/guides/structured-outputs"
      }
    ]
  },
  {
    "id": "fully-sharded-data-parallel-fsdp",
    "title": "Fully Sharded Data Parallelism (FSDP)",
    "description": "Eliminates memory redundancy across GPU clusters by sharding model parameters, gradients, and optimizer states across worker ranks.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed-training",
      "pytorch",
      "deep-learning"
    ],
    "resources": [
      {
        "label": "ZeRO: Memory Optimizations Toward Training Trillion Parameter Models (Rajbhandari et al., DeepSpeed)",
        "url": "https://arxiv.org/abs/1910.02054"
      },
      {
        "label": "Hugging Face Accelerate with FSDP Tutorial",
        "url": "https://huggingface.co/docs/accelerate/usage_guides/fsdp"
      }
    ]
  },
  {
    "id": "tensor-parallelism-megatron-lm",
    "title": "Megatron-LM Tensor Parallelism",
    "description": "Splits individual linear projection matrix multiplications in multi-head attention and feed-forward blocks across multiple intra-node GPUs using column-parallel.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed-training",
      "cuda",
      "scaling"
    ],
    "resources": [
      {
        "label": "Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism (Shoeybi et al., NVIDIA)",
        "url": "https://arxiv.org/abs/1909.08053"
      },
      {
        "label": "Reducing Activation Recomputation in Large Transformer Models (Korthikanti et al.)",
        "url": "https://arxiv.org/abs/2205.05198"
      },
      {
        "label": "NVIDIA Megatron-LM GitHub Repository",
        "url": "https://github.com/NVIDIA/Megatron-LM"
      }
    ]
  },
  {
    "id": "pipeline-parallelism-and-1f1b-scheduling",
    "title": "Pipeline Parallelism & 1F1B Scheduling",
    "description": "Partitions consecutive layers of a massive model across a sequence of GPU devices and executes training over micro-batches.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed-training",
      "systems-ml",
      "deep-learning"
    ],
    "resources": [
      {
        "label": "GPipe: Efficient Training of Giant Neural Networks using Pipeline Parallelism (Huang et al., Google)",
        "url": "https://arxiv.org/abs/1811.06965"
      },
      {
        "label": "PipeDream: Fast and Efficient Pipeline Parallel DNN Training (Narayanan et al.)",
        "url": "https://arxiv.org/abs/1806.03377"
      },
      {
        "label": "PyTorch Pipeline Parallelism (PiPPy)",
        "url": "https://github.com/pytorch/PiPPy"
      }
    ]
  },
  {
    "id": "deduplication-minhash-lsh-for-llm-data",
    "title": "MinHash LSH for Large-Scale Corpus Deduplication",
    "description": "Applies Locality Sensitive Hashing (LSH) over Jaccard similarity matrices of token n-grams to identify and purge near-duplicate web documents from multi-terabyte.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "data-engineering",
      "pre-training",
      "algorithms"
    ],
    "resources": [
      {
        "label": "Deduplicating Training Data Makes Language Models Better (Lee et al.)",
        "url": "https://arxiv.org/abs/2107.06499"
      },
      {
        "label": "Datasketch: MinHash in Python",
        "url": "https://ekzhu.com/datasketch/minhash.html"
      }
    ]
  },
  {
    "id": "synthetic-data-generation-evol-instruct",
    "title": "Evol-Instruct",
    "description": "Iteratively rewrites seed prompts into increasingly complex, multi-step instructions using structured evolutionary mutation prompts.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "synthetic-data",
      "instruction-tuning",
      "data-engine"
    ],
    "resources": [
      {
        "label": "WizardLM: Empowering Large Language Models to Follow Complex Instructions (Xu et al.)",
        "url": "https://arxiv.org/abs/2304.12244"
      },
      {
        "label": "Textbooks Are All You Need (Phi-1 / Phi-2, Microsoft)",
        "url": "https://arxiv.org/abs/2306.11644"
      }
    ]
  },
  {
    "id": "llm-as-a-judge-evaluations",
    "title": "LLM-as-a-Judge Evaluation Frameworks",
    "description": "Leverages powerful frontier models with structured rubrics, pairwise position-swapping, and reference solutions to evaluate open-ended model answers.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "evaluation",
      "benchmarks",
      "alignment"
    ],
    "resources": [
      {
        "label": "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena (Zheng et al., LMSYS)",
        "url": "https://arxiv.org/abs/2306.05685"
      },
      {
        "label": "OpenAI Evals Framework",
        "url": "https://github.com/openai/evals"
      }
    ]
  },
  {
    "id": "hallucination-mitigation-and-rag-triad",
    "title": "The RAG Triad",
    "description": "A formal evaluation methodology that breaks down RAG hallucinations into three measurable orthogonal axes.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "rag",
      "evaluation",
      "hallucinations"
    ],
    "resources": [
      {
        "label": "Ragas: Automated Evaluation of Retrieval Augmented Generation",
        "url": "https://arxiv.org/abs/2309.15217"
      },
      {
        "label": "A Survey on Hallucination in Large Language Models (Huang et al.)",
        "url": "https://arxiv.org/abs/2309.01219"
      }
    ]
  },
  {
    "id": "cross-entropy-and-perplexity",
    "title": "Cross-Entropy Loss, Negative Log-Likelihood & Perplexity",
    "description": "The fundamental mathematical metrics for training and benchmarking language models.",
    "category": "ai-ml",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "information-theory",
      "loss-functions",
      "nlp"
    ],
    "resources": [
      {
        "label": "Hugging Face Perplexity of Fixed-Length Models Guide",
        "url": "https://huggingface.co/docs/transformers/perplexity"
      },
      {
        "label": "Stanford CS224N: Language Models and Training Objectives",
        "url": "https://web.stanford.edu/class/cs224n/"
      }
    ]
  },
  {
    "id": "k8s-scheduler-internals",
    "title": "Kubernetes Scheduler",
    "description": "The kube-scheduler assigns pods to nodes in a two-phase cycle: filtering nodes via predicates (node affinity) and scoring survivors via priorities.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "kubernetes",
      "scheduling",
      "containers"
    ],
    "resources": [
      {
        "label": "Kubernetes Official Docs: kube-scheduler Scheduling Cycle",
        "url": "https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/"
      },
      {
        "label": "Kubernetes Enhancement Proposal (KEP): Scheduling Framework Architecture",
        "url": "https://github.com/kubernetes/enhancements/tree/master/keps/sig-scheduling/624-scheduling-framework"
      }
    ]
  },
  {
    "id": "k8s-operator-reconciliation-loop",
    "title": "Kubernetes Operator Pattern",
    "description": "Operators extend Kubernetes by pairing Custom Resource Definitions (CRDs) with an idempotent reconciliation controller.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "kubernetes",
      "operators",
      "controller-runtime"
    ],
    "resources": [
      {
        "label": "Kubernetes Documentation: Custom Resources & Controller Pattern",
        "url": "https://kubernetes.io/docs/concepts/extend-kubernetes/operator/"
      },
      {
        "label": "Kubernetes Controller Runtime Design Docs",
        "url": "https://github.com/kubernetes-sigs/controller-runtime"
      }
    ]
  },
  {
    "id": "k8s-statefulsets-and-headless-services",
    "title": "Kubernetes StatefulSets, VolumeClaimTemplates & Headless Services",
    "description": "StatefulSets provide deterministic pod identity (ordinal indexing 0..N-1), dedicated PersistentVolumeClaims per pod, and ordered grace periods for scaling.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "kubernetes",
      "stateful-workloads",
      "storage"
    ],
    "resources": [
      {
        "label": "Kubernetes Documentation: StatefulSets Concept & Lifecycle",
        "url": "https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/"
      }
    ]
  },
  {
    "id": "k8s-admission-controllers-and-mutating-webhooks",
    "title": "Kubernetes Dynamic Admission",
    "description": "Admission webhooks intercept API requests to the kube-apiserver after authentication and schema validation.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "kubernetes",
      "security",
      "admission-controllers"
    ],
    "resources": [
      {
        "label": "Kubernetes Documentation: Dynamic Admission Control",
        "url": "https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/"
      }
    ]
  },
  {
    "id": "container-runtimes-cri-oci-runc",
    "title": "Container Runtime Architecture",
    "description": "The Kubelet delegates pod lifecycle execution via the gRPC Container Runtime Interface (CRI) to high-level runtimes like containerd or CRI-O. These runtimes pull.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "containers",
      "oci",
      "runtimes",
      "linux"
    ],
    "resources": [
      {
        "label": "Open Container Initiative (OCI) Runtime Specification",
        "url": "https://github.com/opencontainers/runtime-spec"
      },
      {
        "label": "Linux Kernel Namespaces & cgroups Manual (man 7 namespaces)",
        "url": "https://man7.org/linux/man-pages/man7/namespaces.7.html"
      }
    ]
  },
  {
    "id": "linux-cgroups-v2-resource-isolation",
    "title": "Linux cgroups v2",
    "description": "Control Groups (cgroups v2) unify resource accounting under a single hierarchy, resolving the I/O-memory attribution flaws of cgroups v1.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "linux",
      "cgroups",
      "resource-management",
      "kernel"
    ],
    "resources": [
      {
        "label": "Linux Kernel Documentation: Control Group v2",
        "url": "https://docs.kernel.org/admin-guide/cgroup-v2.html"
      },
      {
        "label": "Kubernetes Documentation: Enabling and Using cgroup v2",
        "url": "https://kubernetes.io/docs/concepts/architecture/cgroups/"
      }
    ]
  },
  {
    "id": "envoy-proxy-threading-and-xds-apis",
    "title": "Envoy Proxy Architecture",
    "description": "Envoy uses a single-process, multi-threaded event-driven model where non-blocking libevent loops pinned to OS threads handle socket I/O independently.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "envoy",
      "service-mesh",
      "proxies"
    ],
    "resources": [
      {
        "label": "Envoy Proxy Architecture: Threading Model Overview",
        "url": "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/intro/threading_model"
      },
      {
        "label": "Envoy Dynamic Discovery Service (xDS) Protocol Specification",
        "url": "https://www.envoyproxy.io/docs/envoy/latest/api-docs/xds_protocol"
      }
    ]
  },
  {
    "id": "istio-control-plane-pilot-and-envoy-injection",
    "title": "Istio Service Mesh",
    "description": "Istio converts high-level routing rules (VirtualService, DestinationRule) into Envoy xDS configuration distributed by istiod.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "istio",
      "service-mesh",
      "networking",
      "security"
    ],
    "resources": [
      {
        "label": "Istio Architecture Deep Dive & Component Overview",
        "url": "https://istio.io/latest/docs/ops/deployment/architecture/"
      },
      {
        "label": "Istio Security Architecture: mTLS & Citadel Certificate Issuance",
        "url": "https://istio.io/latest/docs/concepts/security/"
      }
    ]
  },
  {
    "id": "ebpf-and-cilium-data-plane",
    "title": "eBPF & Cilium",
    "description": "Extended Berkeley Packet Filter (eBPF) allows verified sandboxed bytecode to execute directly inside the Linux kernel at socket and network driver hooks (XDP, TC).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "ebpf",
      "networking",
      "cilium",
      "kernel"
    ],
    "resources": [
      {
        "label": "Wikipedia: EBPF",
        "url": "https://en.wikipedia.org/wiki/EBPF"
      }
    ]
  },
  {
    "id": "kubernetes-cni-overlay-vs-flat-routing",
    "title": "Kubernetes CNI Plugins",
    "description": "Container Network Interface (CNI) plugins allocate unique IPs per pod.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "kubernetes",
      "cni",
      "vxlan"
    ],
    "resources": [
      {
        "label": "AWS VPC CNI Plugin Architecture & Secondary IP Allocation",
        "url": "https://github.com/aws/amazon-vpc-cni-k8s"
      }
    ]
  },
  {
    "id": "kubernetes-ingress-vs-gateway-api",
    "title": "Kubernetes Ingress vs. Gateway API",
    "description": "The Kubernetes Gateway API evolves the legacy monolithic Ingress spec into expressive, role-oriented resources .",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "kubernetes",
      "ingress",
      "gateway-api",
      "networking"
    ],
    "resources": [
      {
        "label": "Kubernetes Gateway API Specification & User Guide",
        "url": "https://gateway-api.sigs.k8s.io/"
      },
      {
        "label": "Kubernetes Blog: Evolving Kubernetes Networking with the Gateway API",
        "url": "https://kubernetes.io/blog/2021/04/22/evolving-kubernetes-networking-with-the-gateway-api/"
      }
    ]
  },
  {
    "id": "terraform-state-locking-and-backends",
    "title": "Terraform State Internals",
    "description": "Terraform maintains a JSON state file mapping declared HCL configuration to real-world cloud resource IDs and attributes.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "iac",
      "terraform",
      "state-management",
      "devops"
    ],
    "resources": [
      {
        "label": "HashiCorp Terraform Documentation: State Architecture & Storage Backends",
        "url": "https://developer.hashicorp.com/terraform/language/state"
      },
      {
        "label": "Terraform Internals: Graph Computation and State Lifecycle",
        "url": "https://developer.hashicorp.com/terraform/internals/graph"
      },
      {
        "label": "OpenTofu State Backend Specification",
        "url": "https://opentofu.org/docs/language/state/backends/"
      }
    ]
  },
  {
    "id": "iac-drift-detection-and-reconciliation",
    "title": "Infrastructure Drift Detection, Refresh Phases & Out-of-Band Mutations",
    "description": "Infrastructure drift occurs when out-of-band manual changes or external provider mutations desynchronize the cloud environment from the declared state file.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "iac",
      "terraform",
      "drift",
      "gitops"
    ],
    "resources": [
      {
        "label": "HashiCorp Terraform Documentation: Refresh and Drift Management",
        "url": "https://developer.hashicorp.com/terraform/tutorials/state/refresh"
      },
      {
        "label": "AWS CloudFormation Drift Detection Documentation",
        "url": "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/detect-drift-stack.html"
      }
    ]
  },
  {
    "id": "pulumi-engine-and-imperative-constructs",
    "title": "Pulumi Architecture",
    "description": "Runs real programming languages to declare cloud infrastructure, orchestrating state updates through an engine-managed resource DAG.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "iac",
      "pulumi",
      "cloud-engineering",
      "typescript"
    ],
    "resources": [
      {
        "label": "Pulumi Architecture: How Pulumi Works (Language Host & Engine)",
        "url": "https://www.pulumi.com/docs/concepts/how-pulumi-works/"
      },
      {
        "label": "Pulumi State and Backend Architecture",
        "url": "https://www.pulumi.com/docs/concepts/state/"
      }
    ]
  },
  {
    "id": "terraform-module-design-and-inversion",
    "title": "Terraform Module Composition",
    "description": "Production IaC structures isolate state blasted radius using composable child modules with clean input/output contracts.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "iac",
      "terraform",
      "module-patterns",
      "software-design"
    ],
    "resources": [
      {
        "label": "HashiCorp Terraform Module Best Practices & Standard Structure",
        "url": "https://developer.hashicorp.com/terraform/language/modules/develop/structure"
      },
      {
        "label": "Google Cloud Architecture Framework: Best practices for Terraform",
        "url": "https://cloud.google.com/docs/terraform/best-practices-for-terraform"
      }
    ]
  },
  {
    "id": "etcd-raft-log-replication-and-boltdb",
    "title": "etcd Internals",
    "description": "Etcd stores Kubernetes cluster state using an in-memory Raft consensus implementation to replicate WAL logs across a quorum ($N/2 + 1$).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed-systems",
      "etcd",
      "raft",
      "consensus"
    ],
    "resources": [
      {
        "label": "etcd Raft Implementation Repository",
        "url": "https://github.com/etcd-io/raft"
      }
    ]
  },
  {
    "id": "distributed-locking-leases-and-fencing-tokens",
    "title": "Distributed Locking",
    "description": "Distributed locks rely on heartbeated TTL leases granted by a consensus quorum.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed-systems",
      "locking",
      "fencing-tokens",
      "consensus"
    ],
    "resources": [
      {
        "label": "Martin Kleppmann: How to Do Distributed Locking (Redlock Analysis)",
        "url": "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html"
      },
      {
        "label": "Google Chubby: A Distributed Lock Service for Loose Coupling (Burrows, OSDI)",
        "url": "https://research.google/pubs/the-chubby-lock-service-for-loosely-coupled-distributed-systems/"
      }
    ]
  },
  {
    "id": "zookeeper-zab-atomic-broadcast",
    "title": "Apache ZooKeeper",
    "description": "ZooKeeper ensures strong linearizable writes via the two-phase ZAB protocol (Leader Discovery).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed-systems",
      "zookeeper",
      "consensus",
      "replication"
    ],
    "resources": [
      {
        "label": "Wikipedia: Apache ZooKeeper",
        "url": "https://en.wikipedia.org/wiki/Apache_ZooKeeper"
      }
    ]
  },
  {
    "id": "s3-strong-consistency-and-lsm-metadata",
    "title": "Amazon S3 Consistency Model",
    "description": "In 2020, Amazon S3 eliminated eventual consistency delays across PUT, LIST, and DELETE operations without performance compromises.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "storage",
      "aws-s3",
      "distributed-systems",
      "consistency"
    ],
    "resources": [
      {
        "label": "AWS News: Amazon S3 Update – Strong Read-After-Write Consistency",
        "url": "https://aws.amazon.com/blogs/aws/amazon-s3-update-strong-read-after-write-consistency/"
      }
    ]
  },
  {
    "id": "block-vs-file-vs-object-storage-tradeoffs",
    "title": "Storage Primitives Compared",
    "description": "Block storage provides raw sector-level byte addressing with low latency for random database I/O but attaches to a single node.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "storage",
      "ebs",
      "s3",
      "efs",
      "posix"
    ],
    "resources": [
      {
        "label": "AWS Whitepaper: Storage Options in the AWS Cloud",
        "url": "https://docs.aws.amazon.com/whitepapers/latest/aws-storage-services-overview/introduction.html"
      },
      {
        "label": "Google Cloud Storage vs Persistent Disk vs Filestore Tradeoffs",
        "url": "https://cloud.google.com/storage-options"
      }
    ]
  },
  {
    "id": "erasure-coding-vs-replication",
    "title": "Erasure Coding vs. Multi-Way Replication in Distributed Object Stores",
    "description": "Divides data into fragments with parity chunks to survive multiple disk failures with 30–50% storage overhead versus 200% for 3x replication.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "storage",
      "erasure-coding",
      "fault-tolerance",
      "distributed-systems"
    ],
    "resources": [
      {
        "label": "MinIO Erasure Code Architecture & Reed-Solomon Math",
        "url": "https://min.io/docs/minio/linux/operations/concepts/erasure-coding.html"
      },
      {
        "label": "Erasure Coding in Ceph (Ceph Architecture Docs)",
        "url": "https://docs.ceph.com/en/latest/rados/operations/erasure-code/"
      },
      {
        "label": "Facebook F4: An Undergraduate Look at an Archival Storage System (USENIX OSDI)",
        "url": "https://www.usenix.org/conference/osdi14/technical-sessions/presentation/muralidhar"
      }
    ]
  },
  {
    "id": "nvme-over-fabrics-and-block-storage-virtualization",
    "title": "NVMe-oF (NVMe over Fabrics)",
    "description": "NVMe over Fabrics extends NVMe PCIe register semantics over high-speed networks (RDMA, RoCE, TCP) with microsecond latency and zero-copy transfers.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "storage",
      "nvme",
      "hardware",
      "cloud-infra"
    ],
    "resources": [
      {
        "label": "NVM Express: NVMe-oF Specification Standard",
        "url": "https://nvmexpress.org/developers/nvme-of-specification/"
      },
      {
        "label": "AWS Nitro System: Architecture and Performance Characteristics",
        "url": "https://aws.amazon.com/ec2/nitro/"
      }
    ]
  },
  {
    "id": "opentelemetry-collector-and-w3c-trace-context",
    "title": "OpenTelemetry Architecture",
    "description": "OpenTelemetry standardizes vendor-neutral telemetry ingestion via receiving, processing (batching, filtering), and exporting pipelines in the OTel Collector.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "observability",
      "opentelemetry",
      "tracing",
      "w3c"
    ],
    "resources": [
      {
        "label": "OpenTelemetry Collector Architecture & Pipelines",
        "url": "https://opentelemetry.io/docs/collector/architecture/"
      }
    ]
  },
  {
    "id": "prometheus-tsdb-internals-and-head-chunks",
    "title": "Prometheus TSDB",
    "description": "Prometheus TSDB writes incoming time-series samples into an in-memory Head chunk and a Write-Ahead Log (WAL) to prevent data loss.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "observability",
      "prometheus",
      "tsdb",
      "metrics"
    ],
    "resources": [
      {
        "label": "Prometheus Official Storage Documentation",
        "url": "https://prometheus.io/docs/prometheus/latest/storage/"
      }
    ]
  },
  {
    "id": "slos-slas-slis-and-error-budget-burn-rates",
    "title": "SRE Frameworks",
    "description": "Site Reliability Engineering defines Service Level Indicators (SLIs) as quantifiable service metrics (e.g. good requests / total requests) measured against.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "sre",
      "observability",
      "slos",
      "error-budgets"
    ],
    "resources": [
      {
        "label": "Google SRE Book: Service Level Objectives & Error Budgets",
        "url": "https://sre.google/sre-book/service-level-objectives/"
      },
      {
        "label": "Google SRE Workbook: Alerting on SLOs and Burn Rates",
        "url": "https://sre.google/workbook/alerting-on-slos/"
      }
    ]
  },
  {
    "id": "distributed-profiling-and-ebpf-continuous-profiling",
    "title": "Continuous Profiling",
    "description": "Uses eBPF kernel probes to sample CPU instructions and stack traces without code instrumentation, exposing production bottlenecks.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "observability",
      "profiling",
      "ebpf",
      "performance"
    ],
    "resources": [
      {
        "label": "Brendan Gregg: Flame Graphs Visualization",
        "url": "https://www.brendangregg.com/flamegraphs.html"
      }
    ]
  },
  {
    "id": "aws-iam-evaluation-logic-and-least-privilege",
    "title": "AWS IAM Policy Evaluation Engine",
    "description": "AWS IAM evaluates authorization via a deterministic flowchart: defaults to implicit deny, evaluates Organizations Service Control Policies (SCPs).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "security",
      "iam",
      "aws",
      "access-control"
    ],
    "resources": [
      {
        "label": "AWS Documentation: IAM Policy Evaluation Logic Flowchart",
        "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html"
      }
    ]
  },
  {
    "id": "spiffe-spire-workload-identity",
    "title": "SPIFFE / SPIRE",
    "description": "Secure Production Identity Framework for Everyone (SPIFFE) standardizes machine identity using SPIFFE IDs formatted as URIs and issued as short-lived X. 509 SVID.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "security",
      "zero-trust",
      "spiffe",
      "cryptography"
    ],
    "resources": [
      {
        "label": "CNCF SPIFFE and SPIRE Production Security Guide",
        "url": "https://www.cncf.io/projects/spiffe/"
      }
    ]
  },
  {
    "id": "oidc-federation-and-short-lived-ci-tokens",
    "title": "OIDC Identity Federation",
    "description": "OpenID Connect (OIDC) federation eliminates long-lived static cloud secret keys in CI/CD platforms (GitHub Actions, GitLab CI).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "security",
      "oidc",
      "github-actions",
      "iam"
    ],
    "resources": [
      {
        "label": "GitHub Docs: Configuring OpenID Connect in Cloud Providers",
        "url": "https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect"
      },
      {
        "label": "AWS IAM Documentation: Using OpenID Connect Identity Providers",
        "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html"
      }
    ]
  },
  {
    "id": "hashicorp-vault-envelope-encryption-and-shredding",
    "title": "HashiCorp Vault",
    "description": "Vault protects secrets using an unsealed master key broken into shares via Shamir's Secret Sharing algorithm.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "security",
      "vault",
      "encryption",
      "key-management"
    ],
    "resources": [
      {
        "label": "HashiCorp Vault Architecture & Cryptographic Engine",
        "url": "https://developer.hashicorp.com/vault/docs/internals/architecture"
      },
      {
        "label": "NIST Special Publication 800-57: Key Management Guidelines",
        "url": "https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final"
      }
    ]
  },
  {
    "id": "zero-trust-beyondcorp-model",
    "title": "Zero Trust Architecture (BeyondCorp)",
    "description": "The Zero Trust model discards the assumption of internal network perimeter safety ('never trust, always verify').",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "security",
      "zero-trust",
      "network-security",
      "identity"
    ],
    "resources": [
      {
        "label": "Google BeyondCorp: A New Approach to Enterprise Security (Ward & Beyer, IEEE)",
        "url": "https://research.google/pubs/beyondcorp-a-new-approach-to-enterprise-security/"
      },
      {
        "label": "NIST Special Publication 800-207: Zero Trust Architecture",
        "url": "https://csrc.nist.gov/publications/detail/sp/800-207/final"
      }
    ]
  },
  {
    "id": "vpc-peering-vs-transit-gateway",
    "title": "VPC Peering vs. Transit Gateway",
    "description": "Direct VPC Peering is non-transitive, requiring an $O(N^2)$ mesh of individual peering connections as network count scales.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "aws-vpc",
      "routing",
      "topology"
    ],
    "resources": [
      {
        "label": "AWS Documentation: Transit Gateway vs VPC Peering Architecture",
        "url": "https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html"
      },
      {
        "label": "AWS Network Architecture Whitepaper: Building a Scalable Multi-VPC Network",
        "url": "https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/introduction.html"
      }
    ]
  },
  {
    "id": "maglev-and-l4-load-balancing",
    "title": "Maglev & Layer 4 Load Balancing",
    "description": "Maglev operates on bare-metal servers using BGP Equal-Cost Multi-Pathing (ECMP) across routers.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "load-balancing",
      "maglev",
      "distributed-systems"
    ],
    "resources": [
      {
        "label": "Maglev: A Fast and Reliable Software Network Load Balancer (Eisenbud et al., USENIX NSDI)",
        "url": "https://research.google/pubs/maglev-a-fast-and-reliable-software-network-load-balancer/"
      },
      {
        "label": "Facebook Katran: A High Performance Layer 4 Load Balancer (GitHub & Docs)",
        "url": "https://github.com/facebookincubator/katran"
      }
    ]
  },
  {
    "id": "bgp-anycast-routing-and-ddos-mitigation",
    "title": "BGP Anycast Routing",
    "description": "Anycast assigns the exact same public IP address to servers distributed across dozens of global Points of Presence (PoPs) advertising BGP routes to Tier-1.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "bgp",
      "anycast",
      "cdn"
    ],
    "resources": [
      {
        "label": "RFC 4786: Operation of Anycast Services (IETF)",
        "url": "https://datatracker.ietf.org/doc/html/rfc4786"
      }
    ]
  },
  {
    "id": "cdn-cache-hierarchies-and-stale-while-revalidate",
    "title": "CDN Edge Caching",
    "description": "Edge CDNs collapse origin traffic spikes using multi-tier shielding caches.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "cdn",
      "caching",
      "http",
      "performance"
    ],
    "resources": [
      {
        "label": "RFC 5861: HTTP Cache-Control Extensions for Stale Content",
        "url": "https://datatracker.ietf.org/doc/html/rfc5861"
      }
    ]
  },
  {
    "id": "dns-based-traffic-routing-and-edns0-client-subnet",
    "title": "DNS Traffic Management",
    "description": "Authoritative DNS servers route requests based on client geolocation and network latency measurements.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "dns",
      "networking",
      "latency-routing",
      "edns"
    ],
    "resources": [
      {
        "label": "RFC 7871: Client Subnet in DNS Queries (IETF)",
        "url": "https://datatracker.ietf.org/doc/html/rfc7871"
      },
      {
        "label": "Amazon Route 53 Documentation: Latency and Geolocation Routing Policies",
        "url": "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html"
      }
    ]
  },
  {
    "id": "canary-deployments-and-automated-rollbacks",
    "title": "Canary Releases & Progressive Delivery",
    "description": "Canary deployment shifts a small percentage of real user traffic (1–5%) to newly deployed version pods while measuring error rates and latency histograms against.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "ci-cd",
      "deployments",
      "canary",
      "observability"
    ],
    "resources": [
      {
        "label": "Argo Rollouts: Advanced Deployment Strategies (Canary & Blue-Green)",
        "url": "https://argoproj.github.io/argo-rollouts/"
      }
    ]
  },
  {
    "id": "blue-green-deployments-and-dns-switchover",
    "title": "Blue-Green Deployments",
    "description": "Blue-Green deployments maintain two identical production environments: Blue (active live traffic) and Green (idle staging target).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "ci-cd",
      "deployments",
      "blue-green",
      "networking"
    ],
    "resources": [
      {
        "label": "AWS Whitepaper: Blue/Green Deployments on AWS",
        "url": "https://docs.aws.amazon.com/whitepapers/latest/overview-deployment-options/bluegreen-deployments.html"
      }
    ]
  },
  {
    "id": "gitops-argocd-and-flux-reconciliation",
    "title": "GitOps Architecture",
    "description": "GitOps uses Git repositories as the cryptographic single source of truth for declared Kubernetes infrastructure.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "gitops",
      "argocd",
      "flux",
      "kubernetes"
    ],
    "resources": [
      {
        "label": "Argo CD Architectural Overview & Sync Engine",
        "url": "https://argo-cd.readthedocs.io/en/stable/operator-manual/architecture/"
      },
      {
        "label": "Flux v2 Architecture and GitOps Toolkit",
        "url": "https://fluxcd.io/flux/components/"
      }
    ]
  },
  {
    "id": "database-migrations-expand-contract-pattern",
    "title": "Zero-Downtime Database Migrations",
    "description": "Applying breaking database schema mutations during rolling software rollouts causes dual-version write crashes.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "ci-cd",
      "databases",
      "migrations",
      "zero-downtime"
    ],
    "resources": [
      {
        "label": "Martin Fowler: Evolutionary Database Design & Parallel Run",
        "url": "https://martinfowler.com/articles/evodb.html"
      },
      {
        "label": "Stripe Engineering: Online migrations at scale",
        "url": "https://stripe.com/blog/online-migrations"
      }
    ]
  },
  {
    "id": "firecracker-microvms-and-jailer",
    "title": "Firecracker MicroVMs",
    "description": "AWS Firecracker strips legacy BIOS/QEMU device emulation, running lightweight Rust-based virtual machines directly over the Linux Kernel-based Virtual Machine (KVM).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "serverless",
      "virtualization",
      "kvm",
      "microvms"
    ],
    "resources": [
      {
        "label": "Firecracker: Lightweight Virtualization for Serverless (Agache et al., USENIX NSDI)",
        "url": "https://www.usenix.org/conference/nsdi20/presentation/agache"
      },
      {
        "label": "Firecracker Architecture & Security Model Docs",
        "url": "https://github.com/firecracker-microvm/firecracker/blob/main/docs/design.md"
      }
    ]
  },
  {
    "id": "v8-isolates-and-edge-workers",
    "title": "Edge Compute",
    "description": "Traditional serverless functions allocate dedicated processes or microVMs per tenant.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "serverless",
      "edge-compute",
      "v8",
      "javascript"
    ],
    "resources": [
      {
        "label": "Cloudflare Workers: How Workers Works (V8 Isolates Architecture)",
        "url": "https://developers.cloudflare.com/workers/reference/how-workers-works/"
      }
    ]
  },
  {
    "id": "serverless-cold-starts-and-provisioned-concurrency",
    "title": "Serverless Cold Starts",
    "description": "Serverless cold starts occur during initial container initialization, runtime bootstrapping, and module imports.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "serverless",
      "aws-lambda",
      "performance",
      "concurrency"
    ],
    "resources": [
      {
        "label": "AWS Compute Blog: Reducing Cold Starts with AWS Lambda SnapStart",
        "url": "https://aws.amazon.com/blogs/compute/reducing-java-cold-starts-on-aws-lambda-functions-with-snapstart/"
      },
      {
        "label": "Serverless Computing: One Step Forward, Two Steps Back (Hellerstein et al., CIDR)",
        "url": "https://arxiv.org/abs/1812.03651"
      }
    ]
  },
  {
    "id": "event-driven-architectures-and-cqrs-event-sourcing",
    "title": "Event-Driven Systems",
    "description": "Event-driven systems decouple asynchronous domain state transitions through ordered immutable event logs (Kafka, EventBridge).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "cloud-architecture",
      "event-driven",
      "cqrs",
      "kafka"
    ],
    "resources": [
      {
        "label": "Martin Fowler: Event Sourcing Architecture",
        "url": "https://martinfowler.com/eaaDev/EventSourcing.html"
      }
    ]
  },
  {
    "id": "k8s-pod-disruption-budgets-and-drain",
    "title": "Kubernetes Pod Disruption Budgets (PDB) & Graceful Node Drains",
    "description": "Guarantees a minimum number of running pod replicas during voluntary node drains and rolling cluster maintenance.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "kubernetes",
      "high-availability",
      "sre"
    ],
    "resources": [
      {
        "label": "Kubernetes Documentation: Specifying a Disruption Budget for Your Application",
        "url": "https://kubernetes.io/docs/tasks/run-application/configure-pdb/"
      },
      {
        "label": "Kubernetes Documentation: Safely Drain a Node",
        "url": "https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/"
      }
    ]
  },
  {
    "id": "k8s-horizontal-pod-autoscaling-hpa-keda",
    "title": "Kubernetes Autoscaling",
    "description": "Horizontal Pod Autoscaler (HPA) queries the metrics.k8s.io API and adjusts replica counts based on observed CPU/memory utilization using a proportional target ratio.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "kubernetes",
      "autoscaling",
      "keda",
      "metrics"
    ],
    "resources": [
      {
        "label": "Kubernetes Documentation: Horizontal Pod Autoscaler",
        "url": "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/"
      }
    ]
  },
  {
    "id": "k8s-network-policies-and-calico-enforcement",
    "title": "Kubernetes NetworkPolicies",
    "description": "Enforces declarative micro-segmentation at Layer 3/4, isolating pod traffic using Kubernetes label selectors and network plugins.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "kubernetes",
      "security",
      "network-policies",
      "firewall"
    ],
    "resources": [
      {
        "label": "Kubernetes Documentation: Network Policies",
        "url": "https://kubernetes.io/docs/concepts/services-networking/network-policies/"
      },
      {
        "label": "Cilium Network Policy Editor & Specification",
        "url": "https://editor.cilium.io/"
      }
    ]
  },
  {
    "id": "grpc-http2-multiplexing-and-load-balancing",
    "title": "gRPC over HTTP/2",
    "description": "GRPC multiplexes concurrent RPC requests over single long-lived TCP/TLS connections via HTTP/2 binary streams.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "grpc",
      "http2",
      "load-balancing"
    ],
    "resources": [
      {
        "label": "gRPC Official Guide: Load Balancing in gRPC",
        "url": "https://grpc.io/blog/grpc-load-balancing/"
      },
      {
        "label": "HTTP/2 RFC 7540: Framing & Multiplexing Specification",
        "url": "https://datatracker.ietf.org/doc/html/rfc7540"
      }
    ]
  },
  {
    "id": "chaos-engineering-and-fault-injection",
    "title": "Chaos Engineering",
    "description": "Chaos engineering proactively uncovers systemic architectural vulnerabilities by injecting controlled production anomalies (network partitions).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "sre",
      "chaos-engineering",
      "resilience",
      "reliability"
    ],
    "resources": [
      {
        "label": "Principles of Chaos Engineering Standard",
        "url": "https://principlesofchaos.org/"
      },
      {
        "label": "Chaos Mesh: Chaos Engineering Platform for Kubernetes",
        "url": "https://chaos-mesh.org/docs/"
      }
    ]
  },
  {
    "id": "distributed-rate-limiting-token-bucket-redis",
    "title": "Distributed Rate Limiting (Redis)",
    "description": "APIs protect downstream backends from overload using rate limiting algorithms.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "rate-limiting",
      "algorithms",
      "redis"
    ],
    "resources": [
      {
        "label": "Figma Engineering: An Alternative Approach to Rate Limiting",
        "url": "https://www.figma.com/blog/an-alternative-approach-to-rate-limiting/"
      },
      {
        "label": "Stripe Engineering: Scaling your API with rate limiters",
        "url": "https://stripe.com/blog/rate-limiters"
      },
      {
        "label": "IETF Draft: RateLimit Header Fields for HTTP",
        "url": "https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-07"
      }
    ]
  },
  {
    "id": "cloud-finops-spot-instances-and-capacity-pools",
    "title": "Cloud FinOps",
    "description": "Cloud providers sell spare compute capacity at steep discounts (60–90%) via Spot/Preemptible instances with a 2-minute eviction notice.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "finops",
      "cost-optimization",
      "cloud-architecture",
      "spot-instances"
    ],
    "resources": [
      {
        "label": "FinOps Foundation: Cloud Cost Management Framework",
        "url": "https://www.finops.org/framework/"
      },
      {
        "label": "AWS Documentation: Best Practices for EC2 Spot Instances",
        "url": "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-best-practices.html"
      }
    ]
  },
  {
    "id": "distributed-tracing-sampling-head-vs-tail",
    "title": "Distributed Tracing Sampling",
    "description": "High-throughput systems cannot afford to persist 100% of telemetry traces.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "observability",
      "distributed-tracing",
      "sampling",
      "opentelemetry"
    ],
    "resources": [
      {
        "label": "OpenTelemetry Documentation: Sampling Strategies in Tracing",
        "url": "https://opentelemetry.io/docs/concepts/sampling/"
      },
      {
        "label": "Jaeger Architecture: Adaptive and Remote Sampling",
        "url": "https://www.jaegertracing.io/docs/latest/sampling/"
      }
    ]
  },
  {
    "id": "secrets-rotation-and-dynamic-database-credentials",
    "title": "Zero-Static-Secrets",
    "description": "Static database credentials embedded in config maps create severe breach vulnerabilities.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "security",
      "secrets",
      "vault",
      "iam"
    ],
    "resources": [
      {
        "label": "HashiCorp Vault Database Secrets Engine Documentation",
        "url": "https://developer.hashicorp.com/vault/docs/secrets/databases"
      },
      {
        "label": "AWS Secrets Manager: Automatic Secret Rotation Architecture",
        "url": "https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html"
      }
    ]
  },
  {
    "id": "container-image-layering-and-content-addressable-blobs",
    "title": "Container Image Internals",
    "description": "OCI container images are structured as cryptographic SHA-256 content-addressable blobs organized into a manifest, config JSON, and stacked tarball filesystem layers.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "containers",
      "docker",
      "oci",
      "storage"
    ],
    "resources": [
      {
        "label": "OCI Image Format Specification Standard",
        "url": "https://github.com/opencontainers/image-spec"
      },
      {
        "label": "Linux Kernel Documentation: Overlay Filesystem",
        "url": "https://docs.kernel.org/filesystems/overlayfs.html"
      }
    ]
  },
  {
    "id": "cross-plane-and-kubernetes-universal-control-planes",
    "title": "Crossplane",
    "description": "Crossplane extends the Kubernetes API to manage external cloud infrastructure (databases, buckets, VPCs) directly using Custom Resources (Managed Resources).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "kubernetes",
      "crossplane",
      "iac",
      "cloud-engineering"
    ],
    "resources": [
      {
        "label": "CNCF Crossplane Project Overview",
        "url": "https://www.cncf.io/projects/crossplane/"
      }
    ]
  },
  {
    "id": "cloud-networking-nat-gateways-and-snat-port-exhaustion",
    "title": "Cloud NAT Gateways",
    "description": "Private subnets communicate with external internet services through managed NAT gateways using Source Network Address Translation (SNAT).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "nat",
      "aws-vpc",
      "snat"
    ],
    "resources": [
      {
        "label": "Google Cloud NAT Architecture and Port Allocation",
        "url": "https://cloud.google.com/nat/docs/overview"
      }
    ]
  },
  {
    "id": "immutable-infrastructure-and-golden-images",
    "title": "Immutable Infrastructure",
    "description": "Immutable infrastructure strictly prohibits in-place patching or mutating running production instances.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "devops",
      "packer",
      "ami",
      "immutable-infrastructure"
    ],
    "resources": [
      {
        "label": "HashiCorp Packer Core Concepts & Automated Image Building",
        "url": "https://developer.hashicorp.com/packer/docs/intro"
      }
    ]
  },
  {
    "id": "etcd-compaction-and-defragmentation",
    "title": "etcd Maintenance",
    "description": "Because etcd is an append-only MVCC database that preserves revision history, unbounded updates trigger out-of-quota database alarms (2–8 GB limits).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "etcd",
      "kubernetes",
      "database-admin",
      "storage"
    ],
    "resources": [
      {
        "label": "etcd Maintenance Guide: Compacting and Defragmenting Storage",
        "url": "https://etcd.io/docs/latest/op-guide/maintenance/"
      },
      {
        "label": "Kubernetes Documentation: Operating etcd Clusters for Kubernetes",
        "url": "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/"
      }
    ]
  },
  {
    "id": "container-security-seccomp-apparmor-capabilities",
    "title": "Linux Container Hardening",
    "description": "Default container root permissions are constrained by dropping unnecessary Linux kernel capabilities (e.g. CAP_SYS_ADMIN, CAP_NET_ADMIN).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "security",
      "linux",
      "containers",
      "kernel"
    ],
    "resources": [
      {
        "label": "Docker Documentation: Seccomp Security Profiles",
        "url": "https://docs.docker.com/engine/security/seccomp/"
      },
      {
        "label": "Kubernetes Documentation: Restricting a Container's Syscalls with seccomp",
        "url": "https://kubernetes.io/docs/tutorials/security/seccomp/"
      },
      {
        "label": "Linux Kernel Capabilities Manual (man 7 capabilities)",
        "url": "https://man7.org/linux/man-pages/man7/capabilities.7.html"
      }
    ]
  },
  {
    "id": "service-discovery-dns-consul-and-serf-gossip",
    "title": "Service Discovery Architecture",
    "description": "Consul manages dynamic microservice registration and health checking across multi-datacenter clusters.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "service-discovery",
      "consul",
      "distributed-systems"
    ],
    "resources": [
      {
        "label": "HashiCorp Consul Architecture Overview",
        "url": "https://developer.hashicorp.com/consul/docs/architecture"
      }
    ]
  },
  {
    "id": "distributed-cron-and-job-scheduling-nomad",
    "title": "Distributed Workload Scheduling",
    "description": "Nomad schedules containers, non-containerized binaries, and batch jobs across heterogeneous infrastructure with sub-second execution latency.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "orchestration",
      "scheduling",
      "nomad",
      "distributed-systems"
    ],
    "resources": [
      {
        "label": "HashiCorp Nomad Architecture & Evaluation Broker Deep Dive",
        "url": "https://developer.hashicorp.com/nomad/docs/internals/architecture"
      }
    ]
  },
  {
    "id": "bpf-co-re-and-libbpf-kernel-portability",
    "title": "eBPF Portability",
    "description": "Historically, eBPF programs required runtime LLVM/Clang compilation on every target node with matching kernel headers.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "ebpf",
      "linux",
      "kernel",
      "compilers"
    ],
    "resources": [
      {
        "label": "Linux Kernel Documentation: BPF Type Format (BTF)",
        "url": "https://docs.kernel.org/bpf/btf.html"
      }
    ]
  },
  {
    "id": "multi-region-active-active-and-cockroachdb-consensus",
    "title": "Multi-Region Active-Active Architectures",
    "description": "Global distributed SQL databases (CockroachDB, YugabyteDB) partition keys into 64MB ranges, each governed by its own independent Raft consensus group (Multi-Raft).",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed-systems",
      "databases",
      "multi-region",
      "cockroachdb"
    ],
    "resources": [
      {
        "label": "Spanner: Google's Globally-Distributed Database (Corbett et al., OSDI)",
        "url": "https://research.google/pubs/spanner-googles-globally-distributed-database/"
      }
    ]
  },
  {
    "id": "aws-ebs-io2-block-express-and-sr-iov",
    "title": "Cloud Block Storage Virtualization",
    "description": "AWS io2 Block Express decouples storage instances by routing block commands over a custom SR-IOV virtual network device to scalable NVMe storage pools.",
    "category": "cloud-infra",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "storage",
      "aws-ebs",
      "hardware",
      "cloud-infra"
    ],
    "resources": [
      {
        "label": "Wikipedia: Block-level storage",
        "url": "https://en.wikipedia.org/wiki/Block-level_storage"
      }
    ]
  },
  {
    "id": "bloom-filter-probabilistic-membership",
    "title": "Bloom Filters",
    "description": "A Bloom filter represents set membership in a compact bit array using $k$ independent hash functions.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "probabilistic",
      "bloom-filters",
      "hashing",
      "data-structures"
    ],
    "resources": [
      {
        "label": "Wikipedia: Bloom filter",
        "url": "https://en.wikipedia.org/wiki/Bloom_filter"
      }
    ]
  },
  {
    "id": "cuckoo-filter-dynamic-deletion",
    "title": "Cuckoo Filters",
    "description": "Cuckoo filters store short hash fingerprints inside an array of buckets using cuckoo hashing.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "probabilistic",
      "cuckoo-filter",
      "hashing",
      "data-structures"
    ],
    "resources": [
      {
        "label": "Wikipedia: Cuckoo filter",
        "url": "https://en.wikipedia.org/wiki/Cuckoo_filter"
      }
    ]
  },
  {
    "id": "hyperloglog-cardinality-estimation",
    "title": "HyperLogLog",
    "description": "HyperLogLog estimates the cardinality of large multiset streams using $O(\\log \\log N)$ space by tracking the maximum number of leading zeros in hashed element.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "probabilistic",
      "hyperloglog",
      "streaming",
      "cardinality"
    ],
    "resources": [
      {
        "label": "Wikipedia: HyperLogLog",
        "url": "https://en.wikipedia.org/wiki/HyperLogLog"
      }
    ]
  },
  {
    "id": "count-min-sketch-frequency-estimation",
    "title": "Count-Min Sketch",
    "description": "The Count-Min Sketch maintains a 2D array of counters with $d$ hash functions to estimate event frequencies and identify heavy hitters in high-velocity data.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "probabilistic",
      "count-min-sketch",
      "streaming",
      "heavy-hitters"
    ],
    "resources": [
      {
        "label": "Wikipedia: Count–min sketch",
        "url": "https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch"
      }
    ]
  },
  {
    "id": "minhash-and-simhash-locality-sensitive-hashing",
    "title": "MinHash & SimHash",
    "description": "MinHash estimates Jaccard set similarity by comparing minimum hash permutations across document token sets.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "probabilistic",
      "minhash",
      "simhash",
      "lsh",
      "similarity"
    ],
    "resources": [
      {
        "label": "Wikipedia: MinHash",
        "url": "https://en.wikipedia.org/wiki/MinHash"
      }
    ]
  },
  {
    "id": "b-tree-and-b-plus-tree-indexing",
    "title": "B-Trees & B+ Trees",
    "description": "B-trees maintain balanced multi-way tree hierarchies where each node matches disk page boundaries to minimize I/O seek latency during disk-based lookups.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "trees",
      "b-tree",
      "databases",
      "indexing"
    ],
    "resources": [
      {
        "label": "Wikipedia: B-tree",
        "url": "https://en.wikipedia.org/wiki/B-tree"
      }
    ]
  },
  {
    "id": "lsm-tree-write-optimized-storage",
    "title": "Log-Structured Merge-Trees (LSM-Trees)",
    "description": "LSM-Trees buffer incoming writes in an in-memory balanced tree (MemTable) before flushing sorted immutable disk files (SSTables) sequentially.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "trees",
      "lsm-tree",
      "storage",
      "databases"
    ],
    "resources": [
      {
        "label": "Martin Kleppmann: Designing Data-Intensive Applications (Chapter 3: Storage and Retrieval)",
        "url": "https://dataintensive.net/"
      }
    ]
  },
  {
    "id": "segment-tree-range-queries",
    "title": "Segment Trees",
    "description": "A Segment Tree stores aggregated associative metrics (sum, min, gcd) over array intervals across binary tree nodes.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "trees",
      "segment-tree",
      "range-queries",
      "algorithms"
    ],
    "resources": [
      {
        "label": "CP-Algorithms: Segment Tree Implementation & Range Queries",
        "url": "https://cp-algorithms.com/data_structures/segment_tree.html"
      }
    ]
  },
  {
    "id": "fenwick-tree-binary-indexed-tree",
    "title": "Fenwick Trees (Binary Indexed Trees)",
    "description": "A Fenwick Tree evaluates cumulative prefix sums and executes point updates over dynamic numeric arrays in $O(\\log N)$ time and $O(N)$ auxiliary space.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "trees",
      "fenwick-tree",
      "bit",
      "prefix-sums"
    ],
    "resources": [
      {
        "label": "Topcoder: Binary Indexed Trees Tutorial",
        "url": "https://www.topcoder.com/thrive/articles/Binary%20Indexed%20Trees"
      }
    ]
  },
  {
    "id": "radix-tree-and-trie-indexing",
    "title": "Tries, Radix Trees & Crit-Bit Trees",
    "description": "Tries structure string or bit sequences into positional key trees where edges represent character transitions.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "trees",
      "trie",
      "radix-tree",
      "strings"
    ],
    "resources": [
      {
        "label": "Wikipedia: Trie",
        "url": "https://en.wikipedia.org/wiki/Trie"
      }
    ]
  },
  {
    "id": "skip-list-probabilistic-alternative",
    "title": "Skip Lists",
    "description": "A skip list augments a sorted linked list with hierarchical express forward lanes generated via geometric coin flips, delivering expected $O(\\log N)$ search.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "trees",
      "skip-list",
      "search",
      "concurrency"
    ],
    "resources": [
      {
        "label": "Wikipedia: Skip list",
        "url": "https://en.wikipedia.org/wiki/Skip_list"
      }
    ]
  },
  {
    "id": "red-black-and-avl-trees",
    "title": "Red-Black Trees vs. AVL Trees",
    "description": "AVL trees maintain strict balance by ensuring child subtree heights differ by at most one.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "trees",
      "red-black-tree",
      "avl-tree",
      "balanced-trees"
    ],
    "resources": [
      {
        "label": "Wikipedia: Red–black tree",
        "url": "https://en.wikipedia.org/wiki/Red%E2%80%93black_tree"
      }
    ]
  },
  {
    "id": "splay-tree-self-adjusting-search",
    "title": "Splay Trees",
    "description": "A Splay Tree re-structures itself by moving accessed nodes to the root via a series of double rotations (zig-zig, zig-zag) called splaying.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "trees",
      "splay-tree",
      "amortized",
      "self-adjusting"
    ],
    "resources": [
      {
        "label": "Wikipedia: Splay tree",
        "url": "https://en.wikipedia.org/wiki/Splay_tree"
      }
    ]
  },
  {
    "id": "treap-randomized-search-tree",
    "title": "Treaps & Implicit Cartesian Trees",
    "description": "A Treap combines binary search tree key ordering with binary heap priority ordering using randomly assigned numeric priorities.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "trees",
      "treap",
      "randomized",
      "data-structures"
    ],
    "resources": [
      {
        "label": "CP-Algorithms: Treap Implementation and Implicit Treap Operations",
        "url": "https://cp-algorithms.com/data_structures/treap.html"
      }
    ]
  },
  {
    "id": "interval-tree-and-range-trees",
    "title": "Interval Trees & Range Trees",
    "description": "Interval trees store 1D line segments keyed by start endpoints and augmented with maximum subtree endpoints.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "trees",
      "interval-tree",
      "range-tree",
      "geometry"
    ],
    "resources": [
      {
        "label": "Cormen, Leiserson, Rivest, Stein: Introduction to Algorithms (CLRS Chapter 14: Augmenting Data Structures)",
        "url": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"
      }
    ]
  },
  {
    "id": "dijkstra-shortest-path-fibonacci-heap",
    "title": "Dijkstra's Shortest Path Algorithm",
    "description": "Dijkstra's algorithm finds single-source shortest paths in non-negatively weighted graphs by greedily relaxing edge frontiers using a priority queue.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "graphs",
      "shortest-path",
      "dijkstra",
      "heaps"
    ],
    "resources": [
      {
        "label": "Cormen, Leiserson, Rivest, Stein: Introduction to Algorithms (CLRS Chapter 24: Single-Source Shortest Paths)",
        "url": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"
      }
    ]
  },
  {
    "id": "a-star-heuristic-search",
    "title": "A* Search Algorithm",
    "description": "The A* search algorithm navigates state graphs by prioritizing node evaluations according to $f(n) = g(n) + h(n)$.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "graphs",
      "a-star",
      "heuristics",
      "pathfinding"
    ],
    "resources": [
      {
        "label": "Wikipedia: A* search algorithm",
        "url": "https://en.wikipedia.org/wiki/A*_search_algorithm"
      }
    ]
  },
  {
    "id": "max-flow-min-cut-ford-fulkerson-dinic",
    "title": "Max-Flow Min-Cut Theorem",
    "description": "The Max-Flow Min-Cut theorem establishes that the maximum throughput across a flow network strictly equals the minimum capacity required to sever source-sink.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "graphs",
      "network-flow",
      "max-flow",
      "min-cut"
    ],
    "resources": [
      {
        "label": "Wikipedia: Max-flow min-cut theorem",
        "url": "https://en.wikipedia.org/wiki/Max-flow_min-cut_theorem"
      }
    ]
  },
  {
    "id": "strongly-connected-components-tarjan-kosaraju",
    "title": "Strongly Connected Components",
    "description": "Strongly Connected Components (SCCs) represent maximal subgraphs where every vertex is reachable from every other vertex.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "graphs",
      "scc",
      "tarjan",
      "kosaraju"
    ],
    "resources": [
      {
        "label": "MIT 6.006: Depth First Search, Strongly Connected Components",
        "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-10-depth-first-search/"
      }
    ]
  },
  {
    "id": "topological-sorting-kahn-and-dfs",
    "title": "Topological Sorting",
    "description": "Topological sorting produces a linear ordering of vertices in Directed Acyclic Graphs (DAGs) such that for every directed edge $u \\to v$, vertex $u$ precedes $v$.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "graphs",
      "topological-sort",
      "dag",
      "dependencies"
    ],
    "resources": [
      {
        "label": "Cormen, Leiserson, Rivest, Stein: Introduction to Algorithms (CLRS Chapter 22: Elementary Graph Algorithms)",
        "url": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"
      }
    ]
  },
  {
    "id": "minimum-spanning-tree-kruskal-prim",
    "title": "Minimum Spanning Trees",
    "description": "A Minimum Spanning Tree connects all vertices in an edge-weighted undirected graph with the minimum total edge cost without cycles.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "graphs",
      "mst",
      "kruskal",
      "prim"
    ],
    "resources": [
      {
        "label": "R. C. Prim: Shortest Connection Networks And Some Generalizations (1957 Bell System Technical Journal)",
        "url": "https://archive.org/details/bstj36-6-1389"
      }
    ]
  },
  {
    "id": "bellman-ford-and-floyd-warshall",
    "title": "Negative Cycles",
    "description": "The Bellman-Ford algorithm calculates single-source shortest paths in $O(VE)$ time across graphs with negative edge weights.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "graphs",
      "shortest-path",
      "dynamic-programming",
      "bellman-ford"
    ],
    "resources": [
      {
        "label": "Wikipedia: Bellman–Ford algorithm",
        "url": "https://en.wikipedia.org/wiki/Bellman%E2%80%93Ford_algorithm"
      }
    ]
  },
  {
    "id": "lowest-common-ancestor-binary-lifting",
    "title": "Lowest Common Ancestor (LCA)",
    "description": "The Lowest Common Ancestor problem finds the deepest shared ancestor node between two tree vertices.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "graphs",
      "trees",
      "lca",
      "binary-lifting",
      "rmq"
    ],
    "resources": [
      {
        "label": "CP-Algorithms: Lowest Common Ancestor — Binary Lifting & Farach-Colton and Bender Algorithm",
        "url": "https://cp-algorithms.com/graph/lca.html"
      }
    ]
  },
  {
    "id": "heavy-light-decomposition-trees",
    "title": "Heavy-Light Decomposition (HLD)",
    "description": "Heavy-Light Decomposition partitions any tree into disjoint contiguous linear chains by classifying each node's heaviest subtree edge as 'heavy' and all.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "graphs",
      "trees",
      "hld",
      "segment-tree"
    ],
    "resources": [
      {
        "label": "CP-Algorithms: Heavy-Light Decomposition Tutorial",
        "url": "https://cp-algorithms.com/graph/hld.html"
      }
    ]
  },
  {
    "id": "hopcroft-karp-bipartite-matching",
    "title": "Bipartite Maximum Matching",
    "description": "Finds the maximum cardinality matching in bipartite graphs in optimal O(E * sqrt(V)) time by discovering shortest augmenting paths.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "graphs",
      "bipartite-matching",
      "flow",
      "algorithms"
    ],
    "resources": [
      {
        "label": "Wikipedia: Hopcroft–Karp algorithm",
        "url": "https://en.wikipedia.org/wiki/Hopcroft%E2%80%93Karp_algorithm"
      }
    ]
  },
  {
    "id": "raft-consensus-algorithm",
    "title": "Raft Consensus Algorithm",
    "description": "Raft decomposes distributed state machine consensus into three independent sub-problems.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed",
      "consensus",
      "raft",
      "replication"
    ],
    "resources": [
      {
        "label": "Wikipedia: Raft (algorithm)",
        "url": "https://en.wikipedia.org/wiki/Raft_(algorithm)"
      }
    ]
  },
  {
    "id": "paxos-consensus-protocol",
    "title": "Paxos Consensus Protocol",
    "description": "Paxos establishes agreement on a single value in asynchronous distributed networks prone to message loss and delays.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed",
      "consensus",
      "paxos",
      "fault-tolerance"
    ],
    "resources": [
      {
        "label": "Wikipedia: Paxos (computer science)",
        "url": "https://en.wikipedia.org/wiki/Paxos_(computer_science)"
      }
    ]
  },
  {
    "id": "lamport-timestamps-and-vector-clocks",
    "title": "Causal Ordering",
    "description": "Lamport timestamps establish a partial 'happens-before' ($\\to$) ordering by monotonically incrementing local logical counters on internal events and message.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed",
      "time",
      "vector-clocks",
      "causality"
    ],
    "resources": [
      {
        "label": "Wikipedia: Lamport timestamp",
        "url": "https://en.wikipedia.org/wiki/Lamport_timestamp"
      }
    ]
  },
  {
    "id": "crdt-conflict-free-replicated-data-types",
    "title": "Conflict-Free Replicated Data Types (CRDTs)",
    "description": "CRDTs allow distributed replicas to execute concurrent mutations locally without centralized coordination, guaranteeing eventual consistency without merge conflicts.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed",
      "crdts",
      "replication",
      "eventual-consistency"
    ],
    "resources": [
      {
        "label": "Martin Kleppmann: A Conflict-Free Replicated JSON Datatype (IEEE TPDS 2017)",
        "url": "https://arxiv.org/abs/1608.03960"
      }
    ]
  },
  {
    "id": "two-phase-commit-vs-three-phase-commit",
    "title": "Atomic Commit",
    "description": "Two-Phase Commit (2PC) coordinates distributed transactions across multiple resource managers via voting (Prepare) and execution (Commit/Abort) phases.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed",
      "transactions",
      "2pc",
      "consensus"
    ],
    "resources": [
      {
        "label": "Wikipedia: Atomic commit",
        "url": "https://en.wikipedia.org/wiki/Atomic_commit"
      }
    ]
  },
  {
    "id": "gossip-protocols-and-epidemic-dissemination",
    "title": "Gossip Protocols",
    "description": "Gossip protocols disseminate cluster state and membership updates by having nodes periodically exchange random pairwise messages.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed",
      "gossip",
      "epidemic",
      "membership"
    ],
    "resources": [
      {
        "label": "Wikipedia: Gossip protocol",
        "url": "https://en.wikipedia.org/wiki/Gossip_protocol"
      }
    ]
  },
  {
    "id": "byzantine-fault-tolerance-pbft",
    "title": "Practical Byzantine Fault Tolerance (PBFT)",
    "description": "PBFT achieves state machine replication in asynchronous networks withstanding up to $f$ arbitrary or malicious node failures across $3f + 1$ total cluster.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed",
      "bft",
      "consensus",
      "pbft"
    ],
    "resources": [
      {
        "label": "Wikipedia: Byzantine fault",
        "url": "https://en.wikipedia.org/wiki/Byzantine_fault"
      }
    ]
  },
  {
    "id": "chandy-lamport-distributed-snapshots",
    "title": "Chandy-Lamport Algorithm",
    "description": "The Chandy-Lamport algorithm records a consistent global system state without halting live distributed transaction processing.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed",
      "snapshots",
      "chandy-lamport",
      "state-machine"
    ],
    "resources": [
      {
        "label": "Wikipedia: Chandy–Lamport algorithm",
        "url": "https://en.wikipedia.org/wiki/Chandy%E2%80%93Lamport_algorithm"
      }
    ]
  },
  {
    "id": "knuth-morris-pratt-string-matching",
    "title": "Knuth-Morris-Pratt (KMP) Algorithm",
    "description": "The KMP algorithm executes exact substring matching in linear $O(N + M)$ time by preprocessing the search pattern into a longest prefix-suffix (LPS) lookup array.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "strings",
      "kmp",
      "pattern-matching",
      "algorithms"
    ],
    "resources": [
      {
        "label": "Wikipedia: Knuth–Morris–Pratt algorithm",
        "url": "https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm"
      }
    ]
  },
  {
    "id": "rabin-karp-rolling-hash",
    "title": "Rabin-Karp Algorithm",
    "description": "Rabin-Karp matches substrings by computing a polynomial rolling hash over sliding text windows.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "strings",
      "rabin-karp",
      "hashing",
      "pattern-matching"
    ],
    "resources": [
      {
        "label": "Wikipedia: Rabin–Karp algorithm",
        "url": "https://en.wikipedia.org/wiki/Rabin%E2%80%93Karp_algorithm"
      }
    ]
  },
  {
    "id": "suffix-arrays-and-lcp-arrays",
    "title": "Suffix Arrays",
    "description": "A Suffix Array contains sorted integer indices of all suffixes in a string, offering a space-efficient alternative to Suffix Trees with $O(N)$ construction via.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "strings",
      "suffix-array",
      "lcp",
      "algorithms"
    ],
    "resources": [
      {
        "label": "Wikipedia: Suffix array",
        "url": "https://en.wikipedia.org/wiki/Suffix_array"
      }
    ]
  },
  {
    "id": "aho-corasick-automaton",
    "title": "Aho-Corasick Automaton",
    "description": "The Aho-Corasick algorithm builds a deterministic finite automaton from a dictionary of keywords by linking trie nodes with suffix fallback failure transitions.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "strings",
      "aho-corasick",
      "automata",
      "pattern-matching"
    ],
    "resources": [
      {
        "label": "Wikipedia: Aho–Corasick algorithm",
        "url": "https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm"
      }
    ]
  },
  {
    "id": "levenshtein-edit-distance-wagner-fischer",
    "title": "Levenshtein Distance",
    "description": "Levenshtein distance measures the minimum number of single-character insertions, deletions, and substitutions required to transform one string into another.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "strings",
      "edit-distance",
      "dynamic-programming",
      "levenshtein"
    ],
    "resources": [
      {
        "label": "Wikipedia: Levenshtein distance",
        "url": "https://en.wikipedia.org/wiki/Levenshtein_distance"
      }
    ]
  },
  {
    "id": "suffix-trees-and-ukkonen-algorithm",
    "title": "Suffix Trees",
    "description": "A Suffix Tree is a compacted trie containing all suffixes of a text string.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "strings",
      "suffix-tree",
      "ukkonen",
      "data-structures"
    ],
    "resources": [
      {
        "label": "Wikipedia: Suffix tree",
        "url": "https://en.wikipedia.org/wiki/Suffix_tree"
      }
    ]
  },
  {
    "id": "boyer-moore-string-search",
    "title": "Boyer-Moore String Search",
    "description": "The Boyer-Moore algorithm searches for substrings by scanning pattern characters from right to left while advancing across the target text from left to right.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "strings",
      "boyer-moore",
      "pattern-matching",
      "algorithms"
    ],
    "resources": [
      {
        "label": "Wikipedia: Boyer–Moore string-search algorithm",
        "url": "https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore_string-search_algorithm"
      }
    ]
  },
  {
    "id": "burrows-wheeler-transform-fm-index",
    "title": "Burrows-Wheeler Transform (BWT)",
    "description": "The Burrows-Wheeler Transform rearranges string characters into reversible cyclic permutation blocks with high character runs.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "strings",
      "bwt",
      "fm-index",
      "compression",
      "bioinformatics"
    ],
    "resources": [
      {
        "label": "Wikipedia: Burrows–Wheeler transform",
        "url": "https://en.wikipedia.org/wiki/Burrows%E2%80%93Wheeler_transform"
      }
    ]
  },
  {
    "id": "quickselect-and-median-of-medians",
    "title": "Quickselect & Median of Medians",
    "description": "Quickselect discovers the $k$-th smallest element in an unordered array with average $O(N)$ time by recursively partitioning only the side containing target.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "algorithms",
      "selection",
      "quickselect",
      "median-of-medians"
    ],
    "resources": [
      {
        "label": "Wikipedia: Median of medians",
        "url": "https://en.wikipedia.org/wiki/Median_of_medians"
      }
    ]
  },
  {
    "id": "external-merge-sort-out-of-memory",
    "title": "External Merge Sort",
    "description": "External Merge Sort sorts massive datasets exceeding primary physical RAM by loading data into memory chunks, sorting them locally into initial runs.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "sorting",
      "external-sort",
      "databases",
      "io-complexity"
    ],
    "resources": [
      {
        "label": "Donald E. Knuth: The Art of Computer Programming (Volume 3: Sorting and Searching, Section 5.4)",
        "url": "https://www-cs-faculty.stanford.edu/~knuth/taocp.html"
      }
    ]
  },
  {
    "id": "radix-sort-and-counting-sort",
    "title": "Non-Comparison Sorting",
    "description": "Non-comparison sorting algorithms bypass the $\\Omega(N \\log N)$ information-theoretic lower bound by exploiting integer and fixed-radix properties.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "sorting",
      "non-comparison",
      "radix-sort",
      "counting-sort"
    ],
    "resources": [
      {
        "label": "Cormen, Leiserson, Rivest, Stein: Introduction to Algorithms (CLRS Chapter 8: Sorting in Linear Time)",
        "url": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"
      }
    ]
  },
  {
    "id": "timsort-hybrid-stable-sort",
    "title": "TimSort",
    "description": "TimSort combines insertion sort with merge sort to exploit pre-existing sorted subsequences (natural runs) in real-world data.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "sorting",
      "timsort",
      "hybrid",
      "algorithms"
    ],
    "resources": [
      {
        "label": "Auger, Jugé, Nicaud, Pivoteau: On the Worst-Case Complexity of TimSort (ESA 2015)",
        "url": "https://arxiv.org/abs/1805.08612"
      }
    ]
  },
  {
    "id": "introsort-quicksort-heapsort-hybrid",
    "title": "Introsort",
    "description": "Introsort provides average-case Quicksort performance while preventing $O(N^2)$ degradation by monitoring recursive partition depth.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "sorting",
      "introsort",
      "quicksort",
      "algorithms"
    ],
    "resources": [
      {
        "label": "LLVM libc++: std::sort Implementation Architecture",
        "url": "https://github.com/llvm/llvm-project/blob/main/libcxx/include/__algorithm/sort.h"
      }
    ]
  },
  {
    "id": "consistent-hashing-and-virtual-nodes",
    "title": "Consistent Hashing & Virtual Nodes",
    "description": "Consistent hashing maps keys and storage nodes to points on a cyclic hash ring.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "hashing",
      "consistent-hashing",
      "distributed",
      "caching"
    ],
    "resources": [
      {
        "label": "Wikipedia: Consistent hashing",
        "url": "https://en.wikipedia.org/wiki/Consistent_hashing"
      }
    ]
  },
  {
    "id": "perfect-hashing-fks-algorithm",
    "title": "Perfect Hashing",
    "description": "Perfect hashing constructs collision-free lookup tables for static key sets, guaranteeing strictly deterministic $O(1)$ worst-case search time in linear space.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "hashing",
      "perfect-hashing",
      "fks",
      "data-structures"
    ],
    "resources": [
      {
        "label": "Wikipedia: Dynamic perfect hashing",
        "url": "https://en.wikipedia.org/wiki/Dynamic_perfect_hashing"
      }
    ]
  },
  {
    "id": "robin-hood-and-cuckoo-hashing",
    "title": "Open Addressing Collision Strategies",
    "description": "Collision resolution techniques that minimize probe variances by stealing slots from rich items or using dual candidate locations.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "hashing",
      "robin-hood-hashing",
      "cuckoo-hashing",
      "open-addressing"
    ],
    "resources": [
      {
        "label": "Wikipedia: Open addressing",
        "url": "https://en.wikipedia.org/wiki/Open_addressing"
      }
    ]
  },
  {
    "id": "siphash-and-hashdos-defense",
    "title": "SipHash & Hash-Flooding DoS",
    "description": "Standard fast hash functions (MurmurHash, FNV) are vulnerable to algorithmic complexity attacks (HashDoS).",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "hashing",
      "siphash",
      "security",
      "hashdos"
    ],
    "resources": [
      {
        "label": "Wikipedia: SipHash",
        "url": "https://en.wikipedia.org/wiki/SipHash"
      }
    ]
  },
  {
    "id": "optimal-substructure-and-memoization",
    "title": "Dynamic Programming Foundations",
    "description": "Dynamic Programming solves complex optimization problems by decomposing them into overlapping subproblems whose optimal solutions combine to yield the global.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "dp",
      "dynamic-programming",
      "memoization",
      "tabulation"
    ],
    "resources": [
      {
        "label": "Wikipedia: Dynamic programming",
        "url": "https://en.wikipedia.org/wiki/Dynamic_programming"
      }
    ]
  },
  {
    "id": "longest-common-subsequence-diff-algorithms",
    "title": "Longest Common Subsequence (LCS)",
    "description": "The Longest Common Subsequence problem determines the longest ordered element sequence shared between sequences.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "dp",
      "lcs",
      "diff",
      "algorithms"
    ],
    "resources": [
      {
        "label": "Wikipedia: Longest common subsequence",
        "url": "https://en.wikipedia.org/wiki/Longest_common_subsequence"
      }
    ]
  },
  {
    "id": "knapsack-problem-and-pseudo-polynomial-time",
    "title": "0/1 Knapsack Problem",
    "description": "The 0/1 Knapsack problem selects an optimal value subset under a fixed weight capacity constraint, exhibiting NP-complete complexity in the general case.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "dp",
      "knapsack",
      "np-complete",
      "pseudo-polynomial"
    ],
    "resources": [
      {
        "label": "Wikipedia: Knapsack problem",
        "url": "https://en.wikipedia.org/wiki/Knapsack_problem"
      }
    ]
  },
  {
    "id": "matrix-chain-multiplication-dp",
    "title": "Matrix Chain Multiplication",
    "description": "Matrix Chain Multiplication determines the parenthesization order that minimizes total scalar multiplications across a sequence of matrices of varying dimensions.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "dp",
      "matrix-chain",
      "optimization",
      "algorithms"
    ],
    "resources": [
      {
        "label": "Cormen, Leiserson, Rivest, Stein: Introduction to Algorithms (CLRS Chapter 15: Dynamic Programming)",
        "url": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"
      }
    ]
  },
  {
    "id": "bitmask-dynamic-programming-tsp",
    "title": "Bitmask Dynamic Programming",
    "description": "Bitmask DP represents subset state configurations as integer binary bitmasks.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "dp",
      "bitmask",
      "traveling-salesman",
      "held-karp"
    ],
    "resources": [
      {
        "label": "CP-Algorithms: Dynamic Programming with Bitmasking & TSP",
        "url": "https://cp-algorithms.com/algebra/all-submasks.html"
      }
    ]
  },
  {
    "id": "convex-hull-trick-and-li-chao-tree",
    "title": "Convex Hull Trick & Li Chao Trees",
    "description": "The Convex Hull Trick optimizes DP transitions of the form $dp[i] = \\min_{j < i} (dp[j] + m_j x_i + c_j)$ from $O(N^2)$ to $O(N \\log N)$ by maintaining the lower.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "dp",
      "convex-hull-trick",
      "li-chao-tree",
      "optimization"
    ],
    "resources": [
      {
        "label": "CP-Algorithms: Convex Hull Trick & Li Chao Tree Dynamic Programming Optimization",
        "url": "https://cp-algorithms.com/geometry/convex_hull_trick.html"
      }
    ]
  },
  {
    "id": "tree-dynamic-programming-and-rerooting",
    "title": "Tree Dynamic Programming",
    "description": "Tree DP calculates subtree properties (tree diameter, independent sets) using bottom-up post-order DFS traversals in $O(N)$ time.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "dp",
      "tree-dp",
      "rerooting",
      "algorithms"
    ],
    "resources": [
      {
        "label": "USACO Guide: Tree DP and All-Root Aggregations",
        "url": "https://usaco.guide/gold/all-roots"
      }
    ]
  },
  {
    "id": "amortized-analysis-methods",
    "title": "Amortized Complexity Analysis",
    "description": "Amortized analysis bounds the average runtime of an operation sequence without probabilistic assumptions.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "complexity",
      "amortized-analysis",
      "potential-method",
      "algorithms"
    ],
    "resources": [
      {
        "label": "Wikipedia: Amortized analysis",
        "url": "https://en.wikipedia.org/wiki/Amortized_analysis"
      }
    ]
  },
  {
    "id": "p-vs-np-and-np-completeness-reductions",
    "title": "P vs. NP, Cook-Levin Theorem",
    "description": "Complexity class P contains decision problems solvable in deterministic polynomial time, while NP contains problems verifiable in polynomial time.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "complexity",
      "p-vs-np",
      "np-complete",
      "cook-levin"
    ],
    "resources": [
      {
        "label": "Wikipedia: P versus NP problem",
        "url": "https://en.wikipedia.org/wiki/P_versus_NP_problem"
      }
    ]
  },
  {
    "id": "competitive-analysis-online-algorithms",
    "title": "Online Algorithms",
    "description": "Online algorithms process incoming requests in real-time without future knowledge.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "complexity",
      "online-algorithms",
      "competitive-analysis",
      "paging"
    ],
    "resources": [
      {
        "label": "Wikipedia: Online algorithm",
        "url": "https://en.wikipedia.org/wiki/Online_algorithm"
      }
    ]
  },
  {
    "id": "master-theorem-for-divide-and-conquer",
    "title": "Master Theorem & Akra-Bazzi Method",
    "description": "Provides asymptotic time complexity bounds for divide-and-conquer recurrences by comparing subproblem splits against combination work.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "complexity",
      "master-theorem",
      "recurrences",
      "divide-and-conquer"
    ],
    "resources": [
      {
        "label": "Cormen, Leiserson, Rivest, Stein: Introduction to Algorithms (CLRS Chapter 4: Divide-and-Conquer)",
        "url": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"
      }
    ]
  },
  {
    "id": "approximation-algorithms-and-ptas",
    "title": "Approximation Algorithms",
    "description": "When NP-hard problems resist exact polynomial-time solutions, approximation algorithms guarantee solutions within a bounded factor $\\alpha$ of the optimal cost.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "complexity",
      "approximation",
      "ptas",
      "np-hard"
    ],
    "resources": [
      {
        "label": "David P. Williamson & David B. Shmoys: The Design of Approximation Algorithms (Cambridge University Press)",
        "url": "https://www.designofapproxalgs.com/"
      }
    ]
  },
  {
    "id": "space-time-tradeoffs-and-cell-probe-model",
    "title": "Space-Time Tradeoffs",
    "description": "The cell-probe model establishes fundamental data structure lower bounds by measuring only memory cell access count during query evaluation.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "complexity",
      "cell-probe",
      "lower-bounds",
      "information-theory"
    ],
    "resources": [
      {
        "label": "Wikipedia: Space–time tradeoff",
        "url": "https://en.wikipedia.org/wiki/Space%E2%80%93time_tradeoff"
      }
    ]
  },
  {
    "id": "disjoint-set-union-find-path-compression",
    "title": "Disjoint Set Union (DSU)",
    "description": "Disjoint Set Union manages partitions of an equivalence set across dynamic disjoint groups supporting near-constant time union and find operations.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "data-structures",
      "dsu",
      "union-find",
      "amortized"
    ],
    "resources": [
      {
        "label": "Wikipedia: Disjoint-set data structure",
        "url": "https://en.wikipedia.org/wiki/Disjoint-set_data_structure"
      }
    ]
  },
  {
    "id": "lock-free-queue-michael-scott",
    "title": "Lock-Free Queues",
    "description": "The Michael & Scott lock-free queue implements a concurrent FIFO queue using atomic Compare-And-Swap (CAS) primitives over a singly-linked list with a dummy head.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "concurrency",
      "lock-free",
      "queues",
      "cas"
    ],
    "resources": [
      {
        "label": "Wikipedia (Related): Non-blocking algorithm",
        "url": "https://en.wikipedia.org/wiki/Non-blocking_algorithm"
      }
    ]
  },
  {
    "id": "aba-problem-hazard-pointers-epoch-reclamation",
    "title": "Memory Reclamation in Lock-Free Structures",
    "description": "In lock-free algorithms, the ABA problem occurs when a memory pointer is freed and reallocated with identical address values.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "concurrency",
      "lock-free",
      "hazard-pointers",
      "memory-reclamation"
    ],
    "resources": [
      {
        "label": "Wikipedia: ABA problem",
        "url": "https://en.wikipedia.org/wiki/ABA_problem"
      }
    ]
  },
  {
    "id": "read-copy-update-rcu-synchronization",
    "title": "Read-Copy Update (RCU)",
    "description": "Read-Copy Update allows concurrent reader threads to traverse linked data structures with zero lock overhead, atomic memory barriers, or cache line bouncing.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "concurrency",
      "rcu",
      "synchronization",
      "operating-systems"
    ],
    "resources": [
      {
        "label": "Paul E. McKenney: Is Parallel Programming Hard, And, If So, What Can You Do About It? (Kernel.org Book)",
        "url": "https://mirrors.edge.kernel.org/pub/linux/kernel/people/paulmck/perfbook/perfbook.html"
      }
    ]
  },
  {
    "id": "concurrent-hash-tables-striped-locking-lock-free",
    "title": "Concurrent Hash Tables",
    "description": "Concurrent hash tables scale read/write throughput across multi-core processors by avoiding monolithic synchronization locks.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "concurrency",
      "hash-tables",
      "striped-locking",
      "concurrent-map"
    ],
    "resources": [
      {
        "label": "Wikipedia: Concurrent hash table",
        "url": "https://en.wikipedia.org/wiki/Concurrent_hash_table"
      }
    ]
  },
  {
    "id": "work-stealing-deque-chase-lev",
    "title": "Work-Stealing Deques",
    "description": "The Chase-Lev work-stealing deque enables work-stealing thread schedulers (used in Go runtime) to balance task loads across CPU cores.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "concurrency",
      "work-stealing",
      "deque",
      "schedulers"
    ],
    "resources": [
      {
        "label": "Wikipedia: Work stealing",
        "url": "https://en.wikipedia.org/wiki/Work_stealing"
      }
    ]
  },
  {
    "id": "spatial-indices-r-tree-and-kd-tree",
    "title": "Spatial Partitioning",
    "description": "$k$-d Trees partition $k$-dimensional points by alternating orthogonal splitting planes across coordinate dimensions.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "data-structures",
      "spatial",
      "r-tree",
      "kd-tree",
      "geometry"
    ],
    "resources": [
      {
        "label": "Wikipedia: R-tree",
        "url": "https://en.wikipedia.org/wiki/R-tree"
      }
    ]
  },
  {
    "id": "persistent-data-structures-fat-nodes-node-copying",
    "title": "Persistent Data Structures",
    "description": "Persistent data structures preserve historical versions across modifications.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "data-structures",
      "persistent-structures",
      "functional",
      "versioning"
    ],
    "resources": [
      {
        "label": "Wikipedia: Persistent data structure",
        "url": "https://en.wikipedia.org/wiki/Persistent_data_structure"
      }
    ]
  },
  {
    "id": "binary-heap-and-d-ary-heaps",
    "title": "Priority Queues",
    "description": "A Binary Heap represents a complete binary tree in a flat array where parent-child navigation uses arithmetic index operations (`2i + 1`, `2i + 2`).",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "data-structures",
      "heaps",
      "priority-queue",
      "cache-friendly"
    ],
    "resources": [
      {
        "label": "Donald E. Knuth: The Art of Computer Programming (Volume 3: Heaps & Priority Queues)",
        "url": "https://www-cs-faculty.stanford.edu/~knuth/taocp.html"
      }
    ]
  },
  {
    "id": "fibonacci-and-pairing-heaps",
    "title": "Mergeable Heaps",
    "description": "Fibonacci heaps delay tree consolidation until extraction operations, achieving optimal $O(1)$ amortized insertion, decrease-key.",
    "category": "data-structures-algorithms",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "data-structures",
      "heaps",
      "fibonacci-heap",
      "pairing-heap"
    ],
    "resources": [
      {
        "label": "Wikipedia: Fibonacci heap",
        "url": "https://en.wikipedia.org/wiki/Fibonacci_heap"
      }
    ]
  },
  {
    "id": "sequential-consistency-lamport",
    "title": "Sequential Consistency",
    "description": "Sequential consistency requires that the result of any execution is the same as if the operations of all processors were executed in some sequential order.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "memory-consistency",
      "distributed-systems",
      "concurrency",
      "theory"
    ],
    "resources": [
      {
        "label": "Leslie Lamport: How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs (IEEE TC 1979)",
        "url": "https://www.microsoft.com/en-us/research/publication/make-multiprocessor-computer-correctly-executes-multiprocess-programs/"
      },
      {
        "label": "Jepsen: Sequential Consistency Analysis & Model Definition",
        "url": "https://jepsen.io/consistency/models/sequential"
      }
    ]
  },
  {
    "id": "linearizability-and-atomic-registers",
    "title": "Linearizability",
    "description": "A strong consistency model guaranteeing that every read and write operation appears to take effect instantaneously at a distinct point.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "linearizability",
      "atomic-consistency",
      "distributed-systems",
      "formal-methods"
    ],
    "resources": [
      {
        "label": "Wikipedia: Linearizability",
        "url": "https://en.wikipedia.org/wiki/Linearizability"
      }
    ]
  },
  {
    "id": "eventual-consistency-and-session-guarantees",
    "title": "Eventual Consistency",
    "description": "Eventual consistency guarantees that all replicas will converge to identical state if no new updates are made.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "eventual-consistency",
      "session-guarantees",
      "distributed-storage",
      "replication"
    ],
    "resources": [
      {
        "label": "AWS DynamoDB: Read Consistency Architecture & Eventually Consistent Reads",
        "url": "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html"
      }
    ]
  },
  {
    "id": "causal-consistency-and-dependency-tracking",
    "title": "Causal Consistency",
    "description": "Causal consistency ensures that operations causally related by happened-before dependencies are observed in identical order across all nodes.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "causal-consistency",
      "dependency-tracking",
      "distributed-systems",
      "ordering"
    ],
    "resources": [
      {
        "label": "Jepsen: Causal Consistency Formal Specification",
        "url": "https://jepsen.io/consistency/models/causal"
      }
    ]
  },
  {
    "id": "hardware-memory-models-tso-vs-weak",
    "title": "Hardware Memory Models",
    "description": "Hardware architectures enforce differing memory models; x86 employs Total Store Order (TSO).",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "memory-models",
      "hardware-architecture",
      "concurrency",
      "x86",
      "arm"
    ],
    "resources": [
      {
        "label": "Wikipedia: Memory model (programming)",
        "url": "https://en.wikipedia.org/wiki/Memory_model_(programming)"
      }
    ]
  },
  {
    "id": "release-consistency-and-acquire-release-semantics",
    "title": "Release Consistency",
    "description": "Release consistency divides memory access into synchronized and ordinary operations.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "memory-models",
      "release-consistency",
      "synchronization",
      "atomics"
    ],
    "resources": [
      {
        "label": "Wikipedia: Release consistency",
        "url": "https://en.wikipedia.org/wiki/Release_consistency"
      }
    ]
  },
  {
    "id": "mesi-cache-coherence-protocol",
    "title": "MESI Protocol",
    "description": "The MESI protocol maintains cache consistency across multi-core processors using four states: Modified, Exclusive, Shared, and Invalid.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "cache-coherence",
      "mesi",
      "cpu-architecture",
      "hardware"
    ],
    "resources": [
      {
        "label": "Wikipedia: MESI protocol",
        "url": "https://en.wikipedia.org/wiki/MESI_protocol"
      }
    ]
  },
  {
    "id": "moesi-and-shared-dirty-states",
    "title": "MOESI Protocol",
    "description": "Extends cache coherence with an Owner state, letting dirty cache lines be shared among cores without writing back to main memory.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "cache-coherence",
      "moesi",
      "amd",
      "cpu-architecture"
    ],
    "resources": [
      {
        "label": "Wikipedia: MOESI protocol",
        "url": "https://en.wikipedia.org/wiki/MOESI_protocol"
      }
    ]
  },
  {
    "id": "directory-based-cache-coherence-numa",
    "title": "Directory-Based Coherence for Non-Uniform Memory Access (NUMA)",
    "description": "In large multi-socket NUMA systems where broadcast bus snooping cannot scale.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "cache-coherence",
      "numa",
      "directory-protocols",
      "interconnect"
    ],
    "resources": [
      {
        "label": "Wikipedia: Directory-based cache coherence",
        "url": "https://en.wikipedia.org/wiki/Directory-based_cache_coherence"
      }
    ]
  },
  {
    "id": "false-sharing-and-cache-line-ping-pong",
    "title": "False Sharing, Cache Line Bouncing",
    "description": "False sharing occurs when distinct threads on separate CPU cores concurrently modify independent variables that reside within the same 64-byte cache line.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "performance",
      "false-sharing",
      "cache-line",
      "multithreading"
    ],
    "resources": [
      {
        "label": "Intel 64 and IA-32 Architectures Optimization Reference Manual: Avoiding False Sharing",
        "url": "https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html"
      },
      {
        "label": "Martin Thompson: False Sharing in High Performance Multithreading Systems (Mechanical Sympathy)",
        "url": "https://mechanical-sympathy.blogspot.com/2011/07/false-sharing.html"
      },
      {
        "label": "Linux Kernel perf Documentation: c2c (Cache-to-Cache) Contention Analysis",
        "url": "https://man7.org/linux/man-pages/man1/perf-c2c.1.html"
      }
    ]
  },
  {
    "id": "store-buffers-and-invalidation-queues",
    "title": "Store Buffers, Invalidation Queues",
    "description": "Processors use store buffers to let execution continue immediately after write operations while cache line ownership is resolved over the bus.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "hardware",
      "store-buffers",
      "invalidation-queues",
      "memory-barriers"
    ],
    "resources": [
      {
        "label": "Intel: Combined Manuals for Intel 64 and IA-32 Architectures",
        "url": "https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html"
      }
    ]
  },
  {
    "id": "grpc-http2-framing-and-multiplexing",
    "title": "gRPC HTTP/2 Transport",
    "description": "GRPC leverages HTTP/2 binary framing to multiplex multiple concurrent bidirectional RPC calls over a single long-lived TCP connection using distinct Stream IDs.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "grpc",
      "http2",
      "multiplexing",
      "rpc-internals",
      "networking"
    ],
    "resources": [
      {
        "label": "RFC 7540: Hypertext Transfer Protocol Version 2 (HTTP/2 Framing & Flow Control)",
        "url": "https://datatracker.ietf.org/doc/html/rfc7540"
      },
      {
        "label": "gRPC Official Documentation: gRPC over HTTP/2 Protocol Specification",
        "url": "https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md"
      },
      {
        "label": "Google Cloud Architecture: HTTP/2 Flow Control and Multiplexing in gRPC",
        "url": "https://cloud.google.com/blog/products/api-management/understanding-grpc-http-2-flow-control"
      }
    ]
  },
  {
    "id": "protobuf-wire-format-encoding",
    "title": "Protocol Buffers Wire Format",
    "description": "Protocol Buffers achieves compact binary serialization by encoding fields as key-value pairs where the key packs the field number and wire type using LEB128 varints.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "protobuf",
      "serialization",
      "encoding",
      "wire-format",
      "performance"
    ],
    "resources": [
      {
        "label": "Protocol Buffers Official Documentation: Protocol Buffer Wire Format Encoding",
        "url": "https://protobuf.dev/programming-guides/encoding/"
      },
      {
        "label": "Martin Kleppmann: Data Encoding Formats Comparison (Designing Data-Intensive Applications)",
        "url": "https://dataintensive.net/"
      }
    ]
  },
  {
    "id": "apache-thrift-binary-vs-compact-protocol",
    "title": "Apache Thrift Internals",
    "description": "Apache Thrift decouples interface definition from serialization protocol and transport mechanism.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "thrift",
      "serialization",
      "rpc",
      "cross-language",
      "protocols"
    ],
    "resources": [
      {
        "label": "Apache Thrift Official Documentation: Thrift Protocol Stack Specification",
        "url": "https://thrift.apache.org/docs/concepts"
      },
      {
        "label": "Apache Thrift GitHub: Compact Protocol Binary Format Specification",
        "url": "https://github.com/apache/thrift/blob/master/doc/specs/thrift-compact-protocol.md"
      }
    ]
  },
  {
    "id": "service-discovery-client-vs-server-side",
    "title": "Service Discovery Patterns",
    "description": "Client-side service discovery queries a registry (Consul, Eureka, ZooKeeper) directly and performs local load balancing over resolved endpoints.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "service-discovery",
      "load-balancing",
      "networking",
      "microservices"
    ],
    "resources": [
      {
        "label": "Chris Richardson: Microservices Pattern: Client-Side vs Server-Side Service Discovery",
        "url": "https://microservices.io/patterns/client-side-discovery.html"
      },
      {
        "label": "Kubernetes Official Documentation: DNS for Services and Pods",
        "url": "https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/"
      }
    ]
  },
  {
    "id": "envoy-xds-dynamic-control-plane",
    "title": "Envoy Dynamic Control Plane",
    "description": "Envoy's xDS protocol provides a dynamic configuration API that updates proxy routes without process restarts or traffic interruption.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "envoy",
      "xds",
      "service-mesh",
      "control-plane",
      "dynamic-routing"
    ],
    "resources": [
      {
        "label": "Envoy Proxy Official Documentation: xDS REST and gRPC Protocol Guide",
        "url": "https://www.envoyproxy.io/docs/envoy/latest/api-docs/xds_protocol"
      },
      {
        "label": "CNCF Istio Architecture: Pilot to Envoy xDS Communication Flow",
        "url": "https://istio.io/latest/docs/ops/deployment/architecture/"
      }
    ]
  },
  {
    "id": "zero-copy-rpc-and-kernel-bypass",
    "title": "High-Throughput RPC",
    "description": "High-performance RPC engines eliminate CPU memory copy overhead between kernel network buffers and user-space memory using zero-copy primitives like Linux.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "zero-copy",
      "io-uring",
      "ebpf",
      "kernel-bypass"
    ],
    "resources": [
      {
        "label": "Anuj Kalia et al.: FaSST: Fast, Scalable and Simple Distributed Transactions with Two-Sided RDMA Datagrams (OSDI 2016)",
        "url": "https://www.usenix.org/conference/osdi16/technical-sessions/presentation/kalia"
      },
      {
        "label": "Linux Kernel Documentation: MSG_ZEROCOPY Network Interface",
        "url": "https://www.kernel.org/doc/html/latest/networking/msg_zerocopy.html"
      }
    ]
  },
  {
    "id": "single-leader-replication-and-lag",
    "title": "Single-Leader Replication",
    "description": "In single-leader replication, all mutating queries execute on a designated leader.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "replication",
      "single-leader",
      "replication-lag",
      "databases"
    ],
    "resources": [
      {
        "label": "PostgreSQL Official Documentation: Streaming Replication Internals & WAL Sender",
        "url": "https://www.postgresql.org/docs/current/warm-standby.html#STREAMING-REPLICATION"
      },
      {
        "label": "Martin Kleppmann: Problems with Replication Lag (Designing Data-Intensive Applications)",
        "url": "https://dataintensive.net/"
      }
    ]
  },
  {
    "id": "read-after-write-consistency-strategies",
    "title": "Read-After-Write Consistency in Asynchronous Replicas",
    "description": "Read-after-write (read-your-writes) consistency guarantees that a user will immediately observe their own submitted mutations when querying the system.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "consistency",
      "read-after-write",
      "replication-lag",
      "caching"
    ],
    "resources": [
      {
        "label": "CockroachDB Docs: Follower Reads and Bounded Staleness Constraints",
        "url": "https://www.cockroachlabs.com/docs/stable/follower-reads"
      }
    ]
  },
  {
    "id": "multi-leader-replication-and-conflict-resolution",
    "title": "Multi-Leader Replication",
    "description": "Multi-leader replication allows writes across multiple distributed datacenters, reducing client write latency and tolerating full datacenter outages.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "replication",
      "multi-leader",
      "conflict-resolution",
      "multi-region"
    ],
    "resources": [
      {
        "label": "Martin Kleppmann: Multi-Leader Replication Topology and Conflict Handling",
        "url": "https://dataintensive.net/"
      },
      {
        "label": "Amazon Aurora Multi-Master Architecture & Conflict Detection Documentation",
        "url": "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-multi-master.html"
      },
      {
        "label": "Sanjay Ghemawat et al.: Spanner: Google's Globally-Distributed Database (Section 4: Multi-Region Replication)",
        "url": "https://research.google/pubs/pub39966/"
      }
    ]
  },
  {
    "id": "dynamo-style-quorum-systems",
    "title": "Leaderless Replication",
    "description": "Leaderless distributed storage where configurable read and write quorums (R + W > N) guarantee strong consistency across node failures.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "dynamo",
      "quorum",
      "leaderless",
      "replication",
      "cassandra"
    ],
    "resources": [
      {
        "label": "Apache Cassandra Documentation: How Cassandra Reads and Writes with Quorum Consistency",
        "url": "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html"
      }
    ]
  },
  {
    "id": "sloppy-quorums-and-hinted-handoff",
    "title": "Sloppy Quorums & Hinted Handoff",
    "description": "During network partitions or node failures where a strict quorum cannot be reached among designated home replicas.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "sloppy-quorum",
      "hinted-handoff",
      "high-availability",
      "fault-tolerance"
    ],
    "resources": [
      {
        "label": "Wikipedia (Related): Dynamo (storage system)",
        "url": "https://en.wikipedia.org/wiki/Dynamo_(storage_system)"
      }
    ]
  },
  {
    "id": "read-repair-vs-anti-entropy-merkle-trees",
    "title": "Anti-Entropy Systems",
    "description": "Leaderless datastores maintain long-term replica convergence through two complementary mechanisms: opportunistic read repair and active background anti-entropy.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "read-repair",
      "anti-entropy",
      "merkle-trees",
      "data-synchronization"
    ],
    "resources": [
      {
        "label": "Wikipedia (Related): Merkle tree",
        "url": "https://en.wikipedia.org/wiki/Merkle_tree"
      }
    ]
  },
  {
    "id": "consistent-hashing-virtual-nodes",
    "title": "Consistent Hashing with Virtual Nodes (Vnodes)",
    "description": "Consistent hashing maps both partition keys and storage nodes onto a circular 128-bit hash ring.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "consistent-hashing",
      "sharding",
      "virtual-nodes",
      "load-balancing"
    ],
    "resources": [
      {
        "label": "Apache Cassandra Documentation: Virtual Nodes Architecture and Allocation",
        "url": "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html#virtual-nodes"
      },
      {
        "label": "Discord Engineering Blog: How Discord Scaled Elixir to 5,000,000 Concurrent Users with Consistent Hashing",
        "url": "https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users"
      }
    ]
  },
  {
    "id": "range-partitioning-vs-hash-partitioning",
    "title": "Range-Based vs Hash-Based Data Partitioning Strategies",
    "description": "Range partitioning divides sorted data into contiguous key ranges (tablets/splits).",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "partitioning",
      "sharding",
      "range-partitioning",
      "hash-partitioning",
      "databases"
    ],
    "resources": [
      {
        "label": "Fay Chang et al.: Bigtable: A Distributed Storage System for Structured Data (OSDI 2006)",
        "url": "https://research.google/pubs/pub27898/"
      },
      {
        "label": "Martin Kleppmann: Partitioning by Key Range vs Partitioning by Hash of Key (DDIA)",
        "url": "https://dataintensive.net/"
      }
    ]
  },
  {
    "id": "zero-downtime-online-resharding",
    "title": "Online Resharding",
    "description": "Online resharding splits or migrates live partitions while serving continuous read/write traffic.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "resharding",
      "online-migration",
      "database-sharding",
      "high-availability"
    ],
    "resources": [
      {
        "label": "Stripe Engineering: Online Migrations at Scale: Dual Writing and Verification",
        "url": "https://stripe.com/blog/online-migrations"
      }
    ]
  },
  {
    "id": "scatter-gather-query-routing",
    "title": "Scatter-Gather Query Execution",
    "description": "Queries that do not include the shard routing key must be scattered to every individual partition in the cluster, gathered by a coordinator node.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "scatter-gather",
      "distributed-queries",
      "tail-latency",
      "sharding"
    ],
    "resources": [
      {
        "label": "CockroachDB: Distributed SQL Execution Engine & Vectorized Flow Routing",
        "url": "https://www.cockroachlabs.com/docs/stable/architecture/sql-layer.html"
      }
    ]
  },
  {
    "id": "secondary-indexes-document-vs-term-partitioned",
    "title": "Distributed Secondary Indexes",
    "description": "Document-partitioned (local) secondary indexes store index entries strictly within the partition holding the primary record.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "secondary-indexes",
      "indexing",
      "sharding",
      "distributed-databases"
    ],
    "resources": [
      {
        "label": "Martin Kleppmann: Secondary Indexes and Partitioning (Designing Data-Intensive Applications)",
        "url": "https://dataintensive.net/"
      },
      {
        "label": "AWS DynamoDB Developer Guide: Global Secondary Indexes vs Local Secondary Indexes",
        "url": "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html"
      }
    ]
  },
  {
    "id": "database-sharding-middleware-vitess-citus",
    "title": "Relational Sharding Middleware",
    "description": "Sharding middleware transparently transforms monolithic relational databases (MySQL/PostgreSQL) into distributed clusters.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "sharding",
      "vitess",
      "citus",
      "distributed-sql",
      "middleware"
    ],
    "resources": [
      {
        "label": "Vitess Official Architecture & Component Model (VTGate, VTTablet, VTCtl)",
        "url": "https://vitess.io/docs/overview/architecture/"
      }
    ]
  },
  {
    "id": "message-delivery-semantics-at-least-vs-exactly-once",
    "title": "Message Delivery Semantics",
    "description": "At-most-once delivery drops messages on network failure, while at-least-once retries delivery until acknowledged, risking duplicate processing on consumer crashes.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "message-queues",
      "delivery-semantics",
      "idempotency",
      "kafka"
    ],
    "resources": [
      {
        "label": "Neha Narkhede et al.: Exactly-once Semantics in Apache Kafka (Confluent Technical Whitepaper)",
        "url": "https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/"
      },
      {
        "label": "RabbitMQ Documentation: Consumer Acknowledgements and Publisher Confirms",
        "url": "https://www.rabbitmq.com/docs/confirms"
      }
    ]
  },
  {
    "id": "kafka-log-storage-and-offset-internals",
    "title": "Kafka Commit Log Internals",
    "description": "Kafka structures each partition as an append-only sequence of immutable segment files paired with memory-mapped `.index` and `.timeindex` files for O(1).",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "kafka",
      "storage-internals",
      "pagecache",
      "zero-copy",
      "commit-log"
    ],
    "resources": [
      {
        "label": "Apache Kafka Documentation: Design Principles & The Commit Log Architecture",
        "url": "https://kafka.apache.org/documentation/#design"
      },
      {
        "label": "Linux Kernel man-pages: sendfile(2) Transfer Between File Descriptors",
        "url": "https://man7.org/linux/man-pages/man2/sendfile.2.html"
      }
    ]
  },
  {
    "id": "kafka-log-compaction-mechanisms",
    "title": "Kafka Log Compaction",
    "description": "Log compaction ensures Kafka retains at least the latest value for every message key within a partition.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "kafka",
      "log-compaction",
      "event-sourcing",
      "state-management"
    ],
    "resources": [
      {
        "label": "Apache Kafka Documentation: Log Compaction Architecture & Cleaner Threads",
        "url": "https://kafka.apache.org/documentation/#compaction"
      },
      {
        "label": "Confluent Documentation: Stateful Stream Processing and Log Compaction in Kafka",
        "url": "https://docs.confluent.io/platform/current/kafka/design/log-compaction.html"
      }
    ]
  },
  {
    "id": "backpressure-and-reactive-stream-protocols",
    "title": "Backpressure Handling",
    "description": "Backpressure prevents fast upstream producers from overwhelming slower downstream consumers by propagating resource constraints backward through the pipeline.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "backpressure",
      "reactive-streams",
      "flow-control",
      "streaming"
    ],
    "resources": [
      {
        "label": "Reactive Streams Specification for the JVM (GitHub Working Group)",
        "url": "https://github.com/reactive-streams/reactive-streams-jvm"
      }
    ]
  },
  {
    "id": "kafka-consumer-rebalancing-protocols",
    "title": "Kafka Consumer Group Rebalancing",
    "description": "Consumer groups balance partition assignments across instances through coordinator heartbeats and JoinGroup/SyncGroup sync phases.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "kafka",
      "consumer-groups",
      "rebalance",
      "cooperative-sticky"
    ],
    "resources": [
      {
        "label": "Confluent Engineering Blog: Incremental Cooperative Rebalancing in Apache Kafka",
        "url": "https://www.confluent.io/blog/incremental-cooperative-rebalancing-in-kafka/"
      },
      {
        "label": "Apache Kafka Documentation: Consumer Group Coordination Internals",
        "url": "https://kafka.apache.org/documentation/#impl_consumergroup"
      }
    ]
  },
  {
    "id": "dead-letter-queues-and-poison-pill-handling",
    "title": "Poison Pill Handling",
    "description": "A poison pill is a corrupted or unprocessable message that repeatedly crashes consumer logic, blocking head-of-line progress across an entire queue.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "dlq",
      "poison-pill",
      "fault-tolerance",
      "retry-topics",
      "messaging"
    ],
    "resources": [
      {
        "label": "Uber Engineering: Building Reliable Reprocessing and Dead Letter Queues with Apache Kafka",
        "url": "https://www.uber.com/blog/reliable-reprocessing/"
      },
      {
        "label": "AWS SQS Developer Guide: Dead-Letter Queues and Redrive Policies",
        "url": "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html"
      },
      {
        "label": "Martin Fowler: Dead Letter Channel Pattern in Enterprise Integration",
        "url": "https://www.enterpriseintegrationpatterns.com/patterns/messaging/DeadLetterChannel.html"
      }
    ]
  },
  {
    "id": "ntp-clock-skew-and-drift-anomalies",
    "title": "NTP Clock Synchronization",
    "description": "Network Time Protocol (NTP) synchronizes computer clocks over packet-switched networks by estimating round-trip latency and clock offset.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "ntp",
      "clock-skew",
      "time-synchronization",
      "distributed-clocks"
    ],
    "resources": [
      {
        "label": "RFC 5905: Network Time Protocol Version 4: Protocol and Algorithms Specification",
        "url": "https://datatracker.ietf.org/doc/html/rfc5905"
      },
      {
        "label": "David L. Mills: Computer Network Time Synchronization: The Network Time Protocol on Earth and in Space (CRC Press)",
        "url": "https://www.eecis.udel.edu/~mills/book.html"
      },
      {
        "label": "Martin Kleppmann: Unreliable Clocks in Distributed Systems (Designing Data-Intensive Applications)",
        "url": "https://dataintensive.net/"
      }
    ]
  },
  {
    "id": "lamport-logical-clocks-and-total-ordering",
    "title": "Lamport Logical Timestamps",
    "description": "Lamport logical clocks define a partial order of distributed events using the 'happened-before' relation (a -> b) without relying on physical time.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "lamport-clocks",
      "logical-time",
      "happened-before",
      "ordering"
    ],
    "resources": [
      {
        "label": "Martin Fowler: Lamport Clock Pattern in Distributed Systems",
        "url": "https://martinfowler.com/articles/patterns-of-distributed-systems/lamport-clock.html"
      }
    ]
  },
  {
    "id": "google-truetime-and-spanner-commit-wait",
    "title": "Google TrueTime & Cloud Spanner",
    "description": "Uses atomic clocks and GPS to provide bounded time uncertainty, using commit-wait intervals to enforce global serializability.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "truetime",
      "spanner",
      "commit-wait",
      "external-consistency",
      "google"
    ],
    "resources": [
      {
        "label": "James C. Corbett et al.: Spanner: Google's Globally-Distributed Database (OSDI 2012)",
        "url": "https://research.google/pubs/pub39966/"
      },
      {
        "label": "Google Cloud Whitepaper: Spanner, TrueTime and External Consistency",
        "url": "https://cloud.google.com/spanner/docs/true-time-external-consistency"
      }
    ]
  },
  {
    "id": "hybrid-logical-clocks-cockroachdb",
    "title": "Hybrid Logical Clocks (HLC)",
    "description": "Hybrid Logical Clocks (HLC) merge physical timestamps with Lamport logical counters into a single 64-bit coordinate that tracks causal dependencies while staying.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "hlc",
      "hybrid-logical-clocks",
      "cockroachdb",
      "causality",
      "time"
    ],
    "resources": [
      {
        "label": "Wikipedia (Related): CockroachDB",
        "url": "https://en.wikipedia.org/wiki/CockroachDB"
      }
    ]
  },
  {
    "id": "vector-clock-concurrency-tradeoffs",
    "title": "Practical Concurrency Tracking",
    "description": "While scalar Lamport clocks detect ordering, vector clocks and version vectors distinguish between causal precedence and true concurrent modifications .",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "vector-clocks",
      "concurrency-detection",
      "distributed-storage",
      "dynamo"
    ],
    "resources": [
      {
        "label": "Nuno Preguiça et al.: Dotted Version Vectors: Logical Clocks for Optimistic Replication (SOCC 2014)",
        "url": "https://arxiv.org/abs/1011.5808"
      }
    ]
  },
  {
    "id": "circuit-breaker-state-machine",
    "title": "Circuit Breaker Pattern",
    "description": "The Circuit Breaker pattern prevents cascading service failure by intercepting outbound RPC calls with an active finite state machine.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "resilience",
      "circuit-breaker",
      "fault-tolerance",
      "microservices"
    ],
    "resources": [
      {
        "label": "Michael Nygard: Release It! Design and Deploy Production-Ready Software (Circuit Breaker Chapter)",
        "url": "https://pragprog.com/titles/mnee2/release-it-second-edition/"
      }
    ]
  },
  {
    "id": "bulkhead-pattern-resource-isolation",
    "title": "Bulkhead Pattern",
    "description": "Inspired by naval watertight hull compartments, the Bulkhead pattern partitions internal resources (thread pools) into isolated pools per dependency.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "bulkhead",
      "resource-isolation",
      "fault-isolation",
      "thread-pools"
    ],
    "resources": [
      {
        "label": "Microsoft Azure Architecture Center: Bulkhead Pattern",
        "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead"
      },
      {
        "label": "Michael Nygard: Release It! (Bulkheads for Failure Containment)",
        "url": "https://pragprog.com/titles/mnee2/release-it-second-edition/"
      }
    ]
  },
  {
    "id": "exponential-backoff-and-decorrelated-jitter",
    "title": "Retry Strategies",
    "description": "Blind client retries after a partial outage create a thundering herd problem that repeatedly knocks recovering backends offline.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "retries",
      "jitter",
      "exponential-backoff",
      "thundering-herd",
      "networking"
    ],
    "resources": [
      {
        "label": "Marc Brooker (AWS Architecture Blog): Exponential Backoff And Jitter",
        "url": "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/"
      },
      {
        "label": "Google Cloud Architecture: Truncated Exponential Backoff Algorithm Guide",
        "url": "https://cloud.google.com/storage/docs/retry-strategy"
      },
      {
        "label": "Microsoft Architecture: Retry Pattern and Transient Fault Handling",
        "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/retry"
      }
    ]
  },
  {
    "id": "distributed-timeout-budgets-and-deadline-propagation",
    "title": "Distributed Deadline Propagation",
    "description": "When an incoming request spans a deep microservice call tree, static per-hop timeouts cause wasted CPU processing on downstream nodes when the upstream caller.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "timeouts",
      "deadline-propagation",
      "grpc",
      "distributed-tracing"
    ],
    "resources": [
      {
        "label": "gRPC Documentation: Deadlines and Cancellation Propagation Across RPC Trees",
        "url": "https://grpc.io/docs/guides/deadlines/"
      },
      {
        "label": "Google Site Reliability Engineering (SRE) Book: Chapter 22 - Addressing Cascading Failures with Deadlines",
        "url": "https://sre.google/sre-book/addressing-cascading-failures/#deadlines"
      }
    ]
  },
  {
    "id": "load-shedding-and-adaptive-concurrency-limits",
    "title": "Load Shedding",
    "description": "When server queues grow past peak throughput capacity, response times spike while throughput collapses due to context switching and lock contention.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "load-shedding",
      "concurrency-limits",
      "littles-law",
      "capacity-planning"
    ],
    "resources": [
      {
        "label": "AWS Builder's Library: Using Load Shedding to Avoid Overload",
        "url": "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/"
      }
    ]
  },
  {
    "id": "distributed-rate-limiting-token-bucket-vs-sliding-window",
    "title": "Rate Limiting: Token Bucket vs Window",
    "description": "Distributed rate limiting enforces quota governance across horizontal API gateways without central single-point bottlenecks.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "rate-limiting",
      "token-bucket",
      "sliding-window",
      "redis-lua"
    ],
    "resources": [
      {
        "label": "Stripe Engineering Blog: Scaling Your API with Rate Limiters (Token Bucket & Leaky Bucket)",
        "url": "https://stripe.com/blog/rate-limiters"
      },
      {
        "label": "Cloudflare Engineering: How We Built Rate Limiting Capable of Handling Billions of Requests",
        "url": "https://blog.cloudflare.com/counting-things-a-lot-of-different-things/"
      },
      {
        "label": "Figma Engineering: An Alternative Approach to Rate Limiting Using Redis",
        "url": "https://www.figma.com/blog/an-alternative-approach-to-rate-limiting/"
      }
    ]
  },
  {
    "id": "pacelc-theorem-in-practice",
    "title": "PACELC Theorem",
    "description": "Daniel Abadi's PACELC theorem expands the CAP theorem by stating that IF there is a Partition (P).",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "pacelc",
      "cap-theorem",
      "distributed-tradeoffs",
      "system-architecture"
    ],
    "resources": [
      {
        "label": "Wikipedia: PACELC design principle",
        "url": "https://en.wikipedia.org/wiki/PACELC_theorem"
      }
    ]
  },
  {
    "id": "strict-vs-partial-quorums-tradeoffs",
    "title": "Strict Quorums (R + W > N) vs Probabilistically Bounded Staleness (PBS)",
    "description": "Balances strict quorum consistency against lower tail latencies and higher availability under partial quorums.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "quorums",
      "pbs",
      "probabilistic-consistency",
      "tail-latency"
    ],
    "resources": [
      {
        "label": "Werner Vogels: Trade-offs in Distributed Systems Quorums (All Things Distributed)",
        "url": "https://www.allthingsdistributed.com/2007/12/eventually_consistent.html"
      }
    ]
  },
  {
    "id": "split-brain-prevention-fencing-tokens",
    "title": "Split-Brain Mitigation",
    "description": "When a network partition isolates a primary node, false failovers can promote a secondary leader while the original leader remains unaware.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "split-brain",
      "fencing-tokens",
      "distributed-locks",
      "consensus"
    ],
    "resources": [
      {
        "label": "Martin Kleppmann: How to do Distributed Locking (Why Fencing Tokens Are Mandatory)",
        "url": "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html"
      },
      {
        "label": "Mike Burrows: The Chubby Lock Service for Loosely-Coupled Distributed Systems (OSDI 2006)",
        "url": "https://research.google/pubs/pub27897/"
      }
    ]
  },
  {
    "id": "distributed-locking-redlock-vs-consensus",
    "title": "Distributed Locks",
    "description": "Redis Redlock attempts distributed mutual exclusion across N independent Redis nodes without a shared consensus protocol.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "distributed-locking",
      "redlock",
      "consensus",
      "etcd",
      "redis"
    ],
    "resources": [
      {
        "label": "Martin Kleppmann: Is Redlock Safe? Analysis of Asynchronous Clocks and Failures",
        "url": "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html"
      },
      {
        "label": "etcd Official Documentation: Distributed Locking API and Lease TTL Mechanisms",
        "url": "https://etcd.io/docs/v3.5/learning/api_guarantees/#lock-apis"
      }
    ]
  },
  {
    "id": "cap-theorem-harvest-yield-tradeoffs",
    "title": "Graceful Degradation",
    "description": "Fox and Brewer's Harvest and Yield model reframes distributed availability into two quantifiable metrics: Yield and Harvest .",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "cap-theorem",
      "harvest-and-yield",
      "availability",
      "graceful-degradation"
    ],
    "resources": [
      {
        "label": "Eric Brewer: CAP Twelve Years Later: How the 'Rules' Have Changed (IEEE Computer 2012)",
        "url": "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/"
      },
      {
        "label": "Google SRE Book: Graceful Degradation and Result Shedding in Search Systems",
        "url": "https://sre.google/sre-book/handling-overload/"
      }
    ]
  },
  {
    "id": "saga-pattern-orchestration-vs-choreography",
    "title": "Saga Pattern",
    "description": "The Saga pattern coordinates long-running distributed transactions as a series of distinct local transactions across microservices.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "sagas",
      "distributed-transactions",
      "orchestration",
      "choreography",
      "microservices"
    ],
    "resources": [
      {
        "label": "Chris Richardson: Pattern: Saga (Microservices Architecture Patterns)",
        "url": "https://microservices.io/patterns/data/saga.html"
      },
      {
        "label": "Temporal.io Documentation: Distributed Saga Implementation and Workflow Durability",
        "url": "https://docs.temporal.io/workflows#saga-pattern"
      }
    ]
  },
  {
    "id": "transactional-outbox-and-cdc",
    "title": "Transactional Outbox Pattern",
    "description": "Mutating a database and publishing to a message broker in separate application calls introduces fatal dual-write inconsistencies if either step crashes mid-flight.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "outbox-pattern",
      "cdc",
      "debezium",
      "dual-write",
      "event-driven"
    ],
    "resources": [
      {
        "label": "Chris Richardson: Pattern: Transactional Outbox (Microservices.io)",
        "url": "https://microservices.io/patterns/data/transactional-outbox.html"
      },
      {
        "label": "Debezium Official Documentation: Architecture & Transaction Log Mining Engine",
        "url": "https://debezium.io/documentation/reference/stable/architecture.html"
      }
    ]
  },
  {
    "id": "idempotency-keys-in-financial-systems",
    "title": "Idempotency Keys",
    "description": "In financial systems where network timeouts leave API call outcomes ambiguous, clients attach a unique Idempotency-Key header to mutating requests.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "idempotency",
      "payments",
      "api-design",
      "distributed-systems"
    ],
    "resources": [
      {
        "label": "Stripe Engineering Blog: Designing Robust and Idempotent APIs with Idempotency Keys",
        "url": "https://stripe.com/blog/idempotency"
      },
      {
        "label": "IETF Draft: The Idempotency-Key HTTP Header Field Specification",
        "url": "https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header-02"
      },
      {
        "label": "Brandur Leach: Implementing Stripe-like Idempotency in Distributed Services",
        "url": "https://brandur.org/idempotency-keys"
      }
    ]
  },
  {
    "id": "dual-write-problem-and-reconciliation-loops",
    "title": "The Dual-Write Hazard",
    "description": "Attempting to update two independent distributed systems without distributed transactions inevitably causes silent drift when one operation fails.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "dual-write",
      "reconciliation",
      "data-consistency",
      "event-driven"
    ],
    "resources": [
      {
        "label": "Martin Kleppmann: Please Stop Approving Pull Requests with Dual Writes",
        "url": "https://martin.kleppmann.com/2015/04/23/bottled-water-real-time-postgresql-kafka.html"
      }
    ]
  },
  {
    "id": "two-phase-commit-limitations-and-blocking",
    "title": "Two-Phase Commit (2PC)",
    "description": "Two-Phase Commit (2PC) achieves atomic multi-node transactions through a Prepare phase and a Commit phase.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "2pc",
      "distributed-transactions",
      "acid",
      "consensus",
      "blocking"
    ],
    "resources": [
      {
        "label": "Martin Kleppmann: The Trouble with Distributed Transactions and Two-Phase Commit",
        "url": "https://dataintensive.net/"
      }
    ]
  },
  {
    "id": "listen-to-yourself-pattern-event-driven",
    "title": "Listen-to-Yourself Pattern",
    "description": "In the Listen-to-Yourself pattern, a service handling a write command does not update its local database directly.",
    "category": "systems-distributed-computing",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "event-sourcing",
      "listen-to-yourself",
      "cqrs",
      "messaging"
    ],
    "resources": [
      {
        "label": "Martin Fowler: Event Sourcing & CQRS Architectural Patterns",
        "url": "https://martinfowler.com/eaaDev/EventSourcing.html"
      }
    ]
  },
  {
    "id": "react-server-components-protocol",
    "title": "React Server Components (RSC)",
    "description": "RSCs execute strictly on the server during build or request time, outputting a serialized JSON-like stream (the Flight protocol) containing UI tree references.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "rendering",
      "rsc",
      "react",
      "streaming"
    ],
    "resources": [
      {
        "label": "React RFC: React Server Components Specification",
        "url": "https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md"
      },
      {
        "label": "Next.js Documentation: Server Components Architecture",
        "url": "https://nextjs.org/docs/app/building-your-application/rendering/server-components"
      },
      {
        "label": "Dan Abramov & Joe Savona: RSC from Scratch Exploration",
        "url": "https://github.com/reactwg/server-components/discussions/5"
      }
    ]
  },
  {
    "id": "streaming-ssr-and-selective-hydration",
    "title": "Streaming SSR",
    "description": "Streaming Server-Side Rendering uses HTML chunking via HTTP/1.1 chunked transfer encoding or HTTP/2 streams to flush static page shells early.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "rendering",
      "ssr",
      "hydration",
      "react"
    ],
    "resources": [
      {
        "label": "React Working Group: New Suspense SSR Architecture in React 18",
        "url": "https://github.com/reactwg/react-18/discussions/37"
      },
      {
        "label": "MDN Web Docs: Streaming HTML with ReadableStream & Fetch",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams"
      }
    ]
  },
  {
    "id": "incremental-static-regeneration-isr",
    "title": "Incremental Static Regeneration (ISR)",
    "description": "ISR allows static pages to be regenerated in the background on a per-page basis without rebuilding the entire website.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "rendering",
      "isr",
      "ssg",
      "nextjs"
    ],
    "resources": [
      {
        "label": "Next.js Documentation: Incremental Static Regeneration (ISR)",
        "url": "https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration"
      },
      {
        "label": "RFC 5861: HTTP Cache-Control Extensions for Stale Content",
        "url": "https://datatracker.ietf.org/doc/html/rfc5861"
      }
    ]
  },
  {
    "id": "islands-architecture-and-partial-hydration",
    "title": "Islands Architecture",
    "description": "Islands Architecture renders pages as pure static HTML by default, embedding small, isolated dynamic component 'islands' .",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "rendering",
      "islands",
      "astro",
      "performance"
    ],
    "resources": [
      {
        "label": "Jason Miller: Islands Architecture Concept (Architecture Blog)",
        "url": "https://jasonformat.com/islands-architecture/"
      }
    ]
  },
  {
    "id": "resumability-vs-hydration-qwik",
    "title": "Resumability vs. Hydration",
    "description": "Hydration requires the client browser to download, parse, and execute all component code to rebuild event listener bindings and virtual DOM state.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "rendering",
      "qwik",
      "resumability",
      "performance"
    ],
    "resources": [
      {
        "label": "Builder.io: Hydration is Pure Overhead (Miško Hevery)",
        "url": "https://www.builder.io/blog/hydration-is-pure-overhead"
      }
    ]
  },
  {
    "id": "browser-event-loop-microtasks-macrotasks",
    "title": "JavaScript Event Loop",
    "description": "The browser execution loop processes one macrotask (timer callbacks, I/O events) per iteration.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "javascript",
      "browser-internals",
      "event-loop",
      "async"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: Using microtasks and the JavaScript runtime environment",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide"
      }
    ]
  },
  {
    "id": "v8-engine-ignition-sparkplug-turbofan",
    "title": "V8 Engine Execution Pipeline",
    "description": "V8 compiles JavaScript into bytecode via the Ignition interpreter for instant startup.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "v8",
      "javascript",
      "compilers",
      "jit"
    ],
    "resources": [
      {
        "label": "V8 JavaScript Engine: Launching Ignition and TurboFan",
        "url": "https://v8.dev/blog/launching-ignition-and-turbofan"
      },
      {
        "label": "V8 Blog: Sparkplug — A Fast Non-Optimizing Compiler",
        "url": "https://v8.dev/blog/sparkplug"
      },
      {
        "label": "Franziska Hinkelmann: JavaScript Engine Fundamentals (V8 Dev)",
        "url": "https://mathiasbynens.be/notes/shapes-ics"
      }
    ]
  },
  {
    "id": "browser-rendering-pipeline-layout-paint-composite",
    "title": "Browser Critical Rendering Path",
    "description": "The rendering engine combines the DOM and CSSOM into a Render Tree, calculates geometry bounding boxes (Layout/Reflow).",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "browser-internals",
      "rendering",
      "compositing",
      "performance"
    ],
    "resources": [
      {
        "label": "Google Developers: Critical Rendering Path & Rendering Performance",
        "url": "https://web.dev/critical-rendering-path/"
      },
      {
        "label": "CSS Triggers: Layout, Paint, and Composite Performance Catalog",
        "url": "https://csstriggers.com/"
      }
    ]
  },
  {
    "id": "web-workers-and-transferable-objects",
    "title": "Dedicated Web Workers, SharedArrayBuffer & Transferable Objects",
    "description": "Web Workers offload heavy computational tasks off the browser main thread via separate OS threads.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "javascript",
      "concurrency",
      "web-workers",
      "memory"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: Web Workers API and Threading Model",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API"
      },
      {
        "label": "MDN Web Docs: Transferable objects and Zero-Copy Data Transfer",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects"
      },
      {
        "label": "JavaScript Atomics & SharedArrayBuffer Specification",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics"
      }
    ]
  },
  {
    "id": "speculative-parsing-and-preload-scanner",
    "title": "HTML Speculative Parsing",
    "description": "Scans HTML ahead of blocking scripts using a background thread, discovering and preloading external assets concurrently.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "browser-internals",
      "performance",
      "html-parsing"
    ],
    "resources": [
      {
        "label": "Google Developers: Optimize Resource Loading with the Preload Scanner",
        "url": "https://web.dev/preload-scanner/"
      }
    ]
  },
  {
    "id": "websocket-protocol-framing-and-handshake",
    "title": "WebSocket Protocol",
    "description": "WebSockets upgrade HTTP connections into full-duplex persistent TCP channels via the `Upgrade: websocket` header handshake.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "websockets",
      "protocols",
      "rfc6455"
    ],
    "resources": [
      {
        "label": "RFC 6455: The WebSocket Protocol Specification",
        "url": "https://datatracker.ietf.org/doc/html/rfc6455"
      },
      {
        "label": "MDN Web Docs: The WebSocket API Architecture",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API"
      }
    ]
  },
  {
    "id": "webrtc-peer-connections-and-ice-sdp",
    "title": "WebRTC Architecture",
    "description": "WebRTC enables real-time peer-to-peer audio, video, and binary DataChannel communication directly between browsers.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "webrtc",
      "p2p",
      "realtime"
    ],
    "resources": [
      {
        "label": "RFC 8445: Interactive Connectivity Establishment (ICE) Protocol",
        "url": "https://datatracker.ietf.org/doc/html/rfc8445"
      },
      {
        "label": "WebRTC for the Curious: Deep Dive into P2P Protocols",
        "url": "https://webrtcforthecurious.com/"
      }
    ]
  },
  {
    "id": "server-sent-events-sse-vs-websockets",
    "title": "Server-Sent Events (SSE)",
    "description": "Server-Sent Events deliver unidirectional server-to-client updates over standard persistent HTTP connections using the `text/event-stream` MIME type.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "sse",
      "http",
      "streaming"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: Using Server-Sent Events (EventSource API)",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events"
      }
    ]
  },
  {
    "id": "http2-vs-http3-quic-head-of-line-blocking",
    "title": "HTTP/2 vs. HTTP/3 (QUIC)",
    "description": "HTTP/2 multiplexes multiple streams over a single TCP connection, but a single lost packet blocks all concurrent streams at the OS TCP transport layer (TCP.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "networking",
      "http2",
      "http3",
      "quic"
    ],
    "resources": [
      {
        "label": "RFC 9114: HTTP/3 Protocol Specification (IETF)",
        "url": "https://datatracker.ietf.org/doc/html/rfc9114"
      },
      {
        "label": "RFC 9000: QUIC: A UDP-Based Multiplexed and Secure Transport",
        "url": "https://datatracker.ietf.org/doc/html/rfc9000"
      }
    ]
  },
  {
    "id": "web-streams-api-and-backpressure",
    "title": "Web Streams API",
    "description": "The Web Streams API enables processing network payloads chunk-by-chunk in real time rather than buffering entire gigabyte responses in memory.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "javascript",
      "streams",
      "backpressure",
      "async"
    ],
    "resources": [
      {
        "label": "WHATWG Streams Living Standard Specification",
        "url": "https://streams.spec.whatwg.org/"
      },
      {
        "label": "MDN Web Docs: Streams API Architecture and Concepts",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Streams_API"
      },
      {
        "label": "Google Developers: 2016 - the year of web streams (Jake Archibald)",
        "url": "https://jakearchibald.com/2016/streams-ftw/"
      }
    ]
  },
  {
    "id": "core-web-vitals-inp-lcp-cls",
    "title": "Core Web Vitals",
    "description": "INP measures user interface responsiveness across all interactions, tracking input delay, event processing duration, and presentation delay.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "performance",
      "web-vitals",
      "inp",
      "lcp",
      "cls"
    ],
    "resources": [
      {
        "label": "Google Web.dev: Interaction to Next Paint (INP) Specification",
        "url": "https://web.dev/inp/"
      },
      {
        "label": "Google Web.dev: Largest Contentful Paint (LCP) Optimization",
        "url": "https://web.dev/lcp/"
      },
      {
        "label": "Google Web.dev: Cumulative Layout Shift (CLS) Mechanics",
        "url": "https://web.dev/cls/"
      }
    ]
  },
  {
    "id": "code-splitting-and-dynamic-imports",
    "title": "Code Splitting Architecture",
    "description": "Modern bundlers parse dynamic `import` statements into separate chunk entry points in the dependency graph.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "performance",
      "bundling",
      "code-splitting",
      "webpack"
    ],
    "resources": [
      {
        "label": "Webpack Documentation: Code Splitting Concepts and Optimization",
        "url": "https://webpack.js.org/guides/code-splitting/"
      },
      {
        "label": "React Documentation: Code Splitting with React.lazy and Suspense",
        "url": "https://react.dev/reference/react/lazy"
      }
    ]
  },
  {
    "id": "css-containment-and-content-visibility",
    "title": "CSS Containment",
    "description": "CSS Containment (`contain: layout paint style`) isolates subtrees from the rest of the document.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "css",
      "performance",
      "containment",
      "rendering"
    ],
    "resources": [
      {
        "label": "Google Web.dev: content-visibility: the new CSS property that boosts your rendering performance",
        "url": "https://web.dev/content-visibility/"
      },
      {
        "label": "MDN Web Docs: CSS contain property",
        "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/contain"
      }
    ]
  },
  {
    "id": "browser-bfcache-back-forward-cache",
    "title": "Back/Forward Cache (bfcache)",
    "description": "The bfcache stores an entire frozen snapshot of the live DOM, JavaScript execution context, and rendering state in browser memory when users navigate away.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "performance",
      "bfcache",
      "browsers",
      "navigation"
    ],
    "resources": [
      {
        "label": "Google Web.dev: Back/forward cache (bfcache) Optimization Guide",
        "url": "https://web.dev/bfcache/"
      },
      {
        "label": "WebKit Documentation: Page Cache Lifecycle and Considerations",
        "url": "https://webkit.org/blog/427/webkit-page-cache-i-the-basics/"
      }
    ]
  },
  {
    "id": "resource-hints-preload-prefetch-modulepreload",
    "title": "Resource Hints",
    "description": "`preload` forces immediate high-priority retrieval of critical late-discovered assets (fonts, hero images).",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "performance",
      "resource-hints",
      "html",
      "networking"
    ],
    "resources": [
      {
        "label": "Google Web.dev: Preload critical assets to improve loading speed",
        "url": "https://web.dev/preload-critical-assets/"
      }
    ]
  },
  {
    "id": "service-worker-lifecycle-and-clients-claim",
    "title": "Service Worker Lifecycle",
    "description": "Service Workers run on an independent background thread decoupled from web pages.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "pwa",
      "service-workers",
      "offline",
      "caching"
    ],
    "resources": [
      {
        "label": "Jake Archibald: The Service Worker Lifecycle Guide",
        "url": "https://web.dev/service-worker-lifecycle/"
      },
      {
        "label": "MDN Web Docs: Service Worker API Documentation",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API"
      }
    ]
  },
  {
    "id": "cache-storage-api-caching-strategies",
    "title": "PWA Caching Strategies",
    "description": "The CacheStorage API allows Service Workers to intercept fetch requests and programmatically respond with cached responses.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "pwa",
      "caching",
      "service-workers",
      "offline"
    ],
    "resources": [
      {
        "label": "Google Chrome Workbox: Common Service Worker Caching Strategies",
        "url": "https://developer.chrome.com/docs/workbox/caching-strategies-overview/"
      }
    ]
  },
  {
    "id": "indexeddb-internals-transactions-and-indexes",
    "title": "IndexedDB Architecture",
    "description": "IndexedDB provides client-side NoSQL storage supporting gigabytes of structured cloneable objects.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "storage",
      "indexeddb",
      "pwa",
      "databases"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: IndexedDB Key Concepts and Usage",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Concepts_Behind_IndexedDB"
      }
    ]
  },
  {
    "id": "background-sync-and-periodic-sync-api",
    "title": "Background Sync API",
    "description": "The Background Sync API queues offline mutation tasks inside IndexedDB and registers a `sync` event with the browser.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "pwa",
      "background-sync",
      "service-workers",
      "offline"
    ],
    "resources": [
      {
        "label": "WICG: Web Background Synchronization Specification",
        "url": "https://wicg.github.io/background-sync/spec/"
      },
      {
        "label": "Google Developers: Defer actions with Background Sync",
        "url": "https://developer.chrome.com/docs/capabilities/periodic-background-sync"
      }
    ]
  },
  {
    "id": "css-container-queries-and-container-units",
    "title": "CSS Container Queries",
    "description": "Container queries evaluate component styling based on the width and height of an ancestor container element (`container-type.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "css",
      "container-queries",
      "responsive-design",
      "modern-css"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: CSS Container Queries Guide",
        "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries"
      },
      {
        "label": "Una Kravets: CSS Container Queries are finally here (Google Web.dev)",
        "url": "https://web.dev/cq-stable/"
      }
    ]
  },
  {
    "id": "css-cascade-layers-and-specificity",
    "title": "CSS Cascade Layers",
    "description": "Cascade Layers (`@layer`) introduce an explicit layering hierarchy that takes precedence over traditional selector specificity rules.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "css",
      "cascade-layers",
      "specificity",
      "modern-css"
    ],
    "resources": [
      {
        "label": "Bramus: The Future of CSS: Cascade Layers (CSS-Tricks)",
        "url": "https://css-tricks.com/css-cascade-layers/"
      }
    ]
  },
  {
    "id": "css-has-parent-relational-selector",
    "title": "CSS Relational Pseudo-Class",
    "description": "The `:has` pseudo-class matches an element if any of the relative selectors passed as arguments match at least one element.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "css",
      "selectors",
      "modern-css",
      "web-design"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: :has() Pseudo-class Reference",
        "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/:has"
      }
    ]
  },
  {
    "id": "view-transitions-api-spa-and-mpa",
    "title": "View Transitions API",
    "description": "The View Transitions API creates animated transitions between DOM states by taking before and after visual snapshots of elements tagged with `view-transition-name`.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "css",
      "view-transitions",
      "animation",
      "dom"
    ],
    "resources": [
      {
        "label": "Google Developers: Smooth and simple transitions with the View Transitions API (Jake Archibald)",
        "url": "https://developer.chrome.com/docs/web-platform/view-transitions/"
      }
    ]
  },
  {
    "id": "css-grid-layout-algorithm-and-subgrid",
    "title": "CSS Grid Track Sizing Algorithms, minmax(), fr Units & Subgrid",
    "description": "CSS Grid calculates layout through a two-pass track-sizing algorithm resolving intrinsic (`min-content`.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "css",
      "grid",
      "subgrid",
      "layout-engine"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: CSS Grid Layout and Subgrid Guide",
        "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid"
      }
    ]
  },
  {
    "id": "fine-grained-reactivity-and-signals",
    "title": "Fine-Grained Reactivity",
    "description": "Signals (in Solid) track dependencies dynamically using an automatic subscription graph established during getter execution.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "javascript",
      "reactivity",
      "signals",
      "solidjs"
    ],
    "resources": [
      {
        "label": "Ryan Carniato: A Hands-on Introduction to Fine-Grained Reactivity",
        "url": "https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf"
      },
      {
        "label": "TC39 Stage 1 Proposal: JavaScript Signals Standard",
        "url": "https://github.com/tc39/proposal-signals"
      },
      {
        "label": "Preact Documentation: Fast Signals in JavaScript Runtimes",
        "url": "https://preactjs.com/guide/v10/signals/"
      }
    ]
  },
  {
    "id": "centralized-immutable-state-flux-redux",
    "title": "Centralized Immutable State",
    "description": "The Flux architecture enforces unidirectional data flow: actions dispatched through a centralized store invoke pure reducer functions `(state.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "state-management",
      "redux",
      "flux",
      "functional-programming"
    ],
    "resources": [
      {
        "label": "Redux Official Documentation: Core Principles and Reducer Patterns",
        "url": "https://redux.js.org/understanding/thinking-in-redux/three-principles"
      }
    ]
  },
  {
    "id": "atomic-state-management-jotai-recoil",
    "title": "Atomic State Management",
    "description": "Atomic state models state as minimal independent reactive units called 'atoms' combined via pure derived selector functions into dependency DAGs.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "state-management",
      "atoms",
      "jotai",
      "react"
    ],
    "resources": [
      {
        "label": "Jotai: Primitive and Flexible State Management for React",
        "url": "https://jotai.org/docs/core/atom"
      }
    ]
  },
  {
    "id": "server-cache-state-tanstack-query-swr",
    "title": "Server State Synchronization",
    "description": "Server cache synchronizers manage asynchronous server state separately from UI client state.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "state-management",
      "tanstack-query",
      "swr",
      "data-fetching"
    ],
    "resources": [
      {
        "label": "TanStack Query Official Concepts & Architecture Documentation",
        "url": "https://tanstack.com/query/latest/docs/framework/react/overview"
      },
      {
        "label": "TkDodo: Inside React Query Architecture and Mental Models",
        "url": "https://tkdodo.eu/blog/practical-react-query"
      }
    ]
  },
  {
    "id": "content-security-policy-csp-level-3",
    "title": "Content Security Policy (CSP Level 3)",
    "description": "CSP restricts the origins from which scripts, styles, and media can execute.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "security",
      "csp",
      "xss",
      "headers"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: Content Security Policy (CSP)",
        "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"
      }
    ]
  },
  {
    "id": "cors-preflight-mechanics-and-simple-requests",
    "title": "CORS Internals",
    "description": "Cross-Origin Resource Sharing (CORS) enforces Same-Origin Policy boundaries.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "security",
      "cors",
      "http",
      "networking"
    ],
    "resources": [
      {
        "label": "Fetch Living Standard: CORS Specification (WHATWG)",
        "url": "https://fetch.spec.whatwg.org/#http-cors-protocol"
      },
      {
        "label": "MDN Web Docs: Cross-Origin Resource Sharing (CORS)",
        "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"
      }
    ]
  },
  {
    "id": "cross-site-scripting-xss-mechanics",
    "title": "XSS Vulnerabilities",
    "description": "Cross-Site Scripting (XSS) occurs when untrusted user input is injected into the DOM as executable code.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "security",
      "xss",
      "dom",
      "vulnerabilities"
    ],
    "resources": [
      {
        "label": "OWASP: Cross-Site Scripting (XSS) Prevention Cheat Sheet",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
      },
      {
        "label": "Google Web.dev: Prevent DOM-based XSS with Trusted Types",
        "url": "https://web.dev/trusted-types/"
      }
    ]
  },
  {
    "id": "csrf-and-samesite-cookies",
    "title": "CSRF Defense",
    "description": "Cross-Site Request Forgery (CSRF) tricks authenticated user browsers into issuing unauthorized state-changing requests to target origins.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "security",
      "csrf",
      "cookies",
      "samesite"
    ],
    "resources": [
      {
        "label": "OWASP: Cross-Site Request Forgery Prevention Cheat Sheet",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html"
      }
    ]
  },
  {
    "id": "cross-origin-isolation-coop-coep-corp",
    "title": "Cross-Origin Isolation",
    "description": "To mitigate microarchitectural CPU timing attacks (Spectre), high-resolution timers and `SharedArrayBuffer` require strict Cross-Origin Isolation.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "security",
      "isolation",
      "spectre",
      "sharedarraybuffer"
    ],
    "resources": [
      {
        "label": "Google Web.dev: Making your website 'cross-origin isolated' using COOP and COEP",
        "url": "https://web.dev/cross-origin-isolation-guide/"
      },
      {
        "label": "MDN Web Docs: Cross-Origin Isolation Architecture",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated"
      }
    ]
  },
  {
    "id": "webassembly-linear-memory-model",
    "title": "WebAssembly Linear Memory",
    "description": "WebAssembly memory is structured as a contiguous, resizable, one-dimensional array of raw unmanaged bytes represented in JS as an `ArrayBuffer`.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "wasm",
      "webassembly",
      "memory",
      "security"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: Understanding WebAssembly Memory",
        "url": "https://developer.mozilla.org/en-US/docs/WebAssembly/Understanding_the_text_format#webassembly_memory"
      }
    ]
  },
  {
    "id": "webassembly-js-interop-and-wasm-bindgen",
    "title": "WebAssembly JS Interop",
    "description": "Wasm natively only handles numeric scalar types (i32, i64, f32, f64).",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "wasm",
      "rust",
      "javascript",
      "interop"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: Using the WebAssembly JavaScript API",
        "url": "https://developer.mozilla.org/en-US/docs/WebAssembly/Using_the_JavaScript_API"
      }
    ]
  },
  {
    "id": "webassembly-simd-vectorization",
    "title": "WebAssembly Fixed-Width SIMD",
    "description": "WebAssembly SIMD (Single Instruction, Multiple Data) exposes 128-bit vector registers to process multiple integers or floats concurrently in a single CPU.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "wasm",
      "performance",
      "simd",
      "vectorization"
    ],
    "resources": [
      {
        "label": "WebAssembly Specification: 128-Bit SIMD Proposal",
        "url": "https://github.com/WebAssembly/simd/blob/master/proposals/simd/SIMD.md"
      },
      {
        "label": "V8 Blog: High-Performance WebAssembly applications with 128-bit SIMD",
        "url": "https://v8.dev/features/simd"
      }
    ]
  },
  {
    "id": "wasi-webassembly-system-interface",
    "title": "WASI (WebAssembly System Interface)",
    "description": "WASI defines a standardized, modular system call interface allowing WebAssembly to run outside browser sandboxes on servers and edge nodes.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "wasm",
      "wasi",
      "systems",
      "sandboxing"
    ],
    "resources": [
      {
        "label": "Bytecode Alliance: Standardizing WASI: A system interface to run WebAssembly outside the web",
        "url": "https://hacks.mozilla.org/2019/03/standardizing-wasi-a-webassembly-system-interface/"
      }
    ]
  },
  {
    "id": "tree-shaking-and-static-module-analysis",
    "title": "Tree-Shaking Internals",
    "description": "Tree-shaking relies on ECMAScript Modules (ESM) having static `import`/`export` syntax that can be analyzed at compile time without code execution.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "bundling",
      "tree-shaking",
      "esm",
      "webpack"
    ],
    "resources": [
      {
        "label": "Webpack Guide: Tree Shaking and Side Effects Optimization",
        "url": "https://webpack.js.org/guides/tree-shaking/"
      }
    ]
  },
  {
    "id": "esm-vs-commonjs-interop-dual-package-hazard",
    "title": "ESM vs. CommonJS Interoperability",
    "description": "CommonJS loads modules synchronously via dynamic `require`, while ESM loads asynchronously via static imports.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "javascript",
      "esm",
      "commonjs",
      "node",
      "bundling"
    ],
    "resources": [
      {
        "label": "Node.js Documentation: Modules: Packages and Conditional Exports",
        "url": "https://nodejs.org/api/packages.html#dual-commonjses-module-packages"
      }
    ]
  },
  {
    "id": "source-maps-vlq-encoding-internals",
    "title": "Source Maps v3",
    "description": "Source Maps map compiled, minified production JavaScript back to original source files and lines.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "devtools",
      "source-maps",
      "compilers",
      "debugging"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: Source map",
        "url": "https://developer.mozilla.org/en-US/docs/Glossary/Source_map"
      }
    ]
  },
  {
    "id": "module-federation-micro-frontends",
    "title": "Webpack Module Federation",
    "description": "Enables independent JavaScript applications to dynamically load and share components and dependencies at runtime.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "bundling",
      "module-federation",
      "micro-frontends",
      "webpack"
    ],
    "resources": [
      {
        "label": "Webpack Documentation: Module Federation Architecture",
        "url": "https://webpack.js.org/concepts/module-federation/"
      },
      {
        "label": "Zack Jackson: Module Federation Technical Principles",
        "url": "https://module-federation.io/"
      }
    ]
  },
  {
    "id": "native-native-bundlers-esbuild-turbopack-rspack",
    "title": "Next-Gen Bundler Architecture",
    "description": "Modern bundlers replace JavaScript-based compilers with compiled languages (Go in esbuild).",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "build-tools",
      "rust",
      "go",
      "esbuild",
      "rspack"
    ],
    "resources": [
      {
        "label": "Wikipedia: Module bundler",
        "url": "https://en.wikipedia.org/wiki/Module_bundler"
      }
    ]
  },
  {
    "id": "dom-mutation-observers-vs-polling",
    "title": "DOM MutationObserver",
    "description": "MutationObserver replaces deprecated, performance-degrading DOM Mutation Events.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "dom",
      "javascript",
      "browser-internals",
      "performance"
    ],
    "resources": [
      {
        "label": "DOM Living Standard: Mutation Observers Specification (WHATWG)",
        "url": "https://dom.spec.whatwg.org/#mutation-observers"
      },
      {
        "label": "MDN Web Docs: MutationObserver Interface and Usage",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver"
      }
    ]
  },
  {
    "id": "intersection-observer-and-layout-thrashing",
    "title": "IntersectionObserver",
    "description": "Traditional scroll listeners querying `getBoundingClientRect` force the browser to execute synchronous layout passes (layout thrashing) on the main thread.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "performance",
      "dom",
      "observers",
      "layout-thrashing"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: Intersection Observer API",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API"
      }
    ]
  },
  {
    "id": "shadow-dom-and-web-components-encapsulation",
    "title": "Shadow DOM",
    "description": "Shadow DOM attaches a scoped, encapsulated sub-DOM tree (`ShadowRoot`) to a custom element host.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "web-components",
      "shadow-dom",
      "css",
      "encapsulation"
    ],
    "resources": [
      {
        "label": "DOM Living Standard: Shadow Trees Specification (WHATWG)",
        "url": "https://dom.spec.whatwg.org/#shadow-trees"
      },
      {
        "label": "MDN Web Docs: Using shadow DOM and Custom Elements",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM"
      }
    ]
  },
  {
    "id": "browser-security-subresource-integrity-sri",
    "title": "Subresource Integrity (SRI)",
    "description": "Subresource Integrity allows browsers to verify that third-party scripts and stylesheets fetched from external CDNs have not been maliciously modified.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "security",
      "sri",
      "cryptography",
      "cdn"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: Subresource Integrity (SRI)",
        "url": "https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity"
      }
    ]
  },
  {
    "id": "font-loading-performance-and-font-display",
    "title": "Web Font Optimization",
    "description": "Custom web fonts can cause Flash of Invisible Text (FOIT) or Flash of Unstyled Text (FOUT) while downloading.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "performance",
      "fonts",
      "css",
      "typography"
    ],
    "resources": [
      {
        "label": "Google Web.dev: Best practices for fonts performance",
        "url": "https://web.dev/font-best-practices/"
      }
    ]
  },
  {
    "id": "form-data-and-multipart-form-data-encoding",
    "title": "HTTP Form Encoding",
    "description": "Standard HTML forms serialize inputs as URL-encoded key-value strings (`application/x-www-form-urlencoded`).",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "http",
      "forms",
      "encoding",
      "fetch"
    ],
    "resources": [
      {
        "label": "RFC 7578: Returning Values from Forms: multipart/form-data",
        "url": "https://datatracker.ietf.org/doc/html/rfc7578"
      },
      {
        "label": "MDN Web Docs: FormData API & Sending Form Data",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/FormData"
      }
    ]
  },
  {
    "id": "web-audio-api-audio-graphs",
    "title": "Web Audio API",
    "description": "The Web Audio API processes and synthesizes audio within an `AudioContext` using directed modular audio routing graphs.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "audio",
      "web-audio-api",
      "multimedia",
      "javascript"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: Basic concepts behind Web Audio API",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API"
      }
    ]
  },
  {
    "id": "canvas-2d-vs-webgl-vs-webgpu",
    "title": "Browser Graphics Primitives",
    "description": "Canvas 2D provides immediate-mode software/hardware 2D rasterization.",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "graphics",
      "canvas",
      "webgl",
      "webgpu"
    ],
    "resources": [
      {
        "label": "Google Developers: WebGPU: Next-generation graphics and compute in the browser",
        "url": "https://developer.chrome.com/docs/web-platform/webgpu/"
      }
    ]
  },
  {
    "id": "navigator-sendbeacon-and-page-lifecycle",
    "title": "Reliable Telemetry Dispatch",
    "description": "Standard asynchronous `fetch` requests triggered in `unload` or `pagehide` event handlers are frequently canceled by the browser when tearing down the page..",
    "category": "web-dev",
    "group": "tech",
    "group_name": "tech",
    "tags": [
      "javascript",
      "telemetry",
      "networking",
      "browser-internals"
    ],
    "resources": [
      {
        "label": "MDN Web Docs: navigator.sendBeacon() Method",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon"
      }
    ]
  }
];

export default topics;
