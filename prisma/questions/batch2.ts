// Batch 2: 30 Questions covering Microservices, CDN, Search, Notifications
// Topics: Microservices Architecture, CDN & Content Delivery, Search Systems, Notification Systems

import { SeedModule } from './index';

export const batch2Modules: SeedModule[] = [
  // ============================================
  // MODULE 6: MICROSERVICES ARCHITECTURE
  // ============================================
  {
    title: 'Microservices Architecture',
    slug: 'microservices-architecture',
    description: 'Learn to decompose monoliths into microservices, design service boundaries, and handle inter-service communication patterns.',
    difficulty: 'intermediate',
    orderIndex: 20,
    icon: '🧩',
    colorTheme: '#6366f1',
    lessons: [
      {
        title: 'Monolith to Microservices',
        slug: 'monolith-to-microservices',
        storyContent: `🏢 ARCHITECTURE DECISION

"Our monolithic e-commerce app has grown to 2 million lines of code. Deployments take 4 hours, a bug in the checkout can crash the entire site, and teams are stepping on each other's toes.

Leadership wants to move to microservices. But where do we start? How do we split this massive codebase?"

Your mission: Learn how to decompose a monolith into well-designed microservices.`,
        orderIndex: 1,
        xpReward: 130,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Service Boundaries**

You're splitting an e-commerce monolith. The current modules are:
- User Management (auth, profiles, preferences)
- Product Catalog (products, categories, search)
- Inventory (stock levels, warehouses)
- Orders (cart, checkout, order history)
- Payments (processing, refunds, invoices)
- Shipping (carriers, tracking, delivery)
- Reviews (ratings, comments, moderation)
- Notifications (email, SMS, push)

How would you draw service boundaries? Which modules become separate services vs stay together? Explain your reasoning.`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Good service boundaries follow domain-driven design principles: high cohesion within services, loose coupling between them.',
            hints: JSON.stringify(['Think about what changes together', 'Consider team ownership and deployment independence']),
            sampleSolution: `**Recommended Service Boundaries:**

**1. User Service**
- Auth, profiles, preferences
- Why together: All user identity related, same data ownership

**2. Catalog Service**
- Products, categories
- Why: Read-heavy, rarely changes, can be cached aggressively

**3. Search Service** (separate from Catalog)
- Product search, filters, autocomplete
- Why: Different scaling needs, specialized tech (Elasticsearch)

**4. Inventory Service**
- Stock levels, warehouses, reservations
- Why: Critical for consistency, different update patterns

**5. Order Service**
- Cart, checkout, order history
- Why: Core business logic, transactional

**6. Payment Service**
- Processing, refunds, invoices
- Why: PCI compliance, security isolation

**7. Shipping Service**
- Carriers, tracking, delivery
- Why: External integrations, can fail independently

**8. Review Service**
- Ratings, comments, moderation
- Why: Can be eventually consistent, separate team

**9. Notification Service**
- Email, SMS, push
- Why: Cross-cutting, async, rate limiting needs

**Key Principles Applied:**
- Single Responsibility: Each service owns one domain
- Data Ownership: Each service owns its data
- Independent Deployment: Changes don't cascade
- Team Alignment: One team per service`,
            evaluationCriteria: JSON.stringify([
              'Identified logical groupings based on domain',
              'Explained reasoning for boundaries',
              'Considered data ownership',
              'Thought about team structure and deployment'
            ]),
            xpValue: 35,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `What is the MAIN benefit of microservices over a monolith?`,
            options: JSON.stringify([
              { id: 'a', text: 'Microservices are always faster', feedback: 'Not true! Network calls between services add latency. Monoliths can be faster for in-process calls.' },
              { id: 'b', text: 'Independent deployment and scaling of services', feedback: 'Correct! Teams can deploy their service without coordinating with others, and scale only the services that need it.' },
              { id: 'c', text: 'Microservices use less resources', feedback: 'Usually the opposite - microservices have overhead from multiple processes, network calls, and infrastructure.' },
              { id: 'd', text: 'Microservices are easier to debug', feedback: 'Debugging distributed systems is actually harder. You need distributed tracing, correlation IDs, etc.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'The primary benefit of microservices is organizational: teams can work, deploy, and scale independently. This reduces coordination overhead and allows faster iteration. However, it comes with costs: distributed system complexity, network latency, and operational overhead.',
            hints: JSON.stringify(['Think about team autonomy', 'Consider what happens during deployments']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'trade_off',
            scenarioText: `You're starting the microservices migration. The monolith has 50 developers. What's the best approach?`,
            options: JSON.stringify([
              { id: 'a', text: 'Big bang: Rewrite everything as microservices at once', score: 20, feedback: 'High risk! Multi-year effort, no value until complete, likely to fail.' },
              { id: 'b', text: 'Strangler Fig: Gradually extract services while keeping monolith running', score: 100, feedback: 'Perfect! Extract one service at a time, validate it works, then extract the next. Reduces risk.' },
              { id: 'c', text: 'Start with the most complex module first', score: 40, feedback: 'High risk to start with complexity. Start with simpler, well-understood domains.' },
              { id: 'd', text: 'Freeze monolith development until migration is complete', score: 30, feedback: 'Business can\'t wait. You need to keep delivering value while migrating.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'The Strangler Fig pattern (named after vines that gradually replace trees) is the safest approach. You extract one service at a time, route traffic to it, validate it works, then repeat. The monolith shrinks gradually until it can be retired.',
            hints: JSON.stringify(['Think about risk management', 'Consider delivering value incrementally']),
            xpValue: 25,
            orderIndex: 3,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Data Ownership**

In a microservices architecture, the Order Service needs product information (name, price, image) to display order history.

How should Order Service get this data? Consider:
- Should it store a copy of product data?
- Should it call Product Service for each request?
- What happens if Product Service is down?
- What if a product's price changes after an order?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Data ownership in microservices requires balancing consistency, availability, and coupling.',
            hints: JSON.stringify(['Think about what data is truly needed vs nice-to-have', 'Consider the difference between current state and historical record']),
            sampleSolution: `**Solution: Denormalize with Event-Driven Updates**

**Key Insight:** Order history needs the data *at time of purchase*, not current data!

**Approach:**
1. **Store snapshot in Order Service:**
\`\`\`json
{
  "orderId": "123",
  "items": [{
    "productId": "prod_456",
    "productName": "Blue T-Shirt",  // Snapshot
    "priceAtPurchase": 29.99,       // Historical
    "imageUrl": "..."               // Snapshot
  }]
}
\`\`\`

2. **Why snapshot, not live lookup:**
- Price changes shouldn't affect past orders
- Order history works even if Product Service is down
- No N+1 query problem for order lists

3. **For current product info (e.g., reorder button):**
- Call Product Service
- Cache with short TTL
- Graceful degradation: show order without "reorder" if down

4. **Keep snapshots updated for active carts:**
- Subscribe to product.updated events
- Update cart items when prices change
- Notify user: "Price changed since you added this item"

**Anti-patterns avoided:**
- ❌ Shared database between services
- ❌ Synchronous calls for every request
- ❌ Tight coupling to Product Service availability`,
            evaluationCriteria: JSON.stringify([
              'Distinguished between historical and current data needs',
              'Proposed snapshot/denormalization strategy',
              'Addressed service unavailability',
              'Considered price change scenarios'
            ]),
            xpValue: 35,
            orderIndex: 4,
          },
          {
            type: 'multi_select',
            scenarioText: `Which of the following are signs that a monolith should be split into microservices? (Select ALL that apply)`,
            options: JSON.stringify([
              { id: 'a', text: 'Different modules have very different scaling requirements', correct: true },
              { id: 'b', text: 'Teams are frequently blocked waiting for other teams to deploy', correct: true },
              { id: 'c', text: 'The codebase has 10,000 lines of code', correct: false },
              { id: 'd', text: 'Different modules require different technology stacks', correct: true },
              { id: 'e', text: 'You want to use Kubernetes', correct: false },
            ]),
            correctAnswer: JSON.stringify(['a', 'b', 'd']),
            explanation: 'Microservices solve organizational and scaling problems, not code size or technology fashion. If teams work smoothly, scaling is uniform, and tech stack is consistent, a monolith might be the better choice.',
            hints: JSON.stringify(['Think about the problems microservices solve', 'Code size alone isn\'t a reason to split']),
            xpValue: 20,
            orderIndex: 5,
          },
        ],
      },
      {
        title: 'Service Communication Patterns',
        slug: 'service-communication',
        storyContent: `🔗 INTEGRATION CHALLENGES

"We've split into microservices, but now we have new problems:

1. When Order Service calls Payment Service, what if Payment is slow?
2. When a user updates their profile, how do 5 other services find out?
3. We're seeing cascading failures - one slow service brings down everything.

We need better communication patterns!"`,
        orderIndex: 2,
        xpReward: 140,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Sync vs Async Communication**

For each scenario, decide whether to use synchronous (REST/gRPC) or asynchronous (message queue) communication:

1. Order Service needs to verify payment before confirming order
2. User updates profile picture, needs to resize for different devices
3. Order placed, need to send confirmation email
4. Product page needs to show current inventory count
5. Analytics service needs to track all user actions`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'The choice between sync and async depends on whether the caller needs an immediate response and whether the operation can be retried.',
            hints: JSON.stringify(['Ask: Does the user need to wait for this?', 'Consider: What if the downstream service is slow/down?']),
            sampleSolution: `**Analysis:**

**1. Payment verification → SYNCHRONOUS**
- User is waiting for order confirmation
- Need immediate success/failure response
- Can't proceed without knowing payment status

**2. Profile picture resize → ASYNCHRONOUS**
- User doesn't need to wait for all sizes
- Can show "processing" state
- Retry-able if resize fails

**3. Confirmation email → ASYNCHRONOUS**
- User doesn't wait for email
- Email service can be slow/down
- Retry-able, order already confirmed

**4. Inventory count → SYNCHRONOUS (with cache)**
- Need current data for display
- But: Cache aggressively (5-30 seconds)
- Fallback: Show "Check availability" if down

**5. Analytics tracking → ASYNCHRONOUS**
- Fire and forget
- Can't let analytics slow down user actions
- Batch processing acceptable

**Decision Framework:**
\`\`\`
User waiting for response? 
  YES → Synchronous
  NO  → Can it be retried later?
          YES → Asynchronous
          NO  → Synchronous with timeout
\`\`\`

**Patterns:**
- Sync: REST, gRPC, direct HTTP
- Async: Kafka, RabbitMQ, SQS, events`,
            evaluationCriteria: JSON.stringify([
              'Correctly identified sync scenarios (payment, inventory)',
              'Correctly identified async scenarios (email, resize, analytics)',
              'Provided reasoning for each choice',
              'Mentioned fallback strategies'
            ]),
            xpValue: 30,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `What is a Circuit Breaker pattern in microservices?`,
            options: JSON.stringify([
              { id: 'a', text: 'A security mechanism to block malicious requests', feedback: 'That would be a firewall or WAF, not a circuit breaker.' },
              { id: 'b', text: 'A pattern that stops calling a failing service to prevent cascade failures', feedback: 'Correct! When a service fails repeatedly, the circuit "opens" and calls fail fast instead of waiting for timeouts.' },
              { id: 'c', text: 'A load balancing algorithm', feedback: 'Load balancing distributes traffic; circuit breaker handles failures.' },
              { id: 'd', text: 'A way to encrypt service-to-service communication', feedback: 'That would be mTLS or service mesh encryption, not circuit breaker.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'The Circuit Breaker pattern prevents cascade failures. When Service A calls Service B and B fails repeatedly, the circuit "opens" - subsequent calls fail immediately without waiting. After a timeout, it allows a test request through. If successful, the circuit "closes" and normal traffic resumes.',
            hints: JSON.stringify(['Think about electrical circuit breakers', 'Consider what happens when a service keeps timing out']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: API Gateway**

Design an API Gateway for your microservices architecture. Consider:
- What responsibilities should the gateway handle?
- How does it route requests to services?
- How does it handle authentication?
- What about rate limiting and caching?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'An API Gateway is the single entry point for clients, handling cross-cutting concerns before routing to services.',
            hints: JSON.stringify(['Think about what\'s common across all requests', 'Consider what clients need vs what services provide']),
            sampleSolution: `**API Gateway Responsibilities:**

**1. Request Routing**
\`\`\`
/api/users/*     → User Service
/api/products/*  → Catalog Service
/api/orders/*    → Order Service
/api/search/*    → Search Service
\`\`\`

**2. Authentication & Authorization**
\`\`\`
Request → Gateway
  1. Validate JWT token
  2. Extract user info
  3. Check permissions
  4. Add X-User-ID header
  5. Forward to service
\`\`\`

**3. Rate Limiting**
\`\`\`yaml
rate_limits:
  - path: /api/*
    limit: 1000/minute per user
  - path: /api/search
    limit: 100/minute per user  # More expensive
  - path: /api/public/*
    limit: 100/minute per IP
\`\`\`

**4. Caching**
\`\`\`
GET /api/products/:id
  - Cache: 60 seconds
  - Vary: Accept-Language
  
GET /api/users/me
  - Cache: none (user-specific)
\`\`\`

**5. Request/Response Transformation**
- Aggregate multiple service calls
- Transform legacy API formats
- Add CORS headers

**6. Observability**
- Log all requests
- Add correlation ID
- Collect metrics

**Architecture:**
\`\`\`
Clients → API Gateway → Service Discovery → Services
              ↓
         Auth Service (validate tokens)
\`\`\`

**Popular Tools:** Kong, AWS API Gateway, Nginx, Envoy`,
            evaluationCriteria: JSON.stringify([
              'Listed key gateway responsibilities',
              'Explained routing mechanism',
              'Addressed authentication flow',
              'Mentioned rate limiting and/or caching'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `Service A needs to call Service B. Service B's API changes frequently. How should you handle versioning?`,
            options: JSON.stringify([
              { id: 'a', text: 'Tight coupling: Service A always uses latest Service B API', score: 30, feedback: 'This causes frequent breaking changes. Every B update requires A update.' },
              { id: 'b', text: 'API versioning: Service B maintains multiple API versions', score: 90, feedback: 'Good! B can evolve while supporting old versions. Use URL (/v1/, /v2/) or headers.' },
              { id: 'c', text: 'Shared library: Both services use same data models library', score: 40, feedback: 'Creates deployment coupling. Both must update the shared library together.' },
              { id: 'd', text: 'Contract testing: Test API compatibility in CI/CD', score: 85, feedback: 'Excellent complement to versioning! Pact or similar tools catch breaking changes early.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'API versioning (combined with contract testing) is the best approach. Service B maintains backward-compatible versions, allowing Service A to upgrade on its own schedule. Contract tests ensure compatibility before deployment.',
            hints: JSON.stringify(['Think about deployment independence', 'Consider who controls the upgrade timeline']),
            xpValue: 25,
            orderIndex: 4,
          },
          {
            type: 'multiple_choice',
            scenarioText: `You're implementing service-to-service authentication. Which approach is most secure and scalable?`,
            options: JSON.stringify([
              { id: 'a', text: 'Shared API key stored in environment variables', feedback: 'Simple but risky. If leaked, all services are compromised. No rotation mechanism.' },
              { id: 'b', text: 'Mutual TLS (mTLS) with service certificates', feedback: 'Correct! mTLS provides strong identity verification, encryption, and can be managed by service mesh.' },
              { id: 'c', text: 'IP allowlisting - only allow calls from known IPs', feedback: 'Fragile in dynamic environments (containers, auto-scaling). IPs change frequently.' },
              { id: 'd', text: 'No auth needed if services are in private network', feedback: 'Defense in depth matters. Internal breaches happen. Always authenticate.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Mutual TLS (mTLS) is the gold standard for service-to-service authentication. Each service has a certificate proving its identity. Service meshes like Istio or Linkerd can manage mTLS automatically, handling certificate rotation and distribution.',
            hints: JSON.stringify(['Think about zero-trust security', 'Consider certificate management at scale']),
            xpValue: 20,
            orderIndex: 5,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 7: CDN & CONTENT DELIVERY
  // ============================================
  {
    title: 'CDN & Content Delivery',
    slug: 'cdn-content-delivery',
    description: 'Master content delivery networks, edge caching, and strategies for serving static and dynamic content globally.',
    difficulty: 'intermediate',
    orderIndex: 21,
    icon: '🌐',
    colorTheme: '#0ea5e9',
    lessons: [
      {
        title: 'CDN Fundamentals',
        slug: 'cdn-fundamentals',
        storyContent: `🌍 GLOBAL EXPANSION

"We're launching in Europe and Asia! But users there are complaining about slow load times. Our servers are in US-East, and it takes 300ms just for the network round trip to Singapore.

Images load slowly, videos buffer constantly, and our Time to First Byte is 2 seconds for international users.

We need a content delivery strategy!"`,
        orderIndex: 1,
        xpReward: 110,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: CDN Architecture**

Explain how a CDN works:
- What is an edge server?
- How does content get to edge servers?
- What's the difference between push and pull CDN?
- How does a CDN decide which edge server serves a user?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'CDNs distribute content to edge servers close to users, reducing latency and offloading origin servers.',
            hints: JSON.stringify(['Think about geographic proximity', 'Consider how cache misses are handled']),
            sampleSolution: `**CDN Architecture:**

**Edge Servers (Points of Presence - PoPs):**
- Servers distributed globally (100+ locations)
- Cache content close to users
- Singapore user → Singapore edge (10ms) vs US origin (300ms)

**How Content Reaches Edges:**

**Pull CDN (Most Common):**
\`\`\`
1. User requests image.jpg
2. Edge checks cache: MISS
3. Edge fetches from origin
4. Edge caches and serves
5. Next user: cache HIT (fast!)
\`\`\`
- Content pulled on-demand
- First user experiences origin latency
- Good for: Most websites, dynamic content

**Push CDN:**
\`\`\`
1. You upload image.jpg to CDN
2. CDN distributes to all edges
3. Users always get cache hit
\`\`\`
- Content pre-distributed
- Higher storage costs
- Good for: Large files, predictable content

**DNS-Based Routing:**
\`\`\`
User in Tokyo requests cdn.example.com
  → DNS returns Tokyo edge IP (closest)
  → User connects to Tokyo edge
  
Routing considers:
  - Geographic proximity
  - Server load/health
  - Network conditions
\`\`\`

**Request Flow:**
\`\`\`
User → DNS → Edge Server → (cache miss?) → Origin Shield → Origin
              ↓
         Cache HIT → Serve directly
\`\`\`

**Origin Shield:**
- Intermediate cache layer
- Protects origin from thundering herd
- Multiple edges cache miss → one origin request`,
            evaluationCriteria: JSON.stringify([
              'Explained edge server concept',
              'Described pull vs push CDN',
              'Mentioned DNS-based routing',
              'Discussed cache hit/miss flow'
            ]),
            xpValue: 35,
            orderIndex: 1,
          },
          {
            type: 'trade_off',
            scenarioText: `Your e-commerce site shows product prices that change hourly based on demand. How should you handle CDN caching for product pages?`,
            options: JSON.stringify([
              { id: 'a', text: 'Cache entire page for 1 hour, invalidate on price change', score: 60, feedback: 'Works but invalidation at scale is complex. Hourly changes mean frequent invalidations.' },
              { id: 'b', text: 'Don\'t use CDN for product pages - too dynamic', score: 40, feedback: 'Misses opportunity to cache static parts. Most of the page doesn\'t change.' },
              { id: 'c', text: 'Cache static shell, fetch price via JavaScript from API', score: 95, feedback: 'Excellent! Cache static HTML/CSS/images, hydrate dynamic data client-side. Best of both worlds.' },
              { id: 'd', text: 'Edge computing: Calculate price at CDN edge', score: 80, feedback: 'Advanced but possible with Cloudflare Workers or Lambda@Edge. Adds complexity.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'The best approach is to separate static and dynamic content. Cache the page shell (layout, images, CSS) aggressively at the CDN. Fetch dynamic data (prices, inventory) via JavaScript from an API. This maximizes cache hit rate while keeping data fresh.',
            hints: JSON.stringify(['Think about what parts of the page change vs stay the same', 'Consider client-side hydration patterns']),
            xpValue: 25,
            orderIndex: 2,
          },
          {
            type: 'multiple_choice',
            scenarioText: `You updated your logo, but users still see the old one because it's cached on CDN edges. What's the best way to force the update?`,
            options: JSON.stringify([
              { id: 'a', text: 'Wait for the cache TTL to expire', feedback: 'Works but slow. If TTL is 24 hours, users see old logo for a day.' },
              { id: 'b', text: 'Purge the cache across all edge servers', feedback: 'Works but is expensive at scale and can cause origin stampede.' },
              { id: 'c', text: 'Use versioned URLs: logo.v2.png or logo.png?v=2', feedback: 'Correct! Cache busting with versioned URLs ensures immediate updates without purging.' },
              { id: 'd', text: 'Disable CDN caching for images', feedback: 'Defeats the purpose of CDN. All requests hit origin.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'Cache busting via versioned URLs (or content hashes like logo.a1b2c3.png) is the most effective strategy. The new URL is a cache miss, so users get the new file immediately. Build tools like Webpack automatically add content hashes to filenames.',
            hints: JSON.stringify(['Think about how the CDN identifies cached content', 'Consider what makes a "new" request']),
            xpValue: 20,
            orderIndex: 3,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Video Streaming CDN**

Design a CDN strategy for a video streaming platform (like YouTube). Consider:
- How are videos prepared for streaming?
- How does adaptive bitrate streaming work?
- How do you handle a viral video with millions of views?
- What about live streaming vs on-demand?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Video CDN requires specialized handling for adaptive streaming, massive scale, and different live vs VOD requirements.',
            hints: JSON.stringify(['Think about different network speeds', 'Consider what happens when a video goes viral']),
            sampleSolution: `**Video CDN Architecture:**

**1. Video Preparation (Transcoding):**
\`\`\`
Original Upload (4K, 10GB)
        ↓
   Transcoding
        ↓
Multiple Renditions:
  - 1080p @ 5 Mbps
  - 720p  @ 2.5 Mbps
  - 480p  @ 1 Mbps
  - 360p  @ 0.5 Mbps
        ↓
Segment into chunks (2-10 seconds each)
        ↓
Generate manifest file (HLS .m3u8 or DASH .mpd)
\`\`\`

**2. Adaptive Bitrate Streaming (ABR):**
\`\`\`
1. Player downloads manifest (list of qualities)
2. Starts with low quality
3. Measures download speed
4. Switches to higher quality if bandwidth allows
5. Drops quality if buffering detected

Result: Smooth playback on any connection
\`\`\`

**3. Viral Video Handling:**
\`\`\`
Video goes viral (10M requests/hour):

Strategy:
- Pre-warm popular content to all edges
- Origin shield prevents origin overload
- Multiple edge replicas per region
- Request coalescing (one origin fetch per edge)
\`\`\`

**4. Live vs On-Demand:**

**Live Streaming:**
- Ultra-low latency needed (sub-10 seconds)
- Content can't be pre-cached
- Use WebRTC or Low-Latency HLS
- Edge ingests stream, immediately serves

**On-Demand (VOD):**
- Pre-transcoded, pre-cached
- Higher cache hit rates
- Can optimize segment sizes
- Predictable load patterns

**Architecture:**
\`\`\`
Uploader → Ingest → Transcode → Storage → CDN → Viewers
                                   ↓
                            Origin Shield
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Explained transcoding and multiple bitrates',
              'Described adaptive bitrate streaming',
              'Addressed scaling for viral content',
              'Differentiated live vs on-demand'
            ]),
            xpValue: 35,
            orderIndex: 4,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 8: SEARCH SYSTEMS
  // ============================================
  {
    title: 'Search System Design',
    slug: 'search-system-design',
    description: 'Design scalable search systems using Elasticsearch, inverted indexes, relevance scoring, and autocomplete.',
    difficulty: 'advanced',
    orderIndex: 22,
    icon: '🔍',
    colorTheme: '#f97316',
    lessons: [
      {
        title: 'Search Infrastructure',
        slug: 'search-infrastructure',
        storyContent: `🔎 SEARCH PROBLEMS

"Our SQL LIKE queries are killing the database! As our product catalog grew to 10 million items, search takes 30 seconds and times out.

Users expect:
- Instant results as they type
- Typo tolerance ('iphon' → 'iPhone')
- Relevant ranking (not just keyword matching)
- Filters and facets

We need a real search solution!"`,
        orderIndex: 1,
        xpReward: 150,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Inverted Index**

Explain how an inverted index works:
- What is the structure of an inverted index?
- How is it different from a database B-tree index?
- How does it enable fast full-text search?
- Give an example with 3 products.`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Inverted indexes are the fundamental data structure enabling fast full-text search by mapping terms to documents.',
            hints: JSON.stringify(['Think about looking up words in a book index', 'Consider how you\'d find all documents containing "blue"']),
            sampleSolution: `**Inverted Index Explained:**

**Documents:**
\`\`\`
Doc1: "Blue Cotton T-Shirt"
Doc2: "Red Cotton Polo Shirt"
Doc3: "Blue Wool Sweater"
\`\`\`

**Traditional Index (B-Tree):**
\`\`\`
Find by ID: O(log n) ✓
Find "blue" in title: O(n) full scan ✗
\`\`\`

**Inverted Index:**
\`\`\`
Term      → Document IDs
--------------------------
blue      → [Doc1, Doc3]
cotton    → [Doc1, Doc2]
red       → [Doc2]
shirt     → [Doc1, Doc2]
t-shirt   → [Doc1]
polo      → [Doc2]
wool      → [Doc3]
sweater   → [Doc3]
\`\`\`

**Search: "blue cotton"**
\`\`\`
1. Look up "blue"   → [Doc1, Doc3]
2. Look up "cotton" → [Doc1, Doc2]
3. Intersect        → [Doc1] ✓
\`\`\`

**Why It's Fast:**
- Dictionary lookup: O(1) or O(log n)
- Set intersection: O(min(m, n))
- No full table scan needed

**Additional Metadata (Posting List):**
\`\`\`
blue → [
  {docId: 1, position: 0, frequency: 1},
  {docId: 3, position: 0, frequency: 1}
]
\`\`\`
- Position: Where in document (for phrase queries)
- Frequency: How often (for relevance scoring)

**Text Processing Pipeline:**
\`\`\`
"Blue T-Shirt!" 
  → lowercase: "blue t-shirt!"
  → remove punctuation: "blue t-shirt"
  → tokenize: ["blue", "t-shirt"]
  → stem/lemmatize: ["blue", "tshirt"]
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Showed mapping from terms to documents',
              'Explained why it\'s faster than database scan',
              'Demonstrated with example',
              'Mentioned text processing (tokenization, etc.)'
            ]),
            xpValue: 35,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `A user searches for "iphon 12 pro". How should the search system handle the typo?`,
            options: JSON.stringify([
              { id: 'a', text: 'Return no results - exact match only', feedback: 'Poor UX. Users make typos constantly.' },
              { id: 'b', text: 'Use fuzzy matching to find "iPhone 12 Pro"', feedback: 'Correct! Fuzzy matching uses edit distance to find similar terms despite typos.' },
              { id: 'c', text: 'Show "Did you mean: iPhone?" and wait for user to click', feedback: 'Adds friction. Better to show results directly with fuzzy match.' },
              { id: 'd', text: 'Search for documents containing "iphon" literally', feedback: 'This would miss all "iPhone" results, returning nothing useful.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Fuzzy matching uses edit distance (Levenshtein distance) to find terms within N edits (insertions, deletions, substitutions). "iphon" is 1 edit away from "iphone" (missing "e"), so it matches. Elasticsearch supports fuzziness out of the box.',
            hints: JSON.stringify(['Think about edit distance', 'Consider user experience with typos']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Relevance Scoring**

Two products match a search for "running shoes":
- Product A: "Nike Running Shoes - Best for Marathon"
- Product B: "Athletic Running Shoes, Walking Shoes, Casual Shoes"

How should the search engine rank these? Consider:
- Term frequency (TF)
- Inverse document frequency (IDF)
- Field importance (title vs description)
- User signals (clicks, purchases)`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Relevance scoring combines text matching signals with user behavior to rank results effectively.',
            hints: JSON.stringify(['Think about how often the terms appear', 'Consider which fields matter more']),
            sampleSolution: `**Relevance Scoring Analysis:**

**1. Term Frequency (TF):**
\`\`\`
Product A: "running" (1x), "shoes" (1x)
Product B: "running" (1x), "shoes" (3x)
\`\`\`
Raw TF: B wins (more matches)
But: B is keyword-stuffed, not actually more relevant

**2. TF-IDF (Term Frequency × Inverse Document Frequency):**
\`\`\`
IDF = log(total_docs / docs_containing_term)

"shoes" appears in 90% of products → low IDF (common)
"marathon" appears in 1% → high IDF (rare, valuable)
\`\`\`
Product A gets boost for "marathon" (unique term)

**3. BM25 (Modern Standard):**
\`\`\`
- Accounts for document length (B is longer)
- Diminishing returns for repeated terms
- More matches ≠ proportionally higher score
\`\`\`

**4. Field Boosting:**
\`\`\`
{
  "multi_match": {
    "query": "running shoes",
    "fields": [
      "title^3",      // 3x weight
      "category^2",   // 2x weight  
      "description"   // 1x weight
    ]
  }
}
\`\`\`
Title matches are more valuable

**5. User Signals:**
\`\`\`
Product A: 10,000 clicks, 500 purchases
Product B: 100 clicks, 2 purchases

click_boost = log(clicks + 1)
purchase_boost = log(purchases + 1) * 2
\`\`\`

**Final Score:**
\`\`\`
score = text_score * field_boost * user_signal_boost

Product A: Higher (focused title + user engagement)
Product B: Lower (keyword stuffing, poor engagement)
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Explained TF and IDF concepts',
              'Discussed field importance/boosting',
              'Mentioned user signals (clicks, purchases)',
              'Showed why A should rank higher than B'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Autocomplete**

Design an autocomplete system for a search box. Requirements:
- Show suggestions as user types
- Respond in < 100ms
- Handle 10,000 queries per second
- Personalize based on user history

How would you implement this?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Autocomplete requires specialized data structures and aggressive caching for sub-100ms response times.',
            hints: JSON.stringify(['Think about prefix trees (tries)', 'Consider what can be pre-computed vs real-time']),
            sampleSolution: `**Autocomplete Architecture:**

**1. Data Structure: Prefix Trie with Scoring**
\`\`\`
                    (root)
                   /  |  \\
                  i   r   s
                 /    |    \\
               ip    ru    sh
              /      |      \\
            iph    run     shi
           /         |       \\
        iphone   running   shirt
        [10000]   [5000]   [3000]  ← popularity scores
\`\`\`

**2. API Design:**
\`\`\`
GET /autocomplete?q=iph&user=123
Response (< 100ms):
{
  "suggestions": [
    {"text": "iphone 15", "score": 10000},
    {"text": "iphone 14 case", "score": 8000},
    {"text": "iphone charger", "score": 5000}
  ]
}
\`\`\`

**3. Caching Strategy:**
\`\`\`
Layer 1: CDN edge cache
  - Cache popular prefixes (1-3 chars)
  - "ip", "iph" cached globally
  
Layer 2: Application cache (Redis)
  - Longer prefixes
  - User-specific suggestions
  
Layer 3: Precomputed suggestions
  - Top 10 for each prefix stored in DB
\`\`\`

**4. Personalization:**
\`\`\`
// User 123 recently searched "running shoes"
// Now types "ru"

Global suggestions: ["running", "ruby", "russia"]
User's recent:      ["running shoes"]
Merged:             ["running shoes", "running", "ruby"]
\`\`\`

**5. Optimization Techniques:**
- Prefix index in Elasticsearch
- Completion suggester (FST-based)
- Precompute top-K for popular prefixes
- Debounce client-side (don't query every keystroke)

**Architecture:**
\`\`\`
User types → Debounce (150ms) → CDN/Cache → Suggestion Service
                                    ↓ cache miss
                            Elasticsearch/Redis
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Mentioned trie or prefix-based data structure',
              'Discussed caching strategy for speed',
              'Addressed personalization approach',
              'Considered scale (10K QPS)'
            ]),
            xpValue: 35,
            orderIndex: 4,
          },
          {
            type: 'trade_off',
            scenarioText: `You're choosing a search technology for your e-commerce site (1 million products). What's the best choice?`,
            options: JSON.stringify([
              { id: 'a', text: 'PostgreSQL full-text search', score: 60, feedback: 'Works for smaller scale but struggles with advanced features like fuzzy matching and facets at 1M+ products.' },
              { id: 'b', text: 'Elasticsearch', score: 95, feedback: 'Excellent choice! Purpose-built for search with fuzzy matching, facets, relevance tuning, and horizontal scaling.' },
              { id: 'c', text: 'MongoDB text indexes', score: 50, feedback: 'Basic text search but limited relevance tuning and fuzzy matching capabilities.' },
              { id: 'd', text: 'Build custom search with Redis', score: 40, feedback: 'Redis is great for caching autocomplete but not for full search functionality.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Elasticsearch (or alternatives like Solr, Meilisearch, Typesense) is purpose-built for search. It handles inverted indexes, fuzzy matching, faceted search, relevance tuning, and scales horizontally. At 1M products, you need these capabilities.',
            hints: JSON.stringify(['Consider the specific requirements: fuzzy matching, facets, relevance', 'Think about what\'s purpose-built for search']),
            xpValue: 25,
            orderIndex: 5,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 9: NOTIFICATION SYSTEMS
  // ============================================
  {
    title: 'Notification System Design',
    slug: 'notification-system-design',
    description: 'Design scalable notification systems for email, SMS, push notifications with delivery guarantees and user preferences.',
    difficulty: 'intermediate',
    orderIndex: 23,
    icon: '🔔',
    colorTheme: '#ec4899',
    lessons: [
      {
        title: 'Multi-Channel Notifications',
        slug: 'multi-channel-notifications',
        storyContent: `📱 NOTIFICATION CHAOS

"Users complain they get too many notifications. Some miss important alerts. Others get duplicates. Our notification code is scattered across 20 services.

We need a unified notification system that:
- Supports email, SMS, and push
- Respects user preferences
- Doesn't spam users
- Guarantees important messages are delivered"`,
        orderIndex: 1,
        xpReward: 120,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Notification System Architecture**

Design a centralized notification system. Consider:
- How do services send notifications?
- How do you handle multiple channels (email, SMS, push)?
- How do you ensure delivery?
- How do you prevent notification spam?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'A well-designed notification system centralizes logic, handles multiple channels, and respects user preferences.',
            hints: JSON.stringify(['Think about decoupling notification logic from business logic', 'Consider async processing for reliability']),
            sampleSolution: `**Notification System Architecture:**

**1. API for Services:**
\`\`\`json
POST /notifications
{
  "userId": "user_123",
  "type": "order_shipped",
  "data": {
    "orderId": "order_456",
    "trackingNumber": "1Z999..."
  },
  "priority": "high",
  "channels": ["email", "push"]  // optional override
}
\`\`\`

**2. System Components:**
\`\`\`
┌─────────────┐     ┌──────────────────┐
│  Services   │────▶│  Notification    │
│ (Order,etc) │     │     API          │
└─────────────┘     └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   Message Queue  │
                    │    (Kafka/SQS)   │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Email Worker  │   │  SMS Worker   │   │ Push Worker   │
│  (SendGrid)   │   │   (Twilio)    │   │    (FCM)      │
└───────────────┘   └───────────────┘   └───────────────┘
\`\`\`

**3. Template System:**
\`\`\`yaml
# templates/order_shipped.yaml
email:
  subject: "Your order {{orderId}} has shipped!"
  template: "order_shipped.html"
sms:
  body: "Order {{orderId}} shipped! Track: {{trackingUrl}}"
push:
  title: "Order Shipped 📦"
  body: "Your order is on the way!"
\`\`\`

**4. User Preferences:**
\`\`\`json
{
  "userId": "user_123",
  "preferences": {
    "marketing": {"email": false, "push": true},
    "transactional": {"email": true, "push": true, "sms": true},
    "quietHours": {"start": "22:00", "end": "08:00"}
  }
}
\`\`\`

**5. Delivery Guarantee:**
- Persist to queue before returning success
- Retry with exponential backoff
- Dead letter queue for failures
- Delivery receipts from providers`,
            evaluationCriteria: JSON.stringify([
              'Showed centralized API for services',
              'Separated channel-specific workers',
              'Mentioned user preferences',
              'Addressed delivery guarantees'
            ]),
            xpValue: 35,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `A user receives the same "order shipped" notification 3 times via email. What's the most likely cause and fix?`,
            options: JSON.stringify([
              { id: 'a', text: 'Email server is slow; add more servers', feedback: 'More servers doesn\'t prevent duplicates; it might make it worse.' },
              { id: 'b', text: 'Worker crashed during processing and retried; implement idempotency', feedback: 'Correct! Without idempotency, retries cause duplicates. Track sent notifications by unique ID.' },
              { id: 'c', text: 'User has multiple email addresses; deduplicate emails', feedback: 'If same email, it\'s not a multiple address issue. It\'s a retry/idempotency issue.' },
              { id: 'd', text: 'Queue message expired; increase TTL', feedback: 'TTL doesn\'t cause duplicates; retry behavior does.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Duplicate notifications typically occur when a worker processes a message, crashes before acknowledging it, and the message is redelivered. Implement idempotency by tracking notification IDs: before sending, check if this notification ID was already processed.',
            hints: JSON.stringify(['Think about what happens when a worker crashes mid-processing', 'Consider how to make operations safe to retry']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Rate Limiting Notifications**

Design a system to prevent notification spam. Consider:
- A bug sends 1000 notifications to a user in 1 minute
- Marketing wants to send a blast to 1 million users
- Users shouldn't get more than 10 notifications per day
- Important alerts (security, payments) should always go through`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Notification rate limiting must balance user experience with business needs while ensuring critical alerts get through.',
            hints: JSON.stringify(['Think about different limits for different notification types', 'Consider both per-user and global rate limits']),
            sampleSolution: `**Rate Limiting Strategy:**

**1. Per-User Limits:**
\`\`\`python
LIMITS = {
    "marketing": {"per_day": 3},
    "social": {"per_hour": 5, "per_day": 20},
    "transactional": {"per_hour": 20},
    "critical": {"unlimited": True}  # Security, payment alerts
}

def can_send(user_id, notification_type):
    limits = LIMITS[notification_type]
    if limits.get("unlimited"):
        return True
    
    count = get_notification_count(user_id, notification_type)
    return count < limits["per_day"]
\`\`\`

**2. Category Prioritization:**
\`\`\`
Priority 1 (Always send):
  - Security alerts (login from new device)
  - Payment failures
  - Account issues

Priority 2 (Rate limited):
  - Order updates
  - Messages from users

Priority 3 (Heavily limited):
  - Marketing emails
  - Feature announcements
  - Social notifications
\`\`\`

**3. Bulk Send Protection:**
\`\`\`
Marketing blast to 1M users:
  
1. Queue all notifications (don't send immediately)
2. Rate limit sending: 1000/second max
3. Stagger over hours (not all at midnight)
4. Monitor bounce/complaint rates
5. Circuit breaker: stop if complaint rate > 0.1%
\`\`\`

**4. Aggregation:**
\`\`\`
Instead of 10 notifications:
  "John liked your photo"
  "Jane liked your photo"
  ...

Send 1 notification:
  "John, Jane, and 8 others liked your photo"

Batch window: 5-15 minutes
\`\`\`

**5. Quiet Hours:**
\`\`\`python
if user.in_quiet_hours() and not notification.is_critical:
    schedule_for(user.quiet_hours_end)
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Defined per-user rate limits',
              'Created priority tiers for notification types',
              'Addressed bulk/marketing send protection',
              'Mentioned aggregation or batching'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `Push notifications are failing for 5% of users. Investigating shows their device tokens are invalid (app uninstalled, token expired). How do you handle this?`,
            options: JSON.stringify([
              { id: 'a', text: 'Keep retrying - maybe the token will work later', score: 20, feedback: 'Invalid tokens won\'t become valid. Endless retries waste resources.' },
              { id: 'b', text: 'Delete user\'s device token after first failure', score: 50, feedback: 'Too aggressive - could be a temporary issue. One failure shouldn\'t delete the token.' },
              { id: 'c', text: 'Mark token invalid after 3 failures, notify user via email to re-enable', score: 95, feedback: 'Perfect! Retry a few times, then gracefully degrade. Email as fallback channel.' },
              { id: 'd', text: 'Ignore the failures - 95% success rate is good enough', score: 40, feedback: '5% of users missing notifications is significant. Need better handling.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'Handle invalid tokens gracefully: retry a few times (provider might have temporary issues), then mark the token as invalid and clean it up. Notify users via an alternative channel (email) that push notifications are disabled and how to re-enable them.',
            hints: JSON.stringify(['Think about graceful degradation', 'Consider how to help users fix the issue']),
            xpValue: 25,
            orderIndex: 4,
          },
          {
            type: 'multi_select',
            scenarioText: `Which of the following are best practices for notification systems? (Select ALL that apply)`,
            options: JSON.stringify([
              { id: 'a', text: 'Send marketing emails immediately when user signs up', correct: false },
              { id: 'b', text: 'Allow users to unsubscribe from specific notification types', correct: true },
              { id: 'c', text: 'Include unsubscribe link in every marketing email', correct: true },
              { id: 'd', text: 'Track delivery, open, and click rates', correct: true },
              { id: 'e', text: 'Use the same template for email and SMS', correct: false },
            ]),
            correctAnswer: JSON.stringify(['b', 'c', 'd']),
            explanation: 'Best practices: respect user preferences with granular unsubscribe, comply with CAN-SPAM/GDPR with unsubscribe links, track metrics for optimization. Don\'t spam new users or use the same template for different channels (SMS has character limits).',
            hints: JSON.stringify(['Think about user control and legal compliance', 'Consider channel-specific constraints']),
            xpValue: 20,
            orderIndex: 5,
          },
        ],
      },
    ],
  },
];
