## Phase 1: Project Setup & Foundation (Week 1)

### Day 1-2: Initial Setup

#### Exercise 1.1: Create Next.js Project
**Objective:** Set up a new Next.js project with all necessary dependencies.

**Steps:**
```bash
# Create new Next.js app
npx create-next-app@latest blog-platform

# When prompted, select:
# ✓ TypeScript: Yes (or No if using JavaScript)
# ✓ ESLint: Yes
# ✓ Tailwind CSS: Yes
# ✓ src/ directory: No
# ✓ App Router: Yes
# ✓ Turbopack: Yes (for faster development)
# ✓ Import alias: @/* (default)

cd blog-platform
```

**Install Additional Dependencies:**
```bash
# Core dependencies
npm install prisma @prisma/client next-auth@beta zod react-hook-form
npm install @hookform/resolvers date-fns

# UI and Editor
npm install @tiptap/react @tiptap/starter-kit
npm install lucide-react react-hot-toast

# Development dependencies
npm install -D prettier eslint-config-prettier
```

**Deliverable:** A working Next.js project that runs with `npm run dev`

**Help:**
- If you get port conflicts, use `npm run dev -- -p 3001` to use a different port
- Make sure Node.js version is 18.17 or higher: `node --version`

---

#### Exercise 1.2: Project Structure Setup
**Objective:** Create the folder structure and basic layout components.

**Tasks:**
1. Create all folders as shown in the project structure above
2. Create a root layout with basic HTML structure
3. Create placeholder pages for main routes

**Root Layout (`app/layout.tsx`):**
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Blog Platform',
  description: 'A modern blogging platform built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

**Create Basic Pages:**

`app/(blog)/page.tsx`:
```tsx
export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">Welcome to Our Blog</h1>
      <p className="mt-4 text-gray-600">
        This is the homepage. Coming soon!
      </p>
    </main>
  )
}
```

`app/(blog)/blog/page.tsx`:
```tsx
export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">All Blog Posts</h1>
      <p className="mt-4 text-gray-600">
        Blog posts will appear here.
      </p>
    </main>
  )
}
```

**Deliverable:** Navigation between home and blog pages works

---

#### Exercise 1.3: Create Layout Components
**Objective:** Build reusable Header and Footer components.

**Header Component (`components/layout/Header.tsx`):**
```tsx
import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            BlogPlatform
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/blog" className="hover:text-blue-600">
              Blog
            </Link>
            <Link href="/about" className="hover:text-blue-600">
              About
            </Link>
            <Link href="/login" className="hover:text-blue-600">
              Login
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
```

**Footer Component (`components/layout/Footer.tsx`):**
```tsx
export default function Footer() {
  return (
    <footer className="border-t mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            © 2024 BlogPlatform. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Twitter
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

**Update Blog Layout (`app/(blog)/layout.tsx`):**
```tsx
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
```

**Deliverable:** Consistent header and footer on all blog pages

**Help:**
- The `(blog)` folder with parentheses creates a route group that doesn't affect the URL
- Layout components wrap all pages in that group

---

### Day 3-4: Database Setup

#### Exercise 1.4: Prisma Setup
**Objective:** Set up Prisma with PostgreSQL and create the database schema.

**Step 1: Initialize Prisma**
```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` file
- `.env` file with DATABASE_URL

**Step 2: Update `.env` file**

For local development with PostgreSQL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/blog_db?schema=public"
```

For local development with SQLite (easier for beginners):
```env
DATABASE_URL="file:./dev.db"
```

**Step 3: Create Database Schema (`prisma/schema.prisma`):**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // or "sqlite" for local dev
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // For email/password auth
  bio           String?   @db.Text
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  bookmarks     Bookmark[]
  
  @@map("users")
}

model Post {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  content       String    @db.Text
  excerpt       String?   @db.Text
  coverImage    String?
  published     Boolean   @default(false)
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Foreign Keys
  authorId      String
  author        User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  // Relations
  tags          PostTag[]
  comments      Comment[]
  likes         Like[]
  bookmarks     Bookmark[]
  
  // Indexes for better query performance
  @@index([slug])
  @@index([authorId])
  @@index([publishedAt])
  @@map("posts")
}

model Tag {
  id            String    @id @default(cuid())
  name          String    @unique
  slug          String    @unique
  createdAt     DateTime  @default(now())
  
  // Relations
  posts         PostTag[]
  
  @@map("tags")
}

model PostTag {
  postId        String
  tagId         String
  
  post          Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag           Tag       @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([postId, tagId])
  @@map("post_tags")
}

model Comment {
  id            String    @id @default(cuid())
  content       String    @db.Text
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Foreign Keys
  postId        String
  authorId      String
  parentId      String?   // For nested comments
  
  // Relations
  post          Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  author        User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parent        Comment?  @relation("CommentToComment", fields: [parentId], references: [id], onDelete: Cascade)
  replies       Comment[] @relation("CommentToComment")
  likes         Like[]
  
  @@index([postId])
  @@index([authorId])
  @@map("comments")
}

model Like {
  id            String    @id @default(cuid())
  createdAt     DateTime  @default(now())
  
  // Foreign Keys
  userId        String
  postId        String?
  commentId     String?
  
  // Relations
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  post          Post?     @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment       Comment?  @relation(fields: [commentId], references: [id], onDelete: Cascade)
  
  // User can only like a post or comment once
  @@unique([userId, postId])
  @@unique([userId, commentId])
  @@map("likes")
}

model Bookmark {
  id            String    @id @default(cuid())
  createdAt     DateTime  @default(now())
  
  // Foreign Keys
  userId        String
  postId        String
  
  // Relations
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  post          Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  // User can only bookmark a post once
  @@unique([userId, postId])
  @@map("bookmarks")
}
```

**Step 4: Create Prisma Client (`lib/prisma.ts`):**
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 5: Run Migrations**
```bash
# Create and apply migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

**Deliverable:** Database is set up and you can view it with `npx prisma studio`

**Help:**
- If using SQLite, it will create a `dev.db` file in the prisma folder
- Prisma Studio (browser UI) opens at http://localhost:5555
- Common error: If migration fails, check DATABASE_URL in .env

---

#### Exercise 1.5: Seed Database with Sample Data
**Objective:** Create seed script to populate database with test data.

**Create Seed File (`prisma/seed.ts`):**
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
      published: false, // Draft
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

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Update `package.json` to add seed script:**
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

**Install ts-node (if using TypeScript):**
```bash
npm install -D ts-node
```

**Run Seed:**
```bash
npx prisma db seed
```

**Deliverable:** Database has sample users, posts, tags, and comments visible in Prisma Studio

---

### Day 5-7: Display Blog Posts

#### Exercise 1.6: Fetch and Display Posts on Homepage
**Objective:** Create the homepage that displays recent blog posts.

**Create Server Component to Fetch Posts (`app/(blog)/page.tsx`):**
```tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistance } from 'date-fns'

async function getRecentPosts() {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 6,
  })

  return posts
}

export default async function HomePage() {
  const posts = await getRecentPosts()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to Our Blog
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover stories, thinking, and expertise from writers on any topic.
        </p>
        <Link
          href="/blog"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Start Reading
        </Link>
      </section>

      {/* Recent Posts */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold mb-8">Recent Posts</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {post.coverImage && (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  {post.tags.slice(0, 2).map((postTag) => (
                    <span
                      key={postTag.tag.id}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {postTag.tag.name}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-blue-600"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {post.author.image && (
                      <Image
                        src={post.author.image}
                        alt={post.author.name || 'Author'}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span>{post.author.name}</span>
                  </div>
                  <div className="flex gap-4">
                    <span>{post._count.comments} comments</span>
                    <span>{post._count.likes} likes</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {post.publishedAt &&
                    formatDistance(new Date(post.publishedAt), new Date(), {
                      addSuffix: true,
                    })}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
```

**Deliverable:** Homepage displays 6 recent blog posts with author info and metadata

**Help:**
- `line-clamp-2` is a Tailwind utility to truncate text to 2 lines
- The `_count` in Prisma query gives you the count of related records
- Server components can directly query the database (no API route needed)

---

#### Exercise 1.7: Create Blog Listing Page with Pagination
**Objective:** Build the `/blog` page that shows all posts with pagination.

**Create Blog Page (`app/(blog)/blog/page.tsx`):**
```tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDistance } from 'date-fns'

const POSTS_PER_PAGE = 10

async function getPosts(page: number) {
  const skip = (page - 1) * POSTS_PER_PAGE

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        tags: {
          include: { tag: true },
          take: 3,
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: POSTS_PER_PAGE,
    }),
    prisma.post.count({ where: { published: true } }),
  ])

  return {
    posts,
    total,
    totalPages: Math.ceil(total / POSTS_PER_PAGE),
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams.page) || 1
  const { posts, total, totalPages } = await getPosts(currentPage)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">All Blog Posts</h1>
      <p className="text-gray-600 mb-8">
        {total} {total === 1 ? 'post' : 'posts'} published
      </p>

      <div className="space-y-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="border-b pb-8 last:border-b-0"
          >
            <div className="flex gap-2 mb-3">
              {post.tags.map((postTag) => (
                <Link
                  key={postTag.tag.id}
                  href={`/tag/${postTag.tag.slug}`}
                  className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                >
                  {postTag.tag.name}
                </Link>
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-2">
              <Link
                href={`/blog/${post.slug}`}
                className="hover:text-blue-600"
              >
                {post.title}
              </Link>
            </h2>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span>{post.author.name}</span>
              <span>•</span>
              <span>
                {post.publishedAt &&
                  formatDistance(new Date(post.publishedAt), new Date(), {
                    addSuffix: true,
                  })}
              </span>
              <span>•</span>
              <span>{post._count.comments} comments</span>
              <span>•</span>
              <span>{post._count.likes} likes</span>
            </div>

            {post.excerpt && (
              <p className="text-gray-700 mb-4">{post.excerpt}</p>
            )}

            <Link
              href={`/blog/${post.slug}`}
              className="text-blue-600 hover:underline"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {currentPage > 1 && (
            <Link
              href={`/blog?page=${currentPage - 1}`}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Previous
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/blog?page=${page}`}
              className={`px-4 py-2 border rounded ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </Link>
          ))}

          {currentPage < totalPages && (
            <Link
              href={`/blog?page=${currentPage + 1}`}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
```

**Deliverable:** Blog page shows all posts with working pagination

---

#### Exercise 1.8: Create Single Post Page
**Objective:** Build the individual blog post page with full content.

**Create Post Page (`app/(blog)/blog/[slug]/page.tsx`):**
```tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Metadata } from 'next'

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  return post
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: post.coverImage ? [post.coverImage] : [],
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Post Header */}
      <header className="mb-8">
        <div className="flex gap-2 mb-4">
          {post.tags.map((postTag) => (
            <Link
              key={postTag.tag.id}
              href={`/tag/${postTag.tag.slug}`}
              className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200"
            >
              {postTag.tag.name}
            </Link>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
        )}

        {/* Author Info */}
        <div className="flex items-center gap-4 mb-6">
          {post.author.image && (
            <Image
              src={post.author.image}
              alt={post.author.name || 'Author'}
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <div>
            <Link
              href={`/author/${post.author.id}`}
              className="font-semibold hover:text-blue-600"
            >
              {post.author.name}
            </Link>
            <div className="text-sm text-gray-600">
              {post.publishedAt &&
                format(new Date(post.publishedAt), 'MMMM d, yyyy')}
              <span className="mx-2">•</span>
              <span>{post._count.comments} comments</span>
              <span className="mx-2">•</span>
              <span>{post._count.likes} likes</span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1200}
            height={600}
            className="w-full rounded-lg mb-8"
          />
        )}
      </header>

      {/* Post Content */}
      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Author Bio */}
      <div className="border-t border-b py-8 my-12">
        <div className="flex gap-4">
          {post.author.image && (
            <Image
              src={post.author.image}
              alt={post.author.name || 'Author'}
              width={80}
              height={80}
              className="rounded-full"
            />
          )}
          <div>
            <h3 className="text-xl font-bold mb-2">
              Written by {post.author.name}
            </h3>
            {post.author.bio && (
              <p className="text-gray-600">{post.author.bio}</p>
            )}
            <Link
              href={`/author/${post.author.id}`}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              View all posts by {post.author.name} →
            </Link>
          </div>
        </div>
      </div>

      {/* Comments Section Placeholder */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          Comments ({post._count.comments})
        </h2>
        <p className="text-gray-600">
          Comments section coming soon...
        </p>
      </div>
    </article>
  )
}
```

**Add Tailwind Typography Plugin:**
```bash
npm install -D @tailwindcss/typography
```

**Update `tailwind.config.js`:**
```javascript
module.exports = {
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

**Deliverable:** Individual post pages display full content with proper formatting

**Help:**
- The `prose` class from @tailwindcss/typography styles your HTML content
- `dangerouslySetInnerHTML` is used here but you'll replace this with the rich text editor output later
- `notFound()` shows Next.js's 404 page if post doesn't exist

---
