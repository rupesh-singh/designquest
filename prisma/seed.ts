import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Modules
  const cachingModule = await prisma.module.create({
    data: {
      title: 'Caching Fundamentals',
      slug: 'caching-fundamentals',
      description: 'Learn how caching works, when to use it, and common strategies like Redis and Memcached. Master cache invalidation and TTL strategies.',
      difficulty: 'beginner',
      orderIndex: 1,
      icon: '🗄️',
      colorTheme: '#57534e',
      lessons: {
        create: [
          {
            title: 'Introduction to Caching',
            slug: 'intro-to-caching',
            storyContent: `🚨 URGENT EMAIL FROM YOUR CTO:

"Hey! Our product API is getting hammered. We just got featured on TechCrunch and traffic went from 1,000 to 50,000 requests per minute. The database is at 95% CPU and pages are timing out.

We're losing customers every minute this continues. I need a solution ASAP!"

Your mission: Help the team understand caching and implement a solution to save the day!`,
            orderIndex: 1,
            xpReward: 50,
            questions: {
              create: [
                {
                  type: 'multiple_choice',
                  scenarioText: 'The database is being overwhelmed with repeated requests for the same product data. What is the PRIMARY purpose of implementing a cache?',
                  options: JSON.stringify([
                    { id: 'a', text: 'To permanently store data instead of a database', feedback: 'Caches are temporary storage, not permanent replacements for databases.' },
                    { id: 'b', text: 'To store frequently accessed data in fast memory to reduce database load', feedback: 'Correct! Caching stores hot data in fast storage (like RAM) to serve repeated requests without hitting the database.' },
                    { id: 'c', text: 'To encrypt sensitive data', feedback: 'Encryption is a security feature, not the purpose of caching.' },
                    { id: 'd', text: 'To backup data in case of failures', feedback: 'Backups and caching serve different purposes. Caches are for performance, not durability.' },
                  ]),
                  correctAnswer: JSON.stringify('b'),
                  explanation: 'A cache is a high-speed data storage layer that stores a subset of data, typically transient, so that future requests for that data are served faster. When the same data is requested repeatedly, serving it from a cache (like Redis in memory) is much faster than querying a database.',
                  hints: JSON.stringify(['Think about what happens when 50,000 users request the same product page', 'Consider the speed difference between RAM and disk']),
                  xpValue: 20,
                  orderIndex: 1,
                },
                {
                  type: 'trade_off',
                  scenarioText: `You've decided to implement caching. The product data includes: name, price, description, and stock count. The price rarely changes (once a week), but stock count changes with every purchase.

What's the best caching strategy?`,
                  options: JSON.stringify([
                    { id: 'a', text: 'Cache everything with a 24-hour TTL', score: 40, feedback: 'This would show stale stock counts for up to 24 hours - customers might order out-of-stock items!' },
                    { id: 'b', text: 'Cache static data (name, description) with long TTL, exclude stock from cache', score: 70, feedback: 'Good thinking on separating concerns! But querying stock for every request still hits the database.' },
                    { id: 'c', text: 'Cache everything with short TTL (30 seconds) + invalidate cache when stock changes', score: 100, feedback: 'Excellent! Short TTL + event-driven invalidation balances performance and freshness.' },
                    { id: 'd', text: 'Don\'t cache anything - data consistency is too important', score: 20, feedback: 'This doesn\'t solve the performance problem. There are ways to cache AND maintain reasonable consistency.' },
                  ]),
                  correctAnswer: JSON.stringify('c'),
                  explanation: 'The best approach is to cache with a short TTL AND implement cache invalidation when data changes. This gives you the performance benefits of caching while ensuring data stays fresh. For stock counts, you can either use a very short TTL (30 seconds) or trigger cache invalidation when a purchase occurs.',
                  hints: JSON.stringify(['Consider which data changes frequently vs rarely', 'Think about event-driven cache updates']),
                  xpValue: 25,
                  orderIndex: 2,
                },
                {
                  type: 'multiple_choice',
                  scenarioText: `You're explaining caching to a junior developer. They ask: "What is TTL and why does it matter?"

What's the best explanation?`,
                  options: JSON.stringify([
                    { id: 'a', text: 'TTL (Time To Live) is how long data stays in the cache before being automatically deleted', feedback: 'Correct! TTL ensures cached data doesn\'t become too stale by automatically expiring it.' },
                    { id: 'b', text: 'TTL is the time it takes for data to travel from cache to the user', feedback: 'That would be latency, not TTL.' },
                    { id: 'c', text: 'TTL is the maximum size of data that can be stored in cache', feedback: 'That would be a size limit, not TTL.' },
                    { id: 'd', text: 'TTL is the number of times data can be read from cache', feedback: 'There\'s no limit on read counts. TTL is about time, not access count.' },
                  ]),
                  correctAnswer: JSON.stringify('a'),
                  explanation: 'TTL (Time To Live) defines how long an item remains valid in the cache. After the TTL expires, the cached item is either deleted or marked as stale. This prevents serving outdated data indefinitely. Choosing the right TTL is a balance: too short means more cache misses (defeating the purpose), too long means stale data.',
                  hints: JSON.stringify(['The name "Time To Live" is a hint!']),
                  xpValue: 15,
                  orderIndex: 3,
                },
                {
                  type: 'multi_select',
                  scenarioText: 'Which of the following are valid caching strategies? (Select ALL that apply)',
                  options: JSON.stringify([
                    { id: 'a', text: 'Cache-Aside (Lazy Loading): Application checks cache first, loads from DB on miss', correct: true },
                    { id: 'b', text: 'Write-Through: Write to cache and database simultaneously', correct: true },
                    { id: 'c', text: 'Write-Behind (Write-Back): Write to cache first, async write to database later', correct: true },
                    { id: 'd', text: 'Read-Forward: Database automatically pushes data to cache', correct: false },
                    { id: 'e', text: 'Cache-Forward: A made-up term that doesn\'t exist', correct: false },
                  ]),
                  correctAnswer: JSON.stringify(['a', 'b', 'c']),
                  explanation: 'The three main caching patterns are: 1) Cache-Aside (app manages cache), 2) Write-Through (sync writes to both), and 3) Write-Behind (async DB writes). "Read-Forward" and "Cache-Forward" are not real caching patterns. Knowing these patterns helps you choose the right strategy for different use cases.',
                  hints: JSON.stringify(['Think about the relationship between reads, writes, cache, and database', 'Some options are made up!']),
                  xpValue: 25,
                  orderIndex: 4,
                },
              ],
            },
          },
          {
            title: 'Cache Invalidation Strategies',
            slug: 'cache-invalidation',
            storyContent: `📧 FOLLOW-UP FROM YOUR TECH LEAD:

"Great job implementing caching! Traffic is handled smoothly now. But we have a new problem...

Marketing just ran a flash sale and updated prices for 500 products. Customers are seeing OLD prices from the cache and getting upset when checkout shows different amounts.

We need a cache invalidation strategy!"

Your mission: Learn how to keep cache data fresh and consistent.`,
            orderIndex: 2,
            xpReward: 60,
            questions: {
              create: [
                {
                  type: 'multiple_choice',
                  scenarioText: '"There are only two hard things in Computer Science: cache invalidation and naming things." - Phil Karlton\n\nWhy is cache invalidation considered so difficult?',
                  options: JSON.stringify([
                    { id: 'a', text: 'Because caches are slow to update', feedback: 'Actually, caches are very fast to update. The challenge is knowing WHEN to update.' },
                    { id: 'b', text: 'Because determining when cached data is stale and should be refreshed is complex', feedback: 'Correct! The challenge is knowing when data has changed and ensuring all caches are updated consistently.' },
                    { id: 'c', text: 'Because caches can only store small amounts of data', feedback: 'Size isn\'t the main issue. Modern caches like Redis can store terabytes of data.' },
                    { id: 'd', text: 'Because cache servers are expensive', feedback: 'Cost isn\'t the primary challenge with cache invalidation.' },
                  ]),
                  correctAnswer: JSON.stringify('b'),
                  explanation: 'Cache invalidation is hard because: 1) You need to know when source data changes, 2) In distributed systems, you might have multiple cache copies, 3) Race conditions can cause inconsistencies, 4) Cascading invalidations can be complex. The challenge is maintaining data consistency across the system.',
                  hints: JSON.stringify(['Think about what makes data "stale"', 'Consider distributed systems with multiple cache nodes']),
                  xpValue: 20,
                  orderIndex: 1,
                },
                {
                  type: 'trade_off',
                  scenarioText: `For the flash sale price update problem, which invalidation strategy would you recommend?

Context:
- 500 products need price updates
- Users are currently seeing stale prices
- Sales are time-sensitive`,
                  options: JSON.stringify([
                    { id: 'a', text: 'Wait for TTL to expire naturally', score: 20, feedback: 'Too slow! Customers will see wrong prices until TTL expires (could be hours).' },
                    { id: 'b', text: 'Delete the entire cache', score: 50, feedback: 'Works but overkill - you\'d lose ALL cached data, causing a "thundering herd" to hit the database.' },
                    { id: 'c', text: 'Publish a "price updated" event that triggers cache invalidation for affected products', score: 100, feedback: 'Perfect! Event-driven invalidation is precise, fast, and scalable.' },
                    { id: 'd', text: 'Set all product cache TTL to 1 second', score: 30, feedback: 'This would cause too many cache misses and defeat the purpose of caching.' },
                  ]),
                  correctAnswer: JSON.stringify('c'),
                  explanation: 'Event-driven cache invalidation is the best approach for targeted updates. When a price changes, publish an event (e.g., to Kafka or Redis Pub/Sub) that triggers cache invalidation for just that product. This is precise (only affects changed data), fast (near real-time), and doesn\'t impact other cached data.',
                  hints: JSON.stringify(['Consider precision vs blast radius', 'Think about pub/sub patterns']),
                  xpValue: 30,
                  orderIndex: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const loadBalancingModule = await prisma.module.create({
    data: {
      title: 'Load Balancing',
      slug: 'load-balancing',
      description: 'Learn how to distribute traffic across multiple servers, understand different algorithms, and handle server failures gracefully.',
      difficulty: 'beginner',
      orderIndex: 2,
      icon: '⚖️',
      colorTheme: '#4a7c6f',
      lessons: {
        create: [
          {
            title: 'Load Balancing Basics',
            slug: 'lb-basics',
            storyContent: `🚀 YOUR STARTUP IS GROWING!

Your e-commerce platform now has 100,000 daily users. A single server can't handle the load anymore - it keeps crashing during peak hours.

The DevOps team suggests: "We need to add more servers and put a load balancer in front of them."

Your mission: Understand how load balancers work and choose the right strategy!`,
            orderIndex: 1,
            xpReward: 50,
            questions: {
              create: [
                {
                  type: 'multiple_choice',
                  scenarioText: 'What is the PRIMARY function of a load balancer?',
                  options: JSON.stringify([
                    { id: 'a', text: 'To cache frequently accessed data', feedback: 'Caching is a different component. Load balancers focus on traffic distribution.' },
                    { id: 'b', text: 'To distribute incoming traffic across multiple backend servers', feedback: 'Correct! Load balancers distribute requests to prevent any single server from being overwhelmed.' },
                    { id: 'c', text: 'To store user session data', feedback: 'Session storage is typically handled by other components like Redis.' },
                    { id: 'd', text: 'To compress data before sending to users', feedback: 'Compression can be done at various layers, but it\'s not the main purpose of load balancing.' },
                  ]),
                  correctAnswer: JSON.stringify('b'),
                  explanation: 'A load balancer sits between clients and servers, distributing incoming requests across multiple backend servers. This: 1) Prevents any single server from being overwhelmed, 2) Provides redundancy if a server fails, 3) Allows horizontal scaling by adding more servers.',
                  hints: JSON.stringify(['Think about the word "balance" in load balancer', 'Consider what happens when you have multiple servers']),
                  xpValue: 20,
                  orderIndex: 1,
                },
                {
                  type: 'trade_off',
                  scenarioText: `You have 3 servers with different specs:
- Server A: 8 CPU cores, 32GB RAM (powerful)
- Server B: 4 CPU cores, 16GB RAM (medium)
- Server C: 2 CPU cores, 8GB RAM (small)

Which load balancing algorithm would be MOST efficient?`,
                  options: JSON.stringify([
                    { id: 'a', text: 'Round Robin - send requests to each server in rotation', score: 50, feedback: 'Round Robin treats all servers equally, but Server A can handle more than Server C. You\'d underutilize A and overload C.' },
                    { id: 'b', text: 'Weighted Round Robin - send more requests to powerful servers', score: 100, feedback: 'Perfect! Weighted distribution accounts for server capacity differences.' },
                    { id: 'c', text: 'Random - randomly pick a server for each request', score: 40, feedback: 'Random doesn\'t account for server capacity and can lead to uneven distribution.' },
                    { id: 'd', text: 'Always send to Server A since it\'s most powerful', score: 20, feedback: 'This defeats the purpose of having multiple servers and creates a single point of failure.' },
                  ]),
                  correctAnswer: JSON.stringify('b'),
                  explanation: 'Weighted Round Robin assigns weights based on server capacity. Server A might get weight 4, Server B weight 2, and Server C weight 1. This means Server A handles 4x more requests than Server C, matching their relative capacities. This maximizes resource utilization across heterogeneous servers.',
                  hints: JSON.stringify(['Consider each server\'s capacity', 'Think about proportional distribution']),
                  xpValue: 25,
                  orderIndex: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const databaseModule = await prisma.module.create({
    data: {
      title: 'Database Scaling',
      slug: 'database-scaling',
      description: 'Master database replication, sharding, and choosing between SQL and NoSQL for different use cases.',
      difficulty: 'intermediate',
      orderIndex: 3,
      icon: '🗃️',
      colorTheme: '#92400e',
      lessons: {
        create: [
          {
            title: 'SQL vs NoSQL',
            slug: 'sql-vs-nosql',
            storyContent: `💼 NEW PROJECT KICKOFF

You're the tech lead for a new social media app. The PM shares the requirements:
- User profiles with structured data
- Posts with variable content (text, images, polls, etc.)
- Real-time activity feeds
- Expected scale: 10M users in year 1

The team is debating: "Should we use PostgreSQL, MongoDB, or both?"

Your mission: Understand when to use SQL vs NoSQL databases!`,
            orderIndex: 1,
            xpReward: 70,
            questions: {
              create: [
                {
                  type: 'multiple_choice',
                  scenarioText: 'For storing USER PROFILES (name, email, settings, subscription status), which database type is generally better?',
                  options: JSON.stringify([
                    { id: 'a', text: 'SQL (PostgreSQL/MySQL) - because user data is structured and relational', feedback: 'Correct! User profiles have a consistent schema and often need joins with other tables (orders, subscriptions, etc.).' },
                    { id: 'b', text: 'NoSQL (MongoDB) - because it\'s faster', feedback: 'NoSQL isn\'t inherently faster. SQL is better here due to the structured nature of user data.' },
                    { id: 'c', text: 'File system - just store JSON files', feedback: 'Files don\'t provide querying, indexing, or ACID guarantees needed for user data.' },
                    { id: 'd', text: 'It doesn\'t matter - both work equally well', feedback: 'The choice matters! SQL\'s structure and relationships are better suited for user profiles.' },
                  ]),
                  correctAnswer: JSON.stringify('a'),
                  explanation: 'SQL databases excel for user profiles because: 1) User data has a consistent schema (every user has name, email, etc.), 2) You need ACID transactions (e.g., subscription upgrades), 3) You\'ll join user data with other tables (orders, posts), 4) Complex queries like "find all premium users who signed up last month" are natural in SQL.',
                  hints: JSON.stringify(['Think about data structure and consistency', 'Consider what queries you\'ll need']),
                  xpValue: 20,
                  orderIndex: 1,
                },
                {
                  type: 'trade_off',
                  scenarioText: `For storing POSTS (which can be text, images, polls, or mixed), which approach is best?`,
                  options: JSON.stringify([
                    { id: 'a', text: 'SQL with a rigid schema (separate tables for text posts, image posts, poll posts)', score: 40, feedback: 'This works but gets messy as you add new post types. Many joins needed to fetch a feed.' },
                    { id: 'b', text: 'SQL with JSON column for flexible content', score: 75, feedback: 'Good middle ground! PostgreSQL\'s JSONB is powerful. But querying nested JSON can be complex.' },
                    { id: 'c', text: 'NoSQL (MongoDB) with flexible documents', score: 90, feedback: 'Great choice! Document model naturally fits posts with varying structures. Easy to evolve schema.' },
                    { id: 'd', text: 'Store everything as plain text', score: 20, feedback: 'You\'d lose the ability to query by content type, author, date, etc.' },
                  ]),
                  correctAnswer: JSON.stringify('c'),
                  explanation: 'MongoDB excels for posts because: 1) Posts have varying structures (text-only vs image+caption vs poll), 2) Schema can evolve easily (add new post types), 3) Each post is self-contained (no joins needed), 4) Good for write-heavy workloads. However, the "best" answer in real life might be option B (PostgreSQL with JSONB) if you need transactions and already use PostgreSQL.',
                  hints: JSON.stringify(['Consider schema flexibility', 'Think about how often the data structure might change']),
                  xpValue: 25,
                  orderIndex: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create some badges
  await prisma.badge.createMany({
    data: [
      {
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        criteria: JSON.stringify({ type: 'lessons_completed', count: 1 }),
        xpBonus: 50,
      },
      {
        name: 'Cache Master',
        description: 'Complete the Caching Fundamentals module',
        icon: '🗄️',
        criteria: JSON.stringify({ type: 'module_completed', moduleSlug: 'caching-fundamentals' }),
        xpBonus: 100,
      },
      {
        name: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        criteria: JSON.stringify({ type: 'streak', days: 7 }),
        xpBonus: 150,
      },
      {
        name: 'Perfect Score',
        description: 'Get 100% on any lesson',
        icon: '⭐',
        criteria: JSON.stringify({ type: 'perfect_score' }),
        xpBonus: 75,
      },
    ],
  });

  console.log('✅ Seeding complete!');
  console.log(`Created modules: ${cachingModule.title}, ${loadBalancingModule.title}, ${databaseModule.title}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
