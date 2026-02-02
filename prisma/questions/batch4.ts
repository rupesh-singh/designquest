// Batch 4: 30 Questions covering famous system design interview problems
// Topics: Design Twitter, Design Netflix, Design Uber, Design WhatsApp

import { SeedModule } from './index';

export const batch4Modules: SeedModule[] = [
  // ============================================
  // MODULE 13: DESIGN TWITTER
  // ============================================
  {
    title: 'Design Twitter',
    slug: 'design-twitter',
    description: 'Design a social media platform like Twitter with tweets, timelines, followers, and trending topics at massive scale.',
    difficulty: 'advanced',
    orderIndex: 40,
    icon: '🐦',
    colorTheme: '#1da1f2',
    lessons: [
      {
        title: 'Twitter Core Features',
        slug: 'twitter-core-features',
        storyContent: `🐦 SYSTEM DESIGN INTERVIEW

"Design Twitter."

Requirements:
- Users can post tweets (280 chars)
- Users can follow other users
- Home timeline shows tweets from followed users
- Scale: 500M users, 200M daily active
- Celebrity users have 50M+ followers

Where do you start? Let's break this down.`,
        orderIndex: 1,
        xpReward: 160,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Tweet Storage**

Design the data model and storage for tweets:
- What information does a tweet contain?
- How would you structure the database schema?
- How do you handle media (images, videos)?
- Estimate storage requirements for 500M tweets/day`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Tweet storage must handle high write throughput while supporting fast reads for timeline generation.',
            hints: JSON.stringify(['Think about what metadata a tweet needs', 'Consider separating text from media']),
            sampleSolution: `**Tweet Data Model:**

\`\`\`json
{
  "tweet_id": "1234567890",      // Snowflake ID (time-sortable)
  "user_id": "user_123",
  "content": "Hello world!",
  "created_at": "2024-01-15T10:30:00Z",
  "media_urls": ["https://..."],
  "reply_to": null,              // Tweet ID if reply
  "retweet_of": null,            // Tweet ID if retweet
  "quote_tweet_id": null,
  "hashtags": ["tech", "news"],
  "mentions": ["user_456"],
  "like_count": 1500,            // Denormalized for display
  "retweet_count": 300,
  "reply_count": 50
}
\`\`\`

**Database Schema:**

\`\`\`sql
-- Tweets table (sharded by user_id)
CREATE TABLE tweets (
  tweet_id BIGINT PRIMARY KEY,   -- Snowflake ID
  user_id BIGINT NOT NULL,
  content VARCHAR(280),
  created_at TIMESTAMP,
  reply_to BIGINT,
  retweet_of BIGINT,
  INDEX idx_user_created (user_id, created_at DESC)
);

-- Media stored separately (S3 + CDN)
CREATE TABLE tweet_media (
  media_id BIGINT PRIMARY KEY,
  tweet_id BIGINT,
  media_type ENUM('image', 'video', 'gif'),
  url VARCHAR(500),
  thumbnail_url VARCHAR(500)
);

-- Counts in Redis for real-time updates
-- tweet:1234:likes = 1500
-- tweet:1234:retweets = 300
\`\`\`

**Storage Estimation:**

\`\`\`
Tweets per day: 500M
Average tweet size: ~500 bytes (with metadata)
Daily storage: 500M × 500B = 250GB/day
Yearly: 250GB × 365 = ~90TB/year (text only)

Media:
- 20% tweets have images: 100M × 200KB = 20TB/day
- 5% have video: 25M × 5MB = 125TB/day

Total: ~145TB/day → Need distributed storage
\`\`\`

**Architecture:**
- Tweets: Sharded MySQL/PostgreSQL by user_id
- Media: S3 with CloudFront CDN
- Counts: Redis cluster
- Search: Elasticsearch for hashtags/content`,
            evaluationCriteria: JSON.stringify([
              'Defined tweet data structure with key fields',
              'Proposed database schema',
              'Separated media storage from text',
              'Provided storage estimation'
            ]),
            xpValue: 35,
            orderIndex: 1,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Timeline Generation**

The home timeline shows tweets from people you follow. Design the timeline system:
- How do you generate a user's timeline?
- Compare "fan-out on write" vs "fan-out on read"
- How do you handle celebrity accounts (50M followers)?
- How do you keep timelines fresh?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Timeline generation is the core challenge of Twitter\'s architecture, requiring careful tradeoffs between write and read amplification.',
            hints: JSON.stringify(['Think about what happens when a user with 50M followers tweets', 'Consider where the work should happen: write time or read time']),
            sampleSolution: `**Timeline Approaches:**

**Fan-out on Write (Push Model):**
\`\`\`
When user tweets:
  1. Write tweet to tweets table
  2. Get list of all followers
  3. Push tweet_id to each follower's timeline cache

Timeline read:
  1. Get tweet_ids from user's timeline cache
  2. Fetch tweet details
  3. Return timeline
\`\`\`

*Pros:* Fast reads (pre-computed)
*Cons:* Slow writes, celebrity problem

**Fan-out on Read (Pull Model):**
\`\`\`
Timeline read:
  1. Get list of users I follow
  2. Fetch recent tweets from each
  3. Merge and sort
  4. Return timeline
\`\`\`

*Pros:* Fast writes
*Cons:* Slow reads (N queries), lots of computation

**Hybrid Approach (Twitter's Solution):**
\`\`\`
For regular users (< 10K followers):
  → Fan-out on write (push to follower timelines)

For celebrities (> 10K followers):
  → Don't fan-out
  → Mix in at read time

Timeline read:
  1. Get pre-computed timeline from cache
  2. Fetch recent tweets from followed celebrities
  3. Merge the two
  4. Return
\`\`\`

**Timeline Cache (Redis):**
\`\`\`
Key: timeline:user_123
Value: Sorted Set of tweet_ids by timestamp
  - tweet_id_1: 1705312200
  - tweet_id_2: 1705312100
  - tweet_id_3: 1705312000
  
Max size: 800 tweets (configurable)
\`\`\`

**Keeping Fresh:**
\`\`\`
1. New tweets pushed in real-time (for non-celebrities)
2. Background job refreshes celebrity tweets
3. WebSocket for live updates
4. "New tweets available" prompt (don't auto-refresh)
\`\`\`

**Architecture:**
\`\`\`
Tweet Created → Tweet Service → Fan-out Service
                                    ↓
                    Follower Graph → Timeline Cache (Redis)
                                    ↓
                            User fetches timeline
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Explained fan-out on write vs read',
              'Addressed the celebrity problem',
              'Proposed hybrid solution',
              'Discussed timeline caching strategy'
            ]),
            xpValue: 40,
            orderIndex: 2,
          },
          {
            type: 'multiple_choice',
            scenarioText: `A celebrity with 50 million followers posts a tweet. Using pure fan-out on write, how long would it take to update all follower timelines if each update takes 1ms?`,
            options: JSON.stringify([
              { id: 'a', text: '50 seconds', feedback: 'Check your math: 50M × 1ms = 50M ms' },
              { id: 'b', text: '~14 hours', feedback: 'Correct! 50,000,000ms = 50,000 seconds = ~14 hours. This is why pure fan-out on write doesn\'t work for celebrities.' },
              { id: 'c', text: '5 minutes', feedback: '50M × 1ms is much more than 5 minutes.' },
              { id: 'd', text: '50 minutes', feedback: 'Still too low. 50M operations at 1ms each is much longer.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: '50 million timeline updates × 1ms = 50 million ms = 50,000 seconds = ~14 hours. Even with parallelization, this is impractical. This is why Twitter uses a hybrid approach where celebrity tweets are NOT fanned out but mixed in at read time.',
            hints: JSON.stringify(['Convert milliseconds to hours', 'This is why the celebrity problem exists']),
            xpValue: 20,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `How should Twitter generate Tweet IDs?`,
            options: JSON.stringify([
              { id: 'a', text: 'Auto-increment integers from a single database', score: 30, feedback: 'Single point of failure and bottleneck. Can\'t scale globally.' },
              { id: 'b', text: 'Random UUIDs', score: 50, feedback: 'Works but UUIDs aren\'t time-sortable, making timeline queries less efficient.' },
              { id: 'c', text: 'Snowflake IDs (timestamp + machine ID + sequence)', score: 100, feedback: 'Perfect! Snowflake IDs are globally unique, time-sortable, and generated without coordination.' },
              { id: 'd', text: 'Hash of tweet content', score: 20, feedback: 'Same content = same ID. Wouldn\'t work for retweets or similar tweets.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'Twitter invented Snowflake IDs: 64 bits = timestamp (41) + datacenter (5) + machine (5) + sequence (12). They\'re globally unique without coordination, roughly time-sorted (newest tweets have larger IDs), and fit in a BIGINT.',
            hints: JSON.stringify(['Think about distributed ID generation', 'Consider the benefits of time-sortable IDs']),
            xpValue: 25,
            orderIndex: 4,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Trending Topics**

Design the system for detecting and displaying trending hashtags:
- How do you count hashtag usage in real-time?
- How do you define "trending" (not just popular)?
- How do you prevent gaming/spam?
- How do you personalize trends by location?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Trending detection requires real-time stream processing and anomaly detection, not just simple counting.',
            hints: JSON.stringify(['Trending = sudden increase, not just high volume', 'Think about time windows and rate of change']),
            sampleSolution: `**Trending Topics System:**

**1. Real-time Counting:**
\`\`\`
Tweet posted with #WorldCup
    ↓
Stream processor (Kafka + Flink)
    ↓
Count by time window:
  - Last 1 minute
  - Last 10 minutes  
  - Last 1 hour
    ↓
Store in Redis:
  hashtag:worldcup:count:1m = 50000
  hashtag:worldcup:count:10m = 300000
  hashtag:worldcup:count:1h = 1000000
\`\`\`

**2. Trending Algorithm (Velocity-based):**
\`\`\`python
def is_trending(hashtag):
    current_rate = count_last_10min / 10
    baseline_rate = count_last_hour / 60
    
    velocity = current_rate / baseline_rate
    
    # Trending if:
    # - Rate increased significantly (velocity > 2x)
    # - Minimum volume threshold met
    # - Not already trending for too long
    
    return (
        velocity > 2.0 and
        count_last_10min > 1000 and
        not been_trending_over_24h(hashtag)
    )
\`\`\`

**3. Anti-spam/Gaming:**
\`\`\`
Filters:
- Same user can only contribute 1 count per hashtag per hour
- New accounts (< 7 days) weighted lower
- Accounts with spam flags excluded
- Detect coordinated campaigns (same time, similar content)
- ML model for bot detection
\`\`\`

**4. Location-based Trends:**
\`\`\`
Count by location:
  hashtag:worldcup:count:US = 100000
  hashtag:worldcup:count:UK = 50000
  hashtag:worldcup:count:BR = 200000

Show trends for:
  1. User's city
  2. User's country  
  3. Worldwide

Each has separate trending calculation
\`\`\`

**Architecture:**
\`\`\`
Tweets → Kafka → Flink (count + aggregate)
                    ↓
              Redis (counts by window, location)
                    ↓
              Trends API → Client
                    ↓
              Background job: decay old trends
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described real-time counting mechanism',
              'Defined trending as velocity/acceleration not just volume',
              'Addressed spam/gaming prevention',
              'Mentioned location-based trending'
            ]),
            xpValue: 35,
            orderIndex: 5,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 14: DESIGN NETFLIX
  // ============================================
  {
    title: 'Design Netflix',
    slug: 'design-netflix',
    description: 'Design a video streaming platform with content delivery, adaptive streaming, recommendations, and global scale.',
    difficulty: 'advanced',
    orderIndex: 41,
    icon: '🎬',
    colorTheme: '#e50914',
    lessons: [
      {
        title: 'Video Streaming Architecture',
        slug: 'video-streaming-architecture',
        storyContent: `🎬 NETFLIX SYSTEM DESIGN

"Design Netflix."

Requirements:
- Stream video to 200M+ subscribers
- Support multiple devices (TV, mobile, web)
- Adaptive quality based on network
- Global availability with low latency
- Content catalog with 15,000+ titles

This is a complex distributed system. Let's tackle it piece by piece.`,
        orderIndex: 1,
        xpReward: 170,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Video Encoding Pipeline**

When Netflix acquires a new movie, it needs to be prepared for streaming. Design the video encoding pipeline:
- What formats/resolutions are needed?
- How long does encoding take?
- How do you handle different devices?
- How much storage per title?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Video encoding is a crucial offline process that prepares content for efficient streaming across all devices and network conditions.',
            hints: JSON.stringify(['Think about the variety of devices and network speeds', 'Consider different codecs for different devices']),
            sampleSolution: `**Video Encoding Pipeline:**

**1. Encoding Profiles:**
\`\`\`
Single source file (4K master) gets encoded to:

Resolution  Bitrate    Codec       Use Case
─────────────────────────────────────────────
4K (2160p)  15 Mbps    HEVC/H.265  Smart TVs
1080p       5 Mbps     H.264       Desktop, Console
720p        3 Mbps     H.264       Tablet, good mobile
480p        1.5 Mbps   H.264       Mobile, slow network
360p        0.5 Mbps   H.264       Very slow network
Audio       192 kbps   AAC         All devices
Audio       640 kbps   Dolby       High-end devices
\`\`\`

**2. Encoding Process:**
\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Ingest     │────▶│  Transcode  │────▶│   Package   │
│  (Upload)   │     │  (FFmpeg)   │     │  (HLS/DASH) │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ↓
                   ┌─────────────┐
                   │  Quality    │
                   │  Analysis   │
                   └─────────────┘

Time: 4-8 hours for a 2-hour movie (parallelized)
\`\`\`

**3. Per-Scene Encoding (Netflix Innovation):**
\`\`\`
Instead of fixed bitrate:
- Analyze each scene's complexity
- Action scenes: Higher bitrate
- Dark/static scenes: Lower bitrate
- Result: Better quality at same file size
\`\`\`

**4. Storage per Title:**
\`\`\`
2-hour movie:
- 4K:    ~15 GB
- 1080p: ~5 GB
- 720p:  ~2 GB  
- 480p:  ~1 GB
- 360p:  ~0.5 GB
- Audio: ~0.5 GB (multiple languages)

Total: ~25-30 GB per title × 15,000 titles = ~400 TB
(Plus subtitles, multiple audio tracks, HDR versions)
\`\`\`

**5. Output Format (HLS/DASH):**
\`\`\`
Split into small segments (2-10 seconds):
  video_1080p_segment001.ts
  video_1080p_segment002.ts
  ...

Manifest file lists all qualities and segments:
  - Allows adaptive bitrate switching
  - Client can switch quality per segment
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Listed multiple encoding profiles/resolutions',
              'Mentioned adaptive bitrate preparation',
              'Discussed segmentation for streaming',
              'Provided storage estimation'
            ]),
            xpValue: 35,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `Netflix uses Open Connect, their own CDN, instead of commercial CDNs. Why?`,
            options: JSON.stringify([
              { id: 'a', text: 'Commercial CDNs don\'t support video streaming', feedback: 'Incorrect, CDNs like Akamai and CloudFront handle video streaming well.' },
              { id: 'b', text: 'To reduce costs and have full control at Netflix scale', feedback: 'Correct! At Netflix scale (15%+ of internet traffic), building their own CDN with servers inside ISPs is more cost-effective and gives them full control over performance.' },
              { id: 'c', text: 'To encrypt content that CDNs can\'t handle', feedback: 'DRM and encryption work fine with commercial CDNs.' },
              { id: 'd', text: 'Because CDNs only work in the US', feedback: 'Commercial CDNs are global.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Open Connect places Netflix servers directly inside ISPs. At Netflix\'s scale (15%+ of global internet traffic during peak), this is more cost-effective than paying CDN providers. It also reduces latency and gives Netflix full control over the viewing experience.',
            hints: JSON.stringify(['Think about Netflix\'s massive scale', 'Consider the economics of bandwidth at that volume']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Adaptive Bitrate Streaming**

Users have varying network conditions. Design the adaptive streaming system:
- How does the client decide which quality to request?
- How do you handle quality switches smoothly?
- What happens when network drops suddenly?
- How do you measure and predict bandwidth?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Adaptive bitrate streaming dynamically adjusts video quality to match network conditions for smooth playback.',
            hints: JSON.stringify(['Think about how the client knows its bandwidth', 'Consider the tradeoff between quality and buffering']),
            sampleSolution: `**Adaptive Bitrate Streaming:**

**1. How It Works:**
\`\`\`
Client requests manifest file
  ↓
Manifest lists available qualities:
  - 4K:    15 Mbps
  - 1080p: 5 Mbps
  - 720p:  3 Mbps
  - 480p:  1.5 Mbps
  ↓
Client measures bandwidth
  ↓
Client requests appropriate quality segment
  ↓
Repeat for each segment (every 2-10 seconds)
\`\`\`

**2. Quality Selection Algorithm:**
\`\`\`python
def select_quality(available_bitrates, metrics):
    estimated_bandwidth = metrics.bandwidth_estimate
    buffer_level = metrics.buffer_seconds
    
    # Safety margin (don't use 100% of bandwidth)
    safe_bandwidth = estimated_bandwidth * 0.8
    
    # Buffer-based adjustment
    if buffer_level < 5:
        # Low buffer, be conservative
        safe_bandwidth *= 0.7
    elif buffer_level > 30:
        # High buffer, can be aggressive
        safe_bandwidth *= 1.2
    
    # Select highest quality under safe bandwidth
    for bitrate in sorted(available_bitrates, reverse=True):
        if bitrate <= safe_bandwidth:
            return bitrate
    
    return min(available_bitrates)  # Fallback to lowest
\`\`\`

**3. Smooth Quality Switching:**
\`\`\`
Problem: Jumping 4K → 480p is jarring

Solutions:
- Gradual steps: 4K → 1080p → 720p (not direct to 480)
- Hysteresis: Don't switch back up immediately
- Longer buffer: More time to recover before downgrading
\`\`\`

**4. Handling Network Drops:**
\`\`\`
Network suddenly drops:
  1. Continue playing from buffer (30-60 seconds)
  2. Immediately request lowest quality
  3. Gradually probe higher qualities
  4. If buffer depletes, show loading spinner
  
Netflix targets:
  - < 0.1% of sessions with rebuffering
  - Buffer health is critical metric
\`\`\`

**5. Bandwidth Estimation:**
\`\`\`
Methods:
1. Download time measurement:
   bandwidth = segment_size / download_time

2. Exponential moving average:
   new_estimate = 0.7 * old_estimate + 0.3 * latest_sample

3. Consider variance (unstable = be conservative)

4. Cross-session learning:
   Remember typical bandwidth for this network
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Explained segment-based quality selection',
              'Described bandwidth estimation method',
              'Addressed smooth switching strategy',
              'Mentioned buffer management'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Recommendation System**

Netflix says 80% of watched content comes from recommendations. Design the recommendation system:
- What data do you use for recommendations?
- How do you handle the cold start problem?
- How do you balance exploration vs exploitation?
- How do you personalize thumbnails?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Netflix\'s recommendation system is a key competitive advantage, combining collaborative filtering, content-based filtering, and deep learning.',
            hints: JSON.stringify(['Think about explicit signals (ratings) vs implicit (watch time)', 'Consider how to recommend to new users']),
            sampleSolution: `**Netflix Recommendation System:**

**1. Data Sources:**
\`\`\`
Explicit signals:
- Thumbs up/down ratings
- My List additions
- Search queries

Implicit signals:
- Watch history (what, when, how long)
- Completion rate (watched 10% vs 90%)
- Rewatch behavior
- Time of day patterns
- Device type
- Pause/rewind patterns

Content metadata:
- Genre, actors, director
- Mood, themes, pace
- Netflix-tagged attributes (1000+ tags per title)
\`\`\`

**2. Recommendation Approaches:**
\`\`\`
Collaborative Filtering:
"Users who watched X also watched Y"
- Matrix factorization
- Find similar users, recommend their favorites

Content-Based:
"You watched action movies, here are more action movies"
- Feature similarity
- Genre, cast, director matching

Hybrid (Netflix uses):
- Combine both approaches
- Deep learning models
- Contextual bandits for ranking
\`\`\`

**3. Cold Start Solutions:**
\`\`\`
New User:
1. Onboarding quiz: "Pick 3 shows you like"
2. Demographic-based initial recommendations
3. Popular/trending content
4. Quick feedback loop: "Not interested" button

New Content:
1. Use metadata similarity
2. A/B test with small user group
3. Promote to relevant micro-segments
\`\`\`

**4. Exploration vs Exploitation:**
\`\`\`
Exploitation: Show what we know user likes
Exploration: Show diverse content to learn preferences

Balance:
- 80% exploitation (safe recommendations)
- 20% exploration (discover new tastes)

Multi-armed bandit approach:
- Track click-through rate per recommendation
- Allocate more slots to high performers
- Keep testing new options
\`\`\`

**5. Personalized Thumbnails:**
\`\`\`
Same movie, different thumbnails:
- Romance viewer: Shows couple embracing
- Action viewer: Shows explosion scene
- Comedy viewer: Shows funny moment

System:
1. Generate 9-12 thumbnail candidates per title
2. Tag each (romance, action, face, etc.)
3. Predict which thumbnail user will click
4. A/B test to validate
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Listed multiple data sources for recommendations',
              'Described collaborative and content-based filtering',
              'Addressed cold start problem',
              'Mentioned personalized artwork/thumbnails'
            ]),
            xpValue: 35,
            orderIndex: 4,
          },
          {
            type: 'trade_off',
            scenarioText: `Netflix needs to decide where to cache content. Limited server capacity at each ISP location. What should be cached?`,
            options: JSON.stringify([
              { id: 'a', text: 'Cache all content everywhere', score: 30, feedback: 'Not feasible - Netflix has petabytes of content, can\'t fit everywhere.' },
              { id: 'b', text: 'Cache only new releases', score: 50, feedback: 'New releases are popular but the long tail matters too. Miss popular older content.' },
              { id: 'c', text: 'Predictive caching: Popular content + ML-predicted demand per region', score: 95, feedback: 'Perfect! Cache popular content plus predicted demand based on regional preferences and upcoming promotions.' },
              { id: 'd', text: 'Random sampling of content', score: 20, feedback: 'Wastes cache space on rarely-watched content.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'Netflix uses predictive caching: analyze viewing patterns per region, predict what will be watched (new seasons, promoted content, regional preferences), and pre-position that content. They fill Open Connect boxes nightly during off-peak hours.',
            hints: JSON.stringify(['Think about regional differences in preferences', 'Consider that Netflix knows what they\'re going to promote']),
            xpValue: 25,
            orderIndex: 5,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 15: DESIGN UBER
  // ============================================
  {
    title: 'Design Uber',
    slug: 'design-uber',
    description: 'Design a ride-hailing platform with real-time matching, location tracking, ETA calculation, and surge pricing.',
    difficulty: 'advanced',
    orderIndex: 42,
    icon: '🚗',
    colorTheme: '#000000',
    lessons: [
      {
        title: 'Ride-Hailing Core Systems',
        slug: 'ride-hailing-core',
        storyContent: `🚗 UBER SYSTEM DESIGN

"Design Uber."

Requirements:
- Match riders with nearby drivers in real-time
- Track driver locations continuously
- Calculate accurate ETAs
- Handle surge pricing during high demand
- Scale: 20M rides per day globally

Real-time location at massive scale. Let's design it.`,
        orderIndex: 1,
        xpReward: 170,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Location Tracking**

Drivers send location updates every few seconds. Design the location tracking system:
- How often should drivers send updates?
- How do you store and query driver locations?
- How do you find drivers near a pickup point?
- What data structure enables efficient geo-queries?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Real-time location tracking at scale requires efficient spatial indexing and careful update frequency tradeoffs.',
            hints: JSON.stringify(['Think about geospatial indexes', 'Consider the tradeoff between update frequency and battery/bandwidth']),
            sampleSolution: `**Location Tracking System:**

**1. Update Frequency:**
\`\`\`
When driver is:
- Available, stationary: Every 30 seconds
- Available, moving: Every 4-5 seconds
- On trip: Every 2-3 seconds (rider wants real-time)

Adaptive: More frequent during active state
Battery impact: ~5% per hour during active driving
\`\`\`

**2. Location Data:**
\`\`\`json
{
  "driver_id": "driver_123",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "heading": 45,          // Direction of travel
  "speed": 25,            // mph
  "status": "available",  // available, on_trip, offline
  "vehicle_type": "uberx"
}
\`\`\`

**3. Spatial Indexing (Geohash/S2/H3):**
\`\`\`
Geohash divides world into grid cells:
  
  9q8y = San Francisco area
  9q8yh = Smaller area within SF
  9q8yhv = Even smaller (street level)

Driver at (37.7749, -122.4194) → geohash: 9q8yyz

Store in Redis:
  KEY: drivers:available:9q8y
  VALUE: Set of driver_ids in this cell
  
Finding nearby drivers:
  1. Get geohash of pickup point
  2. Query this cell + 8 surrounding cells
  3. Calculate exact distances
  4. Return closest N drivers
\`\`\`

**4. Architecture:**
\`\`\`
Driver App → Location Service → Redis Cluster
                    ↓
              Kafka (for analytics/history)
                    ↓
              PostgreSQL (trip history)

Redis structure:
  drivers:available:{geohash} = {driver_ids}
  driver:{id}:location = {lat, lng, timestamp}
  
TTL: 1 minute (auto-expire if no update)
\`\`\`

**5. Query: "Find drivers within 2km"**
\`\`\`python
def find_nearby_drivers(pickup_lat, pickup_lng, radius_km=2):
    # Get geohash at appropriate precision
    center_hash = geohash.encode(pickup_lat, pickup_lng, precision=6)
    
    # Get 9 cells (center + 8 neighbors)
    cells = geohash.neighbors(center_hash) + [center_hash]
    
    # Get all drivers in these cells
    candidates = []
    for cell in cells:
        candidates += redis.smembers(f"drivers:available:{cell}")
    
    # Filter by exact distance
    nearby = []
    for driver_id in candidates:
        driver_loc = redis.hgetall(f"driver:{driver_id}:location")
        dist = haversine_distance(pickup_lat, pickup_lng, 
                                   driver_loc.lat, driver_loc.lng)
        if dist <= radius_km:
            nearby.append((driver_id, dist))
    
    return sorted(nearby, key=lambda x: x[1])[:10]  # Top 10 closest
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Defined update frequency with reasoning',
              'Explained geospatial indexing (geohash/S2/H3)',
              'Showed nearby driver query approach',
              'Mentioned Redis or similar for real-time storage'
            ]),
            xpValue: 40,
            orderIndex: 1,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Ride Matching**

A rider requests a ride. Design the matching algorithm:
- How do you select which driver to send the request?
- What if the driver doesn't accept?
- How do you handle multiple concurrent requests?
- How do you optimize for rider wait time AND driver earnings?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Ride matching is a real-time optimization problem balancing multiple objectives.',
            hints: JSON.stringify(['Closest isn\'t always best (driver heading wrong direction)', 'Think about fairness for drivers']),
            sampleSolution: `**Ride Matching Algorithm:**

**1. Basic Matching Flow:**
\`\`\`
Rider requests ride
    ↓
Find available drivers within radius
    ↓
Score each driver
    ↓
Send request to best match
    ↓
Driver has 15 seconds to accept
    ↓
If declined/timeout → Next best driver
    ↓
If accepted → Create trip
\`\`\`

**2. Driver Scoring:**
\`\`\`python
def score_driver(driver, pickup, dropoff):
    score = 0
    
    # Distance to pickup (lower is better)
    pickup_dist = distance(driver.location, pickup)
    score -= pickup_dist * 10  # -10 points per km
    
    # ETA (accounts for traffic, heading)
    eta = calculate_eta(driver.location, pickup)
    score -= eta * 2  # -2 points per minute
    
    # Driver heading toward pickup
    if heading_toward(driver.heading, pickup):
        score += 20
    
    # Driver rating
    score += driver.rating * 5  # +5 per star
    
    # Fairness: Time since last ride
    idle_minutes = now() - driver.last_trip_end
    score += min(idle_minutes, 30)  # Cap at 30 points
    
    # Vehicle type match
    if driver.vehicle_type == requested_type:
        score += 50
    
    return score
\`\`\`

**3. Handling No Accept:**
\`\`\`
Request timeout (15 sec):
  1. Mark driver as "slow to accept"
  2. Send to next best driver
  3. Expand search radius if needed
  4. After 3 failures: "No drivers available"

Driver declined:
  1. Track decline reason (if provided)
  2. Don't penalize for legitimate declines
  3. May reduce their trip volume if pattern emerges
\`\`\`

**4. Concurrent Requests (Batching):**
\`\`\`
Multiple requests in same area:

Naive: Assign closest driver to each → Suboptimal

Better: Batch matching every 2 seconds
  - Collect all requests in window
  - Collect all available drivers
  - Solve assignment problem (minimize total wait time)
  - Hungarian algorithm or similar
  
Result: Better overall efficiency
\`\`\`

**5. Balancing Objectives:**
\`\`\`
Trade-offs:
- Rider wants: Fastest pickup
- Driver wants: Profitable trips (not driving far for pickup)
- Platform wants: Maximize completed trips

Solution:
- Weight scoring based on market conditions
- During shortage: Accept longer pickups
- During surplus: Prioritize rider experience
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described multi-factor scoring beyond just distance',
              'Handled driver decline/timeout scenario',
              'Mentioned batching for concurrent requests',
              'Discussed balancing rider and driver interests'
            ]),
            xpValue: 40,
            orderIndex: 2,
          },
          {
            type: 'multiple_choice',
            scenarioText: `Uber needs to calculate ETA from driver to pickup. What data is needed for accurate ETAs?`,
            options: JSON.stringify([
              { id: 'a', text: 'Just straight-line distance', feedback: 'Roads aren\'t straight. This would severely underestimate ETAs.' },
              { id: 'b', text: 'Road network distance only', feedback: 'Better but misses traffic conditions which can 2-3x the time.' },
              { id: 'c', text: 'Road network + real-time traffic + historical patterns', feedback: 'Correct! Accurate ETAs need routing, current traffic, and historical patterns for that time/day.' },
              { id: 'd', text: 'Ask the driver to estimate', feedback: 'Not scalable or consistent. Automated calculation is needed.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'Accurate ETAs require: 1) Road network graph for routing, 2) Real-time traffic data (from driver GPS, Google, etc.), 3) Historical patterns (rush hour Tuesdays is different from Sunday morning). Uber uses all of these plus ML to predict ETAs within 1-2 minutes accuracy.',
            hints: JSON.stringify(['Think about what affects drive time', 'Consider how traffic varies by time of day']),
            xpValue: 20,
            orderIndex: 3,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Surge Pricing**

During high demand (concerts, rain, holidays), prices increase. Design the surge pricing system:
- How do you detect when surge is needed?
- How do you calculate the surge multiplier?
- How do you display surge to users fairly?
- How do you prevent oscillation (surge on/off rapidly)?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Surge pricing balances supply and demand in real-time, but must be implemented carefully to maintain user trust.',
            hints: JSON.stringify(['Think about supply vs demand signals', 'Consider how surge incentivizes more drivers']),
            sampleSolution: `**Surge Pricing System:**

**1. Detecting Surge Conditions:**
\`\`\`
Divide city into hexagonal zones (H3 cells)

Per zone, calculate every minute:
  demand = ride_requests_last_5min
  supply = available_drivers_in_zone
  
  ratio = demand / supply

Thresholds:
  ratio < 1.5 → No surge (1.0x)
  ratio 1.5-2.0 → Light surge (1.2-1.5x)
  ratio 2.0-3.0 → Moderate surge (1.5-2.0x)
  ratio > 3.0 → High surge (2.0-3.0x)
\`\`\`

**2. Surge Multiplier Calculation:**
\`\`\`python
def calculate_surge(zone_id):
    # Get supply/demand
    demand = get_request_count(zone_id, last_5_min)
    supply = get_available_drivers(zone_id)
    
    if supply == 0:
        return 3.0  # Max surge
    
    ratio = demand / supply
    
    # Smooth curve, not harsh steps
    if ratio <= 1.0:
        return 1.0
    elif ratio <= 2.0:
        return 1.0 + (ratio - 1.0) * 0.5  # 1.0 to 1.5
    elif ratio <= 4.0:
        return 1.5 + (ratio - 2.0) * 0.5  # 1.5 to 2.5
    else:
        return min(3.0, 1.5 + ratio * 0.3)  # Cap at 3.0
\`\`\`

**3. User Communication:**
\`\`\`
- Show surge multiplier BEFORE requesting
- Explain why: "High demand in your area"
- Show estimate: "$25-30 (normally $15-20)"
- Require confirmation for high surge (>2x)
- Option: "Notify when surge drops"
\`\`\`

**4. Preventing Oscillation:**
\`\`\`
Problem: Surge → Riders wait → Demand drops → 
         Surge ends → Everyone requests → Surge again

Solutions:
1. Hysteresis: 
   - Surge activates at ratio > 2.0
   - Surge deactivates at ratio < 1.5
   - Gap prevents rapid on/off

2. Smoothing:
   new_surge = 0.7 * current_surge + 0.3 * calculated_surge
   
3. Minimum duration:
   Once surge starts, minimum 5 minutes
   
4. Gradual ramp down:
   Don't drop from 2.5x to 1.0x instantly
   Step down: 2.5 → 2.0 → 1.5 → 1.0
\`\`\`

**5. Driver Incentives:**
\`\`\`
Surge zones shown on driver map:
  "Demand is high in Downtown - head there!"
  
Higher earnings attract drivers:
  - From nearby non-surge areas
  - Off-duty drivers come online
  
Result: Supply increases, surge naturally decreases
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Defined supply/demand metrics for surge detection',
              'Showed multiplier calculation logic',
              'Addressed user transparency',
              'Mentioned oscillation prevention'
            ]),
            xpValue: 35,
            orderIndex: 4,
          },
          {
            type: 'trade_off',
            scenarioText: `For the dispatch system (matching riders to drivers), should you use push or pull model?`,
            options: JSON.stringify([
              { id: 'a', text: 'Push: Server sends ride request to selected driver', score: 90, feedback: 'Correct! Push allows the server to make optimal matches. Driver app receives notification, doesn\'t need to poll.' },
              { id: 'b', text: 'Pull: Driver app polls for available rides', score: 40, feedback: 'Inefficient and creates race conditions. Multiple drivers might try to accept the same ride.' },
              { id: 'c', text: 'Broadcast: Send all requests to all nearby drivers, first to accept wins', score: 50, feedback: 'Creates unfair "fastest finger" competition and network waste. Server should choose the best driver.' },
              { id: 'd', text: 'Let riders choose from a list of nearby drivers', score: 30, feedback: 'Slow UX and doesn\'t optimize for system efficiency.' },
            ]),
            correctAnswer: JSON.stringify('a'),
            explanation: 'Push model is optimal: server calculates best match using all information (location, ratings, fairness), then pushes the request to that specific driver. This enables intelligent matching and avoids race conditions of multiple drivers trying to accept the same ride.',
            hints: JSON.stringify(['Think about who has the most information for matching', 'Consider race conditions with pull/broadcast']),
            xpValue: 25,
            orderIndex: 5,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 16: DESIGN WHATSAPP
  // ============================================
  {
    title: 'Design WhatsApp',
    slug: 'design-whatsapp',
    description: 'Design an instant messaging platform with real-time delivery, group chats, media sharing, and end-to-end encryption.',
    difficulty: 'advanced',
    orderIndex: 43,
    icon: '💬',
    colorTheme: '#25d366',
    lessons: [
      {
        title: 'Messaging System Architecture',
        slug: 'messaging-architecture',
        storyContent: `💬 WHATSAPP SYSTEM DESIGN

"Design WhatsApp."

Requirements:
- 1-on-1 and group messaging
- Real-time message delivery
- Offline message support
- Read receipts and typing indicators
- End-to-end encryption
- Scale: 2B users, 100B messages/day

Real-time, reliable, secure messaging. Let's build it.`,
        orderIndex: 1,
        xpReward: 170,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Message Delivery**

Design the message delivery flow:
- How does a message get from sender to receiver?
- How do you handle offline users?
- How do you implement delivery and read receipts?
- How do you ensure messages aren't lost?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Message delivery requires handling both online and offline scenarios with guaranteed delivery.',
            hints: JSON.stringify(['Think about WebSocket for online users', 'Consider what happens when recipient is offline']),
            sampleSolution: `**Message Delivery System:**

**1. Online Message Flow:**
\`\`\`
Sender → WebSocket → Chat Server → Recipient's WebSocket
                         ↓
                    Message Store (persist)

Steps:
1. Sender sends message via WebSocket
2. Server assigns message_id, timestamp
3. Server persists to database
4. Server looks up recipient's connection
5. If online: Push via WebSocket
6. Send delivery receipt to sender
\`\`\`

**2. Offline Message Handling:**
\`\`\`
Recipient offline:
1. Message stored in "pending_messages" queue
2. Sender gets "sent" status (single check ✓)

When recipient comes online:
1. Pull all pending messages
2. Deliver via WebSocket
3. Clear from pending queue
4. Send delivery receipts (double check ✓✓)
\`\`\`

**3. Message Storage:**
\`\`\`sql
-- Messages table (sharded by conversation_id)
CREATE TABLE messages (
  message_id BIGINT PRIMARY KEY,
  conversation_id BIGINT,
  sender_id BIGINT,
  content BLOB,  -- Encrypted
  message_type ENUM('text', 'image', 'video'),
  created_at TIMESTAMP,
  INDEX idx_conv_time (conversation_id, created_at)
);

-- Pending messages (for offline delivery)
CREATE TABLE pending_messages (
  recipient_id BIGINT,
  message_id BIGINT,
  created_at TIMESTAMP,
  PRIMARY KEY (recipient_id, message_id)
);
\`\`\`

**4. Receipts System:**
\`\`\`
Message states:
- Sent (✓): Server received
- Delivered (✓✓): Recipient device received
- Read (✓✓ blue): Recipient opened chat

Flow:
1. Message sent → Server ACKs → Show ✓
2. Recipient receives → Server notifies sender → Show ✓✓
3. Recipient opens chat → Send read receipt → Show ✓✓ blue

For groups:
- Show ✓✓ when ALL members received
- Or show individual receipt counts
\`\`\`

**5. Guaranteed Delivery:**
\`\`\`
Challenges:
- Server might crash
- Network might fail
- Messages must never be lost

Solutions:
1. Write-ahead logging before ACK
2. Persist before forwarding
3. Client retries on no ACK
4. Idempotency with message_id
5. At-least-once delivery, client dedupes
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described online delivery via WebSocket',
              'Explained offline message queuing',
              'Detailed receipt states (sent, delivered, read)',
              'Mentioned durability/reliability mechanisms'
            ]),
            xpValue: 40,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `WhatsApp needs to maintain WebSocket connections for 2 billion users. How do they handle this scale?`,
            options: JSON.stringify([
              { id: 'a', text: 'One mega-server with 2 billion connections', feedback: 'Impossible. No single server can handle billions of connections.' },
              { id: 'b', text: 'Connection servers sharded by user ID, gateway routes messages', feedback: 'Correct! Users connect to one of many chat servers. A gateway layer routes messages between servers based on recipient\'s server.' },
              { id: 'c', text: 'Each user runs their own server', feedback: 'Not practical for a messaging app.' },
              { id: 'd', text: 'Use only HTTP polling, no WebSockets', feedback: 'Polling at 2B users would be extremely inefficient. WebSockets are essential for real-time.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'WhatsApp uses a distributed architecture: hundreds of chat servers, each handling millions of WebSocket connections. A routing layer tracks which server each user is connected to and forwards messages accordingly. Consistent hashing or a presence service handles user-to-server mapping.',
            hints: JSON.stringify(['Think about horizontal scaling', 'Consider how to route messages between servers']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Group Messaging**

Design the group chat system:
- How do you store group membership?
- How do you send a message to a 256-member group?
- How do you handle group joins/leaves?
- How do you sync group history for new members?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Group messaging introduces challenges of fan-out and membership synchronization.',
            hints: JSON.stringify(['Think about fan-out to all group members', 'Consider what new members should see']),
            sampleSolution: `**Group Chat System:**

**1. Group Data Model:**
\`\`\`json
{
  "group_id": "group_123",
  "name": "Family Group",
  "created_by": "user_1",
  "created_at": "2024-01-15",
  "members": ["user_1", "user_2", ..., "user_256"],
  "admins": ["user_1"],
  "settings": {
    "only_admins_can_post": false,
    "only_admins_can_edit": true
  }
}
\`\`\`

**2. Sending Group Message:**
\`\`\`
Sender sends message to group_123
    ↓
Server looks up group members
    ↓
Fan-out to each member:
  - If online: Push via WebSocket
  - If offline: Add to pending queue
    ↓
Store single copy with group_id
  (Don't duplicate per member)
\`\`\`

**3. Efficient Fan-out:**
\`\`\`python
def send_group_message(group_id, sender_id, message):
    # Get members
    members = get_group_members(group_id)
    
    # Store message once
    msg_id = store_message(group_id, sender_id, message)
    
    # Fan-out asynchronously
    for member_id in members:
        if member_id == sender_id:
            continue
            
        # Queue for async processing
        queue.publish({
            "type": "deliver_message",
            "recipient": member_id,
            "message_id": msg_id
        })
    
    return msg_id
\`\`\`

**4. Member Changes:**
\`\`\`
User joins:
1. Add to members list
2. Send "user_X joined" system message
3. Sync message history (last 100 messages or last 7 days)

User leaves:
1. Remove from members list
2. Send "user_X left" system message
3. User keeps their copy of history

Admin removes user:
1. Remove from members list
2. Send "user_X was removed" system message
\`\`\`

**5. History Sync:**
\`\`\`
New member joins:
1. DON'T send old messages (privacy)
2. They see messages from join time forward
3. Optional: "X messages before you joined" indicator

Existing member gets new device:
1. Encrypted backup in cloud
2. Download and decrypt on new device
3. Or: Server stores last N messages per conversation
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described group membership storage',
              'Explained fan-out mechanism for delivery',
              'Handled member join/leave scenarios',
              'Addressed history sync considerations'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: End-to-End Encryption**

WhatsApp uses end-to-end encryption. Design the encryption system:
- How are keys generated and exchanged?
- How do you encrypt messages only the recipient can read?
- How do you handle group encryption?
- What happens when a user gets a new phone?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'E2E encryption ensures even WhatsApp servers cannot read message content.',
            hints: JSON.stringify(['Think about public/private key pairs', 'Consider the Signal Protocol']),
            sampleSolution: `**End-to-End Encryption:**

**1. Key Generation (Signal Protocol):**
\`\`\`
Each user generates:
- Identity Key Pair (long-term)
- Signed Pre-Key (medium-term)
- One-Time Pre-Keys (ephemeral)

Public keys uploaded to server
Private keys NEVER leave device
\`\`\`

**2. Session Establishment:**
\`\`\`
Alice wants to message Bob (first time):

1. Alice downloads Bob's public keys from server:
   - Identity Key
   - Signed Pre-Key
   - One-Time Pre-Key

2. Alice performs X3DH key agreement:
   - Combines her keys with Bob's keys
   - Derives shared secret (both get same secret)

3. Alice encrypts message with shared secret
4. Alice sends encrypted message + her public key

5. Bob receives, derives same shared secret
6. Bob decrypts message

Server NEVER has the shared secret
\`\`\`

**3. Message Encryption:**
\`\`\`
Each message:
1. Derive message key from chain (Double Ratchet)
2. Encrypt: AES-256 + HMAC
3. Send encrypted blob

Key changes every message (forward secrecy):
- Compromised key only affects one message
- Past messages remain secure
\`\`\`

**4. Group Encryption:**
\`\`\`
Naive: N*(N-1) encrypted copies
Problem: Doesn't scale for 256 members

Solution: Sender Keys
1. Each member generates "sender key"
2. Shares sender key with all members (encrypted)
3. Messages encrypted with sender key
4. Only ONE copy sent to server
5. Each member decrypts with sender key

When member leaves:
- Generate new sender keys
- Leaving member can't read future messages
\`\`\`

**5. New Device:**
\`\`\`
Scenario: User gets new phone

Option 1: Lost history
- New keys generated
- Old messages unreadable
- Fresh start

Option 2: Encrypted backup (WhatsApp's approach)
- Backup encrypted with user password
- Stored in Google Drive / iCloud
- Restore on new device with password
- Keys regenerated, new sessions established

Security notification:
"Bob's security code changed"
(Key changed, verify if concerned)
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Explained key pair generation',
              'Described key exchange for session setup',
              'Addressed group encryption (sender keys)',
              'Handled new device scenario'
            ]),
            xpValue: 40,
            orderIndex: 4,
          },
          {
            type: 'trade_off',
            scenarioText: `WhatsApp needs to sync messages across multiple devices (phone + web). How should this work with E2E encryption?`,
            options: JSON.stringify([
              { id: 'a', text: 'Server decrypts and re-encrypts for each device', score: 10, feedback: 'Defeats the purpose of E2E encryption. Server would have access to messages.' },
              { id: 'b', text: 'Phone is primary, web mirrors via local connection', score: 80, feedback: 'WhatsApp\'s current approach! Web connects to phone via encrypted tunnel. Messages stay E2E encrypted.' },
              { id: 'c', text: 'Each device has separate keys, sender encrypts for all', score: 90, feedback: 'Multi-device E2E! Sender encrypts message separately for each of recipient\'s devices. More complex but truly independent devices.' },
              { id: 'd', text: 'Share private keys across devices', score: 30, feedback: 'Security risk. If one device is compromised, all devices are compromised.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'True multi-device E2E encryption requires encrypting messages for each device separately (each device has its own keys). WhatsApp historically used phone-as-primary (option B) but moved toward multi-device (option C). Signal uses multi-device E2E where each device is independent.',
            hints: JSON.stringify(['Think about what happens if server can\'t read messages', 'Consider how keys work per device']),
            xpValue: 25,
            orderIndex: 5,
          },
        ],
      },
    ],
  },
];
