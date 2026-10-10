# Stage 1 - Foundation
**Layer 1** focuses on core database models and state machine persistence. It provides the atomic transaction guarantees needed for local storage operations.
Note: For further migration context see DECISIONS_LOG.md.

# Stage 2 - Structural Backbone
**Layer 2**: Implements reactive context streaming and invariant verification across client stores. This ensures every view derives from one unified selector layer.

# Stage 3 - Understanding Layer
Synthesizes local micro-learning concepts into spaced repetition intervals and learning telemetry. Topics are surfaced through deterministic review schedules.

## Internal Build-and-Test Order
Note: internal build order must follow dependency graph. See DECISIONS_LOG.md for architectural sign-off details.
