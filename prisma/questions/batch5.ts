// Batch 5: 25 Questions covering more famous system design problems
// Topics: Design Instagram, Design YouTube, Design Dropbox, Design Google Docs, Design Ticketmaster

import { SeedModule } from './index';

export const batch5Modules: SeedModule[] = [
  // ============================================
  // MODULE 17: DESIGN INSTAGRAM
  // ============================================
  {
    title: 'Design Instagram',
    slug: 'design-instagram',
    description: 'Design a photo and video sharing platform with feeds, stories, explore, and social features at massive scale.',
    difficulty: 'advanced',
    orderIndex: 50,
    icon: '📸',
    colorTheme: '#e1306c',
    lessons: [
      {
        title: 'Instagram Core Systems',
        slug: 'instagram-core-systems',
        storyContent: `📸 INSTAGRAM SYSTEM DESIGN

"Design Instagram."

Requirements:
- Upload and share photos/videos
- Follow users and see their content in feed
- Stories (24-hour content)
- Explore page with personalized content
- Scale: 2B users, 500M daily active, 100M photos/day

Image-heavy social platform. Let's design it.`,
        orderIndex: 1,
        xpReward: 160,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Photo Upload & Storage**

Design the photo upload and storage system:
- How do you handle photo uploads?
- What sizes/formats do you store?
- How do you generate different resolutions?
- How do you serve photos efficiently globally?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Photo storage requires efficient processing pipelines and CDN distribution for fast global delivery.',
            hints: JSON.stringify(['Think about multiple resolutions for different devices', 'Consider async processing for uploads']),
            sampleSolution: `**Photo Upload & Storage:**

**1. Upload Flow:**
\`\`\`
Client uploads photo
    ↓
API Gateway (auth, rate limit)
    ↓
Upload Service
    ↓
Store original in S3 (cold storage)
    ↓
Queue for processing
    ↓
Image Processing Service:
  - Generate thumbnails
  - Multiple resolutions
  - Apply filters if selected
  - Extract metadata (EXIF)
    ↓
Store processed images in S3
    ↓
Update database with URLs
    ↓
Notify client: upload complete
\`\`\`

**2. Image Sizes Generated:**
\`\`\`
Per photo, generate:
- Thumbnail: 150x150 (grid view)
- Small: 320px wide (mobile feed)
- Medium: 640px wide (tablet)
- Large: 1080px wide (desktop)
- Original: preserved for download

Format: WebP (smaller) with JPEG fallback
\`\`\`

**3. Storage Estimation:**
\`\`\`
100M photos/day
Average sizes:
  - Original: 3MB
  - All thumbnails: ~1MB total

Per day: 100M × 4MB = 400TB/day
Per year: 400TB × 365 = 146PB/year

Storage tiers:
  - Hot (CDN + S3): Recent photos (30 days)
  - Warm (S3 IA): 30 days - 1 year
  - Cold (Glacier): Older than 1 year
\`\`\`

**4. Serving Photos (CDN):**
\`\`\`
Photo URL: https://cdn.instagram.com/p/{photo_id}/{size}.jpg

CDN Strategy:
- Edge caching for popular photos
- Regional origin servers
- Lazy loading with blur placeholder
- Progressive JPEG for fast preview

Request flow:
  Client → CDN Edge → (miss) → Origin → S3
              ↓
         Cache hit → Serve directly
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described upload processing pipeline',
              'Listed multiple image sizes/formats',
              'Provided storage estimation',
              'Mentioned CDN for global delivery'
            ]),
            xpValue: 35,
            orderIndex: 1,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: News Feed Generation**

Design the Instagram feed system:
- How do you generate a user's feed?
- How do you rank posts?
- How do you handle the cold start problem?
- How do you keep the feed fresh?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Feed generation combines content retrieval with ML-based ranking for engagement.',
            hints: JSON.stringify(['Think about pull vs push model', 'Consider ML ranking factors']),
            sampleSolution: `**Feed Generation System:**

**1. Feed Architecture (Pull-based with caching):**
\`\`\`
User opens app
    ↓
Request feed from Feed Service
    ↓
Check feed cache (Redis)
    ↓
If stale/empty:
  1. Get list of followed accounts
  2. Fetch recent posts from each (last 3 days)
  3. Score and rank posts
  4. Cache top 500 posts
  5. Return first 20
    ↓
If fresh:
  Return from cache
\`\`\`

**2. Ranking Algorithm:**
\`\`\`python
def score_post(post, user):
    score = 0
    
    # Recency (decay over time)
    hours_old = (now() - post.created_at).hours
    recency_score = 1 / (1 + hours_old * 0.1)
    score += recency_score * 100
    
    # Engagement
    score += post.likes * 0.1
    score += post.comments * 0.5
    score += post.shares * 1.0
    
    # Relationship strength
    interaction_score = get_interaction_score(user, post.author)
    score += interaction_score * 50
    
    # Content type preference
    if user.prefers_video and post.is_video:
        score += 20
    
    # ML model prediction
    engagement_prob = ml_model.predict(user, post)
    score += engagement_prob * 200
    
    return score
\`\`\`

**3. Cold Start (New User):**
\`\`\`
No follows yet:
1. Show popular/trending content
2. Content from suggested accounts
3. "People you may know" based on contacts
4. Onboarding: "Follow 5 accounts to personalize"

New followed account:
1. Include their recent posts immediately
2. Boost them initially, decay with normal engagement
\`\`\`

**4. Feed Freshness:**
\`\`\`
Real-time updates:
- WebSocket for new posts from close friends
- "New posts" pill when scroll position allows
- Don't interrupt mid-scroll

Background refresh:
- Rebuild feed cache every 5-15 minutes
- Incorporate new posts since last build
- Re-rank based on updated engagement
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Explained feed retrieval mechanism',
              'Described ranking factors',
              'Addressed cold start for new users',
              'Mentioned freshness/real-time updates'
            ]),
            xpValue: 35,
            orderIndex: 2,
          },
          {
            type: 'multiple_choice',
            scenarioText: `Instagram Stories disappear after 24 hours. How should you implement this expiration?`,
            options: JSON.stringify([
              { id: 'a', text: 'Cron job that runs every minute to delete expired stories', feedback: 'Inefficient. Scanning all stories every minute is wasteful.' },
              { id: 'b', text: 'Store expiry time, filter at read time, background cleanup job', feedback: 'Correct! Store stories with expiry timestamp, filter when fetching, and periodically clean up expired ones in background.' },
              { id: 'c', text: 'Use database TTL to auto-delete after 24 hours', feedback: 'Works for some databases but loses analytics data. Better to soft-delete and archive.' },
              { id: 'd', text: 'Let clients calculate and not show expired stories', feedback: 'Never trust clients for business logic. Server must enforce expiration.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Store stories with expires_at timestamp. When fetching, filter WHERE expires_at > NOW(). Run a background job to clean up or archive expired stories for analytics. This is efficient and maintains data for insights.',
            hints: JSON.stringify(['Think about read-time filtering vs batch deletion', 'Consider keeping data for analytics']),
            xpValue: 20,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `For Instagram's Explore page (discovering new content), what's the best approach?`,
            options: JSON.stringify([
              { id: 'a', text: 'Show random popular posts', score: 40, feedback: 'Random isn\'t personalized. Users see irrelevant content.' },
              { id: 'b', text: 'Collaborative filtering: "Users like you enjoyed..."', score: 75, feedback: 'Good approach but can create filter bubbles. Need diversity.' },
              { id: 'c', text: 'Hybrid: Personalized ML ranking + diversity injection + trending', score: 95, feedback: 'Perfect! Combine personalization with diversity. Mix in trending to surface new content.' },
              { id: 'd', text: 'Show posts from accounts with most followers', score: 30, feedback: 'Favors existing celebrities, doesn\'t surface new creators or personalize.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'Explore needs to balance personalization (content you\'ll like), diversity (not all same type), and discovery (new trending content). Instagram uses ML to predict engagement, but intentionally injects diverse content to avoid filter bubbles and help new creators get discovered.',
            hints: JSON.stringify(['Think about user engagement AND discovery', 'Consider the problem of filter bubbles']),
            xpValue: 25,
            orderIndex: 4,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 18: DESIGN YOUTUBE
  // ============================================
  {
    title: 'Design YouTube',
    slug: 'design-youtube',
    description: 'Design a video sharing platform with upload processing, streaming, recommendations, comments, and live streaming.',
    difficulty: 'advanced',
    orderIndex: 51,
    icon: '▶️',
    colorTheme: '#ff0000',
    lessons: [
      {
        title: 'YouTube Core Architecture',
        slug: 'youtube-core-architecture',
        storyContent: `▶️ YOUTUBE SYSTEM DESIGN

"Design YouTube."

Requirements:
- Video upload and processing
- Video streaming with quality selection
- Comments, likes, subscriptions
- Recommendations and search
- Live streaming
- Scale: 2B users, 1B hours watched/day

The world's largest video platform. Let's design it.`,
        orderIndex: 1,
        xpReward: 170,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Video Upload Processing**

A creator uploads a 4K, 2-hour video (50GB). Design the processing pipeline:
- How do you handle large file uploads?
- What processing is needed?
- How long should processing take?
- How do you handle failures mid-processing?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Video processing is a complex pipeline that must handle large files reliably and efficiently.',
            hints: JSON.stringify(['Think about chunked/resumable uploads', 'Consider parallel processing for speed']),
            sampleSolution: `**Video Upload Processing Pipeline:**

**1. Upload Handling (Large Files):**
\`\`\`
Resumable upload protocol:
1. Client requests upload URL
2. Server returns upload session ID
3. Client uploads in chunks (5-10MB each)
4. Each chunk acknowledged
5. If interrupted, resume from last chunk
6. Server assembles chunks

Why resumable:
- 50GB upload on flaky connection would fail
- Resume instead of restart
- Progress tracking
\`\`\`

**2. Processing Pipeline:**
\`\`\`
Upload complete
    ↓
Queue: video_processing (priority queue)
    ↓
┌─────────────────────────────────────────┐
│ 1. Validation                           │
│    - Format check                       │
│    - Virus scan                         │
│    - Copyright check (Content ID)       │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 2. Transcoding (parallel)               │
│    - 4K (2160p) - if source supports    │
│    - 1080p                              │
│    - 720p                               │
│    - 480p                               │
│    - 360p                               │
│    - Audio: multiple codecs             │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 3. Thumbnail Generation                 │
│    - Auto-generate 3 options            │
│    - Creator can upload custom          │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 4. Packaging                            │
│    - Segment into chunks (DASH/HLS)     │
│    - Generate manifest files            │
└────────────────┬────────────────────────┘
                 ↓
Upload to CDN origin, update database
    ↓
Notify creator: "Video is live!"
\`\`\`

**3. Processing Time:**
\`\`\`
Target: ~1 hour for 1-hour video (real-time)
Achieve via:
- Parallel transcoding (all resolutions at once)
- Distributed workers (split video, process, merge)
- GPU acceleration for encoding
- Priority tiers (verified creators faster)

Progress visibility:
- "Processing... 45% complete"
- "Your video will be ready in ~30 minutes"
\`\`\`

**4. Failure Handling:**
\`\`\`
Checkpoint system:
- Save state after each pipeline stage
- On failure: restart from last checkpoint
- Max retries: 3 per stage

Failure scenarios:
- Transcode fails: Retry different worker
- Corrupt segment: Re-transcode that portion
- Full failure: Notify creator, offer re-upload
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described resumable upload for large files',
              'Listed processing stages (validation, transcode, etc.)',
              'Mentioned parallel processing for speed',
              'Addressed failure handling with checkpoints'
            ]),
            xpValue: 40,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `A video has 10 million views in the first hour after upload. How do you handle this viral content?`,
            options: JSON.stringify([
              { id: 'a', text: 'Serve all requests from origin servers', feedback: 'Origin would be overwhelmed. 10M requests/hour = 2,777 requests/second from origin alone.' },
              { id: 'b', text: 'Immediately push to all CDN edge locations worldwide', feedback: 'Correct! Detect viral content early (view velocity), proactively push to edge servers globally before they request it.' },
              { id: 'c', text: 'Rate limit viewers to protect servers', feedback: 'Terrible UX. Viral moment is when you want MAXIMUM availability.' },
              { id: 'd', text: 'Queue viewers and serve when capacity allows', feedback: 'Unacceptable latency. Users will leave.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'For viral content: detect high view velocity early, proactively push to CDN edges worldwide (not waiting for cache misses), and potentially use dedicated capacity. YouTube and Netflix have systems to detect trending content and pre-position it.',
            hints: JSON.stringify(['Think about proactive vs reactive caching', 'Consider the cost of viral cache misses']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: View Count System**

YouTube shows view counts on videos. Design the view counting system:
- How do you count views accurately?
- How do you prevent fake views?
- How do you display counts in real-time?
- At 1B views/day, how do you scale?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'View counting at scale requires fraud detection and eventual consistency for accurate, real-time display.',
            hints: JSON.stringify(['Think about what constitutes a valid view', 'Consider batching for efficiency']),
            sampleSolution: `**View Count System:**

**1. What Counts as a View:**
\`\`\`
Valid view criteria:
- Watched at least 30 seconds (or full if <30s)
- Unique per user per time window (24h)
- Not automated (bot detection)
- Not self-views by creator

Invalid (not counted):
- Bots/automation
- Repeated refresh spam
- Embedded autoplay under certain size
- Paid fake views
\`\`\`

**2. Counting Architecture:**
\`\`\`
Video plays 30+ seconds
    ↓
Client sends "view" event
    ↓
View Validation Service:
  - Check user fingerprint
  - Check rate limits
  - Bot detection signals
    ↓
If valid: Write to Kafka topic
    ↓
View Counter Service:
  - Aggregate counts per video
  - Batch writes to database
    ↓
Redis: Real-time approximate count
Database: Authoritative count (hourly sync)
\`\`\`

**3. Fraud Prevention:**
\`\`\`python
def is_valid_view(event):
    # Rate limiting per user
    if views_from_user_today(event.user_id) > 100:
        return False
    
    # Bot detection
    if bot_score(event.fingerprint) > 0.8:
        return False
    
    # Geographic anomalies
    if suspicious_ip_pattern(event.ip):
        flag_for_review()
    
    # Replay attacks
    if is_duplicate_event(event.event_id):
        return False
    
    return True
\`\`\`

**4. Real-time Display:**
\`\`\`
Challenge: Can't query DB for every video view

Solution: Tiered counting
  
Redis (real-time):
  video:{id}:views = approximate count
  Update: Increment with every valid view
  
Database (accurate):
  Hourly batch job aggregates from Kafka
  Updates authoritative count
  
Display logic:
  - <1000 views: Show exact
  - 1K-1M: Round to nearest K
  - >1M: Round to nearest 100K
  
  "1.2M views" (not "1,234,567 views")
\`\`\`

**5. Scale (1B views/day):**
\`\`\`
1B views / 86400 seconds = ~11,500 views/second

Approach:
- Kafka partitioned by video_id
- Multiple consumer groups
- Redis cluster for counters
- Batch DB writes (not per-view)
- Eventual consistency (few minutes lag)
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Defined valid view criteria',
              'Described fraud/bot prevention',
              'Explained real-time vs accurate count tradeoff',
              'Addressed scaling to billions of views'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `YouTube needs to store comments for videos. Some videos have millions of comments. What storage approach is best?`,
            options: JSON.stringify([
              { id: 'a', text: 'All comments in one MySQL table', score: 30, feedback: 'Doesn\'t scale. Hot videos would create hotspots. Pagination becomes slow.' },
              { id: 'b', text: 'Comments sharded by video_id', score: 85, feedback: 'Good! Each video\'s comments together. But hot videos still a challenge.' },
              { id: 'c', text: 'Comments in NoSQL (Bigtable/Cassandra) sorted by time', score: 95, feedback: 'Excellent! Wide-column store handles time-series data well. Natural sharding, efficient range queries.' },
              { id: 'd', text: 'Store comments as JSON in video document', score: 20, feedback: 'Document size limits. Can\'t paginate efficiently. Updates are expensive.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'YouTube uses Bigtable (wide-column store) for comments. Row key: video_id + timestamp, allowing efficient range scans for pagination. Naturally distributes load across nodes. Handles videos with millions of comments without hotspots.',
            hints: JSON.stringify(['Think about the query pattern: recent comments for a video', 'Consider write patterns: append-only']),
            xpValue: 25,
            orderIndex: 4,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 19: DESIGN DROPBOX
  // ============================================
  {
    title: 'Design Dropbox',
    slug: 'design-dropbox',
    description: 'Design a file synchronization service with upload, sync, sharing, and conflict resolution across devices.',
    difficulty: 'advanced',
    orderIndex: 52,
    icon: '📦',
    colorTheme: '#0061ff',
    lessons: [
      {
        title: 'File Sync Architecture',
        slug: 'file-sync-architecture',
        storyContent: `📦 DROPBOX SYSTEM DESIGN

"Design Dropbox."

Requirements:
- Sync files across multiple devices
- Handle large files efficiently
- Detect and sync only changes (delta sync)
- Handle offline edits and conflicts
- Share files and folders
- Scale: 700M users, 1.2B files synced/day

Seamless file sync everywhere. Let's design it.`,
        orderIndex: 1,
        xpReward: 160,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: File Chunking**

Dropbox splits files into chunks. Design the chunking system:
- Why chunk files instead of uploading whole files?
- How do you determine chunk boundaries?
- How do you identify duplicate chunks?
- How does this enable delta sync?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Chunking is fundamental to efficient sync, enabling delta updates and deduplication.',
            hints: JSON.stringify(['Think about what happens when you edit the middle of a large file', 'Consider content-defined chunking vs fixed-size']),
            sampleSolution: `**File Chunking System:**

**1. Why Chunk Files:**
\`\`\`
Scenario: 1GB file, user changes 1 byte

Without chunking:
  - Upload entire 1GB again
  - Slow and wasteful

With chunking (4MB chunks):
  - Only upload the changed chunk
  - Upload 4MB instead of 1GB
  - 250x bandwidth savings
\`\`\`

**2. Chunking Strategies:**
\`\`\`
Fixed-size chunks (simple):
  - Split every 4MB
  - Problem: Insert at beginning shifts all boundaries
  - All chunks change even for small edit

Content-Defined Chunking (CDC) - better:
  - Use rolling hash (Rabin fingerprint)
  - Find natural boundaries based on content
  - Insert doesn't shift all boundaries
  
Algorithm:
  for each byte:
    rolling_hash = update_hash(byte)
    if rolling_hash % AVG_CHUNK_SIZE == MAGIC:
      create_chunk_boundary()
\`\`\`

**3. Chunk Identification:**
\`\`\`
Each chunk identified by hash of content:
  chunk_id = SHA256(chunk_content)

Benefits:
  - Same content = same chunk_id
  - Enables deduplication
  - Client can check if server has chunk

Upload flow:
  1. Client chunks file
  2. Client sends list of chunk_ids
  3. Server responds: "I need chunks 3, 7, 12"
  4. Client uploads only missing chunks
\`\`\`

**4. Delta Sync:**
\`\`\`
File edit detection:
  Old file: [chunk_A, chunk_B, chunk_C, chunk_D]
  New file: [chunk_A, chunk_B', chunk_C, chunk_D]
  
Sync process:
  1. Compute new chunk hashes
  2. Compare to stored hashes
  3. chunk_B' is new (different hash)
  4. Upload only chunk_B'
  5. Update metadata: file now points to B'

Server stores:
  - Chunk blobs in object storage
  - File → chunk mapping in metadata DB
\`\`\`

**5. Storage Efficiency:**
\`\`\`
Global deduplication:
  User A uploads presentation.pptx
  User B uploads same file
  
Server stores chunk only ONCE
  - 30-60% storage savings across all users
  - Same content has same chunk_id
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Explained why chunking is needed',
              'Described content-defined chunking',
              'Showed chunk identification via hash',
              'Explained how delta sync works'
            ]),
            xpValue: 40,
            orderIndex: 1,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Sync Protocol**

User has Dropbox on laptop and phone. Design the sync protocol:
- How does a device know when files changed on server?
- How do you handle offline edits?
- What happens when both devices edit the same file?
- How do you ensure files don't corrupt during sync?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Sync protocols must handle distributed state, offline changes, and conflicts gracefully.',
            hints: JSON.stringify(['Think about how to detect remote changes', 'Consider vector clocks or version numbers']),
            sampleSolution: `**Sync Protocol Design:**

**1. Change Detection:**
\`\`\`
Two approaches:

Polling:
  - Client asks server every N seconds
  - "Any changes since version X?"
  - Simple but not real-time

Long-polling / WebSocket (better):
  - Client maintains connection
  - Server pushes notifications instantly
  - "File Y changed, fetch new version"

Notification payload:
{
  "type": "file_changed",
  "path": "/Documents/report.docx",
  "version": 47,
  "action": "modified"
}
\`\`\`

**2. Offline Edit Handling:**
\`\`\`
Device goes offline:
  1. User edits file locally
  2. Client tracks local changes in journal
  3. File marked as "pending sync"

Device comes online:
  1. Client checks server for remote changes
  2. If no conflicts: push local changes
  3. If conflict: trigger resolution
  
Journal structure:
{
  "path": "/report.docx",
  "local_version": 48,
  "server_version_at_edit": 45,
  "changes": [chunk_ids],
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`

**3. Conflict Resolution:**
\`\`\`
Conflict: Both devices edited since last sync

Detection:
  local.base_version != server.current_version

Resolution strategies:
  
a) Last-write-wins (risky):
   Later timestamp wins, other changes lost

b) Create conflict copy (Dropbox's approach):
   - Keep both versions
   - "report (conflicted copy).docx"
   - User manually merges

c) Merge (complex, for specific types):
   - Text: 3-way merge
   - Requires understanding file format

Dropbox default:
  - Create conflict copy
  - Notify user
  - User decides what to keep
\`\`\`

**4. Integrity Verification:**
\`\`\`
Ensure no corruption:

Upload:
  1. Client computes chunk hashes
  2. Upload chunks + hashes
  3. Server verifies hash matches content
  4. ACK only if verified

Download:
  1. Get expected hash from metadata
  2. Download chunk
  3. Verify downloaded content hash
  4. Retry if mismatch

End-to-end:
  - File hash stored in metadata
  - After sync, verify full file hash
  - Guarantees complete integrity
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described change notification mechanism',
              'Explained offline edit journaling',
              'Detailed conflict detection and resolution',
              'Mentioned integrity verification'
            ]),
            xpValue: 40,
            orderIndex: 2,
          },
          {
            type: 'multiple_choice',
            scenarioText: `A user shares a folder with 100 people. When one person adds a file, how should you notify the others?`,
            options: JSON.stringify([
              { id: 'a', text: 'Each user polls the server for changes', feedback: '100 users polling creates unnecessary server load. Push is more efficient.' },
              { id: 'b', text: 'Publish event to message queue, fan-out to connected clients', feedback: 'Correct! Pub/sub pattern: publish change event, deliver to all connected members via their WebSocket connections.' },
              { id: 'c', text: 'Store notification in database for each user', feedback: 'Creates 100 DB writes per file change. Not scalable for large shares.' },
              { id: 'd', text: 'Notify only when users open the app', feedback: 'Delays sync significantly. Desktop apps expect near-instant sync.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Use pub/sub for shared folder notifications: publish change event to a channel for that folder, deliver to all connected members via WebSocket. Offline members get changes when they reconnect. This scales to large shares without per-user database writes.',
            hints: JSON.stringify(['Think about pub/sub patterns', 'Consider WebSocket for real-time delivery']),
            xpValue: 20,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `For storing file metadata (paths, versions, shares), what database is best?`,
            options: JSON.stringify([
              { id: 'a', text: 'Single PostgreSQL instance', score: 30, feedback: 'Single instance won\'t scale to 700M users and billions of files.' },
              { id: 'b', text: 'Sharded MySQL by user_id', score: 85, feedback: 'Good! Dropbox actually uses MySQL. User data is isolated, sharding by user works well.' },
              { id: 'c', text: 'MongoDB for flexible schema', score: 60, feedback: 'Could work but file metadata has predictable schema. Relational works fine.' },
              { id: 'd', text: 'File system hierarchy in Bigtable', score: 70, feedback: 'Possible but hierarchical queries (list folder contents) can be complex.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Dropbox uses sharded MySQL for metadata. File operations are naturally scoped to a user (or shared folder), making user_id a good shard key. Relational model works well for file hierarchies, permissions, and versions. They handle billions of rows across thousands of shards.',
            hints: JSON.stringify(['Consider access patterns: mostly per-user queries', 'Think about ACID needs for metadata consistency']),
            xpValue: 25,
            orderIndex: 4,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 20: DESIGN GOOGLE DOCS
  // ============================================
  {
    title: 'Design Google Docs',
    slug: 'design-google-docs',
    description: 'Design a real-time collaborative document editor with concurrent editing, cursor presence, and version history.',
    difficulty: 'advanced',
    orderIndex: 53,
    icon: '📝',
    colorTheme: '#4285f4',
    lessons: [
      {
        title: 'Real-time Collaboration',
        slug: 'realtime-collaboration',
        storyContent: `📝 GOOGLE DOCS SYSTEM DESIGN

"Design Google Docs."

Requirements:
- Real-time collaborative editing
- Multiple cursors visible
- No conflicts or data loss
- Offline editing support
- Version history and restore
- Scale: Millions of concurrent documents

Real-time collaboration without conflicts. Let's design it.`,
        orderIndex: 1,
        xpReward: 180,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Conflict-Free Editing**

Two users type at the same position simultaneously. Design the system to handle this:
- What happens when operations arrive at different times?
- How do you ensure all users see the same final result?
- What algorithms handle concurrent editing?
- How do you handle out-of-order operations?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Concurrent editing requires specialized algorithms like OT or CRDTs to maintain consistency.',
            hints: JSON.stringify(['Think about Operational Transformation (OT)', 'Consider what happens when operations cross on the network']),
            sampleSolution: `**Conflict-Free Concurrent Editing:**

**1. The Problem:**
\`\`\`
Document: "Hello"
User A (position 5): Insert "!" → "Hello!"
User B (position 0): Insert "Say " → "Say Hello"

If operations applied as-is:
  A sees: "Say Hello!"  ✓
  B sees: "Say Hello"!  ✗ (! at wrong position)

Operations must be TRANSFORMED
\`\`\`

**2. Operational Transformation (OT):**
\`\`\`
Each operation has:
  - Type: insert/delete
  - Position: where in document
  - Content: what to insert/delete
  - Version: document state when created

Transform function:
  transform(op1, op2) → (op1', op2')
  
Example:
  op1: insert("!", 5)  // Insert at position 5
  op2: insert("Say ", 0)  // Insert at position 0
  
  After op2, position 5 is now position 9
  op1' = insert("!", 9)  // Transformed position

Both users apply transformed ops → Same result!
\`\`\`

**3. Server-Mediated OT:**
\`\`\`
All operations go through server:

Client A → Server → Client B
                 → Client C

Server:
1. Receives operation
2. Transforms against any concurrent ops
3. Applies to authoritative document
4. Broadcasts transformed op to all clients
5. Assigns global version number

Clients:
1. Apply local ops immediately (optimistic)
2. Send to server
3. Receive server's transformed version
4. Reconcile if different
\`\`\`

**4. Alternative: CRDTs**
\`\`\`
Conflict-free Replicated Data Types:
- Mathematical guarantee of convergence
- No central server needed
- Operations commute naturally

Example: RGA (Replicated Growable Array)
- Each character has unique ID
- Insert: "after character X, add Y"
- Delete: "mark character X as deleted"
- IDs never conflict

Trade-off:
  OT: More efficient, needs server
  CRDT: Works peer-to-peer, more metadata
\`\`\`

**5. Handling Out-of-Order:**
\`\`\`
Network delays cause out-of-order arrival

Solution: Version vectors
- Track which ops each client has seen
- Hold ops until dependencies satisfied
- Apply in correct causal order

Client state:
{
  "my_version": 15,
  "server_version": 12,
  "pending_ops": [op13, op14, op15],
  "unacked_ops": [op15]
}
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Explained the concurrent edit problem',
              'Described OT or CRDT approach',
              'Showed how operations are transformed',
              'Addressed out-of-order handling'
            ]),
            xpValue: 45,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `For cursor presence (seeing other users' cursors in real-time), what's the best approach?`,
            options: JSON.stringify([
              { id: 'a', text: 'Store cursor positions in database, poll every second', feedback: 'Too slow for real-time feel. Cursors should update instantly.' },
              { id: 'b', text: 'WebSocket broadcast of cursor position on every movement', feedback: 'Correct! Low-latency WebSocket updates. Throttle to ~30fps to avoid flooding.' },
              { id: 'c', text: 'Include cursor position in document operations only', feedback: 'Cursors move without edits (just clicking). Need separate presence updates.' },
              { id: 'd', text: 'Let clients calculate cursor positions from operations', feedback: 'Can\'t know position without explicit updates. User might be reading, not editing.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Cursor presence uses WebSocket for real-time updates. Broadcast cursor position changes (throttled to avoid flooding) to all document participants. This is separate from document operations—presence is ephemeral and doesn\'t need persistence.',
            hints: JSON.stringify(['Think about latency requirements for cursor movement', 'Consider cursors as ephemeral presence, not document state']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Version History**

Users can see document history and restore previous versions. Design this:
- How do you store version history efficiently?
- How do you display "who changed what"?
- How do you restore to a previous version?
- How do you handle a document edited millions of times?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Version history requires efficient storage of changes and the ability to reconstruct any point in time.',
            hints: JSON.stringify(['Think about storing diffs vs full snapshots', 'Consider periodic checkpoints']),
            sampleSolution: `**Version History System:**

**1. Storage Strategy:**
\`\`\`
Don't store full document for every change!

Operation log + periodic snapshots:

Operations table:
| op_id | doc_id | user_id | operation    | timestamp   |
|-------|--------|---------|--------------|-------------|
| 1     | doc_1  | alice   | insert(0,"H")| 10:00:00.001|
| 2     | doc_1  | alice   | insert(1,"i")| 10:00:00.050|
| 3     | doc_1  | bob     | insert(2,"!")| 10:00:01.000|

Snapshots table (every N ops or T time):
| snap_id | doc_id | content    | op_id | timestamp |
|---------|--------|------------|-------|-----------|
| 1       | doc_1  | "Hi!"      | 3     | 10:00:01  |
| 2       | doc_1  | "Hi world!"| 50    | 10:01:00  |

Reconstruct version 25:
1. Find nearest snapshot before op 25
2. Replay ops from snapshot to op 25
\`\`\`

**2. Attribution (Who Changed What):**
\`\`\`
Each operation tagged with user_id:

Display logic:
1. Chunk text by author
2. Different colors per author
3. Hover shows: "Bob, Jan 15, 10:30 AM"

For "See changes" view:
- Compare current vs selected version
- Highlight additions (green) and deletions (red)
- Show strikethrough for deleted text
\`\`\`

**3. Restore Previous Version:**
\`\`\`
User clicks "Restore this version":

Option A: Replace current (destructive)
  1. Load historical version
  2. Create new operation: "replace all with X"
  3. Apply operation
  4. History preserved (can undo restore)

Option B: Create copy (safer)
  1. Load historical version
  2. Create new document with that content
  3. Original unchanged
\`\`\`

**4. Handling Millions of Operations:**
\`\`\`
Problem: 1M ops = slow reconstruction

Solutions:

1. Frequent snapshots:
   - Snapshot every 1000 ops
   - Max 1000 ops to replay

2. Compaction:
   - Old ops can be merged
   - "insert H, insert i" → "insert Hi"
   - Lose granularity, save space

3. Tiered history:
   - Last 30 days: Full detail
   - 30-90 days: Hourly snapshots
   - >90 days: Daily snapshots
   
4. Lazy loading:
   - Don't load full history upfront
   - Fetch on-demand when user scrolls
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described operation log + snapshot approach',
              'Explained change attribution',
              'Detailed restore mechanism',
              'Addressed scaling with many operations'
            ]),
            xpValue: 40,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `For the real-time sync infrastructure, should you use OT (Operational Transformation) or CRDTs?`,
            options: JSON.stringify([
              { id: 'a', text: 'OT: Server-centric, requires transformation server', score: 85, feedback: 'Google Docs uses OT. Works well with central server, efficient, but complex implementation.' },
              { id: 'b', text: 'CRDT: Peer-to-peer capable, mathematically guaranteed consistency', score: 80, feedback: 'Good choice for decentralized apps (Figma uses this). More metadata overhead but simpler correctness.' },
              { id: 'c', text: 'Last-write-wins: Simple, just use timestamps', score: 20, feedback: 'Would lose user edits constantly. Not acceptable for collaborative editing.' },
              { id: 'd', text: 'Lock-based: Only one user edits at a time', score: 30, feedback: 'Defeats the purpose of real-time collaboration. Too restrictive.' },
            ]),
            correctAnswer: JSON.stringify('a'),
            explanation: 'Both OT and CRDT are valid! Google Docs uses OT (central server transforms operations). Figma uses CRDTs (works for offline). OT is more efficient but requires careful implementation. CRDTs have mathematical consistency guarantees but more metadata. Choice depends on architecture (centralized vs P2P).',
            hints: JSON.stringify(['Consider centralized vs decentralized architecture', 'Think about offline-first requirements']),
            xpValue: 25,
            orderIndex: 4,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 21: DESIGN TICKETMASTER
  // ============================================
  {
    title: 'Design Ticketmaster',
    slug: 'design-ticketmaster',
    description: 'Design a ticket booking system handling flash sales, seat selection, payment processing, and preventing overselling.',
    difficulty: 'advanced',
    orderIndex: 54,
    icon: '🎟️',
    colorTheme: '#026cdf',
    lessons: [
      {
        title: 'High-Traffic Ticket Sales',
        slug: 'high-traffic-tickets',
        storyContent: `🎟️ TICKETMASTER SYSTEM DESIGN

"Design Ticketmaster."

Requirements:
- Sell tickets for concerts, sports, theater
- Handle flash sales (100K users, 10K tickets)
- Seat selection with real-time availability
- Prevent overselling (critical!)
- Fair queuing system
- Scale: Popular events sell out in minutes

High-stakes, high-traffic sales. Let's design it.`,
        orderIndex: 1,
        xpReward: 170,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Inventory Management**

Taylor Swift concert: 50,000 tickets, 500,000 people trying to buy. Design the inventory system:
- How do you track available tickets in real-time?
- How do you prevent overselling?
- How do you handle seat selection vs general admission?
- What happens when a user abandons checkout?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Ticket inventory requires strong consistency to prevent overselling while handling massive concurrent demand.',
            hints: JSON.stringify(['Think about locking mechanisms', 'Consider temporary holds during checkout']),
            sampleSolution: `**Ticket Inventory System:**

**1. Inventory Data Model:**
\`\`\`sql
-- Events
CREATE TABLE events (
  event_id BIGINT PRIMARY KEY,
  name VARCHAR(500),
  venue_id BIGINT,
  event_date TIMESTAMP,
  total_tickets INT,
  available_tickets INT  -- Denormalized counter
);

-- Tickets (for assigned seating)
CREATE TABLE tickets (
  ticket_id BIGINT PRIMARY KEY,
  event_id BIGINT,
  section VARCHAR(50),
  row VARCHAR(10),
  seat_number INT,
  price DECIMAL(10,2),
  status ENUM('available', 'held', 'sold'),
  held_by UUID,           -- Session ID holding ticket
  held_until TIMESTAMP,   -- Auto-release time
  purchased_by BIGINT     -- User ID if sold
);

-- Holds (temporary reservations)
CREATE TABLE holds (
  hold_id UUID PRIMARY KEY,
  ticket_id BIGINT,
  session_id UUID,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  INDEX idx_expires (expires_at)
);
\`\`\`

**2. Preventing Overselling:**
\`\`\`python
def reserve_ticket(ticket_id, session_id):
    # Atomic operation with row locking
    with db.transaction():
        ticket = db.query(
            "SELECT * FROM tickets WHERE ticket_id = ? FOR UPDATE",
            ticket_id
        )
        
        if ticket.status != 'available':
            raise TicketUnavailableError()
        
        # Reserve for 10 minutes
        db.execute("""
            UPDATE tickets 
            SET status = 'held', 
                held_by = ?,
                held_until = NOW() + INTERVAL 10 MINUTE
            WHERE ticket_id = ? AND status = 'available'
        """, session_id, ticket_id)
        
        return ticket

# Using Redis for high-performance:
def reserve_ticket_redis(ticket_id, session_id):
    # SETNX: Set if not exists (atomic)
    reserved = redis.set(
        f"ticket:{ticket_id}:hold",
        session_id,
        nx=True,  # Only if not exists
        ex=600    # 10 minute expiry
    )
    
    if not reserved:
        raise TicketUnavailableError()
\`\`\`

**3. Seat Selection (Real-time Map):**
\`\`\`
Display flow:
1. User opens seat map
2. Fetch available seats for section
3. Show available (green), held (yellow), sold (gray)
4. Real-time updates via WebSocket

WebSocket updates:
{
  "type": "seat_status_change",
  "seats": [
    {"id": "A-12", "status": "held"},
    {"id": "B-5", "status": "available"}  // Released hold
  ]
}

User selects seat:
1. Attempt to hold
2. If success: Update UI, start checkout timer
3. If fail: "Sorry, seat just taken" → Refresh map
\`\`\`

**4. Abandoned Checkout (Auto-release):**
\`\`\`
Holds expire automatically:

Background job (runs every 30 seconds):
  SELECT ticket_id FROM tickets 
  WHERE status = 'held' 
  AND held_until < NOW()
  
  FOR each expired ticket:
    UPDATE tickets SET status = 'available'
    PUBLISH seat_released event
    
Client side:
- Show countdown: "Complete purchase in 9:45"
- Warning at 2 minutes
- Auto-redirect when expired
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described ticket status tracking',
              'Showed atomic reservation (prevent oversell)',
              'Explained temporary holds with expiry',
              'Addressed abandoned checkout release'
            ]),
            xpValue: 40,
            orderIndex: 1,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Virtual Waiting Room**

500,000 fans, 50,000 tickets. You can't let everyone hit the system at once. Design the queueing system:
- How do you implement a fair waiting room?
- How do you prevent queue jumping (bots)?
- How do you communicate position to users?
- When do you let people into the purchase flow?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Virtual waiting rooms protect backend systems while providing fair access to limited inventory.',
            hints: JSON.stringify(['Think about pre-queue randomization', 'Consider how to verify humans vs bots']),
            sampleSolution: `**Virtual Waiting Room:**

**1. Queue Architecture:**
\`\`\`
User arrives at ticket page
    ↓
Waiting Room Service
    ↓
Assign queue position
    ↓
Wait until called
    ↓
Redirect to purchase flow (time-limited)
    ↓
Complete or timeout → Next person
\`\`\`

**2. Fair Queue Assignment:**
\`\`\`
Problem: First-come-first-served favors bots

Solution: Pre-sale randomization window

1. Doors open at 10:00 AM
2. Anyone joining 10:00-10:15 gets RANDOM position
3. After 10:15, join at end of queue

This removes advantage of connecting at 10:00:00.001

Implementation:
  def assign_position(user_id, join_time, sale_start):
      if join_time < sale_start + 15_minutes:
          # Randomize within early window
          return random.randint(1, early_joiners_count)
      else:
          # After window: FIFO
          return current_queue_length + 1
\`\`\`

**3. Bot Prevention:**
\`\`\`
Layers of defense:

1. CAPTCHA before entering queue
   - Hard CAPTCHA for suspicious IPs
   
2. Browser fingerprinting
   - Headless browsers detected
   
3. Behavior analysis
   - Too-fast interactions = bot
   - Multiple sessions from same device
   
4. Rate limiting per IP/fingerprint
   - Max 3 queue entries per IP

5. Purchase verification
   - Phone number verification
   - Credit card must match account
   - Limit tickets per account
\`\`\`

**4. Queue Position Communication:**
\`\`\`
Client polls or WebSocket updates:

{
  "queue_id": "abc123",
  "position": 45230,
  "estimated_wait": "~35 minutes",
  "message": "Don't refresh! You'll lose your place.",
  "status": "waiting"
}

Progress updates every 30 seconds
Show fun content while waiting (artist videos)
\`\`\`

**5. Admission to Purchase:**
\`\`\`
Controller service:
  - Monitors purchase flow capacity
  - Admits N users per minute based on:
    - Available tickets remaining
    - Checkout completion rate
    - Server capacity

Admission token:
  - Time-limited (15 minutes)
  - Single use
  - Bound to session
  
{
  "token": "xyz789",
  "valid_until": "2024-01-15T10:45:00Z",
  "max_tickets": 4
}

If user doesn't complete, token expires
→ Next person admitted
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Described fair queue assignment (randomization window)',
              'Mentioned bot prevention measures',
              'Showed queue position communication',
              'Explained controlled admission to purchase'
            ]),
            xpValue: 40,
            orderIndex: 2,
          },
          {
            type: 'multiple_choice',
            scenarioText: `For high-demand flash sales, what's the best database approach for ticket inventory?`,
            options: JSON.stringify([
              { id: 'a', text: 'Single PostgreSQL with row-level locking', feedback: 'Row locking creates hot rows under extreme contention. Database becomes bottleneck.' },
              { id: 'b', text: 'Redis for holds, PostgreSQL for final state', feedback: 'Correct! Redis handles high-velocity holds atomically, PostgreSQL ensures durability for completed sales.' },
              { id: 'c', text: 'Eventually consistent NoSQL', feedback: 'Eventual consistency risks overselling. Tickets require strong consistency.' },
              { id: 'd', text: 'Pre-allocate all tickets to users in queue', feedback: 'Can\'t pre-allocate without payment. Users might abandon.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Hybrid approach: Redis for real-time holds (SETNX is atomic, sub-ms latency), PostgreSQL for completed purchases (durability, ACID). Redis handles the contention storm, PostgreSQL handles the final state. This scales to millions of concurrent requests.',
            hints: JSON.stringify(['Think about operation speed for holds', 'Consider durability needs for completed sales']),
            xpValue: 20,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `A user selected 4 tickets and started checkout. After 5 minutes, should you extend their hold or release tickets to others?`,
            options: JSON.stringify([
              { id: 'a', text: 'Extend automatically - don\'t frustrate paying customers', score: 40, feedback: 'Risks tickets being held indefinitely. Others waiting in queue suffer.' },
              { id: 'b', text: 'Hard cutoff at 10 minutes - fairness to others', score: 70, feedback: 'Fair but might lose sales from slow-typing customers.' },
              { id: 'c', text: 'Allow one extension if actively engaged, then hard cutoff', score: 95, feedback: 'Best balance! Detect engagement (form filling), allow one extension, then release for fairness.' },
              { id: 'd', text: 'No time limit - hold until purchase or cancel', score: 20, feedback: 'Terrible for limited inventory. One hoarder could hold tickets forever.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'Balance customer experience with fairness: detect if user is actively engaged (typing, clicking) and allow one automatic extension. After that, enforce hard cutoff. Shows countdown prominently. This reduces abandoned-but-held tickets while accommodating legitimate slow users.',
            hints: JSON.stringify(['Think about detecting user engagement', 'Balance individual UX vs queue fairness']),
            xpValue: 25,
            orderIndex: 4,
          },
        ],
      },
    ],
  },
];
