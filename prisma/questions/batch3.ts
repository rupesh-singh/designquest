// Batch 3: 30 Questions covering Authentication, Security, Consistency, CAP Theorem, Monitoring
// Topics: Auth & Security, Distributed Consistency, Observability & Monitoring

import { SeedModule } from './index';

export const batch3Modules: SeedModule[] = [
  // ============================================
  // MODULE 10: AUTHENTICATION & SECURITY
  // ============================================
  {
    title: 'Authentication & Security',
    slug: 'authentication-security',
    description: 'Master authentication patterns including OAuth, JWT, session management, and API security best practices.',
    difficulty: 'intermediate',
    orderIndex: 30,
    icon: '🔐',
    colorTheme: '#dc2626',
    lessons: [
      {
        title: 'Authentication Strategies',
        slug: 'authentication-strategies',
        storyContent: `🔒 SECURITY AUDIT

"The security team just completed an audit. Findings:
- Session tokens stored in localStorage (XSS vulnerable)
- No token expiration (stolen tokens work forever)
- Password reset links don't expire
- API keys embedded in mobile app code

We need to redesign our authentication system from scratch."

Your mission: Build a secure, scalable authentication system.`,
        orderIndex: 1,
        xpReward: 140,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: JWT vs Sessions**

Compare JWT-based authentication with traditional session-based authentication:
- How does each work?
- What are the tradeoffs?
- When would you choose each?
- How do you handle logout with each?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Understanding the tradeoffs between stateless JWTs and stateful sessions is fundamental to auth system design.',
            hints: JSON.stringify(['Think about where state is stored', 'Consider horizontal scaling implications']),
            sampleSolution: `**Session-Based Authentication:**
\`\`\`
1. User logs in with credentials
2. Server creates session, stores in DB/Redis
3. Server sends session ID in cookie
4. Browser sends cookie with every request
5. Server looks up session to verify user

Storage: Server-side (Redis/DB)
State: Stateful
\`\`\`

**JWT-Based Authentication:**
\`\`\`
1. User logs in with credentials
2. Server creates signed JWT with user info
3. Server sends JWT to client
4. Client sends JWT in Authorization header
5. Server verifies signature (no DB lookup)

Storage: Client-side
State: Stateless
\`\`\`

**Comparison:**

| Aspect | Sessions | JWT |
|--------|----------|-----|
| Scalability | Need shared session store | Stateless, scales easily |
| Revocation | Easy (delete session) | Hard (token valid until expiry) |
| Storage | Server memory/DB | Client storage |
| Logout | Delete server session | Can't truly invalidate |
| Security | HttpOnly cookie (XSS safe) | Often in localStorage (XSS risk) |

**When to Choose:**

**Sessions:**
- Traditional web apps
- Need instant logout/revocation
- Single domain
- Security-critical applications

**JWT:**
- Microservices (no shared state)
- Mobile apps
- Third-party API access
- Cross-domain authentication

**Handling Logout:**

**Sessions:** Delete from Redis/DB - immediate

**JWT:** 
- Short expiry (15 min) + refresh tokens
- Token blacklist (adds state back)
- Just delete client-side (user can replay)`,
            evaluationCriteria: JSON.stringify([
              'Explained how each mechanism works',
              'Discussed stateful vs stateless tradeoff',
              'Addressed logout/revocation challenge with JWT',
              'Mentioned appropriate use cases for each'
            ]),
            xpValue: 35,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `Where should you store JWT tokens in a browser application?`,
            options: JSON.stringify([
              { id: 'a', text: 'localStorage - easy to access from JavaScript', feedback: 'Vulnerable to XSS attacks! Any JavaScript can read localStorage.' },
              { id: 'b', text: 'HttpOnly cookie - can\'t be accessed by JavaScript', feedback: 'Correct! HttpOnly cookies are immune to XSS. Add Secure and SameSite flags too.' },
              { id: 'c', text: 'sessionStorage - cleared when tab closes', feedback: 'Same XSS vulnerability as localStorage. Still accessible via JavaScript.' },
              { id: 'd', text: 'In a JavaScript variable - not persisted', feedback: 'Lost on page refresh. Also vulnerable to XSS while in memory.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'HttpOnly cookies cannot be accessed by JavaScript, making them immune to XSS attacks. Combine with Secure (HTTPS only) and SameSite=Strict (CSRF protection) flags. The tradeoff is cookies are sent automatically, so you need CSRF protection.',
            hints: JSON.stringify(['Think about XSS attack vectors', 'Consider what JavaScript can access']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: OAuth 2.0 Flow**

Your app needs to allow "Login with Google". Design the OAuth flow:
- What are the steps in the authorization code flow?
- What tokens are involved?
- How do you securely handle the callback?
- How do you get user information?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'OAuth 2.0 Authorization Code flow is the standard for server-side applications integrating with third-party identity providers.',
            hints: JSON.stringify(['Think about what information flows between user, your app, and Google', 'Consider why the authorization code exists']),
            sampleSolution: `**OAuth 2.0 Authorization Code Flow:**

\`\`\`
┌──────┐          ┌──────┐          ┌────────┐
│ User │          │ App  │          │ Google │
└──┬───┘          └──┬───┘          └────┬───┘
   │ 1. Click          │                   │
   │ "Login with       │                   │
   │  Google"          │                   │
   │──────────────────▶│                   │
   │                   │ 2. Redirect to    │
   │                   │    Google OAuth   │
   │◀──────────────────│──────────────────▶│
   │                   │                   │
   │ 3. User logs in, grants permission    │
   │◀──────────────────────────────────────│
   │                   │                   │
   │ 4. Redirect back with auth code       │
   │──────────────────▶│                   │
   │                   │ 5. Exchange code  │
   │                   │    for tokens     │
   │                   │──────────────────▶│
   │                   │◀──────────────────│
   │                   │ 6. Get user info  │
   │                   │──────────────────▶│
   │                   │◀──────────────────│
   │ 7. Create session │                   │
   │◀──────────────────│                   │
\`\`\`

**Step-by-Step:**

**1. Initiate OAuth:**
\`\`\`
GET https://accounts.google.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourapp.com/callback
  &response_type=code
  &scope=openid email profile
  &state=random_csrf_token
\`\`\`

**2. User Authorizes:** Google shows consent screen

**3. Callback with Code:**
\`\`\`
GET https://yourapp.com/callback?
  code=AUTH_CODE_HERE
  &state=random_csrf_token  ← Verify this!
\`\`\`

**4. Exchange Code for Tokens (Server-side):**
\`\`\`
POST https://oauth2.googleapis.com/token
{
  "client_id": "...",
  "client_secret": "...",  ← Never expose!
  "code": "AUTH_CODE_HERE",
  "redirect_uri": "...",
  "grant_type": "authorization_code"
}

Response:
{
  "access_token": "...",
  "refresh_token": "...",
  "id_token": "...",  ← JWT with user info
  "expires_in": 3600
}
\`\`\`

**5. Get User Info:**
\`\`\`
GET https://www.googleapis.com/oauth2/v2/userinfo
Authorization: Bearer ACCESS_TOKEN
\`\`\`

**Security Considerations:**
- Verify state parameter (CSRF protection)
- Exchange code server-side (protect client_secret)
- Validate id_token signature
- Use HTTPS for redirect_uri`,
            evaluationCriteria: JSON.stringify([
              'Described the redirect flow correctly',
              'Mentioned authorization code exchange',
              'Distinguished between access_token and id_token',
              'Addressed security (state parameter, server-side exchange)'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `Your API serves both a web app and mobile apps. How should you handle authentication?`,
            options: JSON.stringify([
              { id: 'a', text: 'Sessions with cookies for all clients', score: 40, feedback: 'Cookies work poorly for mobile apps and don\'t work cross-domain.' },
              { id: 'b', text: 'JWT tokens for all clients', score: 75, feedback: 'Works but web apps should use HttpOnly cookies for the JWT. Same token format, different storage.' },
              { id: 'c', text: 'Web: HttpOnly cookie with JWT. Mobile: JWT in Authorization header', score: 95, feedback: 'Perfect! Same JWT-based auth, but appropriate storage for each platform.' },
              { id: 'd', text: 'API keys embedded in each app', score: 20, feedback: 'API keys can be extracted from apps. Not suitable for user authentication.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'Use the same JWT-based authentication but store tokens appropriately for each platform. Web apps should use HttpOnly cookies (XSS protection). Mobile apps should use secure storage and send JWT in Authorization header.',
            hints: JSON.stringify(['Consider security threats unique to each platform', 'Think about how cookies work (or don\'t) on mobile']),
            xpValue: 25,
            orderIndex: 4,
          },
          {
            type: 'multi_select',
            scenarioText: `Which of the following are security best practices for password handling? (Select ALL that apply)`,
            options: JSON.stringify([
              { id: 'a', text: 'Hash passwords with bcrypt or Argon2', correct: true },
              { id: 'b', text: 'Use a unique salt per password', correct: true },
              { id: 'c', text: 'Store passwords encrypted (reversible)', correct: false },
              { id: 'd', text: 'Enforce minimum password length of 8+ characters', correct: true },
              { id: 'e', text: 'Send password in URL for convenience', correct: false },
            ]),
            correctAnswer: JSON.stringify(['a', 'b', 'd']),
            explanation: 'Passwords must be hashed (not encrypted - never store reversible passwords), salted uniquely, and have minimum length requirements. Never send passwords in URLs (they appear in logs and browser history).',
            hints: JSON.stringify(['Hash = one-way, Encrypt = reversible', 'Think about what would happen if database is breached']),
            xpValue: 20,
            orderIndex: 5,
          },
        ],
      },
      {
        title: 'Authorization & Access Control',
        slug: 'authorization-access-control',
        storyContent: `👮 ACCESS CONTROL NEEDED

"We've built authentication, but now we need authorization. Questions keep coming up:
- How do we restrict admin pages to admins only?
- How do we let users edit only their own posts?
- How do we handle team-based permissions?
- How do we audit who accessed what?

We need a proper authorization system!"`,
        orderIndex: 2,
        xpReward: 120,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: RBAC vs ABAC**

Compare Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC):
- How does each work?
- Give examples of each
- When would you choose each?
- How do you implement each?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'RBAC and ABAC are the two main authorization paradigms, each suited for different complexity levels.',
            hints: JSON.stringify(['RBAC: What role are you? ABAC: What attributes match?', 'Consider the complexity of your permission rules']),
            sampleSolution: `**RBAC (Role-Based Access Control):**

\`\`\`
Users are assigned roles, roles have permissions.

User "alice" → Role "editor" → Permissions ["read", "write"]
User "bob"   → Role "viewer" → Permissions ["read"]

Check: Can alice write? 
  → alice has "editor" role
  → "editor" has "write" permission
  → YES
\`\`\`

**Examples:**
- Admin, Editor, Viewer roles
- Department-based access
- Simple "can do X or not" questions

**ABAC (Attribute-Based Access Control):**

\`\`\`
Policies based on attributes of user, resource, action, context.

Policy: "Users can edit posts they created"

Attributes:
- user.id = 123
- resource.type = "post"
- resource.createdBy = 123
- action = "edit"

Rule: user.id == resource.createdBy AND action == "edit"
  → 123 == 123 AND "edit" == "edit"
  → YES
\`\`\`

**Examples:**
- "Managers can approve expenses under $1000"
- "Users can view documents in their department"
- "Edit only during business hours"

**Comparison:**

| Aspect | RBAC | ABAC |
|--------|------|------|
| Complexity | Simple | Complex |
| Flexibility | Limited | Very flexible |
| Performance | Fast (role lookup) | Slower (policy eval) |
| Maintenance | Easy | Harder |
| Use case | Most apps | Complex enterprises |

**When to Choose:**

**RBAC:** 
- Simple permission model
- Roles are relatively static
- Most SaaS applications

**ABAC:**
- Fine-grained, contextual access
- Dynamic conditions (time, location)
- Healthcare, finance, government

**Implementation:**
\`\`\`python
# RBAC
def can_edit_post(user):
    return "editor" in user.roles

# ABAC
def can_edit_post(user, post):
    return (
        post.created_by == user.id or
        "admin" in user.roles or
        (user.department == post.department and "editor" in user.roles)
    )
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Explained RBAC concept with example',
              'Explained ABAC concept with example',
              'Compared tradeoffs (simplicity vs flexibility)',
              'Gave guidance on when to use each'
            ]),
            xpValue: 35,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `A user should only be able to delete their own comments. Where should this authorization check happen?`,
            options: JSON.stringify([
              { id: 'a', text: 'Frontend only - hide the delete button if not owner', feedback: 'Never trust the frontend! Users can bypass UI and call API directly.' },
              { id: 'b', text: 'Backend API - verify ownership before deleting', feedback: 'Correct! Always enforce authorization on the backend. Frontend checks are just for UX.' },
              { id: 'c', text: 'Database - use row-level security', feedback: 'Can work as defense-in-depth, but primary check should be in application code.' },
              { id: 'd', text: 'Load balancer - filter unauthorized requests', feedback: 'Load balancers don\'t know about resource ownership. Wrong layer for this check.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Authorization must always be enforced on the backend. Frontend checks improve UX (don\'t show buttons users can\'t use) but provide zero security. An attacker can directly call your API. Defense in depth: backend is required, database RLS is a bonus.',
            hints: JSON.stringify(['Think about what an attacker could bypass', 'Consider where you can trust the check']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: API Key Management**

Design an API key system for your platform. Developers should be able to:
- Create API keys for their applications
- Set permissions per key (read-only, full access)
- Rotate keys without downtime
- Revoke compromised keys

How would you implement this?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'API key management requires secure generation, storage, permission scoping, and rotation capabilities.',
            hints: JSON.stringify(['Think about how to store keys securely', 'Consider key format and collision prevention']),
            sampleSolution: `**API Key System Design:**

**1. Key Generation:**
\`\`\`python
import secrets
import hashlib

def generate_api_key():
    # Generate random key
    raw_key = secrets.token_urlsafe(32)
    
    # Add prefix for identification
    key = f"sk_live_{raw_key}"  # sk_live_abc123...
    
    # Hash for storage (never store raw key)
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    
    return key, key_hash

# Return raw key to user ONCE, store only hash
\`\`\`

**2. Database Schema:**
\`\`\`sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(100),          -- "Production API Key"
    key_prefix VARCHAR(10),     -- "sk_live_ab" for display
    key_hash VARCHAR(64),       -- SHA256 hash
    permissions JSONB,          -- ["read:users", "write:posts"]
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP,
    revoked_at TIMESTAMP        -- NULL if active
);
\`\`\`

**3. Permission Scoping:**
\`\`\`json
{
  "keyId": "key_123",
  "permissions": [
    "read:products",
    "read:orders",
    "write:orders"
  ],
  "rate_limit": 1000,
  "allowed_ips": ["1.2.3.4"]
}
\`\`\`

**4. Key Rotation (Zero Downtime):**
\`\`\`
1. User generates new key (key_v2)
2. Both key_v1 and key_v2 are active
3. User updates applications to use key_v2
4. User revokes key_v1

Overlap period allows gradual migration.
\`\`\`

**5. Verification Flow:**
\`\`\`python
def verify_api_key(provided_key):
    # Hash the provided key
    key_hash = sha256(provided_key)
    
    # Look up by hash
    api_key = db.query(
        "SELECT * FROM api_keys WHERE key_hash = ? AND revoked_at IS NULL",
        key_hash
    )
    
    if not api_key:
        return None
    
    # Update last_used_at (async, don't block request)
    async_update_last_used(api_key.id)
    
    return api_key
\`\`\`

**6. Security Best Practices:**
- Rate limit per key
- IP allowlisting option
- Expiration dates
- Audit logging
- Alert on unusual patterns`,
            evaluationCriteria: JSON.stringify([
              'Secure key generation (random, sufficient entropy)',
              'Proper storage (hash, never plaintext)',
              'Permission scoping mechanism',
              'Key rotation strategy'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `You need to implement rate limiting per API key. Where should you enforce it?`,
            options: JSON.stringify([
              { id: 'a', text: 'In each microservice independently', score: 40, feedback: 'Rate limits would be per-service, not global. User could exceed overall limit across services.' },
              { id: 'b', text: 'In the API Gateway with Redis counter', score: 95, feedback: 'Perfect! Gateway sees all requests, Redis provides distributed counting. Consistent enforcement.' },
              { id: 'c', text: 'In the database with a counter column', score: 50, feedback: 'Database updates for every request is slow. Redis is much better for this use case.' },
              { id: 'd', text: 'Client-side honor system', score: 10, feedback: 'Never trust clients to self-rate-limit. They can (and will) ignore it.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'API Gateway is the ideal place for rate limiting - it sees all traffic before it reaches services. Use Redis for distributed counting (atomic INCR with TTL). This provides consistent enforcement regardless of which backend service handles the request.',
            hints: JSON.stringify(['Think about where all API traffic passes through', 'Consider distributed counting needs']),
            xpValue: 25,
            orderIndex: 4,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 11: CONSISTENCY & CAP THEOREM
  // ============================================
  {
    title: 'Distributed Consistency',
    slug: 'distributed-consistency',
    description: 'Understand CAP theorem, consistency models, and strategies for handling data consistency in distributed systems.',
    difficulty: 'advanced',
    orderIndex: 31,
    icon: '⚖️',
    colorTheme: '#7c3aed',
    lessons: [
      {
        title: 'CAP Theorem & Consistency Models',
        slug: 'cap-theorem-consistency',
        storyContent: `🌍 GLOBAL DATABASE DILEMMA

"We're expanding to Europe and Asia. Our database is in US-East. Options:
1. Single database: 300ms latency for Asia users
2. Multi-region replicas: But what about consistency?

When a user in Tokyo updates their profile and immediately views it from Singapore, should they see the update?

Welcome to distributed systems consistency challenges!"`,
        orderIndex: 1,
        xpReward: 150,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: CAP Theorem**

Explain the CAP theorem:
- What do C, A, and P stand for?
- Why can you only have 2 of 3?
- Give examples of CP and AP systems
- How does this affect database choices?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'CAP theorem is fundamental to understanding tradeoffs in distributed systems.',
            hints: JSON.stringify(['Think about what happens during a network partition', 'Consider: Can you have both consistency AND availability during a network split?']),
            sampleSolution: `**CAP Theorem Explained:**

**C - Consistency:** Every read gets the most recent write
**A - Availability:** Every request gets a response (not error)
**P - Partition Tolerance:** System works despite network failures

**The Theorem:** During a network partition, you must choose between Consistency and Availability.

**Why Only 2 of 3:**
\`\`\`
Network partition happens (P is required in distributed systems):

Scenario: User writes to Node A, network splits, Node B can't sync

Option 1 (CP): Node B rejects reads until sync
  ✓ Consistent (no stale data)
  ✗ Unavailable (errors during partition)

Option 2 (AP): Node B serves stale data
  ✓ Available (always responds)
  ✗ Inconsistent (might be stale)

Can't have both during partition!
\`\`\`

**Real-World Examples:**

**CP Systems (Consistency over Availability):**
- **MongoDB** (with majority write concern)
- **HBase**
- **Zookeeper**
- Use case: Banking, inventory (correctness critical)

**AP Systems (Availability over Consistency):**
- **Cassandra**
- **DynamoDB** (default)
- **CouchDB**
- Use case: Social feeds, shopping carts (availability critical)

**Important Nuances:**

1. **CAP is about partitions:** When network is healthy, you can have all 3

2. **It's a spectrum:** Tunable consistency (e.g., Cassandra quorum)

3. **PACELC extends CAP:**
\`\`\`
If Partition:
  Choose Availability or Consistency
Else (normal operation):
  Choose Latency or Consistency
\`\`\`

**Database Selection Guide:**
\`\`\`
Need strong consistency? → PostgreSQL, CockroachDB
Need high availability? → Cassandra, DynamoDB
Need both? → Compromise with tunable consistency
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Correctly defined C, A, and P',
              'Explained why you can\'t have all 3 during partition',
              'Gave examples of CP and AP systems',
              'Related to practical database choices'
            ]),
            xpValue: 35,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `You're building a banking system. A user transfers $100 from Account A to Account B. During the transfer, a network partition occurs. What should happen?`,
            options: JSON.stringify([
              { id: 'a', text: 'Complete the transfer on one node, sync later (AP)', feedback: 'Dangerous! Could result in double-spending or lost money if nodes diverge.' },
              { id: 'b', text: 'Reject the transfer until partition heals (CP)', feedback: 'Correct! For financial transactions, consistency is critical. Better to be unavailable than inconsistent.' },
              { id: 'c', text: 'Complete transfer on both nodes independently', feedback: 'This would create inconsistent state - money could be duplicated or lost.' },
              { id: 'd', text: 'Let the user decide which node to trust', feedback: 'Users can\'t make informed decisions about distributed consistency. System must handle this.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Financial systems must prioritize consistency (CP). An inconsistent state (double-spending, lost money) is far worse than temporary unavailability. Users can retry a failed transfer, but fixing inconsistent balances is extremely difficult.',
            hints: JSON.stringify(['Think about the consequences of inconsistency', 'What\'s worse: error message or wrong balance?']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Eventual Consistency**

A user posts a comment. Due to replication lag, other users might not see it immediately.

Design a system that handles eventual consistency gracefully:
- How do you handle "read your own writes"?
- How do you show users their pending changes?
- What's an acceptable consistency window?
- How do you handle conflicts?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Eventual consistency requires careful UX design to avoid confusing users.',
            hints: JSON.stringify(['Think about what the user who posted expects to see', 'Consider optimistic UI updates']),
            sampleSolution: `**Handling Eventual Consistency:**

**1. Read Your Own Writes:**
\`\`\`python
# After user posts comment
def get_comments(post_id, user_id):
    # Read from replica (fast)
    comments = replica.get_comments(post_id)
    
    # Also check user's recent writes (cache/primary)
    user_recent = cache.get(f"user:{user_id}:recent_comments")
    
    # Merge, deduplicate by ID
    return merge_and_dedupe(comments, user_recent)
\`\`\`

**2. Optimistic UI Updates:**
\`\`\`javascript
// Client-side
function postComment(text) {
  // Show immediately (optimistic)
  const tempComment = {
    id: 'temp_' + uuid(),
    text: text,
    status: 'pending',
    author: currentUser
  };
  comments.push(tempComment);
  renderComments();
  
  // Send to server
  api.postComment(text)
    .then(realComment => {
      // Replace temp with real
      replaceComment(tempComment.id, realComment);
    })
    .catch(err => {
      // Show error, remove temp
      markAsFailed(tempComment.id);
    });
}
\`\`\`

**3. Consistency Windows:**
\`\`\`
Use case → Acceptable lag:
- Social comments: 5-30 seconds ✓
- Like counts: 1-5 minutes ✓
- User profile: Read-your-own-writes
- Inventory: Strong consistency required
- Financial: Strong consistency required
\`\`\`

**4. Conflict Resolution Strategies:**

**Last-Write-Wins (LWW):**
\`\`\`
Comment edited on Node A at T1
Comment edited on Node B at T2
Winner: T2 (later timestamp)
\`\`\`
Simple but can lose data.

**Merge (CRDTs):**
\`\`\`
Shopping cart on Node A: [item1, item2]
Shopping cart on Node B: [item1, item3]
Merged: [item1, item2, item3]
\`\`\`
Preserves all changes, works for some data types.

**Application-Level Resolution:**
\`\`\`
Conflict detected → Show both versions to user
"Your document was edited elsewhere. Keep yours or theirs?"
\`\`\`

**5. User Communication:**
\`\`\`
- "Posting..." → "Posted" 
- Show sync indicators
- "Changes may take a moment to appear for others"
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Addressed read-your-own-writes pattern',
              'Mentioned optimistic UI updates',
              'Discussed acceptable consistency windows',
              'Described conflict resolution approaches'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `Your global application needs to show a user's follower count. This count is updated whenever someone follows/unfollows. How should you handle this?`,
            options: JSON.stringify([
              { id: 'a', text: 'Real-time count from primary database', score: 40, feedback: 'Accurate but slow for global users. Every page load queries primary (possibly 300ms away).' },
              { id: 'b', text: 'Cached count, updated via events, accept some staleness', score: 95, feedback: 'Perfect! Follower counts can be slightly stale. Cache locally, update asynchronously via events.' },
              { id: 'c', text: 'Approximate count with sampling', score: 60, feedback: 'Works for huge numbers but unnecessary for typical counts. Exact count is possible with caching.' },
              { id: 'd', text: 'Calculate on every request by counting followers table', score: 20, feedback: 'Extremely slow and wasteful. Never COUNT(*) on hot paths.' },
            ]),
            correctAnswer: JSON.stringify('b'),
            explanation: 'Follower counts are perfect for eventual consistency. Cache the count locally, publish events on follow/unfollow, update caches asynchronously. Users don\'t notice if their follower count is a few seconds stale.',
            hints: JSON.stringify(['Think about how often follower counts change', 'Consider what "accuracy" users actually need']),
            xpValue: 25,
            orderIndex: 4,
          },
          {
            type: 'multi_select',
            scenarioText: `Which of the following scenarios require strong consistency? (Select ALL that apply)`,
            options: JSON.stringify([
              { id: 'a', text: 'Bank account balance after transfer', correct: true },
              { id: 'b', text: 'Social media like count', correct: false },
              { id: 'c', text: 'Inventory count for limited stock item', correct: true },
              { id: 'd', text: 'User profile view count', correct: false },
              { id: 'e', text: 'Distributed lock for critical section', correct: true },
            ]),
            correctAnswer: JSON.stringify(['a', 'c', 'e']),
            explanation: 'Strong consistency is needed when inconsistency causes real problems: money (banks), overselling (inventory), mutual exclusion (locks). Social metrics like likes and view counts can be eventually consistent without user impact.',
            hints: JSON.stringify(['Think about the consequences of stale data', 'What happens if you oversell inventory?']),
            xpValue: 20,
            orderIndex: 5,
          },
        ],
      },
    ],
  },

  // ============================================
  // MODULE 12: MONITORING & OBSERVABILITY
  // ============================================
  {
    title: 'Monitoring & Observability',
    slug: 'monitoring-observability',
    description: 'Build observable systems with metrics, logging, distributed tracing, and alerting for production reliability.',
    difficulty: 'intermediate',
    orderIndex: 32,
    icon: '📊',
    colorTheme: '#059669',
    lessons: [
      {
        title: 'Three Pillars of Observability',
        slug: 'three-pillars-observability',
        storyContent: `🚨 PRODUCTION INCIDENT

"Users report the checkout is slow. We have no idea why. 
- Logs are scattered across 20 services
- We don't know which service is slow
- No way to trace a single request's journey

3 hours to find the issue: one database query missing an index.

Never again. We need proper observability."`,
        orderIndex: 1,
        xpReward: 130,
        questions: [
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Three Pillars of Observability**

Explain the three pillars of observability:
- What are Metrics, Logs, and Traces?
- How do they complement each other?
- What tools would you use for each?
- How do you correlate data across the three?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Metrics, logs, and traces together provide complete visibility into system behavior.',
            hints: JSON.stringify(['Metrics = aggregated numbers, Logs = events, Traces = request journeys', 'Think about how you\'d debug a slow request']),
            sampleSolution: `**Three Pillars of Observability:**

**1. METRICS (Aggregated Measurements)**
\`\`\`
What: Numerical measurements over time
Examples:
  - request_count: 10,000/min
  - error_rate: 0.5%
  - latency_p99: 250ms
  - cpu_usage: 65%

Tools: Prometheus, Datadog, CloudWatch
Visualization: Grafana dashboards

Use for: Alerting, trends, capacity planning
\`\`\`

**2. LOGS (Event Records)**
\`\`\`
What: Discrete events with context
Examples:
  {
    "timestamp": "2024-01-15T10:30:00Z",
    "level": "ERROR",
    "service": "payment-service",
    "message": "Payment failed",
    "user_id": "123",
    "error": "Card declined",
    "trace_id": "abc123"
  }

Tools: ELK Stack, Loki, Splunk
Use for: Debugging, audit trail, searching events
\`\`\`

**3. TRACES (Request Journeys)**
\`\`\`
What: End-to-end request path across services
Example:
  TraceID: abc123
  ├─ API Gateway (5ms)
  │  └─ Auth Service (10ms)
  ├─ Order Service (50ms)
  │  └─ Database Query (35ms) ← SLOW!
  └─ Payment Service (100ms)
  Total: 200ms

Tools: Jaeger, Zipkin, AWS X-Ray
Use for: Finding bottlenecks, understanding flow
\`\`\`

**How They Complement Each Other:**
\`\`\`
Alert fired: "P99 latency > 500ms" (METRIC)
  ↓
Look at traces to find slow requests (TRACE)
  ↓
TraceID: xyz789 shows slow DB query
  ↓
Search logs for that trace_id (LOG)
  ↓
Find: "Query timeout on users table"
  ↓
Root cause: Missing index
\`\`\`

**Correlation:**
\`\`\`
KEY: Include trace_id in everything!

// Log entry
{"trace_id": "abc123", "message": "..."}

// Metric label
http_requests{trace_id="abc123"}

// Trace span
{trace_id: "abc123", spans: [...]}

Now you can jump between all three!
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Defined all three pillars correctly',
              'Gave examples of each',
              'Explained how they complement each other',
              'Mentioned correlation via trace_id'
            ]),
            xpValue: 35,
            orderIndex: 1,
          },
          {
            type: 'multiple_choice',
            scenarioText: `Your team is setting up alerting. Which metric would be the BEST primary alert for user-facing impact?`,
            options: JSON.stringify([
              { id: 'a', text: 'CPU usage > 80%', feedback: 'High CPU doesn\'t necessarily mean user impact. System might still respond fine.' },
              { id: 'b', text: 'Error rate > 1%', feedback: 'Good but might miss slow-but-successful requests that frustrate users.' },
              { id: 'c', text: 'P99 latency > SLA threshold', feedback: 'Close! P99 catches slow requests but might be too sensitive to outliers.' },
              { id: 'd', text: 'Apdex score < 0.9 (user satisfaction)', feedback: 'Correct! Apdex combines latency and errors into a single user satisfaction score. Best reflects actual user experience.' },
            ]),
            correctAnswer: JSON.stringify('d'),
            explanation: 'Apdex (Application Performance Index) measures user satisfaction by classifying responses as Satisfied (<T), Tolerating (T-4T), or Frustrated (>4T or error). Score of 1.0 = perfect, <0.5 = poor. It\'s the best single metric for user-facing impact.',
            hints: JSON.stringify(['Think about what actually affects users', 'Consider both speed and errors']),
            xpValue: 20,
            orderIndex: 2,
          },
          {
            type: 'self_judge',
            scenarioText: `**Design Question: Distributed Tracing**

Design a distributed tracing system for microservices:
- How do you propagate trace context between services?
- What information should each span contain?
- How do you handle asynchronous communication (queues)?
- How do you sample traces at high volume?`,
            options: JSON.stringify([]),
            correctAnswer: JSON.stringify(''),
            explanation: 'Distributed tracing requires context propagation, careful span design, and sampling strategies.',
            hints: JSON.stringify(['Think about HTTP headers for context', 'Consider what happens with message queues']),
            sampleSolution: `**Distributed Tracing Design:**

**1. Context Propagation:**
\`\`\`
HTTP Headers:
  traceparent: 00-{trace_id}-{span_id}-{flags}
  tracestate: vendor=value

Example:
  traceparent: 00-abc123-def456-01
  
Service A → Service B:
  A creates span, puts trace_id in header
  B reads header, creates child span
  B's span.parent_id = A's span_id
\`\`\`

**2. Span Structure:**
\`\`\`json
{
  "trace_id": "abc123",
  "span_id": "span_789",
  "parent_id": "span_456",
  "operation": "POST /checkout",
  "service": "order-service",
  "start_time": "2024-01-15T10:30:00.000Z",
  "duration_ms": 150,
  "status": "OK",
  "tags": {
    "user_id": "u_123",
    "http.method": "POST",
    "http.status_code": 200,
    "db.type": "postgresql"
  },
  "logs": [
    {"time": "...", "message": "Inventory checked"},
    {"time": "...", "message": "Payment initiated"}
  ]
}
\`\`\`

**3. Async Communication (Queues):**
\`\`\`
Producer:
  message.headers["traceparent"] = current_trace_id
  queue.publish(message)

Consumer:
  trace_id = message.headers["traceparent"]
  span = tracer.start_span(
    "process_message",
    parent=trace_id,
    link_type="follows_from"  // Not child, but related
  )
\`\`\`

**4. Sampling Strategies:**
\`\`\`python
# Head-based sampling (decide at start)
def should_sample(trace_id):
    # Sample 1% of traces
    if hash(trace_id) % 100 == 0:
        return True
    # Always sample errors
    # Always sample slow requests (>1s)
    return False

# Tail-based sampling (decide at end)
# Collect all spans, only store interesting traces
# More accurate but more expensive
\`\`\`

**5. Architecture:**
\`\`\`
Services → Trace Collector → Storage → Query/UI
   │           (Jaeger/Zipkin)  (Cassandra/ES)
   │
   └── Also: Logs + Metrics (same trace_id)
\`\`\``,
            evaluationCriteria: JSON.stringify([
              'Explained context propagation mechanism',
              'Defined span structure with key fields',
              'Addressed async/queue tracing',
              'Discussed sampling for high volume'
            ]),
            xpValue: 35,
            orderIndex: 3,
          },
          {
            type: 'trade_off',
            scenarioText: `You're choosing between logging approaches. Your system processes 100,000 requests per second. What's the best strategy?`,
            options: JSON.stringify([
              { id: 'a', text: 'Log everything at DEBUG level to files', score: 20, feedback: 'Logging everything at this volume will fill disks instantly and slow down services.' },
              { id: 'b', text: 'Structured JSON logs at INFO level, sampled at 10%', score: 70, feedback: 'Good approach! Sampling reduces volume while structured logs enable querying. But might miss important events.' },
              { id: 'c', text: 'Structured logs: INFO level always, DEBUG sampled, ERROR always', score: 95, feedback: 'Perfect! Log all important events, sample verbose debugging, never miss errors. Good balance.' },
              { id: 'd', text: 'No logging, rely only on metrics and traces', score: 40, feedback: 'Logs provide context that metrics/traces don\'t. You need all three for observability.' },
            ]),
            correctAnswer: JSON.stringify('c'),
            explanation: 'At high volume, use tiered logging: always log errors and important events (INFO), sample verbose debugging (DEBUG). Use structured JSON for queryability. This balances cost, storage, and debuggability.',
            hints: JSON.stringify(['Consider storage costs at 100K RPS', 'Think about what you MUST capture vs nice-to-have']),
            xpValue: 25,
            orderIndex: 4,
          },
          {
            type: 'multi_select',
            scenarioText: `Which of the following are RED metrics for monitoring request-driven services? (Select ALL that apply)`,
            options: JSON.stringify([
              { id: 'a', text: 'Rate - requests per second', correct: true },
              { id: 'b', text: 'Errors - failed requests per second', correct: true },
              { id: 'c', text: 'Duration - latency distribution', correct: true },
              { id: 'd', text: 'RAM - memory usage', correct: false },
              { id: 'e', text: 'Disk - storage utilization', correct: false },
            ]),
            correctAnswer: JSON.stringify(['a', 'b', 'c']),
            explanation: 'RED metrics (Rate, Errors, Duration) are the essential metrics for request-driven services like APIs. They tell you how many requests, how many fail, and how long they take. RAM and Disk are infrastructure metrics (USE method: Utilization, Saturation, Errors).',
            hints: JSON.stringify(['RED is for requests, USE is for resources', 'Think about what directly affects users']),
            xpValue: 20,
            orderIndex: 5,
          },
        ],
      },
    ],
  },
];
