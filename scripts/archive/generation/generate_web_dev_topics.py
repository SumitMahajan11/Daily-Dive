import csv
import json
import os

topics = [
    # -------------------------------------------------------------------------
    # 1. Rendering Architecture & Hydration Patterns
    # -------------------------------------------------------------------------
    {
        "id": "react-server-components-protocol",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "rendering;rsc;react;streaming",
        "title": "React Server Components (RSC) & Flight Wire Format",
        "description": "RSCs execute strictly on the server during build or request time, outputting a serialized JSON-like stream (the Flight protocol) containing UI tree references and serialized props. The client parses this stream to incrementally merge updated virtual DOM nodes without re-executing server logic or bundling server dependencies into the client JS bundle.",
        "resources": [
            {"label": "React RFC: React Server Components Specification", "url": "https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md"},
            {"label": "Next.js Documentation: Server Components Architecture", "url": "https://nextjs.org/docs/app/building-your-application/rendering/server-components"},
            {"label": "Dan Abramov & Joe Savona: RSC from Scratch Exploration", "url": "https://github.com/reactwg/server-components/discussions/5"}
        ]
    },
    {
        "id": "streaming-ssr-and-selective-hydration",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "rendering;ssr;hydration;react",
        "title": "Streaming SSR & Selective Hydration with React Suspense",
        "description": "Streaming Server-Side Rendering uses HTML chunking via HTTP/1.1 chunked transfer encoding or HTTP/2 streams to flush static page shells early. Selective Hydration wraps slow asynchronous data subtrees inside `<Suspense>` boundaries, allowing the browser to hydrate interactive components before lagging data chunks finish loading.",
        "resources": [
            {"label": "React Working Group: New Suspense SSR Architecture in React 18", "url": "https://github.com/reactwg/react-18/discussions/37"},
            {"label": "MDN Web Docs: Streaming HTML with ReadableStream & Fetch", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams"}
        ]
    },
    {
        "id": "incremental-static-regeneration-isr",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "rendering;isr;ssg;nextjs",
        "title": "Incremental Static Regeneration (ISR) & Stale-While-Revalidate Caching",
        "description": "ISR allows static pages to be regenerated in the background on a per-page basis without rebuilding the entire website. When a request exceeds the revalidation interval, the edge CDN serves the cached stale static page immediately while triggering an asynchronous background worker to rebuild and update the cache.",
        "resources": [
            {"label": "Next.js Documentation: Incremental Static Regeneration (ISR)", "url": "https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration"},
            {"label": "RFC 5861: HTTP Cache-Control Extensions for Stale Content", "url": "https://datatracker.ietf.org/doc/html/rfc5861"}
        ]
    },
    {
        "id": "islands-architecture-and-partial-hydration",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "rendering;islands;astro;performance",
        "title": "Islands Architecture: Zero-JS Defaults & Independent Partial Hydration",
        "description": "Islands Architecture renders pages as pure static HTML by default, embedding small, isolated dynamic component 'islands' (e.g. interactive carousels or search bars). Each island hydrates independently via client directives (e.g. `client:visible`, `client:idle`), eliminating monolithic root hydration waterfalls.",
        "resources": [
            {"label": "Jason Miller: Islands Architecture Concept (Architecture Blog)", "url": "https://jasonformat.com/islands-architecture/"},
            {"label": "Astro Documentation: Astro Islands & Client Directives", "url": "https://docs.astro.build/en/concepts/islands/"}
        ]
    },
    {
        "id": "resumability-vs-hydration-qwik",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "rendering;qwik;resumability;performance",
        "title": "Resumability vs. Hydration: Serialized Execution State & Qwik",
        "description": "Hydration requires the client browser to download, parse, and execute all component code to rebuild event listener bindings and virtual DOM state. Resumability serializes the entire framework execution state, component closures, and listener handlers directly into the HTML DOM, enabling instant interactivity with 0 KB initial JavaScript execution.",
        "resources": [
            {"label": "Miško Hevery: HTML-first JavaScript Framework (Qwik Docs)", "url": "https://qwik.dev/docs/concepts/resumable/"},
            {"label": "Builder.io: Hydration is Pure Overhead (Miško Hevery)", "url": "https://www.builder.io/blog/hydration-is-pure-overhead"}
        ]
    },

    # -------------------------------------------------------------------------
    # 2. Browser Internals & Execution Pipelines
    # -------------------------------------------------------------------------
    {
        "id": "browser-event-loop-microtasks-macrotasks",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "javascript;browser-internals;event-loop;async",
        "title": "JavaScript Event Loop: Task Queues, Microtasks & Rendering Frames",
        "description": "The browser execution loop processes one macrotask (timer callbacks, I/O events) per iteration, followed by completely draining the microtask queue (Promise callbacks, MutationObserver, `queueMicrotask`) before yielding to the rendering pipeline (`requestAnimationFrame`, style recalculation, layout, paint).",
        "resources": [
            {"label": "WHATWG HTML Living Standard: Event Loops Processing Model", "url": "https://html.spec.whatwg.org/multipage/webappapis.html#event-loops"},
            {"label": "Jake Archibald: In The Loop (JSConf Event Loop Deep Dive)", "url": "https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/"},
            {"label": "MDN Web Docs: Using microtasks and the JavaScript runtime environment", "url": "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide"}
        ]
    },
    {
        "id": "v8-engine-ignition-sparkplug-turbofan",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "v8;javascript;compilers;jit",
        "title": "V8 Engine Execution Pipeline: Ignition Bytecode, Sparkplug & TurboFan JIT",
        "description": "V8 compiles JavaScript into bytecode via the Ignition interpreter for instant startup. The Sparkplug non-optimizing compiler quickly produces baseline native code, while the TurboFan JIT compiler analyzes runtime feedback vector profiling to speculate and generate highly-optimized machine assembly, deoptimizing back to bytecode if shape assumptions fail.",
        "resources": [
            {"label": "V8 JavaScript Engine: Launching Ignition and TurboFan", "url": "https://v8.dev/blog/launching-ignition-and-turbofan"},
            {"label": "V8 Blog: Sparkplug — A Fast Non-Optimizing Compiler", "url": "https://v8.dev/blog/sparkplug"},
            {"label": "Franziska Hinkelmann: JavaScript Engine Fundamentals (V8 Dev)", "url": "https://mathiasbynens.be/notes/shapes-ics"}
        ]
    },
    {
        "id": "browser-rendering-pipeline-layout-paint-composite",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "browser-internals;rendering;compositing;performance",
        "title": "Browser Critical Rendering Path: DOM/CSSOM, Layout, Paint & GPU Compositing",
        "description": "The rendering engine combines the DOM and CSSOM into a Render Tree, calculates geometry bounding boxes (Layout/Reflow), converts visual records into raster pixel bitmaps (Paint), and uploads transformed paint layers as textures to GPU memory for hardware-accelerated compositing without re-triggering CPU layout.",
        "resources": [
            {"label": "Chromium Documentation: Life of a Pixel Rendering Pipeline", "url": "https://chromium.googlesource.com/chromium/src/+/master/docs/life_of_a_pixel.md"},
            {"label": "Google Developers: Critical Rendering Path & Rendering Performance", "url": "https://web.dev/critical-rendering-path/"},
            {"label": "CSS Triggers: Layout, Paint, and Composite Performance Catalog", "url": "https://csstriggers.com/"}
        ]
    },
    {
        "id": "web-workers-and-transferable-objects",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "javascript;concurrency;web-workers;memory",
        "title": "Dedicated Web Workers, SharedArrayBuffer & Transferable Objects",
        "description": "Web Workers offload heavy computational tasks off the browser main thread via separate OS threads. Inter-thread communication uses `postMessage()` with structured cloning or zero-copy Transferable Objects (ArrayBuffer), while `SharedArrayBuffer` enables concurrent memory access synchronized via the `Atomics` API.",
        "resources": [
            {"label": "MDN Web Docs: Web Workers API and Threading Model", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API"},
            {"label": "MDN Web Docs: Transferable objects and Zero-Copy Data Transfer", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects"},
            {"label": "JavaScript Atomics & SharedArrayBuffer Specification", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics"}
        ]
    },
    {
        "id": "speculative-parsing-and-preload-scanner",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "browser-internals;performance;html-parsing",
        "title": "HTML Speculative Parsing & Secondary Preload Scanners",
        "description": "When the primary HTML parser blocks on synchronous external `<script>` tags, a background thread (the Preload Scanner) speculatively scans raw HTML ahead of the parser. It initiates early high-priority network fetches for upcoming stylesheets, external scripts, and critical images to minimize render-blocking waterfall latency.",
        "resources": [
            {"label": "WebKit Blog: How the HTML Preload Scanner Accelerates Page Loads", "url": "https://webkit.org/blog/507/preload-scanner/"},
            {"label": "Google Developers: Optimize Resource Loading with the Preload Scanner", "url": "https://web.dev/preload-scanner/"}
        ]
    },

    # -------------------------------------------------------------------------
    # 3. Realtime Protocols & Web Networking
    # -------------------------------------------------------------------------
    {
        "id": "websocket-protocol-framing-and-handshake",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "networking;websockets;protocols;rfc6455",
        "title": "WebSocket Protocol: RFC 6455 Handshake, Frame Masks & Heartbeating",
        "description": "WebSockets upgrade HTTP connections into full-duplex persistent TCP channels via the `Upgrade: websocket` header handshake. Client-to-server data frames are obfuscated with a 4-byte XOR masking key to prevent intermediate proxy cache poisoning, while ping/pong control frames ensure link liveness.",
        "resources": [
            {"label": "RFC 6455: The WebSocket Protocol Specification", "url": "https://datatracker.ietf.org/doc/html/rfc6455"},
            {"label": "MDN Web Docs: The WebSocket API Architecture", "url": "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API"}
        ]
    },
    {
        "id": "webrtc-peer-connections-and-ice-sdp",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "networking;webrtc;p2p;realtime",
        "title": "WebRTC Architecture: SDP Offer/Answer, NAT Traversal (STUN/TURN) & ICE",
        "description": "WebRTC enables real-time peer-to-peer audio, video, and binary DataChannel communication directly between browsers. Signaling exchanges media session capabilities via Session Description Protocol (SDP), while the Interactive Connectivity Establishment (ICE) protocol tests STUN direct bindings and falls back to TURN relays when symmetric NATs block direct routes.",
        "resources": [
            {"label": "W3C Recommendation: WebRTC 1.0 Real-Time Communication Between Browsers", "url": "https://www.w3.org/TR/webrtc/"},
            {"label": "RFC 8445: Interactive Connectivity Establishment (ICE) Protocol", "url": "https://datatracker.ietf.org/doc/html/rfc8445"},
            {"label": "WebRTC for the Curious: Deep Dive into P2P Protocols", "url": "https://webrtcforthecurious.com/"}
        ]
    },
    {
        "id": "server-sent-events-sse-vs-websockets",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "networking;sse;http;streaming",
        "title": "Server-Sent Events (SSE): HTTP/2 Stream Multiplexing & Auto-Reconnection",
        "description": "Server-Sent Events deliver unidirectional server-to-client updates over standard persistent HTTP connections using the `text/event-stream` MIME type. Unlike WebSockets, SSE natively supports automated browser reconnection with `Last-Event-ID` state recovery, HTTP/2 multiplexing, and standard corporate proxy firewall traversal.",
        "resources": [
            {"label": "WHATWG HTML Living Standard: Server-Sent Events Specification", "url": "https://html.spec.whatwg.org/multipage/server-sent-events.html"},
            {"label": "MDN Web Docs: Using Server-Sent Events (EventSource API)", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events"}
        ]
    },
    {
        "id": "http2-vs-http3-quic-head-of-line-blocking",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "networking;http2;http3;quic",
        "title": "HTTP/2 vs. HTTP/3 (QUIC): Solving TCP Head-of-Line (HoL) Blocking",
        "description": "HTTP/2 multiplexes multiple streams over a single TCP connection, but a single lost packet blocks all concurrent streams at the OS TCP transport layer (TCP Head-of-Line blocking). HTTP/3 replaces TCP with QUIC over UDP, ensuring that packet loss on one stream does not stall or delay independent concurrent streams.",
        "resources": [
            {"label": "RFC 9114: HTTP/3 Protocol Specification (IETF)", "url": "https://datatracker.ietf.org/doc/html/rfc9114"},
            {"label": "RFC 9000: QUIC: A UDP-Based Multiplexed and Secure Transport", "url": "https://datatracker.ietf.org/doc/html/rfc9000"},
            {"label": "Cloudflare: The Road to HTTP/3 and QUIC Architecture", "url": "https://blog.cloudflare.com/the-road-to-http-2/"}
        ]
    },
    {
        "id": "web-streams-api-and-backpressure",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "javascript;streams;backpressure;async",
        "title": "Web Streams API: ReadableStream, WritableStream & Backpressure Handling",
        "description": "The Web Streams API enables processing network payloads chunk-by-chunk in real time rather than buffering entire gigabyte responses in memory. Built-in backpressure signals through `TransformStream` pipes communicate consumer processing bottlenecks upstream, pacing producer flow to prevent memory exhaustion.",
        "resources": [
            {"label": "WHATWG Streams Living Standard Specification", "url": "https://streams.spec.whatwg.org/"},
            {"label": "MDN Web Docs: Streams API Architecture and Concepts", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Streams_API"},
            {"label": "Google Developers: 2016 - the year of web streams (Jake Archibald)", "url": "https://jakearchibald.com/2016/streams-ftw/"}
        ]
    },

    # -------------------------------------------------------------------------
    # 4. Performance Engineering & Core Web Vitals
    # -------------------------------------------------------------------------
    {
        "id": "core-web-vitals-inp-lcp-cls",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "performance;web-vitals;inp;lcp;cls",
        "title": "Core Web Vitals: Interaction to Next Paint (INP), LCP & Cumulative Layout Shift (CLS)",
        "description": "INP measures user interface responsiveness across all interactions, tracking input delay, event processing duration, and presentation delay. LCP tracks the render timestamp of the largest visible content block, while CLS quantifies unexpected visual instability using layout shift score formulas.",
        "resources": [
            {"label": "Google Web.dev: Interaction to Next Paint (INP) Specification", "url": "https://web.dev/inp/"},
            {"label": "Google Web.dev: Largest Contentful Paint (LCP) Optimization", "url": "https://web.dev/lcp/"},
            {"label": "Google Web.dev: Cumulative Layout Shift (CLS) Mechanics", "url": "https://web.dev/cls/"}
        ]
    },
    {
        "id": "code-splitting-and-dynamic-imports",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "performance;bundling;code-splitting;webpack",
        "title": "Code Splitting Architecture: Route-Level, Component Lazy Loading & Chunk Graph Splitting",
        "description": "Modern bundlers parse dynamic `import()` statements into separate chunk entry points in the dependency graph. Route-based code splitting prevents loading unnecessary route JS on initial landing, while granular vendor splitting caches long-lived third-party libraries across application feature releases.",
        "resources": [
            {"label": "Webpack Documentation: Code Splitting Concepts and Optimization", "url": "https://webpack.js.org/guides/code-splitting/"},
            {"label": "React Documentation: Code Splitting with React.lazy and Suspense", "url": "https://react.dev/reference/react/lazy"},
            {"label": "Vite Guide: Dynamic Import Chunking Optimization", "url": "https://vitejs.dev/guide/features.html#dynamic-import"}
        ]
    },
    {
        "id": "css-containment-and-content-visibility",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "css;performance;containment;rendering",
        "title": "CSS Containment: contain Property & content-visibility: auto",
        "description": "CSS Containment (`contain: layout paint style`) isolates subtrees from the rest of the document, preventing DOM mutations within a child element from triggering global reflows across the page. Setting `content-visibility: auto` skips rendering and layout computations for off-screen elements until they approach the viewport.",
        "resources": [
            {"label": "W3C CSS Containment Module Level 3 Specification", "url": "https://www.w3.org/TR/css-contain-3/"},
            {"label": "Google Web.dev: content-visibility: the new CSS property that boosts your rendering performance", "url": "https://web.dev/content-visibility/"},
            {"label": "MDN Web Docs: CSS contain property", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/contain"}
        ]
    },
    {
        "id": "browser-bfcache-back-forward-cache",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "performance;bfcache;browsers;navigation",
        "title": "Back/Forward Cache (bfcache): In-Memory Page Freezing & Lifecycle Events",
        "description": "The bfcache stores an entire frozen snapshot of the live DOM, JavaScript execution context, and rendering state in browser memory when users navigate away. Instantaneous back/forward navigation restores this snapshot without re-executing network requests, requiring developers to handle `pageshow`/`pagehide` events and avoid open WebSocket/IndexedDB locks.",
        "resources": [
            {"label": "Google Web.dev: Back/forward cache (bfcache) Optimization Guide", "url": "https://web.dev/bfcache/"},
            {"label": "WebKit Documentation: Page Cache Lifecycle and Considerations", "url": "https://webkit.org/blog/427/webkit-page-cache-i-the-basics/"}
        ]
    },
    {
        "id": "resource-hints-preload-prefetch-modulepreload",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "performance;resource-hints;html;networking",
        "title": "Resource Hints: rel=preload, prefetch, preconnect & modulepreload",
        "description": "`preload` forces immediate high-priority retrieval of critical late-discovered assets (fonts, hero images), while `prefetch` fetches anticipated next-page resources during idle time. `modulepreload` fetches, compiles, and parses ES modules into the module map before execution, eliminating serial dependency waterfalls.",
        "resources": [
            {"label": "W3C Recommendation: Resource Hints (Preconnect, Prefetch)", "url": "https://www.w3.org/TR/resource-hints/"},
            {"label": "W3C Preload Specification Standard", "url": "https://www.w3.org/TR/preload/"},
            {"label": "Google Web.dev: Preload critical assets to improve loading speed", "url": "https://web.dev/preload-critical-assets/"}
        ]
    },

    # -------------------------------------------------------------------------
    # 5. Offline Capabilities, Service Workers & PWAs
    # -------------------------------------------------------------------------
    {
        "id": "service-worker-lifecycle-and-clients-claim",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "pwa;service-workers;offline;caching",
        "title": "Service Worker Lifecycle: Registration, Installation, Activation & clients.claim()",
        "description": "Service Workers run on an independent background thread decoupled from web pages. The `install` event pre-caches the core app shell, while the `activate` event cleans up deprecated caches. Calling `skipWaiting()` and `clients.claim()` forces active pages to immediately adopt the updated worker without requiring a full reload.",
        "resources": [
            {"label": "W3C Recommendation: Service Workers Specification", "url": "https://www.w3.org/TR/service-workers/"},
            {"label": "Jake Archibald: The Service Worker Lifecycle Guide", "url": "https://web.dev/service-worker-lifecycle/"},
            {"label": "MDN Web Docs: Service Worker API Documentation", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API"}
        ]
    },
    {
        "id": "cache-storage-api-caching-strategies",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "pwa;caching;service-workers;offline",
        "title": "PWA Caching Strategies: Stale-While-Revalidate, Network-First & Cache-First",
        "description": "The CacheStorage API allows Service Workers to intercept fetch requests and programmatically respond with cached responses. Static assets utilize Cache-First with hash-versioning, dynamic API queries use Network-First with offline fallback, and high-frequency UI reads use Stale-While-Revalidate for sub-millisecond response delivery.",
        "resources": [
            {"label": "Google Chrome Workbox: Common Service Worker Caching Strategies", "url": "https://developer.chrome.com/docs/workbox/caching-strategies-overview/"},
            {"label": "The Offline Cookbook (Jake Archibald)", "url": "https://web.dev/offline-cookbook/"}
        ]
    },
    {
        "id": "indexeddb-internals-transactions-and-indexes",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "storage;indexeddb;pwa;databases",
        "title": "IndexedDB Architecture: Object Stores, B-Tree Indexes & ACID Transactions",
        "description": "IndexedDB provides client-side NoSQL storage supporting gigabytes of structured cloneable objects. All operations execute inside explicit read-only or readwrite ACID transactions across object stores, with non-unique secondary B-Tree indexes enabling high-performance range queries using IDBKeyRange cursors.",
        "resources": [
            {"label": "W3C Recommendation: Indexed Database API 3.0", "url": "https://www.w3.org/TR/IndexedDB-3/"},
            {"label": "MDN Web Docs: IndexedDB Key Concepts and Usage", "url": "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Concepts_Behind_IndexedDB"}
        ]
    },
    {
        "id": "background-sync-and-periodic-sync-api",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "pwa;background-sync;service-workers;offline",
        "title": "Background Sync API & Periodic Background Sync",
        "description": "The Background Sync API queues offline mutation tasks inside IndexedDB and registers a `sync` event with the browser. When network connectivity restores, the browser wakes the Service Worker to flush pending writes even if the user has already navigated away or closed the web tab.",
        "resources": [
            {"label": "WICG: Web Background Synchronization Specification", "url": "https://wicg.github.io/background-sync/spec/"},
            {"label": "Google Developers: Defer actions with Background Sync", "url": "https://developer.chrome.com/docs/capabilities/periodic-background-sync"}
        ]
    },

    # -------------------------------------------------------------------------
    # 6. Modern CSS & Advanced Layout Engines
    # -------------------------------------------------------------------------
    {
        "id": "css-container-queries-and-container-units",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "css;container-queries;responsive-design;modern-css",
        "title": "CSS Container Queries: @container, Size Queries & cq Units",
        "description": "Container queries evaluate component styling based on the width and height of an ancestor container element (`container-type: inline-size`) rather than the global viewport width. Relative container units (`cqi`, `cqb`) allow truly modular, context-aware design systems that adapt seamlessly across sidebars, modals, and main content feeds.",
        "resources": [
            {"label": "W3C CSS Containment Module Level 3: Container Queries", "url": "https://www.w3.org/TR/css-contain-3/#container-queries"},
            {"label": "MDN Web Docs: CSS Container Queries Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries"},
            {"label": "Una Kravets: CSS Container Queries are finally here (Google Web.dev)", "url": "https://web.dev/cq-stable/"}
        ]
    },
    {
        "id": "css-cascade-layers-and-specificity",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "css;cascade-layers;specificity;modern-css",
        "title": "CSS Cascade Layers: @layer, Specificity Inversion & Architecture",
        "description": "Cascade Layers (`@layer`) introduce an explicit layering hierarchy that takes precedence over traditional selector specificity rules. Specificity only resolves conflicts within the same layer; styles defined in later layers unconditionally override earlier layers regardless of class or ID selector weighting.",
        "resources": [
            {"label": "W3C CSS Cascading and Inheritance Level 5 Specification", "url": "https://www.w3.org/TR/css-cascade-5/#layering"},
            {"label": "MDN Web Docs: Cascade Layers Architecture Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/@layer"},
            {"label": "Bramus: The Future of CSS: Cascade Layers (CSS-Tricks)", "url": "https://css-tricks.com/css-cascade-layers/"}
        ]
    },
    {
        "id": "css-has-parent-relational-selector",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "css;selectors;modern-css;web-design",
        "title": "CSS Relational Pseudo-Class :has() (The Parent Selector)",
        "description": "The `:has()` pseudo-class matches an element if any of the relative selectors passed as arguments match at least one element. It enables bidirectional state styling (e.g. styling a form card based on child input validation state) without requiring DOM traversal JavaScript listeners.",
        "resources": [
            {"label": "W3C CSS Selectors Level 4: The Relational Pseudo-class :has()", "url": "https://www.w3.org/TR/selectors-4/#relational"},
            {"label": "Google Web.dev: :has(): the family-oriented CSS selector", "url": "https://web.dev/has-m105/"},
            {"label": "MDN Web Docs: :has() Pseudo-class Reference", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/:has"}
        ]
    },
    {
        "id": "view-transitions-api-spa-and-mpa",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "css;view-transitions;animation;dom",
        "title": "View Transitions API: DOM State Morphing in SPAs & MPAs",
        "description": "The View Transitions API creates animated transitions between DOM states by taking before and after visual snapshots of elements tagged with `view-transition-name`. The browser automatically constructs a pseudo-element tree (`::view-transition-old` and `::view-transition-new`) to smoothly interpolate positions, transforms, and opacity.",
        "resources": [
            {"label": "W3C CSS View Transitions Module Level 1 Specification", "url": "https://www.w3.org/TR/css-view-transitions-1/"},
            {"label": "Google Developers: Smooth and simple transitions with the View Transitions API (Jake Archibald)", "url": "https://developer.chrome.com/docs/web-platform/view-transitions/"}
        ]
    },
    {
        "id": "css-grid-layout-algorithm-and-subgrid",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "css;grid;subgrid;layout-engine",
        "title": "CSS Grid Track Sizing Algorithms, minmax(), fr Units & Subgrid",
        "description": "CSS Grid calculates layout through a two-pass track-sizing algorithm resolving intrinsic (`min-content`, `max-content`) and fractional (`fr`) flex dimensions. `subgrid` allows nested child grids to directly inherit and align with the row and column tracks of their parent grid rather than defining independent layouts.",
        "resources": [
            {"label": "W3C CSS Grid Layout Module Level 2 (Subgrid)", "url": "https://www.w3.org/TR/css-grid-2/"},
            {"label": "MDN Web Docs: CSS Grid Layout and Subgrid Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid"},
            {"label": "Rachel Andrew: Understanding CSS Grid Track Sizing Algorithms", "url": "https://rachelandrew.co.uk/archives/2017/06/01/how-does-css-grid-sizing-work/"}
        ]
    },

    # -------------------------------------------------------------------------
    # 7. Client State Management Architecture
    # -------------------------------------------------------------------------
    {
        "id": "fine-grained-reactivity-and-signals",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "javascript;reactivity;signals;solidjs",
        "title": "Fine-Grained Reactivity: Signal Graphs, Subscriptions & O(1) DOM Updates",
        "description": "Signals (in Solid, Preact, Angular, Svelte 5 Runes) track dependencies dynamically using an automatic subscription graph established during getter execution. Mutating a signal triggers only the specific DOM nodes or derived computations subscribed to that value, completely bypassing virtual DOM diffing passes.",
        "resources": [
            {"label": "Ryan Carniato: A Hands-on Introduction to Fine-Grained Reactivity", "url": "https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf"},
            {"label": "TC39 Stage 1 Proposal: JavaScript Signals Standard", "url": "https://github.com/tc39/proposal-signals"},
            {"label": "Preact Documentation: Fast Signals in JavaScript Runtimes", "url": "https://preactjs.com/guide/v10/signals/"}
        ]
    },
    {
        "id": "centralized-immutable-state-flux-redux",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "state-management;redux;flux;functional-programming",
        "title": "Centralized Immutable State: The Flux Pattern & Pure Reducer State Machines",
        "description": "The Flux architecture enforces unidirectional data flow: actions dispatched through a centralized store invoke pure reducer functions `(state, action) => newState` producing immutable state trees. This architecture provides deterministic state reproduction, time-travel debugging, and centralized middleware telemetry.",
        "resources": [
            {"label": "Facebook Flux Architecture Specification", "url": "https://facebookarchive.github.io/flux/docs/in-depth-overview/"},
            {"label": "Redux Official Documentation: Core Principles and Reducer Patterns", "url": "https://redux.js.org/understanding/thinking-in-redux/three-principles"}
        ]
    },
    {
        "id": "atomic-state-management-jotai-recoil",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "state-management;atoms;jotai;react",
        "title": "Atomic State Management: Bottom-Up State Graphs (Jotai & Recoil)",
        "description": "Atomic state models state as minimal independent reactive units called 'atoms' combined via pure derived selector functions into dependency DAGs. Components subscribe only to individual atoms, preventing top-level root re-render cascades common in monolithic context providers.",
        "resources": [
            {"label": "Jotai: Primitive and Flexible State Management for React", "url": "https://jotai.org/docs/core/atom"},
            {"label": "Dave McCabe: Recoil: State Management for Today's React (React Europe)", "url": "https://recoiljs.org/"}
        ]
    },
    {
        "id": "server-cache-state-tanstack-query-swr",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "state-management;tanstack-query;swr;data-fetching",
        "title": "Server State Synchronization: TanStack Query, Request Deduplication & Optimistic Mutations",
        "description": "Server cache synchronizers manage asynchronous server state separately from UI client state. They implement automatic background refetching, request deduplication, garbage-collected cache lifecycles, and rollbacks on failed optimistic UI mutations.",
        "resources": [
            {"label": "TanStack Query Official Concepts & Architecture Documentation", "url": "https://tanstack.com/query/latest/docs/framework/react/overview"},
            {"label": "TkDodo: Inside React Query Architecture and Mental Models", "url": "https://tkdodo.eu/blog/practical-react-query"}
        ]
    },

    # -------------------------------------------------------------------------
    # 8. Web Security & Browser Isolation Mechanics
    # -------------------------------------------------------------------------
    {
        "id": "content-security-policy-csp-level-3",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "security;csp;xss;headers",
        "title": "Content Security Policy (CSP Level 3): Cryptographic Nonces, Hashes & Strict-Dynamic",
        "description": "CSP restricts the origins from which scripts, styles, and media can execute. CSP Level 3 replaces fragile domain allowlists with cryptographically random per-response server nonces (`'nonce-...'`) and `'strict-dynamic'`, which allows securely nonced scripts to dynamically load child dependencies without bypassing injection protections.",
        "resources": [
            {"label": "W3C Content Security Policy Level 3 Specification", "url": "https://www.w3.org/TR/CSP3/"},
            {"label": "Google Security: CSP Is Dead, Long Live Strict CSP (Lukas Weichselbaum)", "url": "https://research.google/pubs/csp-is-dead-long-live-strict-csp/"},
            {"label": "MDN Web Docs: Content Security Policy (CSP)", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"}
        ]
    },
    {
        "id": "cors-preflight-mechanics-and-simple-requests",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "security;cors;http;networking",
        "title": "CORS Internals: Preflight OPTIONS Requests, Simple Requests & Credentialed Headers",
        "description": "Cross-Origin Resource Sharing (CORS) enforces Same-Origin Policy boundaries. Requests using non-simple HTTP methods (PUT, DELETE, PATCH) or custom headers trigger an automatic browser `OPTIONS` preflight request verifying `Access-Control-Allow-Origin` and `Access-Control-Allow-Headers` before dispatching the real payload.",
        "resources": [
            {"label": "Fetch Living Standard: CORS Specification (WHATWG)", "url": "https://fetch.spec.whatwg.org/#http-cors-protocol"},
            {"label": "MDN Web Docs: Cross-Origin Resource Sharing (CORS)", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"}
        ]
    },
    {
        "id": "cross-site-scripting-xss-mechanics",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "security;xss;dom;vulnerabilities",
        "title": "XSS Vulnerabilities: Stored, Reflected, DOM-Based & Trusted Types Sanitization",
        "description": "Cross-Site Scripting (XSS) occurs when untrusted user input is injected into the DOM as executable code. Modern defenses employ contextual output encoding and the W3C Trusted Types API, which enforces type-safe wrappers on dangerous DOM sinks (e.g. `element.innerHTML`, `eval`) to eliminate client-side injection vectors.",
        "resources": [
            {"label": "OWASP: Cross-Site Scripting (XSS) Prevention Cheat Sheet", "url": "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"},
            {"label": "W3C Recommendation: Trusted Types Specification", "url": "https://www.w3.org/TR/trusted-types/"},
            {"label": "Google Web.dev: Prevent DOM-based XSS with Trusted Types", "url": "https://web.dev/trusted-types/"}
        ]
    },
    {
        "id": "csrf-and-samesite-cookies",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "security;csrf;cookies;samesite",
        "title": "CSRF Defense: SameSite Cookie Attributes (Strict/Lax), Double Submit & Synchronizer Tokens",
        "description": "Cross-Site Request Forgery (CSRF) tricks authenticated user browsers into issuing unauthorized state-changing requests to target origins. Setting cookies to `SameSite=Lax` or `SameSite=Strict` blocks automatic cookie transmission on cross-site sub-requests, reinforced by cryptographic Anti-CSRF Synchronizer Tokens in form payloads.",
        "resources": [
            {"label": "RFC 6265bis: Cookies: HTTP State Management Mechanism (SameSite Update)", "url": "https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-03"},
            {"label": "OWASP: Cross-Site Request Forgery Prevention Cheat Sheet", "url": "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html"}
        ]
    },
    {
        "id": "cross-origin-isolation-coop-coep-corp",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "security;isolation;spectre;sharedarraybuffer",
        "title": "Cross-Origin Isolation: COOP, COEP, CORP & Spectre Side-Channel Defenses",
        "description": "To mitigate microarchitectural CPU timing attacks (Spectre), high-resolution timers and `SharedArrayBuffer` require strict Cross-Origin Isolation. Servers configure `Cross-Origin-Opener-Policy: same-origin` (COOP) and `Cross-Origin-Embedder-Policy: require-corp` (COEP) to prevent malicious cross-origin pages from sharing process memory spaces.",
        "resources": [
            {"label": "Google Web.dev: Making your website 'cross-origin isolated' using COOP and COEP", "url": "https://web.dev/cross-origin-isolation-guide/"},
            {"label": "MDN Web Docs: Cross-Origin Isolation Architecture", "url": "https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated"}
        ]
    },

    # -------------------------------------------------------------------------
    # 9. WebAssembly (Wasm) Architecture & Runtime Interop
    # -------------------------------------------------------------------------
    {
        "id": "webassembly-linear-memory-model",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "wasm;webassembly;memory;security",
        "title": "WebAssembly Linear Memory: ArrayBuffer Pages, Bounds Checks & Sandboxing",
        "description": "WebAssembly memory is structured as a contiguous, resizable, one-dimensional array of raw unmanaged bytes represented in JS as an `ArrayBuffer`. Memory operates in 64 KiB page increments with strict hardware-enforced bounds checking, preventing out-of-bounds pointer exploits from corrupting host JavaScript engine memory.",
        "resources": [
            {"label": "W3C WebAssembly Core Specification: Memory Architecture", "url": "https://www.w3.org/TR/wasm-core-1/#memory-instances%E2%91%A0"},
            {"label": "MDN Web Docs: Understanding WebAssembly Memory", "url": "https://developer.mozilla.org/en-US/docs/WebAssembly/Understanding_the_text_format#webassembly_memory"},
            {"label": "Bringing the Web up to Speed with WebAssembly (Haas et al., ACM PLDI)", "url": "https://dl.acm.org/doi/10.1145/3062341.3062363"}
        ]
    },
    {
        "id": "webassembly-js-interop-and-wasm-bindgen",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "wasm;rust;javascript;interop",
        "title": "WebAssembly JS Interop: wasm-bindgen, Type Marshaling & Zero-Copy Views",
        "description": "Wasm natively only handles numeric scalar types (i32, i64, f32, f64). Tools like `wasm-bindgen` auto-generate glue code that marshals complex strings, structs, and closures into pointers and lengths inside Wasm linear memory, allowing JavaScript typed arrays (`Uint8Array`) to view Wasm memory without copying.",
        "resources": [
            {"label": "The wasm-bindgen Guide: Rust & WebAssembly Interop Architecture", "url": "https://rustwasm.github.io/wasm-bindgen/"},
            {"label": "MDN Web Docs: Using the WebAssembly JavaScript API", "url": "https://developer.mozilla.org/en-US/docs/WebAssembly/Using_the_JavaScript_API"}
        ]
    },
    {
        "id": "webassembly-simd-vectorization",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "wasm;performance;simd;vectorization",
        "title": "WebAssembly Fixed-Width SIMD: 128-Bit Vectorization in the Browser",
        "description": "WebAssembly SIMD (Single Instruction, Multiple Data) exposes 128-bit vector registers to process multiple integers or floats concurrently in a single CPU instruction cycle. This delivers 2–8x performance speedups for compute-heavy web workloads like image processing, physics engines, and neural network inference.",
        "resources": [
            {"label": "WebAssembly Specification: 128-Bit SIMD Proposal", "url": "https://github.com/WebAssembly/simd/blob/master/proposals/simd/SIMD.md"},
            {"label": "V8 Blog: High-Performance WebAssembly applications with 128-bit SIMD", "url": "https://v8.dev/features/simd"}
        ]
    },
    {
        "id": "wasi-webassembly-system-interface",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "wasm;wasi;systems;sandboxing",
        "title": "WASI (WebAssembly System Interface): Capability-Based POSIX Sandboxing",
        "description": "WASI defines a standardized, modular system call interface allowing WebAssembly to run outside browser sandboxes on servers and edge nodes. Using capability-based security, WASI binaries cannot access files, network sockets, or system clocks unless the host runtime explicitly passes fine-grained file descriptor handles at instantiation.",
        "resources": [
            {"label": "Bytecode Alliance: Standardizing WASI: A system interface to run WebAssembly outside the web", "url": "https://hacks.mozilla.org/2019/03/standardizing-wasi-a-webassembly-system-interface/"},
            {"label": "WASI Subgroup Official Specification Repository", "url": "https://github.com/WebAssembly/WASI"}
        ]
    },

    # -------------------------------------------------------------------------
    # 10. Build Tooling, Bundler Internals & Module Systems
    # -------------------------------------------------------------------------
    {
        "id": "tree-shaking-and-static-module-analysis",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "bundling;tree-shaking;esm;webpack",
        "title": "Tree-Shaking Internals: Static ESM Analysis vs. Dynamic CommonJS Bailouts",
        "description": "Tree-shaking relies on ECMAScript Modules (ESM) having static `import`/`export` syntax that can be analyzed at compile time without code execution. Bundlers build an Abstract Syntax Tree (AST), mark used exported identifiers, and prune unreferenced functions, but bail out if code contains unpure top-level side effects (`\"sideEffects\": false`).",
        "resources": [
            {"label": "Rollup.js Documentation: Tree-Shaking Mechanics and ES Modules", "url": "https://rollupjs.org/introduction/#tree-shaking"},
            {"label": "Webpack Guide: Tree Shaking and Side Effects Optimization", "url": "https://webpack.js.org/guides/tree-shaking/"},
            {"label": "Rich Harris: Tree-shaking versus dead-code elimination", "url": "https://medium.com/@Rich_Harris/tree-shaking-versus-dead-code-elimination-d3765df5d7c6"}
        ]
    },
    {
        "id": "esm-vs-commonjs-interop-dual-package-hazard",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "javascript;esm;commonjs;node;bundling",
        "title": "ESM vs. CommonJS Interoperability: The Dual-Package Hazard & Package Exports",
        "description": "CommonJS loads modules synchronously via dynamic `require()`, while ESM loads asynchronously via static imports. The dual-package hazard occurs when an npm package publishes both CJS and ESM formats, causing bundlers or Node.js runtimes to instantiate duplicate singleton instances if different transitive dependencies import different formats.",
        "resources": [
            {"label": "Node.js Documentation: Modules: Packages and Conditional Exports", "url": "https://nodejs.org/api/packages.html#dual-commonjses-module-packages"},
            {"label": "TypeScript Handbook: Module Resolution and ESM / CJS Interop", "url": "https://www.typescriptlang.org/docs/handbook/modules/reference.html"}
        ]
    },
    {
        "id": "source-maps-vlq-encoding-internals",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "devtools;source-maps;compilers;debugging",
        "title": "Source Maps v3: Variable-Length Quantity (VLQ) Encoding & Debugging Mappings",
        "description": "Source Maps map compiled, minified production JavaScript back to original source files and lines. Mappings are stored in a compact format using Base64-encoded Variable-Length Quantity (VLQ) integers that record 4-5 tuple positions (generated line, generated col, source file idx, source line, source col).",
        "resources": [
            {"label": "Source Map Revision 3 Proposal Specification", "url": "https://sourcemaps.info/spec.html"},
            {"label": "Sentry Engineering: How Source Maps Work Under the Hood", "url": "https://blog.sentry.io/how-source-maps-work/"}
        ]
    },
    {
        "id": "module-federation-micro-frontends",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "bundling;module-federation;micro-frontends;webpack",
        "title": "Webpack Module Federation & Dynamic Runtime Micro-Frontends",
        "description": "Module Federation allows independent JavaScript builds to dynamically import and execute remote container modules at runtime without bundling them together at build time. It coordinates shared dependency version negotiation (e.g. sharing a single React instance), enabling decoupled micro-frontend architectures.",
        "resources": [
            {"label": "Webpack Documentation: Module Federation Architecture", "url": "https://webpack.js.org/concepts/module-federation/"},
            {"label": "Zack Jackson: Module Federation Technical Principles", "url": "https://module-federation.io/"}
        ]
    },
    {
        "id": "native-native-bundlers-esbuild-turbopack-rspack",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "build-tools;rust;go;esbuild;rspack",
        "title": "Next-Gen Bundler Architecture: Go/Rust Concurrency (esbuild, Rspack, Rolldown)",
        "description": "Modern bundlers replace JavaScript-based compilers with compiled languages (Go in esbuild, Rust in Rspack and Turbopack). They exploit multithreaded CPU parallelization across AST generation, parallel parsing, and optimized memory layout structures to achieve 10–100x faster build and HMR turnaround cycles.",
        "resources": [
            {"label": "esbuild Architecture: Why is esbuild fast?", "url": "https://esbuild.github.io/faq/#why-is-esbuild-fast"},
            {"label": "Rspack Architecture: High Performance Rust-based Web Bundler", "url": "https://rspack.dev/guide/tech/architecture"}
        ]
    },

    # -------------------------------------------------------------------------
    # 11. Additional Crucial Web Development Deep Concepts
    # -------------------------------------------------------------------------
    {
        "id": "dom-mutation-observers-vs-polling",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "dom;javascript;browser-internals;performance",
        "title": "DOM MutationObserver: Batch DOM Change Notifications via Microtasks",
        "description": "MutationObserver replaces deprecated, performance-degrading DOM Mutation Events. It asynchronously batches multiple DOM tree mutations (attribute changes, child insertions, character data) and delivers them in a single callback invoked in the current microtask queue before the next render frame.",
        "resources": [
            {"label": "DOM Living Standard: Mutation Observers Specification (WHATWG)", "url": "https://dom.spec.whatwg.org/#mutation-observers"},
            {"label": "MDN Web Docs: MutationObserver Interface and Usage", "url": "https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver"}
        ]
    },
    {
        "id": "intersection-observer-and-layout-thrashing",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "performance;dom;observers;layout-thrashing",
        "title": "IntersectionObserver & Avoiding Synchronous Layout Thrashing",
        "description": "Traditional scroll listeners querying `getBoundingClientRect()` force the browser to execute synchronous layout passes (layout thrashing) on the main thread. IntersectionObserver offloads element visibility calculations to the browser's compositing cycle, delivering non-blocking visibility threshold callbacks.",
        "resources": [
            {"label": "W3C Intersection Observer Specification", "url": "https://www.w3.org/TR/intersection-observer/"},
            {"label": "Google Developers: Trust is Good, Observation is Better (IntersectionObserver)", "url": "https://developer.chrome.com/blog/intersectionobserver/"}
        ]
    },
    {
        "id": "shadow-dom-and-web-components-encapsulation",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "web-components;shadow-dom;css;encapsulation",
        "title": "Shadow DOM: Scoped CSS, Slots & Custom Elements Architecture",
        "description": "Shadow DOM attaches a scoped, encapsulated sub-DOM tree (`ShadowRoot`) to a custom element host. Styles declared within a shadow tree do not leak out to the document, and outside CSS cannot pierce the boundary (except via explicit CSS custom properties or `::part()` pseudo-elements).",
        "resources": [
            {"label": "DOM Living Standard: Shadow Trees Specification (WHATWG)", "url": "https://dom.spec.whatwg.org/#shadow-trees"},
            {"label": "MDN Web Docs: Using shadow DOM and Custom Elements", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM"}
        ]
    },
    {
        "id": "browser-security-subresource-integrity-sri",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "security;sri;cryptography;cdn",
        "title": "Subresource Integrity (SRI): SHA Hashing & CDN Tampering Defense",
        "description": "Subresource Integrity allows browsers to verify that third-party scripts and stylesheets fetched from external CDNs have not been maliciously modified. The browser computes the cryptographic hash (SHA-384/512) of the received file and rejects execution if it mismatches the declared `integrity` attribute.",
        "resources": [
            {"label": "W3C Recommendation: Subresource Integrity Specification", "url": "https://www.w3.org/TR/SRI/"},
            {"label": "MDN Web Docs: Subresource Integrity (SRI)", "url": "https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity"}
        ]
    },
    {
        "id": "font-loading-performance-and-font-display",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "performance;fonts;css;typography",
        "title": "Web Font Optimization: WOFF2, font-display (swap/optional) & FOIT/FOUT",
        "description": "Custom web fonts can cause Flash of Invisible Text (FOIT) or Flash of Unstyled Text (FOUT) while downloading. The `font-display: swap` or `optional` CSS properties manage fallback font rendering, while WOFF2 Brotli compression and glyph subsetting minimize file size down to needed character sets.",
        "resources": [
            {"label": "W3C CSS Fonts Module Level 4: font-display", "url": "https://www.w3.org/TR/css-fonts-4/#font-display-desc"},
            {"label": "Google Web.dev: Best practices for fonts performance", "url": "https://web.dev/font-best-practices/"}
        ]
    },
    {
        "id": "form-data-and-multipart-form-data-encoding",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "http;forms;encoding;fetch",
        "title": "HTTP Form Encoding: application/x-www-form-urlencoded vs multipart/form-data",
        "description": "Standard HTML forms serialize inputs as URL-encoded key-value strings (`application/x-www-form-urlencoded`). Binary file uploads require `multipart/form-data`, which delimits distinct payload fields and file byte streams using custom MIME boundary strings without expensive Base64 encoding overhead.",
        "resources": [
            {"label": "RFC 7578: Returning Values from Forms: multipart/form-data", "url": "https://datatracker.ietf.org/doc/html/rfc7578"},
            {"label": "MDN Web Docs: FormData API & Sending Form Data", "url": "https://developer.mozilla.org/en-US/docs/Web/API/FormData"}
        ]
    },
    {
        "id": "web-audio-api-audio-graphs",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "audio;web-audio-api;multimedia;javascript",
        "title": "Web Audio API: AudioContext Modular Routing Graphs & AudioNodes",
        "description": "The Web Audio API processes and synthesizes audio within an `AudioContext` using directed modular audio routing graphs. Audio source nodes (oscillators, buffers) connect through processing nodes (GainNode, BiquadFilterNode) to the final output destination on dedicated low-latency real-time audio threads.",
        "resources": [
            {"label": "W3C Recommendation: Web Audio API Specification", "url": "https://www.w3.org/TR/webaudio/"},
            {"label": "MDN Web Docs: Basic concepts behind Web Audio API", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API"}
        ]
    },
    {
        "id": "canvas-2d-vs-webgl-vs-webgpu",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "graphics;canvas;webgl;webgpu",
        "title": "Browser Graphics Primitives: Canvas 2D, WebGL & Next-Gen WebGPU Pipelines",
        "description": "Canvas 2D provides immediate-mode software/hardware 2D rasterization. WebGL exposes the OpenGL ES 2.0/3.0 state machine, while WebGPU provides direct access to modern GPU primitives (Vulkan, Metal, Direct3D 12), enabling compute shaders, lower driver overhead, and multi-threaded rendering.",
        "resources": [
            {"label": "W3C Recommendation: WebGPU Specification Standard", "url": "https://www.w3.org/TR/webgpu/"},
            {"label": "Google Developers: WebGPU: Next-generation graphics and compute in the browser", "url": "https://developer.chrome.com/docs/web-platform/webgpu/"},
            {"label": "Khronos Group: WebGL Specification and Reference", "url": "https://www.khronos.org/webgl/"}
        ]
    },
    {
        "id": "navigator-sendbeacon-and-page-lifecycle",
        "group_name": "tech",
        "category": "web-dev",
        "tags": "javascript;telemetry;networking;browser-internals",
        "title": "Reliable Telemetry Dispatch: navigator.sendBeacon & fetch keepalive",
        "description": "Standard asynchronous `fetch()` requests triggered in `unload` or `pagehide` event handlers are frequently canceled by the browser when tearing down the page. `navigator.sendBeacon()` and `fetch(url, { keepalive: true })` guarantee that small HTTP POST analytics payloads are reliably transmitted in background after page unload.",
        "resources": [
            {"label": "W3C Recommendation: Beacon Specification", "url": "https://www.w3.org/TR/beacon/"},
            {"label": "MDN Web Docs: navigator.sendBeacon() Method", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon"}
        ]
    }
]

# Ensure output directory exists
os.makedirs('seeds', exist_ok=True)

csv_filepath = os.path.join('seeds', 'topics_tech_web_dev.csv')
sql_filepath = os.path.join('seeds', 'seed_topics_tech_web_dev.sql')

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
    f_sql.write(f'-- TOPICS SEED DATA: TECH -> WEB-DEV ({len(topics)} Topics)\n')
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
