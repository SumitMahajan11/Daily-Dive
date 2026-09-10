import csv
import json
import os

topics = [
    # -------------------------------------------------------------------------
    # 1. Container Orchestration & Internals
    # -------------------------------------------------------------------------
    {
        "id": "k8s-scheduler-internals",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "kubernetes;scheduling;containers",
        "title": "Kubernetes Scheduler: Filtering, Scoring & Preemption",
        "description": "The kube-scheduler assigns pods to nodes in a two-phase cycle: filtering nodes via predicates (node affinity, taints/tolerations, resource limits) and scoring survivors via priorities. When no node qualifies, the preemption logic evicts lower-priority pods based on PriorityClass to schedule critical workloads.",
        "resources": [
            {"label": "Kubernetes Official Docs: kube-scheduler Scheduling Cycle", "url": "https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/"},
            {"label": "Kubernetes Enhancement Proposal (KEP): Scheduling Framework Architecture", "url": "https://github.com/kubernetes/enhancements/tree/master/keps/sig-scheduling/624-scheduling-framework"},
            {"label": "Borg, Omega, and Kubernetes (Wilkes et al., ACM Queue)", "url": "https://queue.acm.org/detail.cfm?id=2898444"}
        ]
    },
    {
        "id": "k8s-operator-reconciliation-loop",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "kubernetes;operators;controller-runtime",
        "title": "Kubernetes Operator Pattern & Edge-Triggered Reconciliation",
        "description": "Operators extend Kubernetes by pairing Custom Resource Definitions (CRDs) with an idempotent reconciliation controller. The controller uses Informers and Workqueues to continuously observe actual cluster state and converge it toward the declared desired state via level-triggered logic.",
        "resources": [
            {"label": "CoreOS: Introducing Operators: Putting Operational Knowledge into Software", "url": "https://cloud.redhat.com/blog/introducing-operators"},
            {"label": "Kubernetes Documentation: Custom Resources & Controller Pattern", "url": "https://kubernetes.io/docs/concepts/extend-kubernetes/operator/"},
            {"label": "Kubernetes Controller Runtime Design Docs", "url": "https://github.com/kubernetes-sigs/controller-runtime"}
        ]
    },
    {
        "id": "k8s-statefulsets-and-headless-services",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "kubernetes;stateful-workloads;storage",
        "title": "Kubernetes StatefulSets, VolumeClaimTemplates & Headless Services",
        "description": "StatefulSets provide deterministic pod identity (ordinal indexing 0..N-1), dedicated PersistentVolumeClaims per pod, and ordered grace periods for scaling. Combining them with Headless Services (ClusterIP: None) creates direct A/AAAA DNS records per pod replica for database cluster membership discovery.",
        "resources": [
            {"label": "Kubernetes Documentation: StatefulSets Concept & Lifecycle", "url": "https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/"},
            {"label": "Kubernetes Documentation: Headless Services & DNS Routing", "url": "https://kubernetes.io/docs/concepts/services-networking/service/#headless-services"}
        ]
    },
    {
        "id": "k8s-admission-controllers-and-mutating-webhooks",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "kubernetes;security;admission-controllers",
        "title": "Kubernetes Dynamic Admission: Mutating & Validating Webhooks",
        "description": "Admission webhooks intercept API requests to the kube-apiserver after authentication and schema validation. Mutating webhooks modify objects before persistence (such as injecting sidecars or default limits), while Validating webhooks enforce security policies, rejecting non-compliant workloads.",
        "resources": [
            {"label": "Kubernetes Documentation: Dynamic Admission Control", "url": "https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/"},
            {"label": "Open Policy Agent (OPA) Gatekeeper: Admission Webhook Architecture", "url": "https://open-policy-agent.github.io/gatekeeper/website/docs/"}
        ]
    },
    {
        "id": "container-runtimes-cri-oci-runc",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "containers;oci;runtimes;linux",
        "title": "Container Runtime Architecture: CRI, containerd, runc & OCI Specs",
        "description": "The Kubelet delegates pod lifecycle execution via the gRPC Container Runtime Interface (CRI) to high-level runtimes like containerd or CRI-O. These runtimes pull OCI container images and invoke low-level OCI-compliant runtimes (runc, crun) that configure Linux namespaces, cgroups, and seccomp profiles.",
        "resources": [
            {"label": "Open Container Initiative (OCI) Runtime Specification", "url": "https://github.com/opencontainers/runtime-spec"},
            {"label": "Containerd Architecture & CRI Plugin Internals", "url": "https://containerd.io/docs/"},
            {"label": "Linux Kernel Namespaces & cgroups Manual (man 7 namespaces)", "url": "https://man7.org/linux/man-pages/man7/namespaces.7.html"}
        ]
    },
    {
        "id": "linux-cgroups-v2-resource-isolation",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "linux;cgroups;resource-management;kernel",
        "title": "Linux cgroups v2: Unified Hierarchy, Memory Pressure & OOM Management",
        "description": "Control Groups (cgroups v2) unify resource accounting under a single hierarchy, resolving the I/O-memory attribution flaws of cgroups v1. It introduces Memory Pressure Stall Information (PSI) and memory.high soft throttles, enabling proactive memory reclamation before triggering the kernel OOM killer.",
        "resources": [
            {"label": "Linux Kernel Documentation: Control Group v2", "url": "https://docs.kernel.org/admin-guide/cgroup-v2.html"},
            {"label": "Meta Engineering: Lessons from cgroups v2 Deployment at Scale", "url": "https://engineering.fb.com/2022/06/20/open-source/cgroup2/"},
            {"label": "Kubernetes Documentation: Enabling and Using cgroup v2", "url": "https://kubernetes.io/docs/concepts/architecture/cgroups/"}
        ]
    },

    # -------------------------------------------------------------------------
    # 2. Service Mesh & Cloud Networking
    # -------------------------------------------------------------------------
    {
        "id": "envoy-proxy-threading-and-xds-apis",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "networking;envoy;service-mesh;proxies",
        "title": "Envoy Proxy Architecture: Event Loops, Threading & dynamic xDS APIs",
        "description": "Envoy uses a single-process, multi-threaded event-driven model where non-blocking libevent loops pinned to OS threads handle socket I/O independently. Configuration is updated dynamically at runtime without restarts using Discovery Services (xDS: CDS, EDS, LDS, RDS) via streamed gRPC connections.",
        "resources": [
            {"label": "Envoy Proxy Architecture: Threading Model Overview", "url": "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/intro/threading_model"},
            {"label": "Envoy Dynamic Discovery Service (xDS) Protocol Specification", "url": "https://www.envoyproxy.io/docs/envoy/latest/api-docs/xds_protocol"},
            {"label": "Envoy: The Universal Data Plane (Matt Klein, CNCF)", "url": "https://blog.envoyproxy.io/envoy-threading-model-a8d44b922310"}
        ]
    },
    {
        "id": "istio-control-plane-pilot-and-envoy-injection",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "istio;service-mesh;networking;security",
        "title": "Istio Service Mesh: istiod Control Plane, mTLS & Sidecar Interception",
        "description": "Istio converts high-level routing rules (VirtualService, DestinationRule) into Envoy xDS configuration distributed by istiod. Network traffic is transparently redirected through the Envoy sidecar via iptables PREROUTING rules, enforcing mutual TLS (mTLS) with cryptographically validated SPIFFE identity certificates.",
        "resources": [
            {"label": "Istio Architecture Deep Dive & Component Overview", "url": "https://istio.io/latest/docs/ops/deployment/architecture/"},
            {"label": "Istio Security Architecture: mTLS & Citadel Certificate Issuance", "url": "https://istio.io/latest/docs/concepts/security/"}
        ]
    },
    {
        "id": "ebpf-and-cilium-data-plane",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "ebpf;networking;cilium;kernel",
        "title": "eBPF & Cilium: Kernel-Level Packet Forwarding without iptables",
        "description": "Extended Berkeley Packet Filter (eBPF) allows verified sandboxed bytecode to execute directly inside the Linux kernel at socket and network driver hooks (XDP, TC). Cilium leverages eBPF to replace traditional $O(N)$ iptables routing chains with direct BPF map lookups, achieving microsecond-latency service routing and L7 visibility.",
        "resources": [
            {"label": "eBPF Official Documentation & Kernel Runtime Architecture", "url": "https://ebpf.io/what-is-ebpf/"},
            {"label": "Cilium Architectural Overview & eBPF Networking", "url": "https://docs.cilium.io/en/stable/overview/intro/"},
            {"label": "Bypassing TCP/IP Stack with eBPF (Daniel Borkmann, Kernel Recipes)", "url": "https://kernel-recipes.org/en/2019/talks/ebpf-and-xdp-for-processing-packets-at-bare-metal-speed/"}
        ]
    },
    {
        "id": "kubernetes-cni-overlay-vs-flat-routing",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "networking;kubernetes;cni;vxlan",
        "title": "Kubernetes CNI Plugins: Overlay Networks (VXLAN/Geneve) vs Direct BGP Routing",
        "description": "Container Network Interface (CNI) plugins allocate unique IPs per pod. Overlay implementations (Flannel, Calico VXLAN) encapsulate pod-to-pod packets in UDP packets over existing infrastructure, while flat routing plugins (Calico BGP, AWS VPC CNI) program host routes or attach native ENIs directly for line-rate throughput.",
        "resources": [
            {"label": "CNI Specification & Network Plugin Interface Standard", "url": "https://github.com/containernetworking/cni/blob/spec-v1.0.0/SPEC.md"},
            {"label": "Calico Architecture: BGP Peering and IPAM", "url": "https://docs.tigera.io/calico/latest/about/"},
            {"label": "AWS VPC CNI Plugin Architecture & Secondary IP Allocation", "url": "https://github.com/aws/amazon-vpc-cni-k8s"}
        ]
    },
    {
        "id": "kubernetes-ingress-vs-gateway-api",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "kubernetes;ingress;gateway-api;networking",
        "title": "Kubernetes Ingress vs. Gateway API: Role-Oriented Declarative Routing",
        "description": "The Kubernetes Gateway API evolves the legacy monolithic Ingress spec into expressive, role-oriented resources (GatewayClass for infra providers, Gateway for cluster ops, HTTPRoute/GRPCRoute for app devs). It natively supports advanced routing primitives like cross-namespace routing, traffic splitting, and header manipulation without vendor-specific annotations.",
        "resources": [
            {"label": "Kubernetes Gateway API Specification & User Guide", "url": "https://gateway-api.sigs.k8s.io/"},
            {"label": "Kubernetes Blog: Evolving Kubernetes Networking with the Gateway API", "url": "https://kubernetes.io/blog/2021/04/22/evolving-kubernetes-networking-with-the-gateway-api/"}
        ]
    },

    # -------------------------------------------------------------------------
    # 3. Infrastructure as Code (IaC) & Modern Automation
    # -------------------------------------------------------------------------
    {
        "id": "terraform-state-locking-and-backends",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "iac;terraform;state-management;devops",
        "title": "Terraform State Internals: Dependency Graphs, Remote Backends & Distributed Locking",
        "description": "Terraform maintains a JSON state file mapping declared HCL configuration to real-world cloud resource IDs and attributes. Remote state backends (S3+DynamoDB, Terraform Cloud) prevent concurrent corruption via atomic distributed mutex locks and enable plan/apply DAG resource topological sorting.",
        "resources": [
            {"label": "HashiCorp Terraform Documentation: State Architecture & Storage Backends", "url": "https://developer.hashicorp.com/terraform/language/state"},
            {"label": "Terraform Internals: Graph Computation and State Lifecycle", "url": "https://developer.hashicorp.com/terraform/internals/graph"},
            {"label": "OpenTofu State Backend Specification", "url": "https://opentofu.org/docs/language/state/backends/"}
        ]
    },
    {
        "id": "iac-drift-detection-and-reconciliation",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "iac;terraform;drift;gitops",
        "title": "Infrastructure Drift Detection, Refresh Phases & Out-of-Band Mutations",
        "description": "Infrastructure drift occurs when out-of-band manual changes or external provider mutations desynchronize the cloud environment from the declared state file. Tools execute refresh cycles (`terraform plan -refresh-only`) to refresh local cache against real API state and compute corrective diffs.",
        "resources": [
            {"label": "HashiCorp Terraform Documentation: Refresh and Drift Management", "url": "https://developer.hashicorp.com/terraform/tutorials/state/refresh"},
            {"label": "AWS CloudFormation Drift Detection Documentation", "url": "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/detect-drift-stack.html"}
        ]
    },
    {
        "id": "pulumi-engine-and-imperative-constructs",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "iac;pulumi;cloud-engineering;typescript",
        "title": "Pulumi Architecture: Language Host, Resource Monitors & RPC Engine",
        "description": "Pulumi executes real programming languages (TypeScript, Python, Go) via language runtime hosts that emit language-agnostic gRPC resource declarations to the Pulumi Engine. The Resource Monitor builds a dependency DAG, validates schemas, and orchestrates CRUD operations through provider plugins.",
        "resources": [
            {"label": "Pulumi Architecture: How Pulumi Works (Language Host & Engine)", "url": "https://www.pulumi.com/docs/concepts/how-pulumi-works/"},
            {"label": "Pulumi State and Backend Architecture", "url": "https://www.pulumi.com/docs/concepts/state/"}
        ]
    },
    {
        "id": "terraform-module-design-and-inversion",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "iac;terraform;module-patterns;software-design",
        "title": "Terraform Module Composition: Root Modules, Child Modules & Inversion of Control",
        "description": "Production IaC structures isolate state blasted radius using composable child modules with clean input/output contracts. Dependency inversion is achieved by passing resource IDs or managed objects downward rather than embedding provider configurations inside nested reusable modules.",
        "resources": [
            {"label": "HashiCorp Terraform Module Best Practices & Standard Structure", "url": "https://developer.hashicorp.com/terraform/language/modules/develop/structure"},
            {"label": "Google Cloud Architecture Framework: Best practices for Terraform", "url": "https://cloud.google.com/docs/terraform/best-practices-for-terraform"}
        ]
    },

    # -------------------------------------------------------------------------
    # 4. Distributed Consensus & Coordination
    # -------------------------------------------------------------------------
    {
        "id": "etcd-raft-log-replication-and-boltdb",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "distributed-systems;etcd;raft;consensus",
        "title": "etcd Internals: Raft Consensus Engine, MVCC & B+ Tree BoltDB Storage",
        "description": "etcd stores Kubernetes cluster state using an in-memory Raft consensus implementation to replicate WAL logs across a quorum ($N/2 + 1$). Committed keys are indexed via an in-memory btree (with revision numbers) and persisted to an append-only B+ Tree disk engine (bbolt) supporting concurrent non-blocking reads.",
        "resources": [
            {"label": "etcd Architecture & Storage Layer Deep Dive", "url": "https://etcd.io/docs/latest/learning/data_model/"},
            {"label": "In Search of an Understandable Consensus Algorithm (Raft Paper, Ongaro & Ousterhout)", "url": "https://raft.github.io/raft.pdf"},
            {"label": "etcd Raft Implementation Repository", "url": "https://github.com/etcd-io/raft"}
        ]
    },
    {
        "id": "distributed-locking-leases-and-fencing-tokens",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "distributed-systems;locking;fencing-tokens;consensus",
        "title": "Distributed Locking: TTL Leases, Split-Brain & Fencing Tokens",
        "description": "Distributed locks rely on heartbeated TTL leases granted by a consensus quorum. Because garbage collection pauses and network hiccups can cause lease expiration without the holder's awareness, backends must use monotonically increasing fencing tokens to validate and drop stale writes on shared resources.",
        "resources": [
            {"label": "Martin Kleppmann: How to Do Distributed Locking (Redlock Analysis)", "url": "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html"},
            {"label": "Google Chubby: A Distributed Lock Service for Loose Coupling (Burrows, OSDI)", "url": "https://research.google/pubs/the-chubby-lock-service-for-loosely-coupled-distributed-systems/"}
        ]
    },
    {
        "id": "zookeeper-zab-atomic-broadcast",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "distributed-systems;zookeeper;consensus;replication",
        "title": "Apache ZooKeeper: ZAB Protocol (ZooKeeper Atomic Broadcast) & Ephemeral Znodes",
        "description": "ZooKeeper ensures strong linearizable writes via the two-phase ZAB protocol (Leader Discovery, Synchronization, and Broadcast). Ephemeral znodes tied to client session heartbeats automate leader election and cluster membership tracking in systems like Kafka (pre-KRaft) and Hadoop.",
        "resources": [
            {"label": "ZooKeeper: Wait-free coordination for Internet-scale systems (Hunt et al., USENIX ATC)", "url": "https://www.usenix.org/legacy/event/atc10/tech/full_papers/Hunt.pdf"},
            {"label": "Apache ZooKeeper Documentation: Internals & ZAB Protocol", "url": "https://zookeeper.apache.org/doc/current/zookeeperInternals.html"}
        ]
    },

    # -------------------------------------------------------------------------
    # 5. Cloud Storage Internals & Storage Systems
    # -------------------------------------------------------------------------
    {
        "id": "s3-strong-consistency-and-lsm-metadata",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "storage;aws-s3;distributed-systems;consistency",
        "title": "Amazon S3 Consistency Model: From Eventual to Strong Read-After-Write",
        "description": "In 2020, Amazon S3 eliminated eventual consistency delays across PUT, LIST, and DELETE operations without performance compromises. S3 combines distributed key-value metadata replication layers with active write-ordering locks to guarantee that immediate reads reflect the latest successful mutate.",
        "resources": [
            {"label": "AWS News: Amazon S3 Update – Strong Read-After-Write Consistency", "url": "https://aws.amazon.com/blogs/aws/amazon-s3-update-strong-read-after-write-consistency/"},
            {"label": "Amazon S3 Architecture: Building and Operating a Storage Service (Marc Olson, USENIX FAST)", "url": "https://www.usenix.org/conference/fast23/presentation/olson"}
        ]
    },
    {
        "id": "block-vs-file-vs-object-storage-tradeoffs",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "storage;ebs;s3;efs;posix",
        "title": "Storage Primitives Compared: Block (EBS/SAN), File (NFS/EFS), and Object (S3)",
        "description": "Block storage provides raw sector-level byte addressing with low latency for random database I/O but attaches to a single node. File storage provides POSIX locking and shared hierarchical access across multiple mounts with lock overhead, while Object storage provides immutable REST-accessible key-blob storage scaling infinitely with high throughput.",
        "resources": [
            {"label": "AWS Whitepaper: Storage Options in the AWS Cloud", "url": "https://docs.aws.amazon.com/whitepapers/latest/aws-storage-services-overview/introduction.html"},
            {"label": "Google Cloud Storage vs Persistent Disk vs Filestore Tradeoffs", "url": "https://cloud.google.com/storage-options"}
        ]
    },
    {
        "id": "erasure-coding-vs-replication",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "storage;erasure-coding;fault-tolerance;distributed-systems",
        "title": "Erasure Coding vs. Multi-Way Replication in Distributed Object Stores",
        "description": "Multi-way replication (e.g. 3x copies) incurs a 200% storage capacity overhead. Modern hyperscale object stores (S3, Ceph, MinIO) use Reed-Solomon Erasure Coding (e.g. 8+4 or 12+4), breaking objects into data and parity chunks across independent failure domains to survive concurrent disk losses with only 33–50% storage overhead.",
        "resources": [
            {"label": "MinIO Erasure Code Architecture & Reed-Solomon Math", "url": "https://min.io/docs/minio/linux/operations/concepts/erasure-coding.html"},
            {"label": "Erasure Coding in Ceph (Ceph Architecture Docs)", "url": "https://docs.ceph.com/en/latest/rados/operations/erasure-code/"},
            {"label": "Facebook F4: An Undergraduate Look at an Archival Storage System (USENIX OSDI)", "url": "https://www.usenix.org/conference/osdi14/technical-sessions/presentation/muralidhar"}
        ]
    },
    {
        "id": "nvme-over-fabrics-and-block-storage-virtualization",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "storage;nvme;hardware;cloud-infra",
        "title": "NVMe-oF (NVMe over Fabrics) & Nitro/Custom Storage Accelerators",
        "description": "NVMe over Fabrics extends NVMe PCIe register semantics over high-speed networks (RDMA, RoCE, TCP) with microsecond latency and zero-copy transfers. Cloud hypervisors (such as AWS Nitro cards and Google Andromeda) offload block storage virtualization to dedicated ASIC hardware, freeing host CPU cycles for customer VMs.",
        "resources": [
            {"label": "NVM Express: NVMe-oF Specification Standard", "url": "https://nvmexpress.org/developers/nvme-of-specification/"},
            {"label": "AWS Nitro System: Architecture and Performance Characteristics", "url": "https://aws.amazon.com/ec2/nitro/"}
        ]
    },

    # -------------------------------------------------------------------------
    # 6. Observability, Telemetry & Reliability Engineering
    # -------------------------------------------------------------------------
    {
        "id": "opentelemetry-collector-and-w3c-trace-context",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "observability;opentelemetry;tracing;w3c",
        "title": "OpenTelemetry Architecture: OTel Collector, Exporters & W3C TraceContext",
        "description": "OpenTelemetry standardizes vendor-neutral telemetry ingestion via receiving, processing (batching, filtering), and exporting pipelines in the OTel Collector. Distributed traces propagate execution state across heterogeneous microservices over HTTP/gRPC using the W3C `traceparent` (trace-id, parent-id, trace-flags) specification.",
        "resources": [
            {"label": "W3C Recommendation: Trace Context Specification", "url": "https://www.w3.org/TR/trace-context/"},
            {"label": "OpenTelemetry Official Architecture Specification", "url": "https://opentelemetry.io/docs/specs/otel/overview/"},
            {"label": "OpenTelemetry Collector Architecture & Pipelines", "url": "https://opentelemetry.io/docs/collector/architecture/"}
        ]
    },
    {
        "id": "prometheus-tsdb-internals-and-head-chunks",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "observability;prometheus;tsdb;metrics",
        "title": "Prometheus TSDB: Head Block Memory Mapping, WAL & Gorilla Compression",
        "description": "Prometheus TSDB writes incoming time-series samples into an in-memory Head chunk and a Write-Ahead Log (WAL) to prevent data loss. Samples are compressed using the Gorilla double-delta timestamp and XOR floating-point value compression algorithms, before compaction into immutable 2-hour multi-dimensional block segments.",
        "resources": [
            {"label": "Prometheus TSDB Architecture (Fabian Reinartz)", "url": "https://fabxc.org/tsdb/"},
            {"label": "Gorilla: A Fast, Scalable, In-Memory Time Series Database (Pelkonen et al., VLDB)", "url": "https://www.vldb.org/pvldb/vol8/p1816-teller.pdf"},
            {"label": "Prometheus Official Storage Documentation", "url": "https://prometheus.io/docs/prometheus/latest/storage/"}
        ]
    },
    {
        "id": "slos-slas-slis-and-error-budget-burn-rates",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "sre;observability;slos;error-budgets",
        "title": "SRE Frameworks: SLIs, SLOs, Error Budgets & Multi-Window Burn Rate Alerts",
        "description": "Site Reliability Engineering defines Service Level Indicators (SLIs) as quantifiable service metrics (e.g. good requests / total requests) measured against Service Level Objectives (SLOs). Error budgets ($1 - \\text{SLO}$) govern release velocity, while multi-window multi-burn-rate alerts page engineers only when consumption threatens total exhaustion.",
        "resources": [
            {"label": "Google SRE Book: Service Level Objectives & Error Budgets", "url": "https://sre.google/sre-book/service-level-objectives/"},
            {"label": "Google SRE Workbook: Alerting on SLOs and Burn Rates", "url": "https://sre.google/workbook/alerting-on-slos/"}
        ]
    },
    {
        "id": "distributed-profiling-and-ebpf-continuous-profiling",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "observability;profiling;ebpf;performance",
        "title": "Continuous Profiling: eBPF Stack Trace Sampling & Flame Graphs",
        "description": "Continuous profiling agents (e.g. Parca, Pyroscope) utilize periodic Linux `perf_event` and eBPF kernel probes to sample CPU instruction pointers and native/runtime stack traces (Go, Java, Rust) without code instrumentation overhead. Aggregated flame graphs expose hidden allocations and lock contention in production.",
        "resources": [
            {"label": "Brendan Gregg: Flame Graphs Visualization", "url": "https://www.brendangregg.com/flamegraphs.html"},
            {"label": "Parca: Continuous Profiling with eBPF Architecture", "url": "https://www.parca.dev/docs/overview"},
            {"label": "OpenTelemetry Continuous Profiling Data Model Specification", "url": "https://opentelemetry.io/docs/specs/otel/profiling/"}
        ]
    },

    # -------------------------------------------------------------------------
    # 7. Identity, Access Management (IAM) & Cloud Security
    # -------------------------------------------------------------------------
    {
        "id": "aws-iam-evaluation-logic-and-least-privilege",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "security;iam;aws;access-control",
        "title": "AWS IAM Policy Evaluation Engine: Explicit Deny, Scopes & ABAC",
        "description": "AWS IAM evaluates authorization via a deterministic flowchart: defaults to implicit deny, evaluates Organizations Service Control Policies (SCPs), Permissions Boundaries, Session Policies, and Identity/Resource policies. Any single explicit deny permanently overrides all permits across the chain.",
        "resources": [
            {"label": "AWS Documentation: IAM Policy Evaluation Logic Flowchart", "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html"},
            {"label": "AWS Security Blog: Attribute-Based Access Control (ABAC) in AWS", "url": "https://aws.amazon.com/blogs/security/how-to-use-abac-in-aws/"}
        ]
    },
    {
        "id": "spiffe-spire-workload-identity",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "security;zero-trust;spiffe;cryptography",
        "title": "SPIFFE / SPIRE: Cryptographic Zero-Trust Workload Identity Federation",
        "description": "Secure Production Identity Framework for Everyone (SPIFFE) standardizes machine identity using SPIFFE IDs formatted as URIs and issued as short-lived X.509 SVID certificates. The SPIRE agent attests host and container primitives (cgroups, namespaces) to dynamically distribute keys without hardcoded static tokens.",
        "resources": [
            {"label": "SPIFFE / SPIRE Architecture & Standards Specification", "url": "https://spiffe.io/docs/latest/spiffe-about/overview/"},
            {"label": "CNCF SPIFFE and SPIRE Production Security Guide", "url": "https://www.cncf.io/projects/spiffe/"}
        ]
    },
    {
        "id": "oidc-federation-and-short-lived-ci-tokens",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "security;oidc;github-actions;iam",
        "title": "OIDC Identity Federation: Keyless Cloud Authentication for CI/CD",
        "description": "OpenID Connect (OIDC) federation eliminates long-lived static cloud secret keys in CI/CD platforms (GitHub Actions, GitLab CI). Workflows request a signed JSON Web Token (JWT) from the runner provider and exchange it directly with AWS STS or GCP Workload Identity for short-lived (15–60 min) scoped IAM sessions.",
        "resources": [
            {"label": "GitHub Docs: Configuring OpenID Connect in Cloud Providers", "url": "https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect"},
            {"label": "AWS IAM Documentation: Using OpenID Connect Identity Providers", "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html"}
        ]
    },
    {
        "id": "hashicorp-vault-envelope-encryption-and-shredding",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "security;vault;encryption;key-management",
        "title": "HashiCorp Vault: Shamir Secret Sharing, Envelope Encryption & Dynamic Secrets",
        "description": "Vault protects secrets using an unsealed master key broken into shares via Shamir's Secret Sharing algorithm. Application payloads are encrypted using high-performance AES-GCM data encryption keys (DEKs) wrapped by a root Key Encryption Key (KEK), enabling instant cryptographic shredding upon lease revocation.",
        "resources": [
            {"label": "HashiCorp Vault Architecture & Cryptographic Engine", "url": "https://developer.hashicorp.com/vault/docs/internals/architecture"},
            {"label": "NIST Special Publication 800-57: Key Management Guidelines", "url": "https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final"}
        ]
    },
    {
        "id": "zero-trust-beyondcorp-model",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "security;zero-trust;network-security;identity",
        "title": "Zero Trust Architecture (BeyondCorp) & Identity-Aware Proxies",
        "description": "The Zero Trust model discards the assumption of internal network perimeter safety ('never trust, always verify'). All access requests are routed through Identity-Aware Proxies (IAP) that continuously evaluate device health telemetry, user context, and contextual risk scores on every single RPC transaction.",
        "resources": [
            {"label": "Google BeyondCorp: A New Approach to Enterprise Security (Ward & Beyer, IEEE)", "url": "https://research.google/pubs/beyondcorp-a-new-approach-to-enterprise-security/"},
            {"label": "NIST Special Publication 800-207: Zero Trust Architecture", "url": "https://csrc.nist.gov/publications/detail/sp/800-207/final"}
        ]
    },

    # -------------------------------------------------------------------------
    # 8. Cloud Networking, Routing & CDN Edge
    # -------------------------------------------------------------------------
    {
        "id": "vpc-peering-vs-transit-gateway",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "networking;aws-vpc;routing;topology",
        "title": "VPC Peering vs. Transit Gateway: Hub-and-Spoke vs Full Mesh Topologies",
        "description": "Direct VPC Peering is non-transitive, requiring an $O(N^2)$ mesh of individual peering connections as network count scales. Cloud Transit Gateways (TGW) act as regional L3 distributed routers implementing hub-and-spoke topologies with route tables, ECMP equal-cost multi-pathing, and centralized egress inspection.",
        "resources": [
            {"label": "AWS Documentation: Transit Gateway vs VPC Peering Architecture", "url": "https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html"},
            {"label": "AWS Network Architecture Whitepaper: Building a Scalable Multi-VPC Network", "url": "https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/introduction.html"}
        ]
    },
    {
        "id": "maglev-and-l4-load-balancing",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "networking;load-balancing;maglev;distributed-systems",
        "title": "Maglev & Layer 4 Load Balancing: Consistent Hashing & ECMP Resiliency",
        "description": "Maglev (Google's L4 software network load balancer) operates on bare-metal servers using BGP Equal-Cost Multi-Pathing (ECMP) across routers. It uses specialized lookup table consistent hashing to evenly distribute million-packet/sec TCP/UDP streams across backend pools without connection dropping during host failures.",
        "resources": [
            {"label": "Maglev: A Fast and Reliable Software Network Load Balancer (Eisenbud et al., USENIX NSDI)", "url": "https://research.google/pubs/maglev-a-fast-and-reliable-software-network-load-balancer/"},
            {"label": "Facebook Katran: A High Performance Layer 4 Load Balancer (GitHub & Docs)", "url": "https://github.com/facebookincubator/katran"}
        ]
    },
    {
        "id": "bgp-anycast-routing-and-ddos-mitigation",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "networking;bgp;anycast;cdn",
        "title": "BGP Anycast Routing: Internet Topologies, PoP Routing & DDoS Absorption",
        "description": "Anycast assigns the exact same public IP address to servers distributed across dozens of global Points of Presence (PoPs) advertising BGP routes to Tier-1 transit ISPs. Internet routers route user packets to the topologically closest PoP via shortest AS-path, naturally distributing and absorbing distributed denial-of-service (DDoS) attack volume.",
        "resources": [
            {"label": "Cloudflare: How BGP Anycast Works across Global Edges", "url": "https://www.cloudflare.com/learning/cdn/glossary/anycast-network/"},
            {"label": "RFC 4786: Operation of Anycast Services (IETF)", "url": "https://datatracker.ietf.org/doc/html/rfc4786"}
        ]
    },
    {
        "id": "cdn-cache-hierarchies-and-stale-while-revalidate",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "cdn;caching;http;performance",
        "title": "CDN Edge Caching: Cache-Control, RFC 5861 (stale-while-revalidate) & Origin Shielding",
        "description": "Edge CDNs collapse origin traffic spikes using multi-tier shielding caches. The `stale-while-revalidate` HTTP Cache-Control extension serves stale cached content immediately to users in background while asynchronously fetching updated versions from the origin, eliminating cache stampedes and latency spikes.",
        "resources": [
            {"label": "RFC 5861: HTTP Cache-Control Extensions for Stale Content", "url": "https://datatracker.ietf.org/doc/html/rfc5861"},
            {"label": "Fastly Architecture: Origin Shielding and Cache Clustering", "url": "https://docs.fastly.com/en/guides/origin-shielding"}
        ]
    },
    {
        "id": "dns-based-traffic-routing-and-edns0-client-subnet",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "dns;networking;latency-routing;edns",
        "title": "DNS Traffic Management: GeoDNS, Latency-Based Routing & EDNS0 Client Subnet",
        "description": "Authoritative DNS servers route requests based on client geolocation and network latency measurements. The EDNS0 Client Subnet (ECS) extension passes a truncated snippet of the client's actual IP network to authoritative resolvers, preventing public DNS resolvers (8.8.8.8, 1.1.1.1) from misrouting users to suboptimal edge locations.",
        "resources": [
            {"label": "RFC 7871: Client Subnet in DNS Queries (IETF)", "url": "https://datatracker.ietf.org/doc/html/rfc7871"},
            {"label": "Amazon Route 53 Documentation: Latency and Geolocation Routing Policies", "url": "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html"}
        ]
    },

    # -------------------------------------------------------------------------
    # 9. CI/CD & Deployment Strategies
    # -------------------------------------------------------------------------
    {
        "id": "canary-deployments-and-automated-rollbacks",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "ci-cd;deployments;canary;observability",
        "title": "Canary Releases & Progressive Delivery: Statistical Metric Verification",
        "description": "Canary deployment shifts a small percentage of real user traffic (1–5%) to newly deployed version pods while measuring error rates and latency histograms against baseline pods. If canary metrics breach statistical thresholds, traffic is instantly rolled back to 0% before outages impact the broader fleet.",
        "resources": [
            {"label": "Flagger: Progressive Delivery Operator for Kubernetes Architecture", "url": "https://flagger.app/architecture/"},
            {"label": "Martin Fowler: CanaryRelease Architecture Pattern", "url": "https://martinfowler.com/bliki/CanaryRelease.html"},
            {"label": "Argo Rollouts: Advanced Deployment Strategies (Canary & Blue-Green)", "url": "https://argoproj.github.io/argo-rollouts/"}
        ]
    },
    {
        "id": "blue-green-deployments-and-dns-switchover",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "ci-cd;deployments;blue-green;networking",
        "title": "Blue-Green Deployments: Router Target Switching & Zero-Downtime Rollouts",
        "description": "Blue-Green deployments maintain two identical production environments: Blue (active live traffic) and Green (idle staging target). Once new versions are smoke-tested in the Green environment, load balancer virtual service targets or ingress weight bindings are atomically switched to achieve zero-downtime cutover.",
        "resources": [
            {"label": "Martin Fowler: BlueGreenDeployment Pattern", "url": "https://martinfowler.com/bliki/BlueGreenDeployment.html"},
            {"label": "AWS Whitepaper: Blue/Green Deployments on AWS", "url": "https://docs.aws.amazon.com/whitepapers/latest/overview-deployment-options/bluegreen-deployments.html"}
        ]
    },
    {
        "id": "gitops-argocd-and-flux-reconciliation",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "gitops;argocd;flux;kubernetes",
        "title": "GitOps Architecture: Pull-Based In-Cluster Controllers & Drift Healing",
        "description": "GitOps uses Git repositories as the cryptographic single source of truth for declared Kubernetes infrastructure. Pull-based in-cluster agents (Argo CD, Flux) continuously poll the repository, compare target states against live etcd state, and automatically self-heal or flag unauthorized cluster mutations.",
        "resources": [
            {"label": "OpenGitOps: The Principles of GitOps Standards", "url": "https://opengitops.dev/"},
            {"label": "Argo CD Architectural Overview & Sync Engine", "url": "https://argo-cd.readthedocs.io/en/stable/operator-manual/architecture/"},
            {"label": "Flux v2 Architecture and GitOps Toolkit", "url": "https://fluxcd.io/flux/components/"}
        ]
    },
    {
        "id": "database-migrations-expand-contract-pattern",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "ci-cd;databases;migrations;zero-downtime",
        "title": "Zero-Downtime Database Migrations: The Expand-and-Contract (Parallel Run) Pattern",
        "description": "Applying breaking database schema mutations during rolling software rollouts causes dual-version write crashes. The Expand-and-Contract pattern decouples schema evolution into three phases: Expand (add nullable new columns), Transition (dual-write in application code), and Contract (deprecate old columns).",
        "resources": [
            {"label": "Martin Fowler: Evolutionary Database Design & Parallel Run", "url": "https://martinfowler.com/articles/evodb.html"},
            {"label": "Stripe Engineering: How we manage zero-downtime database migrations", "url": "https://stripe.com/blog/online-migrations"}
        ]
    },

    # -------------------------------------------------------------------------
    # 10. Serverless, MicroVMs & Edge Compute
    # -------------------------------------------------------------------------
    {
        "id": "firecracker-microvms-and-jailer",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "serverless;virtualization;kvm;microvms",
        "title": "Firecracker MicroVMs: Minimalist KVM Hypervisors & Multi-Tenant Isolation",
        "description": "AWS Firecracker strips legacy BIOS/QEMU device emulation, running lightweight Rust-based virtual machines directly over the Linux Kernel-based Virtual Machine (KVM). It launches isolated microVMs in ~5 milliseconds with <5 MB memory overhead, protected by cgroups, seccomp, and chroot jailers for safe multi-tenant serverless execution.",
        "resources": [
            {"label": "Firecracker: Lightweight Virtualization for Serverless (Agache et al., USENIX NSDI)", "url": "https://www.usenix.org/conference/nsdi20/presentation/agache"},
            {"label": "Firecracker Architecture & Security Model Docs", "url": "https://github.com/firecracker-microvm/firecracker/blob/main/docs/design.md"}
        ]
    },
    {
        "id": "v8-isolates-and-edge-workers",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "serverless;edge-compute;v8;javascript",
        "title": "Edge Compute: V8 Isolates vs Container Virtualization",
        "description": "Traditional serverless functions allocate dedicated processes or microVMs per tenant. Edge runtimes (Cloudflare Workers, Deno Deploy) run untrusted code inside isolated V8 runtime environments (Isolates) sharing a single system process, eliminating cold starts down to sub-millisecond execution initiation.",
        "resources": [
            {"label": "Cloudflare Workers: How Workers Works (V8 Isolates Architecture)", "url": "https://developers.cloudflare.com/workers/reference/how-workers-works/"},
            {"label": "V8 JavaScript Engine Architecture: Isolates and Contexts", "url": "https://v8.dev/docs"}
        ]
    },
    {
        "id": "serverless-cold-starts-and-provisioned-concurrency",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "serverless;aws-lambda;performance;concurrency",
        "title": "Serverless Cold Starts: MicroVM Spawning, Snapshot Restoration & Provisioned Concurrency",
        "description": "Serverless cold starts occur during initial container initialization, runtime bootstrapping, and module imports. Modern platforms mitigate this delay using microVM memory snapshot restoration (e.g. AWS Lambda SnapStart, Firecracker snapshots) and pre-warmed provisioned concurrency pools.",
        "resources": [
            {"label": "AWS Compute Blog: Reducing Cold Starts with AWS Lambda SnapStart", "url": "https://aws.amazon.com/blogs/compute/reducing-java-cold-starts-on-aws-lambda-functions-with-snapstart/"},
            {"label": "Serverless Computing: One Step Forward, Two Steps Back (Hellerstein et al., CIDR)", "url": "https://arxiv.org/abs/1812.03651"}
        ]
    },
    {
        "id": "event-driven-architectures-and-cqrs-event-sourcing",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "cloud-architecture;event-driven;cqrs;kafka",
        "title": "Event-Driven Systems: CQRS, Event Sourcing & Idempotent Consumer Patterns",
        "description": "Event-driven systems decouple asynchronous domain state transitions through ordered immutable event logs (Kafka, EventBridge). Command Query Responsibility Segregation (CQRS) separates write mutations from query projections, requiring consumers to use deduplication keys for idempotent processing during replay.",
        "resources": [
            {"label": "Martin Fowler: Event Sourcing Architecture", "url": "https://martinfowler.com/eaaDev/EventSourcing.html"},
            {"label": "Martin Fowler: CQRS (Command Query Responsibility Segregation)", "url": "https://martinfowler.com/bliki/CQRS.html"},
            {"label": "AWS Whitepaper: Implementing Event-Driven Architectures on AWS", "url": "https://docs.aws.amazon.com/whitepapers/latest/event-driven-architecture/welcome.html"}
        ]
    },

    # -------------------------------------------------------------------------
    # 11. Additional High-Impact Cloud Infrastructure Concepts
    # -------------------------------------------------------------------------
    {
        "id": "k8s-pod-disruption-budgets-and-drain",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "kubernetes;high-availability;sre",
        "title": "Kubernetes Pod Disruption Budgets (PDB) & Graceful Node Drains",
        "description": "Pod Disruption Budgets enforce minimum availability thresholds (minAvailable / maxUnavailable) during voluntary cluster disruptions like node upgrades or autoscaling drains. The eviction API checks PDB compliance before terminating pods, preventing cascading outages across multi-replica deployments.",
        "resources": [
            {"label": "Kubernetes Documentation: Specifying a Disruption Budget for Your Application", "url": "https://kubernetes.io/docs/tasks/run-application/configure-pdb/"},
            {"label": "Kubernetes Documentation: Safely Drain a Node", "url": "https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/"}
        ]
    },
    {
        "id": "k8s-horizontal-pod-autoscaling-hpa-keda",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "kubernetes;autoscaling;keda;metrics",
        "title": "Kubernetes Autoscaling: Metrics Server, HPA & KEDA Event-Driven Scaling",
        "description": "Horizontal Pod Autoscaler (HPA) queries the metrics.k8s.io API and adjusts replica counts based on observed CPU/memory utilization using a proportional target ratio. Kubernetes Event-driven Autoscaling (KEDA) extends HPA by querying external metric triggers (Kafka lag, SQS queue depth, Prometheus queries) to scale deployments to and from zero.",
        "resources": [
            {"label": "Kubernetes Documentation: Horizontal Pod Autoscaler", "url": "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/"},
            {"label": "KEDA Documentation: Architecture & External Scalers", "url": "https://keda.sh/docs/latest/concepts/"}
        ]
    },
    {
        "id": "k8s-network-policies-and-calico-enforcement",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "kubernetes;security;network-policies;firewall",
        "title": "Kubernetes NetworkPolicies: Ingress/Egress Isolation & Pod Selectors",
        "description": "By default, Kubernetes pods accept traffic from any source IP. NetworkPolicies enforce declarative Layer 3/4 micro-segmentation using label selectors to whitelist allowed ingress and egress peer pods, namespaces, or CIDR blocks, compiled into kernel packet filters by CNI providers.",
        "resources": [
            {"label": "Kubernetes Documentation: Network Policies", "url": "https://kubernetes.io/docs/concepts/services-networking/network-policies/"},
            {"label": "Cilium Network Policy Editor & Specification", "url": "https://editor.cilium.io/"}
        ]
    },
    {
        "id": "grpc-http2-multiplexing-and-load-balancing",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "networking;grpc;http2;load-balancing",
        "title": "gRPC over HTTP/2: Connection Multiplexing & L4 vs L7 Load Balancing Pitfalls",
        "description": "gRPC multiplexes concurrent RPC requests over single long-lived TCP/TLS connections via HTTP/2 binary streams. Standard Layer 4 load balancers cannot distribute individual RPCs across multiple server backends on a shared connection, necessitating L7 load balancing (Envoy, gRPC lookaside) or client-side round-robin balancing.",
        "resources": [
            {"label": "gRPC Official Guide: Load Balancing in gRPC", "url": "https://grpc.io/blog/grpc-load-balancing/"},
            {"label": "HTTP/2 RFC 7540: Framing & Multiplexing Specification", "url": "https://datatracker.ietf.org/doc/html/rfc7540"}
        ]
    },
    {
        "id": "chaos-engineering-and-fault-injection",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "sre;chaos-engineering;resilience;reliability",
        "title": "Chaos Engineering: Hypothesis-Driven Fault Injection & Blast Radius Control",
        "description": "Chaos engineering proactively uncovers systemic architectural vulnerabilities by injecting controlled production anomalies (network partitions, packet latency, kill signals). Experiments define steady-state baseline metrics, formulate hypotheses, and enforce automated halt triggers to limit blast radius.",
        "resources": [
            {"label": "Principles of Chaos Engineering Standard", "url": "https://principlesofchaos.org/"},
            {"label": "Chaos Mesh: Chaos Engineering Platform for Kubernetes", "url": "https://chaos-mesh.org/docs/"},
            {"label": "Chaos Monkey & The Simian Army (Netflix Technology Blog)", "url": "https://netflixtechblog.com/the-netflix-simian-army-16e57fbab116"}
        ]
    },
    {
        "id": "distributed-rate-limiting-token-bucket-redis",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "networking;rate-limiting;algorithms;redis",
        "title": "Distributed Rate Limiting: Token Bucket, Sliding Window Counter & Redis Lua Scripts",
        "description": "APIs protect downstream backends from overload using rate limiting algorithms. The Sliding Window Counter algorithm eliminates boundary bursting flaws by weighting adjacent time frames, implemented in Redis using atomic single-roundtrip Lua scripts to avoid race conditions across multi-node API gateways.",
        "resources": [
            {"label": "Figma Engineering: An Alternative Approach to Rate Limiting", "url": "https://www.figma.com/blog/an-alternative-approach-to-rate-limiting/"},
            {"label": "Stripe Engineering: Scaling your API with rate limiters", "url": "https://stripe.com/blog/rate-limiters"},
            {"label": "IETF Draft: RateLimit Header Fields for HTTP", "url": "https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-07"}
        ]
    },
    {
        "id": "cloud-finops-spot-instances-and-capacity-pools",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "finops;cost-optimization;cloud-architecture;spot-instances",
        "title": "Cloud FinOps: Spot Instance Diversification, Capacity Pools & 2-Minute Warnings",
        "description": "Cloud providers sell spare compute capacity at steep discounts (60–90%) via Spot/Preemptible instances with a 2-minute eviction notice. Resilient architectures decouple workloads using Spot Instance Diversification across multiple instance types and Availability Zones to maintain quorum during capacity reclamation.",
        "resources": [
            {"label": "FinOps Foundation: Cloud Cost Management Framework", "url": "https://www.finops.org/framework/"},
            {"label": "AWS Documentation: Best Practices for EC2 Spot Instances", "url": "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-best-practices.html"}
        ]
    },
    {
        "id": "distributed-tracing-sampling-head-vs-tail",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "observability;distributed-tracing;sampling;opentelemetry",
        "title": "Distributed Tracing Sampling: Head-Based vs. Tail-Based Sampling",
        "description": "High-throughput systems cannot afford to persist 100% of telemetry traces. Head-based sampling makes an upfront deterministic decision at the root span before knowing the outcome, while Tail-based sampling buffers all spans in memory collectors and retains traces only if errors occur or latency thresholds are breached.",
        "resources": [
            {"label": "OpenTelemetry Documentation: Sampling Strategies in Tracing", "url": "https://opentelemetry.io/docs/concepts/sampling/"},
            {"label": "Jaeger Architecture: Adaptive and Remote Sampling", "url": "https://www.jaegertracing.io/docs/latest/sampling/"}
        ]
    },
    {
        "id": "secrets-rotation-and-dynamic-database-credentials",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "security;secrets;vault;iam",
        "title": "Zero-Static-Secrets: Dynamic Database Credential Generation & Auto-Rotation",
        "description": "Static database credentials embedded in config maps create severe breach vulnerabilities. Dynamic secret engines (HashiCorp Vault, AWS Secrets Manager) generate unique, time-bound database users per requesting client pod on-the-fly and automatically drop those users from the database once their lease expires.",
        "resources": [
            {"label": "HashiCorp Vault Database Secrets Engine Documentation", "url": "https://developer.hashicorp.com/vault/docs/secrets/databases"},
            {"label": "AWS Secrets Manager: Automatic Secret Rotation Architecture", "url": "https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html"}
        ]
    },
    {
        "id": "container-image-layering-and-content-addressable-blobs",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "containers;docker;oci;storage",
        "title": "Container Image Internals: OCI Image Spec, OverlayFS & Tar Content Addressability",
        "description": "OCI container images are structured as cryptographic SHA-256 content-addressable blobs organized into a manifest, config JSON, and stacked tarball filesystem layers. At container startup, OverlayFS mounts read-only layer directories beneath a thin copy-on-write (CoW) upper layer in constant time.",
        "resources": [
            {"label": "OCI Image Format Specification Standard", "url": "https://github.com/opencontainers/image-spec"},
            {"label": "Linux Kernel Documentation: Overlay Filesystem", "url": "https://docs.kernel.org/filesystems/overlayfs.html"}
        ]
    },
    {
        "id": "cross-plane-and-kubernetes-universal-control-planes",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "kubernetes;crossplane;iac;cloud-engineering",
        "title": "Crossplane: Transforming Kubernetes into a Universal Cloud Control Plane",
        "description": "Crossplane extends the Kubernetes API to manage external cloud infrastructure (databases, buckets, VPCs) directly using Custom Resources (Managed Resources). Compositions bundle multiple cloud primitives into clean, self-service declarative APIs tailored for platform engineering teams.",
        "resources": [
            {"label": "Crossplane Official Architecture & Concepts", "url": "https://docs.crossplane.io/latest/concepts/"},
            {"label": "CNCF Crossplane Project Overview", "url": "https://www.cncf.io/projects/crossplane/"}
        ]
    },
    {
        "id": "cloud-networking-nat-gateways-and-snat-port-exhaustion",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "networking;nat;aws-vpc;snat",
        "title": "Cloud NAT Gateways & Source NAT (SNAT) Port Exhaustion",
        "description": "Private subnets communicate with external internet services through managed NAT gateways using Source Network Address Translation (SNAT). Because each unique egress connection consumes one of 65,536 ephemeral ports per IP-destination tuple, unpooled HTTP connections trigger SNAT port exhaustion and socket timeout storms.",
        "resources": [
            {"label": "AWS Knowledge Center: Troubleshooting NAT Gateway SNAT Port Exhaustion", "url": "https://repost.aws/knowledge-center/nat-gateway-snat-port-exhaustion"},
            {"label": "Google Cloud NAT Architecture and Port Allocation", "url": "https://cloud.google.com/nat/docs/overview"}
        ]
    },
    {
        "id": "immutable-infrastructure-and-golden-images",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "devops;packer;ami;immutable-infrastructure",
        "title": "Immutable Infrastructure: HashiCorp Packer, Golden AMIs & AMI Baking Pipelines",
        "description": "Immutable infrastructure strictly prohibits in-place patching or mutating running production instances. Automated build pipelines (Packer) bake OS configurations, hardened security baselines, and runtime dependencies directly into immutable disk images (AMIs/VHDs) deployed atomically in autoscaling groups.",
        "resources": [
            {"label": "Martin Fowler: ImmutableServer Pattern", "url": "https://martinfowler.com/bliki/ImmutableServer.html"},
            {"label": "HashiCorp Packer Core Concepts & Automated Image Building", "url": "https://developer.hashicorp.com/packer/docs/intro"}
        ]
    },
    {
        "id": "etcd-compaction-and-defragmentation",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "etcd;kubernetes;database-admin;storage",
        "title": "etcd Maintenance: Historical Revision Compaction & BoltDB Space Defragmentation",
        "description": "Because etcd is an append-only MVCC database that preserves revision history, unbounded updates trigger out-of-quota database alarms (2–8 GB limits). Compaction deletes historical key revisions, while offline/online defragmentation reclaims fragmented B-tree free pages back to the host filesystem.",
        "resources": [
            {"label": "etcd Maintenance Guide: Compacting and Defragmenting Storage", "url": "https://etcd.io/docs/latest/op-guide/maintenance/"},
            {"label": "Kubernetes Documentation: Operating etcd Clusters for Kubernetes", "url": "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/"}
        ]
    },
    {
        "id": "container-security-seccomp-apparmor-capabilities",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "security;linux;containers;kernel",
        "title": "Linux Container Hardening: POSIX Capabilities, Seccomp BPF & AppArmor Profiles",
        "description": "Default container root permissions are constrained by dropping unnecessary Linux kernel capabilities (e.g. CAP_SYS_ADMIN, CAP_NET_ADMIN). Secure Computing Mode (seccomp) filters restricted system calls via BPF programs, while AppArmor/SELinux mandatory access controls restrict file path execution permissions.",
        "resources": [
            {"label": "Docker Documentation: Seccomp Security Profiles", "url": "https://docs.docker.com/engine/security/seccomp/"},
            {"label": "Kubernetes Documentation: Restricting a Container's Syscalls with seccomp", "url": "https://kubernetes.io/docs/tutorials/security/seccomp/"},
            {"label": "Linux Kernel Capabilities Manual (man 7 capabilities)", "url": "https://man7.org/linux/man-pages/man7/capabilities.7.html"}
        ]
    },
    {
        "id": "service-discovery-dns-consul-and-serf-gossip",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "networking;service-discovery;consul;distributed-systems",
        "title": "Service Discovery Architecture: HashiCorp Consul, Serf & SWIM Gossip Protocol",
        "description": "Consul manages dynamic microservice registration and health checking across multi-datacenter clusters. It utilizes the SWIM gossip protocol (via Serf) over UDP to achieve $O(1)$ distributed node failure detection and event broadcast without central coordinator overhead.",
        "resources": [
            {"label": "SWIM: Weakly-Consistent Infection-Style Process Group Membership Protocol (Das et al.)", "url": "https://www.cs.cornell.edu/projects/Quicksilver/public_pdfs/SWIM.pdf"},
            {"label": "HashiCorp Consul Architecture Overview", "url": "https://developer.hashicorp.com/consul/docs/architecture"},
            {"label": "Serf Gossip Protocol and Architecture", "url": "https://www.serf.io/docs/internals/gossip.html"}
        ]
    },
    {
        "id": "distributed-cron-and-job-scheduling-nomad",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "orchestration;scheduling;nomad;distributed-systems",
        "title": "Distributed Workload Scheduling: HashiCorp Nomad Evaluation Broker & Bin-Packing",
        "description": "Nomad schedules containers, non-containerized binaries, and batch jobs across heterogeneous infrastructure with sub-second execution latency. Its Evaluation Broker processes plan evaluations concurrently using optimistic concurrency and multidimensional bin-packing algorithms.",
        "resources": [
            {"label": "HashiCorp Nomad Architecture & Evaluation Broker Deep Dive", "url": "https://developer.hashicorp.com/nomad/docs/internals/architecture"},
            {"label": "Scheduling 2 Million Containers in 22 Minutes (Nomad Scalability Benchmark)", "url": "https://www.hashicorp.com/blog/nomad-two-million-container-benchmark"}
        ]
    },
    {
        "id": "bpf-co-re-and-libbpf-kernel-portability",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "ebpf;linux;kernel;compilers",
        "title": "eBPF Portability: BPF CO-RE (Compile Once – Run Everywhere) & BTF Type Information",
        "description": "Historically, eBPF programs required runtime LLVM/Clang compilation on every target node with matching kernel headers. BPF CO-RE utilizes BPF Type Format (BTF) debugging metadata and libbpf relocations to compile a single eBPF binary that dynamically adjusts struct offsets across different Linux kernel versions.",
        "resources": [
            {"label": "BPF CO-RE (Compile Once – Run Everywhere) (Andrii Nakryiko)", "url": "https://nakryiko.com/posts/bpf-core-reference-guide/"},
            {"label": "Linux Kernel Documentation: BPF Type Format (BTF)", "url": "https://docs.kernel.org/bpf/btf.html"}
        ]
    },
    {
        "id": "multi-region-active-active-and-cockroachdb-consensus",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "distributed-systems;databases;multi-region;cockroachdb",
        "title": "Multi-Region Active-Active Architectures: Multi-Raft, Range Leases & CockroachDB",
        "description": "Global distributed SQL databases (CockroachDB, YugabyteDB) partition keys into 64MB ranges, each governed by its own independent Raft consensus group (Multi-Raft). Range leases coordinate non-blocking local reads without cross-region consensus rounds, achieving geo-distributed transactional consistency under strict latency bounds.",
        "resources": [
            {"label": "CockroachDB Architecture: Multi-Raft Consensus Engine", "url": "https://www.cockroachlabs.com/docs/stable/architecture/replication-layer.html"},
            {"label": "Spanner: Google's Globally-Distributed Database (Corbett et al., OSDI)", "url": "https://research.google/pubs/spanner-googles-globally-distributed-database/"}
        ]
    },
    {
        "id": "aws-ebs-io2-block-express-and-sr-iov",
        "group_name": "tech",
        "category": "cloud-infra",
        "tags": "storage;aws-ebs;hardware;cloud-infra",
        "title": "Cloud Block Storage Virtualization: AWS EBS io2 Block Express & SR-IOV Networking",
        "description": "AWS io2 Block Express decouples storage instances by routing block commands over a custom SR-IOV virtual network device to scalable NVMe storage pools. It delivers up to 256,000 IOPS and 4,000 MB/s throughput with sub-millisecond flat latency profiles suitable for enterprise databases.",
        "resources": [
            {"label": "AWS Documentation: EBS io2 Block Express Architecture", "url": "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-volume-types.html#io2-block-express"},
            {"label": "Single Root I/O Virtualization (SR-IOV) Architecture Specification", "url": "https://www.intel.com/content/www/us/en/developer/articles/technical/single-root-io-virtualization-overview.html"}
        ]
    }
]

# Ensure output directory exists
os.makedirs('seeds', exist_ok=True)

csv_filepath = os.path.join('seeds', 'topics_tech_cloud_infra.csv')
sql_filepath = os.path.join('seeds', 'seed_topics_tech_cloud_infra.sql')

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
    f_sql.write(f'-- TOPICS SEED DATA: TECH -> CLOUD-INFRA ({len(topics)} Topics)\n')
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
