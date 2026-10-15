# Database Storage Engine Benchmarks

Storage engines offer distinct performance characteristics across write throughput and range query latency:

| Engine Type | Primary Index Structure | Write Amplification | Optimal Workload |
| :--- | :--- | :--- | :--- |
| B+ Tree | Balanced N-ary Tree | Moderate to High | Low latency point lookups and range scans |
| LSM Tree | Log-Structured Merge | Low sequential writes | Ingestion heavy streaming and analytics |
| In-Memory | Skip List / Radix Tree | Zero disk I/O | Real-time cache lookups and sessions |

LSM trees buffer mutations in memory before flushing immutable SSTables to disk during background compactions.
