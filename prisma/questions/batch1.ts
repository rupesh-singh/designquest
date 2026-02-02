// Batch 1: 30 Questions covering foundational system design topics
// Topics: URL Shortener, Rate Limiting, Database Sharding, Message Queues, API Design

import { SeedModule } from './index';

export const batch1Modules: SeedModule[] = [
  // ============================================
  // MODULE 1: URL SHORTENER DESIGN
  // ============================================
  {
    title: 'Design a URL Shortener',
    slug: 'url-shortener-design',
    description: 'Learn to design a scalable URL shortening service like bit.ly. Cover hashing, storage, and redirection strategies.',
    difficulty: 'beginner',
    orderIndex: 10,
    icon: '🔗',
    colorTheme: '#3b82f6',
    lessons: [
      {
        title: 'URL Shortener Fundamentals',
        slug: 'url-shortener-fundamentals',
        storyContent: `📧 NEW PRODUCT INITIATIVE

"Hey team! We're building an internal URL shortener for our marketing campaigns. We need to track clicks and make our links look cleaner.

Requirements:
- Shorten long URLs to short codes
- Handle millions of URLs
- Track click analytics
- Links should work forever (or have optional expiry)

Let's design this step by step!"`,
        orderIndex: 1,
        xpReward: 100,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: URL Shortening Algorithm**

You need to generate short codes for URLs (e.g., "abc123" for a long URL).

Design an algorithm to generate unique short codes. Consider:
- How will you ensure uniqueness?
- What characters will you use?
- How long should codes be?
- How will you handle collisions?

Take 5 minutes to think through your approach, then view the solution.`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'URL shortening requires balancing uniqueness, length, and collision handling. The most common approaches are Base62 encoding of auto-increment IDs or hash-based generation with collision detection.',
            hints: JSON.stringify(['Think about Base62 encoding (a-z, A-Z, 0-9)', 'Consider using auto-incrementing IDs vs random generation']),
            sampleSolution: `**Approach 1: Base62 Encoding of Auto-Increment ID**
- Use database auto-increment ID
- Convert ID to Base62 (62 chars = a-z, A-Z, 0-9)
- Example: ID 12345 → "dnh"
- Pros: No collisions, predictable
- Cons: Sequential (can be enumerated)

**Approach 2: Hash-Based**
- Hash the URL (MD5/SHA256)
- Take first 6-8 characters
- Check for collision, regenerate if needed
- Pros: Random, not enumerable
- Cons: Collision checking overhead

**Recommended: Base62 with Counter Service**
- Use distributed counter (Redis INCR)
- Convert to Base62
- 6 chars = 62^6 = 56 billion unique URLs
- Add random salt for non-sequential appearance`,
            evaluationCriteria: JSON.stringify([
              'Discussed character set (Base62 or similar)',
              'Addressed uniqueness/collision handling',
              'Considered code length vs capacity tradeoff',
              'Mentioned storage and lookup strategy'
            ]),
            xpValue: 30,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `You're using Base62 encoding for short codes. If you want to support at least 1 billion unique URLs, what's the MINIMUM short code length needed?

Base62 uses: a-z (26) + A-Z (26) + 0-9 (10) = 62 characters`,
            options: JSON.stringify([
              { id: 'a', text: '4 characters (62^4 = ~14.7 million)', feedback: 'This only supports about 14.7 million URLs, not enough for 1 billion.' },
              { id: 'b', text: '5 characters (62^5 = ~916 million)', feedback: 'Close! But 916 million is still less than 1 billion. You\'d run out of codes.' },
              { id: 'c', text: '6 characters (62^6 = ~56.8 billion)', feedback: 'Correct! 6 characters gives you 56.8 billion combinations, plenty of room for 1 billion URLs with space to grow.' },
              { id: 'd', text: '7 characters (62^7 = ~3.5 trillion)', feedback: 'This works but is more than needed. 6 characters is sufficient and shorter.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: '62^6 = 56,800,235,584 (about 56.8 billion). This comfortably exceeds 1 billion while keeping URLs short. Always plan for 10-50x your expected capacity for growth.',
            hints: JSON.stringify(['Calculate 62^n for different values of n', 'Consider future growth beyond the minimum requirement']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Database Schema**

Design the database schema for the URL shortener. Consider:
- What tables do you need?
- What columns for each table?
- What indexes would you create?
- How would you handle analytics (click tracking)?

Sketch out your schema design.`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'A good schema separates URL storage from analytics, uses appropriate indexes, and considers read vs write patterns.',
            hints: JSON.stringify(['Think about read-heavy vs write-heavy operations', 'Consider what queries will be most common']),
            sampleSolution: `**Core Tables:**

\`\`\`sql
-- URLs table (write once, read many)
CREATE TABLE urls (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  user_id BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  INDEX idx_short_code (short_code),  -- Fast lookups
  INDEX idx_user_id (user_id)         -- User's URLs
);

-- Click analytics (append-only, high volume)
CREATE TABLE clicks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  url_id BIGINT NOT NULL,
  clicked_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  referer TEXT,
  country VARCHAR(2),
  
  INDEX idx_url_id (url_id),
  INDEX idx_clicked_at (clicked_at)
);

-- Aggregated stats (for fast dashboard queries)
CREATE TABLE url_stats (
  url_id BIGINT PRIMARY KEY,
  total_clicks BIGINT DEFAULT 0,
  last_clicked_at TIMESTAMP,
  unique_visitors INT DEFAULT 0
);
\`\`\`

**Key Design Decisions:**
- Separate clicks table for analytics (high write volume)
- Pre-aggregated stats for fast reads
- short_code indexed for O(1) redirects`,
            evaluationCriteria: JSON.stringify([
              'Included URL storage table with short_code',
              'Considered click tracking/analytics',
              'Added appropriate indexes',
              'Thought about query patterns'
            ]),
            xpValue: 30,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `Your URL shortener is getting 10,000 redirect requests per second. The database is becoming a bottleneck. What's the best optimization strategy?`,
            options: JSON.stringify([
              { id: 'a', text: 'Add more database replicas', score: 60, feedback: 'Replicas help with read scaling but add complexity and eventual consistency issues. There\'s a better first step.' },
              { id: 'b', text: 'Add Redis cache in front of the database', score: 100, feedback: 'Excellent! Caching is the best first step. URLs rarely change, so cache hit rates will be 95%+. Redis can handle 100K+ ops/sec.' },
              { id: 'c', text: 'Shard the database by short_code', score: 50, feedback: 'Sharding adds significant complexity. Try caching first - it\'s simpler and often sufficient.' },
              { id: 'd', text: 'Move to a NoSQL database', score: 40, feedback: 'Changing databases is a major undertaking. The issue is likely read load, which caching solves more elegantly.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'For read-heavy workloads like URL redirects, adding a cache (Redis/Memcached) is the most effective first optimization. URLs are immutable once created, making them perfect for caching with high TTLs.',
            hints: JSON.stringify(['URL redirects are read-heavy operations', 'Once a short URL is created, it rarely changes']),
            xpValue: 25,
            orderIndex: 4,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 2: RATE LIMITING & THROTTLING
  // ============================================
  {
    title: 'Rate Limiting Systems',
    slug: 'rate-limiting-systems',
    description: 'Master rate limiting algorithms and protect your APIs from abuse. Learn token bucket, sliding window, and distributed rate limiting.',
    difficulty: 'intermediate',
    orderIndex: 11,
    icon: '🚦',
    colorTheme: '#ef4444',
    lessons: [
      {
        title: 'Rate Limiting Algorithms',
        slug: 'rate-limiting-algorithms',
        storyContent: `🚨 SECURITY ALERT

"Our API is under attack! Someone is hitting our endpoints 10,000 times per second from multiple IPs. The servers are overloaded and legitimate users can't access the service.

We need rate limiting NOW. But we also need to be smart about it - we don't want to block legitimate high-volume customers."

Design a rate limiting system that's both protective and fair.`,
        orderIndex: 1,
        xpReward: 120,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Token Bucket Algorithm**

Explain how the Token Bucket algorithm works for rate limiting:
- How does it work conceptually?
- What are its parameters?
- How does it handle bursts?
- What are its pros and cons?

Draw/describe the algorithm flow.`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Token Bucket is one of the most popular rate limiting algorithms because it allows controlled bursts while maintaining an average rate limit.',
            hints: JSON.stringify(['Think of tokens being added to a bucket at a fixed rate', 'What happens when the bucket is full vs empty?']),
            sampleSolution: `**Token Bucket Algorithm:**

**Concept:**
- Imagine a bucket that holds tokens
- Tokens are added at a fixed rate (e.g., 10 tokens/second)
- Each request consumes 1 token
- If bucket is empty, request is rejected
- Bucket has maximum capacity (burst limit)

**Parameters:**
1. **Bucket Size (b)**: Maximum tokens (burst capacity)
2. **Refill Rate (r)**: Tokens added per second

**Example: 100 requests/min with burst of 20**
- Bucket size: 20 tokens
- Refill rate: 100/60 ≈ 1.67 tokens/second

**Flow:**
\`\`\`
Request arrives:
  if tokens >= 1:
    tokens -= 1
    ALLOW request
  else:
    REJECT request (429 Too Many Requests)

Every 1/r seconds:
  if tokens < bucket_size:
    tokens += 1
\`\`\`

**Pros:**
- Allows bursts (good UX)
- Simple to implement
- Memory efficient (just store count + timestamp)

**Cons:**
- Bursts can still overwhelm backend briefly
- Not perfectly smooth traffic`,
            evaluationCriteria: JSON.stringify([
              'Explained token generation at fixed rate',
              'Explained token consumption per request',
              'Mentioned bucket capacity (burst limit)',
              'Discussed what happens when bucket is empty'
            ]),
            xpValue: 30,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `You're implementing rate limiting for an API. You want to allow 100 requests per minute per user, with a burst allowance of 20 requests.

A user has been idle for 5 minutes and then suddenly sends 25 requests at once. How many requests should be allowed?`,
            options: JSON.stringify([
              { id: 'a', text: '20 requests (bucket max capacity)', feedback: 'Correct! The bucket can hold maximum 20 tokens (burst limit). Even after 5 minutes idle, it only fills to capacity, not beyond.' },
              { id: 'b', text: '25 requests (all of them)', feedback: 'Incorrect. The bucket has a maximum size of 20, so it can\'t accumulate more than 20 tokens regardless of idle time.' },
              { id: 'c', text: '100 requests (full minute\'s allowance)', feedback: 'Incorrect. The bucket size (20) limits burst capacity, not the rate limit (100/min).' },
              { id: 'd', text: '500 requests (5 minutes × 100/min)', feedback: 'Incorrect. Tokens don\'t accumulate beyond bucket capacity. The max burst is always limited by bucket size.' },
            ]),
            correctAnswer: JSON.stringify('a'),
            explanation: 'In Token Bucket, the bucket size caps the maximum burst. Even if a user is idle for hours, they can only accumulate tokens up to the bucket capacity. This prevents "saving up" requests to overwhelm the system.',
            hints: JSON.stringify(['The bucket has a maximum capacity', 'Idle time doesn\'t mean unlimited accumulation']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Sliding Window Rate Limiting**

Compare Fixed Window vs Sliding Window rate limiting:
- How does each work?
- What's the "boundary problem" with fixed windows?
- How does sliding window solve it?
- What are the tradeoffs?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Sliding Window provides more accurate rate limiting than Fixed Window by eliminating the boundary burst problem.',
            hints: JSON.stringify(['Think about what happens at window boundaries', 'Consider a user sending requests right before and after a window resets']),
            sampleSolution: `**Fixed Window:**
- Divide time into fixed intervals (e.g., 1-minute windows)
- Count requests in current window
- Reset counter at window boundary

**Problem: Boundary Burst**
- Limit: 100 requests/minute
- User sends 100 requests at 0:59
- Window resets at 1:00
- User sends 100 more at 1:01
- Result: 200 requests in 2 seconds! 😱

**Sliding Window Log:**
- Store timestamp of each request
- Count requests in last N seconds
- Very accurate but memory-intensive

**Sliding Window Counter (Hybrid):**
- Track counts for current + previous window
- Weight previous window by overlap percentage

\`\`\`
Example at 1:15 (15 secs into minute 1):
- Previous window (minute 0): 80 requests
- Current window (minute 1): 30 requests
- Overlap: 75% of previous window counts
- Weighted total: (80 × 0.75) + 30 = 90 requests
\`\`\`

**Tradeoffs:**
| Algorithm | Memory | Accuracy | Complexity |
|-----------|--------|----------|------------|
| Fixed Window | O(1) | Low | Simple |
| Sliding Log | O(n) | High | Medium |
| Sliding Counter | O(1) | Medium | Medium |`,
            evaluationCriteria: JSON.stringify([
              'Explained fixed window approach',
              'Identified the boundary/burst problem',
              'Explained sliding window solution',
              'Discussed memory vs accuracy tradeoff'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `You need to implement rate limiting for a distributed system with 50 API servers. Where should you store the rate limit counters?`,
            options: JSON.stringify([
              { id: 'a', text: 'Local memory on each server', score: 30, feedback: 'This doesn\'t work! Users could get 50x their limit by hitting different servers. No coordination = no real limiting.' },
              { id: 'b', text: 'Centralized Redis cluster', score: 100, feedback: 'Perfect! Redis provides atomic operations (INCR, EXPIRE), sub-millisecond latency, and natural clustering. Industry standard choice.' },
              { id: 'c', text: 'Shared PostgreSQL database', score: 50, feedback: 'Works but has higher latency than Redis. At high QPS, database could become a bottleneck. Redis is better suited for this.' },
              { id: 'd', text: 'Sticky sessions to route users to same server', score: 40, feedback: 'Reduces the problem but doesn\'t solve it (users can still game it). Also limits load balancing flexibility.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Redis is the go-to choice for distributed rate limiting. Its atomic operations (INCR, EXPIRE) prevent race conditions, and its in-memory nature provides the sub-millisecond latency needed for rate limiting without adding significant overhead.',
            hints: JSON.stringify(['Rate limiting needs to be consistent across all servers', 'Consider latency - rate limit checks happen on every request']),
            xpValue: 25,
            orderIndex: 4,
          },
          {
            type: 'multi_select',
            scenarioText: `Which of the following are valid rate limiting strategies? (Select ALL that apply)`,
            options: JSON.stringify([
              { id: 'a', text: 'Rate limit by IP address', correct: true },
              { id: 'b', text: 'Rate limit by API key / User ID', correct: true },
              { id: 'c', text: 'Rate limit by endpoint (different limits for different APIs)', correct: true },
              { id: 'd', text: 'Rate limit by request body size', correct: false },
              { id: 'e', text: 'Tiered rate limits based on subscription plan', correct: true },
            ]),
            correctAnswer: JSON.stringify(['a', 'b', 'c', 'e']),
            explanation: 'Rate limiting is typically done by identity (IP, user, API key), by resource (endpoint), or by tier (plan). Request body size is typically handled by payload limits, not rate limiting.',
            hints: JSON.stringify(['Think about what identifies a client', 'Consider business requirements like paid tiers']),
            xpValue: 20,
            orderIndex: 5,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 3: DATABASE SCALING & SHARDING
  // ============================================
  {
    title: 'Database Scaling Strategies',
    slug: 'database-scaling',
    description: 'Learn horizontal and vertical scaling, read replicas, sharding strategies, and how to handle data growth at scale.',
    difficulty: 'intermediate',
    orderIndex: 12,
    icon: '🗃️',
    colorTheme: '#8b5cf6',
    lessons: [
      {
        title: 'Scaling Relational Databases',
        slug: 'scaling-relational-databases',
        storyContent: `📊 DATABASE CRISIS

"Our main PostgreSQL database is at 90% CPU during peak hours. Query latency has increased from 5ms to 500ms. Users are complaining about slow load times.

Current stats:
- 500GB of data
- 10,000 queries per second
- 80% reads, 20% writes
- Growing 50GB per month

We need a scaling strategy before Black Friday hits!"`,
        orderIndex: 1,
        xpReward: 130,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Vertical vs Horizontal Scaling**

Explain the difference between vertical and horizontal database scaling:
- What is each approach?
- When would you use each?
- What are the limits of each?
- How do they affect your application code?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Understanding when to scale up (vertical) vs scale out (horizontal) is fundamental to database architecture decisions.',
            hints: JSON.stringify(['Vertical = bigger machine, Horizontal = more machines', 'Consider cost curves and operational complexity']),
            sampleSolution: `**Vertical Scaling (Scale Up):**
- Add more resources to existing server
- More CPU, RAM, faster disks (NVMe SSDs)
- Upgrade from 16GB → 64GB → 256GB RAM

*Pros:*
- No application changes needed
- No distributed system complexity
- ACID transactions just work

*Cons:*
- Hardware limits (can't buy infinite RAM)
- Single point of failure
- Expensive at high end (costs grow exponentially)

**Horizontal Scaling (Scale Out):**
- Add more database servers
- Distribute data across machines

*Types:*
1. **Read Replicas**: Copies for read queries
2. **Sharding**: Split data across databases

*Pros:*
- Nearly unlimited scaling
- Better fault tolerance
- Cost-effective (commodity hardware)

*Cons:*
- Application complexity
- Distributed transactions are hard
- Operational overhead

**Decision Guide:**
- Start vertical (simpler)
- Add read replicas when reads bottleneck
- Consider sharding only when:
  - Data > 1TB
  - Write throughput maxed
  - Vertical costs prohibitive

**For our scenario (80% reads, 20% writes):**
→ Add read replicas FIRST
→ This could 5x our read capacity easily`,
            evaluationCriteria: JSON.stringify([
              'Defined vertical scaling correctly',
              'Defined horizontal scaling correctly',
              'Discussed tradeoffs of each',
              'Mentioned when to use each approach'
            ]),
            xpValue: 30,
            orderIndex: 1,
          },
          {
            type: 'trade_off',
            scenarioText: `Given the scenario (500GB data, 10K QPS, 80% reads, 20% writes), what should be your FIRST scaling action?`,
            options: JSON.stringify([
              { id: 'a', text: 'Implement database sharding', score: 40, feedback: 'Sharding is complex and likely premature here. With 80% reads, there\'s a simpler solution.' },
              { id: 'b', text: 'Add read replicas', score: 100, feedback: 'Perfect! With 80% reads, adding 2-3 read replicas can immediately offload the primary database. Simple to implement, big impact.' },
              { id: 'c', text: 'Migrate to NoSQL', score: 30, feedback: 'A major migration for a problem that can be solved with read replicas. This adds risk without clear benefit.' },
              { id: 'd', text: 'Double the server size (vertical scaling)', score: 60, feedback: 'This would help but is expensive and doesn\'t address the read-heavy nature. Read replicas are more cost-effective.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'For read-heavy workloads (80% reads), read replicas are the obvious first choice. They\'re easy to set up, require minimal code changes (just route reads to replicas), and can multiply your read capacity by the number of replicas.',
            hints: JSON.stringify(['80% reads is a key data point', 'What\'s the simplest way to handle more read queries?']),
            xpValue: 25,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Database Sharding**

Design a sharding strategy for a users table with 100 million rows. Consider:
- What column would you shard by (shard key)?
- How many shards would you start with?
- How would you handle queries that span multiple shards?
- What about joins with other tables?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Sharding key selection is crucial - it determines data distribution, query efficiency, and future scalability.',
            hints: JSON.stringify(['Think about access patterns - how do you typically query users?', 'Consider data distribution - will shards be balanced?']),
            sampleSolution: `**Shard Key Selection for Users Table:**

**Option 1: Shard by user_id (Recommended)**
\`\`\`
shard = hash(user_id) % num_shards
\`\`\`
*Pros:*
- Even distribution (if using hash)
- Most queries include user_id
- User's data always on same shard

*Cons:*
- Range queries on user_id need all shards

**Option 2: Shard by geography**
\`\`\`
shard = user.region (US, EU, ASIA)
\`\`\`
*Pros:*
- Data locality for regional queries
- Compliance (data residency)

*Cons:*
- Uneven distribution
- Cross-region queries complex

**Number of Shards:**
- 100M rows ÷ 10M per shard = 10 shards
- Start with 16 (power of 2, easy resharding)
- Plan for 4x growth = 64 shards eventually

**Cross-Shard Queries:**
- Scatter-gather: Query all shards, merge results
- Expensive! Avoid in hot paths
- Denormalize to reduce cross-shard needs

**Joins Strategy:**
- Co-locate related data (same shard key)
- e.g., orders sharded by user_id too
- For reference tables: replicate to all shards

**Shard Mapping:**
\`\`\`
// Consistent hashing for flexibility
shard_id = consistent_hash(user_id)
db_host = shard_map[shard_id]
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Chose appropriate shard key with reasoning',
              'Discussed number of shards',
              'Addressed cross-shard query challenges',
              'Mentioned related data co-location'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'multiple_choice',
            scenarioText: `You've implemented sharding by user_id. A product manager asks: "Show me all users who signed up in the last 24 hours."

What's the challenge with this query?`,
            options: JSON.stringify([
              { id: 'a', text: 'The query is impossible to execute', feedback: 'It\'s possible, just inefficient. You can still query all shards.' },
              { id: 'b', text: 'The query requires scanning ALL shards (scatter-gather)', feedback: 'Correct! Since you\'re not filtering by user_id (your shard key), the query must hit every shard and merge results. This is expensive.' },
              { id: 'c', text: 'created_at needs to be indexed', feedback: 'Indexing helps within each shard, but doesn\'t solve the multi-shard query problem.' },
              { id: 'd', text: 'You need to change the shard key to created_at', feedback: 'This would help this query but break user-based queries. Shard key changes are major decisions.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'When a query doesn\'t include the shard key, it becomes a "scatter-gather" operation - you must query ALL shards and merge results. This is N times slower (where N = number of shards). Design your shard key around your most common access patterns.',
            hints: JSON.stringify(['Think about which shard has "users from last 24 hours"', 'Consider how the database knows where to look']),
            xpValue: 20,
            orderIndex: 4,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 4: MESSAGE QUEUES & ASYNC PROCESSING
  // ============================================
  {
    title: 'Message Queues & Event-Driven Architecture',
    slug: 'message-queues',
    description: 'Master asynchronous processing with message queues. Learn Kafka, RabbitMQ patterns, and event-driven architecture.',
    difficulty: 'intermediate',
    orderIndex: 13,
    icon: '📬',
    colorTheme: '#f59e0b',
    lessons: [
      {
        title: 'Introduction to Message Queues',
        slug: 'intro-message-queues',
        storyContent: `🎯 PERFORMANCE PROBLEM

"Our checkout API is taking 8 seconds! Here's what happens when a user places an order:
1. Validate payment (200ms)
2. Update inventory (100ms)
3. Send confirmation email (2000ms)
4. Generate invoice PDF (1500ms)
5. Update analytics (500ms)
6. Notify warehouse (300ms)
7. Send push notification (400ms)

Users are abandoning checkout because it's too slow. Help!"`,
        orderIndex: 1,
        xpReward: 110,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Identifying Async Candidates**

From the checkout flow above, identify which operations should be:
1. Synchronous (must complete before responding)
2. Asynchronous (can happen in background)

Explain your reasoning for each.`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Understanding what MUST be synchronous vs what CAN be async is key to designing responsive systems.',
            hints: JSON.stringify(['What does the user need to see immediately?', 'What can happen after the user gets a response?']),
            sampleSolution: `**Synchronous (Must complete before response):**
1. ✅ **Validate payment (200ms)** - User needs to know if payment worked
2. ✅ **Update inventory (100ms)** - Must reserve stock before confirming

**Asynchronous (Background processing):**
3. 📧 **Send confirmation email** - User doesn't wait for email
4. 📄 **Generate invoice PDF** - Can be ready in a few seconds
5. 📊 **Update analytics** - Backend concern
6. 📦 **Notify warehouse** - Backend concern
7. 🔔 **Send push notification** - Can arrive slightly delayed

**Result:**
- Sync: 200ms + 100ms = **300ms** (97% faster!)
- Async: 2000ms + 1500ms + 500ms + 300ms + 400ms = 4700ms (processed in background)

**Architecture:**
\`\`\`
User Request → Validate Payment → Reserve Inventory → Return Success
                                          ↓
                                   Publish "OrderCreated" event
                                          ↓
                     ┌──────────────────┬───────────────────┐
                     ↓                  ↓                   ↓
              Email Service    Invoice Service    Analytics Service
                     ↓                  ↓                   ↓
             Warehouse Service    Push Notification Service
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Identified payment validation as synchronous',
              'Identified email/notifications as asynchronous',
              'Provided reasoning for each decision',
              'Calculated approximate response time improvement'
            ]),
            xpValue: 30,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `What is the PRIMARY benefit of using a message queue between services?`,
            options: JSON.stringify([
              { id: 'a', text: 'It makes communication faster', feedback: 'Actually, adding a queue adds latency. The benefit is elsewhere.' },
              { id: 'b', text: 'It decouples services and handles load spikes through buffering', feedback: 'Correct! Message queues decouple producers from consumers and buffer messages during traffic spikes, preventing cascading failures.' },
              { id: 'c', text: 'It encrypts messages automatically', feedback: 'Encryption is a feature some queues offer, but it\'s not the primary benefit.' },
              { id: 'd', text: 'It guarantees messages are processed in order', feedback: 'Some queues offer ordering, but it\'s not universal or the primary benefit.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Message queues provide temporal decoupling (producer and consumer don\'t need to be available simultaneously) and load leveling (buffering during spikes). If a downstream service is slow or down, messages queue up instead of causing failures.',
            hints: JSON.stringify(['Think about what happens during traffic spikes', 'What if a downstream service is temporarily unavailable?']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Message Queue Architecture**

Design the message queue architecture for the order processing system. Consider:
- What topics/queues would you create?
- What message format would you use?
- How would you handle failed message processing?
- How would you ensure messages aren't processed twice?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'A well-designed queue architecture considers message structure, failure handling, and idempotency.',
            hints: JSON.stringify(['Think about one topic per event type vs one topic per service', 'What happens if processing fails halfway?']),
            sampleSolution: `**Topics/Queues:**
\`\`\`
orders.created      → Multiple consumers
orders.fulfilled    → Analytics, Notifications
payments.completed  → Order service, Receipts
inventory.reserved  → Warehouse
\`\`\`

**Message Format (CloudEvents standard):**
\`\`\`json
{
  "id": "evt_abc123",
  "type": "order.created",
  "source": "checkout-service",
  "time": "2024-01-15T10:30:00Z",
  "data": {
    "orderId": "ord_xyz",
    "userId": "usr_123",
    "items": [...],
    "total": 99.99
  },
  "metadata": {
    "correlationId": "req_456",
    "version": "1.0"
  }
}
\`\`\`

**Failure Handling:**
1. **Retry with backoff**: 1s, 5s, 30s, 5min
2. **Dead Letter Queue (DLQ)**: After N retries
3. **Alerting**: Monitor DLQ size
4. **Manual inspection**: Admin tool for DLQ

**Idempotency (prevent duplicate processing):**
\`\`\`python
def process_order(message):
    # Check if already processed
    if redis.exists(f"processed:{message.id}"):
        return  # Skip duplicate
    
    # Process message
    create_invoice(message.data)
    
    # Mark as processed (with TTL)
    redis.setex(f"processed:{message.id}", 86400, "1")
\`\`\`

**Consumer Groups (Kafka style):**
- Multiple instances share the load
- Each message processed by one instance per group`,
            evaluationCriteria: JSON.stringify([
              'Defined clear topic/queue structure',
              'Included message format with essential fields',
              'Addressed failure handling (retry, DLQ)',
              'Mentioned idempotency/deduplication'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `You're choosing between RabbitMQ and Apache Kafka for your order processing system. The system processes 50,000 orders per day with peaks of 500 orders per minute.

Which would you recommend?`,
            options: JSON.stringify([
              { id: 'a', text: 'RabbitMQ - traditional message broker', score: 90, feedback: 'Great choice for this scale! RabbitMQ excels at task queues with acknowledgments, routing, and is simpler to operate. Perfect for 50K messages/day.' },
              { id: 'b', text: 'Kafka - distributed event streaming', score: 70, feedback: 'Kafka works but is overkill for this scale. Kafka shines at millions of events/day, event sourcing, and replay capabilities.' },
              { id: 'c', text: 'Amazon SQS - managed queue service', score: 85, feedback: 'Also a good choice! SQS is fully managed, scales automatically, and is cost-effective at this volume. Less flexible than RabbitMQ but simpler.' },
              { id: 'd', text: 'Redis Pub/Sub - in-memory messaging', score: 40, feedback: 'Redis Pub/Sub doesn\'t persist messages. If a consumer is down, messages are lost. Not suitable for order processing.' },
            ]),
            correctAnswer: JSON.stringify('a'),
            explanation: 'At 50K orders/day, RabbitMQ or SQS are appropriate choices. Kafka is designed for much higher throughput (millions of events) and adds operational complexity. Choose the simplest tool that meets your needs.',
            hints: JSON.stringify(['Consider the scale: 50K/day is ~35/minute average', 'Think about operational complexity vs features']),
            xpValue: 25,
            orderIndex: 4,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 5: API DESIGN
  // ============================================
  {
    title: 'API Design Best Practices',
    slug: 'api-design',
    description: 'Design clean, scalable, and developer-friendly APIs. Cover REST, GraphQL, versioning, pagination, and error handling.',
    difficulty: 'beginner',
    orderIndex: 14,
    icon: '🔌',
    colorTheme: '#10b981',
    lessons: [
      {
        title: 'RESTful API Design',
        slug: 'restful-api-design',
        storyContent: `👨‍💻 API REVIEW MEETING

"We're launching a public API for our e-commerce platform. Partners will build integrations, mobile apps will consume it, and our own frontend uses it.

We need an API that's:
- Easy to understand
- Consistent and predictable
- Backward compatible as we evolve
- Performant at scale

Let's design it right from the start!"`,
        orderIndex: 1,
        xpReward: 100,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Resource Naming**

Design RESTful endpoints for an e-commerce API. Include endpoints for:
- Products (list, get, create, update, delete)
- Product reviews
- Shopping cart
- Orders

Follow REST naming conventions and best practices.`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Good REST API design uses nouns for resources, proper HTTP verbs, and consistent URL patterns.',
            hints: JSON.stringify(['Use plural nouns for collections', 'Use HTTP verbs for actions, not URL paths']),
            sampleSolution: `**Products:**
\`\`\`
GET    /products              # List products (with pagination)
GET    /products/:id          # Get single product
POST   /products              # Create product (admin)
PUT    /products/:id          # Update product (admin)
DELETE /products/:id          # Delete product (admin)
\`\`\`

**Product Reviews (nested resource):**
\`\`\`
GET    /products/:id/reviews        # Reviews for a product
POST   /products/:id/reviews        # Add review
GET    /products/:id/reviews/:rid   # Get specific review
DELETE /products/:id/reviews/:rid   # Delete review
\`\`\`

**Shopping Cart (user-specific):**
\`\`\`
GET    /cart                  # Get current user's cart
POST   /cart/items            # Add item to cart
PUT    /cart/items/:itemId    # Update quantity
DELETE /cart/items/:itemId    # Remove item
DELETE /cart                  # Clear cart
\`\`\`

**Orders:**
\`\`\`
GET    /orders                # User's orders (paginated)
GET    /orders/:id            # Order details
POST   /orders                # Create order (checkout)
\`\`\`

**Key Principles:**
- ✅ Plural nouns: /products not /product
- ✅ Nested for relationships: /products/:id/reviews
- ✅ HTTP verbs for actions: DELETE not /deleteProduct
- ✅ Consistent naming: kebab-case or camelCase
- ❌ Avoid: /getProducts, /createOrder (verbs in URL)`,
            evaluationCriteria: JSON.stringify([
              'Used plural nouns for resources',
              'Proper HTTP method usage (GET, POST, PUT, DELETE)',
              'Nested resources for relationships',
              'Consistent URL structure'
            ]),
            xpValue: 30,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `A developer on your team proposes this endpoint for searching products:

GET /api/searchProducts?name=shirt&category=clothing&minPrice=10&maxPrice=50

What's wrong with this design?`,
            options: JSON.stringify([
              { id: 'a', text: 'Nothing, this is correct RESTful design', feedback: 'There is an issue with the URL structure. Check the endpoint name.' },
              { id: 'b', text: 'Should be POST since it has many parameters', feedback: 'GET is correct for read operations. Number of params doesn\'t determine the method.' },
              { id: 'c', text: 'The verb "search" should not be in the URL; use GET /products with query params', feedback: 'Correct! In REST, resources are nouns. Search is just filtering the products resource with query parameters.' },
              { id: 'd', text: 'Query parameters should be in the request body', feedback: 'Query parameters in the URL are correct for GET requests. Bodies in GET requests are discouraged.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'In RESTful design, URLs represent resources (nouns), and HTTP methods represent actions. "Search" is an action that should be expressed as filtering the products resource: GET /products?name=shirt&category=clothing&minPrice=10&maxPrice=50',
            hints: JSON.stringify(['REST uses nouns for resources', 'HTTP verbs already express the action']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Pagination**

Design a pagination strategy for the GET /products endpoint that returns 10,000+ products. Consider:
- How will clients request specific pages?
- What information should the response include?
- What are the tradeoffs of offset vs cursor pagination?
- How will you handle sorting?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Pagination is crucial for APIs returning large datasets. The choice between offset and cursor pagination has significant performance implications.',
            hints: JSON.stringify(['Think about what happens with offset pagination on page 500', 'Consider how sorting affects cursor design']),
            sampleSolution: `**Option 1: Offset Pagination**
\`\`\`
GET /products?page=5&limit=20&sort=price&order=asc

Response:
{
  "data": [...],
  "pagination": {
    "page": 5,
    "limit": 20,
    "total": 10543,
    "totalPages": 528,
    "hasNext": true,
    "hasPrev": true
  }
}
\`\`\`

*Pros:* Simple, can jump to any page
*Cons:* Slow on large offsets (OFFSET 10000 is expensive)

**Option 2: Cursor Pagination (Recommended for large datasets)**
\`\`\`
GET /products?limit=20&cursor=eyJpZCI6MTIzNH0=

Response:
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "nextCursor": "eyJpZCI6MTI1NH0=",
    "prevCursor": "eyJpZCI6MTIzNH0=",
    "hasMore": true
  }
}
\`\`\`

*Cursor decodes to:* {"id": 1234, "sortKey": "..."}

*Pros:* Consistent performance, handles real-time data
*Cons:* Can't jump to page N, more complex

**Sorting:**
\`\`\`
GET /products?sort=price:asc,createdAt:desc
\`\`\`

**Recommended Approach:**
- < 10K items: Offset pagination is fine
- > 10K items: Use cursor pagination
- Provide both for flexibility:
  - offset/limit for simple cases
  - cursor for infinite scroll / large datasets`,
            evaluationCriteria: JSON.stringify([
              'Showed request format with pagination params',
              'Included pagination metadata in response',
              'Compared offset vs cursor pagination',
              'Addressed sorting mechanism'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `Your API needs to return both product details AND reviews in one call. Mobile clients are complaining about making multiple requests. What approach would you recommend?`,
            options: JSON.stringify([
              { id: 'a', text: 'Compound endpoint: GET /products/:id?include=reviews', score: 90, feedback: 'Good choice! This keeps REST principles while allowing flexible data fetching. Clients request what they need.' },
              { id: 'b', text: 'Switch to GraphQL', score: 80, feedback: 'GraphQL is great for flexible queries, but might be overkill for this single use case. Consider the migration cost.' },
              { id: 'c', text: 'Always nest reviews in product response', score: 60, feedback: 'This over-fetches for clients that don\'t need reviews, wasting bandwidth and server resources.' },
              { id: 'd', text: 'Create new endpoint: GET /products/:id/with-reviews', score: 50, feedback: 'This leads to endpoint proliferation. What about products-with-categories? With-related-products?' },
            ]),
            correctAnswer: JSON.stringify('a'),
            explanation: 'The "include" query parameter pattern (also called sparse fieldsets or compound documents) is a REST-friendly way to let clients request related resources. It\'s used by JSON:API spec and avoids both over-fetching and multiple round trips.',
            hints: JSON.stringify(['Think about flexibility for different clients', 'Consider what other resources might need similar treatment']),
            xpValue: 25,
            orderIndex: 4,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Error Handling**

Design a consistent error response format for your API. Consider:
- What should error responses look like?
- What HTTP status codes for different error types?
- How to handle validation errors with multiple fields?
- How to help developers debug issues?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Consistent, informative error responses are crucial for API usability and debugging.',
            hints: JSON.stringify(['Think about what info helps debug: error code, message, details', 'Consider machine-readable vs human-readable info']),
            sampleSolution: `**Error Response Format:**
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body contains invalid fields",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Must be a valid email address"
      },
      {
        "field": "price",
        "code": "OUT_OF_RANGE",
        "message": "Must be between 0 and 1000000"
      }
    ],
    "requestId": "req_abc123",
    "documentation": "https://api.example.com/docs/errors#VALIDATION_ERROR"
  }
}
\`\`\`

**HTTP Status Codes:**
\`\`\`
400 Bad Request       - Validation errors, malformed JSON
401 Unauthorized      - Missing or invalid authentication
403 Forbidden         - Valid auth but insufficient permissions
404 Not Found         - Resource doesn't exist
409 Conflict          - Duplicate resource, version conflict
422 Unprocessable     - Valid syntax but semantic errors
429 Too Many Requests - Rate limit exceeded
500 Internal Error    - Server bug (log it, alert on it)
503 Service Unavailable - Temporary outage, maintenance
\`\`\`

**Key Principles:**
1. **Machine-readable**: Use error codes, not just messages
2. **Human-readable**: Clear messages for developers
3. **Actionable**: Tell users how to fix the error
4. **Debuggable**: Include request ID for support
5. **Documented**: Link to error documentation

**Rate Limit Headers:**
\`\`\`
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1640000000
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Defined consistent error response structure',
              'Included appropriate HTTP status codes',
              'Handled multiple validation errors',
              'Added debugging info (requestId, documentation)'
            ]),
            xpValue: 30,
            orderIndex: 5,
          },
        ],
      },
    ],
  },
];
