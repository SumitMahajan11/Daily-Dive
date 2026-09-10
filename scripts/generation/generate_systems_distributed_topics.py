import csv
import json
import os

topics = [
    # =========================================================================
    # 1. Memory Consistency Models
    # =========================================================================
    {
        "id": "sequential-consistency-lamport",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "memory-consistency;distributed-systems;concurrency;theory",
        "title": "Sequential Consistency & Interleaved Execution Order",
        "description": "Sequential consistency requires that the result of any execution is the same as if the operations of all processors were executed in some sequential order, and the operations of each individual processor appear in this sequence in the order specified by its program. It establishes a global interleaving of operations without requiring synchronization to physical real-time clocks.",
        "resources": [
            {"label": "Leslie Lamport: How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs (IEEE TC 1979)", "url": "https://www.microsoft.com/en-us/research/publication/make-multiprocessor-computer-correctly-executes-multiprocess-programs/"},
            {"label": "Stanford CS240: Memory Consistency and Cache Coherence Notes", "url": "https://web.stanford.edu/class/cs240/readings/consistency-coherence.pdf"},
            {"label": "Jepsen: Sequential Consistency Analysis & Model Definition", "url": "https://jepsen.io/consistency/models/sequential"}
        ]
    },
    {
        "id": "linearizability-and-atomic-registers",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "linearizability;atomic-consistency;distributed-systems;formal-methods",
        "title": "Linearizability: Real-Time Precedence & Atomic Registers",
        "description": "Linearizability is a strict composable consistency model where every operation appears to take effect instantaneously at a discrete linearization point between its invocation and its response. Unlike sequential consistency, linearizability enforces real-time precedence: if operation B begins after operation A completes in absolute physical time, B must observe the effects of A.",
        "resources": [
            {"label": "Maurice Herlihy & Jeannette Wing: Linearizability: A Correctness Condition for Concurrent Objects (ACM TOPLAS 1990)", "url": "https://cs.brown.edu/~mph/HerlihyW90/p463-herlihy.pdf"},
            {"label": "Jepsen: Linearizability Model Verification & Formal Bounds", "url": "https://jepsen.io/consistency/models/linearizable"},
            {"label": "Martin Kleppmann: Linearizability Versus Serializability (Designing Data-Intensive Applications)", "url": "https://martin.kleppmann.com/2014/10/25/hermitage-testing-database-transaction-isolation.html"}
        ]
    },
    {
        "id": "eventual-consistency-and-session-guarantees",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "eventual-consistency;session-guarantees;distributed-storage;replication",
        "title": "Eventual Consistency & Client-Centric Session Guarantees",
        "description": "Eventual consistency guarantees that all replicas will converge to identical state if no new updates are made, but provides no bounds on stale reads during active writes. To prevent user-facing anomalies, systems overlay client-centric session guarantees including Read-Your-Writes, Monotonic Reads, Monotonic Writes, and Writes-Follow-Reads.",
        "resources": [
            {"label": "Werner Vogels: Eventually Consistent (ACM Queue / CACM 2008)", "url": "https://queue.acm.org/detail.cfm?id=1466448"},
            {"label": "Douglas Terry et al.: Session Guarantees for Weakly Consistent Replicated Data (Pdis 1994)", "url": "https://www.cs.utexas.edu/~lorenzo/corsi/cs380d/papers/session_guarantees.pdf"},
            {"label": "AWS DynamoDB: Read Consistency Architecture & Eventually Consistent Reads", "url": "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html"}
        ]
    },
    {
        "id": "causal-consistency-and-dependency-tracking",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "causal-consistency;dependency-tracking;distributed-systems;ordering",
        "title": "Causal Consistency: Potential Causality & Dependency Tracking",
        "description": "Causal consistency ensures that operations causally related by happened-before dependencies are observed in identical order across all nodes, while concurrent operations without causal relationships may be observed in differing orders. It represents the strongest theoretically achievable consistency model in a distributed system that remains available under complete network partitions.",
        "resources": [
            {"label": "Mahadev Satyanarayanan & Mustaque Ahamad: Causal Memory: Definitions, Implementation, and Programming (DistComp 1995)", "url": "https://link.springer.com/article/10.1007/BF01784241"},
            {"label": "Wyatt Lloyd et al.: Don't Settle for Eventual: Scalable Causal Consistency with COPS (SOSP 2011)", "url": "https://www.cs.cmu.edu/~dga/papers/cops-sosp2011.pdf"},
            {"label": "Jepsen: Causal Consistency Formal Specification", "url": "https://jepsen.io/consistency/models/causal"}
        ]
    },
    {
        "id": "hardware-memory-models-tso-vs-weak",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "memory-models;hardware-architecture;concurrency;x86;arm",
        "title": "Hardware Memory Models: Total Store Order (TSO) vs Weak Ordering",
        "description": "Hardware architectures enforce differing memory models; x86 employs Total Store Order (TSO), allowing Store-Load reordering due to store buffers while preserving Store-Store and Load-Load order. In contrast, ARM and POWER architectures implement weak memory ordering, permitting aggressive out-of-order execution across loads and stores unless constrained by explicit memory fences.",
        "resources": [
            {"label": "Peter Sewell et al.: x86-TSO: A Rigorous and Usable Programmer's Model for x86 Multiprocessors (CACM 2010)", "url": "https://www.cl.cam.ac.uk/~pes20/weakmemory/cacm.pdf"},
            {"label": "Arm Architecture Reference Manual: Memory Model Overview & Ordering Rules", "url": "https://developer.arm.com/documentation/den0024/a/Memory-Ordering"},
            {"label": "Paul McKenney: Memory Barriers: a Hardware View for Software Hackers (Linux Kernel Documentation)", "url": "https://www.kernel.org/doc/Documentation/memory-barriers.txt"}
        ]
    },
    {
        "id": "release-consistency-and-acquire-release-semantics",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "memory-models;release-consistency;synchronization;atomics",
        "title": "Release Consistency & Acquire-Release Synchronization Barriers",
        "description": "Release consistency divides memory access into synchronized and ordinary operations, enforcing ordering only at synchronization points using acquire and release operations. Acquire semantics guarantee that subsequent reads/writes cannot be reordered before the acquire, while release semantics guarantee that preceding reads/writes cannot be reordered after the release.",
        "resources": [
            {"label": "Kourosh Gharachorloo et al.: Memory Consistency and Event Ordering in Scalable Shared-Memory Multiprocessors (ISCA 1990)", "url": "https://dl.acm.org/doi/10.1145/325164.325102"},
            {"label": "Hans-J. Boehm & Sarita V. Adve: Foundations of the C++ Concurrency Memory Model (PLDI 2008)", "url": "https://www.hpl.hp.com/techreports/2008/HPL-2008-56.pdf"},
            {"label": "LLVM Documentation: Atomics & Memory Model Synchronization Semantics", "url": "https://llvm.org/docs/Atomics.html"}
        ]
    },

    # =========================================================================
    # 2. Cache Coherence Protocols
    # =========================================================================
    {
        "id": "mesi-cache-coherence-protocol",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "cache-coherence;mesi;cpu-architecture;hardware",
        "title": "MESI Protocol: State Transitions & Write-Invalidation Snooping",
        "description": "The MESI protocol maintains cache consistency across multi-core processors using four states: Modified, Exclusive, Shared, and Invalid. Cores broadcast invalidation messages over a shared bus upon writes to Shared lines, forcing remote caches to mark their copies invalid before the local core transitions the line to Modified.",
        "resources": [
            {"label": "Mark S. Papamarcos & Janak H. Patel: A Low-Overhead Coherence Solution for Multiprocessors with Private Cache Memories (ISCA 1984)", "url": "https://dl.acm.org/doi/10.1145/800015.808204"},
            {"label": "Ulrich Drepper: What Every Programmer Should Know About Memory (Section 3.3 Cache Coherence)", "url": "https://people.freebsd.org/~lstewart/articles/cpumemory.pdf"},
            {"label": "CMU 15-418: Snoop-Based Cache Coherence Lecture Notes", "url": "https://www.cs.cmu.edu/afs/cs/academic/class/15418-s18/www/lectures/08_coherence.pdf"}
        ]
    },
    {
        "id": "moesi-and-shared-dirty-states",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "cache-coherence;moesi;amd;cpu-architecture",
        "title": "MOESI Protocol: Owner State & Inter-Cache Dirty Sharing",
        "description": "The MOESI protocol extends MESI by introducing the Owner state, allowing a dirty cache line to be shared directly among multiple cores without writing it back to main memory first. The Owner cache assumes responsibility for eventual writeback to memory and responds to snoop reads from other cores with the modified data.",
        "resources": [
            {"label": "AMD64 Architecture Programmer's Manual, Volume 2: System Programming (Cache Coherence & MOESI)", "url": "https://www.amd.com/content/dam/amd/en/documents/processor-tech-docs/programmer-references/24593.pdf"},
            {"label": "David Wood et al.: Directory-Based and Snoop-Based MOESI Protocols (Synthesis Lectures on Computer Architecture)", "url": "https://www.morganclaypool.com/doi/abs/10.2200/S00366ED1V01Y201107CAC016"},
            {"label": "MIT 6.823: Advanced Cache Coherence & MOESI Transitions", "url": "https://ocw.mit.edu/courses/6-823-computer-system-architecture-fall-2005/resources/l13-cache-coherence/"}
        ]
    },
    {
        "id": "directory-based-cache-coherence-numa",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "cache-coherence;numa;directory-protocols;interconnect",
        "title": "Directory-Based Coherence for Non-Uniform Memory Access (NUMA)",
        "description": "In large multi-socket NUMA systems where broadcast bus snooping cannot scale, directory-based coherence tracks cache line residency using centralized or distributed directory bitmaps at memory controllers. When a core writes to a line, point-to-point invalidation messages are dispatched exclusively to nodes currently holding that line in their private caches.",
        "resources": [
            {"label": "Daniel Lenoski et al.: The Stanford DASH Multiprocessor (IEEE Computer 1992)", "url": "https://ieeexplore.ieee.org/document/125829"},
            {"label": "Intel Ultra Path Interconnect (UPI) Architecture Whitepaper", "url": "https://www.intel.com/content/www/us/en/developer/articles/technical/intel-xeon-processor-scalable-family-technical-overview.html"},
            {"label": "Sorin, Hill, & Wood: A Primer on Memory Consistency and Cache Coherence (Morgan & Claypool)", "url": "https://www.morganclaypool.com/doi/abs/10.2200/S00346ED1V01Y201104CAC016"}
        ]
    },
    {
        "id": "false-sharing-and-cache-line-ping-pong",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "performance;false-sharing;cache-line;multithreading",
        "title": "False Sharing, Cache Line Bouncing & Spatial Invalidation",
        "description": "False sharing occurs when distinct threads on separate CPU cores concurrently modify independent variables that reside within the same 64-byte cache line. Even without logical data races, each write invalidates the remote core's cache line, creating severe bus contention and performance degradation known as cache line bouncing.",
        "resources": [
            {"label": "Intel 64 and IA-32 Architectures Optimization Reference Manual: Avoiding False Sharing", "url": "https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html"},
            {"label": "Martin Thompson: False Sharing in High Performance Multithreading Systems (Mechanical Sympathy)", "url": "https://mechanical-sympathy.blogspot.com/2011/07/false-sharing.html"},
            {"label": "Linux Kernel perf Documentation: c2c (Cache-to-Cache) Contention Analysis", "url": "https://man7.org/linux/man-pages/man1/perf-c2c.1.html"}
        ]
    },
    {
        "id": "store-buffers-and-invalidation-queues",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "hardware;store-buffers;invalidation-queues;memory-barriers",
        "title": "Store Buffers, Invalidation Queues & Hardware Memory Barriers",
        "description": "Processors use store buffers to let execution continue immediately after write operations while cache line ownership is resolved over the bus. Paired with invalidation queues that defer processing incoming invalidation messages, these optimizations allow transient cross-core inconsistencies that necessitate explicit memory barrier instructions (`MFENCE`, `SFENCE`, `LFENCE`).",
        "resources": [
            {"label": "Paul E. McKenney: Memory Barriers: a Hardware View for Software Hackers", "url": "http://www.rdrop.com/users/paulmck/scalability/paper/whymb.2010.07.23a.pdf"},
            {"label": "Intel 64 Architecture Memory Ordering & Barrier Instructions Reference", "url": "https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html"},
            {"label": "Dmitry Vyukov: Hardware Memory Models & Store Buffer Hazards (1024cores)", "url": "http://www.1024cores.net/home/advanced-hardware/store-buffers"}
        ]
    },

    # =========================================================================
    # 3. RPC Design & Internals
    # =========================================================================
    {
        "id": "grpc-http2-framing-and-multiplexing",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "grpc;http2;multiplexing;rpc-internals;networking",
        "title": "gRPC HTTP/2 Transport: Multiplexing, Flow Control & Streams",
        "description": "gRPC leverages HTTP/2 binary framing to multiplex multiple concurrent bidirectional RPC calls over a single long-lived TCP connection using distinct Stream IDs. Flow control is maintained through credit-based `WINDOW_UPDATE` frames at both the individual stream level and the global connection level to prevent fast senders from exhausting receiver buffers.",
        "resources": [
            {"label": "RFC 7540: Hypertext Transfer Protocol Version 2 (HTTP/2 Framing & Flow Control)", "url": "https://datatracker.ietf.org/doc/html/rfc7540"},
            {"label": "gRPC Official Documentation: gRPC over HTTP/2 Protocol Specification", "url": "https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md"},
            {"label": "Google Cloud Architecture: HTTP/2 Flow Control and Multiplexing in gRPC", "url": "https://cloud.google.com/blog/products/api-management/understanding-grpc-http-2-flow-control"}
        ]
    },
    {
        "id": "protobuf-wire-format-encoding",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "protobuf;serialization;encoding;wire-format;performance",
        "title": "Protocol Buffers Wire Format: Varints, ZigZag & Tag-Length-Value",
        "description": "Protocol Buffers achieves compact binary serialization by encoding fields as key-value pairs where the key packs the field number and wire type using LEB128 varints. Negative integers use ZigZag encoding (`(n << 1) ^ (n >> 31)`) to map small negative numbers to small positive integers, minimizing byte overhead across the wire.",
        "resources": [
            {"label": "Protocol Buffers Official Documentation: Protocol Buffer Wire Format Encoding", "url": "https://protobuf.dev/programming-guides/encoding/"},
            {"label": "Google Developers: Protocol Buffers Design and Wire Format Architecture", "url": "https://developers.google.com/protocol-buffers"},
            {"label": "Martin Kleppmann: Data Encoding Formats Comparison (Designing Data-Intensive Applications)", "url": "https://dataintensive.net/"}
        ]
    },
    {
        "id": "apache-thrift-binary-vs-compact-protocol",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "thrift;serialization;rpc;cross-language;protocols",
        "title": "Apache Thrift Internals: TBinaryProtocol vs TCompactProtocol",
        "description": "Apache Thrift decouples interface definition from serialization protocol and transport mechanism. TBinaryProtocol encodes static field types and IDs followed by raw values, while TCompactProtocol applies variable-length delta integer encoding on field IDs and ZigZag varints to match Protobuf efficiency over framing layers like TFramedTransport.",
        "resources": [
            {"label": "Mark Slee et al.: Thrift: Scalable Cross-Language Services Framework (Facebook Whitepaper)", "url": "https://thrift.apache.org/static/files/thrift-20070401.pdf"},
            {"label": "Apache Thrift Official Documentation: Thrift Protocol Stack Specification", "url": "https://thrift.apache.org/docs/concepts"},
            {"label": "Apache Thrift GitHub: Compact Protocol Binary Format Specification", "url": "https://github.com/apache/thrift/blob/master/doc/specs/thrift-compact-protocol.md"}
        ]
    },
    {
        "id": "service-discovery-client-vs-server-side",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "service-discovery;load-balancing;networking;microservices",
        "title": "Service Discovery Patterns: Client-Side vs Server-Side Routing",
        "description": "Client-side service discovery queries a registry (Consul, Eureka, ZooKeeper) directly and performs local load balancing over resolved endpoints, eliminating intermediate network hops at the cost of language-specific client libraries. Server-side discovery routes traffic through an intermediate proxy or load balancer (AWS ALB, Kubernetes ClusterIP kube-proxy) that manages dynamic routing tables.",
        "resources": [
            {"label": "Chris Richardson: Microservices Pattern: Client-Side vs Server-Side Service Discovery", "url": "https://microservices.io/patterns/client-side-discovery.html"},
            {"label": "Netflix TechBlog: Eureka! Service Discovery in AWS Cloud", "url": "https://netflixtechblog.com/netflix-shares-cloud-load-balancing-and-failover-tool-eureka-c106b4cac09e"},
            {"label": "Kubernetes Official Documentation: DNS for Services and Pods", "url": "https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/"}
        ]
    },
    {
        "id": "envoy-xds-dynamic-control-plane",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "envoy;xds;service-mesh;control-plane;dynamic-routing",
        "title": "Envoy Dynamic Control Plane: The xDS Protocol (LDS, RDS, CDS, EDS)",
        "description": "Envoy's xDS protocol provides a dynamic configuration API that updates proxy routes without process restarts or traffic interruption. The control plane streams configuration changes asynchronously across Listener Discovery (LDS), Route Discovery (RDS), Cluster Discovery (CDS), and Endpoint Discovery (EDS) using state-of-the-world or incremental Delta xDS gRPC streams.",
        "resources": [
            {"label": "Envoy Proxy Official Documentation: xDS REST and gRPC Protocol Guide", "url": "https://www.envoyproxy.io/docs/envoy/latest/api-docs/xds_protocol"},
            {"label": "Matt Klein: Dynamic Configuration and the Envoy xDS Control Plane API", "url": "https://blog.envoyproxy.io/the-universal-data-plane-api-d130a7d3bbcd"},
            {"label": "CNCF Istio Architecture: Pilot to Envoy xDS Communication Flow", "url": "https://istio.io/latest/docs/ops/deployment/architecture/"}
        ]
    },
    {
        "id": "zero-copy-rpc-and-kernel-bypass",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "networking;zero-copy;io-uring;ebpf;kernel-bypass",
        "title": "High-Throughput RPC: Zero-Copy I/O & Kernel Bypass Networking",
        "description": "High-performance RPC engines eliminate CPU memory copy overhead between kernel network buffers and user-space memory using zero-copy primitives like Linux `splice`, `vmsplice`, and `io_uring` registered buffers. For ultra-low latency, kernel-bypass architectures like DPDK and RDMA transfer network frames directly to user memory via specialized NIC ring buffers.",
        "resources": [
            {"label": "Jens Axboe: Efficient IO with io_uring (Kernel.dk Technical Guide)", "url": "https://kernel.dk/io_uring.pdf"},
            {"label": "Anuj Kalia et al.: FaSST: Fast, Scalable and Simple Distributed Transactions with Two-Sided RDMA Datagrams (OSDI 2016)", "url": "https://www.usenix.org/conference/osdi16/technical-sessions/presentation/kalia"},
            {"label": "Linux Kernel Documentation: MSG_ZEROCOPY Network Interface", "url": "https://www.kernel.org/doc/html/latest/networking/msg_zerocopy.html"}
        ]
    },

    # =========================================================================
    # 4. Data Replication Strategies
    # =========================================================================
    {
        "id": "single-leader-replication-and-lag",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "replication;single-leader;replication-lag;databases",
        "title": "Single-Leader Replication: Write-Ahead Log Shipping & Replication Lag",
        "description": "In single-leader replication, all mutating queries execute on a designated leader, which streams changes to followers via physical Write-Ahead Log (WAL) shipping or logical row-based binary logs. While synchronous replication prevents data loss, asynchronous replication introduces replication lag anomalies such as stale reads and out-of-order event visibility.",
        "resources": [
            {"label": "PostgreSQL Official Documentation: Streaming Replication Internals & WAL Sender", "url": "https://www.postgresql.org/docs/current/warm-standby.html#STREAMING-REPLICATION"},
            {"label": "MySQL Official Documentation: Binary Log Replication Architecture & Row-Based Format", "url": "https://dev.mysql.com/doc/refman/8.0/en/replication-architecture.html"},
            {"label": "Martin Kleppmann: Problems with Replication Lag (Designing Data-Intensive Applications)", "url": "https://dataintensive.net/"}
        ]
    },
    {
        "id": "read-after-write-consistency-strategies",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "consistency;read-after-write;replication-lag;caching",
        "title": "Read-After-Write Consistency in Asynchronous Replicas",
        "description": "Read-after-write (read-your-writes) consistency guarantees that a user will immediately observe their own submitted mutations when querying the system. Implementations achieve this by routing reads for modified records to the leader for a specified time window, tracking user-specific commit Log Sequence Numbers (LSNs), or querying replicas only after verifying their replication watermark.",
        "resources": [
            {"label": "Douglas Terry et al.: Session Guarantees for Weakly Consistent Replicated Data (Pdis 1994)", "url": "https://www.cs.utexas.edu/~lorenzo/corsi/cs380d/papers/session_guarantees.pdf"},
            {"label": "Facebook Engineering: Scaling Memcache: Read-After-Write Consistency via Remote Markers", "url": "https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf"},
            {"label": "CockroachDB Docs: Follower Reads and Bounded Staleness Constraints", "url": "https://www.cockroachlabs.com/docs/stable/follower-reads"}
        ]
    },
    {
        "id": "multi-leader-replication-and-conflict-resolution",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "replication;multi-leader;conflict-resolution;multi-region",
        "title": "Multi-Leader Replication: Multi-Region Deployments & Conflict Resolution",
        "description": "Multi-leader replication allows writes across multiple distributed datacenters, reducing client write latency and tolerating full datacenter outages. Because concurrent writes to different leaders can produce conflicting modifications, systems employ strategies such as conflict avoidance via user pinning, Last-Write-Wins (LWW) with clock skew vulnerabilities, or application-level merge procedures.",
        "resources": [
            {"label": "Martin Kleppmann: Multi-Leader Replication Topology and Conflict Handling", "url": "https://dataintensive.net/"},
            {"label": "Amazon Aurora Multi-Master Architecture & Conflict Detection Documentation", "url": "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-multi-master.html"},
            {"label": "Sanjay Ghemawat et al.: Spanner: Google's Globally-Distributed Database (Section 4: Multi-Region Replication)", "url": "https://research.google/pubs/pub39966/"}
        ]
    },
    {
        "id": "dynamo-style-quorum-systems",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "dynamo;quorum;leaderless;replication;cassandra",
        "title": "Leaderless Replication: Dynamo Quorums & Configurable Consistency",
        "description": "Leaderless systems (Amazon Dynamo, Apache Cassandra) eliminate master nodes by sending client reads and writes concurrently to a replica set of size N. By configuring read quorum R and write quorum W such that R + W > N, the system ensures that the read set overlaps with the write set by at least one node containing the latest update version.",
        "resources": [
            {"label": "Giuseppe DeCandia et al.: Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)", "url": "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf"},
            {"label": "Apache Cassandra Documentation: How Cassandra Reads and Writes with Quorum Consistency", "url": "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html"},
            {"label": "Peter Bailis et al.: Probabilistically Bounded Staleness for Practical Partial Quorums (VLDB 2012)", "url": "https://vldb.org/pvldb/vol5/p776_peterbailis_vldb2012.pdf"}
        ]
    },
    {
        "id": "sloppy-quorums-and-hinted-handoff",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "sloppy-quorum;hinted-handoff;high-availability;fault-tolerance",
        "title": "Sloppy Quorums & Hinted Handoff: Partition-Tolerant Ingestion",
        "description": "During network partitions or node failures where a strict quorum cannot be reached among designated home replicas, sloppy quorums accept writes on alternative healthy nodes outside the key's primary replica set. The temporary node stores a local 'hint' and replays the mutation via hinted handoff once the original home replica recovers.",
        "resources": [
            {"label": "Amazon Dynamo Paper: Sloppy Quorums and Hinted Handoff (DeCandia et al., SOSP 2007)", "url": "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf"},
            {"label": "Apache Cassandra Documentation: Hinted Handoff Mechanism and Storage", "url": "https://cassandra.apache.org/doc/latest/cassandra/operating/hints.html"},
            {"label": "Riak KV Architecture Guide: Sloppy Quorums and Fallback Nodes", "url": "https://docs.riak.com/riak/kv/latest/learn/concepts/replication/index.html"}
        ]
    },
    {
        "id": "read-repair-vs-anti-entropy-merkle-trees",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "read-repair;anti-entropy;merkle-trees;data-synchronization",
        "title": "Anti-Entropy Systems: Synchronous Read Repair vs Merkle Tree Sync",
        "description": "Leaderless datastores maintain long-term replica convergence through two complementary mechanisms: opportunistic read repair (writing the latest value back to stale nodes detected during quorum reads) and active background anti-entropy. Background anti-entropy uses hierarchical Merkle trees to compare partition hash subtrees and stream only divergent ranges across nodes.",
        "resources": [
            {"label": "Apache Cassandra Documentation: Node Repair and Merkle Tree Anti-Entropy", "url": "https://cassandra.apache.org/doc/latest/cassandra/operating/repair.html"},
            {"label": "Ralph C. Merkle: A Digital Signature Based on a Conventional Encryption Function (CRYPTO 1987)", "url": "https://link.springer.com/chapter/10.1007/3-540-48184-2_32"},
            {"label": "Amazon Dynamo Paper (Section 4.6): Replica Synchronization Using Merkle Trees", "url": "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf"}
        ]
    },

    # =========================================================================
    # 5. Partitioning & Sharding
    # =========================================================================
    {
        "id": "consistent-hashing-virtual-nodes",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "consistent-hashing;sharding;virtual-nodes;load-balancing",
        "title": "Consistent Hashing with Virtual Nodes (Vnodes)",
        "description": "Consistent hashing maps both partition keys and storage nodes onto a circular 128-bit hash ring, ensuring that adding or removing a node reassigns only K/N keys on average. To avoid non-uniform key distribution and hotspotting, each physical node is assigned multiple virtual nodes (vnodes) scattered uniformly across the ring.",
        "resources": [
            {"label": "David Karger et al.: Consistent Hashing and Random Trees: Distributed Caching Protocols for Relieving Hot Spots on the World Wide Web (STOC 1997)", "url": "https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf"},
            {"label": "Apache Cassandra Documentation: Virtual Nodes Architecture and Allocation", "url": "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html#virtual-nodes"},
            {"label": "Discord Engineering Blog: How Discord Scaled Elixir to 5,000,000 Concurrent Users with Consistent Hashing", "url": "https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users"}
        ]
    },
    {
        "id": "range-partitioning-vs-hash-partitioning",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "partitioning;sharding;range-partitioning;hash-partitioning;databases",
        "title": "Range-Based vs Hash-Based Data Partitioning Strategies",
        "description": "Range partitioning divides sorted data into contiguous key ranges (tablets/splits), enabling efficient range scans and localized prefix queries at the risk of write hotspotting on sequentially increasing keys (like timestamps). Hash partitioning scrambles keys uniformly across partitions via cryptographic hashes, preventing write hotspots at the expense of scatter-gather range queries.",
        "resources": [
            {"label": "Fay Chang et al.: Bigtable: A Distributed Storage System for Structured Data (OSDI 2006)", "url": "https://research.google/pubs/pub27898/"},
            {"label": "CockroachDB Architecture: Range-Based Dynamic Splitting & Rebalancing", "url": "https://www.cockroachlabs.com/docs/stable/architecture/distribution-layer.html"},
            {"label": "Martin Kleppmann: Partitioning by Key Range vs Partitioning by Hash of Key (DDIA)", "url": "https://dataintensive.net/"}
        ]
    },
    {
        "id": "zero-downtime-online-resharding",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "resharding;online-migration;database-sharding;high-availability",
        "title": "Online Resharding & Partition Migration Without Downtime",
        "description": "Online resharding splits or migrates live partitions while serving continuous read/write traffic. The standard production workflow involves provisioning new shards, enabling asynchronous change data capture (CDC) or dual-writing to backfill historical and in-flight writes, validating consistency via checksum verifiers, and executing an atomic metadata pointer swap.",
        "resources": [
            {"label": "Vitess Documentation: Resharding Workflows & VReplication State Machine", "url": "https://vitess.io/docs/user-guides/migration/resharding/"},
            {"label": "Slack Engineering: Migrating Millions of Concurrent Users to New Shards with No Downtime", "url": "https://slack.engineering/migrating-millions-of-concurrent-users-to-new-shards-with-no-downtime/"},
            {"label": "Stripe Engineering: Online Migrations at Scale: Dual Writing and Verification", "url": "https://stripe.com/blog/online-migrations"}
        ]
    },
    {
        "id": "scatter-gather-query-routing",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "scatter-gather;distributed-queries;tail-latency;sharding",
        "title": "Scatter-Gather Query Execution & Tail Latency Amplification",
        "description": "Queries that do not include the shard routing key must be scattered to every individual partition in the cluster, gathered by a coordinator node, and merged/sorted before returning to the client. Because the slowest partition determines overall query response time (tail latency amplification), scatter-gather architectures require aggressive timeout budgets, early termination, and hedged requests.",
        "resources": [
            {"label": "Jeffrey Dean & Luiz André Barroso: The Tail at Scale (Communications of the ACM 2013)", "url": "https://cacm.acm.org/magazines/2013/2/160173-the-tail-at-scale/fulltext"},
            {"label": "Elasticsearch Guide: Search Phase Architecture (Query-Then-Fetch Scatter-Gather)", "url": "https://www.elastic.co/guide/en/elasticsearch/reference/current/search-your-data.html"},
            {"label": "CockroachDB: Distributed SQL Execution Engine & Vectorized Flow Routing", "url": "https://www.cockroachlabs.com/docs/stable/architecture/sql-layer.html"}
        ]
    },
    {
        "id": "secondary-indexes-document-vs-term-partitioned",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "secondary-indexes;indexing;sharding;distributed-databases",
        "title": "Distributed Secondary Indexes: Document-Partitioned vs Term-Partitioned",
        "description": "Document-partitioned (local) secondary indexes store index entries strictly within the partition holding the primary record, allowing fast, atomic local writes but requiring scatter-gather queries across all partitions for reads. Term-partitioned (global) secondary indexes partition the index itself by index key value, enabling single-partition reads but requiring cross-partition distributed transactions or asynchronous updates on writes.",
        "resources": [
            {"label": "Martin Kleppmann: Secondary Indexes and Partitioning (Designing Data-Intensive Applications)", "url": "https://dataintensive.net/"},
            {"label": "AWS DynamoDB Developer Guide: Global Secondary Indexes vs Local Secondary Indexes", "url": "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html"},
            {"label": "Apache Cassandra Documentation: Secondary Indexes vs Materialized Views", "url": "https://cassandra.apache.org/doc/latest/cassandra/developing/indexing/index.html"}
        ]
    },
    {
        "id": "database-sharding-middleware-vitess-citus",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "sharding;vitess;citus;distributed-sql;middleware",
        "title": "Relational Sharding Middleware: Vitess & Citus Architectures",
        "description": "Sharding middleware transparently transforms monolithic relational databases (MySQL/PostgreSQL) into distributed clusters. Vitess acts as a stateless query-parsing proxy (VTGate) that routes SQL to shard daemons (VTTablet) and manages distributed transactions, while Citus extends PostgreSQL internals to distribute tables and push down joins and aggregations directly to worker nodes.",
        "resources": [
            {"label": "Vitess Official Architecture & Component Model (VTGate, VTTablet, VTCtl)", "url": "https://vitess.io/docs/overview/architecture/"},
            {"label": "Marco Slot et al.: Citus: Distributed PostgreSQL for Multi-Tenant and Real-Time Analytics (SIGMOD 2017)", "url": "https://www.citusdata.com/blog/2017/05/17/citus-sigmod-paper/"},
            {"label": "GitHub Engineering: Partitioning GitHub's Main Database with Vitess", "url": "https://github.blog/2021-09-27-partitioning-githubs-relational-databases-with-vitess/"}
        ]
    },

    # =========================================================================
    # 6. Message Queue Semantics
    # =========================================================================
    {
        "id": "message-delivery-semantics-at-least-vs-exactly-once",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "message-queues;delivery-semantics;idempotency;kafka",
        "title": "Message Delivery Semantics: At-Most-Once, At-Least-Once & Exactly-Once",
        "description": "At-most-once delivery drops messages on network failure, while at-least-once retries delivery until acknowledged, risking duplicate processing on consumer crashes. True end-to-end exactly-once semantics cannot be achieved by transport layer guarantees alone; they require combining idempotent consumer state updates, deduplication storage, or atomic multi-partition producer transactions.",
        "resources": [
            {"label": "Neha Narkhede et al.: Exactly-once Semantics in Apache Kafka (Confluent Technical Whitepaper)", "url": "https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/"},
            {"label": "Pat Helland: Idempotence Is Not a Royal Road to Exactly-Once (ACM Queue 2020)", "url": "https://queue.acm.org/detail.cfm?id=3424304"},
            {"label": "RabbitMQ Documentation: Consumer Acknowledgements and Publisher Confirms", "url": "https://www.rabbitmq.com/docs/confirms"}
        ]
    },
    {
        "id": "kafka-log-storage-and-offset-internals",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "kafka;storage-internals;pagecache;zero-copy;commit-log",
        "title": "Kafka Commit Log Internals: Segment Indexes & Zero-Copy Sendfile",
        "description": "Kafka structures each partition as an append-only sequence of immutable segment files paired with memory-mapped `.index` and `.timeindex` files for O(1) offset-to-physical-byte binary lookups. By offloading caching entirely to the OS page cache and utilizing the `sendfile(2)` system call, Kafka streams disk buffers directly to network sockets without user-space buffer copies.",
        "resources": [
            {"label": "Jay Kreps et al.: Kafka: A Distributed Messaging System for Log Processing (NetDB 2011)", "url": "https://www.microsoft.com/en-us/research/wp-content/uploads/2017/09/Kafka.pdf"},
            {"label": "Apache Kafka Documentation: Design Principles & The Commit Log Architecture", "url": "https://kafka.apache.org/documentation/#design"},
            {"label": "Linux Kernel man-pages: sendfile(2) Transfer Between File Descriptors", "url": "https://man7.org/linux/man-pages/man2/sendfile.2.html"}
        ]
    },
    {
        "id": "kafka-log-compaction-mechanisms",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "kafka;log-compaction;event-sourcing;state-management",
        "title": "Kafka Log Compaction: Retaining Keyed State & Tombstone Deletion",
        "description": "Log compaction ensures Kafka retains at least the latest value for every message key within a partition, transforming logs into changelog snapshots for key-value stores. Background cleaner threads scan dirty segments and deduplicate keys into clean segments, while null payloads (tombstones) are preserved across a configurable retention window to signal record deletion to consumers.",
        "resources": [
            {"label": "Apache Kafka Documentation: Log Compaction Architecture & Cleaner Threads", "url": "https://kafka.apache.org/documentation/#compaction"},
            {"label": "Confluent Documentation: Stateful Stream Processing and Log Compaction in Kafka", "url": "https://docs.confluent.io/platform/current/kafka/design/log-compaction.html"},
            {"label": "Martin Kleppmann: Making Sense of Stream Processing with Kafka Compaction", "url": "https://www.oreilly.com/library/view/making-sense-of/9781491942437/"}
        ]
    },
    {
        "id": "backpressure-and-reactive-stream-protocols",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "backpressure;reactive-streams;flow-control;streaming",
        "title": "Backpressure Handling: Pull-Based Flow Control & Reactive Streams",
        "description": "Backpressure prevents fast upstream producers from overwhelming slower downstream consumers by propagating resource constraints backward through the pipeline. Reactive Streams standardize non-blocking backpressure through dynamic demand signaling (`Subscription.request(n)`), where consumers explicitly request batches they have capacity to process rather than buffering unboundedly.",
        "resources": [
            {"label": "Reactive Streams Specification for the JVM (GitHub Working Group)", "url": "https://github.com/reactive-streams/reactive-streams-jvm"},
            {"label": "Erik Meijer: Your Mouse is a Database (ACM Queue / Dualities of Rx & Reactive Streams)", "url": "https://queue.acm.org/detail.cfm?id=2169076"},
            {"label": "Akka Documentation: Backpressure and Stream Flow Control Internals", "url": "https://doc.akka.io/docs/akka/current/stream/stream-flows-and-basics.html#back-pressure-explained"}
        ]
    },
    {
        "id": "kafka-consumer-rebalancing-protocols",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "kafka;consumer-groups;rebalance;cooperative-sticky",
        "title": "Kafka Consumer Group Rebalancing: Eager vs Cooperative Sticky Protocols",
        "description": "Consumer groups balance partition assignments across instances through coordinator heartbeats and JoinGroup/SyncGroup sync phases. While legacy Eager rebalancing required all consumers to revoke their entire partition ownership during a rebalance ('stop-the-world'), the Cooperative Sticky Assignor revokes only reassigned partitions incrementally, allowing uninterrupted processing on unaffected streams.",
        "resources": [
            {"label": "KIP-429: Kafka Incremental Cooperative Rebalancing Protocol Specification", "url": "https://cwiki.apache.org/confluence/display/KAFKA/KIP-429%3A+Kafka+Consumer+Incremental+Rebalance+Protocol"},
            {"label": "Confluent Engineering Blog: Incremental Cooperative Rebalancing in Apache Kafka", "url": "https://www.confluent.io/blog/incremental-cooperative-rebalancing-in-kafka/"},
            {"label": "Apache Kafka Documentation: Consumer Group Coordination Internals", "url": "https://kafka.apache.org/documentation/#impl_consumergroup"}
        ]
    },
    {
        "id": "dead-letter-queues-and-poison-pill-handling",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "dlq;poison-pill;fault-tolerance;retry-topics;messaging",
        "title": "Poison Pill Handling: Dead-Letter Queues (DLQ) & Non-Blocking Retry Queues",
        "description": "A poison pill is a corrupted or unprocessable message that repeatedly crashes consumer logic, blocking head-of-line progress across an entire queue. Production architectures divert failing messages after exhausted retry attempts to Dead-Letter Queues (DLQ) or tiered exponential-backoff retry topics (retry-5s, retry-1m) without stalling healthy traffic.",
        "resources": [
            {"label": "Uber Engineering: Building Reliable Reprocessing and Dead Letter Queues with Apache Kafka", "url": "https://www.uber.com/blog/reliable-reprocessing/"},
            {"label": "AWS SQS Developer Guide: Dead-Letter Queues and Redrive Policies", "url": "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html"},
            {"label": "Martin Fowler: Dead Letter Channel Pattern in Enterprise Integration", "url": "https://www.enterpriseintegrationpatterns.com/patterns/messaging/DeadLetterChannel.html"}
        ]
    },

    # =========================================================================
    # 7. Clock Synchronization
    # =========================================================================
    {
        "id": "ntp-clock-skew-and-drift-anomalies",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "ntp;clock-skew;time-synchronization;distributed-clocks",
        "title": "NTP Clock Synchronization: Drift, Asymmetric Jitter & Monotonic Timers",
        "description": "Network Time Protocol (NTP) synchronizes computer clocks over packet-switched networks by estimating round-trip latency and clock offset. Due to quartz oscillator thermal drift and asymmetric network routing, NTP cannot guarantee tight error bounds, causing clock steps or slewing that can invert physical timestamps and break distributed ordering unless monotonic timers are strictly used for duration measurements.",
        "resources": [
            {"label": "RFC 5905: Network Time Protocol Version 4: Protocol and Algorithms Specification", "url": "https://datatracker.ietf.org/doc/html/rfc5905"},
            {"label": "David L. Mills: Computer Network Time Synchronization: The Network Time Protocol on Earth and in Space (CRC Press)", "url": "https://www.eecis.udel.edu/~mills/book.html"},
            {"label": "Martin Kleppmann: Unreliable Clocks in Distributed Systems (Designing Data-Intensive Applications)", "url": "https://dataintensive.net/"}
        ]
    },
    {
        "id": "lamport-logical-clocks-and-total-ordering",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "lamport-clocks;logical-time;happened-before;ordering",
        "title": "Lamport Logical Timestamps & Distributed Happened-Before Partial Order",
        "description": "Lamport logical clocks define a partial order of distributed events using the 'happened-before' relation (a -> b) without relying on physical time. Each process increments a monotonically increasing counter for local events and attaches the timestamp to outgoing messages; receivers advance their clock to max(local_clock, msg_clock) + 1, enabling consistent tie-breaking for total event ordering.",
        "resources": [
            {"label": "Leslie Lamport: Time, Clocks, and the Ordering of Events in a Distributed System (Communications of the ACM 1978)", "url": "https://lamport.azurewebsites.net/pubs/time-clocks.pdf"},
            {"label": "Stanford CS244B: Distributed Systems: Lamport Clocks and Total Ordering", "url": "https://cs244b.stanford.edu/"},
            {"label": "Martin Fowler: Lamport Clock Pattern in Distributed Systems", "url": "https://martinfowler.com/articles/patterns-of-distributed-systems/lamport-clock.html"}
        ]
    },
    {
        "id": "google-truetime-and-spanner-commit-wait",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "truetime;spanner;commit-wait;external-consistency;google",
        "title": "Google TrueTime & Cloud Spanner: Bounded Clock Uncertainty & Commit Wait",
        "description": "Google TrueTime API exposes physical time as a bounded interval [earliest, latest] with guaranteed uncertainty epsilon (typically < 7ms) maintained by synchronized GPS receivers and atomic clocks in every datacenter. Spanner uses this uncertainty bound to enforce the commit wait rule: a transaction leader delays releasing commit locks until 2*epsilon has elapsed, guaranteeing globally linearizable read-write transactions without cross-datacenter coordination.",
        "resources": [
            {"label": "James C. Corbett et al.: Spanner: Google's Globally-Distributed Database (OSDI 2012)", "url": "https://research.google/pubs/pub39966/"},
            {"label": "Google Cloud Whitepaper: Spanner, TrueTime and External Consistency", "url": "https://cloud.google.com/spanner/docs/true-time-external-consistency"},
            {"label": "Andy Pavlo: Google Spanner & TrueTime Architecture Lecture (CMU 15-721)", "url": "https://15721.courses.cs.cmu.edu/spring2023/slides/20-spanner.pdf"}
        ]
    },
    {
        "id": "hybrid-logical-clocks-cockroachdb",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "hlc;hybrid-logical-clocks;cockroachdb;causality;time",
        "title": "Hybrid Logical Clocks (HLC): Combining Physical Time with Causal Ordering",
        "description": "Hybrid Logical Clocks (HLC) merge physical timestamps with Lamport logical counters into a single 64-bit coordinate that tracks causal dependencies while staying tightly bound to physical wall time (|HLC.l - physical_time| <= max_offset). Databases like CockroachDB and MongoDB use HLCs to deliver distributed Multi-Version Concurrency Control (MVCC) without requiring specialized TrueTime atomic clock hardware.",
        "resources": [
            {"label": "Sandeep Kulkarni et al.: Logical Physical Clocks and Consistent Snapshots in Globally Distributed Databases (OPODIS 2014)", "url": "https://cse.buffalo.edu/tech-reports/2014-04.pdf"},
            {"label": "CockroachDB Docs: Living Without Atomic Clocks (Hybrid Logical Clock Implementation)", "url": "https://www.cockroachlabs.com/docs/stable/architecture/transaction-layer.html#hybrid-logical-clocks-hlc"},
            {"label": "MongoDB Architecture: Causally Consistent Sessions and Hybrid Logical Clocks", "url": "https://www.mongodb.com/docs/manual/core/read-isolation-consistency-recency/#causally-consistent-sessions"}
        ]
    },
    {
        "id": "vector-clock-concurrency-tradeoffs",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "vector-clocks;concurrency-detection;distributed-storage;dynamo",
        "title": "Practical Concurrency Tracking: Vector Clocks vs Version Vectors in Production",
        "description": "While scalar Lamport clocks detect ordering, vector clocks and version vectors distinguish between causal precedence and true concurrent modifications (divergent branches requiring sibling resolution). In production distributed key-value stores (Dynamo, Riak), vector clocks encounter state explosion as node counts grow, requiring size-capping heuristics and dot-based dotted version vectors.",
        "resources": [
            {"label": "Colin J. Fidge: Timestamps in Message-Passing Systems That Preserve the Partial Ordering (Australian Computer Science 1988)", "url": "https://link.springer.com/chapter/10.1007/978-3-642-88169-5_15"},
            {"label": "Nuno Preguiça et al.: Dotted Version Vectors: Logical Clocks for Optimistic Replication (SOCC 2014)", "url": "https://arxiv.org/abs/1011.5808"},
            {"label": "Basho Riak Documentation: Why Vector Clocks Are Hard and How Riak Uses Version Vectors", "url": "https://docs.riak.com/riak/kv/latest/learn/concepts/causal-context/index.html"}
        ]
    },

    # =========================================================================
    # 8. Microservice Resilience Patterns
    # =========================================================================
    {
        "id": "circuit-breaker-state-machine",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "resilience;circuit-breaker;fault-tolerance;microservices",
        "title": "Circuit Breaker Pattern: Closed, Open & Half-Open State Transitions",
        "description": "The Circuit Breaker pattern prevents cascading service failure by intercepting outbound RPC calls with an active finite state machine. When error rates exceed a configurable threshold within a sliding time window, the breaker trips from Closed to Open, immediately short-circuiting calls with fallback responses; after a sleep duration, it enters Half-Open to probe downstream recovery with canary requests.",
        "resources": [
            {"label": "Michael Nygard: Release It! Design and Deploy Production-Ready Software (Circuit Breaker Chapter)", "url": "https://pragprog.com/titles/mnee2/release-it-second-edition/"},
            {"label": "Martin Fowler: CircuitBreaker Architecture Pattern", "url": "https://martinfowler.com/bliki/CircuitBreaker.html"},
            {"label": "Netflix TechBlog: Making the Netflix API More Resilient with Hystrix / Resilience4j", "url": "https://netflixtechblog.com/fault-tolerance-in-a-high-volume-distributed-system-91ab4faae74a"}
        ]
    },
    {
        "id": "bulkhead-pattern-resource-isolation",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "bulkhead;resource-isolation;fault-isolation;thread-pools",
        "title": "Bulkhead Pattern: Thread Pool, Connection & Memory Isolation",
        "description": "Inspired by naval watertight hull compartments, the Bulkhead pattern partitions internal resources (thread pools, socket connection pools, worker queues) into isolated pools per dependency. If a downstream service slows down or becomes unresponsive, only its designated thread pool saturates, preventing cross-tenant starvation of healthy endpoints.",
        "resources": [
            {"label": "Microsoft Azure Architecture Center: Bulkhead Pattern", "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead"},
            {"label": "Michael Nygard: Release It! (Bulkheads for Failure Containment)", "url": "https://pragprog.com/titles/mnee2/release-it-second-edition/"},
            {"label": "Resilience4j Documentation: Bulkhead Configuration and Semaphore vs ThreadPool Isolation", "url": "https://resilience4j.readme.io/docs/bulkhead"}
        ]
    },
    {
        "id": "exponential-backoff-and-decorrelated-jitter",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "retries;jitter;exponential-backoff;thundering-herd;networking",
        "title": "Retry Strategies: Exponential Backoff & Decorrelated Jitter",
        "description": "Blind client retries after a partial outage create a thundering herd problem that repeatedly knocks recovering backends offline. Adding exponential backoff (base * 2^attempt) with decorrelated full jitter randomizes retry spacing across clients, spreading burst traffic evenly over time and preventing synchronized retry waves.",
        "resources": [
            {"label": "Marc Brooker (AWS Architecture Blog): Exponential Backoff And Jitter", "url": "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/"},
            {"label": "Google Cloud Architecture: Truncated Exponential Backoff Algorithm Guide", "url": "https://cloud.google.com/storage/docs/retry-strategy"},
            {"label": "Microsoft Architecture: Retry Pattern and Transient Fault Handling", "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/retry"}
        ]
    },
    {
        "id": "distributed-timeout-budgets-and-deadline-propagation",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "timeouts;deadline-propagation;grpc;distributed-tracing",
        "title": "Distributed Deadline Propagation & End-to-End Timeout Budgets",
        "description": "When an incoming request spans a deep microservice call tree, static per-hop timeouts cause wasted CPU processing on downstream nodes when the upstream caller has already timed out. Propagating remaining deadline budgets via context headers (such as gRPC's `grpc-timeout` or W3C Baggage) allows downstream services to abort immediately if their remaining budget is insufficient.",
        "resources": [
            {"label": "gRPC Documentation: Deadlines and Cancellation Propagation Across RPC Trees", "url": "https://grpc.io/docs/guides/deadlines/"},
            {"label": "Google Site Reliability Engineering (SRE) Book: Chapter 22 - Addressing Cascading Failures with Deadlines", "url": "https://sre.google/sre-book/addressing-cascading-failures/#deadlines"},
            {"label": "Marc Brooker: Timeouts, Deadlines, and Cancellation (Brooker's Blog)", "url": "https://brooker.co.za/blog/2021/04/19/timeouts.html"}
        ]
    },
    {
        "id": "load-shedding-and-adaptive-concurrency-limits",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "load-shedding;concurrency-limits;littles-law;capacity-planning",
        "title": "Load Shedding & Adaptive Concurrency Limits: Little's Law in Overload",
        "description": "When server queues grow past peak throughput capacity, response times spike while throughput collapses due to context switching and lock contention. Adaptive concurrency limits apply Little's Law (L = lambda * W) and TCP congestion control algorithms (Vegas, Gradient) to dynamically adjust max in-flight requests based on measured latency inflation, shedding excess traffic immediately with HTTP 429/503.",
        "resources": [
            {"label": "Netflix TechBlog: Performance Under Load: Adaptive Concurrency Limits", "url": "https://netflixtechblog.com/performance-under-load-3e6fe9a8d5ea"},
            {"label": "Uber Engineering: Load Shedding Strategies for High Availability Microservices", "url": "https://www.uber.com/blog/load-shedding/"},
            {"label": "AWS Builder's Library: Using Load Shedding to Avoid Overload", "url": "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/"}
        ]
    },
    {
        "id": "distributed-rate-limiting-token-bucket-vs-sliding-window",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "rate-limiting;token-bucket;sliding-window;redis-lua",
        "title": "Distributed Rate Limiting: Token Bucket vs Sliding Window Counters",
        "description": "Distributed rate limiting enforces quota governance across horizontal API gateways without central single-point bottlenecks. While Fixed Window counters suffer from burst spikes at boundary resets, Token Bucket algorithms support regulated bursts, and Redis-backed Sliding Window logs (via atomic Lua scripts or Generic Cell Rate Algorithms) provide precision enforcement across cluster nodes.",
        "resources": [
            {"label": "Stripe Engineering Blog: Scaling Your API with Rate Limiters (Token Bucket & Leaky Bucket)", "url": "https://stripe.com/blog/rate-limiters"},
            {"label": "Cloudflare Engineering: How We Built Rate Limiting Capable of Handling Billions of Requests", "url": "https://blog.cloudflare.com/counting-things-a-lot-of-different-things/"},
            {"label": "Figma Engineering: An Alternative Approach to Rate Limiting Using Redis", "url": "https://www.figma.com/blog/an-alternative-approach-to-rate-limiting/"}
        ]
    },

    # =========================================================================
    # 9. Quorum Systems & CAP/PACELC Tradeoffs in Practice
    # =========================================================================
    {
        "id": "pacelc-theorem-in-practice",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "pacelc;cap-theorem;distributed-tradeoffs;system-architecture",
        "title": "PACELC Theorem: Practical Consistency vs Latency Tradeoffs",
        "description": "Daniel Abadi's PACELC theorem expands the CAP theorem by stating that IF there is a Partition (P), how does a system trade Availability (A) vs Consistency (C); ELSE (E), when running normally without partitions, how does it trade Latency (L) vs Consistency (C). Real-world systems configure this tradeoff explicitly: Cassandra is PA/EL, MongoDB is PC/EC, and Spanner is PC/EC.",
        "resources": [
            {"label": "Daniel J. Abadi: Consistency Tradeoffs in Modern Distributed Database System Design (IEEE Computer 2012)", "url": "https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf"},
            {"label": "Daniel Abadi's Blog: Problems with CAP and the PACELC Formulation", "url": "http://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-pacelc.html"},
            {"label": "AWS Architecture: Understanding Consistency Models and PACELC in Amazon DynamoDB", "url": "https://aws.amazon.com/blogs/database/consistency-in-amazon-dynamodb/"}
        ]
    },
    {
        "id": "strict-vs-partial-quorums-tradeoffs",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "quorums;pbs;probabilistic-consistency;tail-latency",
        "title": "Strict Quorums (R + W > N) vs Probabilistically Bounded Staleness (PBS)",
        "description": "Strict quorum overlap (R + W > N) guarantees strong consistency but incurs high tail latency because operations must wait for the slowest member of the quorum to acknowledge. In high-throughput systems, relaxed partial quorums (such as R=1, W=1) achieve near-zero latency while Probabilistically Bounded Staleness (PBS) models quantify the statistical likelihood of stale reads over time delta t.",
        "resources": [
            {"label": "Peter Bailis et al.: Probabilistically Bounded Staleness for Practical Partial Quorums (VLDB 2012)", "url": "https://vldb.org/pvldb/vol5/p776_peterbailis_vldb2012.pdf"},
            {"label": "PBS Simulator & Metric Evaluation Toolkit (Peter Bailis, Berkeley)", "url": "http://pbs.cs.berkeley.edu/"},
            {"label": "Werner Vogels: Trade-offs in Distributed Systems Quorums (All Things Distributed)", "url": "https://www.allthingsdistributed.com/2007/12/eventually_consistent.html"}
        ]
    },
    {
        "id": "split-brain-prevention-fencing-tokens",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "split-brain;fencing-tokens;distributed-locks;consensus",
        "title": "Split-Brain Mitigation: Monotonic Fencing Tokens & Epoch Leases",
        "description": "When a network partition isolates a primary node, false failovers can promote a secondary leader while the original leader remains unaware, causing split-brain write corruption. Consensus systems prevent concurrent rogue writes by issuing monotonically increasing fencing tokens (epoch numbers) with distributed locks, causing storage layers to reject writes with outdated epochs.",
        "resources": [
            {"label": "Martin Kleppmann: How to do Distributed Locking (Why Fencing Tokens Are Mandatory)", "url": "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html"},
            {"label": "Mike Burrows: The Chubby Lock Service for Loosely-Coupled Distributed Systems (OSDI 2006)", "url": "https://research.google/pubs/pub27897/"},
            {"label": "Apache ZooKeeper Documentation: Ephemeral Nodes, Watches and Monotonic zxid Epochs", "url": "https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html"}
        ]
    },
    {
        "id": "distributed-locking-redlock-vs-consensus",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "distributed-locking;redlock;consensus;etcd;redis",
        "title": "Distributed Locks: Redis Redlock vs Consensus-Backed Leases (etcd/Chubby)",
        "description": "Redis Redlock attempts distributed mutual exclusion across N independent Redis nodes without a shared consensus protocol, relying on synchronized physical clock expiry. However, under unannounced GC pauses, hypervisor stalls, or clock jumps, non-consensus locks violate mutual exclusion, making strongly consistent consensus leases (etcd Raft leases, ZooKeeper ephemeral nodes) necessary for safety-critical resources.",
        "resources": [
            {"label": "Redis Official Documentation: The Redlock Algorithm Specification", "url": "https://redis.io/docs/manual/patterns/distributed-locks/"},
            {"label": "Martin Kleppmann: Is Redlock Safe? Analysis of Asynchronous Clocks and Failures", "url": "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html"},
            {"label": "etcd Official Documentation: Distributed Locking API and Lease TTL Mechanisms", "url": "https://etcd.io/docs/v3.5/learning/api_guarantees/#lock-apis"}
        ]
    },
    {
        "id": "cap-theorem-harvest-yield-tradeoffs",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "cap-theorem;harvest-and-yield;availability;graceful-degradation",
        "title": "Graceful Degradation: The Harvest and Yield Model for Availability",
        "description": "Fox and Brewer's Harvest and Yield model reframes distributed availability into two quantifiable metrics: Yield (fraction of requests completed successfully) and Harvest (fraction of complete data included in the response). Under partial cluster partition or overload, systems degrade gracefully by returning partial harvest (e.g. search results without secondary personalization) to preserve 100% yield.",
        "resources": [
            {"label": "Armando Fox & Eric A. Brewer: Harvest, Yield, and Scalable Tolerant Systems (HotOS 1999)", "url": "https://www.eecs.berkeley.edu/~brewer/papers/FoxBrewer99-HarvestYield.pdf"},
            {"label": "Eric Brewer: CAP Twelve Years Later: How the 'Rules' Have Changed (IEEE Computer 2012)", "url": "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/"},
            {"label": "Google SRE Book: Graceful Degradation and Result Shedding in Search Systems", "url": "https://sre.google/sre-book/handling-overload/"}
        ]
    },

    # =========================================================================
    # 10. Distributed Transactions Beyond 2PC
    # =========================================================================
    {
        "id": "saga-pattern-orchestration-vs-choreography",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "sagas;distributed-transactions;orchestration;choreography;microservices",
        "title": "Saga Pattern: Choreography vs Orchestration & Compensating Actions",
        "description": "The Saga pattern coordinates long-running distributed transactions as a series of distinct local transactions across microservices, where each transaction updates state and publishes an event to trigger the next step. If a step fails, the saga executes compensating transactions backward to revert prior updates, coordinated either via decentralized event choreography or centralized state machine orchestration.",
        "resources": [
            {"label": "Hector Garcia-Molina & Kenneth Salem: Sagas (ACM SIGMOD 1987)", "url": "https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf"},
            {"label": "Chris Richardson: Pattern: Saga (Microservices Architecture Patterns)", "url": "https://microservices.io/patterns/data/saga.html"},
            {"label": "Temporal.io Documentation: Distributed Saga Implementation and Workflow Durability", "url": "https://docs.temporal.io/workflows#saga-pattern"}
        ]
    },
    {
        "id": "transactional-outbox-and-cdc",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "outbox-pattern;cdc;debezium;dual-write;event-driven",
        "title": "Transactional Outbox Pattern & Change Data Capture (CDC)",
        "description": "Mutating a database and publishing to a message broker in separate application calls introduces fatal dual-write inconsistencies if either step crashes mid-flight. The Transactional Outbox pattern writes business state and an outbox message record atomically inside a single local ACID database transaction, while a background Change Data Capture (CDC) engine (such as Debezium) tails database transaction logs to stream events reliably to Kafka.",
        "resources": [
            {"label": "Chris Richardson: Pattern: Transactional Outbox (Microservices.io)", "url": "https://microservices.io/patterns/data/transactional-outbox.html"},
            {"label": "Debezium Official Documentation: Architecture & Transaction Log Mining Engine", "url": "https://debezium.io/documentation/reference/stable/architecture.html"},
            {"label": "Martin Kleppmann: Moving Beyond 2PC: Change Data Capture and Stream Processing (QCon)", "url": "https://www.infoq.com/presentations/stream-processing-cdc/"}
        ]
    },
    {
        "id": "idempotency-keys-in-financial-systems",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "idempotency;payments;api-design;distributed-systems",
        "title": "Idempotency Keys & Request Deduplication in Payment Gateways",
        "description": "In financial systems where network timeouts leave API call outcomes ambiguous, clients attach a unique Idempotency-Key header to mutating requests. The server acquires an atomic transactional lock on the key, executes processing if unobserved, and caches the final response in a deduplication datastore, guaranteeing that retried duplicate requests return identical responses without re-executing state transitions.",
        "resources": [
            {"label": "Stripe Engineering Blog: Designing Robust and Idempotent APIs with Idempotency Keys", "url": "https://stripe.com/blog/idempotency"},
            {"label": "IETF Draft: The Idempotency-Key HTTP Header Field Specification", "url": "https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header-02"},
            {"label": "Brandur Leach: Implementing Stripe-like Idempotency in Distributed Services", "url": "https://brandur.org/idempotency-keys"}
        ]
    },
    {
        "id": "dual-write-problem-and-reconciliation-loops",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "dual-write;reconciliation;data-consistency;event-driven",
        "title": "The Dual-Write Hazard & Asynchronous Reconciliation Loops",
        "description": "Attempting to update two independent distributed systems (e.g. primary database and Elasticsearch index or Redis cache) without distributed transactions inevitably causes silent drift when one operation fails. Production systems counter this by establishing an authoritative source of truth, emitting append-only mutation events, and running asynchronous reconciliation loops that periodically audit checksums and heal divergences.",
        "resources": [
            {"label": "Martin Kleppmann: Please Stop Approving Pull Requests with Dual Writes", "url": "https://martin.kleppmann.com/2015/04/23/bottled-water-real-time-postgresql-kafka.html"},
            {"label": "Uber Engineering: Cherami and Asynchronous Reconciliation for Distributed Storage", "url": "https://www.uber.com/blog/cherami-message-queue/"},
            {"label": "Shopify Engineering: Solving Data Discrepancies with Asynchronous Reconciliation", "url": "https://shopify.engineering/resilient-data-consistency-patterns"}
        ]
    },
    {
        "id": "two-phase-commit-limitations-and-blocking",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "2pc;distributed-transactions;acid;consensus;blocking",
        "title": "Two-Phase Commit (2PC): Protocol Phases, Coordinator Crashes & Blocking Flaws",
        "description": "Two-Phase Commit (2PC) achieves atomic multi-node transactions through a Prepare phase (where participants acquire locks and promise to commit) and a Commit phase. However, 2PC is fundamentally a blocking protocol: if the coordinator crashes after participants vote 'Yes' but before broadcasting the commit decision, participants remain blocked holding locks indefinitely to prevent split-brain outcomes.",
        "resources": [
            {"label": "Jim Gray: Notes on Data Base Operating Systems (Section 5.8: Two Phase Commit Protocol, Springer 1978)", "url": "https://link.springer.com/chapter/10.1007/3-540-08755-9_9"},
            {"label": "Philip A. Bernstein, Vassos Hadzilacos, Nathan Goodman: Concurrency Control and Recovery in Database Systems (Chapter 7)", "url": "https://www.microsoft.com/en-us/research/publication/concurrency-control-and-recovery-in-database-systems/"},
            {"label": "Martin Kleppmann: The Trouble with Distributed Transactions and Two-Phase Commit", "url": "https://dataintensive.net/"}
        ]
    },
    {
        "id": "listen-to-yourself-pattern-event-driven",
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "tags": "event-sourcing;listen-to-yourself;cqrs;messaging",
        "title": "Listen-to-Yourself Pattern: Event-Driven Local State Synchronization",
        "description": "In the Listen-to-Yourself pattern, a service handling a write command does not update its local database directly; instead, it validates the command and publishes an event to an append-only distributed log (Kafka). The service then consumes its own event from the log along with other replicas to apply the state transition locally, guaranteeing identical ordering and state across all service instances.",
        "resources": [
            {"label": "Martin Fowler: Event Sourcing & CQRS Architectural Patterns", "url": "https://martinfowler.com/eaaDev/EventSourcing.html"},
            {"label": "Jay Kreps: The Log: What Every Software Engineer Should Know About Real-Time Data's Unifying Abstraction", "url": "https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying"},
            {"label": "Confluent: Building Event-Driven Microservices: Event-First Persistence", "url": "https://www.confluent.io/blog/event-driven-microservices-persistence/"}
        ]
    }
]

# Write CSV & SQL files
os.makedirs('seeds', exist_ok=True)

csv_filepath = os.path.join('seeds', 'topics_tech_systems_distributed_computing.csv')
sql_filepath = os.path.join('seeds', 'seed_topics_tech_systems_distributed_computing.sql')

# Write RFC 4180 compliant CSV
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

# Write PostgreSQL Idempotent SQL Seed
with open(sql_filepath, mode='w', encoding='utf-8') as f_sql:
    f_sql.write('-- ==============================================================================\n')
    f_sql.write(f'-- TOPICS SEED DATA: TECH -> SYSTEMS-DISTRIBUTED-COMPUTING ({len(topics)} Topics)\n')
    f_sql.write('-- ==============================================================================\n\n')
    
    for t in topics:
        topic_id = t['id'].replace("'", "''")
        group_name = t['group_name'].replace("'", "''")
        category = t['category'].replace("'", "''")
        tags = [tag.strip().replace("'", "''") for tag in t['tags'].split(';') if tag.strip()]
        tags_sql = "ARRAY[" + ", ".join([f"'{tag}'" for tag in tags]) + "]::TEXT[]"
        title = t['title'].replace("'", "''")
        desc = t['description'].replace("'", "''")
        res_json = json.dumps(t['resources'], ensure_ascii=False).replace("'", "''")
        
        f_sql.write(f"INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)\n")
        f_sql.write(f"VALUES ('{topic_id}', '{group_name}', '{category}', {tags_sql}, '{title}', '{desc}', '{res_json}'::JSONB)\n")
        f_sql.write("ON CONFLICT (id) DO UPDATE SET\n")
        f_sql.write("    title = EXCLUDED.title,\n")
        f_sql.write("    description = EXCLUDED.description,\n")
        f_sql.write("    tags = EXCLUDED.tags,\n")
        f_sql.write("    resources = EXCLUDED.resources;\n\n")

print(f"Generated SQL seed file successfully at {sql_filepath}")

# Validation with csv.DictReader and json.loads on every single row
print("\n--- VALIDATING CSV WITH csv.DictReader + json.loads ---")
with open(csv_filepath, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    assert reader.fieldnames == ['id', 'group_name', 'category', 'tags', 'title', 'description', 'resources'], f"Invalid headers: {reader.fieldnames}"
    
    row_count = 0
    ids_seen = set()
    for row_idx, row in enumerate(reader, start=1):
        row_count += 1
        t_id = row['id']
        assert t_id, f"Row {row_idx}: id is empty"
        assert t_id not in ids_seen, f"Row {row_idx}: duplicate id {t_id}"
        ids_seen.add(t_id)
        
        assert row['group_name'] == 'tech', f"Row {row_idx}: invalid group_name {row['group_name']}"
        assert row['category'] == 'systems-distributed-computing', f"Row {row_idx}: invalid category {row['category']}"
        assert row['tags'], f"Row {row_idx}: tags is empty"
        assert row['title'], f"Row {row_idx}: title is empty"
        assert row['description'], f"Row {row_idx}: description is empty"
        
        # Validate resources JSON
        try:
            res = json.loads(row['resources'])
            assert isinstance(res, list), f"Row {row_idx}: resources is not a list"
            assert 2 <= len(res) <= 4, f"Row {row_idx}: resources length {len(res)} outside expected [2, 4]"
            for r_item in res:
                assert 'label' in r_item and 'url' in r_item, f"Row {row_idx}: missing label or url in resource {r_item}"
                assert r_item['label'].strip(), f"Row {row_idx}: empty label"
                assert r_item['url'].startswith('http'), f"Row {row_idx}: invalid url {r_item['url']}"
        except Exception as e:
            raise AssertionError(f"Row {row_idx} ({t_id}) failed JSON validation: {e}")

print(f"SUCCESS: All {row_count} rows passed strict validation with csv.DictReader and json.loads!")
