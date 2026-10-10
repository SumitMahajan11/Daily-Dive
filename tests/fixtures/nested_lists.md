# Distributed Consensus Protocols

Modern distributed systems rely on consensus protocols to ensure fault-tolerant agreement across replicas:

- Core Consensus Models
  - Paxos Family
    - Multi-Paxos for replicated log state machines
    - Egalitarian Paxos for leaderless latency minimization
  - Raft Protocol
    - Leader election with randomized timeouts
    - Strict log replication invariants
- Quorum Intersections
  - Majority quorums require strictly greater than half the voting cluster
  - Read-write quorums ensure overlap under transient network partitions
