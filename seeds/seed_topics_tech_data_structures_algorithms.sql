-- ==============================================================================
-- TOPICS SEED DATA: TECH -> DATA-STRUCTURES-ALGORITHMS (73 Topics)
-- ==============================================================================

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('bloom-filter-probabilistic-membership', 'tech', 'data-structures-algorithms', ARRAY['probabilistic', 'bloom-filters', 'hashing', 'data-structures']::TEXT[], 'Bloom Filters: Space-Efficient Probabilistic Set Membership', 'A Bloom filter represents set membership in a compact bit array using $k$ independent hash functions, providing $O(k)$ insertion and query operations with zero false negatives and a mathematically boundable false positive rate. Because elements cannot be removed without risking false negatives in standard bit vectors, variants like Counting Bloom Filters use counters instead of single bits.', '[{"label": "Burton H. Bloom: Space/Time Trade-offs in Hash Coding with Allowable Errors (1970 Original Paper)", "url": "https://dl.acm.org/doi/10.1145/362686.362692"}, {"label": "Stanford CS166: Probabilistic Data Structures & Bloom Filter Analysis", "url": "https://web.stanford.edu/class/cs166/lectures/06/Slides06.pdf"}, {"label": "Broder & Mitzenmacher: Network Applications of Bloom Filters: A Survey", "url": "https://www.eecs.harvard.edu/~michaelm/postscripts/im2005b.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('cuckoo-filter-dynamic-deletion', 'tech', 'data-structures-algorithms', ARRAY['probabilistic', 'cuckoo-filter', 'hashing', 'data-structures']::TEXT[], 'Cuckoo Filters: Set Membership with Dynamic Deletions & Fingerprints', 'Cuckoo filters store short hash fingerprints inside an array of buckets using cuckoo hashing, providing lower lookup overhead and supporting element deletion without the space penalty of Counting Bloom Filters. When a bucket collision occurs during insertion, existing fingerprints are kicked to alternate locations computed via partial-key cuckoo hashing.', '[{"label": "Fan, Andersen, Kaminsky, Mitzenmacher: Cuckoo Filter: Practically Better Than Bloom (CoNEXT 2014)", "url": "https://www.cs.cmu.edu/~dga/papers/cuckoo-conext14.pdf"}, {"label": "Carnegie Mellon CS: Cuckoo Hashing and Cuckoo Filter Foundations", "url": "https://www.cs.cmu.edu/~dga/papers/cuckoo-tutorial.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('hyperloglog-cardinality-estimation', 'tech', 'data-structures-algorithms', ARRAY['probabilistic', 'hyperloglog', 'streaming', 'cardinality']::TEXT[], 'HyperLogLog: Near-Optimal Distinct Element Cardinality Estimation', 'HyperLogLog estimates the cardinality of large multiset streams using $O(\log \log N)$ space by tracking the maximum number of leading zeros in hashed element representations across multiple sub-stream registers. The harmonic mean of register estimates minimizes bias and neutralizes the disproportionate distortion of localized hash anomalies.', '[{"label": "Flajolet, Fusy, Gandouet, Meunier: HyperLogLog: The Analysis of a Near-Optimal Cardinality Estimation Algorithm (2007)", "url": "https://hal.science/inria-00406244/document"}, {"label": "Heule, Nunkesser, Hall: HyperLogLog in Practice: Algorithmic Improvements (Google Research)", "url": "https://research.google/pubs/hyperloglog-in-practice-algorithmic-improvements-for-cardinality-estimation-in-a-large-scale-system/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('count-min-sketch-frequency-estimation', 'tech', 'data-structures-algorithms', ARRAY['probabilistic', 'count-min-sketch', 'streaming', 'heavy-hitters']::TEXT[], 'Count-Min Sketch: Sublinear Frequency Estimation in Streaming Data', 'The Count-Min Sketch maintains a 2D array of counters with $d$ hash functions to estimate event frequencies and identify heavy hitters in high-velocity data streams in sublinear space. Querying an item returns the minimum counter across all $d$ rows, ensuring the estimate never underestimates the true frequency while bounding overestimation error.', '[{"label": "Cormode & Muthukrishnan: An Improved Data Stream Summary: The Count-Min Sketch and its Applications (2005)", "url": "https://dimacs.rutgers.edu/~graham/pubs/papers/cm-full.pdf"}, {"label": "Harvard CS224: Count-Min Sketch and Streaming Frequency Moments", "url": "https://www.minilecture.com/cs224/lecture4.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('minhash-and-simhash-locality-sensitive-hashing', 'tech', 'data-structures-algorithms', ARRAY['probabilistic', 'minhash', 'simhash', 'lsh', 'similarity']::TEXT[], 'MinHash & SimHash: Locality-Sensitive Hashing for Near-Duplicate Detection', 'MinHash estimates Jaccard set similarity by comparing minimum hash permutations across document token sets, while Charikar''s SimHash projects weighted token vectors into compact bit fingerprints that track cosine similarity via Hamming distance. These signatures enable sublinear near-duplicate document and web page deduplication at web scale.', '[{"label": "Andrei Broder: On the Resemblance and Containment of Documents (1997 Original Paper)", "url": "https://www.cs.princeton.edu/courses/archive/spring13/cos598C/broder97resemblance.pdf"}, {"label": "Moses S. Charikar: Similarity Estimation Techniques from Rounding Algorithms (STOC 2002)", "url": "https://dl.acm.org/doi/10.1145/509907.509965"}, {"label": "Stanford University Mining of Massive Datasets: Finding Similar Items & LSH", "url": "http://www.mmds.org/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('b-tree-and-b-plus-tree-indexing', 'tech', 'data-structures-algorithms', ARRAY['trees', 'b-tree', 'databases', 'indexing']::TEXT[], 'B-Trees & B+ Trees: Self-Balancing Disk-Page-Optimized Search Trees', 'B-trees maintain balanced multi-way tree hierarchies where each node matches disk page boundaries to minimize I/O seek latency during disk-based lookups. B+ trees restrict all record pointers to leaf nodes connected via a contiguous linked list, maximizing internal node branch factor and optimizing sequential range scans.', '[{"label": "Bayer & McCreight: Organization and Maintenance of Large Ordered Indexes (1972 Original Paper)", "url": "https://link.springer.com/chapter/10.1007/978-3-642-61942-7_11"}, {"label": "Douglas Comer: The Ubiquitous B-Tree (ACM Computing Surveys)", "url": "https://dl.acm.org/doi/10.1145/356770.356776"}, {"label": "CMU Database Group: B+Tree Storage & Index Internals", "url": "https://15445.courses.cs.cmu.edu/fall2022/slides/08-trees.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('lsm-tree-write-optimized-storage', 'tech', 'data-structures-algorithms', ARRAY['trees', 'lsm-tree', 'storage', 'databases']::TEXT[], 'Log-Structured Merge-Trees (LSM-Trees): Write-Optimized Tiered Storage', 'LSM-Trees buffer incoming writes in an in-memory balanced tree (MemTable) before flushing sorted immutable disk files (SSTables) sequentially, turning random writes into high-throughput append operations. Background compaction merges overlapping SSTable tiers to eliminate duplicate versions, bounded by Bloom filters on reads.', '[{"label": "O''Neil, Cheng, Gawlick, O''Neil: The Log-Structured Merge-Tree (LSM-Tree, 1996 Original Paper)", "url": "https://www.cs.umb.edu/~poneil/lsmtree.pdf"}, {"label": "Martin Kleppmann: Designing Data-Intensive Applications (Chapter 3: Storage and Retrieval)", "url": "https://dataintensive.net/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('segment-tree-range-queries', 'tech', 'data-structures-algorithms', ARRAY['trees', 'segment-tree', 'range-queries', 'algorithms']::TEXT[], 'Segment Trees: Dynamic Range Queries & Lazy Propagation', 'A Segment Tree stores aggregated associative metrics (sum, min, gcd) over array intervals across binary tree nodes, executing arbitrary range queries and point updates in $O(\log N)$ time. Lazy propagation defers range modifications down the tree until child nodes are explicitly queried, preserving logarithmic complexity for range updates.', '[{"label": "CP-Algorithms: Segment Tree Implementation & Range Queries", "url": "https://cp-algorithms.com/data_structures/segment_tree.html"}, {"label": "MIT OpenCourseWare 6.851: Advanced Data Structures — Static Range Queries", "url": "https://ocw.mit.edu/courses/6-851-advanced-data-structures-spring-2012/resources/session-18-static-range-queries/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('fenwick-tree-binary-indexed-tree', 'tech', 'data-structures-algorithms', ARRAY['trees', 'fenwick-tree', 'bit', 'prefix-sums']::TEXT[], 'Fenwick Trees (Binary Indexed Trees): Implicit Prefix Sum Calculation', 'A Fenwick Tree evaluates cumulative prefix sums and executes point updates over dynamic numeric arrays in $O(\log N)$ time and $O(N)$ auxiliary space. The structure maps tree parent-child links implicitly onto array indices using binary two''s-complement least significant bit manipulations (`i & -i`).', '[{"label": "Peter M. Fenwick: A New Data Structure for Cumulative Frequency Tables (1994 Original Paper)", "url": "https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=10.1.1.14.8917"}, {"label": "Topcoder: Binary Indexed Trees Tutorial", "url": "https://www.topcoder.com/thrive/articles/Binary%20Indexed%20Trees"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('radix-tree-and-trie-indexing', 'tech', 'data-structures-algorithms', ARRAY['trees', 'trie', 'radix-tree', 'strings']::TEXT[], 'Tries, Radix Trees & Crit-Bit Trees: Prefix Search and IP Routing', 'Tries structure string or bit sequences into positional key trees where edges represent character transitions, providing $O(L)$ key lookups independent of total dataset cardinality. Radix trees (Patricia Tries) compress chains of non-branching single-child intermediate nodes into single compressed edges to minimize memory footprint.', '[{"label": "Donald R. Morrison: PATRICIA — Practical Algorithm To Retrieve Information Coded in Alphanumeric (1968)", "url": "https://dl.acm.org/doi/10.1145/321479.321481"}, {"label": "Linux Kernel Documentation: Radix Trees in Linux Page Cache", "url": "https://docs.kernel.org/core-api/radix-tree.html"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('skip-list-probabilistic-alternative', 'tech', 'data-structures-algorithms', ARRAY['trees', 'skip-list', 'search', 'concurrency']::TEXT[], 'Skip Lists: Probabilistic Layered Fast-Path Search Structures', 'A skip list augments a sorted linked list with hierarchical express forward lanes generated via geometric coin flips, delivering expected $O(\log N)$ search, insertion, and deletion complexity. Because updates require only localized pointer swaps rather than global tree rebalancing, skip lists are widely used in concurrent databases like RocksDB and Redis.', '[{"label": "William Pugh: Skip Lists: A Probabilistic Alternative to Balanced Trees (1990 Original Paper)", "url": "https://epaperpress.com/sortsearch/download/skiplist.pdf"}, {"label": "Maurice Herlihy & Nir Shavit: The Art of Multiprocessor Programming (Chapter 14: Concurrent Skip Lists)", "url": "https://dl.acm.org/doi/book/10.5555/2385452"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('red-black-and-avl-trees', 'tech', 'data-structures-algorithms', ARRAY['trees', 'red-black-tree', 'avl-tree', 'balanced-trees']::TEXT[], 'Red-Black Trees vs. AVL Trees: Self-Balancing Invariants and Rotations', 'AVL trees maintain strict balance by ensuring child subtree heights differ by at most one, guaranteeing faster $O(\log N)$ lookups at the cost of frequent rebalancing rotations. Red-Black trees relax height tolerances using node color invariants and black-height symmetry, reducing rotation frequency and making them standard in OS schedulers and C++ std::map.', '[{"label": "Rudolf Bayer: Symmetric Binary B-Trees: Data Structure and Maintenance (Red-Black Precursor, 1972)", "url": "https://link.springer.com/article/10.1007/BF00289509"}, {"label": "Adelson-Velsky & Landis: An Algorithm for the Organization of Information (1962 AVL Original Paper)", "url": "https://zhusikun.github.io/pdf/AVL_Tree.pdf"}, {"label": "MIT OpenCourseWare 6.006: Balanced Search Trees, AVL Trees, Red-Black Trees", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-6-avl-trees/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('splay-tree-self-adjusting-search', 'tech', 'data-structures-algorithms', ARRAY['trees', 'splay-tree', 'amortized', 'self-adjusting']::TEXT[], 'Splay Trees: Self-Adjusting Binary Search Trees & Splay Rotations', 'A Splay Tree re-structures itself by moving accessed nodes to the root via a series of double rotations (zig-zig, zig-zag) called splaying, providing $O(\log N)$ amortized time per operation without storing explicit balance factors. Splay trees satisfy the Static Optimality and Dynamic Finger theorems, excelling in caching and non-uniform temporal locality workloads.', '[{"label": "Sleator & Tarjan: Self-Adjusting Binary Search Trees (JACM 1985 Original Paper)", "url": "https://dl.acm.org/doi/10.1145/3828.3835"}, {"label": "MIT OpenCourseWare 6.851: Splay Trees & Dynamic Optimality", "url": "https://ocw.mit.edu/courses/6-851-advanced-data-structures-spring-2012/resources/session-6-splay-trees/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('treap-randomized-search-tree', 'tech', 'data-structures-algorithms', ARRAY['trees', 'treap', 'randomized', 'data-structures']::TEXT[], 'Treaps & Implicit Cartesian Trees: Randomized Priority Balance & Array Splits', 'A Treap combines binary search tree key ordering with binary heap priority ordering using randomly assigned numeric priorities, maintaining expected logarithmic depth without complex rotation invariants. Implicit Treaps key elements by their subtree size, allowing efficient $O(\log N)$ array splitting, splicing, and range reversals.', '[{"label": "Raimund Seidel & Cecilia R. Aragon: Randomized Search Trees (1996 Original Paper)", "url": "https://faculty.washington.edu/aragon/pubs/rst96.pdf"}, {"label": "CP-Algorithms: Treap Implementation and Implicit Treap Operations", "url": "https://cp-algorithms.com/data_structures/treap.html"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('interval-tree-and-range-trees', 'tech', 'data-structures-algorithms', ARRAY['trees', 'interval-tree', 'range-tree', 'geometry']::TEXT[], 'Interval Trees & Range Trees: Multidimensional Geometric Point & Interval Enclosure', 'Interval trees store 1D line segments keyed by start endpoints and augmented with maximum subtree endpoints, reporting all $K$ overlapping intervals intersecting a query point in $O(\log N + K)$ time. Multi-level Range Trees nest secondary search trees inside primary nodes to solve orthogonal range queries in $O(\log^d N + K)$ time.', '[{"label": "Mark de Berg et al.: Computational Geometry: Algorithms and Applications (Chapter 10: Range Searching)", "url": "https://link.springer.com/book/10.1007/978-3-540-77974-2"}, {"label": "Cormen, Leiserson, Rivest, Stein: Introduction to Algorithms (CLRS Chapter 14: Augmenting Data Structures)", "url": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('dijkstra-shortest-path-fibonacci-heap', 'tech', 'data-structures-algorithms', ARRAY['graphs', 'shortest-path', 'dijkstra', 'heaps']::TEXT[], 'Dijkstra''s Shortest Path Algorithm & Fibonacci Heap Optimization', 'Dijkstra''s algorithm finds single-source shortest paths in non-negatively weighted graphs by greedily relaxing edge frontiers using a priority queue. Implementing the queue with a Fibonacci heap reduces the total runtime from $O((V + E) \log V)$ down to $O(E + V \log V)$ through $O(1)$ amortized decrease-key operations.', '[{"label": "Edsger W. Dijkstra: A Note on Two Problems in Connexion with Graphs (1959 Original Paper)", "url": "https://link.springer.com/article/10.1007/BF01386390"}, {"label": "Fredman & Tarjan: Fibonacci Heaps and Their Uses in Improved Network Optimization Algorithms (1987)", "url": "https://dl.acm.org/doi/10.1145/28869.28874"}, {"label": "Cormen, Leiserson, Rivest, Stein: Introduction to Algorithms (CLRS Chapter 24: Single-Source Shortest Paths)", "url": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('a-star-heuristic-search', 'tech', 'data-structures-algorithms', ARRAY['graphs', 'a-star', 'heuristics', 'pathfinding']::TEXT[], 'A* Search Algorithm: Admissibility, Consistency & Heuristic Pathfinding', 'The A* search algorithm navigates state graphs by prioritizing node evaluations according to $f(n) = g(n) + h(n)$, combining actual accumulated cost $g(n)$ with estimated goal cost $h(n)$. An admissible heuristic (never overestimating distance) guarantees optimality, while a consistent heuristic ensures nodes are evaluated at most once.', '[{"label": "Hart, Nilsson, Raphael: A Formal Basis for the Heuristic Determination of Minimum Cost Paths (1968 Original Paper)", "url": "https://ieeexplore.ieee.org/document/4082128"}, {"label": "Stanford CS221: Artificial Intelligence — Heuristic Search and A*", "url": "https://stanford-cs221.github.io/autumn2023/lectures/search1.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('max-flow-min-cut-ford-fulkerson-dinic', 'tech', 'data-structures-algorithms', ARRAY['graphs', 'network-flow', 'max-flow', 'min-cut']::TEXT[], 'Max-Flow Min-Cut Theorem: Ford-Fulkerson, Edmonds-Karp & Dinic''s Algorithm', 'The Max-Flow Min-Cut theorem establishes that the maximum throughput across a flow network strictly equals the minimum capacity required to sever source-sink connectivity. Dinic''s algorithm accelerates flow convergence to $O(V^2 E)$ by constructing BFS level graphs and pushing multiple blocking flows concurrently via DFS.', '[{"label": "E. A. Dinic: Algorithm for Solution of a Problem of Maximum Flow in Networks with Power Estimation (1970)", "url": "https://www.cs.bgu.ac.il/~dinitz/Papers/Dinitz_alg.pdf"}, {"label": "Ford & Fulkerson: Maximal Flow Through a Network (1956 Original Paper)", "url": "https://projecteuclid.org/journals/canadian-journal-of-mathematics/volume-8/issue-none/Maximal-Flow-Through-a-Network/10.4153/CJM-1956-045-5.full"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('strongly-connected-components-tarjan-kosaraju', 'tech', 'data-structures-algorithms', ARRAY['graphs', 'scc', 'tarjan', 'kosaraju']::TEXT[], 'Strongly Connected Components: Tarjan''s & Kosaraju''s DFS Decomposition', 'Strongly Connected Components (SCCs) represent maximal subgraphs where every vertex is reachable from every other vertex. Tarjan''s algorithm isolates all SCCs in a single $O(V + E)$ DFS pass using low-link index tracking and recursion stacks, while Kosaraju''s algorithm performs two DFS passes over the original and transposed graph.', '[{"label": "Robert E. Tarjan: Depth-First Search and Linear Graph Algorithms (1972 Original Paper)", "url": "https://epubs.siam.org/doi/10.1137/0201010"}, {"label": "MIT 6.006: Depth First Search, Strongly Connected Components", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-10-depth-first-search/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('topological-sorting-kahn-and-dfs', 'tech', 'data-structures-algorithms', ARRAY['graphs', 'topological-sort', 'dag', 'dependencies']::TEXT[], 'Topological Sorting: Kahn''s In-Degree Algorithm & Post-Order DFS', 'Topological sorting produces a linear ordering of vertices in Directed Acyclic Graphs (DAGs) such that for every directed edge $u \to v$, vertex $u$ precedes $v$. Kahn''s algorithm resolves dependencies iteratively by maintaining a queue of zero-in-degree nodes, doubling as an immediate detector for cyclic dependency deadlocks.', '[{"label": "A. B. Kahn: Topological Sorting of Large Networks (1962 Original Paper)", "url": "https://dl.acm.org/doi/10.1145/368996.369025"}, {"label": "Cormen, Leiserson, Rivest, Stein: Introduction to Algorithms (CLRS Chapter 22: Elementary Graph Algorithms)", "url": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('minimum-spanning-tree-kruskal-prim', 'tech', 'data-structures-algorithms', ARRAY['graphs', 'mst', 'kruskal', 'prim']::TEXT[], 'Minimum Spanning Trees: Kruskal''s Greedy Union-Find & Prim''s Cut Property', 'A Minimum Spanning Tree connects all vertices in an edge-weighted undirected graph with the minimum total edge cost without cycles. Kruskal''s algorithm processes globally sorted edges greedily using Disjoint Set Union ($O(E \log E)$), while Prim''s algorithm expands a connected component tree via local priority queues ($O(E + V \log V)$).', '[{"label": "Joseph B. Kruskal: On the Shortest Spanning Subtree of a Graph and the Traveling Salesman Problem (1956)", "url": "https://www.ams.org/journals/proc/1956-007-01/S0002-9939-1956-0078686-7/S0002-9939-1956-0078686-7.pdf"}, {"label": "R. C. Prim: Shortest Connection Networks And Some Generalizations (1957 Bell System Technical Journal)", "url": "https://archive.org/details/bstj36-6-1389"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('bellman-ford-and-floyd-warshall', 'tech', 'data-structures-algorithms', ARRAY['graphs', 'shortest-path', 'dynamic-programming', 'bellman-ford']::TEXT[], 'Negative Cycles & All-Pairs Shortest Paths: Bellman-Ford & Floyd-Warshall', 'The Bellman-Ford algorithm calculates single-source shortest paths in $O(VE)$ time across graphs with negative edge weights, detecting unreachable negative weight cycles upon an extra relaxation step. The Floyd-Warshall algorithm computes all-pairs shortest paths in $O(V^3)$ using 3D dynamic programming over intermediate vertex subsets.', '[{"label": "Richard Bellman: On a Routing Problem (1958 Original Paper)", "url": "https://projecteuclid.org/journals/quarterly-of-applied-mathematics/volume-16/issue-1/On-a-routing-problem/10.1090/qam/102435.pdf"}, {"label": "Robert W. Floyd: Algorithm 97: Shortest Path (1962 Communications of the ACM)", "url": "https://dl.acm.org/doi/10.1145/367766.368168"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('lowest-common-ancestor-binary-lifting', 'tech', 'data-structures-algorithms', ARRAY['graphs', 'trees', 'lca', 'binary-lifting', 'rmq']::TEXT[], 'Lowest Common Ancestor (LCA): Binary Lifting & Euler Tour RMQ Reductions', 'The Lowest Common Ancestor problem finds the deepest shared ancestor node between two tree vertices. Binary Lifting precalculates $2^k$-th parent ancestor tables in $O(N \log N)$ preprocessing time to answer queries in $O(\log N)$, while Euler Tour flattenings reduce LCA to static Range Minimum Query (RMQ) solved in $O(1)$ query time with Sparse Tables.', '[{"label": "Bender & Farach-Colton: The LCA Problem Revisited (LATIN 2000)", "url": "https://link.springer.com/chapter/10.1007/10719839_9"}, {"label": "CP-Algorithms: Lowest Common Ancestor — Binary Lifting & Farach-Colton and Bender Algorithm", "url": "https://cp-algorithms.com/graph/lca.html"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('heavy-light-decomposition-trees', 'tech', 'data-structures-algorithms', ARRAY['graphs', 'trees', 'hld', 'segment-tree']::TEXT[], 'Heavy-Light Decomposition (HLD): Path Queries & Subtree Aggregations', 'Heavy-Light Decomposition partitions any tree into disjoint contiguous linear chains by classifying each node''s heaviest subtree edge as ''heavy'' and all remaining child edges as ''light''. Because any path from root to leaf crosses at most $\log_2 N$ light edges, tree path queries map onto $O(\log N)$ contiguous segment tree operations.', '[{"label": "Sleator & Tarjan: A Data Structure for Dynamic Trees (STOC 1981 / JCSS 1983)", "url": "https://dl.acm.org/doi/10.1145/800076.802464"}, {"label": "CP-Algorithms: Heavy-Light Decomposition Tutorial", "url": "https://cp-algorithms.com/graph/hld.html"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('hopcroft-karp-bipartite-matching', 'tech', 'data-structures-algorithms', ARRAY['graphs', 'bipartite-matching', 'flow', 'algorithms']::TEXT[], 'Bipartite Maximum Matching: Hopcroft-Karp & Augmenting Paths', 'The Hopcroft-Karp algorithm finds maximum cardinality matchings in bipartite graphs in optimal $O(E \sqrt{V})$ time by discovering maximal sets of vertex-disjoint shortest augmenting paths in each phase. A BFS builds layered graphs of unmatched vertices, followed by a DFS that flips alternating edge matches concurrently.', '[{"label": "John E. Hopcroft & Richard M. Karp: An n^(5/2) Algorithm for Maximum Matchings in Bipartite Graphs (SIAM 1973)", "url": "https://epubs.siam.org/doi/10.1137/0202019"}, {"label": "Stanford CS261: Maximum Flow and Bipartite Matching", "url": "https://web.stanford.edu/class/cs261/lectures/lec11.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('raft-consensus-algorithm', 'tech', 'data-structures-algorithms', ARRAY['distributed', 'consensus', 'raft', 'replication']::TEXT[], 'Raft Consensus Algorithm: Leader Election, Log Replication & Safety', 'Raft decomposes distributed state machine consensus into three independent sub-problems: randomized timer-based leader election, append-only log replication, and commit safety invariants. A leader commits an entry only after securing acknowledgments from a strict majority quorum ($N/2 + 1$), guaranteeing linearizability across fail-stop cluster nodes.', '[{"label": "Ongaro & Ousterhout: In Search of an Understandable Consensus Algorithm (USENIX ATC 2014)", "url": "https://raft.github.io/raft.pdf"}, {"label": "Raft Interactive Visualization & Formal TLA+ Specification", "url": "https://raft.github.io/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('paxos-consensus-protocol', 'tech', 'data-structures-algorithms', ARRAY['distributed', 'consensus', 'paxos', 'fault-tolerance']::TEXT[], 'Paxos Consensus Protocol: Phase 1/2 Proposers, Acceptors & Learners', 'Paxos establishes agreement on a single value in asynchronous distributed networks prone to message loss and delays. The protocol alternates between Phase 1 (Prepare/Promise) to establish proposal ordering and learn prior values, and Phase 2 (Accept/Accepted) to commit values once accepted by a majority quorum of acceptors.', '[{"label": "Leslie Lamport: The Part-Time Parliament (1998 ACM TOCS Original Paper)", "url": "https://lamport.azurewebsites.net/pubs/lamport-paxos.pdf"}, {"label": "Leslie Lamport: Paxos Made Simple (2001)", "url": "https://lamport.azurewebsites.net/pubs/paxos-simple.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('lamport-timestamps-and-vector-clocks', 'tech', 'data-structures-algorithms', ARRAY['distributed', 'time', 'vector-clocks', 'causality']::TEXT[], 'Causal Ordering: Lamport Timestamps & Multi-Dimensional Vector Clocks', 'Lamport timestamps establish a partial ''happens-before'' ($\to$) ordering by monotonically incrementing local logical counters on internal events and message exchanges. Vector clocks assign each node a counter array vector, providing bidirectional causal tracking to definitively distinguish causally preceding events from concurrent conflicting mutations.', '[{"label": "Leslie Lamport: Time, Clocks, and the Ordering of Events in a Distributed System (1978 Seminal Paper)", "url": "https://lamport.azurewebsites.net/pubs/time-clocks.pdf"}, {"label": "Colin J. Fidge: Timestamps in Message-Passing Systems That Preserve the Partial Ordering (1988)", "url": "https://link.springer.com/chapter/10.1007/978-3-642-88544-0_2"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('crdt-conflict-free-replicated-data-types', 'tech', 'data-structures-algorithms', ARRAY['distributed', 'crdts', 'replication', 'eventual-consistency']::TEXT[], 'Conflict-Free Replicated Data Types (CRDTs): State-Based & Operation-Based Convergence', 'CRDTs allow distributed replicas to execute concurrent mutations locally without centralized coordination, guaranteeing eventual consistency without merge conflicts. State-based CRDTs (CvRDTs) converge by merging replica states using a join-semilattice (commutative, associative, idempotent), while Operation-based CRDTs (CmRDTs) replay commutative causal operations.', '[{"label": "Shapiro, Preguiça, Baquero, Zawirski: Conflict-Free Replicated Data Types (INRIA Research Report 2011)", "url": "https://inria.hal.science/inria-00609399/document"}, {"label": "Martin Kleppmann: A Conflict-Free Replicated JSON Datatype (IEEE TPDS 2017)", "url": "https://arxiv.org/abs/1608.03960"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('two-phase-commit-vs-three-phase-commit', 'tech', 'data-structures-algorithms', ARRAY['distributed', 'transactions', '2pc', 'consensus']::TEXT[], 'Atomic Commit: Two-Phase Commit (2PC) Blocking Pitfalls & 3PC Non-Blocking Protocol', 'Two-Phase Commit (2PC) coordinates distributed transactions across multiple resource managers via voting (Prepare) and execution (Commit/Abort) phases, but remains vulnerable to indefinite blocking if the coordinator fails during execution. Three-Phase Commit (3PC) introduces a PreCommit phase with timeout thresholds to make participant progress non-blocking during partition-free coordinator crashes.', '[{"label": "Jim Gray: Notes on Data Base Operating Systems (1978 Seminal Paper)", "url": "https://research.google/pubs/notes-on-data-base-operating-systems/"}, {"label": "Dale Skeen: Nonblocking Commit Protocols (ACM SIGMOD 1981)", "url": "https://dl.acm.org/doi/10.1145/582318.582339"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('gossip-protocols-and-epidemic-dissemination', 'tech', 'data-structures-algorithms', ARRAY['distributed', 'gossip', 'epidemic', 'membership']::TEXT[], 'Gossip Protocols: Epidemic State Dissemination & SWIM Failure Detection', 'Gossip protocols disseminate cluster state and membership updates by having nodes periodically exchange random pairwise messages, achieving exponential $O(\log N)$ message dissemination with resilience to message drops. The SWIM protocol decouples failure detection from ping intervals using indirect ping probes, maintaining bounded $O(1)$ CPU and network load per node.', '[{"label": "Demers et al.: Epidemic Algorithms for Replicated Database Maintenance (ACM PODC 1987)", "url": "https://dl.acm.org/doi/10.1145/41840.41841"}, {"label": "Das, Gupta, Motivala: SWIM: Weakly-Consistent Infection-Style Process Group Membership Protocol (DSN 2002)", "url": "https://www.cs.cornell.edu/projects/Quicksilver/public_pdfs/SWIM.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('byzantine-fault-tolerance-pbft', 'tech', 'data-structures-algorithms', ARRAY['distributed', 'bft', 'consensus', 'pbft']::TEXT[], 'Practical Byzantine Fault Tolerance (PBFT): Tolerating Arbitrary Malicious Nodes', 'PBFT achieves state machine replication in asynchronous networks withstanding up to $f$ arbitrary or malicious node failures across $3f + 1$ total cluster participants. The protocol orchestrates three message rounds (Pre-Prepare, Prepare, Commit) using cryptographic digital signatures to enforce consistent operation linearizability.', '[{"label": "Castro & Liskov: Practical Byzantine Fault Tolerance (OSDI 1999 Original Paper)", "url": "https://pmg.csail.mit.edu/papers/osdi99.pdf"}, {"label": "Leslie Lamport, Robert Shostak, Marshall Pease: The Byzantine Generals Problem (ACM TOPLAS 1982)", "url": "https://lamport.azurewebsites.net/pubs/byz.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('chandy-lamport-distributed-snapshots', 'tech', 'data-structures-algorithms', ARRAY['distributed', 'snapshots', 'chandy-lamport', 'state-machine']::TEXT[], 'Chandy-Lamport Algorithm: Global State Snapshots in Asynchronous Distributed Systems', 'The Chandy-Lamport algorithm records a consistent global system state (node states and in-flight channel messages) without halting live distributed transaction processing. Nodes initiate snapshot recording by broadcasting control marker messages along FIFO channels, capturing transit messages that arrive prior to receiving marker tokens.', '[{"label": "K. Mani Chandy & Leslie Lamport: Distributed Snapshots: Determining Global States of Distributed Systems (ACM TOCS 1985)", "url": "https://lamport.azurewebsites.net/pubs/chandy.pdf"}, {"label": "Martin Kleppmann: Distributed Systems Lecture Series (Snapshots & Global State)", "url": "https://www.cl.cam.ac.uk/teaching/2122/ConcDisSys/dist-sys-notes.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('knuth-morris-pratt-string-matching', 'tech', 'data-structures-algorithms', ARRAY['strings', 'kmp', 'pattern-matching', 'algorithms']::TEXT[], 'Knuth-Morris-Pratt (KMP) Algorithm: Prefix Function & Failure Tables', 'The KMP algorithm executes exact substring matching in linear $O(N + M)$ time by preprocessing the search pattern into a longest prefix-suffix (LPS) lookup array. When a character mismatch occurs during text traversal, the algorithm skips redundant text character comparisons by shifting the pattern pointer directly to the previous valid prefix boundary.', '[{"label": "Knuth, Morris, Pratt: Fast Pattern Matching in Strings (SIAM Journal on Computing 1977)", "url": "https://epubs.siam.org/doi/10.1137/0206024"}, {"label": "CP-Algorithms: Prefix function and Knuth-Morris-Pratt Algorithm", "url": "https://cp-algorithms.com/string/prefix-func.html"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('rabin-karp-rolling-hash', 'tech', 'data-structures-algorithms', ARRAY['strings', 'rabin-karp', 'hashing', 'pattern-matching']::TEXT[], 'Rabin-Karp Algorithm: Polynomial Rolling Hashes & Multi-Pattern Search', 'Rabin-Karp matches substrings by computing a polynomial rolling hash over sliding text windows, updating the window hash in $O(1)$ arithmetic steps via modular base shifts and subtractions. When the window hash matches the pattern hash, character-by-character validation verifies against false positive hash collisions, enabling efficient multi-pattern lookups.', '[{"label": "Richard M. Karp & Michael O. Rabin: Efficient Randomized Pattern-Matching Algorithms (1987)", "url": "https://www.cs.cmu.edu/~avrim/451f11/lectures/lect1004.pdf"}, {"label": "MIT OpenCourseWare 6.006: Rolling Hashes and Rabin-Karp Algorithm", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-8-hashing-with-chaining/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('suffix-arrays-and-lcp-arrays', 'tech', 'data-structures-algorithms', ARRAY['strings', 'suffix-array', 'lcp', 'algorithms']::TEXT[], 'Suffix Arrays & Longest Common Prefix (LCP) Arrays: Kasai''s Algorithm', 'A Suffix Array contains sorted integer indices of all suffixes in a string, offering a space-efficient alternative to Suffix Trees with $O(N)$ construction via the SA-IS algorithm. When paired with an auxiliary Longest Common Prefix (LCP) array built in $O(N)$ via Kasai''s algorithm, suffix arrays solve complex pattern search and repeat queries in logarithmic time.', '[{"label": "Manber & Myers: Suffix Arrays: A New Method for On-Line String Searches (SIAM 1993)", "url": "https://epubs.siam.org/doi/10.1137/0222058"}, {"label": "Kasai et al.: Linear-Time Longest-Common-Prefix Computation in Suffix Arrays (CPM 2001)", "url": "https://link.springer.com/chapter/10.1007/3-540-48194-X_17"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('aho-corasick-automaton', 'tech', 'data-structures-algorithms', ARRAY['strings', 'aho-corasick', 'automata', 'pattern-matching']::TEXT[], 'Aho-Corasick Automaton: Multi-Pattern Dictionary Matching & Trie Transitions', 'The Aho-Corasick algorithm builds a deterministic finite automaton from a dictionary of keywords by linking trie nodes with suffix fallback failure transitions and dictionary output pointers. It simultaneously identifies all keyword matches across an arbitrary input text stream in optimal $O(N + M + Z)$ time where $Z$ is total match count.', '[{"label": "Alfred V. Aho & Margaret J. Corasick: Efficient String Matching: An Aid to Bibliographic Search (1975)", "url": "https://dl.acm.org/doi/10.1145/360825.360855"}, {"label": "Stanford CS166: Multi-String Pattern Matching and Aho-Corasick Automata", "url": "https://web.stanford.edu/class/cs166/lectures/02/Slides02.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('levenshtein-edit-distance-wagner-fischer', 'tech', 'data-structures-algorithms', ARRAY['strings', 'edit-distance', 'dynamic-programming', 'levenshtein']::TEXT[], 'Levenshtein Distance & Wagner-Fischer Dynamic Programming Algorithm', 'Levenshtein distance measures the minimum number of single-character insertions, deletions, and substitutions required to transform one string into another. The Wagner-Fischer dynamic programming algorithm populates a 2D cost matrix in $O(M \times N)$ time and $O(\min(M, N))$ space, forming the core of spell-checkers and fuzzy search engines.', '[{"label": "Vladimir I. Levenshtein: Binary Codes Capable of Correcting Deletions, Insertions and Reversals (1966)", "url": "https://nymity.ch/sybilhunting/pdf/Levenshtein1966a.pdf"}, {"label": "Robert A. Wagner & Michael J. Fischer: The String-to-String Correction Problem (ACM 1974)", "url": "https://dl.acm.org/doi/10.1145/321796.321811"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('suffix-trees-and-ukkonen-algorithm', 'tech', 'data-structures-algorithms', ARRAY['strings', 'suffix-tree', 'ukkonen', 'data-structures']::TEXT[], 'Suffix Trees: Ukkonen''s On-line Linear-Time Construction Algorithm', 'A Suffix Tree is a compacted trie containing all suffixes of a text string, enabling substring search, longest repeated substring, and palindrome discovery in linear time. Ukkonen''s algorithm constructs the tree online in optimal $O(N)$ time by maintaining active points, suffix links, and implicit edge-extension rule transitions.', '[{"label": "Esko Ukkonen: On-line Construction of Suffix Trees (Algorithmica 1995)", "url": "https://www.cs.helsinki.fi/u/ukkonen/SuffixT1withFigs.pdf"}, {"label": "Dan Gusfield: Algorithms on Strings, Trees, and Sequences (Cambridge University Press)", "url": "https://www.cambridge.org/core/books/algorithms-on-strings-trees-and-sequences/F0B0950499FB16B686C075466B34829D"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('boyer-moore-string-search', 'tech', 'data-structures-algorithms', ARRAY['strings', 'boyer-moore', 'pattern-matching', 'algorithms']::TEXT[], 'Boyer-Moore String Search: Bad Character & Good Suffix Heuristics', 'The Boyer-Moore algorithm searches for substrings by scanning pattern characters from right to left while advancing across the target text from left to right. When a mismatch occurs, the Bad Character and Good Suffix heuristics compute maximal alignment skips, achieving sublinear $O(N/M)$ average-case search time in practice (used in GNU grep).', '[{"label": "Robert S. Boyer & J. Strother Moore: A Fast String Searching Algorithm (CACM 1977 Original Paper)", "url": "https://dl.acm.org/doi/10.1145/359842.359859"}, {"label": "Hume & Sunday: Fast String Searching (Software: Practice and Experience)", "url": "https://dl.acm.org/doi/10.1002/spe.4380211105"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('burrows-wheeler-transform-fm-index', 'tech', 'data-structures-algorithms', ARRAY['strings', 'bwt', 'fm-index', 'compression', 'bioinformatics']::TEXT[], 'Burrows-Wheeler Transform (BWT) & FM-Index: Compressed Pattern Matching', 'The Burrows-Wheeler Transform rearranges string characters into reversible cyclic permutation blocks with high character runs, optimizing data compressibility in bzip2. Augmenting the BWT with Wavelet Trees and rank-select arrays yields the FM-Index, which searches exact pattern occurrences across compressed multi-gigabyte genomic sequences in $O(M)$ time without decompressing the index.', '[{"label": "Michael Burrows & David J. Wheeler: A Block-sorting Lossless Data Compression Algorithm (SRC Research Report 1994)", "url": "https://www.hpl.hp.com/techreports/Compaq-DEC/SRC-RR-124.pdf"}, {"label": "Paolo Ferragina & Giovanni Manzini: Opportunistic Data Structures with Applications (FOCS 2000 FM-Index Paper)", "url": "https://ieeexplore.ieee.org/document/892127"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('quickselect-and-median-of-medians', 'tech', 'data-structures-algorithms', ARRAY['algorithms', 'selection', 'quickselect', 'median-of-medians']::TEXT[], 'Quickselect & Median of Medians: Deterministic Linear-Time Order Statistics', 'Quickselect discovers the $k$-th smallest element in an unordered array with average $O(N)$ time by recursively partitioning only the side containing target index $k$. The Median of Medians algorithm provides a deterministic $O(N)$ worst-case guarantee by dividing elements into groups of five and picking the median of their medians as pivot.', '[{"label": "C. A. R. Hoare: Algorithm 65: Find (Quickselect Original Paper, 1961)", "url": "https://dl.acm.org/doi/10.1145/366622.366647"}, {"label": "Blum, Floyd, Pratt, Rivest, Tarjan: Time Bounds for Selection (1973 Original Paper)", "url": "https://people.csail.mit.edu/rivest/pubs/BFPRT73.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('external-merge-sort-out-of-memory', 'tech', 'data-structures-algorithms', ARRAY['sorting', 'external-sort', 'databases', 'io-complexity']::TEXT[], 'External Merge Sort: Multi-Way Merging for Datasets Exceeding RAM', 'External Merge Sort sorts massive datasets exceeding primary physical RAM by loading data into memory chunks, sorting them locally into initial runs, and writing them to disk. A $K$-way merge then reads streaming buffers from all sorted runs simultaneously into a min-heap priority queue, minimizing random disk seek operations.', '[{"label": "Donald E. Knuth: The Art of Computer Programming (Volume 3: Sorting and Searching, Section 5.4)", "url": "https://www-cs-faculty.stanford.edu/~knuth/taocp.html"}, {"label": "CMU Database Systems: External Merge Sort Algorithm Internals", "url": "https://15445.courses.cs.cmu.edu/fall2022/slides/07-sorting.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('radix-sort-and-counting-sort', 'tech', 'data-structures-algorithms', ARRAY['sorting', 'non-comparison', 'radix-sort', 'counting-sort']::TEXT[], 'Non-Comparison Sorting: Counting Sort, LSD & MSD Radix Sort', 'Non-comparison sorting algorithms bypass the $\Omega(N \log N)$ information-theoretic lower bound by exploiting integer and fixed-radix properties. Counting Sort tabulates frequency counts in $O(N + K)$ time, while Least Significant Digit (LSD) Radix Sort applies stable passes over digit positions to sort $N$ keys in $O(W \cdot N)$ time.', '[{"label": "Cormen, Leiserson, Rivest, Stein: Introduction to Algorithms (CLRS Chapter 8: Sorting in Linear Time)", "url": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"}, {"label": "MIT OpenCourseWare 6.006: Linear-Time Sorting: Counting Sort, Radix Sort", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-7-counting-sort-radix-sort/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('timsort-hybrid-stable-sort', 'tech', 'data-structures-algorithms', ARRAY['sorting', 'timsort', 'hybrid', 'algorithms']::TEXT[], 'TimSort: Hybrid Adaptive Sorting via Natural Run Detection & Merging', 'TimSort combines insertion sort with merge sort to exploit pre-existing sorted subsequences (natural runs) in real-world data, guaranteeing $O(N \log N)$ worst-case time and $O(N)$ best-case time. Short runs are extended to minimum length thresholds (`minrun`) using binary insertion sort, while merge stack invariants maintain balanced merge operations.', '[{"label": "Tim Peters: TimSort Description and Original CPython Implementation Notes", "url": "https://github.com/python/cpython/blob/main/Objects/listsort.txt"}, {"label": "Auger, Jugé, Nicaud, Pivoteau: On the Worst-Case Complexity of TimSort (ESA 2015)", "url": "https://arxiv.org/abs/1805.04154"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('introsort-quicksort-heapsort-hybrid', 'tech', 'data-structures-algorithms', ARRAY['sorting', 'introsort', 'quicksort', 'algorithms']::TEXT[], 'Introsort: Quicksort, Heapsort & Insertion Sort Hybrid for std::sort', 'Introsort provides average-case Quicksort performance while preventing $O(N^2)$ degradation by monitoring recursive partition depth. If call stack depth exceeds $2 \lfloor \log_2 N \rfloor$, it switches to Heapsort to guarantee $O(N \log N)$ worst-case execution time, switching to Insertion Sort for short subarrays ($N < 16$).', '[{"label": "David R. Musser: Introspective Sorting and Selection Algorithms (Software: Practice and Experience 1997)", "url": "https://dl.acm.org/doi/10.1002/%28SICI%291097-024X%28199708%2927%3A8%3C983%3A%3AAID-SPE117%3E3.0.CO%3B2-#"}, {"label": "LLVM libc++: std::sort Implementation Architecture", "url": "https://github.com/llvm/llvm-project/blob/main/libcxx/include/__algorithm/sort.h"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('consistent-hashing-and-virtual-nodes', 'tech', 'data-structures-algorithms', ARRAY['hashing', 'consistent-hashing', 'distributed', 'caching']::TEXT[], 'Consistent Hashing & Virtual Nodes: Partitioning Distributed Rings', 'Consistent hashing maps keys and storage nodes to points on a cyclic hash ring, ensuring that adding or removing a node migrates only $K/N$ keys on average without complete data reshuffling. Assigning multiple pseudo-random virtual tokens (vnodes) to each physical node balances key distribution across asymmetric hardware nodes.', '[{"label": "Karger et al.: Consistent Hashing and Random Trees: Distributed Caching Protocols (ACM STOC 1997)", "url": "https://dl.acm.org/doi/10.1145/258533.258660"}, {"label": "DeCandia et al.: Dynamo: Amazon''s Highly Available Key-value Store (SOSP 2007)", "url": "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('perfect-hashing-fks-algorithm', 'tech', 'data-structures-algorithms', ARRAY['hashing', 'perfect-hashing', 'fks', 'data-structures']::TEXT[], 'Perfect Hashing & FKS Two-Level Hash Table Scheme', 'Perfect hashing constructs collision-free lookup tables for static key sets, guaranteeing strictly deterministic $O(1)$ worst-case search time in linear space. The Fredman-Komlós-Szemerédi (FKS) two-level hashing architecture uses a primary hash table to bucket keys, allocating second-level tables sized quadratically to bucket sizes where collisions occur with probability $< 1/2$.', '[{"label": "Fredman, Komlós, Szemerédi: Storing a Sparse Table with O(1) Worst Case Access Time (1984 Original Paper)", "url": "https://dl.acm.org/doi/10.1145/828.1884"}, {"label": "MIT OpenCourseWare 6.851: Advanced Data Structures — Perfect Hashing & FKS", "url": "https://ocw.mit.edu/courses/6-851-advanced-data-structures-spring-2012/resources/session-12-hashing-1/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('robin-hood-and-cuckoo-hashing', 'tech', 'data-structures-algorithms', ARRAY['hashing', 'robin-hood-hashing', 'cuckoo-hashing', 'open-addressing']::TEXT[], 'Open Addressing Collision Strategies: Robin Hood Hashing & Cuckoo Hashing', 'Robin Hood hashing reduces probe variance in open-addressed tables by taking slots from ''rich'' entries with short probe distances to give to ''poor'' entries with longer probe sequences. Cuckoo hashing uses two hash tables and moves colliding elements across alternative locations, providing constant $O(1)$ worst-case lookup guarantees.', '[{"label": "Pagh & Rodler: Cuckoo Hashing (Journal of Algorithms 2004)", "url": "https://www.itu.dk/people/pagh/papers/cuckoo-jour.pdf"}, {"label": "Pedro Celis: Robin Hood Hashing (University of Waterloo Thesis 1986)", "url": "https://cs.uwaterloo.ca/research/tr/1986/CS-86-14.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('siphash-and-hashdos-defense', 'tech', 'data-structures-algorithms', ARRAY['hashing', 'siphash', 'security', 'hashdos']::TEXT[], 'SipHash & Hash-Flooding DoS: Cryptographically-Secure Short-Key Hashing', 'Standard fast hash functions (MurmurHash, FNV) are vulnerable to algorithmic complexity attacks (HashDoS), where an adversary submits crafted collision keys to degrade hash map lookups from $O(1)$ to $O(N)$. SipHash uses an ARX (Add-Rotate-Xor) round architecture keyed by a 128-bit secret, balancing near-instant short-input execution speed with provable resistance against hash collision flooding.', '[{"label": "Aumasson & Bernstein: SipHash: A Fast Short-Input PRF (Indocrypt 2012 Original Paper)", "url": "https://www.131002.net/siphash/siphash.pdf"}, {"label": "Crosby & Wallach: Denial of Service via Algorithmic Complexity Attacks (USENIX Security 2003)", "url": "https://www.usenix.org/legacy/events/sec03/tech/full_papers/crosby/crosby.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('optimal-substructure-and-memoization', 'tech', 'data-structures-algorithms', ARRAY['dp', 'dynamic-programming', 'memoization', 'tabulation']::TEXT[], 'Dynamic Programming Foundations: Optimal Substructure & Overlapping Subproblems', 'Dynamic Programming solves complex optimization problems by decomposing them into overlapping subproblems whose optimal solutions combine to yield the global optimum (optimal substructure). Top-down memoization caches recursive call results on-demand, while bottom-up tabulation builds solutions iteratively in topological subproblem order.', '[{"label": "Richard Bellman: Dynamic Programming (1957 Princeton University Press Classic)", "url": "https://press.princeton.edu/books/paperback/9780691146683/dynamic-programming"}, {"label": "MIT OpenCourseWare 6.006: Dynamic Programming — Memoization, Subproblems, Guessing", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-15-dynamic-programming-part-1-srs-fibonacci-shortest-paths/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('longest-common-subsequence-diff-algorithms', 'tech', 'data-structures-algorithms', ARRAY['dp', 'lcs', 'diff', 'algorithms']::TEXT[], 'Longest Common Subsequence (LCS) & Myers Diff Algorithm', 'The Longest Common Subsequence problem determines the longest ordered element sequence shared between sequences, solved in $O(MN)$ time via dynamic programming table recurrence. Myers'' algorithm models sequence alignment as finding the shortest path on an edit grid, discovering minimal diffs in $O(ND)$ time where $D$ is edit count.', '[{"label": "Eugene W. Myers: An O(ND) Difference Algorithm and Its Variations (Algorithmica 1986)", "url": "http://www.xmailserver.org/diff2.pdf"}, {"label": "Hirschberg: A Linear Space Algorithm for Computing Maximal Common Subsequences (CACM 1975)", "url": "https://dl.acm.org/doi/10.1145/360825.360861"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('knapsack-problem-and-pseudo-polynomial-time', 'tech', 'data-structures-algorithms', ARRAY['dp', 'knapsack', 'np-complete', 'pseudo-polynomial']::TEXT[], '0/1 Knapsack Problem & Pseudo-Polynomial Dynamic Programming', 'The 0/1 Knapsack problem selects an optimal value subset under a fixed weight capacity constraint, exhibiting NP-complete complexity in the general case. Dynamic programming solves the problem in $O(N \times W)$ time, which is pseudo-polynomial because runtime scales with the numeric value of $W$ rather than the binary input length $\log W$.', '[{"label": "Martello & Toth: Knapsack Problems: Algorithms and Computer Implementations (Wiley)", "url": "https://www.or.deis.unibo.it/kp/Chapter1.pdf"}, {"label": "Stanford CS161: Dynamic Programming and the Knapsack Problem", "url": "https://web.stanford.edu/class/archive/cs/cs161/cs161.1168/lecture12.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('matrix-chain-multiplication-dp', 'tech', 'data-structures-algorithms', ARRAY['dp', 'matrix-chain', 'optimization', 'algorithms']::TEXT[], 'Matrix Chain Multiplication: Optimal Parenthesization & Interval DP', 'Matrix Chain Multiplication determines the parenthesization order that minimizes total scalar multiplications across a sequence of matrices of varying dimensions. The problem uses interval dynamic programming over sub-chain length intervals, evaluating recurrence relations across $O(N^3)$ states without computing the actual matrix products.', '[{"label": "Cormen, Leiserson, Rivest, Stein: Introduction to Algorithms (CLRS Chapter 15: Dynamic Programming)", "url": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"}, {"label": "Hu & Shing: Computation of Matrix Chain Products (SIAM Journal on Computing 1982)", "url": "https://epubs.siam.org/doi/10.1137/0211028"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('bitmask-dynamic-programming-tsp', 'tech', 'data-structures-algorithms', ARRAY['dp', 'bitmask', 'traveling-salesman', 'held-karp']::TEXT[], 'Bitmask Dynamic Programming: Held-Karp Traveling Salesperson Algorithm', 'Bitmask DP represents subset state configurations as integer binary bitmasks, enabling compact state space indexing and $O(1)$ set manipulation via bitwise operations (`mask | (1 << v)`). The Held-Karp algorithm solves the NP-hard Traveling Salesperson Problem (TSP) in $O(N^2 2^N)$ time, an exponential improvement over $O(N!)$ brute force enumeration.', '[{"label": "Michael Held & Richard M. Karp: A Dynamic Programming Approach to Sequencing Problems (SIAM 1962)", "url": "https://epubs.siam.org/doi/10.1137/0110015"}, {"label": "CP-Algorithms: Dynamic Programming with Bitmasking & TSP", "url": "https://cp-algorithms.com/algebra/all-submasks.html"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('convex-hull-trick-and-li-chao-tree', 'tech', 'data-structures-algorithms', ARRAY['dp', 'convex-hull-trick', 'li-chao-tree', 'optimization']::TEXT[], 'Convex Hull Trick & Li Chao Trees: Linear-Time Dynamic Programming Optimization', 'The Convex Hull Trick optimizes DP transitions of the form $dp[i] = \min_{j < i} (dp[j] + m_j x_i + c_j)$ from $O(N^2)$ to $O(N \log N)$ by maintaining the lower envelope of linear candidate functions. The Li Chao Segment Tree maintains line segments dynamically, supporting arbitrary non-monotonic queries and line insertions in logarithmic time.', '[{"label": "CP-Algorithms: Convex Hull Trick & Li Chao Tree Dynamic Programming Optimization", "url": "https://cp-algorithms.com/geometry/convex_hull_trick.html"}, {"label": "Codeforces Tutorial: Li Chao Segment Tree for Dynamic Line Envelopes", "url": "https://codeforces.com/blog/entry/51532"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('tree-dynamic-programming-and-rerooting', 'tech', 'data-structures-algorithms', ARRAY['dp', 'tree-dp', 'rerooting', 'algorithms']::TEXT[], 'Tree Dynamic Programming & All-Roots Rerooting Technique', 'Tree DP calculates subtree properties (tree diameter, independent sets) using bottom-up post-order DFS traversals in $O(N)$ time. The Rerooting Technique performs a second top-down DFS pass to compute the global answer for every possible tree vertex as the root in $O(N)$ total time, avoiding naive $O(N^2)$ re-computations.', '[{"label": "Codeforces Tutorial: Tree DP and Rerooting Fundamentals", "url": "https://codeforces.com/blog/entry/20935"}, {"label": "USACO Guide: Tree DP and All-Root Aggregations", "url": "https://usaco.guide/gold/all-roots"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('amortized-analysis-methods', 'tech', 'data-structures-algorithms', ARRAY['complexity', 'amortized-analysis', 'potential-method', 'algorithms']::TEXT[], 'Amortized Complexity Analysis: Aggregate, Accounting & Potential Methods', 'Amortized analysis bounds the average runtime of an operation sequence without probabilistic assumptions, proving worst-case guarantees over series of operations like dynamic array resizing. The Potential Method defines a mathematical potential function $\Phi(D_i)$ tracking stored credit, calculating amortized cost as $c_i + \Phi(D_i) - \Phi(D_{i-1})$.', '[{"label": "Robert E. Tarjan: Amortized Computational Complexity (SIAM J. Alg. Disc. Meth. 1985)", "url": "https://epubs.siam.org/doi/10.1137/0606031"}, {"label": "MIT OpenCourseWare 6.046J: Design and Analysis of Algorithms — Amortized Analysis", "url": "https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/resources/lecture-13-amortized-analysis/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('p-vs-np-and-np-completeness-reductions', 'tech', 'data-structures-algorithms', ARRAY['complexity', 'p-vs-np', 'np-complete', 'cook-levin']::TEXT[], 'P vs. NP, Cook-Levin Theorem & Polynomial-Time Reductions', 'Complexity class P contains decision problems solvable in deterministic polynomial time, while NP contains problems verifiable in polynomial time. The Cook-Levin theorem proved Boolean Satisfiability (SAT) is NP-Complete, establishing that any problem in NP can be polynomial-time Karp-reduced ($A \le_p B$) to demonstrate equivalent computational hardness.', '[{"label": "Stephen A. Cook: The Complexity of Theorem-Proving Procedures (ACM STOC 1971 Cook''s Theorem)", "url": "https://dl.acm.org/doi/10.1145/800157.805047"}, {"label": "Richard M. Karp: Reducibility Among Combinatorial Problems (1972 21 NP-Complete Problems)", "url": "https://link.springer.com/chapter/10.1007/978-1-4684-2001-2_9"}, {"label": "Michael Sipser: Introduction to the Theory of Computation (Chapter 7: Time Complexity)", "url": "https://www.cengage.com/c/introduction-to-the-theory-of-computation-3e-sipser/9781133187790/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('competitive-analysis-online-algorithms', 'tech', 'data-structures-algorithms', ARRAY['complexity', 'online-algorithms', 'competitive-analysis', 'paging']::TEXT[], 'Online Algorithms & Competitive Analysis: Paging and the $k$-Server Problem', 'Online algorithms process incoming requests in real-time without future knowledge, evaluated by their competitive ratio comparing their performance against an optimal clairvoyant offline algorithm (OPT). In cache paging, LRU achieves a tight $k$-competitive ratio for cache size $k$, matching theoretical lower bounds for deterministic online paging.', '[{"label": "Sleator & Tarjan: Amortized Efficiency of List Update and Paging Rules (CACM 1985)", "url": "https://dl.acm.org/doi/10.1145/3828.3835"}, {"label": "Borodin & El-Yaniv: Online Computation and Competitive Analysis (Cambridge University Press)", "url": "https://www.cambridge.org/core/books/online-computation-and-competitive-analysis/D1F0FF639906FFB07FE0561578F4F2BA"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('master-theorem-for-divide-and-conquer', 'tech', 'data-structures-algorithms', ARRAY['complexity', 'master-theorem', 'recurrences', 'divide-and-conquer']::TEXT[], 'Master Theorem & Akra-Bazzi Method: Solving Divide-and-Conquer Recurrences', 'The Master Theorem provides closed-form asymptotic bounds for divide-and-conquer recurrences of the form $T(n) = a T(n/b) + f(n)$ by comparing $f(n)$ with the watershed function $n^{\log_b a}$. The Akra-Bazzi method generalizes this framework to recurrences with unequal subproblem partition sizes and variable step floors/ceilings.', '[{"label": "Akra & Bazzi: On the Solution of Linear Recurrence Equations (Computational Optimization and Applications 1998)", "url": "https://link.springer.com/article/10.1023/A:1008687203004"}, {"label": "Cormen, Leiserson, Rivest, Stein: Introduction to Algorithms (CLRS Chapter 4: Divide-and-Conquer)", "url": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('approximation-algorithms-and-ptas', 'tech', 'data-structures-algorithms', ARRAY['complexity', 'approximation', 'ptas', 'np-hard']::TEXT[], 'Approximation Algorithms & Polynomial-Time Approximation Schemes (PTAS)', 'When NP-hard problems resist exact polynomial-time solutions, approximation algorithms guarantee solutions within a bounded factor $\alpha$ of the optimal cost. A Polynomial-Time Approximation Scheme (PTAS) produces a $(1 + \epsilon)$-approximation in time polynomial in $N$ for any fixed $\epsilon > 0$, formalizing theoretical limits of tractability.', '[{"label": "David P. Williamson & David B. Shmoys: The Design of Approximation Algorithms (Cambridge University Press)", "url": "https://www.designofapproxalgs.com/"}, {"label": "Vazirani: Approximation Algorithms (Springer Book)", "url": "https://link.springer.com/book/10.1007/978-3-662-04565-7"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('space-time-tradeoffs-and-cell-probe-model', 'tech', 'data-structures-algorithms', ARRAY['complexity', 'cell-probe', 'lower-bounds', 'information-theory']::TEXT[], 'Space-Time Tradeoffs & The Yao/Miltersen Cell-Probe Model for Lower Bounds', 'The cell-probe model establishes fundamental data structure lower bounds by measuring only memory cell access count during query evaluation, ignoring CPU calculation costs. Yao''s Minimax Principle and information-theoretic communication complexity prove inherent space-time tradeoffs between index memory footprints and worst-case query latencies.', '[{"label": "Andrew Chi-Chih Yao: Should Tables Be Sorted? (IEEE FOCS 1978)", "url": "https://ieeexplore.ieee.org/document/4567957"}, {"label": "Peter Bro Miltersen: Lower Bounds on Data Behavior in the Cell Probe Model (Survey)", "url": "https://www.cs.au.dk/~bromille/Papers/surv.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('disjoint-set-union-find-path-compression', 'tech', 'data-structures-algorithms', ARRAY['data-structures', 'dsu', 'union-find', 'amortized']::TEXT[], 'Disjoint Set Union (DSU): Path Compression & Inverse Ackermann Complexity', 'Disjoint Set Union manages partitions of an equivalence set across dynamic disjoint groups supporting near-constant time union and find operations. Combining union by rank with path compression flattens tree traversal depths, yielding an amortized complexity of $O(\alpha(N))$ per operation where $\alpha$ is the extremely slow-growing inverse Ackermann function.', '[{"label": "Robert E. Tarjan: Efficiency of a Good But Not Linear Set Union Algorithm (JACM 1975)", "url": "https://dl.acm.org/doi/10.1145/321879.321884"}, {"label": "Tarjan & van Leeuwen: Worst-Case Analysis of Several Set Union Algorithms (JACM 1984)", "url": "https://dl.acm.org/doi/10.1145/62.2160"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('lock-free-queue-michael-scott', 'tech', 'data-structures-algorithms', ARRAY['concurrency', 'lock-free', 'queues', 'cas']::TEXT[], 'Lock-Free Queues: The Michael & Scott Compare-And-Swap (CAS) Algorithm', 'The Michael & Scott lock-free queue implements a concurrent FIFO queue using atomic Compare-And-Swap (CAS) primitives over a singly-linked list with a dummy head node. Enqueue operations update the tail pointer in two CAS stages with cooperative helper progression to prevent lagging threads from blocking overall queue throughput.', '[{"label": "Maged M. Michael & Michael L. Scott: Simple, Fast, and Practical Non-Blocking and Blocking Concurrent Queue Algorithms (ACM PODC 1996)", "url": "https://dl.acm.org/doi/10.1145/248052.248106"}, {"label": "Maurice Herlihy & Nir Shavit: The Art of Multiprocessor Programming (Chapter 10: Concurrent Queues)", "url": "https://dl.acm.org/doi/book/10.5555/2385452"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('aba-problem-hazard-pointers-epoch-reclamation', 'tech', 'data-structures-algorithms', ARRAY['concurrency', 'lock-free', 'hazard-pointers', 'memory-reclamation']::TEXT[], 'Memory Reclamation in Lock-Free Structures: The ABA Problem & Hazard Pointers', 'In lock-free algorithms, the ABA problem occurs when a memory pointer is freed and reallocated with identical address values, tricking CAS checks into executing on stale state. Solutions include tagged pointers with monotonic version counters, Hazard Pointers for thread-local memory protection, and Epoch-Based Reclamation (EBR) to defer deallocations safely.', '[{"label": "Maged M. Michael: Hazard Pointers: Safe Memory Reclamation for Lock-Free Objects (IEEE TPDS 2004)", "url": "https://dl.acm.org/doi/10.1109/TPDS.2004.8"}, {"label": "Keir Fraser: Practical Lock-Free Computing (University of Cambridge PhD Thesis 2004)", "url": "https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-579.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('read-copy-update-rcu-synchronization', 'tech', 'data-structures-algorithms', ARRAY['concurrency', 'rcu', 'synchronization', 'operating-systems']::TEXT[], 'Read-Copy Update (RCU): Lockless Concurrent Read Scaling & Grace Periods', 'Read-Copy Update allows concurrent reader threads to traverse linked data structures with zero lock overhead, atomic memory barriers, or cache line bouncing. Writers modify data by publishing pointer updates to private copies, deferring physical deallocation of old versions until all active readers complete an intervening grace period.', '[{"label": "Paul E. McKenney & John D. Slingwine: Read-Copy Update: Using Execution History to Solve Concurrency Problems (PDCS 1998)", "url": "https://www.kernel.org/doc/Documentation/RCU/rcu.txt"}, {"label": "Paul E. McKenney: Is Parallel Programming Hard, And, If So, What Can You Do About It? (Kernel.org Book)", "url": "https://mirrors.edge.kernel.org/pub/linux/kernel/people/paulmck/perfbook/perfbook.html"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('concurrent-hash-tables-striped-locking-lock-free', 'tech', 'data-structures-algorithms', ARRAY['concurrency', 'hash-tables', 'striped-locking', 'concurrent-map']::TEXT[], 'Concurrent Hash Tables: Lock Striping, Split-Ordered Lists & Cliff Click''s Map', 'Concurrent hash tables scale read/write throughput across multi-core processors by avoiding monolithic synchronization locks. Techniques include Lock Striping over bucket arrays, Split-Ordered Lists for lock-free dynamic resizing via reversed bit hashes, and Cliff Click''s non-blocking open-addressed hash map using atomic state machine slots.', '[{"label": "Ori Shalev & Nir Shavit: Split-Ordered Lists: Lock-Free Extensible Hash Tables (JACM 2006)", "url": "https://dl.acm.org/doi/10.1145/1147954.1147958"}, {"label": "Cliff Click: A Fast Long-Keyed Non-Blocking Hash Map (Azul Systems 2007)", "url": "https://github.com/boundary/high-scale-lib/blob/master/src/main/java/org/cliffc/high_scale_lib/NonBlockingHashMap.java"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('work-stealing-deque-chase-lev', 'tech', 'data-structures-algorithms', ARRAY['concurrency', 'work-stealing', 'deque', 'schedulers']::TEXT[], 'Work-Stealing Deques: The Chase-Lev Lock-Free Scheduling Deque', 'The Chase-Lev work-stealing deque enables work-stealing thread schedulers (used in Go runtime, Java ForkJoinPool, Tokio) to balance task loads across CPU cores. The worker thread pushes and pops tasks from the bottom of the deque in LIFO order with minimal lock-free overhead, while idle thief threads steal tasks from the top in FIFO order via CAS.', '[{"label": "David Chase & Yossi Lev: Dynamic Circular Work-Stealing Deque (ACM SPAA 2005 Original Paper)", "url": "https://dl.acm.org/doi/10.1145/1073970.1073974"}, {"label": "Robert D. Blumofe & Charles E. Leiserson: Scheduling Multithreaded Computations by Work Stealing (JACM 1999)", "url": "https://dl.acm.org/doi/10.1145/324133.324234"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('spatial-indices-r-tree-and-kd-tree', 'tech', 'data-structures-algorithms', ARRAY['data-structures', 'spatial', 'r-tree', 'kd-tree', 'geometry']::TEXT[], 'Spatial Partitioning: $k$-d Trees, Quadtrees & R-Tree Spatial Indexing', '$k$-d Trees partition $k$-dimensional points by alternating orthogonal splitting planes across coordinate dimensions, optimizing multi-dimensional range searches and exact nearest neighbor queries. R-Trees group spatial objects into hierarchical Minimum Bounding Boxes (MBRs), enabling efficient spatial containment and intersection queries in GIS databases.', '[{"label": "Antonin Guttman: R-Trees: A Dynamic Index Structure for Spatial Searching (ACM SIGMOD 1984)", "url": "https://dl.acm.org/doi/10.1145/602259.602266"}, {"label": "Jon Louis Bentley: Multidimensional Binary Search Trees Used for Associative Searching (CACM 1975)", "url": "https://dl.acm.org/doi/10.1145/361002.361007"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('persistent-data-structures-fat-nodes-node-copying', 'tech', 'data-structures-algorithms', ARRAY['data-structures', 'persistent-structures', 'functional', 'versioning']::TEXT[], 'Persistent Data Structures: Path Copying, Fat Nodes & Functional Trees', 'Persistent data structures preserve historical versions across modifications, supporting queries on past states (partially persistent) or branching updates on historical states (fully persistent). Functional tree implementations use path copying to duplicate only modified ancestor nodes along the root-to-leaf path, sharing unaffected subtrees in $O(\log N)$ time and space.', '[{"label": "Driscoll, Sarnak, Sleator, Tarjan: Making Data Structures Persistent (STOC 1986 / JCSS 1989)", "url": "https://dl.acm.org/doi/10.1145/12130.12142"}, {"label": "Chris Okasaki: Purely Functional Data Structures (Cambridge University Press)", "url": "https://www.cambridge.org/core/books/purely-functional-data-structures/0A4C84C0CD207399EA225B810052AE08"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('binary-heap-and-d-ary-heaps', 'tech', 'data-structures-algorithms', ARRAY['data-structures', 'heaps', 'priority-queue', 'cache-friendly']::TEXT[], 'Priority Queues: Binary Heaps, $d$-ary Heaps & Cache-Conscious Layouts', 'A Binary Heap represents a complete binary tree in a flat array where parent-child navigation uses arithmetic index operations (`2i + 1`, `2i + 2`), supporting $O(\log N)$ insertions and extract-min. Increasing the branching factor to a $d$-ary heap reduces tree height and improves cache locality, accelerating priority updates in shortest path and routing workloads.', '[{"label": "J. W. J. Williams: Algorithm 232: Heapsort (1964 Original Binary Heap Paper)", "url": "https://dl.acm.org/doi/10.1145/512274.512284"}, {"label": "Donald E. Knuth: The Art of Computer Programming (Volume 3: Heaps & Priority Queues)", "url": "https://www-cs-faculty.stanford.edu/~knuth/taocp.html"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('fibonacci-and-pairing-heaps', 'tech', 'data-structures-algorithms', ARRAY['data-structures', 'heaps', 'fibonacci-heap', 'pairing-heap']::TEXT[], 'Mergeable Heaps: Fibonacci Heaps & Self-Adjusting Pairing Heaps', 'Fibonacci heaps delay tree consolidation until extraction operations, achieving optimal $O(1)$ amortized insertion, decrease-key, and heap merge times with $O(\log N)$ extract-min. Pairing Heaps provide a simpler, self-adjusting alternative with lower constant factors and exceptional practical performance in graph optimization routines.', '[{"label": "Fredman, Sedgewick, Sleator, Tarjan: The Pairing Heap: A New Form of Self-Adjusting Heap (Algorithmica 1986)", "url": "https://link.springer.com/article/10.1007/BF01840439"}, {"label": "Fredman & Tarjan: Fibonacci Heaps and Their Uses in Improved Network Optimization Algorithms (JACM 1987)", "url": "https://dl.acm.org/doi/10.1145/28869.28874"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

