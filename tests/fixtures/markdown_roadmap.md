# Stage 1 — Foundation
**Layer 1** (Ingestion): GitHub link → clone → filter junk → clean file tree.
Note: For further migration context see DECISIONS_LOG.md.

# Stage 2 — Structural Backbone
**Layer 2** (AST / Symbol Graph): parse functions, classes, imports → cross-file dependency graph.

# Stage 3 — Understanding Layer
**Layer 3** (Summarization / Semantic Search): chunk files → generate embeddings → summarize modules.

# Stage 4 — Interaction & Reasoning
**Layer 4** (Q&A / Trace Engine): interactive architecture queries → step-by-step control flow tracing.

## Internal Build-and-Test Order
Note: internal build order must follow dependency graph. See DECISIONS_LOG.md for architectural sign-off details.
