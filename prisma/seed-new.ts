import { PrismaClient } from '@prisma/client';
import { batch1Modules } from './questions/batch1';
import { batch2Modules } from './questions/batch2';
import { batch3Modules } from './questions/batch3';
import { batch4Modules } from './questions/batch4';
import { batch5Modules } from './questions/batch5';
import { batch6Modules } from './questions/batch6';
import { batch7Modules } from './questions/batch7';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.userProgress.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.question.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.badge.deleteMany();

  // ============================================
  // ORIGINAL MODULES (Caching, Load Balancing, DB Basics)
  // ============================================
  
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
                  explanation: 'The best approach is to cache with a short TTL AND implement cache invalidation when data changes. This gives you the performance benefits of caching while ensuring data stays fresh.',
                  hints: JSON.stringify(['Consider which data changes frequently vs rarely', 'Think about event-driven cache updates']),
                  xpValue: 25,
                  orderIndex: 2,
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
                  explanation: 'The three main caching patterns are: 1) Cache-Aside (app manages cache), 2) Write-Through (sync writes to both), and 3) Write-Behind (async DB writes).',
                  hints: JSON.stringify(['Think about the relationship between reads, writes, cache, and database', 'Some options are made up!']),
                  xpValue: 25,
                  orderIndex: 3,
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
                  explanation: 'A load balancer sits between clients and servers, distributing incoming requests across multiple backend servers.',
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
                    { id: 'a', text: 'Round Robin - send requests to each server in rotation', score: 50, feedback: 'Round Robin treats all servers equally, but Server A can handle more than Server C.' },
                    { id: 'b', text: 'Weighted Round Robin - send more requests to powerful servers', score: 100, feedback: 'Perfect! Weighted distribution accounts for server capacity differences.' },
                    { id: 'c', text: 'Random - randomly pick a server for each request', score: 40, feedback: 'Random doesn\'t account for server capacity and can lead to uneven distribution.' },
                    { id: 'd', text: 'Always send to Server A since it\'s most powerful', score: 20, feedback: 'This defeats the purpose of having multiple servers and creates a single point of failure.' },
                  ]),
                  correctAnswer: JSON.stringify('b'),
                  explanation: 'Weighted Round Robin assigns weights based on server capacity. This maximizes resource utilization across heterogeneous servers.',
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

  // ============================================
  // NEW BATCH 1 MODULES (URL Shortener, Rate Limiting, DB Scaling, Message Queues, API Design)
  // ============================================
  
  console.log('📦 Creating batch 1 modules...');
  
  for (const moduleData of batch1Modules) {
    await prisma.module.create({
      data: {
        title: moduleData.title,
        slug: moduleData.slug,
        description: moduleData.description,
        difficulty: moduleData.difficulty,
        orderIndex: moduleData.orderIndex,
        icon: moduleData.icon,
        colorTheme: moduleData.colorTheme,
        lessons: {
          create: moduleData.lessons.map(lesson => ({
            title: lesson.title,
            slug: lesson.slug,
            storyContent: lesson.storyContent,
            orderIndex: lesson.orderIndex,
            xpReward: lesson.xpReward,
            questions: {
              create: lesson.questions.map(q => ({
                type: q.type,
                scenarioText: q.scenarioText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                hints: q.hints,
                xpValue: q.xpValue,
                orderIndex: q.orderIndex,
              })),
            },
          })),
        },
      },
    });
    console.log(`  ✅ Created module: ${moduleData.title}`);
  }

  // ============================================
  // BATCH 2 MODULES (Microservices, CDN, Search, Notifications)
  // ============================================
  
  console.log('📦 Creating batch 2 modules...');
  
  for (const moduleData of batch2Modules) {
    await prisma.module.create({
      data: {
        title: moduleData.title,
        slug: moduleData.slug,
        description: moduleData.description,
        difficulty: moduleData.difficulty,
        orderIndex: moduleData.orderIndex,
        icon: moduleData.icon,
        colorTheme: moduleData.colorTheme,
        lessons: {
          create: moduleData.lessons.map(lesson => ({
            title: lesson.title,
            slug: lesson.slug,
            storyContent: lesson.storyContent,
            orderIndex: lesson.orderIndex,
            xpReward: lesson.xpReward,
            questions: {
              create: lesson.questions.map(q => ({
                type: q.type,
                scenarioText: q.scenarioText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                hints: q.hints,
                xpValue: q.xpValue,
                orderIndex: q.orderIndex,
              })),
            },
          })),
        },
      },
    });
    console.log(`  ✅ Created module: ${moduleData.title}`);
  }

  // ============================================
  // BATCH 3 MODULES (Auth, Security, Consistency, Monitoring)
  // ============================================
  
  console.log('📦 Creating batch 3 modules...');
  
  for (const moduleData of batch3Modules) {
    await prisma.module.create({
      data: {
        title: moduleData.title,
        slug: moduleData.slug,
        description: moduleData.description,
        difficulty: moduleData.difficulty,
        orderIndex: moduleData.orderIndex,
        icon: moduleData.icon,
        colorTheme: moduleData.colorTheme,
        lessons: {
          create: moduleData.lessons.map(lesson => ({
            title: lesson.title,
            slug: lesson.slug,
            storyContent: lesson.storyContent,
            orderIndex: lesson.orderIndex,
            xpReward: lesson.xpReward,
            questions: {
              create: lesson.questions.map(q => ({
                type: q.type,
                scenarioText: q.scenarioText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                hints: q.hints,
                xpValue: q.xpValue,
                orderIndex: q.orderIndex,
              })),
            },
          })),
        },
      },
    });
    console.log(`  ✅ Created module: ${moduleData.title}`);
  }

  // ============================================
  // BATCH 4 MODULES (Twitter, Netflix, Uber, WhatsApp)
  // ============================================
  
  console.log('📦 Creating batch 4 modules...');
  
  for (const moduleData of batch4Modules) {
    await prisma.module.create({
      data: {
        title: moduleData.title,
        slug: moduleData.slug,
        description: moduleData.description,
        difficulty: moduleData.difficulty,
        orderIndex: moduleData.orderIndex,
        icon: moduleData.icon,
        colorTheme: moduleData.colorTheme,
        lessons: {
          create: moduleData.lessons.map(lesson => ({
            title: lesson.title,
            slug: lesson.slug,
            storyContent: lesson.storyContent,
            orderIndex: lesson.orderIndex,
            xpReward: lesson.xpReward,
            questions: {
              create: lesson.questions.map(q => ({
                type: q.type,
                scenarioText: q.scenarioText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                hints: q.hints,
                xpValue: q.xpValue,
                orderIndex: q.orderIndex,
              })),
            },
          })),
        },
      },
    });
    console.log(`  ✅ Created module: ${moduleData.title}`);
  }

  // ============================================
  // BATCH 5 MODULES (Instagram, YouTube, Dropbox, Google Docs, Ticketmaster)
  // ============================================
  
  console.log('📦 Creating batch 5 modules...');
  
  for (const moduleData of batch5Modules) {
    await prisma.module.create({
      data: {
        title: moduleData.title,
        slug: moduleData.slug,
        description: moduleData.description,
        difficulty: moduleData.difficulty,
        orderIndex: moduleData.orderIndex,
        icon: moduleData.icon,
        colorTheme: moduleData.colorTheme,
        lessons: {
          create: moduleData.lessons.map(lesson => ({
            title: lesson.title,
            slug: lesson.slug,
            storyContent: lesson.storyContent,
            orderIndex: lesson.orderIndex,
            xpReward: lesson.xpReward,
            questions: {
              create: lesson.questions.map(q => ({
                type: q.type,
                scenarioText: q.scenarioText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                hints: q.hints,
                xpValue: q.xpValue,
                orderIndex: q.orderIndex,
              })),
            },
          })),
        },
      },
    });
    console.log(`  ✅ Created module: ${moduleData.title}`);
  }

  // ============================================
  // BATCH 6 MODULES (Payment, Ads, Analytics, Advanced Patterns, OOD)
  // ============================================
  
  console.log('📦 Creating batch 6 modules...');
  
  for (const moduleData of batch6Modules) {
    await prisma.module.create({
      data: {
        title: moduleData.title,
        slug: moduleData.slug,
        description: moduleData.description,
        difficulty: moduleData.difficulty,
        orderIndex: moduleData.orderIndex,
        icon: moduleData.icon,
        colorTheme: moduleData.colorTheme,
        lessons: {
          create: moduleData.lessons.map(lesson => ({
            title: lesson.title,
            slug: lesson.slug,
            storyContent: lesson.storyContent,
            orderIndex: lesson.orderIndex,
            xpReward: lesson.xpReward,
            questions: {
              create: lesson.questions.map(q => ({
                type: q.type,
                scenarioText: q.scenarioText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                hints: q.hints,
                xpValue: q.xpValue,
                orderIndex: q.orderIndex,
              })),
            },
          })),
        },
      },
    });
    console.log(`  ✅ Created module: ${moduleData.title}`);
  }

  // ============================================
  // BATCH 7 MODULES (Karat-style scenario questions)
  // ============================================
  
  console.log('📦 Creating batch 7 modules...');
  
  for (const moduleData of batch7Modules) {
    await prisma.module.create({
      data: {
        title: moduleData.title,
        slug: moduleData.slug,
        description: moduleData.description,
        difficulty: moduleData.difficulty,
        orderIndex: moduleData.orderIndex,
        icon: moduleData.icon,
        colorTheme: moduleData.colorTheme,
        lessons: {
          create: moduleData.lessons.map(lesson => ({
            title: lesson.title,
            slug: lesson.slug,
            storyContent: lesson.storyContent,
            orderIndex: lesson.orderIndex,
            xpReward: lesson.xpReward,
            questions: {
              create: lesson.questions.map(q => ({
                type: q.type,
                scenarioText: q.scenarioText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                hints: q.hints,
                xpValue: q.xpValue,
                orderIndex: q.orderIndex,
              })),
            },
          })),
        },
      },
    });
    console.log(`  ✅ Created module: ${moduleData.title}`);
  }

  // ============================================
  // BADGES
  // ============================================
  
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
      {
        name: 'System Designer',
        description: 'Complete 5 self-judge design questions',
        icon: '🏗️',
        criteria: JSON.stringify({ type: 'self_judge_completed', count: 5 }),
        xpBonus: 100,
      },
      {
        name: 'API Architect',
        description: 'Complete the API Design module',
        icon: '🔌',
        criteria: JSON.stringify({ type: 'module_completed', moduleSlug: 'api-design' }),
        xpBonus: 100,
      },
    ],
  });

  console.log('');
  console.log('✅ Seeding complete!');
  console.log('');
  console.log('📊 Summary:');
  const moduleCount = await prisma.module.count();
  const lessonCount = await prisma.lesson.count();
  const questionCount = await prisma.question.count();
  console.log(`   Modules: ${moduleCount}`);
  console.log(`   Lessons: ${lessonCount}`);
  console.log(`   Questions: ${questionCount}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
