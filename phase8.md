# Phase 8: SEO & Performance Optimization

## 📋 Overview

**Duration:** Week 5-6 (Days 33-36)  
**Prerequisites:** Completed Phase 7

Optimize your blog for search engines and improve performance.

---

## Day 33: Dynamic Metadata & OG Images

### Exercise 8.1: Add Comprehensive Metadata

**Create Metadata Utility (`lib/metadata.ts`):**

```typescript
import type { Metadata } from 'next'

export function generatePostMetadata(post: {
  title: string
  excerpt: string | null
  coverImage: string | null
  slug: string
  author: { name: string | null }
  publishedAt: Date | null
}): Metadata {
  const title = post.title
  const description = post.excerpt || `Read ${post.title} by ${post.author.name}`
  const url = `${process.env.NEXT_PUBLIC_URL}/blog/${post.slug}`
  const image = post.coverImage || `${process.env.NEXT_PUBLIC_URL}/og-image.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Blog Platform',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name || 'Anonymous'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
```

**Update Post Page with Rich Metadata:**

```tsx
// In app/(blog)/blog/[slug]/page.tsx

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)
  return generatePostMetadata(post)
}
```

---

### Exercise 8.2: Add Structured Data (JSON-LD)

**Create Structured Data Component (`components/seo/StructuredData.tsx`):**

```tsx
export default function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

**Add to Post Page:**

```tsx
// In app/(blog)/blog/[slug]/page.tsx

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.excerpt,
  image: post.coverImage,
  author: {
    '@type': 'Person',
    name: post.author.name,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Blog Platform',
    logo: {
      '@type': 'ImageObject',
      url: `${process.env.NEXT_PUBLIC_URL}/logo.png`,
    },
  },
  datePublished: post.publishedAt?.toISOString(),
  dateModified: post.updatedAt.toISOString(),
}

// In JSX
<StructuredData data={structuredData} />
```

---

## Day 34: Sitemap & RSS Feed

### Exercise 8.3: Generate Dynamic Sitemap

**Create Sitemap (`app/sitemap.ts`):**

```typescript
import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

  // Get all published posts
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Get all tags
  const tags = await prisma.tag.findMany({
    select: {
      slug: true,
    },
  })

  // Get all authors with posts
  const authors = await prisma.user.findMany({
    where: {
      posts: {
        some: {
          published: true,
        },
      },
    },
    select: {
      id: true,
    },
  })

  // Static pages
  const routes = ['', '/blog', '/about'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Blog posts
  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Tag pages
  const tagUrls = tags.map((tag) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  // Author pages
  const authorUrls = authors.map((author) => ({
    url: `${baseUrl}/author/${author.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...routes, ...postUrls, ...tagUrls, ...authorUrls]
}
```

---

### Exercise 8.4: Create RSS Feed

**Create RSS Route (`app/feed.xml/route.ts`):**

```typescript
import { prisma } from '@/lib/prisma'

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    take: 50,
    orderBy: { publishedAt: 'desc' },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog Platform</title>
    <link>${baseUrl}</link>
    <description>A modern blogging platform</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <description>${escapeXml(post.excerpt || '')}</description>
      <pubDate>${post.publishedAt?.toUTCString()}</pubDate>
      <author>${escapeXml(post.author.name || 'Anonymous')}</author>
    </item>
    `
      )
      .join('')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case "'":
        return '&apos;'
      case '"':
        return '&quot;'
      default:
        return c
    }
  })
}
```

---

## Day 35: Performance Optimization

### Exercise 8.5: Image Optimization

**Already using `next/image` - ensure proper configuration:**

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-image-domain.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = nextConfig
```

---

### Exercise 8.6: Database Query Optimization

**Add Database Indexes:**

```prisma
// In schema.prisma

model Post {
  // ... fields
  
  @@index([slug])
  @@index([authorId])
  @@index([published])
  @@index([publishedAt])
  @@index([slug, published])
}

model Comment {
  // ... fields
  
  @@index([postId])
  @@index([authorId])
  @@index([parentId])
}
```

**Run migration:**
```bash
npx prisma migrate dev --name add_indexes
```

---

### Exercise 8.7: Add Loading States

**Create Loading Components:**

```tsx
// app/(blog)/blog/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b pb-8">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-3 bg-gray-200 rounded w-full mb-2" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>
        ))}
      </div>
    </div>
  )
}

// app/(blog)/blog/[slug]/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
        <div className="h-64 bg-gray-200 rounded mb-8" />
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    </div>
  )
}
```

---

## Day 36: Caching & Revalidation

### Exercise 8.8: Implement ISR

**Update Post Pages with Revalidation:**

```tsx
// In app/(blog)/blog/page.tsx
export const revalidate = 60 // Revalidate every 60 seconds

// In app/(blog)/blog/[slug]/page.tsx
export const revalidate = 3600 // Revalidate every hour
```

---

### Exercise 8.9: On-Demand Revalidation

**Create Revalidation API (`app/api/revalidate/route.ts`):**

```typescript
import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(req: Request) {
  try {
    const { path, tag, secret } = await req.json()

    // Verify secret to prevent unauthorized revalidation
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    if (path) {
      revalidatePath(path)
    }

    if (tag) {
      revalidateTag(tag)
    }

    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    )
  }
}
```

**Add to `.env`:**
```env
REVALIDATION_SECRET=your-secret-key-here
```

**Trigger revalidation after post publish:**

```typescript
// In app/api/posts/route.ts - after creating/updating post
await fetch(`${process.env.NEXT_PUBLIC_URL}/api/revalidate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: `/blog/${post.slug}`,
    secret: process.env.REVALIDATION_SECRET,
  }),
})
```

---

## 📝 Phase 8 Checklist

- [ ] All pages have proper metadata
- [ ] Open Graph tags working
- [ ] Twitter Cards display correctly
- [ ] Structured data added to posts
- [ ] Sitemap generates dynamically
- [ ] RSS feed available
- [ ] Images optimized with next/image
- [ ] Database indexes added
- [ ] Loading states implemented
- [ ] ISR configured properly
- [ ] On-demand revalidation works

---

## 🎯 Performance Checklist

Run Lighthouse audit and aim for:
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 95+
- [ ] SEO: 100

---

## 💡 Pro Tips

1. **Use Cloudflare/CDN**: For production, serve static assets via CDN
2. **Image CDN**: Consider Cloudinary or imgix for image optimization
3. **Database Connection Pooling**: Use Prisma Accelerate for better performance
4. **Monitor Core Web Vitals**: Use Vercel Analytics or similar tools
5. **Compress Assets**: Enable Brotli compression

---

## 🚀 Next Steps

Move to **Phase 9: Testing & Deployment** for final testing and production deployment.