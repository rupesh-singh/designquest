// Batch 6: 25 Questions covering payment systems, ads, analytics, and advanced patterns
// Topics: Payment System, Ad Platform, Analytics Dashboard, Advanced Patterns, OOD Classics

import { SeedModule } from './index';

export const batch6Modules: SeedModule[] = [
  // ============================================
  // MODULE 22: DESIGN PAYMENT SYSTEM
  // ============================================
  {
    title: 'Design Payment System',
    slug: 'design-payment-system',
    description: 'Design a payment processing system like Stripe with transaction handling, fraud detection, and financial reconciliation.',
    difficulty: 'advanced',
    orderIndex: 55,
    icon: '💳',
    colorTheme: '#635bff',
    lessons: [
      {
        title: 'Payment Processing Architecture',
        slug: 'payment-processing',
        storyContent: `💳 PAYMENT SYSTEM DESIGN

"Design a payment system like Stripe."

Requirements:
- Process credit card payments
- Handle refunds and chargebacks
- Fraud detection
- Multi-currency support
- PCI compliance
- Scale: Millions of transactions/day

Money movement requires extreme reliability. Let's design it.`,
        orderIndex: 1,
        xpReward: 180,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Payment Transaction Flow**

A user clicks "Pay $100" on an e-commerce site. Design the complete transaction flow:
- What are the steps from click to confirmation?
- How do you ensure the payment succeeds or fails atomically?
- What happens if the system crashes mid-transaction?
- How do you handle timeout scenarios?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Payment flows require careful state management and idempotency to handle failures gracefully.',
            hints: JSON.stringify(['Think about idempotency keys', 'Consider the two-phase commit pattern']),
            sampleSolution: `**Payment Transaction Flow:**

**1. High-Level Flow:**
\`\`\`
User clicks "Pay $100"
    ↓
Merchant Backend
    ↓
Payment Gateway (your system)
    ↓
Card Network (Visa/Mastercard)
    ↓
Issuing Bank (user's bank)
    ↓
Response back up the chain
    ↓
User sees confirmation
\`\`\`

**2. Detailed Steps:**
\`\`\`
Step 1: Create Payment Intent
  - Merchant creates payment with idempotency_key
  - Store: {id, amount, currency, status: 'created'}
  
Step 2: Collect Payment Method
  - Card details tokenized (never touch raw card)
  - Token: tok_1234abc
  
Step 3: Authorization
  - Send to card network
  - Bank checks: valid card, funds, fraud
  - Response: approved/declined
  - Store: {status: 'authorized', auth_code: 'ABC123'}
  
Step 4: Capture
  - Actually move money (can be immediate or delayed)
  - Store: {status: 'captured'}
  
Step 5: Settlement
  - End of day: batch settlements
  - Money moves from issuing bank → acquiring bank → merchant
\`\`\`

**3. Atomicity (Idempotency):**
\`\`\`python
def process_payment(idempotency_key, amount, card_token):
    # Check if already processed
    existing = db.get_payment_by_idempotency_key(idempotency_key)
    if existing:
        return existing  # Return same result
    
    # Create with pending status
    payment = db.create_payment(
        idempotency_key=idempotency_key,
        amount=amount,
        status='pending'
    )
    
    try:
        # Call card network
        result = card_network.authorize(amount, card_token)
        
        # Update status atomically
        db.update_payment(payment.id, 
            status='authorized' if result.success else 'declined',
            auth_code=result.auth_code
        )
    except Timeout:
        # Mark for reconciliation
        db.update_payment(payment.id, status='unknown')
        queue_for_reconciliation(payment.id)
    
    return db.get_payment(payment.id)
\`\`\`

**4. Crash Recovery:**
\`\`\`
Scenario: Crash after authorization, before DB update

Recovery process:
1. On startup, find payments with status='pending'
2. For each, query card network with original reference
3. Card network returns actual status
4. Update local DB to match

State machine:
  created → pending → authorized → captured → settled
                   ↘ declined
                   ↘ unknown → (reconcile) → authorized/declined
\`\`\`

**5. Timeout Handling:**
\`\`\`
If card network doesn't respond in 30s:
1. Don't assume success OR failure
2. Mark as 'unknown'
3. Background job queries network
4. Network has transaction record (they got it)
5. Update based on their status

NEVER double-charge:
- Idempotency key ensures same request = same result
- Card networks also dedupe by merchant reference
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described payment flow stages',
              'Explained idempotency for reliability',
              'Addressed crash recovery',
              'Mentioned timeout handling'
            ]),
            xpValue: 45,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `A merchant accidentally sends the same payment request twice (user double-clicked). How do you prevent double-charging?`,
            options: JSON.stringify([
              { id: 'a', text: 'Check if same amount was charged recently', feedback: 'User might legitimately buy two items at same price. Amount isn\'t unique.' },
              { id: 'b', text: 'Require unique idempotency key per request, return cached result for duplicates', feedback: 'Correct! Idempotency keys let you safely retry without side effects. Same key = same result.' },
              { id: 'c', text: 'Rate limit to one request per second per user', feedback: 'Too restrictive. Legitimate rapid purchases exist.' },
              { id: 'd', text: 'Send confirmation email before charging', feedback: 'Adds friction and doesn\'t technically prevent the duplicate charge.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Idempotency keys are essential for payment APIs. The client generates a unique key per intended transaction. If the same key is sent twice, return the result from the first attempt without re-processing. This makes retries safe.',
            hints: JSON.stringify(['Think about how to identify duplicate requests', 'Consider what "idempotent" means']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Fraud Detection**

Design the fraud detection system:
- What signals indicate fraudulent transactions?
- How do you score transactions in real-time?
- What actions do you take for suspicious transactions?
- How do you balance fraud prevention vs user friction?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Fraud detection requires real-time ML scoring with multiple signals and appropriate actions.',
            hints: JSON.stringify(['Think about velocity, location, device signals', 'Consider the cost of false positives']),
            sampleSolution: `**Fraud Detection System:**

**1. Fraud Signals:**
\`\`\`
Device signals:
- New device for this user
- Known fraudulent device fingerprint
- Mismatch: shipping address vs IP location

Behavioral signals:
- Unusual purchase amount
- Unusual merchant category
- Time of day (3 AM purchases)
- Rapid succession of purchases (velocity)

Card signals:
- Card recently added
- Card from high-risk country
- Multiple cards tried
- Card number from known breach

Account signals:
- New account
- Recent password change
- Email doesn't match name pattern
\`\`\`

**2. Real-time Scoring:**
\`\`\`python
def score_transaction(txn, user):
    features = {
        'amount': txn.amount,
        'amount_zscore': (txn.amount - user.avg_amount) / user.std_amount,
        'is_new_device': txn.device_id not in user.known_devices,
        'is_new_merchant': txn.merchant_id not in user.known_merchants,
        'distance_from_last_txn': geo_distance(txn.location, user.last_location),
        'time_since_last_txn': (txn.time - user.last_txn_time).minutes,
        'velocity_1h': count_txns_last_hour(user),
        'velocity_24h': count_txns_last_day(user),
        'card_age_days': (now() - user.card_added_at).days,
        'account_age_days': (now() - user.created_at).days,
    }
    
    # ML model returns probability of fraud
    fraud_score = ml_model.predict(features)  # 0.0 - 1.0
    
    return fraud_score
\`\`\`

**3. Actions Based on Score:**
\`\`\`
Score < 0.3: APPROVE
  - Process normally
  
Score 0.3 - 0.7: CHALLENGE
  - 3D Secure (bank verification)
  - SMS OTP
  - In-app confirmation
  
Score 0.7 - 0.9: REVIEW
  - Hold transaction
  - Manual review queue
  - May approve within 24h
  
Score > 0.9: DECLINE
  - Block transaction
  - Flag account for review
  - Possible account suspension
\`\`\`

**4. Balancing Friction vs Protection:**
\`\`\`
Cost analysis:
- False positive (block good txn): Lost sale + customer frustration
- False negative (allow fraud): Chargeback + fees + reputation

Strategy:
- For trusted users (history, verified): Higher threshold
- For new users: Lower threshold, more challenges
- High-value transactions: More scrutiny regardless
- Repeat purchases at same merchant: Less scrutiny

Adaptive thresholds:
- Monitor false positive rate (customer complaints)
- Monitor fraud rate (chargebacks)
- Tune thresholds per segment
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Listed multiple fraud signals',
              'Described real-time scoring approach',
              'Mentioned different actions based on score',
              'Addressed false positive/negative balance'
            ]),
            xpValue: 40,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `For storing payment transaction records, what's the best database choice?`,
            options: JSON.stringify([
              { id: 'a', text: 'Single PostgreSQL with strong ACID guarantees', score: 60, feedback: 'ACID is critical for payments, but single DB is a scaling bottleneck.' },
              { id: 'b', text: 'Sharded PostgreSQL by merchant_id with distributed transactions', score: 90, feedback: 'Excellent! Sharding enables scale while maintaining ACID per-shard. Cross-shard transactions are rare.' },
              { id: 'c', text: 'MongoDB for flexible schema', score: 30, feedback: 'Payment data has well-defined schema. ACID transactions more important than flexibility.' },
              { id: 'd', text: 'Event sourcing with Kafka + read models', score: 70, feedback: 'Good for audit trail but adds complexity. Often used alongside relational DB, not instead.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Payments need ACID guarantees but also need to scale. Sharded PostgreSQL provides both: ACID within each shard, and horizontal scaling. Shard by merchant_id since most queries are scoped to a merchant. Stripe uses this approach.',
            hints: JSON.stringify(['Think about consistency requirements for money', 'Consider natural sharding boundaries']),
            xpValue: 25,
            orderIndex: 4,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 23: DESIGN AD PLATFORM
  // ============================================
  {
    title: 'Design Ad Platform',
    slug: 'design-ad-platform',
    description: 'Design an advertising platform with real-time bidding, ad targeting, impression tracking, and click attribution.',
    difficulty: 'advanced',
    orderIndex: 56,
    icon: '📢',
    colorTheme: '#fbbc04',
    lessons: [
      {
        title: 'Ad Serving Architecture',
        slug: 'ad-serving',
        storyContent: `📢 AD PLATFORM SYSTEM DESIGN

"Design an ad platform like Google Ads."

Requirements:
- Real-time ad serving (<100ms)
- Targeting by demographics, interests, context
- Real-time bidding (RTB)
- Click and impression tracking
- Advertiser dashboard with analytics
- Scale: 10M ad requests/second

Milliseconds matter. Revenue depends on it. Let's design it.`,
        orderIndex: 1,
        xpReward: 170,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Ad Selection**

A user loads a webpage with an ad slot. Design the ad selection process:
- How do you select which ad to show in <50ms?
- What targeting criteria do you consider?
- How does the auction work?
- How do you ensure ad relevance?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Ad selection requires ultra-fast filtering and auction among eligible ads.',
            hints: JSON.stringify(['Think about pre-computed eligibility', 'Consider second-price auctions']),
            sampleSolution: `**Ad Selection System:**

**1. High-Level Flow (<50ms total):**
\`\`\`
Ad request arrives
    ↓ (5ms)
Extract user context (device, location, page)
    ↓ (10ms)
Filter eligible ads (targeting match)
    ↓ (15ms)
Run auction among eligible ads
    ↓ (10ms)
Return winning ad
    ↓ (10ms)
Log impression
\`\`\`

**2. Targeting Criteria:**
\`\`\`
User targeting:
- Demographics (age, gender - inferred)
- Location (country, city, zip)
- Interests (browsing history)
- Past purchases
- Device type

Contextual targeting:
- Page content/category
- Keywords on page
- Time of day
- Weather (for some ads)

Advertiser settings:
- Allowed/blocked sites
- Frequency cap (max 3 impressions/user/day)
- Budget remaining
- Campaign schedule
\`\`\`

**3. Auction Mechanism:**
\`\`\`python
def run_auction(eligible_ads, user_context):
    scored_ads = []
    
    for ad in eligible_ads:
        # Effective bid = bid × predicted CTR × quality score
        predicted_ctr = ml_model.predict_ctr(ad, user_context)
        quality_score = get_quality_score(ad)  # Ad relevance
        
        effective_bid = ad.max_bid * predicted_ctr * quality_score
        scored_ads.append((ad, effective_bid))
    
    # Sort by effective bid
    scored_ads.sort(key=lambda x: x[1], reverse=True)
    
    winner = scored_ads[0][0]
    
    # Second-price auction: pay just above second place
    if len(scored_ads) > 1:
        second_price = scored_ads[1][1]
        winner.actual_price = second_price / (winner.predicted_ctr * winner.quality_score) + 0.01
    else:
        winner.actual_price = winner.min_bid
    
    return winner
\`\`\`

**4. Speed Optimizations:**
\`\`\`
Pre-computation:
- Build inverted index: targeting criteria → eligible ads
- Cache user segments (update hourly)
- Precompute quality scores

At request time:
- Lookup, don't compute
- Bloom filters for quick "no" answers
- Limit candidates to top 1000, then auction

Infrastructure:
- Ads in memory (Redis)
- Geographically distributed servers
- CDN for ad creatives
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described ad selection flow with timing',
              'Listed targeting criteria',
              'Explained auction mechanism',
              'Mentioned speed optimizations'
            ]),
            xpValue: 40,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `An advertiser sets a $10 CPM (cost per 1000 impressions) bid. Another sets $8 CPM but has higher quality ads. Who wins and what do they pay?`,
            options: JSON.stringify([
              { id: 'a', text: '$10 bidder wins, pays $10 CPM', feedback: 'First-price auctions exist but incentivize bid shading. Most platforms use second-price.' },
              { id: 'b', text: 'Depends on quality-adjusted effective bid; winner pays just above second place', feedback: 'Correct! Effective bid = bid × quality. Winner pays the minimum needed to beat #2 (second-price auction).' },
              { id: 'c', text: '$8 bidder wins because quality matters more than bid', feedback: 'Quality is ONE factor. High bid can overcome quality difference.' },
              { id: 'd', text: 'Random selection weighted by bid amount', feedback: 'Auctions are deterministic. Highest effective bid wins.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Ad platforms use quality-adjusted auctions: effective_bid = bid × quality_score × predicted_CTR. The winner pays second-price (just above the second-highest effective bid). This encourages truthful bidding and rewards high-quality ads.',
            hints: JSON.stringify(['Think about how quality affects ad value', 'Consider why second-price auctions are used']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Click Attribution**

User sees ad on Monday, searches brand on Tuesday, clicks ad on Wednesday, buys on Thursday. Design the attribution system:
- How do you track the user journey?
- What attribution models exist?
- How do you handle cross-device tracking?
- How do you report conversions to advertisers?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Attribution connects ad impressions to conversions across complex user journeys.',
            hints: JSON.stringify(['Think about multi-touch attribution', 'Consider privacy constraints']),
            sampleSolution: `**Click Attribution System:**

**1. Tracking the Journey:**
\`\`\`
Events collected:
1. Monday: Impression {user_id, ad_id, timestamp, context}
2. Tuesday: Search {user_id, query: "brand name"}
3. Wednesday: Click {user_id, ad_id, timestamp}
4. Thursday: Conversion {user_id, product, amount}

User identification:
- Logged in: user_id
- Logged out: device_id + cookies
- Cross-device: probabilistic matching or login linkage
\`\`\`

**2. Attribution Models:**
\`\`\`
Last-click (simple):
  100% credit to last clicked ad
  Wednesday ad gets full credit
  
First-click:
  100% credit to first touchpoint
  Monday impression gets credit
  
Linear:
  Equal credit to all touchpoints
  33% each to Monday, Wednesday, Thursday
  
Time-decay:
  More credit to recent touchpoints
  Monday: 10%, Wednesday: 30%, Thursday: 60%
  
Position-based (U-shaped):
  40% first, 40% last, 20% split middle
  
Data-driven (ML):
  Model learns actual contribution
  Based on counterfactual: "Would they convert without this ad?"
\`\`\`

**3. Cross-Device Tracking:**
\`\`\`
Deterministic:
  - User logs in on both devices
  - Link device_ids to user_id
  - 100% confidence

Probabilistic:
  - Same IP + similar browsing patterns
  - ML model predicts same user
  - 70-90% confidence

Privacy-preserving:
  - Aggregated reporting (not individual)
  - Differential privacy
  - On-device attribution (Apple's SKAdNetwork)
\`\`\`

**4. Conversion Reporting:**
\`\`\`
Real-time pipeline:
  Conversion event
      ↓
  Lookup attribution window (last 30 days)
      ↓
  Find matching impressions/clicks
      ↓
  Apply attribution model
      ↓
  Credit to campaigns
      ↓
  Update advertiser dashboard

Reporting dimensions:
- Campaign, ad group, ad
- Time (hourly, daily)
- Geography, device, audience
- Conversion type (purchase, signup, etc.)

Data:
- Impressions served
- Clicks
- CTR (click-through rate)
- Conversions
- CPA (cost per acquisition)
- ROAS (return on ad spend)
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described tracking user journey',
              'Listed attribution models',
              'Addressed cross-device tracking',
              'Explained conversion reporting'
            ]),
            xpValue: 40,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `For storing ad impression logs (10M/second), what's the best approach?`,
            options: JSON.stringify([
              { id: 'a', text: 'Write directly to PostgreSQL', score: 20, feedback: '10M writes/second would overwhelm any SQL database.' },
              { id: 'b', text: 'Buffer in Kafka, batch write to columnar store (ClickHouse/BigQuery)', score: 95, feedback: 'Perfect! Kafka handles ingestion rate, columnar store handles analytics queries efficiently.' },
              { id: 'c', text: 'Store in Redis with TTL', score: 40, feedback: 'Redis is fast but expensive for this volume. Also need long-term storage for analytics.' },
              { id: 'd', text: 'Write to log files, process later', score: 60, feedback: 'Works but unstructured. Hard to query for real-time dashboards.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Ad impressions are a classic big data problem: high write volume, analytics queries. Kafka absorbs the write rate, then batch consumers write to columnar stores (ClickHouse, BigQuery, Druid) optimized for aggregation queries. This separates ingestion from querying.',
            hints: JSON.stringify(['Think about write rate vs query patterns', 'Consider columnar storage for analytics']),
            xpValue: 25,
            orderIndex: 4,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 24: DESIGN ANALYTICS DASHBOARD
  // ============================================
  {
    title: 'Design Analytics Dashboard',
    slug: 'design-analytics-dashboard',
    description: 'Design a real-time analytics dashboard with metric collection, aggregation, visualization, and alerting.',
    difficulty: 'intermediate',
    orderIndex: 57,
    icon: '📊',
    colorTheme: '#00897b',
    lessons: [
      {
        title: 'Metrics and Dashboards',
        slug: 'metrics-dashboards',
        storyContent: `📊 ANALYTICS DASHBOARD DESIGN

"Design an analytics dashboard like Datadog or Grafana."

Requirements:
- Collect metrics from services (CPU, latency, errors)
- Real-time dashboards with charts
- Custom queries and aggregations
- Alerting when metrics exceed thresholds
- Scale: 1M metrics/second from 10,000 services

Observability at scale. Let's design it.`,
        orderIndex: 1,
        xpReward: 150,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Metric Collection**

10,000 services emit metrics (CPU, memory, request count, latency). Design the collection system:
- How do services report metrics?
- How do you handle 1M metrics/second?
- How do you store time-series data efficiently?
- How long do you retain data?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Metric collection requires efficient ingestion and time-series optimized storage.',
            hints: JSON.stringify(['Think about push vs pull models', 'Consider time-series databases']),
            sampleSolution: `**Metric Collection System:**

**1. Reporting Models:**
\`\`\`
Push model (services send to collector):
  Service → Agent → Collector → Storage
  
  Pros: Services control when to send
  Cons: Can overwhelm collector
  
Pull model (collector scrapes services):
  Collector → scrapes → Service /metrics endpoint
  
  Pros: Collector controls rate
  Cons: Services must expose endpoint
  
Hybrid (Prometheus style):
  - Pull for long-running services
  - Push gateway for short-lived jobs

For 10K services: Push with local agents
  Service → Local Agent (buffer) → Central Collector
\`\`\`

**2. Handling 1M Metrics/Second:**
\`\`\`
Local agents:
  - Aggregate locally (pre-compute 1-min averages)
  - Batch sends (every 10 seconds)
  - Reduce 1M/s to ~100K/s to central

Central collectors:
  - Horizontally scaled (10+ nodes)
  - Kafka for buffering bursts
  - Partitioned by metric name

Pipeline:
  Agents → Kafka → Aggregators → Time-series DB
  
Pre-aggregation example:
  10,000 raw CPU readings/sec → 1 avg/sec stored
\`\`\`

**3. Time-Series Storage:**
\`\`\`
Data model:
  metric_name{labels} value timestamp
  
  cpu_usage{host="server1", region="us-east"} 85.2 1704067200

Storage optimizations:
  - Columnar storage (compress similar values)
  - Delta encoding for timestamps
  - Gorilla compression (Facebook)
  - Separate recent (hot) vs old (cold) data

Databases:
  - InfluxDB, TimescaleDB, Prometheus
  - Compression: 10x+ vs naive storage
\`\`\`

**4. Retention Policies:**
\`\`\`
Tiered retention:
  Raw data (1-second): Keep 24 hours
  1-minute aggregates: Keep 7 days
  5-minute aggregates: Keep 30 days
  1-hour aggregates: Keep 1 year
  1-day aggregates: Keep forever

Automatic downsampling:
  Background job converts raw → aggregates
  Delete raw after 24h to save space

Example storage per metric:
  Raw: 86,400 points/day × 8 bytes = 700KB/day
  Aggregated: Much smaller after downsampling
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described collection model (push/pull)',
              'Explained handling high ingestion rate',
              'Mentioned time-series storage optimizations',
              'Addressed retention and downsampling'
            ]),
            xpValue: 40,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `A dashboard shows "p99 latency over the last hour" for a service with 1M requests. How do you compute this efficiently?`,
            options: JSON.stringify([
              { id: 'a', text: 'Store all 1M latency values, sort, find 99th percentile', feedback: 'Sorting 1M values for every query is too slow and memory-intensive.' },
              { id: 'b', text: 'Use pre-computed histogram buckets, estimate percentile', feedback: 'Correct! Store counts per bucket (0-10ms, 10-50ms, etc.). Estimate percentile from cumulative histogram. Fast and space-efficient.' },
              { id: 'c', text: 'Sample 1% of requests, compute exact percentile on sample', feedback: 'Sampling can miss outliers. 1% of tail might not be representative.' },
              { id: 'd', text: 'Only track average latency, estimate p99 as 3× average', feedback: 'p99 and average have no fixed relationship. Would be very inaccurate.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Histogram buckets are standard for percentiles at scale: define buckets (0-10ms: 5000, 10-50ms: 3000, etc.), store counts. To find p99: find bucket containing the 99th percentile position. This is O(buckets) not O(requests). Prometheus uses this approach.',
            hints: JSON.stringify(['Think about approximate vs exact answers', 'Consider space-time tradeoffs']),
            xpValue: 25,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Alerting System**

Design the alerting system for the dashboard:
- How do you define alert rules?
- How do you evaluate rules efficiently?
- How do you avoid alert storms (thousands of alerts)?
- How do you route alerts to the right people?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Alerting requires efficient rule evaluation and intelligent grouping to be actionable.',
            hints: JSON.stringify(['Think about alert fatigue', 'Consider dependencies between services']),
            sampleSolution: `**Alerting System:**

**1. Alert Rule Definition:**
\`\`\`yaml
alert: HighErrorRate
expr: error_rate{service="api"} > 0.05
for: 5m  # Must be true for 5 minutes
labels:
  severity: critical
  team: backend
annotations:
  summary: "Error rate above 5%"
  runbook: "https://wiki/runbook/high-errors"
\`\`\`

**2. Rule Evaluation:**
\`\`\`
Evaluation engine:
  - Runs every evaluation_interval (15s-1m)
  - Queries time-series DB for each rule
  - Checks if condition met

Efficiency optimizations:
  - Batch query multiple rules
  - Cache recent metric values
  - Skip rules for absent metrics
  - Parallelize across rule groups

Alert states:
  Inactive → Pending → Firing → Resolved
  
  Pending: Condition met, waiting for "for" duration
  Firing: Condition sustained, alert sent
\`\`\`

**3. Avoiding Alert Storms:**
\`\`\`
Problem: Database down → 100 services alert

Solutions:

Grouping:
  - Group alerts by common label (cluster, service)
  - One notification per group
  - "50 alerts for cluster-A"

Inhibition:
  - If "database down" firing, suppress "service errors"
  - Define dependencies
  
  inhibit_rules:
    - source: {alertname: DatabaseDown}
      target: {team: backend}
      equal: [cluster]

Rate limiting:
  - Max N alerts per minute per channel
  - Aggregate into digest
  
Severity escalation:
  - Warning: Slack only
  - Critical: Slack + PagerDuty
  - Page only for truly urgent
\`\`\`

**4. Alert Routing:**
\`\`\`yaml
routes:
  - match: {severity: critical}
    receiver: pagerduty-oncall
    
  - match: {team: backend}
    receiver: backend-slack
    
  - match: {team: frontend}
    receiver: frontend-slack
    
receivers:
  - name: pagerduty-oncall
    pagerduty_configs:
      - service_key: xxx
      
  - name: backend-slack
    slack_configs:
      - channel: '#backend-alerts'
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Showed alert rule definition format',
              'Explained rule evaluation process',
              'Mentioned storm prevention (grouping, inhibition)',
              'Described routing to different receivers'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `For dashboard visualizations with real-time updates, what's the best approach?`,
            options: JSON.stringify([
              { id: 'a', text: 'Poll server every second for new data', score: 60, feedback: 'Works but inefficient. Many requests even when data hasn\'t changed.' },
              { id: 'b', text: 'WebSocket push when new data available', score: 85, feedback: 'Good for truly real-time. But can be complex to scale WebSocket connections.' },
              { id: 'c', text: 'Poll with smart interval (more frequent when viewing, less when idle)', score: 90, feedback: 'Excellent! Adaptive polling balances freshness and efficiency. Most dashboards use this.' },
              { id: 'd', text: 'Server-sent events with automatic reconnection', score: 80, feedback: 'Good alternative to WebSocket. Simpler but one-directional.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'Dashboards typically use adaptive polling: fast refresh when actively viewing (5-15s), slower when tab is backgrounded (60s+), no refresh when idle. This balances real-time feel with server load. Pure WebSocket is overkill for most metric dashboards where 10-15s latency is acceptable.',
            hints: JSON.stringify(['Think about when real-time really matters', 'Consider connection overhead']),
            xpValue: 25,
            orderIndex: 4,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 25: ADVANCED PATTERNS
  // ============================================
  {
    title: 'Advanced Distributed Patterns',
    slug: 'advanced-patterns',
    description: 'Master advanced patterns: Circuit Breaker, Saga, Event Sourcing, CQRS, and Outbox pattern.',
    difficulty: 'advanced',
    orderIndex: 58,
    icon: '🔧',
    colorTheme: '#7b1fa2',
    lessons: [
      {
        title: 'Resilience and Data Patterns',
        slug: 'resilience-patterns',
        storyContent: `🔧 ADVANCED DISTRIBUTED PATTERNS

Master these patterns to build resilient, scalable systems:

- Circuit Breaker: Fail fast when dependencies are down
- Saga: Manage distributed transactions
- Event Sourcing: Store events, not state
- CQRS: Separate reads and writes
- Outbox: Reliable event publishing

These patterns solve real production challenges.`,
        orderIndex: 1,
        xpReward: 160,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Circuit Breaker Pattern**

Your service calls a payment API that occasionally becomes slow or unresponsive. Design a circuit breaker:
- What are the circuit breaker states?
- When does it trip open?
- How does it recover?
- What does the calling code do when circuit is open?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Circuit breakers prevent cascade failures by failing fast when dependencies are unhealthy.',
            hints: JSON.stringify(['Think about the three states: Closed, Open, Half-Open', 'Consider what metrics trigger state changes']),
            sampleSolution: `**Circuit Breaker Pattern:**

**1. Circuit States:**
\`\`\`
CLOSED (normal operation):
  - Requests pass through
  - Track failures
  
OPEN (failing fast):
  - Requests immediately fail
  - Don't call downstream
  
HALF-OPEN (testing recovery):
  - Allow limited requests
  - If succeed: close circuit
  - If fail: reopen circuit
\`\`\`

**2. State Transitions:**
\`\`\`
         failures > threshold
CLOSED ─────────────────────> OPEN
   ↑                            │
   │                            │ timeout expires
   │                            ↓
   │                        HALF-OPEN
   │                            │
   └─── success ────────────────┘
         │
         └──── failure ────> OPEN
\`\`\`

**3. Implementation:**
\`\`\`python
class CircuitBreaker:
    def __init__(self):
        self.state = 'CLOSED'
        self.failure_count = 0
        self.failure_threshold = 5
        self.timeout = 30  # seconds
        self.last_failure_time = None
    
    def call(self, func, *args):
        if self.state == 'OPEN':
            if time.now() - self.last_failure_time > self.timeout:
                self.state = 'HALF_OPEN'
            else:
                raise CircuitOpenError("Circuit is open")
        
        try:
            result = func(*args)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise e
    
    def on_success(self):
        self.failure_count = 0
        self.state = 'CLOSED'
    
    def on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.now()
        if self.failure_count >= self.failure_threshold:
            self.state = 'OPEN'
\`\`\`

**4. Handling Open Circuit:**
\`\`\`python
def process_payment(order):
    try:
        return circuit_breaker.call(payment_api.charge, order)
    except CircuitOpenError:
        # Fallback behavior:
        # Option 1: Return cached/default response
        # Option 2: Queue for retry
        # Option 3: Use backup service
        # Option 4: Return degraded response
        
        queue_for_retry(order)
        return {"status": "pending", "message": "Processing delayed"}
\`\`\`

**5. Advanced Features:**
\`\`\`
Per-endpoint circuits:
  - payment.charge: Circuit A
  - payment.refund: Circuit B

Sliding window:
  - Track failure rate over last N requests
  - Not just consecutive failures

Health checks:
  - Proactive ping in HALF_OPEN
  - Don't wait for real traffic
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described three circuit states',
              'Explained state transition triggers',
              'Showed basic implementation',
              'Mentioned fallback behavior'
            ]),
            xpValue: 40,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `An e-commerce order involves: (1) reserve inventory, (2) charge payment, (3) create shipment. If payment fails after inventory is reserved, what pattern handles the rollback?`,
            options: JSON.stringify([
              { id: 'a', text: 'Two-phase commit across all services', feedback: '2PC requires all services to support it and hold locks. Doesn\'t work well across microservices.' },
              { id: 'b', text: 'Saga pattern with compensating transactions', feedback: 'Correct! Saga executes steps in sequence. On failure, runs compensating actions (release inventory) in reverse order.' },
              { id: 'c', text: 'Retry payment until it succeeds', feedback: 'Payment might fail for valid reasons (insufficient funds). Can\'t retry forever.' },
              { id: 'd', text: 'Let each service handle its own rollback', feedback: 'Services don\'t know about each other\'s state. Need coordination.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Saga pattern manages distributed transactions without locking: execute steps forward, if any fails, run compensating transactions backward. For order: reserve→charge→ship. If charge fails: compensate by release inventory. Each step is a local transaction.',
            hints: JSON.stringify(['Think about distributed transactions', 'Consider how to "undo" completed steps']),
            xpValue: 25,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Event Sourcing**

Instead of storing current state, you store all events. Design an event-sourced shopping cart:
- What events would you store?
- How do you get current cart state?
- How do you handle "undo"?
- What are the benefits and drawbacks?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Event sourcing stores state changes as immutable events, enabling complete audit trails and time travel.',
            hints: JSON.stringify(['Think about events as facts that happened', 'Consider replaying events to rebuild state']),
            sampleSolution: `**Event Sourced Shopping Cart:**

**1. Events (Immutable Facts):**
\`\`\`json
{"type": "CartCreated", "cartId": "123", "userId": "user1", "timestamp": "..."}
{"type": "ItemAdded", "cartId": "123", "productId": "prod1", "quantity": 2, "price": 29.99}
{"type": "ItemRemoved", "cartId": "123", "productId": "prod1", "quantity": 1}
{"type": "ItemAdded", "cartId": "123", "productId": "prod2", "quantity": 1, "price": 49.99}
{"type": "CouponApplied", "cartId": "123", "code": "SAVE10", "discount": 10}
{"type": "CheckoutStarted", "cartId": "123"}
\`\`\`

**2. Getting Current State (Projection):**
\`\`\`python
def get_cart_state(cart_id):
    events = event_store.get_events(cart_id)
    
    cart = {"items": {}, "total": 0, "discount": 0}
    
    for event in events:
        if event.type == "ItemAdded":
            if event.productId in cart["items"]:
                cart["items"][event.productId]["quantity"] += event.quantity
            else:
                cart["items"][event.productId] = {
                    "quantity": event.quantity,
                    "price": event.price
                }
        elif event.type == "ItemRemoved":
            cart["items"][event.productId]["quantity"] -= event.quantity
        elif event.type == "CouponApplied":
            cart["discount"] = event.discount
    
    # Calculate total
    cart["total"] = sum(
        item["quantity"] * item["price"] 
        for item in cart["items"].values()
    ) - cart["discount"]
    
    return cart
\`\`\`

**3. Handling "Undo":**
\`\`\`
Events are IMMUTABLE - never delete!

To "undo" adding an item:
  Append: {"type": "ItemRemoved", ...}
  
Full audit trail preserved:
  - Added item at 10:00
  - Removed item at 10:05
  - Both facts recorded

Time travel:
  replay_to(cart_id, timestamp="10:02")
  Shows cart state as it was at 10:02
\`\`\`

**4. Benefits:**
\`\`\`
+ Complete audit trail
+ Time travel debugging
+ Event replay for bug fixes
+ Build multiple read models from same events
+ Natural fit for event-driven architecture
\`\`\`

**5. Drawbacks:**
\`\`\`
- More complex than CRUD
- Replaying many events is slow (solution: snapshots)
- Schema evolution is tricky
- Eventual consistency for read models
- Storage grows over time
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Listed relevant events for shopping cart',
              'Showed how to rebuild state from events',
              'Explained undo via compensating events',
              'Mentioned both benefits and drawbacks'
            ]),
            xpValue: 40,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `You're publishing events to Kafka after database writes. Sometimes the app crashes after DB commit but before Kafka publish. What pattern solves this?`,
            options: JSON.stringify([
              { id: 'a', text: 'Write to Kafka first, then database', score: 30, feedback: 'If DB write fails, you\'ve published an event for something that didn\'t happen.' },
              { id: 'b', text: 'Outbox pattern: Write event to DB table, separate process publishes to Kafka', score: 95, feedback: 'Exactly! Outbox ensures atomicity: event and data in same DB transaction. Publisher reads outbox and sends to Kafka.' },
              { id: 'c', text: 'Distributed transaction between DB and Kafka', score: 40, feedback: 'Kafka doesn\'t support 2PC. Very difficult to implement correctly.' },
              { id: 'd', text: 'Just retry failed publishes on app restart', score: 50, feedback: 'Requires tracking what was published. Essentially re-inventing outbox.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Outbox pattern: write event to an "outbox" table in the SAME database transaction as business data. A separate process (CDC or poller) reads outbox and publishes to Kafka. This guarantees exactly-once semantics: if DB commits, event will be published (eventually).',
            hints: JSON.stringify(['Think about atomic operations', 'Consider what you can control in a single transaction']),
            xpValue: 30,
            orderIndex: 4,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 26: OOD CLASSICS (Parking Lot, Elevator)
  // ============================================
  {
    title: 'Object-Oriented Design Classics',
    slug: 'ood-classics',
    description: 'Master classic OOD interview questions: Parking Lot, Elevator System, Library Management, and Vending Machine.',
    difficulty: 'intermediate',
    orderIndex: 59,
    icon: '🏛️',
    colorTheme: '#455a64',
    lessons: [
      {
        title: 'Classic OOD Problems',
        slug: 'classic-ood',
        storyContent: `🏛️ OBJECT-ORIENTED DESIGN CLASSICS

These problems test your ability to:
- Identify entities and relationships
- Design clean interfaces
- Handle edge cases
- Apply SOLID principles

Classic problems that still appear in interviews:
- Parking Lot System
- Elevator System
- Library Management
- Vending Machine`,
        orderIndex: 1,
        xpReward: 140,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Parking Lot System**

Design a parking lot system:
- Multiple floors, each with parking spots
- Different spot sizes (compact, regular, large)
- Different vehicle types (motorcycle, car, bus)
- Track available spots
- Calculate parking fees

What are the main classes and their relationships?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Parking lot design tests entity identification and relationship modeling.',
            hints: JSON.stringify(['Think about Vehicle, ParkingSpot, ParkingLot classes', 'Consider inheritance for vehicle types']),
            sampleSolution: `**Parking Lot OOD:**

**1. Core Classes:**
\`\`\`python
class Vehicle:
    def __init__(self, license_plate: str, vehicle_type: VehicleType):
        self.license_plate = license_plate
        self.vehicle_type = vehicle_type
        self.ticket: ParkingTicket = None

class VehicleType(Enum):
    MOTORCYCLE = 1  # Fits in any spot
    CAR = 2         # Fits in regular or large
    BUS = 3         # Needs large spot (or multiple regular)

class ParkingSpot:
    def __init__(self, spot_id: str, floor: int, spot_type: SpotType):
        self.spot_id = spot_id
        self.floor = floor
        self.spot_type = spot_type
        self.vehicle: Vehicle = None
    
    def is_available(self) -> bool:
        return self.vehicle is None
    
    def can_fit(self, vehicle: Vehicle) -> bool:
        return self.spot_type.value >= vehicle.vehicle_type.value
    
    def park(self, vehicle: Vehicle):
        if not self.can_fit(vehicle):
            raise Exception("Vehicle doesn't fit")
        self.vehicle = vehicle
    
    def remove_vehicle(self) -> Vehicle:
        vehicle = self.vehicle
        self.vehicle = None
        return vehicle

class SpotType(Enum):
    COMPACT = 1
    REGULAR = 2
    LARGE = 3
\`\`\`

**2. Parking Lot Management:**
\`\`\`python
class ParkingLot:
    def __init__(self, name: str):
        self.name = name
        self.floors: List[ParkingFloor] = []
        self.entry_panels: List[EntryPanel] = []
        self.exit_panels: List[ExitPanel] = []
    
    def get_available_spot(self, vehicle: Vehicle) -> ParkingSpot:
        for floor in self.floors:
            spot = floor.get_available_spot(vehicle)
            if spot:
                return spot
        return None
    
    def park_vehicle(self, vehicle: Vehicle) -> ParkingTicket:
        spot = self.get_available_spot(vehicle)
        if not spot:
            raise Exception("No available spots")
        
        spot.park(vehicle)
        ticket = ParkingTicket(vehicle, spot)
        vehicle.ticket = ticket
        return ticket

class ParkingFloor:
    def __init__(self, floor_number: int, spots: List[ParkingSpot]):
        self.floor_number = floor_number
        self.spots = spots
    
    def get_available_spot(self, vehicle: Vehicle) -> ParkingSpot:
        for spot in self.spots:
            if spot.is_available() and spot.can_fit(vehicle):
                return spot
        return None
\`\`\`

**3. Ticketing and Payment:**
\`\`\`python
class ParkingTicket:
    def __init__(self, vehicle: Vehicle, spot: ParkingSpot):
        self.ticket_id = generate_id()
        self.vehicle = vehicle
        self.spot = spot
        self.entry_time = datetime.now()
        self.exit_time = None
        self.amount_paid = 0

class ParkingRate:
    def __init__(self, spot_type: SpotType, hourly_rate: Decimal):
        self.spot_type = spot_type
        self.hourly_rate = hourly_rate
    
    def calculate_fee(self, hours: float) -> Decimal:
        return self.hourly_rate * ceil(hours)

class Payment:
    def __init__(self, ticket: ParkingTicket, amount: Decimal):
        self.ticket = ticket
        self.amount = amount
        self.payment_time = datetime.now()
        self.payment_method: PaymentMethod = None
\`\`\`

**4. Key Relationships:**
\`\`\`
ParkingLot has many ParkingFloors
ParkingFloor has many ParkingSpots
ParkingSpot can hold one Vehicle
Vehicle has one ParkingTicket (when parked)
ParkingTicket references Vehicle and ParkingSpot
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Identified main entities (Vehicle, Spot, Lot)',
              'Modeled vehicle/spot type relationships',
              'Included ticketing and payment',
              'Showed clear class responsibilities'
            ]),
            xpValue: 40,
            orderIndex: 1,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Elevator System**

Design an elevator system for a 50-floor building with 4 elevators:
- Handle up/down requests from floors
- Handle floor selection from inside elevator
- Optimize for minimum wait time
- Handle edge cases (overweight, doors blocked)

What's the state machine for an elevator?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Elevator design tests state machine thinking and scheduling algorithms.',
            hints: JSON.stringify(['Think about elevator states: IDLE, MOVING_UP, MOVING_DOWN', 'Consider scheduling algorithms like SCAN']),
            sampleSolution: `**Elevator System OOD:**

**1. Elevator State Machine:**
\`\`\`
States:
  IDLE: Stationary, doors closed, no pending requests
  MOVING_UP: Going up, may have stops
  MOVING_DOWN: Going down, may have stops
  DOOR_OPEN: Stopped at floor, doors open
  MAINTENANCE: Out of service

Transitions:
  IDLE → MOVING_UP (request above current floor)
  IDLE → MOVING_DOWN (request below current floor)
  MOVING_UP → DOOR_OPEN (arrived at requested floor)
  MOVING_DOWN → DOOR_OPEN (arrived at requested floor)
  DOOR_OPEN → MOVING_UP (more requests above)
  DOOR_OPEN → MOVING_DOWN (more requests below)
  DOOR_OPEN → IDLE (no more requests)
\`\`\`

**2. Core Classes:**
\`\`\`python
class Elevator:
    def __init__(self, elevator_id: int, capacity: int):
        self.elevator_id = elevator_id
        self.capacity = capacity
        self.current_floor = 1
        self.state = ElevatorState.IDLE
        self.direction = Direction.NONE
        self.requests: Set[int] = set()  # Floor numbers
    
    def add_request(self, floor: int):
        self.requests.add(floor)
        self._update_direction()
    
    def move(self):
        if not self.requests:
            self.state = ElevatorState.IDLE
            return
        
        if self.direction == Direction.UP:
            self.current_floor += 1
        elif self.direction == Direction.DOWN:
            self.current_floor -= 1
        
        if self.current_floor in self.requests:
            self._stop_at_floor()
    
    def _stop_at_floor(self):
        self.state = ElevatorState.DOOR_OPEN
        self.requests.remove(self.current_floor)
        # Timer to close doors
    
    def _update_direction(self):
        if self.state == ElevatorState.IDLE:
            next_floor = min(self.requests)
            if next_floor > self.current_floor:
                self.direction = Direction.UP
            else:
                self.direction = Direction.DOWN

class ElevatorState(Enum):
    IDLE = 1
    MOVING_UP = 2
    MOVING_DOWN = 3
    DOOR_OPEN = 4
    MAINTENANCE = 5
\`\`\`

**3. Scheduling (SCAN Algorithm):**
\`\`\`python
class ElevatorController:
    def __init__(self, elevators: List[Elevator]):
        self.elevators = elevators
        self.up_requests: Dict[int, List] = {}  # floor → requests
        self.down_requests: Dict[int, List] = {}
    
    def request_elevator(self, floor: int, direction: Direction):
        # Find best elevator
        best_elevator = self._find_best_elevator(floor, direction)
        best_elevator.add_request(floor)
    
    def _find_best_elevator(self, floor: int, direction: Direction) -> Elevator:
        best = None
        best_score = float('inf')
        
        for elevator in self.elevators:
            score = self._calculate_score(elevator, floor, direction)
            if score < best_score:
                best_score = score
                best = elevator
        
        return best
    
    def _calculate_score(self, elevator, floor, direction):
        # Lower score = better choice
        distance = abs(elevator.current_floor - floor)
        
        # Prefer elevators already going this direction
        if elevator.direction == direction:
            if direction == Direction.UP and elevator.current_floor <= floor:
                return distance  # Will pass this floor
            if direction == Direction.DOWN and elevator.current_floor >= floor:
                return distance
        
        # Idle elevator is good
        if elevator.state == ElevatorState.IDLE:
            return distance + 1
        
        # Moving opposite direction - will need to turn around
        return distance + 10
\`\`\`

**4. Edge Cases:**
\`\`\`python
def handle_overweight(self):
    if self.current_weight > self.max_weight:
        self.state = ElevatorState.DOOR_OPEN
        self.announce("Overweight - please exit")
        return False
    return True

def handle_door_blocked(self):
    self.door_block_count += 1
    if self.door_block_count > 3:
        self.announce("Please clear the doors")
    # Force close after timeout
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Defined elevator states and transitions',
              'Showed Elevator and Controller classes',
              'Described scheduling algorithm',
              'Addressed edge cases'
            ]),
            xpValue: 40,
            orderIndex: 2,
          },
          {
            type: 'multiple_choice',
            scenarioText: `For the elevator scheduling algorithm, which approach minimizes average wait time?`,
            options: JSON.stringify([
              { id: 'a', text: 'First-Come-First-Served (FCFS)', feedback: 'Simple but inefficient. Elevator zigzags constantly.' },
              { id: 'b', text: 'Shortest-Seek-Time-First (SSTF)', feedback: 'Can cause starvation - far floors never served.' },
              { id: 'c', text: 'SCAN (Elevator Algorithm) - sweep up then down', feedback: 'Correct! SCAN moves in one direction, serving all requests, then reverses. Balances efficiency and fairness.' },
              { id: 'd', text: 'Random selection', feedback: 'Unpredictable and inefficient. No optimization.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'SCAN algorithm (like a disk head) moves in one direction serving all requests, then reverses. This minimizes direction changes and provides fair service. Variants like LOOK only go as far as the farthest request. Real elevators use sophisticated versions of this.',
            hints: JSON.stringify(['Think about how disk scheduling algorithms work', 'Consider fairness vs efficiency']),
            xpValue: 20,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `When designing these OOD systems, what's the most important principle to follow?`,
            options: JSON.stringify([
              { id: 'a', text: 'Minimize number of classes', score: 30, feedback: 'Fewer classes can mean bloated classes with too many responsibilities.' },
              { id: 'b', text: 'Single Responsibility Principle - each class does one thing well', score: 95, feedback: 'Excellent! SRP is foundational. Vehicle handles vehicle things, ParkingSpot handles spot things, ParkingLot orchestrates.' },
              { id: 'c', text: 'Make everything as generic as possible', score: 40, feedback: 'Over-generalization adds complexity. Design for current requirements first.' },
              { id: 'd', text: 'Use inheritance wherever possible', score: 35, feedback: 'Favor composition over inheritance. Inheritance can create rigid hierarchies.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Single Responsibility Principle is the most important SOLID principle for OOD. Each class should have one reason to change. Vehicle doesn\'t know about parking spots, spots don\'t know about payments. This makes code easier to understand, test, and modify.',
            hints: JSON.stringify(['Think about SOLID principles', 'Consider what makes code maintainable']),
            xpValue: 25,
            orderIndex: 4,
          },
        ],
      },
    ],
  },
];
