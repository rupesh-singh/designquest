// Batch 7: 20 Karat-style scenario questions
// These are practical, focused questions testing specific system design considerations

import { SeedModule } from './index';

export const batch7Modules: SeedModule[] = [
  // ============================================
  // MODULE 27: KARAT-STYLE SCENARIO QUESTIONS
  // ============================================
  {
    title: 'Scenario-Based Design Questions',
    slug: 'scenario-based-questions',
    description: 'Practice Karat-style interview questions focusing on specific trade-offs, scaling considerations, and practical system design decisions.',
    difficulty: 'intermediate',
    orderIndex: 60,
    icon: '🎯',
    colorTheme: '#6366f1',
    lessons: [
      {
        title: 'Data & Storage Scenarios',
        slug: 'data-storage-scenarios',
        storyContent: `🎯 KARAT-STYLE SCENARIO QUESTIONS: DATA & STORAGE

These questions test your ability to think through real-world problems:
- Identify potential issues
- Discuss trade-offs
- Consider edge cases
- Propose practical solutions

No single right answer - demonstrate your thinking process.`,
        orderIndex: 1,
        xpReward: 150,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A music streaming service has songs distributed across multiple servers. What are the potential problems with this architecture?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Distributed content introduces challenges around consistency, availability, and user experience.',
            hints: JSON.stringify(['Think about what happens when a server goes down', 'Consider user experience during playback']),
            sampleSolution: `**Potential Problems with Distributed Songs:**

**1. Availability Issues:**
\`\`\`
- Server containing a song goes down
- User can't play their favorite song
- Need replication strategy (song on multiple servers)
- Questions: How many copies? Which servers?
\`\`\`

**2. Latency & Routing:**
\`\`\`
- How does client know which server has the song?
- Lookup service needed (song_id → server_id)
- Lookup service becomes single point of failure
- Geographic distribution - user in Tokyo, song on US server
\`\`\`

**3. Load Balancing:**
\`\`\`
- Popular songs create hot spots
- One server gets hammered while others idle
- Need to replicate popular content more widely
- Cold songs might be on fewer servers
\`\`\`

**4. Consistency Issues:**
\`\`\`
- Song metadata updated (artist name, album art)
- Which server has the latest version?
- User sees different metadata on different devices
\`\`\`

**5. Playback Continuity:**
\`\`\`
- User starts song, server goes down mid-stream
- How to seamlessly switch to replica?
- Buffering and resumption strategy
\`\`\`

**6. Storage Management:**
\`\`\`
- How to decide which songs go where?
- Rebalancing when adding new servers
- Handling different song sizes (3MB vs 50MB lossless)
\`\`\`

**Mitigations:**
- CDN for popular content
- Consistent hashing for distribution
- Replication factor based on popularity
- Health checks and automatic failover`,
            evaluationCriteria: JSON.stringify([
              'Identified availability/fault tolerance issues',
              'Mentioned latency or geographic concerns',
              'Discussed hot spots/load balancing',
              'Considered consistency or failover'
            ]),
            xpValue: 30,
            orderIndex: 1,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A huge XML file with sales data needs to be processed. It is huge enough that it cannot be loaded at once given the RAM limitation of the local system. How can we process it?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Processing large files requires streaming approaches rather than loading everything into memory.',
            hints: JSON.stringify(['Think about streaming parsers', 'Consider chunking strategies']),
            sampleSolution: `**Processing Large XML Files:**

**1. Streaming XML Parsers (SAX/StAX):**
\`\`\`python
# Instead of DOM (loads entire file):
# dom = parse("huge_file.xml")  # Out of memory!

# Use SAX (event-based streaming):
import xml.sax

class SalesHandler(xml.sax.ContentHandler):
    def __init__(self):
        self.current_sale = {}
        self.total_revenue = 0
    
    def startElement(self, name, attrs):
        if name == "sale":
            self.current_sale = {}
    
    def endElement(self, name):
        if name == "sale":
            self.process_sale(self.current_sale)
            self.current_sale = {}  # Free memory
    
    def process_sale(self, sale):
        self.total_revenue += sale.get('amount', 0)

# Processes one element at a time, constant memory
parser = xml.sax.parse("huge_file.xml", SalesHandler())
\`\`\`

**2. Chunked Reading:**
\`\`\`python
# Read file in chunks, find complete records
def process_in_chunks(filename, chunk_size=1024*1024):
    buffer = ""
    with open(filename, 'r') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            buffer += chunk
            # Extract complete <sale>...</sale> records
            while "<sale>" in buffer and "</sale>" in buffer:
                start = buffer.index("<sale>")
                end = buffer.index("</sale>") + len("</sale>")
                record = buffer[start:end]
                process_record(record)
                buffer = buffer[end:]
\`\`\`

**3. Split and Parallel Process:**
\`\`\`bash
# Split file into smaller pieces
split -l 100000 huge_file.xml chunk_

# Process in parallel
parallel python process_chunk.py ::: chunk_*

# Aggregate results
python aggregate_results.py
\`\`\`

**4. Database Staging:**
\`\`\`
1. Stream XML into database table (row by row)
2. Use SQL for aggregations
3. Database handles memory management
4. Can resume if processing fails
\`\`\`

**5. External Tools:**
\`\`\`
- Apache Spark for distributed processing
- xmlstarlet for command-line XML processing
- xsltproc with streaming XSLT
\`\`\`

**Key Principles:**
- Never load entire file into memory
- Process one record at a time
- Free memory after processing each record
- Consider parallelization for speed`,
            evaluationCriteria: JSON.stringify([
              'Mentioned streaming/SAX parser approach',
              'Discussed chunked reading',
              'Considered parallel processing',
              'Showed understanding of memory constraints'
            ]),
            xpValue: 30,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A mobile application for playing puzzles has media content - audio, video, and images. What are the trade-offs for fetching these media online vs storing them offline in the app?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Online vs offline storage involves trade-offs around app size, freshness, connectivity, and user experience.',
            hints: JSON.stringify(['Think about app store size limits', 'Consider users with poor connectivity']),
            sampleSolution: `**Online vs Offline Media Trade-offs:**

**OFFLINE (Bundled in App):**

Pros:
\`\`\`
✓ Instant loading - no network wait
✓ Works without internet connection
✓ Consistent experience everywhere
✓ No server costs for serving media
✓ No CDN needed
✓ Predictable performance
\`\`\`

Cons:
\`\`\`
✗ Large app size (app store limits ~200MB for cellular download)
✗ Users hesitate to download large apps
✗ Can't update content without app update
✗ Wastes storage for content user never accesses
✗ App store review for every content change
✗ Platform-specific asset management
\`\`\`

**ONLINE (Fetch on Demand):**

Pros:
\`\`\`
✓ Small initial app size
✓ Update content without app update
✓ A/B test different media
✓ Only download what user needs
✓ Analytics on content popularity
✓ Personalized content possible
\`\`\`

Cons:
\`\`\`
✗ Requires internet connection
✗ Loading delays frustrate users
✗ Ongoing server/CDN costs
✗ Poor experience on slow networks
✗ Data usage concerns for users
✗ Need offline fallback handling
\`\`\`

**HYBRID APPROACH (Best Practice):**
\`\`\`
1. Bundle essential content offline:
   - First 5-10 puzzles
   - Core UI sounds
   - Tutorial content

2. Fetch additional content online:
   - Level packs
   - Seasonal content
   - Premium content

3. Smart caching:
   - Download next levels in background
   - Cache recently played content
   - Allow "download for offline" option

4. Graceful degradation:
   - Show cached content when offline
   - Queue downloads for when online
   - Compress media for mobile
\`\`\`

**Decision Factors:**
\`\`\`
- Target market internet quality
- How often content changes
- User session patterns
- Monetization model (ads need online)
- Competitive app sizes in category
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Listed pros/cons of offline storage',
              'Listed pros/cons of online fetching',
              'Mentioned hybrid approach',
              'Considered user experience factors'
            ]),
            xpValue: 30,
            orderIndex: 3,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A company has a legacy monolithic application with a single large database. They want to gradually migrate to microservices. What challenges will they face with the database?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Database decomposition is often the hardest part of microservices migration.',
            hints: JSON.stringify(['Think about shared tables', 'Consider transaction boundaries']),
            sampleSolution: `**Database Challenges in Microservices Migration:**

**1. Shared Tables Problem:**
\`\`\`
Monolith: Orders table used by
  - Order service
  - Inventory service
  - Shipping service
  - Reporting service

Challenge: Who owns the table now?
  - Can't just copy to each service (data sync nightmare)
  - Need to identify true owner
  - Others access via API, not direct DB
\`\`\`

**2. Cross-Service Transactions:**
\`\`\`
Monolith transaction:
  BEGIN
    INSERT INTO orders...
    UPDATE inventory...
    INSERT INTO payments...
  COMMIT

Microservices: Each has own DB
  - Can't do single transaction
  - Need saga pattern or eventual consistency
  - More complex error handling
\`\`\`

**3. Foreign Key Relationships:**
\`\`\`
Monolith: orders.customer_id → customers.id

Microservices:
  - Orders DB can't reference Customers DB
  - Lose referential integrity
  - Need application-level validation
  - Orphaned records possible
\`\`\`

**4. Reporting & Analytics:**
\`\`\`
Monolith: SELECT * FROM orders JOIN customers JOIN products...

Microservices:
  - Data spread across databases
  - Can't do cross-service JOINs
  - Need data warehouse/lake
  - ETL pipelines to aggregate
\`\`\`

**5. Data Migration:**
\`\`\`
- How to split existing data?
- Maintain consistency during migration
- Rollback strategy if issues
- Dual-write period complications
\`\`\`

**6. Strangler Pattern Challenges:**
\`\`\`
During gradual migration:
  - Some services read from old DB
  - Some services read from new DB
  - Sync between them is fragile
  - Testing becomes complex
\`\`\`

**Migration Strategies:**
\`\`\`
1. Database-per-service (eventual goal)
2. Shared database initially (anti-pattern but practical)
3. Database view layer (services see virtual tables)
4. Change data capture for sync
5. Event sourcing for new services
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Identified shared table ownership issues',
              'Mentioned distributed transaction challenges',
              'Discussed foreign key/JOIN problems',
              'Addressed migration strategy'
            ]),
            xpValue: 30,
            orderIndex: 4,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A financial services company stores sensitive customer data. They need to implement a "right to be forgotten" feature (GDPR compliance). What are the technical challenges?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Data deletion in distributed systems is surprisingly complex, especially with regulatory requirements.',
            hints: JSON.stringify(['Think about backups and replicas', 'Consider audit logs']),
            sampleSolution: `**Challenges with Right to be Forgotten:**

**1. Data is Everywhere:**
\`\`\`
Customer data exists in:
  - Primary database
  - Read replicas
  - Backups (daily, weekly, monthly)
  - Data warehouse
  - Analytics systems
  - Log files
  - Cache layers (Redis)
  - Search indices (Elasticsearch)
  - Third-party services
  - Email systems
  - Exported reports
\`\`\`

**2. Backup Dilemma:**
\`\`\`
Problem: Backups contain deleted user's data

Options:
a) Delete from backups (expensive, slow)
b) Keep deletion log, filter on restore
c) Encrypt per-user, delete encryption key
d) Accept backups are exempt (check regulations)

Best practice: Encryption key per user
  - Delete key = data is cryptographically deleted
  - Backups become unreadable for that user
\`\`\`

**3. Audit Logs Conflict:**
\`\`\`
Regulation A: Delete all user data
Regulation B: Keep audit logs for 7 years

Resolution:
  - Anonymize audit logs (remove PII)
  - Keep: "User #12345 transferred $500"
  - Delete: Name, email, SSN from log
\`\`\`

**4. Distributed Systems:**
\`\`\`
- Eventual consistency means data lingers
- Caches might serve deleted data briefly
- Message queues might have pending events
- Need coordination across all systems
\`\`\`

**5. Foreign Key Dependencies:**
\`\`\`
Orders table references customer_id
Options:
  - Cascade delete (lose order history)
  - Set to NULL (orphaned records)
  - Anonymize (customer_id = "DELETED_USER")
  - Soft delete with anonymization
\`\`\`

**6. Verification & Compliance:**
\`\`\`
- How to prove deletion occurred?
- Audit trail of deletion process
- Time limit (GDPR: 30 days)
- Notify third parties to delete
- Handle deletion request during deletion
\`\`\`

**Implementation Pattern:**
\`\`\`python
def delete_user(user_id):
    # 1. Mark user as "pending deletion"
    # 2. Stop new data collection
    # 3. Delete from all systems (async jobs)
    # 4. Verify deletion across systems
    # 5. Generate compliance report
    # 6. Mark as "deleted" with timestamp
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Identified multiple data locations',
              'Discussed backup challenges',
              'Mentioned audit log conflicts',
              'Addressed verification/compliance'
            ]),
            xpValue: 30,
            orderIndex: 5,
          },
        ],
      },
      {
        title: 'Scaling & Infrastructure Scenarios',
        slug: 'scaling-infrastructure-scenarios',
        storyContent: `🎯 KARAT-STYLE SCENARIO QUESTIONS: SCALING & INFRASTRUCTURE

More scenario-based questions focusing on:
- Scaling considerations
- Geographic expansion
- Infrastructure decisions
- Capacity planning`,
        orderIndex: 2,
        xpReward: 150,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

An ML-based service exists for a sports news app. What are the things to keep in mind when evaluating the scaling needs for the service for the next one year?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'ML service scaling requires understanding both traffic patterns and model resource requirements.',
            hints: JSON.stringify(['Think about sports event schedules', 'Consider model inference costs']),
            sampleSolution: `**Scaling Considerations for ML Sports News Service:**

**1. Traffic Pattern Analysis:**
\`\`\`
Predictable spikes:
  - Major events (Super Bowl, World Cup, Olympics)
  - Game days vs off-season
  - Breaking news (trades, injuries)
  - Time zones for different sports

Estimate:
  - Current: 10K requests/min
  - World Cup final: 500K requests/min (50x spike)
  - Plan for 10x headroom above peak
\`\`\`

**2. Model Complexity & Latency:**
\`\`\`
Questions to answer:
  - Current inference time per request?
  - Model size (affects memory, cold start)?
  - Batch inference possible?
  - Can results be cached?
  
Example:
  - Personalized feed: 200ms inference
  - Target: 50ms p99 latency
  - Need model optimization or more instances
\`\`\`

**3. Compute Requirements:**
\`\`\`
Current: 10 GPU instances
Questions:
  - GPU vs CPU for inference?
  - Can quantize model (reduce precision)?
  - Spot instances for training?
  - Auto-scaling policies?
  
Cost projection:
  - GPU instances: $2/hour × 10 × 24 × 365 = $175K/year
  - Scaling to 50 instances for peaks = $875K/year
  - Model optimization could save 50%
\`\`\`

**4. Data Growth:**
\`\`\`
Training data needs:
  - Current: 1TB of articles
  - In 1 year: 3TB (more sports, languages)
  - Model retraining frequency?
  - Storage and processing costs
\`\`\`

**5. Feature Store / Dependencies:**
\`\`\`
ML service depends on:
  - User profile service (personalization)
  - Real-time scores API
  - Content metadata service
  
Each dependency must scale proportionally
\`\`\`

**6. New Capabilities:**
\`\`\`
Product roadmap impacts:
  - New sports leagues = more content
  - Video highlights = different model
  - Real-time predictions = lower latency needs
  - New languages = model per language?
\`\`\`

**7. Monitoring & Observability:**
\`\`\`
ML-specific metrics:
  - Model accuracy drift
  - Inference latency percentiles
  - Feature freshness
  - Prediction distribution changes
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Identified traffic patterns/spikes',
              'Discussed model resource requirements',
              'Mentioned cost considerations',
              'Addressed dependencies and monitoring'
            ]),
            xpValue: 30,
            orderIndex: 1,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A social media app is expanding from US to international regions. What are the things to keep in mind?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'International expansion involves technical, legal, and cultural considerations.',
            hints: JSON.stringify(['Think about data residency laws', 'Consider latency for far users']),
            sampleSolution: `**International Expansion Considerations:**

**1. Data Residency & Compliance:**
\`\`\`
Regulations by region:
  - EU: GDPR (data can't leave EU easily)
  - China: Data must stay in China
  - Russia: Data localization laws
  - India: Emerging data protection laws

Implications:
  - May need data centers per region
  - User data can't freely replicate globally
  - Legal entity per country might be needed
\`\`\`

**2. Latency & Infrastructure:**
\`\`\`
Current: US servers
User in Singapore: 200ms+ latency

Solutions:
  - CDN for static content (images, videos)
  - Regional API servers
  - Database replication to regions
  - Edge computing for real-time features

Target: <100ms for interactive features
\`\`\`

**3. Localization:**
\`\`\`
Beyond translation:
  - Right-to-left languages (Arabic, Hebrew)
  - Date formats (MM/DD vs DD/MM)
  - Currency display
  - Number formatting (1,000 vs 1.000)
  - Cultural content moderation rules
  - Local holidays and events
\`\`\`

**4. Content Moderation:**
\`\`\`
Challenges:
  - Hate speech varies by culture/language
  - Local laws on acceptable content
  - Need moderators fluent in each language
  - ML models trained on English may fail
  - Time zone coverage for moderation
\`\`\`

**5. Payment & Monetization:**
\`\`\`
- Local payment methods (not just Visa/MC)
- Currency conversion
- VAT/tax compliance per country
- Pricing localized to market
- App store differences (China has many)
\`\`\`

**6. Network Conditions:**
\`\`\`
Not everywhere has 5G:
  - Optimize for 3G in developing markets
  - Offline-first features
  - Data-saver modes
  - Smaller image sizes
  - PWA for low-end devices
\`\`\`

**7. Time Zones & Operations:**
\`\`\`
- 24/7 support coverage
- Deployment windows affect someone
- Scheduled maintenance timing
- Event scheduling across zones
- Analytics dashboards by region
\`\`\`

**8. Feature Variations:**
\`\`\`
Some features may not apply:
  - Phone number auth (some countries SMS unreliable)
  - Government ID verification
  - Integration with local services
  - Live features during local events
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Mentioned data residency/compliance',
              'Discussed latency and infrastructure',
              'Addressed localization beyond translation',
              'Considered network conditions'
            ]),
            xpValue: 30,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A ride-sharing app sees 10x traffic during New Year's Eve. How should they prepare for this predictable spike?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Predictable spikes allow for proactive preparation across infrastructure, operations, and user experience.',
            hints: JSON.stringify(['Think about pre-scaling infrastructure', 'Consider graceful degradation']),
            sampleSolution: `**Preparing for 10x Traffic Spike:**

**1. Capacity Planning (Weeks Before):**
\`\`\`
Normal capacity: 100K requests/min
NYE target: 1M requests/min + buffer

Actions:
  - Pre-provision extra servers
  - Warm up auto-scaling groups
  - Increase database connection pools
  - Pre-scale Kafka partitions
  - Expand Redis cluster
  - Increase CDN capacity allocation
\`\`\`

**2. Load Testing (Weeks Before):**
\`\`\`
- Simulate 10x load in staging
- Identify bottlenecks before they hit production
- Test failover mechanisms
- Verify auto-scaling works
- Document breaking points
\`\`\`

**3. Feature Flags & Kill Switches:**
\`\`\`python
# Non-essential features to disable under load:
DISABLE_FEATURES = {
    'ride_history_detailed': True,  # Show summary only
    'driver_ratings_detailed': True,
    'promo_animations': True,
    'social_sharing': True,
    'referral_processing': True,  # Queue for later
}

# Essential features to protect:
PROTECT_FEATURES = [
    'ride_matching',
    'payment_processing',
    'driver_location_updates',
    'surge_pricing_calculation',
]
\`\`\`

**4. Caching Aggressively:**
\`\`\`
Pre-compute and cache:
  - Surge pricing zones
  - Popular pickup/dropoff locations
  - Driver availability heatmaps
  - ETAs for common routes

Cache duration: Increase TTL during spike
  Normal: 30 seconds
  NYE: 2 minutes (slightly stale OK)
\`\`\`

**5. Graceful Degradation:**
\`\`\`
If still overloaded:
  Level 1: Disable non-essential features
  Level 2: Reduce update frequency (location every 10s vs 5s)
  Level 3: Queue non-urgent requests
  Level 4: Show "high demand" and estimated wait
  Level 5: Limit new ride requests to maintain quality
\`\`\`

**6. Operations Preparation:**
\`\`\`
- All hands on deck (engineering, support)
- War room with dashboards
- Runbooks for common issues
- Pre-approved rollback procedures
- Communication templates ready
- Customer support staffed up
\`\`\`

**7. Post-Spike Plan:**
\`\`\`
- Gradual scale-down (don't drop instantly)
- Process queued background jobs
- Retrospective on what broke
- Update capacity models
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Mentioned pre-provisioning infrastructure',
              'Discussed load testing',
              'Included feature flags/degradation',
              'Addressed operations preparation'
            ]),
            xpValue: 30,
            orderIndex: 3,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A healthcare startup stores patient medical records. They're choosing between a managed cloud database vs self-hosted. What factors should influence this decision?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Healthcare data has unique requirements around compliance, security, and reliability.',
            hints: JSON.stringify(['Think about HIPAA compliance', 'Consider operational expertise']),
            sampleSolution: `**Managed vs Self-Hosted Database for Healthcare:**

**1. Compliance (HIPAA):**
\`\`\`
Managed (AWS RDS, Google Cloud SQL):
  ✓ HIPAA-eligible services available
  ✓ Compliance certifications maintained by provider
  ✓ BAA (Business Associate Agreement) available
  ✗ Shared responsibility - you still have obligations

Self-hosted:
  ✗ You handle ALL compliance
  ✗ Audit, logging, encryption all on you
  ✗ Need security expertise in-house
  ✓ Full control over compliance implementation
\`\`\`

**2. Security:**
\`\`\`
Managed:
  ✓ Encryption at rest/transit by default
  ✓ Automatic security patches
  ✓ Network isolation options
  ✗ Provider has access (with controls)
  ✗ Multi-tenant infrastructure

Self-hosted:
  ✓ Complete isolation
  ✓ No third-party access
  ✗ Security patches are your responsibility
  ✗ Need dedicated security team
\`\`\`

**3. Operational Burden:**
\`\`\`
Managed:
  ✓ Automated backups
  ✓ Point-in-time recovery
  ✓ High availability built-in
  ✓ Monitoring included
  ✓ No DBA needed (maybe)
  
Self-hosted:
  ✗ Backup strategy and testing
  ✗ Failover configuration
  ✗ Performance tuning
  ✗ Need experienced DBA
  ✗ On-call for database issues
\`\`\`

**4. Cost Analysis:**
\`\`\`
Managed:
  - Predictable monthly cost
  - Higher per-unit cost
  - No hidden infrastructure costs
  - Scales with usage

Self-hosted:
  - Lower compute cost potentially
  - Hidden costs: staff, time, expertise
  - Over-provision for safety
  - Harder to predict total cost
\`\`\`

**5. Data Residency:**
\`\`\`
Managed:
  - Limited to provider's regions
  - Some regions may not be available
  
Self-hosted:
  - Can deploy anywhere
  - On-premise for strict requirements
  - Hybrid options
\`\`\`

**6. Startup Stage Consideration:**
\`\`\`
Early stage (recommendation: managed):
  - Focus on product, not infrastructure
  - Limited engineering resources
  - Compliance is table stakes, not differentiator
  - Can migrate later if needed

Growth stage:
  - Evaluate based on team capabilities
  - Cost optimization may favor self-hosted
  - Compliance team can own self-hosted
\`\`\`

**Recommendation for Healthcare Startup:**
\`\`\`
Start with HIPAA-compliant managed service:
  - AWS RDS with BAA
  - Azure SQL with compliance
  - Google Cloud SQL Healthcare API

Re-evaluate when:
  - Costs exceed $50K/month
  - Have dedicated DBA team
  - Specific compliance needs unmet
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Discussed HIPAA/compliance requirements',
              'Compared security considerations',
              'Addressed operational burden',
              'Considered startup stage and resources'
            ]),
            xpValue: 30,
            orderIndex: 4,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A video conferencing app works well with 10 participants but degrades significantly with 100+ participants. What are the likely bottlenecks and solutions?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Video conferencing at scale requires different architectures than small meetings.',
            hints: JSON.stringify(['Think about bandwidth multiplication', 'Consider SFU vs MCU architectures']),
            sampleSolution: `**Video Conferencing Scaling Bottlenecks:**

**1. The N² Problem:**
\`\`\`
Peer-to-peer (P2P) approach:
  10 users: Each sends to 9 others = 90 streams
  100 users: Each sends to 99 others = 9,900 streams
  
User bandwidth with P2P:
  10 users: Upload 9 streams (~18 Mbps)
  100 users: Upload 99 streams (~200 Mbps) - IMPOSSIBLE
\`\`\`

**2. Architecture Solutions:**

\`\`\`
SFU (Selective Forwarding Unit):
  - Users send ONE stream to server
  - Server forwards to all participants
  - Server selects which streams to forward
  - User downloads only active speakers
  
  100 users: Upload 1, download ~5 active speakers
  Much more scalable!

MCU (Multipoint Control Unit):
  - Server receives all streams
  - Composites into single mixed video
  - Sends one stream to each user
  
  Pros: Minimal client bandwidth
  Cons: Server CPU intensive, one layout for all
\`\`\`

**3. Active Speaker Detection:**
\`\`\`
Problem: Can't show 100 videos at once

Solution:
  - Show only 4-9 active speakers
  - Detect who's talking (audio levels)
  - Dynamically switch displayed videos
  - Others shown as avatars/names
\`\`\`

**4. Adaptive Bitrate:**
\`\`\`
Per participant:
  - Encode at multiple qualities (1080p, 720p, 360p)
  - Server sends appropriate quality based on:
    - Viewer's bandwidth
    - Display size (thumbnail vs spotlight)
    - Device capability

Simulcast: Send multiple qualities to server
SVC: Layered encoding (base + enhancement layers)
\`\`\`

**5. Server Capacity:**
\`\`\`
Bottlenecks:
  - CPU: Transcoding/compositing
  - Bandwidth: Forwarding all streams
  - Memory: Buffer per participant

Solutions:
  - Distribute across multiple SFUs
  - Geographic distribution
  - GPU acceleration
  - Cascade SFUs for very large meetings
\`\`\`

**6. Client Optimizations:**
\`\`\`
- Pause video for off-screen participants
- Reduce resolution for small thumbnails
- Hardware encoding/decoding
- Limit max incoming streams
- Progressive loading of participant list
\`\`\`

**7. Webinar Mode (100+ common):**
\`\`\`
- Few senders, many viewers
- Viewers receive-only
- Can use CDN/streaming for distribution
- Q&A through chat, not video
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Explained N² problem with P2P',
              'Mentioned SFU/MCU architectures',
              'Discussed active speaker detection',
              'Addressed adaptive bitrate'
            ]),
            xpValue: 30,
            orderIndex: 5,
          },
        ],
      },
      {
        title: 'Architecture & Trade-off Scenarios',
        slug: 'architecture-tradeoff-scenarios',
        storyContent: `🎯 KARAT-STYLE SCENARIO QUESTIONS: ARCHITECTURE & TRADE-OFFS

More questions testing your ability to:
- Evaluate architectural choices
- Understand system interactions
- Make practical trade-off decisions`,
        orderIndex: 3,
        xpReward: 150,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

An e-commerce company wants to add a product recommendation feature. The data science team has trained an ML model. What are the considerations for integrating this into the production system?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'ML model deployment involves latency, caching, fallbacks, and monitoring considerations.',
            hints: JSON.stringify(['Think about inference latency requirements', 'Consider what happens when the model fails']),
            sampleSolution: `**ML Recommendation Integration Considerations:**

**1. Latency Requirements:**
\`\`\`
Where recommendations appear:
  - Homepage: Can be slower (pre-computed)
  - Product page: Must be fast (<100ms)
  - Cart: Medium (slightly slower OK)

Options by latency need:
  - Pre-computed: Batch job generates daily
  - Near real-time: Cached, refreshed hourly
  - Real-time: Inference on request
\`\`\`

**2. Integration Patterns:**
\`\`\`
Pattern A: Synchronous API call
  Product Page → Recommendation Service → ML Model
  Pros: Fresh recommendations
  Cons: Adds latency to page load, service dependency

Pattern B: Async with cache
  Pre-compute top recommendations per user
  Store in Redis, serve from cache
  Pros: Fast, no runtime dependency
  Cons: Less personalized, stale

Pattern C: Hybrid
  Serve cached recommendations immediately
  Async fetch fresh ones, update on next view
  Pros: Fast + eventually fresh
  Cons: More complex
\`\`\`

**3. Fallback Strategy:**
\`\`\`
When model fails or times out:
  Level 1: Serve cached recommendations (even if stale)
  Level 2: Show popular items in category
  Level 3: Show trending items globally
  Level 4: Show nothing (graceful absence)

NEVER: Block page load waiting for recommendations
\`\`\`

**4. Model Serving Infrastructure:**
\`\`\`
Options:
  - TensorFlow Serving / TorchServe
  - Custom Flask/FastAPI service
  - Managed: AWS SageMaker, Vertex AI
  
Considerations:
  - Model size (affects load time)
  - Batching inference requests
  - GPU vs CPU (cost vs speed)
  - Auto-scaling based on traffic
\`\`\`

**5. Feature Store:**
\`\`\`
Model needs features:
  - User purchase history
  - Recently viewed items
  - User demographics
  
Feature store provides:
  - Low-latency feature retrieval
  - Consistency between training and serving
  - Feature versioning
\`\`\`

**6. Monitoring:**
\`\`\`
Technical metrics:
  - Inference latency (p50, p99)
  - Model service errors
  - Feature fetch latency

Business metrics:
  - Recommendation click-through rate
  - Conversion from recommendations
  - A/B test results

Model health:
  - Prediction distribution drift
  - Feature distribution changes
\`\`\`

**7. A/B Testing:**
\`\`\`
Before full rollout:
  - Test new model against baseline
  - Gradual rollout (1% → 10% → 50% → 100%)
  - Automatic rollback if metrics degrade
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Discussed latency requirements',
              'Mentioned fallback strategies',
              'Addressed model serving infrastructure',
              'Included monitoring and A/B testing'
            ]),
            xpValue: 30,
            orderIndex: 1,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A food delivery app has separate services for restaurants, orders, and delivery drivers. An order flow involves all three. What are the challenges with this distributed architecture?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Distributed order flows require careful coordination, consistency, and error handling.',
            hints: JSON.stringify(['Think about partial failures', 'Consider data consistency']),
            sampleSolution: `**Distributed Order Flow Challenges:**

**1. Partial Failure Scenarios:**
\`\`\`
Order flow:
  1. Create order (Order Service)
  2. Notify restaurant (Restaurant Service)
  3. Assign driver (Driver Service)
  4. Charge payment (Payment Service)

What if step 2 succeeds but step 3 fails?
  - Order created
  - Restaurant preparing food
  - No driver assigned
  - Customer charged
  
Need rollback/compensation logic
\`\`\`

**2. Saga Pattern Needed:**
\`\`\`
Forward transactions:
  create_order → notify_restaurant → assign_driver → charge_payment

Compensating transactions (on failure):
  refund_payment → unassign_driver → cancel_restaurant → cancel_order

Each service must support "undo" operation
\`\`\`

**3. Data Consistency:**
\`\`\`
Scenario: User cancels while driver being assigned

Order Service: status = "cancelled"
Driver Service: still assigning driver

Race condition:
  - Driver assigned to cancelled order
  - Driver shows up, no food
  - Bad experience for everyone

Need: Event ordering or distributed locking
\`\`\`

**4. Cross-Service Queries:**
\`\`\`
User wants: "Show my order with restaurant details and driver location"

Data in 3 different services:
  - Order: Order Service
  - Restaurant name, address: Restaurant Service
  - Driver location: Driver Service

Options:
  - API composition (multiple calls, slow)
  - Denormalized read model (eventual consistency)
  - BFF (Backend for Frontend) aggregates
\`\`\`

**5. Timeout and Retry:**
\`\`\`
Restaurant Service takes 30 seconds to respond:
  - Is it processing or dead?
  - Safe to retry? (might double-notify)
  - User waiting, getting impatient

Need:
  - Idempotency keys for safe retries
  - Reasonable timeouts
  - Async processing with status updates
\`\`\`

**6. Debugging & Tracing:**
\`\`\`
Order #12345 failed somewhere

Which service? What step?
  - Need distributed tracing (Jaeger, Zipkin)
  - Correlation IDs across all services
  - Centralized logging
  
Without this: Hours of log diving
\`\`\`

**7. Real-time Updates:**
\`\`\`
User wants live updates:
  - Order confirmed by restaurant
  - Driver assigned
  - Driver picked up food
  - Driver 5 min away

Events from multiple services
  → Aggregated into user-facing updates
  → Push via WebSocket
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Identified partial failure scenarios',
              'Mentioned saga/compensation pattern',
              'Discussed data consistency challenges',
              'Addressed debugging/tracing needs'
            ]),
            xpValue: 30,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A news website loads slowly because it makes 15 API calls to render the homepage. What are the options to improve this?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Multiple API calls can be optimized through aggregation, caching, and parallel loading.',
            hints: JSON.stringify(['Think about BFF pattern', 'Consider what can be parallelized']),
            sampleSolution: `**Optimizing Multiple API Calls:**

**Current Problem:**
\`\`\`
Homepage loads:
  1. GET /user (50ms)
  2. GET /top-stories (100ms)
  3. GET /trending (80ms)
  4. GET /weather (200ms)
  5. GET /sports (90ms)
  ... 10 more calls

Sequential: 50+100+80+200+90+... = 1500ms+ 
Even parallel: Limited by slowest + overhead
\`\`\`

**Solution 1: Backend for Frontend (BFF):**
\`\`\`
Single endpoint: GET /homepage

BFF aggregates internally:
  - Calls all services in parallel
  - Combines into single response
  - Can be cached as unit
  
Client: 1 call instead of 15
Server-to-server calls are faster (same network)
\`\`\`

**Solution 2: GraphQL:**
\`\`\`graphql
query Homepage {
  user { name avatar }
  topStories(limit: 5) { title image }
  trending { tag count }
  weather { temp conditions }
  sports { headlines }
}

# Single request, get exactly what's needed
# Backend resolves in parallel
\`\`\`

**Solution 3: Aggressive Caching:**
\`\`\`
What changes frequently?
  - User: Changes rarely (cache 5 min)
  - Top stories: Every 15 min
  - Weather: Every 30 min
  - Trending: Every 5 min

Cache at multiple levels:
  - CDN: Static parts
  - Server cache: API responses
  - Client cache: Service worker
  
Homepage might be 80% cached
\`\`\`

**Solution 4: Prioritize & Lazy Load:**
\`\`\`
Above the fold (load immediately):
  - Top stories
  - User greeting

Below the fold (lazy load on scroll):
  - Sports section
  - Weather widget
  - Recommended articles

Perceived performance matters more than total time
\`\`\`

**Solution 5: Server-Side Rendering (SSR):**
\`\`\`
Server renders full HTML:
  - All API calls on server (fast internal network)
  - Send complete HTML to client
  - Hydrate with JavaScript after

TTFB slower, but First Contentful Paint faster
\`\`\`

**Solution 6: Parallel API Calls (Client-side):**
\`\`\`javascript
// Instead of:
const user = await fetch('/user');
const stories = await fetch('/stories');

// Do:
const [user, stories, weather] = await Promise.all([
  fetch('/user'),
  fetch('/stories'),
  fetch('/weather')
]);

// Limited by slowest, not sum
\`\`\`

**Recommendation:**
\`\`\`
Combine approaches:
1. BFF for homepage aggregate endpoint
2. Cache heavily (most content doesn't change per-request)
3. Lazy load below-fold content
4. Client-side cache with Service Worker
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Mentioned BFF or API aggregation',
              'Discussed caching strategies',
              'Suggested lazy loading',
              'Addressed parallel requests'
            ]),
            xpValue: 30,
            orderIndex: 3,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A startup's single PostgreSQL database is becoming a bottleneck. Read queries are slow during peak hours. What are the options before jumping to a complete re-architecture?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Database performance can often be improved significantly before needing major architecture changes.',
            hints: JSON.stringify(['Think about read replicas', 'Consider query optimization first']),
            sampleSolution: `**Database Optimization Before Re-architecture:**

**1. Query Optimization (First!):**
\`\`\`sql
-- Find slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;

Common fixes:
  - Add missing indexes
  - Rewrite N+1 queries to JOINs
  - Add LIMIT where missing
  - Optimize OR clauses
  - Use EXPLAIN ANALYZE

Often 10x improvement possible!
\`\`\`

**2. Add Read Replicas:**
\`\`\`
Primary (writes) ──replication──> Replica (reads)

Route read-heavy queries to replica:
  - Analytics queries
  - Search/listing pages
  - Reports

Keep on primary:
  - Writes
  - Reads requiring immediate consistency
  
Many providers: 1-click replica setup
\`\`\`

**3. Caching Layer:**
\`\`\`
Add Redis/Memcached for:
  - Session data (remove from DB)
  - Frequently accessed, rarely changing data
  - Computed results (counts, aggregates)

Example impact:
  - Before: 10K queries/sec to DB
  - After: 2K queries/sec (80% cache hit)
\`\`\`

**4. Connection Pooling:**
\`\`\`
Problem: Each web worker opens DB connection
  100 workers × 10 connections = 1000 connections
  PostgreSQL struggles with many connections

Solution: PgBouncer
  App → PgBouncer → PostgreSQL
  
Multiplex 1000 app connections to 100 DB connections
Huge improvement in connection overhead
\`\`\`

**5. Hardware Scaling:**
\`\`\`
Vertical scaling (bigger machine):
  - More RAM (more data in memory)
  - Faster SSD (better I/O)
  - More CPU cores
  
Often underutilized:
  - Check if DB fits in RAM
  - Check I/O wait times
  - Upgrade before splitting
\`\`\`

**6. Archive Old Data:**
\`\`\`
Table with 100M rows, but only recent 1M queried

Move old data to archive table:
  - Main table: Fast queries on recent data
  - Archive: Accessible but separate

Can reduce query time by orders of magnitude
\`\`\`

**7. Materialized Views:**
\`\`\`sql
-- Instead of complex query every time:
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
  date_trunc('day', created_at) as day,
  COUNT(*) as orders,
  SUM(total) as revenue
FROM orders
GROUP BY 1;

-- Refresh periodically
REFRESH MATERIALIZED VIEW dashboard_stats;

Pre-computed results, instant queries
\`\`\`

**When to Actually Re-architect:**
\`\`\`
After exhausting above, consider splitting if:
  - Write load exceeds single master
  - Data size exceeds practical single-node
  - Different access patterns need different DBs
  - Team/service boundaries align with data split
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Started with query optimization',
              'Mentioned read replicas',
              'Discussed caching layer',
              'Addressed connection pooling'
            ]),
            xpValue: 30,
            orderIndex: 4,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A mobile banking app needs to work when the user has no internet connection. What features should work offline and how would you implement this?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Offline-first banking requires careful consideration of security, sync, and user expectations.',
            hints: JSON.stringify(['Think about what\'s safe to cache', 'Consider conflict resolution']),
            sampleSolution: `**Offline-First Banking App:**

**1. What Should Work Offline:**
\`\`\`
READ (Safe to cache):
  ✓ Account balances (with "as of" timestamp)
  ✓ Recent transactions (last 30-90 days)
  ✓ Scheduled payments list
  ✓ Bill pay payees
  ✓ Account settings
  ✓ Branch/ATM locator (pre-cached)
  ✓ Help/FAQ content

WRITE (Queue for sync):
  ✓ Bill pay scheduling (future dated)
  ✓ Internal transfers (between own accounts)
  ✓ Budget/category tagging
  ✓ Alert preferences

BLOCKED (Require online):
  ✗ External transfers
  ✗ Wire transfers
  ✗ Check deposit
  ✗ Card activation
  ✗ Password/PIN change
  ✗ Real-time balance for payments
\`\`\`

**2. Local Storage Implementation:**
\`\`\`
Encrypted local database:
  - SQLite with SQLCipher (encryption)
  - Encryption key derived from user PIN + device key
  - Data encrypted at rest
  
Storage structure:
  accounts: { id, name, type, balance, balance_as_of }
  transactions: { id, account_id, amount, date, description, ... }
  pending_actions: { id, action_type, payload, created_at }
\`\`\`

**3. Sync Strategy:**
\`\`\`
On app open (if online):
  1. Authenticate
  2. Pull latest balances
  3. Pull new transactions since last sync
  4. Push any pending offline actions
  5. Resolve conflicts

Delta sync:
  GET /transactions?since=2024-01-15T10:30:00Z
  Returns only new/changed transactions
  
Full sync fallback:
  If >30 days since sync, fresh pull
\`\`\`

**4. Conflict Resolution:**
\`\`\`
Scenario: User schedules bill pay offline,
          balance dropped below payment amount while offline

Resolution:
  1. On sync, server validates pending actions
  2. If insufficient funds: 
     - Reject action
     - Notify user: "Bill pay couldn't be completed"
  3. If account closed:
     - Clear local cache
     - Require re-authentication

Principle: Server is source of truth for money movement
\`\`\`

**5. Staleness Indicators:**
\`\`\`
Always show:
  "Balance as of Jan 15, 10:30 AM"
  
Warning if >24h stale:
  ⚠️ "Last updated 2 days ago. Connect to refresh."
  
Block decisions based on stale data:
  "Please connect to internet to confirm current balance"
\`\`\`

**6. Security Considerations:**
\`\`\`
- Timeout: Auto-lock after 5 min inactive
- Max offline duration: 30 days, then require online auth
- Jailbreak/root detection: Disable offline mode
- Biometric: Can work offline
- PIN attempts: Lock after 3 failed attempts
- Remote wipe: Queue device wipe, execute on next online
\`\`\`

**7. Testing Offline:**
\`\`\`
Test scenarios:
- Go offline mid-sync
- Large pending action queue
- Conflicting changes
- Token expiration while offline
- Device time manipulation
- Storage full conditions
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Categorized read vs write offline features',
              'Discussed encrypted local storage',
              'Explained sync and conflict resolution',
              'Addressed security considerations'
            ]),
            xpValue: 30,
            orderIndex: 5,
          },
        ],
      },
      {
        title: 'System Interactions & Edge Cases',
        slug: 'system-interactions-edge-cases',
        storyContent: `🎯 KARAT-STYLE SCENARIO QUESTIONS: SYSTEM INTERACTIONS

Final set of scenario questions covering:
- System integration challenges
- Edge cases and failure modes
- Practical operational concerns`,
        orderIndex: 4,
        xpReward: 150,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A calendar application needs to sync events across web, iOS, and Android apps. What are the challenges with keeping all clients in sync?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Multi-client sync involves conflict resolution, real-time updates, and handling offline edits.',
            hints: JSON.stringify(['Think about simultaneous edits', 'Consider recurring events']),
            sampleSolution: `**Calendar Multi-Client Sync Challenges:**

**1. Simultaneous Edits:**
\`\`\`
User A (web): Moves meeting to 3 PM
User B (iOS): Adds attendee to same meeting
Both offline, then sync

Conflict types:
  - Same field edited (time changed by both)
  - Different fields (time vs attendees) - mergeable
  - Delete vs edit (one deletes, one edits)

Resolution strategies:
  - Last-write-wins (simple, loses data)
  - Field-level merge (complex, better UX)
  - Conflict notification (user decides)
\`\`\`

**2. Recurring Events Complexity:**
\`\`\`
"Every Monday 10 AM" edited on one instance:
  - Change just this occurrence?
  - Change all future occurrences?
  - Change entire series?

Server must track:
  - Master recurring rule
  - Per-instance exceptions
  - Deleted instances
  
Sync payload gets complex quickly
\`\`\`

**3. Time Zone Handling:**
\`\`\`
Meeting created: "3 PM PST"
User travels to EST, views calendar

Questions:
  - Show as 3 PM or 6 PM?
  - "All-day" events in which zone?
  - Recurring: "9 AM local time" vs "9 AM PST always"

Store in UTC, convert for display
But all-day events need special handling
\`\`\`

**4. Push vs Pull Sync:**
\`\`\`
Pull (client polls):
  - Simple to implement
  - Delays in seeing changes
  - Battery drain from frequent polling

Push (server notifies):
  - Real-time updates
  - Complex infrastructure (WebSocket, push notifications)
  - Need to handle missed pushes

Hybrid:
  - Push notification triggers pull
  - Periodic pull as backup
\`\`\`

**5. Partial Sync / Pagination:**
\`\`\`
User has 10,000 events over 5 years
Mobile app can't store all

Strategies:
  - Sync window: Past 6 months + future 1 year
  - On-demand fetch for older events
  - Progressive loading as user scrolls

Delta sync:
  GET /events?modified_since=timestamp
  Returns only changed events
\`\`\`

**6. Shared Calendars:**
\`\`\`
Team calendar edited by multiple people:
  - Permission management
  - Who can see what?
  - Notification to all subscribers
  - Rate limiting updates (avoid spam)
\`\`\`

**7. Offline Editing:**
\`\`\`
Create event while offline:
  - Assign temporary local ID
  - On sync: server assigns real ID
  - Update local references

Delete while offline:
  - Mark as pending delete
  - If server shows it was edited by someone else?
  - Conflict resolution needed
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Addressed simultaneous edit conflicts',
              'Mentioned recurring event complexity',
              'Discussed time zone challenges',
              'Explained offline editing'
            ]),
            xpValue: 30,
            orderIndex: 1,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

An IoT platform receives sensor data from 1 million devices. Each device sends a reading every 5 seconds. What are the ingestion challenges?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'High-volume IoT ingestion requires handling unreliable devices, out-of-order data, and massive throughput.',
            hints: JSON.stringify(['Calculate the messages per second', 'Think about unreliable network connections']),
            sampleSolution: `**IoT Data Ingestion Challenges:**

**1. Scale Calculation:**
\`\`\`
1M devices × 1 reading/5 seconds = 200K messages/second

Each message ~100 bytes:
  200K × 100 = 20 MB/second = 1.7 TB/day

This is significant but manageable with right architecture
\`\`\`

**2. Protocol Choices:**
\`\`\`
HTTP REST:
  - Heavy overhead for small messages
  - Connection per request
  - Not ideal for constrained devices

MQTT (Message Queue Telemetry Transport):
  ✓ Designed for IoT
  ✓ Lightweight protocol
  ✓ Persistent connections
  ✓ QoS levels (at-most-once, at-least-once, exactly-once)

CoAP (Constrained Application Protocol):
  ✓ UDP-based, very lightweight
  ✓ Good for extremely constrained devices
  ✗ Less reliable than TCP-based
\`\`\`

**3. Connection Management:**
\`\`\`
1M persistent connections challenge:
  - Each connection uses memory, file descriptors
  - Need multiple brokers/gateways
  - Load balance connections across servers
  
Solution:
  - Regional edge gateways
  - Connection pooling at edge
  - Aggregate messages before forwarding to central
\`\`\`

**4. Out-of-Order Data:**
\`\`\`
Device sends: t1, t2, t3, t4, t5
Network delivers: t1, t3, t2, t5, t4

Must handle:
  - Timestamp from device (device clock might be wrong!)
  - Server-side receive timestamp
  - Sequence numbers per device
  
Storage must handle out-of-order inserts
\`\`\`

**5. Device Offline & Reconnection:**
\`\`\`
Device offline for 1 hour, then reconnects:
  - Backlog of 720 readings to send
  - Burst of data from this device
  - Should it send all historical or just latest?

Strategies:
  - Device-side buffer with max size
  - Prioritize recent readings
  - Separate "real-time" vs "backfill" streams
\`\`\`

**6. Ingestion Pipeline:**
\`\`\`
Devices → MQTT Broker → Kafka → Stream Processor → Storage

Why Kafka:
  - Buffers bursts
  - Decouples ingestion from processing
  - Replay capability
  - Partitioning by device_id

Stream processing (Flink/Spark):
  - Validation
  - Aggregation (5-second raw → 1-minute avg)
  - Anomaly detection
  - Enrichment (add device metadata)
\`\`\`

**7. Storage:**
\`\`\`
Time-series database:
  - InfluxDB, TimescaleDB, QuestDB
  - Optimized for time-range queries
  - Efficient compression

Retention:
  - Raw: 7 days
  - 1-min aggregates: 30 days
  - Hourly: 1 year
  - Daily: Forever
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Calculated message throughput',
              'Discussed protocol choices (MQTT)',
              'Addressed out-of-order and offline scenarios',
              'Mentioned ingestion pipeline architecture'
            ]),
            xpValue: 30,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A SaaS company offers a multi-tenant application where each customer (tenant) has their own data that must be isolated. What are the database design options?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Multi-tenancy involves trade-offs between isolation, cost, and complexity.',
            hints: JSON.stringify(['Think about shared vs dedicated databases', 'Consider compliance requirements']),
            sampleSolution: `**Multi-Tenant Database Design Options:**

**Option 1: Shared Database, Shared Schema**
\`\`\`sql
CREATE TABLE orders (
  id BIGINT,
  tenant_id INT,  -- Every table has this
  customer_name VARCHAR,
  amount DECIMAL,
  PRIMARY KEY (id),
  INDEX (tenant_id)
);

-- Every query includes:
SELECT * FROM orders WHERE tenant_id = 123 AND ...
\`\`\`

Pros:
  ✓ Most efficient resource usage
  ✓ Easy to add new tenants
  ✓ Simple deployment
  ✓ Lowest cost

Cons:
  ✗ Risk of data leakage if WHERE forgotten
  ✗ Noisy neighbor (one tenant's query affects others)
  ✗ Hard to offer different SLAs
  ✗ Schema changes affect everyone

**Option 2: Shared Database, Separate Schemas**
\`\`\`sql
-- Each tenant gets a schema
CREATE SCHEMA tenant_123;
CREATE TABLE tenant_123.orders (...);

CREATE SCHEMA tenant_456;
CREATE TABLE tenant_456.orders (...);
\`\`\`

Pros:
  ✓ Better isolation than shared schema
  ✓ Can have per-tenant customizations
  ✓ Easier to backup/restore per tenant
  
Cons:
  ✗ Schema migrations across all tenants
  ✗ Connection management complexity
  ✗ Still shared resources

**Option 3: Separate Databases**
\`\`\`
tenant_123_db: Full database instance
tenant_456_db: Full database instance
\`\`\`

Pros:
  ✓ Complete isolation
  ✓ Per-tenant performance tuning
  ✓ Can offer dedicated resources
  ✓ Easy to move to dedicated server
  ✓ Compliance friendly

Cons:
  ✗ Higher cost (database per tenant)
  ✗ Complex deployment
  ✗ Connection pool per database
  ✗ Cross-tenant analytics hard

**Hybrid Approach:**
\`\`\`
Tier-based:
  - Free tier: Shared schema (pool 1)
  - Pro tier: Separate schema (pool 2)
  - Enterprise: Dedicated database

Migration path:
  Tenant grows → Move to higher isolation
\`\`\`

**Additional Considerations:**

Row-level security (PostgreSQL):
\`\`\`sql
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.tenant_id'));
  
-- Database enforces isolation automatically
\`\`\`

Connection routing:
\`\`\`
Request → Identify tenant → Route to correct DB
Need tenant lookup service or tenant in subdomain
\`\`\`

Compliance:
\`\`\`
Some regulations require data isolation:
  - HIPAA, GDPR, SOC2
  - May mandate separate databases
  - Check requirements before choosing
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described shared schema approach',
              'Explained separate schemas option',
              'Discussed dedicated databases',
              'Mentioned isolation and compliance'
            ]),
            xpValue: 30,
            orderIndex: 3,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A game company's leaderboard shows top 100 players globally. With 10 million active players, score updates happen constantly. How do you design this?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Real-time leaderboards at scale require clever data structures and approximation for efficiency.',
            hints: JSON.stringify(['Think about sorted sets in Redis', 'Consider if exact rankings are always needed']),
            sampleSolution: `**Global Leaderboard Design:**

**1. Requirements Analysis:**
\`\`\`
Display: Top 100 players
Users: 10M active
Updates: Constant (after each game)
Queries:
  - Get top 100
  - Get player's rank
  - Get players around a rank (±5)
\`\`\`

**2. Redis Sorted Sets (Primary Solution):**
\`\`\`python
# Add/update score
ZADD leaderboard 1500 player:123

# Get top 100
ZREVRANGE leaderboard 0 99 WITHSCORES

# Get player rank
ZREVRANK leaderboard player:123

# Get rank with surrounding players
rank = ZREVRANK leaderboard player:123
ZREVRANGE leaderboard (rank-5) (rank+5) WITHSCORES
\`\`\`

Why Redis sorted sets:
  - O(log N) insert/update
  - O(log N) rank lookup
  - O(K + log N) range queries
  - 10M members is manageable (~1GB RAM)

**3. Sharding Considerations:**
\`\`\`
If single Redis can't handle:
  - Shard by score ranges? NO - ranks span shards
  - Shard by user? NO - need global ranking

Solutions for extreme scale:
  a) More powerful Redis (vertical)
  b) Pre-aggregate regional leaderboards
  c) Approximate rankings for non-top players
\`\`\`

**4. Batch Updates:**
\`\`\`
Instead of updating Redis on every score:
  
  Game ends → Write to Kafka → Batch processor
  
Batch processor (every 1 second):
  - Aggregate score updates
  - Batch ZADD to Redis
  - Reduce write pressure

For top 100: Real-time updates via pub/sub
For everyone else: 1-5 second delay acceptable
\`\`\`

**5. Display Optimization:**
\`\`\`
Top 100 rarely changes per second
  - Cache top 100 with 1-5 second TTL
  - Serve from cache
  - Reduce Redis reads significantly

Player's own rank:
  - Show approximate: "Top 5%" instead of exact
  - Exact rank: Query only on profile page
\`\`\`

**6. Time-Based Leaderboards:**
\`\`\`
Daily/Weekly/Monthly leaderboards:
  - Separate sorted set per period
  - leaderboard:daily:2024-01-15
  - leaderboard:weekly:2024-W03
  
Rotation:
  - Create new set at period start
  - Keep old for display
  - Archive/delete after N days
\`\`\`

**7. Cheating Prevention:**
\`\`\`
Validate scores server-side:
  - Game server reports scores, not client
  - Sanity checks (max possible score per game)
  - Flag anomalies for review
  
Suspicious patterns:
  - Score jump too fast
  - Perfect scores consistently
  - Impossible play times
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Proposed Redis sorted sets',
              'Addressed write throughput with batching',
              'Mentioned caching for reads',
              'Discussed sharding or scale challenges'
            ]),
            xpValue: 30,
            orderIndex: 4,
          },
          {
            type: 'self_judge',
            scenarioText: `**Scenario Question:**

A company is migrating from a monolithic deployment to Kubernetes. What are the common pitfalls they should watch out for?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Kubernetes migration involves more than just containerization—networking, storage, and operational practices all change.',
            hints: JSON.stringify(['Think about persistent storage', 'Consider debugging complexity']),
            sampleSolution: `**Kubernetes Migration Pitfalls:**

**1. "Lift and Shift" Mentality:**
\`\`\`
Mistake:
  Take monolith, put in single container, deploy to K8s
  
Problems:
  - No benefit from orchestration
  - Still single point of failure
  - Harder to debug than VM
  
Better:
  Gradually decompose OR refactor for K8s patterns
\`\`\`

**2. Persistent Storage Challenges:**
\`\`\`
Monolith: Local disk always there
K8s: Pods ephemeral, storage must be explicit

Pitfalls:
  - Losing data when pod restarts
  - Slow PersistentVolume provisioning
  - StatefulSet complexity for databases
  
Solutions:
  - Use managed databases outside K8s
  - Understand StorageClasses
  - Test pod failure scenarios
\`\`\`

**3. Networking Complexity:**
\`\`\`
Monolith: localhost, simple ports
K8s: Service discovery, DNS, ingress

Pitfalls:
  - Services can't find each other
  - Forgetting NetworkPolicies (security)
  - Ingress misconfiguration (503 errors)
  - Thinking ClusterIP is externally accessible

Learn:
  - Service DNS: my-service.namespace.svc.cluster.local
  - Service types: ClusterIP, NodePort, LoadBalancer
  - Ingress vs LoadBalancer
\`\`\`

**4. Resource Limits:**
\`\`\`
Pitfall: Not setting CPU/memory limits

Result:
  - One pod consumes all node resources
  - Other pods evicted or starved
  - "OOMKilled" mysteries

Best practice:
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"
\`\`\`

**5. Secrets Management:**
\`\`\`
Pitfall: Putting secrets in ConfigMaps or images

Problems:
  - Secrets in plain text
  - Secrets in version control
  - No rotation mechanism

Solutions:
  - K8s Secrets (base64 encoded, not encrypted!)
  - External secrets (Vault, AWS Secrets Manager)
  - Sealed Secrets for GitOps
\`\`\`

**6. Logging & Debugging:**
\`\`\`
Monolith: SSH in, tail -f logs
K8s: Pods die, logs disappear

Pitfalls:
  - Can't debug crashed pods
  - Logs scattered across nodes
  - No centralized view

Solutions:
  - Centralized logging (ELK, Loki)
  - kubectl logs --previous (crashed pod)
  - Liveness/readiness probes tuned properly
\`\`\`

**7. Deployment Strategy:**
\`\`\`
Pitfalls:
  - All pods updated at once (downtime)
  - No rollback plan
  - Breaking changes in API

Best practices:
  - RollingUpdate strategy
  - Readiness probes prevent traffic to unready pods
  - Deployment history for rollback
  - Blue-green or canary for risky changes
\`\`\`

**8. Overcomplicating Early:**
\`\`\`
Pitfall: Adding service mesh, GitOps, autoscaling
         before understanding basics

Start simple:
  1. Get app running in K8s
  2. Add monitoring
  3. Automate deployments
  4. Then add advanced features
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Mentioned persistent storage challenges',
              'Discussed networking complexity',
              'Addressed resource limits',
              'Noted logging/debugging changes'
            ]),
            xpValue: 30,
            orderIndex: 5,
          },
        ],
      },
    ],
  },
];
