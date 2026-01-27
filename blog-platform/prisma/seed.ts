import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // Create users
  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'Full-stack developer and tech enthusiast',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      bio: 'Content creator and writer',
    },
  })

  // Create tags
  const tagJS = await prisma.tag.create({
    data: {
      name: 'JavaScript',
      slug: 'javascript',
    },
  })

  const tagReact = await prisma.tag.create({
    data: {
      name: 'React',
      slug: 'react',
    },
  })

  const tagNextJS = await prisma.tag.create({
    data: {
      name: 'Next.js',
      slug: 'nextjs',
    },
  })

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with Next.js 14',
      slug: 'getting-started-nextjs-14',
      content: 'Next.js 14 brings exciting new features...',
      excerpt: 'Learn about the latest features in Next.js 14',
      published: true,
      publishedAt: new Date(),
      authorId: user1.id,
      tags: {
        create: [
          { tag: { connect: { id: tagNextJS.id } } },
          { tag: { connect: { id: tagReact.id } } },
        ],
      },
    },
  })

  const post2 = await prisma.post.create({
    data: {
      title: 'Understanding React Server Components',
      slug: 'understanding-react-server-components',
      content: 'React Server Components are a new way...',
      excerpt: 'Deep dive into React Server Components',
      published: true,
      publishedAt: new Date(),
      authorId: user1.id,
      tags: {
        create: [
          { tag: { connect: { id: tagReact.id } } },
        ],
      },
    },
  })

  const post3 = await prisma.post.create({
    data: {
      title: 'JavaScript ES2024 Features',
      slug: 'javascript-es2024-features',
      content: 'ES2024 introduces several new features...',
      excerpt: 'Explore the newest JavaScript features',
      published: true, // Draft
       publishedAt: new Date(),
      authorId: user2.id,
      tags: {
        create: [
          { tag: { connect: { id: tagJS.id } } },
        ],
      },
    },
  })

  // Create comments
  await prisma.comment.create({
    data: {
      content: 'Great article! Very helpful.',
      postId: post1.id,
      authorId: user2.id,
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })