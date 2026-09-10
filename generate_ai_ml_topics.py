import csv
import json
import os

topics = [
    # 1. Core Transformer & Sequence Architectures
    {
        "id": "multi-head-self-attention",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "deep-learning;transformers;nlp",
        "title": "Scaled Dot-Product & Multi-Head Self-Attention",
        "description": "Calculates pairwise dynamic compatibility across token representations via query-key dot products to route value embeddings across multiple representation subspaces. It eliminates recurrent sequential bottlenecks by allowing full parallelization over the sequence length.",
        "resources": [
            {"label": "Attention Is All You Need (Vaswani et al., 2017)", "url": "https://arxiv.org/abs/1706.03762"},
            {"label": "The Illustrated Transformer (Jay Alammar)", "url": "https://jalammar.github.io/illustrated-transformer/"},
            {"label": "PyTorch MultiheadAttention Docs", "url": "https://pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html"}
        ]
    },
    {
        "id": "mixture-of-experts-moe",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "transformers;sparse-computing;llm-architecture",
        "title": "Sparse Mixture of Experts (MoE)",
        "description": "Replaces dense feed-forward networks with multiple specialized expert sub-networks dynamically selected per token by a top-k router. This decouples total parameter capacity from per-token compute cost during inference and training.",
        "resources": [
            {"label": "Outrageously Large Neural Networks: The Sparsely-Gated MoE Layer", "url": "https://arxiv.org/abs/1701.06538"},
            {"label": "Hugging Face Mixture of Experts Explained", "url": "https://huggingface.co/blog/moe"},
            {"label": "Mixtral of Experts Paper", "url": "https://arxiv.org/abs/2401.04088"}
        ]
    },
    {
        "id": "mamba-state-space-models",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "sequence-models;state-space-models;deep-learning",
        "title": "Mamba & Selective State Space Models",
        "description": "Sub-quadratic sequence models that parameterize continuous-time state spaces with input-dependent selection mechanisms and hardware-aware scan kernels. They achieve linear inference scaling and constant memory footprint with Transformer-competitive language modeling fidelity.",
        "resources": [
            {"label": "Mamba: Linear-Time Sequence Modeling with Selective State Spaces", "url": "https://arxiv.org/abs/2312.00752"},
            {"label": "State Space Models Annotated (Albert Gu & Tri Dao)", "url": "https://srush.github.io/annotated-s4/"},
            {"label": "Mamba GitHub Repository", "url": "https://github.com/state-spaces/mamba"}
        ]
    },
    {
        "id": "rotary-positional-embeddings-rope",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "transformers;positional-encoding;nlp",
        "title": "Rotary Position Embeddings (RoPE)",
        "description": "Encodes token position information into query and key representations by rotating 2D slice vectors using orthogonal rotation matrices. This naturally decays attention scores as token distances grow and enables flexible context length extension via interpolation.",
        "resources": [
            {"label": "RoFormer: Enhanced Transformer with Rotary Position Embedding (Su et al.)", "url": "https://arxiv.org/abs/2104.09864"},
            {"label": "EleutherAI: Rotary Embeddings Explanation", "url": "https://blog.eleuther.ai/rotary-embeddings/"},
            {"label": "Hugging Face RoPE Implementation in Llama", "url": "https://github.com/huggingface/transformers/blob/main/src/transformers/models/llama/modeling_llama.py"}
        ]
    },
    {
        "id": "residual-connections-resnet",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "computer-vision;deep-learning;optimization",
        "title": "Residual Connections & Highway Gradient Flow",
        "description": "Introduces identity skip connections that formulate layer mappings as learning residual functions with reference to layer inputs. This prevents the vanishing and exploding gradient problem, enabling the stable training of networks with hundreds of layers.",
        "resources": [
            {"label": "Deep Residual Learning for Image Recognition (He et al., 2015)", "url": "https://arxiv.org/abs/1512.03385"},
            {"label": "Understanding the Effective Path Length in ResNets (Veit et al.)", "url": "https://arxiv.org/abs/1605.06431"},
            {"label": "PyTorch ResNet Implementation", "url": "https://github.com/pytorch/vision/blob/main/torchvision/models/resnet.py"}
        ]
    },
    {
        "id": "vision-transformers-vit",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "computer-vision;transformers;deep-learning",
        "title": "Vision Transformers (ViT)",
        "description": "Applies standard Transformer encoder architectures directly to non-overlapping 16x16 image patches treated as sequential token embeddings. With sufficient pre-training scale, ViT eliminates convolutional inductive biases and achieves superior global visual reasoning.",
        "resources": [
            {"label": "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale", "url": "https://arxiv.org/abs/2010.11929"},
            {"label": "Google Research ViT JAX Repository", "url": "https://github.com/google-research/vision_transformer"},
            {"label": "Hugging Face Vision Transformer Guide", "url": "https://huggingface.co/docs/transformers/model_doc/vit"}
        ]
    },
    {
        "id": "swin-transformer-shifted-windows",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "computer-vision;transformers;vision-backbone",
        "title": "Swin Transformer: Hierarchical Vision with Shifted Windows",
        "description": "Constructs hierarchical feature maps with linear computational complexity relative to image size by computing self-attention only within local non-overlapping windows. Shifting window partitions across consecutive layers introduces cross-window connections.",
        "resources": [
            {"label": "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows (Liu et al., ICCV)", "url": "https://arxiv.org/abs/2103.14030"},
            {"label": "Microsoft Swin-Transformer GitHub Repo", "url": "https://github.com/microsoft/Swin-Transformer"},
            {"label": "PyTorch SwinTransformer Implementation", "url": "https://pytorch.org/vision/main/models/swin_transformer.html"}
        ]
    },
    {
        "id": "sliding-window-and-longformer-attention",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "transformers;sparse-attention;long-context",
        "title": "Sliding Window & Sparse Attention Patterns",
        "description": "Replaces full dense $O(N^2)$ attention matrices with localized sliding window bands combined with dilated and global attention anchor tokens. This allows models to process 32k+ token sequences with linear memory and compute scaling.",
        "resources": [
            {"label": "Longformer: The Long-Document Transformer (Beltagy, Peters, Cohan)", "url": "https://arxiv.org/abs/2004.05150"},
            {"label": "Mistral 7B Paper: Sliding Window Attention", "url": "https://arxiv.org/abs/2310.06825"},
            {"label": "Generating Long Sequences with Sparse Transformers (Child et al., OpenAI)", "url": "https://arxiv.org/abs/1904.10509"}
        ]
    },
    {
        "id": "grouped-query-attention-gqa",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "transformers;attention;inference",
        "title": "Grouped-Query Attention (GQA) & Multi-Query Attention (MQA)",
        "description": "Interpolates between multi-head attention and single-key-value multi-query attention by sharing a single key and value projection head across a subset group of query heads. This dramatically slashes KV-cache memory bandwidth consumption while maintaining model performance.",
        "resources": [
            {"label": "GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints", "url": "https://arxiv.org/abs/2305.13245"},
            {"label": "Fast Transformer Decoding: One Write-Head is All You Need (Shazeer, 2019)", "url": "https://arxiv.org/abs/1911.02150"},
            {"label": "Llama 3 Technical Report (Meta AI)", "url": "https://arxiv.org/abs/2407.21783"}
        ]
    },

    # 2. Training, Alignment & Fine-Tuning
    {
        "id": "lora-low-rank-adaptation",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "peft;fine-tuning;llm-optimization",
        "title": "Low-Rank Adaptation (LoRA)",
        "description": "Freezes pre-trained model weights and injects trainable rank-decomposition matrix pairs into each attention and MLP projection layer. This reduces trainable parameters by over 99% and slashes GPU memory requirements during domain-specific fine-tuning.",
        "resources": [
            {"label": "LoRA: Low-Rank Adaptation of Large Language Models (Hu et al.)", "url": "https://arxiv.org/abs/2106.09685"},
            {"label": "Hugging Face PEFT Library Documentation", "url": "https://huggingface.co/docs/peft/conceptual_guides/lora"},
            {"label": "Microsoft LoRA GitHub Repo", "url": "https://github.com/microsoft/LoRA"}
        ]
    },
    {
        "id": "qlora-quantized-fine-tuning",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "quantization;fine-tuning;peft",
        "title": "QLoRA & 4-bit NormalFloat Quantization",
        "description": "Enables fine-tuning of 65B+ parameter LLMs on a single 48GB GPU by combining 4-bit NormalFloat quantization, double quantization of scale factors, and paged optimizers to handle memory spikes. Gradients backpropagate through the quantized weights into 16-bit LoRA adapter matrices.",
        "resources": [
            {"label": "QLoRA: Efficient Finetuning of Quantized LLMs (Dettmers et al.)", "url": "https://arxiv.org/abs/2305.14314"},
            {"label": "bitsandbytes Library Documentation", "url": "https://github.com/TimDettmers/bitsandbytes"},
            {"label": "Hugging Face Blog: Making LLMs even more accessible with bitsandbytes", "url": "https://huggingface.co/blog/4bit-transformers-bitsandbytes"}
        ]
    },
    {
        "id": "direct-preference-optimization-dpo",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "alignment;rlhf;post-training",
        "title": "Direct Preference Optimization (DPO)",
        "description": "Eliminates the explicit reward modeling and reinforcement learning steps in RLHF by showing the language model policy can be analytically optimized directly on pairwise human preference data via a simple binary cross-entropy loss against a reference model.",
        "resources": [
            {"label": "Direct Preference Optimization: Your Language Model is Secretly a Reward Model", "url": "https://arxiv.org/abs/2305.18290"},
            {"label": "Hugging Face TRL DPO Trainer Docs", "url": "https://huggingface.co/docs/trl/main/en/dpo_trainer"},
            {"label": "Stanford CS330: Alignment and Preference Learning", "url": "https://cs330.stanford.edu/"}
        ]
    },
    {
        "id": "rlhf-proximal-policy-optimization",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "alignment;reinforcement-learning;llms",
        "title": "RLHF with Proximal Policy Optimization",
        "description": "Aligns language models with human intentions by first training a Bradley-Terry reward model on human comparisons, and then optimizing policy generation via PPO with a KL-divergence penalty to prevent policy collapse away from the base model.",
        "resources": [
            {"label": "Training language models to follow instructions with human feedback (InstructGPT)", "url": "https://arxiv.org/abs/2203.02155"},
            {"label": "Deep Reinforcement Learning from Human Preferences (Christiano et al.)", "url": "https://arxiv.org/abs/1706.03741"},
            {"label": "Hugging Face: Illustrating Reinforcement Learning from Human Feedback", "url": "https://huggingface.co/blog/rlhf"}
        ]
    },
    {
        "id": "constitutional-ai-and-rlaif",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "alignment;ai-safety;rlhf",
        "title": "Constitutional AI & RL from AI Feedback (RLAIF)",
        "description": "Scales model alignment by using a set of natural language principles ('constitution') and self-critique loops to generate synthetic revision pairs and train reward models without continuous manual human labeling.",
        "resources": [
            {"label": "Constitutional AI: Harmlessness from AI Feedback (Anthropic)", "url": "https://arxiv.org/abs/2212.08073"},
            {"label": "RLAIF: Scaling Reinforcement Learning from Human Feedback with AI Feedback (Google)", "url": "https://arxiv.org/abs/2309.00267"},
            {"label": "Anthropic Research: Core Principles of Constitutional AI", "url": "https://www.anthropic.com/news/claudes-constitution"}
        ]
    },
    {
        "id": "kahneman-tversky-optimization-kto",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "alignment;loss-functions;nlp",
        "title": "Kahneman-Tversky Optimization (KTO)",
        "description": "Applies behavioral economics prospect theory to LLM alignment by maximizing the expected human utility of generated outputs using unpaired binary feedback (thumbs up / thumbs down) rather than expensive preference pairs.",
        "resources": [
            {"label": "KTO: Model Alignment as Prospect Theoretic Optimization (Ethayarajh et al.)", "url": "https://arxiv.org/abs/2402.01306"},
            {"label": "Contextual AI: KTO Technical Writeup", "url": "https://contextual.ai/better-cheaper-faster-llm-alignment-with-kto/"},
            {"label": "TRL KTO Trainer Docs", "url": "https://huggingface.co/docs/trl/main/en/kto_trainer"}
        ]
    },
    {
        "id": "prompt-tuning-and-prefix-tuning",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "peft;parameter-efficient;prompting",
        "title": "Prefix-Tuning & Prompt Tuning",
        "description": "Freezes all pre-trained model weights and prepends continuous, task-specific virtual token embeddings to the input sequence or key-value activation layers. This preserves base model representations while tuning fewer than 0.1% parameters.",
        "resources": [
            {"label": "Prefix-Tuning: Optimizing Continuous Prompts for Generation (Li & Liang)", "url": "https://arxiv.org/abs/2101.00190"},
            {"label": "The Power of Scale for Parameter-Efficient Prompt Tuning (Lester et al., Google)", "url": "https://arxiv.org/abs/2104.08691"},
            {"label": "Hugging Face PEFT Prompt Tuning Guide", "url": "https://huggingface.co/docs/peft/package_reference/prompt_tuning"}
        ]
    },

    # 3. LLM Inference, Memory & Hardware Acceleration
    {
        "id": "flashattention-tiling-kernel",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "gpu-kernels;cuda;transformer-inference",
        "title": "FlashAttention & IO-Aware GPU Tiling",
        "description": "Restructures the self-attention softmax computation using online softmax normalization and memory tiling between GPU HBM and SRAM. This avoids reading and writing the $N \\times N$ intermediate attention matrix, achieving 2-4x wall-clock speedups with exact mathematical equivalence.",
        "resources": [
            {"label": "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness (Dao et al.)", "url": "https://arxiv.org/abs/2205.14135"},
            {"label": "FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning", "url": "https://arxiv.org/abs/2307.08691"},
            {"label": "FlashAttention Official GitHub Repository", "url": "https://github.com/Dao-AILab/flash-attention"}
        ]
    },
    {
        "id": "kv-caching-autoregressive-decoding",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "llm-inference;memory-optimization;deep-learning",
        "title": "KV-Caching in Autoregressive Generation",
        "description": "Stores key and value tensor representations of historical prompt and generation tokens in GPU memory during autoregressive generation. This reduces per-token decoding complexity from $O(N^2)$ matrix multiplications to $O(N)$ projection operations by recomputing only the current step query.",
        "resources": [
            {"label": "Transformers KV Cache Tutorial (Hugging Face)", "url": "https://huggingface.co/blog/kv-cache-tutorial"},
            {"label": "LLM Inference from Scratch (Karan Goel)", "url": "https://www.youtube.com/watch?v=1yeB_u6L6eY"},
            {"label": "vLLM: Efficient Memory Management for Large Language Models", "url": "https://vllm.ai/"}
        ]
    },
    {
        "id": "pagedattention-virtual-memory",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "systems-for-ml;inference-serving;vllm",
        "title": "PagedAttention & vLLM Memory Paging",
        "description": "Adapts operating system virtual memory paging concepts to LLM KV-cache management, partitioning key-value tensors into non-contiguous blocks of fixed physical tokens. This eliminates memory fragmentation and enables high-concurrency batching and copy-on-write beam searches.",
        "resources": [
            {"label": "Efficient Memory Management for Large Language Model Serving with PagedAttention (Kwon et al.)", "url": "https://arxiv.org/abs/2309.06180"},
            {"label": "vLLM Documentation and Architecture Guide", "url": "https://docs.vllm.ai/"},
            {"label": "Ray & vLLM High-Throughput Deployment Patterns", "url": "https://docs.ray.io/en/latest/ray-air/examples/vllm.html"}
        ]
    },
    {
        "id": "speculative-decoding-draft-models",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "llm-inference;speedup;algorithms",
        "title": "Speculative Decoding",
        "description": "Accelerates memory-bandwidth-bound LLM generation by having a fast, smaller draft model generate $K$ speculative tokens in parallel, which the primary target model verifies and accepts in a single forward pass via speculative sampling rejection algorithms.",
        "resources": [
            {"label": "Fast Inference from Transformers via Speculative Decoding (Leviathan et al., Google)", "url": "https://arxiv.org/abs/2211.17192"},
            {"label": "Accelerating Large Language Model Decoding with Speculative Sampling (DeepMind)", "url": "https://arxiv.org/abs/2302.01318"},
            {"label": "Hugging Face Speculative Decoding Guide", "url": "https://huggingface.co/blog/assisted-generation"}
        ]
    },
    {
        "id": "awq-activation-aware-quantization",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "quantization;model-compression;gpu",
        "title": "Activation-Aware Weight Quantization (AWQ)",
        "description": "Compresses LLM weights to 4-bit precision without retraining by observing that preserving the top 1% of weights corresponding to salient activation channels avoids perplexity degradation. It applies per-channel scaling transformations before low-bit quantization.",
        "resources": [
            {"label": "AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration (Lin et al.)", "url": "https://arxiv.org/abs/2306.00978"},
            {"label": "AutoAWQ GitHub Implementation", "url": "https://github.com/casper-hansen/AutoAWQ"},
            {"label": "MIT HAN Lab Model Compression Suite", "url": "https://hanlab.mit.edu/projects/awq"}
        ]
    },
    {
        "id": "gptq-post-training-quantization",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "quantization;compression;nlp",
        "title": "GPTQ: Accurate Post-Training Quantization",
        "description": "Performs second-order Hessian error compensation using Optimal Brain Surgeon equations to compress 175B+ parameter language models to 3-bit or 4-bit integer weights in a few GPU hours while retaining near-float16 baseline perplexity.",
        "resources": [
            {"label": "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers (Frantar et al.)", "url": "https://arxiv.org/abs/2210.17323"},
            {"label": "AutoGPTQ GitHub Repository", "url": "https://github.com/AutoGPTQ/AutoGPTQ"},
            {"label": "Hugging Face: Overview of Post-Training Quantization Methods", "url": "https://huggingface.co/docs/transformers/main_classes/quantization"}
        ]
    },
    {
        "id": "continuous-batching-orca",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "llm-serving;gpu;systems-ml",
        "title": "Iteration-Level Continuous Batching (Orca)",
        "description": "Replaces static request-level batching with dynamic iteration-level scheduling where newly arriving requests immediately join current GPU decoding steps and finished requests are evicted immediately without stalling the rest of the batch.",
        "resources": [
            {"label": "Orca: A Distributed Serving System for Transformer-Based Generative Models (Yu et al., OSDI)", "url": "https://www.usenix.org/conference/osdi22/presentation/yu"},
            {"label": "Triton Inference Server Architecture", "url": "https://github.com/triton-inference-server/server"},
            {"label": "TensorRT-LLM Architecture Overview", "url": "https://github.com/NVIDIA/TensorRT-LLM"}
        ]
    },
    {
        "id": "beam-search-and-top-p-sampling",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "decoding;sampling;nlp",
        "title": "Nucleus (Top-p) Sampling, Temperature & Beam Search",
        "description": "Decoding strategies for autoregressive generation. Nucleus sampling truncates the unreliable tail of the probability distribution by sampling dynamically from the smallest set of tokens whose cumulative probability exceeds threshold p.",
        "resources": [
            {"label": "The Curious Case of Neural Text Degeneration (Holtzman et al., ICLR)", "url": "https://arxiv.org/abs/1904.09751"},
            {"label": "Hugging Face How to Generate Text: Using Different Decoding Methods", "url": "https://huggingface.co/blog/how-to-generate"},
            {"label": "Stanford CS224N: Text Generation Strategies", "url": "https://web.stanford.edu/class/cs224n/"}
        ]
    },

    # 4. Retrieval-Augmented Generation (RAG) & Vector Search
    {
        "id": "dense-retrieval-bi-encoders",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "rag;embeddings;vector-search",
        "title": "Dense Retrieval with Bi-Encoder Architectures",
        "description": "Encodes queries and passage documents into a shared continuous embedding space using twin neural encoders trained with contrastive infoNCE objectives. It enables sub-millisecond semantic search over millions of candidate texts using approximate nearest neighbor indexes.",
        "resources": [
            {"label": "Dense Passage Retrieval for Open-Domain Question Answering (Karpukhin et al., Meta)", "url": "https://arxiv.org/abs/2004.04906"},
            {"label": "Sentence-Transformers Library Documentation", "url": "https://sbert.net/"},
            {"label": "MTEB: Massive Text Embedding Benchmark Leaderboard", "url": "https://huggingface.co/spaces/mteb/leaderboard"}
        ]
    },
    {
        "id": "cross-encoder-reranking",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "rag;search;information-retrieval",
        "title": "Cross-Encoder Reranking in Multi-Stage Retrieval",
        "description": "Feeds candidate document-query pairs jointly through full self-attention layers to capture deep token-level cross-interactions. Used as a high-precision second-stage reranker on top of fast first-stage bi-encoder or BM25 retrieval pipelines.",
        "resources": [
            {"label": "Sentence-Transformers Cross-Encoders Guide", "url": "https://www.sbert.net/docs/pretrained_cross-encoders.html"},
            {"label": "Cohere Rerank: Enhancing RAG Systems", "url": "https://cohere.com/rerank"},
            {"label": "Information Retrieval: From Bi-Encoders to Cross-Encoders (Thakur et al.)", "url": "https://arxiv.org/abs/2104.08663"}
        ]
    },
    {
        "id": "hierarchical-navigable-small-world-hnsw",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "vector-search;algorithms;indexing",
        "title": "Hierarchical Navigable Small World (HNSW) Graphs",
        "description": "A multi-layer graph data structure for Approximate Nearest Neighbor (ANN) search that achieves logarithmic search complexity by executing skip-list-style greedy traversals across hierarchically clustered proximity subgraphs.",
        "resources": [
            {"label": "Efficient and Robust Approximate Nearest Neighbor Search Using HNSW (Malkov & Yashunin)", "url": "https://arxiv.org/abs/1603.09320"},
            {"label": "Pinecone Learning Center: Hierarchical Navigable Small World", "url": "https://www.pinecone.io/learn/series/faiss/hnsw/"},
            {"label": "Faiss Library: High-Performance Vector Indexing (Meta)", "url": "https://github.com/facebookresearch/faiss"}
        ]
    },
    {
        "id": "graphrag-knowledge-graph-retrieval",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "rag;knowledge-graphs;llms",
        "title": "GraphRAG: Knowledge Graph-Augmented Generation",
        "description": "Extracts entity-relationship graphs and community summaries from raw document corpora via LLMs to synthesize answers across diffuse, corpus-wide thematic questions that fail standard vector-distance semantic search.",
        "resources": [
            {"label": "From Local to Global: A Graph RAG Approach to Query-Focused Summarization (Microsoft)", "url": "https://arxiv.org/abs/2404.16130"},
            {"label": "Microsoft GraphRAG Official Repository", "url": "https://github.com/microsoft/graphrag"},
            {"label": "Neo4j GenAI Integration Guides", "url": "https://neo4j.com/developer/genai/"}
        ]
    },
    {
        "id": "hypothetical-document-embeddings-hyde",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "rag;retrieval;prompt-engineering",
        "title": "Hypothetical Document Embeddings (HyDE)",
        "description": "Zero-shot retrieval technique where an instruction-tuned LLM first generates a hypothetical answer document for a given query, which is subsequently embedded and matched against real passage vectors to bridge the query-passage semantic gap.",
        "resources": [
            {"label": "Precise Zero-Shot Dense Retrieval without Relevance Labels (Gao et al.)", "url": "https://arxiv.org/abs/2212.10496"},
            {"label": "LangChain HyDE Implementation Cookbook", "url": "https://python.langchain.com/docs/integrations/retrievers/hyde/"},
            {"label": "LlamaIndex Advanced Query Transformations", "url": "https://docs.llamaindex.ai/en/stable/examples/query_transformations/HyDEQueryTransformDemo/"}
        ]
    },

    # 5. Generative Modeling (Diffusion, VAEs, Flows)
    {
        "id": "denoising-diffusion-probabilistic-models-ddpm",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "generative-ai;diffusion;computer-vision",
        "title": "Denoising Diffusion Probabilistic Models (DDPM)",
        "description": "Generates data samples by reversing a parameterized Markov chain that gradually injects Gaussian noise into training images. Neural networks are trained to predict the added score/noise vector at arbitrary timesteps via variational bound optimization.",
        "resources": [
            {"label": "Denoising Diffusion Probabilistic Models (Ho, Jain, Abbeel, 2020)", "url": "https://arxiv.org/abs/2006.11239"},
            {"label": "What are Diffusion Models? (Lilian Weng)", "url": "https://lilianweng.github.io/posts/2021-07-11-diffusion-models/"},
            {"label": "Hugging Face Diffusers Library Documentation", "url": "https://huggingface.co/docs/diffusers/index"}
        ]
    },
    {
        "id": "classifier-free-guidance-cfg",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "diffusion;generative-ai;sampling",
        "title": "Classifier-Free Guidance (CFG)",
        "description": "Steers diffusion sampling towards text prompt alignment without requiring a separate classifier network by jointly training conditional and unconditional diffusion models and taking a linear extrapolation between their predicted noise vectors.",
        "resources": [
            {"label": "Classifier-Free Diffusion Guidance (Ho & Salimans, 2021)", "url": "https://arxiv.org/abs/2207.12598"},
            {"label": "Understanding Classifier-Free Guidance (Sander Dieleman)", "url": "https://benanne.github.io/2022/05/26/guidance.html"},
            {"label": "Stable Diffusion Sampling and Guidance Docs", "url": "https://huggingface.co/docs/diffusers/using-diffusers/conditional_image_generation"}
        ]
    },
    {
        "id": "latent-diffusion-models-stable-diffusion",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "diffusion;computer-vision;generative-ai",
        "title": "Latent Diffusion Models (LDMs)",
        "description": "Transfers the iterative diffusion and denoising process from high-dimensional pixel space into the compressed latent space of a pre-trained autoencoder. Cross-attention layers inject text prompts, conditioning image generation with high computational efficiency.",
        "resources": [
            {"label": "High-Resolution Image Synthesis with Latent Diffusion Models (Rombach et al.)", "url": "https://arxiv.org/abs/2112.10752"},
            {"label": "CompVis Stable Diffusion GitHub", "url": "https://github.com/CompVis/stable-diffusion"},
            {"label": "Stability AI SDXL Paper", "url": "https://arxiv.org/abs/2307.01952"}
        ]
    },
    {
        "id": "variational-autoencoders-vae",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "generative-ai;probabilistic-ml;deep-learning",
        "title": "Variational Autoencoders & The Reparameterization Trick",
        "description": "Maps complex inputs to a continuous, well-behaved latent probability distribution by optimizing the Evidence Lower Bound (ELBO) balancing reconstruction loss and KL divergence. The reparameterization trick enables gradient backpropagation through stochastic sampling nodes.",
        "resources": [
            {"label": "Auto-Encoding Variational Bayes (Kingma & Welling, 2013)", "url": "https://arxiv.org/abs/1312.6114"},
            {"label": "Tutorial on Variational Autoencoders (Carl Doersch)", "url": "https://arxiv.org/abs/1606.05908"},
            {"label": "PyTorch VAE Implementation Guide", "url": "https://github.com/AntixK/PyTorch-VAE"}
        ]
    },
    {
        "id": "vector-quantized-vae-vqvae",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "generative-ai;codebook;discrete-latent",
        "title": "Vector Quantized VAE (VQ-VAE) & Discrete Codebooks",
        "description": "Learns discrete latent representations by quantizing continuous encoder vectors to their nearest entry in a learned codebook. Bypasses posterior collapse in standard continuous VAEs and powers high-fidelity image, audio, and video synthesis.",
        "resources": [
            {"label": "Neural Discrete Representation Learning (van den Oord et al., DeepMind)", "url": "https://arxiv.org/abs/1711.00937"},
            {"label": "Generating Diverse High-Resolution Images with VQ-VAE-2 (Razavi et al.)", "url": "https://arxiv.org/abs/1906.00446"},
            {"label": "PyTorch VQ-VAE Tutorial", "url": "https://github.com/MishaLaskin/vqvae"}
        ]
    },

    # 6. Optimization, Normalization & Regularization
    {
        "id": "adamw-decoupled-weight-decay",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "optimization;deep-learning;training",
        "title": "AdamW: Decoupled Weight Decay Optimization",
        "description": "Fixes the standard L2 regularization bug in adaptive gradient methods by subtracting weight decay directly from parameter updates rather than adding it to the moving average gradient vector. This restores correct regularization dynamics for deep networks.",
        "resources": [
            {"label": "Decoupled Weight Decay Regularization (Loshchilov & Hutter, 2017)", "url": "https://arxiv.org/abs/1711.05101"},
            {"label": "PyTorch AdamW Optimizer Documentation", "url": "https://pytorch.org/docs/stable/generated/torch.optim.AdamW.html"},
            {"label": "Fast.ai: Why AdamW Matters", "url": "https://www.fast.ai/posts/2018-07-02-adamw-and-super-convergence.html"}
        ]
    },
    {
        "id": "rms-normalization-and-layer-norm",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "transformers;normalization;deep-learning",
        "title": "Root Mean Square Normalization (RMSNorm)",
        "description": "A computationally streamlined alternative to LayerNorm that scales input activations by their root mean square alone, discarding mean centering. This achieves comparable gradient stability with 10-50% speedups in Transformer normalization layers.",
        "resources": [
            {"label": "Root Mean Square Layer Normalization (Zhang & Sennrich, 2019)", "url": "https://arxiv.org/abs/1910.07467"},
            {"label": "Layer Normalization (Ba, Kiros, Hinton, 2016)", "url": "https://arxiv.org/abs/1607.06450"},
            {"label": "Flash-Linear-Attention RMSNorm Kernel", "url": "https://github.com/sustcsonglin/flash-linear-attention"}
        ]
    },
    {
        "id": "cosine-annealing-warmup-schedules",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "training;optimization;hyperparameters",
        "title": "Cosine Annealing with Warmup Schedules",
        "description": "Linearly ramps learning rates from zero during initial iterations to stabilize early optimizer variance, followed by a cosine decay down to a small fraction of the peak rate. This aids in escaping poor initial local minima and ensures smooth convergence.",
        "resources": [
            {"label": "SGDR: Stochastic Gradient Descent with Warm Restarts (Loshchilov & Hutter)", "url": "https://arxiv.org/abs/1608.03983"},
            {"label": "PyTorch CosineAnnealingLR Documentation", "url": "https://pytorch.org/docs/stable/generated/torch.optim.lr_scheduler.CosineAnnealingLR.html"},
            {"label": "Scaling Laws for Neural Language Models (Kaplan et al.)", "url": "https://arxiv.org/abs/2001.08361"}
        ]
    },
    {
        "id": "gradient-accumulation-and-mixed-precision",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "cuda;gpu-optimization;training",
        "title": "FP16/BF16 Mixed Precision & Gradient Accumulation",
        "description": "Accelerates deep learning training and halves GPU memory by running tensor contractions in Bfloat16 or FP16 Tensor Cores while maintaining master FP32 parameter copies and dynamic loss scaling to avoid numerical underflow.",
        "resources": [
            {"label": "Mixed Precision Training (Micikevicius et al., NVIDIA & Baidu)", "url": "https://arxiv.org/abs/1710.03740"},
            {"label": "PyTorch Automatic Mixed Precision (torch.cuda.amp)", "url": "https://pytorch.org/docs/stable/amp.html"},
            {"label": "NVIDIA Apex Documentation", "url": "https://nvidia.github.io/apex/"}
        ]
    },

    # 7. Reinforcement Learning & Planning
    {
        "id": "proximal-policy-optimization-ppo",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "reinforcement-learning;policy-gradient;optimization",
        "title": "Proximal Policy Optimization (PPO)",
        "description": "An on-policy actor-critic algorithm that maximizes a clipped surrogate objective function to penalize policy updates that deviate excessively from the previous policy version, delivering reliable convergence without the complexity of Trust Region Policy Optimization.",
        "resources": [
            {"label": "Proximal Policy Optimization Algorithms (Schulman et al., OpenAI)", "url": "https://arxiv.org/abs/1707.06347"},
            {"label": "OpenAI Spinning Up: Proximal Policy Optimization", "url": "https://spinningup.openai.com/en/latest/algorithms/ppo.html"},
            {"label": "CleanRL: High-Quality Single-File Implementation of PPO", "url": "https://github.com/vwxyzjn/cleanrl"}
        ]
    },
    {
        "id": "monte-carlo-tree-search-alphazero",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "reinforcement-learning;search;planning",
        "title": "Monte Carlo Tree Search (MCTS) & AlphaZero",
        "description": "Combines deep policy and value networks with heuristic tree search (selection, expansion, simulation, backpropagation) using Upper Confidence Bounds applied to Trees (UCT) to guide decision-making under uncertainty without human domain knowledge.",
        "resources": [
            {"label": "Mastering the Game of Go without Human Knowledge (Silver et al., Nature)", "url": "https://www.nature.com/articles/nature24270"},
            {"label": "A General Reinforcement Learning Algorithm that Masters Chess, Shogi, and Go (Science)", "url": "https://www.science.org/doi/10.1126/science.aar6404"},
            {"label": "DeepMind AlphaGo Research Archive", "url": "https://deepmind.google/technologies/alphago/"}
        ]
    },
    {
        "id": "deep-q-networks-dqn-experience-replay",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "reinforcement-learning;deep-learning;q-learning",
        "title": "Deep Q-Networks (DQN) & Experience Replay",
        "description": "Overcomes training instability in non-linear function approximation for Q-learning by employing experience replay buffers to break sample temporal correlations and frozen target networks to stabilize temporal difference target values.",
        "resources": [
            {"label": "Human-level Control Through Deep Reinforcement Learning (Mnih et al., Nature)", "url": "https://www.nature.com/articles/nature14236"},
            {"label": "Rainbow: Combining Improvements in Deep Reinforcement Learning", "url": "https://arxiv.org/abs/1710.02298"},
            {"label": "PyTorch Reinforcement Learning Tutorial (DQN)", "url": "https://pytorch.org/tutorials/intermediate/reinforcement_q_learning.html"}
        ]
    },

    # 8. Multimodal & Vision-Language
    {
        "id": "clip-contrastive-language-image-pretraining",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "multimodal;contrastive-learning;zero-shot",
        "title": "CLIP: Contrastive Language-Image Pretraining",
        "description": "Pre-trains image and text encoders simultaneously on hundreds of millions of web image-caption pairs using a symmetric cross-entropy loss over matched diagonal pairs. Enables robust zero-shot image classification and powers text-to-image conditioning.",
        "resources": [
            {"label": "Learning Transferable Visual Models From Natural Language Supervision (Radford et al., OpenAI)", "url": "https://arxiv.org/abs/2103.00020"},
            {"label": "OpenCLIP: Open-Source Reproductions of CLIP", "url": "https://github.com/mlfoundations/open_clip"},
            {"label": "OpenAI CLIP GitHub Repository", "url": "https://github.com/openai/CLIP"}
        ]
    },
    {
        "id": "llava-visual-instruction-tuning",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "multimodal;vlm;instruction-tuning",
        "title": "LLaVA: Visual Instruction Tuning",
        "description": "Connects a pre-trained vision encoder (CLIP ViT) with a language model decoder (Vicuna/Llama) using a linear or MLP projection matrix. Fine-tunes the system end-to-end on multimodal instruction-following conversational datasets generated by GPT-4.",
        "resources": [
            {"label": "Visual Instruction Tuning (Liu et al., NeurIPS)", "url": "https://arxiv.org/abs/2304.08485"},
            {"label": "LLaVA-1.5: Improved Baselines with Visual Instruction Tuning", "url": "https://arxiv.org/abs/2310.03744"},
            {"label": "LLaVA Official GitHub Implementation", "url": "https://github.com/haotian-liu/LLaVA"}
        ]
    },
    {
        "id": "neural-radiance-fields-nerf",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "3d-vision;neural-rendering;computer-vision",
        "title": "Neural Radiance Fields (NeRF)",
        "description": "Synthesizes novel 3D views of complex scenes by querying a continuous volumetric 5D function (spatial location and viewing direction) parameterized by an MLP, rendering novel perspectives via differentiable volume rendering.",
        "resources": [
            {"label": "NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis (Mildenhall et al.)", "url": "https://arxiv.org/abs/2003.08934"},
            {"label": "Instant Neural Graphics Primitives with a Multiresolution Hash Encoding (Müller et al., NVIDIA)", "url": "https://arxiv.org/abs/2201.05989"},
            {"label": "Nerfstudio Documentation", "url": "https://docs.nerf.studio/"}
        ]
    },
    {
        "id": "3d-gaussian-splatting",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "3d-vision;computer-graphics;real-time",
        "title": "3D Gaussian Splatting for Real-Time Radiance Field Rendering",
        "description": "Represents 3D scenes as millions of anisotropic 3D Gaussians optimized via differentiable tile-based rasterization. It delivers NeRF-quality visual fidelity while executing real-time 100+ FPS rendering on standard GPUs.",
        "resources": [
            {"label": "3D Gaussian Splatting for Real-Time Radiance Field Rendering (Kerbl et al., SIGGRAPH)", "url": "https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/"},
            {"label": "Gaussian Splatting Paper (arXiv)", "url": "https://arxiv.org/abs/2308.04079"},
            {"label": "Nerfstudio 3DGS Documentation", "url": "https://docs.nerf.studio/nerfology/methods/gaussian_splatting.html"}
        ]
    },

    # 9. Model Compression, Distillation & Representation
    {
        "id": "knowledge-distillation-teacher-student",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "model-compression;distillation;deep-learning",
        "title": "Knowledge Distillation & Dark Knowledge Transfer",
        "description": "Compresses large ensemble or teacher models into compact student models by training the student on the softened logit probability distributions (temperature-scaled softmax) of the teacher alongside ground truth labels.",
        "resources": [
            {"label": "Distilling the Knowledge in a Neural Network (Hinton, Vinyals, Dean, 2015)", "url": "https://arxiv.org/abs/1503.02531"},
            {"label": "DistilBERT: A Distilled Version of BERT (Sanh et al.)", "url": "https://arxiv.org/abs/1910.01108"},
            {"label": "PyTorch Knowledge Distillation Tutorial", "url": "https://pytorch.org/tutorials/beginner/knowledge_distillation_tutorial.html"}
        ]
    },
    {
        "id": "word2vec-skipgram-negative-sampling",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "nlp;embeddings;representation-learning",
        "title": "Word2Vec Skip-Gram with Negative Sampling (SGNS)",
        "description": "Learns dense geometric word vector embeddings by training a shallow two-layer network to maximize the log-probability of target context words while minimizing that of k noise-sampled negative words, revealing semantic linear vector arithmetic.",
        "resources": [
            {"label": "Distributed Representations of Words and Phrases and their Compositionality (Mikolov et al.)", "url": "https://arxiv.org/abs/1310.4546"},
            {"label": "Word2Vec Explained: Deriving Mikolov et al.'s Negative-Sampling", "url": "https://arxiv.org/abs/1402.3722"},
            {"label": "The Illustrated Word2Vec (Jay Alammar)", "url": "https://jalammar.github.io/illustrated-word2vec/"}
        ]
    },
    {
        "id": "contrastive-representation-learning-simclr",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "self-supervised-learning;computer-vision;representation",
        "title": "SimCLR: Contrastive Self-Supervised Representation Learning",
        "description": "Learns visual representations without human labels by maximizing agreement between differently augmented views (random cropping, color jitter, Gaussian blur) of the same image via normalized temperature-scaled cross-entropy loss (NT-Xent).",
        "resources": [
            {"label": "A Simple Framework for Contrastive Learning of Visual Representations (Chen et al., Google)", "url": "https://arxiv.org/abs/2002.05709"},
            {"label": "Momentum Contrast for Unsupervised Visual Representation Learning (MoCo, He et al.)", "url": "https://arxiv.org/abs/1911.05722"},
            {"label": "PyTorch Lightning SimCLR Tutorial", "url": "https://lightning.ai/docs/pytorch/stable/notebooks/course_UvA-DL/13-contrastive-learning.html"}
        ]
    },
    {
        "id": "masked-autoencoders-mae",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "self-supervised-learning;vision;transformers",
        "title": "Masked Autoencoders (MAE) Are Scalable Vision Learners",
        "description": "Masks out a high proportion (75%) of random image patches, processes only the remaining unmasked patches through an asymmetric Vision Transformer encoder, and trains a lightweight decoder to reconstruct the missing pixels in pixel space.",
        "resources": [
            {"label": "Masked Autoencoders Are Scalable Vision Learners (He et al., Meta)", "url": "https://arxiv.org/abs/2111.06377"},
            {"label": "Meta Research MAE GitHub", "url": "https://github.com/facebookresearch/mae"},
            {"label": "Hugging Face ViT-MAE Docs", "url": "https://huggingface.co/docs/transformers/model_doc/vit_mae"}
        ]
    },

    # 10. Foundation Model Scaling, Theory & Safety
    {
        "id": "chinchilla-compute-optimal-scaling-laws",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "scaling-laws;pre-training;llms",
        "title": "Chinchilla Scaling Laws for Compute-Optimal Pre-Training",
        "description": "Demonstrates through extensive empirical training runs that for compute-optimal training, model parameter size and training token volume should be scaled in equal proportion, proving early LLMs were significantly undertrained relative to their capacity.",
        "resources": [
            {"label": "Training Compute-Optimal Large Language Models (Hoffmann et al., DeepMind)", "url": "https://arxiv.org/abs/2203.15556"},
            {"label": "Scaling Laws for Neural Language Models (Kaplan et al., OpenAI)", "url": "https://arxiv.org/abs/2001.08361"},
            {"label": "LessWrong Analysis of Chinchilla Scaling", "url": "https://www.lesswrong.com/posts/6Fpvch8RR2qiKotC4/chinchilla-s-wild-implications"}
        ]
    },
    {
        "id": "emergent-abilities-and-grokking",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "theory;deep-learning;scaling",
        "title": "Grokking & Phase Transitions in Generalization",
        "description": "Analyzes the phenomenon where overparameterized neural networks achieve zero training loss quickly through memorization but suddenly transition to perfect validation generalization hundreds of thousands of epochs later as weight decay smooths internal representations.",
        "resources": [
            {"label": "Grokking: Generalization Beyond Overfitting on Small Algorithmic Datasets (Power et al., OpenAI)", "url": "https://arxiv.org/abs/2201.02177"},
            {"label": "Progress Measures for Grokking via Mechanistic Interpretability (Nanda et al.)", "url": "https://arxiv.org/abs/2301.05217"},
            {"label": "Are Emergent Abilities of LLMs a Mirage? (Schaeffer et al., NeurIPS)", "url": "https://arxiv.org/abs/2304.15004"}
        ]
    },
    {
        "id": "mechanistic-interpretability-induction-heads",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "interpretability;ai-safety;mechanistic-analysis",
        "title": "Mechanistic Interpretability & Induction Heads",
        "description": "Reverse-engineers neural networks into discrete human-interpretable computational circuits. Induction heads are two-layer attention circuits that search for previous token occurrences and copy their successors, underpinning in-context learning.",
        "resources": [
            {"label": "In-context Learning and Induction Heads (Anthropic, 2022)", "url": "https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html"},
            {"label": "TransformerLens Library for Mechanistic Interpretability", "url": "https://github.com/neelnanda-io/TransformerLens"},
            {"label": "A Mathematical Framework for Transformer Circuits (Elhage et al.)", "url": "https://transformer-circuits.pub/2021/framework/index.html"}
        ]
    },

    # 11. Autonomous Agents & Tool Use
    {
        "id": "react-reasoning-and-acting",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "agents;prompting;tool-use",
        "title": "ReAct: Synergizing Reasoning and Acting in Language Models",
        "description": "Interleaves dynamic chain-of-thought verbal reasoning traces with domain-specific tool execution actions (APIs, search engines). The interleaved feedback loop allows models to self-correct hallucinated trajectories using external environment observations.",
        "resources": [
            {"label": "ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al., ICLR)", "url": "https://arxiv.org/abs/2210.03629"},
            {"label": "LangChain ReAct Agent Documentation", "url": "https://python.langchain.com/docs/modules/agents/agent_types/react/"},
            {"label": "LlamaIndex ReAct Agent Implementation", "url": "https://docs.llamaindex.ai/en/stable/examples/agent/react_agent/"}
        ]
    },
    {
        "id": "tree-of-thoughts-prompting",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "prompting;reasoning;agents",
        "title": "Tree of Thoughts (ToT) Problem Solving",
        "description": "Generalizes Chain-of-Thought prompting by enabling language models to explore coherent intermediate reasoning units (thoughts) over tree search graphs with systematic BFS/DFS lookahead exploration and self-evaluation heuristics.",
        "resources": [
            {"label": "Tree of Thoughts: Deliberate Problem Solving with Large Language Models (Yao et al.)", "url": "https://arxiv.org/abs/2305.10601"},
            {"label": "Tree-of-Thoughts Official GitHub", "url": "https://github.com/princeton-nlp/tree-of-thought-llm"},
            {"label": "Prompt Engineering Guide: Tree of Thoughts", "url": "https://www.promptingguide.ai/techniques/tot"}
        ]
    },
    {
        "id": "function-calling-json-mode-constrained-decoding",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "tool-use;structured-outputs;decoding",
        "title": "Function Calling & Constrained Grammar Decoding",
        "description": "Enforces strict JSON schema compliance during token generation by masking out invalid next-token logits that violate Context-Free Grammar (CFG) or regex transition states at every autoregressive decoding step.",
        "resources": [
            {"label": "Grammar-Constrained Decoding with Outlines (Dott et al.)", "url": "https://github.com/outlines-dev/outlines"},
            {"label": "Guidance: Controlled LLM Generation (Microsoft)", "url": "https://github.com/guidance-ai/guidance"},
            {"label": "OpenAI Structured Outputs Guide", "url": "https://platform.openai.com/docs/guides/structured-outputs"}
        ]
    },

    # 12. Distributed Training & Systems
    {
        "id": "fully-sharded-data-parallel-fsdp",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "distributed-training;pytorch;deep-learning",
        "title": "Fully Sharded Data Parallelism (FSDP) & ZeRO-3",
        "description": "Eliminates memory redundancy across GPU clusters by sharding model parameters, gradients, and optimizer states across worker ranks. Layers are dynamically gathered via all-gather primitives right before forward/backward passes and instantly freed afterward.",
        "resources": [
            {"label": "ZeRO: Memory Optimizations Toward Training Trillion Parameter Models (Rajbhandari et al., DeepSpeed)", "url": "https://arxiv.org/abs/1910.02054"},
            {"label": "PyTorch FSDP Official Documentation", "url": "https://pytorch.org/docs/stable/fsdp.html"},
            {"label": "Hugging Face Accelerate with FSDP Tutorial", "url": "https://huggingface.co/docs/accelerate/usage_guides/fsdp"}
        ]
    },
    {
        "id": "tensor-parallelism-megatron-lm",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "distributed-training;cuda;scaling",
        "title": "Megatron-LM Tensor Parallelism",
        "description": "Splits individual linear projection matrix multiplications in multi-head attention and feed-forward blocks across multiple intra-node GPUs using column-parallel and row-parallel decomposition. Synchronizes intermediate outputs via minimal all-reduce communications.",
        "resources": [
            {"label": "Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism (Shoeybi et al., NVIDIA)", "url": "https://arxiv.org/abs/1909.08053"},
            {"label": "Reducing Activation Recomputation in Large Transformer Models (Korthikanti et al.)", "url": "https://arxiv.org/abs/2205.05198"},
            {"label": "NVIDIA Megatron-LM GitHub Repository", "url": "https://github.com/NVIDIA/Megatron-LM"}
        ]
    },
    {
        "id": "pipeline-parallelism-and-1f1b-scheduling",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "distributed-training;systems-ml;deep-learning",
        "title": "Pipeline Parallelism & 1F1B Scheduling",
        "description": "Partitions consecutive layers of a massive model across a sequence of GPU devices and executes training over micro-batches. The One-Forward-One-Backward (1F1B) schedule minimizes memory consumption by pairing backward computations with newly incoming forward passes.",
        "resources": [
            {"label": "GPipe: Efficient Training of Giant Neural Networks using Pipeline Parallelism (Huang et al., Google)", "url": "https://arxiv.org/abs/1811.06965"},
            {"label": "PipeDream: Generalized Pipeline Parallelism for DNN Training (Narayanan et al.)", "url": "https://arxiv.org/abs/1906.00707"},
            {"label": "PyTorch Pipeline Parallelism (PiPPy)", "url": "https://github.com/pytorch/PiPPy"}
        ]
    },

    # 13. Data Engineering & Synthetic Generation
    {
        "id": "deduplication-minhash-lsh-for-llm-data",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "data-engineering;pre-training;algorithms",
        "title": "MinHash LSH for Large-Scale Corpus Deduplication",
        "description": "Applies Locality Sensitive Hashing (LSH) over Jaccard similarity matrices of token n-grams to identify and purge near-duplicate web documents from multi-terabyte pre-training datasets, drastically reducing model memorization and compute waste.",
        "resources": [
            {"label": "Deduplicating Training Data Makes Language Models Better (Lee et al.)", "url": "https://arxiv.org/abs/2107.06499"},
            {"label": "FineWeb Dataset Curation & Filtering Recipe (Hugging Face)", "url": "https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-p2"},
            {"label": "Datasketch: MinHash in Python", "url": "https://ekzhu.com/datasketch/minhash.html"}
        ]
    },
    {
        "id": "synthetic-data-generation-evol-instruct",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "synthetic-data;instruction-tuning;data-engine",
        "title": "Evol-Instruct: Automated Synthetic Instruction Evolution",
        "description": "Iteratively expands the complexity, difficulty, and breadth of raw prompt instructions using structured evolutionary mutations (deepening constraints, concretizing abstractions, multi-step reasoning) guided by frontier LLMs to create high-quality fine-tuning corpora.",
        "resources": [
            {"label": "WizardLM: Empowering Large Language Models to Follow Complex Instructions (Xu et al.)", "url": "https://arxiv.org/abs/2304.12244"},
            {"label": "Textbooks Are All You Need (Phi-1 / Phi-2, Microsoft)", "url": "https://arxiv.org/abs/2306.11644"},
            {"label": "Argilla Distilabel Synthetic Data Pipeline", "url": "https://distilabel.argilla.io/"}
        ]
    },

    # 14. Evaluation & Metrics
    {
        "id": "llm-as-a-judge-evaluations",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "evaluation;benchmarks;alignment",
        "title": "LLM-as-a-Judge Evaluation Frameworks",
        "description": "Leverages powerful frontier models with structured rubrics, pairwise position-swapping, and reference solutions to evaluate open-ended model answers, achieving high correlation with human expert judges at a fraction of manual annotation costs.",
        "resources": [
            {"label": "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena (Zheng et al., LMSYS)", "url": "https://arxiv.org/abs/2306.05685"},
            {"label": "LMSYS Chatbot Arena Leaderboard", "url": "https://chat.lmsys.org/"},
            {"label": "OpenAI Evals Framework", "url": "https://github.com/openai/evals"}
        ]
    },
    {
        "id": "hallucination-mitigation-and-rag-triad",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "rag;evaluation;hallucinations",
        "title": "The RAG Triad: Context Relevance, Groundedness & Answer Relevance",
        "description": "A formal evaluation methodology that breaks down RAG hallucinations into three measurable orthogonal axes: whether the retrieved context contains relevant info, whether the model answer is strictly grounded in that context, and whether it directly satisfies user intent.",
        "resources": [
            {"label": "TruLens: The RAG Triad for LLM Quality", "url": "https://www.trulens.org/trulens_eval/core_concepts_rag_triad/"},
            {"label": "Ragas: Automated Evaluation of Retrieval Augmented Generation", "url": "https://arxiv.org/abs/2309.15217"},
            {"label": "A Survey on Hallucination in Large Language Models (Huang et al.)", "url": "https://arxiv.org/abs/2309.01219"}
        ]
    },
    {
        "id": "cross-entropy-and-perplexity",
        "group_name": "tech",
        "category": "ai-ml",
        "tags": "information-theory;loss-functions;nlp",
        "title": "Cross-Entropy Loss, Negative Log-Likelihood & Perplexity",
        "description": "The fundamental mathematical metrics for training and benchmarking language models. Perplexity is the exponentiated cross-entropy loss representing the effective branching factor of uncertain candidate tokens predicted by the model.",
        "resources": [
            {"label": "Hugging Face Perplexity of Fixed-Length Models Guide", "url": "https://huggingface.co/docs/transformers/perplexity"},
            {"label": "Stanford CS224N: Language Models and Training Objectives", "url": "https://web.stanford.edu/class/cs224n/"},
            {"label": "Deep Learning Book: Probability and Information Theory (Goodfellow et al.)", "url": "https://www.deeplearningbook.org/contents/prob.html"}
        ]
    }
]

os.makedirs('seeds', exist_ok=True)
csv_filepath = os.path.join('seeds', 'topics_tech_ai_ml.csv')

with open(csv_filepath, mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(['id', 'group_name', 'category', 'tags', 'title', 'description', 'resources'])
    
    for t in topics:
        writer.writerow([
            t['id'],
            t['group_name'],
            t['category'],
            t['tags'],
            t['title'],
            t['description'],
            json.dumps(t['resources'], ensure_ascii=False)
        ])

print(f"Generated {len(topics)} topics successfully at {csv_filepath}")
