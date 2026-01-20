# Phase 7: Search & Filtering

## 📋 Overview

**Duration:** Week 4-5 (Days 29-32)  
**Prerequisites:** Completed Phase 6

Implement search, filtering, tag pages, and author pages.

---

## Day 29: Search Functionality

### Exercise 7.1: Create Search Component

**Create Search Bar (`components/blog/SearchBar.tsx`):**

```tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  function handleClear() {
    setQuery('')
    router.push('/blog')
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts..."
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </form>
  )
}
```

**Create Search Page (`app/(blog)/search/page.tsx`):**

```tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SearchBar from '@/components/blog/SearchBar'
import { formatDistance } from 'date-fns'

async function searchPosts(query: string) {
  return await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          excerpt: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
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
        take: 3,
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
    take: 50,
  })
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ''
  const posts = query ? await searchPosts(query) : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-6">Search Posts</h1>
        <SearchBar />
      </div>

      {query && (
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600 mb-6">
            Found {posts.length} {posts.length === 1 ? 'result' : 'results'} for "{query}"
          </p>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No posts found</p>
              <Link href="/blog" className="text-blue-600 hover:underline">
                Browse all posts
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex gap-2 mb-3">
                    {post.tags.map((postTag) => (
                      <span
                        key={postTag.tag.id}
                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                      >
                        {postTag.tag.name}
                      </span>
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

                  {post.excerpt && (
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{post.author.name}</span>
                    <span>•</span>
                    <span>
                      {post.publishedAt &&
                        formatDistance(new Date(post.publishedAt), new Date(), {
                          addSuffix: true,
                        })}
                    </span>
                    <span>•</span>
                    <span>{post._count.likes} likes</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## Day 30: Tag Pages

### Exercise 7.2: Create Tag Page

**Create Tag Page (`app/(blog)/tag/[slug]/page.tsx`):**

```tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistance } from 'date-fns'

async function getTagWithPosts(slug: string) {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        where: {
          post: {
            published: true,
          },
        },
        include: {
          post: {
            include: {
              author: {
                select: {
                  name: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  comments: true,
                  likes: true,
                },
              },
            },
          },
        },
        orderBy: {
          post: {
            publishedAt: 'desc',
          },
        },
      },
    },
  })

  if (!tag) {
    notFound()
  }

  return tag
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const tag = await prisma.tag.findUnique({
    where: { slug: params.slug },
  })

  return {
    title: `${tag?.name} | Blog`,
    description: `Posts tagged with ${tag?.name}`,
  }
}

export default async function TagPage({
  params,
}: {
  params: { slug: string }
}) {
  const tag = await getTagWithPosts(params.slug)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">#{tag.name}</h1>
        <p className="text-gray-600">
          {tag.posts.length} {tag.posts.length === 1 ? 'post' : 'posts'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tag.posts.map(({ post }) => (
          <article
            key={post.id}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-blue-600"
                >
                  {post.title}
                </Link>
              </h3>

              {post.excerpt && (
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              )}

              <div className="text-sm text-gray-600">
                <span>{post.author.name}</span>
                <span className="mx-2">•</span>
                <span>
                  {post.publishedAt &&
                    formatDistance(new Date(post.publishedAt), new Date(), {
                      addSuffix: true,
                    })}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
```

---

## Day 31: Author Pages

### Exercise 7.3: Create Author Profile Page

**Create Author Page (`app/(blog)/author/[id]/page.tsx`):**

```tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

async function getAuthorWithPosts(authorId: string) {
  const author = await prisma.user.findUnique({
    where: { id: authorId },
    include: {
      posts: {
        where: {
          published: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
            take: 3,
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      },
    },
  })

  if (!author) {
    notFound()
  }

  return author
}

export default async function AuthorPage({
  params,
}: {
  params: { id: string }
}) {
  const author = await getAuthorWithPosts(params.id)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Author Header */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        {author.image && (
          <Image
            src={author.image}
            alt={author.name || 'Author'}
            width={120}
            height={120}
            className="rounded-full mx-auto mb-4"
          />
        )}
        <h1 className="text-4xl font-bold mb-2">{author.name}</h1>
        {author.bio && (
          <p className="text-gray-600 max-w-2xl mx-auto">{author.bio}</p>
        )}
        <p className="text-gray-500 mt-4">
          {author.posts.length} {author.posts.length === 1 ? 'post' : 'posts'} published
        </p>
      </div>

      {/* Author's Posts */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Published Posts</h2>
        <div className="space-y-6">
          {author.posts.map((post) => (
            <article
              key={post.id}
              className="border-b pb-6 last:border-b-0"
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

              <h3 className="text-2xl font-bold mb-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-blue-600"
                >
                  {post.title}
                </Link>
              </h3>

              {post.excerpt && (
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{post._count.comments} comments</span>
                <span>•</span>
                <span>{post._count.likes} likes</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## Day 32: Filter & Sort

### Exercise 7.4: Add Filters to Blog Page

**Update Blog Page with Filters:**

```tsx
// Add to app/(blog)/blog/page.tsx

interface BlogPageProps {
  searchParams: {
    page?: string
    sort?: string
    tag?: string
  }
}

async function getPosts(page: number, sort: string, tag?: string) {
  const skip = (page - 1) * POSTS_PER_PAGE

  const where: any = { published: true }
  
  if (tag) {
    where.tags = {
      some: {
        tag: {
          slug: tag,
        },
      },
    }
  }

  let orderBy: any = { publishedAt: 'desc' }
  
  if (sort === 'popular') {
    orderBy = { likes: { _count: 'desc' } }
  } else if (sort === 'oldest') {
    orderBy = { publishedAt: 'asc' }
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { name: true, image: true } },
        tags: { include: { tag: true }, take: 3 },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy,
      skip,
      take: POSTS_PER_PAGE,
    }),
    prisma.post.count({ where }),
  ])

  return { posts, total, totalPages: Math.ceil(total / POSTS_PER_PAGE) }
}

// Add filter UI
<div className="flex gap-4 mb-6">
  <select
    value={sort}
    onChange={(e) => router.push(`/blog?sort=${e.target.value}`)}
    className="px-4 py-2 border rounded-lg"
  >
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
    <option value="popular">Most Popular</option>
  </select>
</div>
```

---

## 📝 Phase 7 Checklist

- [ ] Search bar works on all pages
- [ ] Search results display correctly
- [ ] Tag pages show related posts
- [ ] Author pages show user's posts
- [ ] Sort options work
- [ ] Filter by tag works
- [ ] All pages have proper SEO metadata

---

## 🚀 Next Steps

Move to **Phase 8: SEO & Performance** for optimization and search engine improvements.